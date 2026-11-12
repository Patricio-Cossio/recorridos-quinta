from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Depends
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ---------------- Models ----------------

class Museum(BaseModel):
    id: str
    slug: str
    name: str
    short_name: str
    initials: str
    category: str
    badge: str
    description: str
    detail: str
    schedule: str
    access: str
    image: str
    images: List[str] = []
    color: str
    lat: float
    lng: float

class TourRoute(BaseModel):
    id: str
    code: str
    name: str
    title: str
    duration: str
    difficulty: str
    description: str
    audience: str
    key_stops: str
    stops: List[str]
    color: str
    panel_bg: str

class EvaluationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    route: str = Field(min_length=1, max_length=120)
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=3, max_length=600)

class Evaluation(EvaluationCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ---------------- Seed data ----------------

MUSEUMS = [
    {
        "id": "m-ferroviario", "slug": "ferroviario", "name": "Museo Ferroviario de Santiago",
        "short_name": "Museo Ferroviario", "initials": "MF", "category": "Patrimonio industrial",
        "badge": "Al Aire Libre",
        "description": "16 locomotoras a vapor históricas y coches de madera entre jardines del parque.",
        "detail": "Dos hectáreas de material rodante que forjó el desarrollo ferroviario del país: la mítica Locomotora Type 80, coches presidenciales y la antigua maestranza.",
        "schedule": "Martes a Domingo", "access": "Acceso por Av. Portales",
        "image": "https://images.pexels.com/photos/32884616/pexels-photo-32884616.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "color": "#D62828", "lat": -33.4362, "lng": -70.6858
    },
    {
        "id": "m-historia-natural", "slug": "historia-natural", "name": "Museo Nacional de Historia Natural",
        "short_name": "Historia Natural", "initials": "HN", "category": "Ciencias naturales",
        "badge": "Fundado 1830",
        "description": "Salas de fósiles, minerales y botánica, con la célebre ballena del hall central.",
        "detail": "Uno de los museos más antiguos de América. Su palacio de 1875 alberga el recorrido biogeográfico de Chile, desde el desierto hasta la Antártica.",
        "schedule": "Martes a Domingo", "access": "Interior del parque, alameda central",
        "image": "https://images.pexels.com/photos/9321620/pexels-photo-9321620.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "color": "#0077B6", "lat": -33.4417, "lng": -70.6812
    },
    {
        "id": "m-mac", "slug": "mac", "name": "Museo de Arte Contemporáneo",
        "short_name": "Arte Contemporáneo", "initials": "MC", "category": "Artes visuales",
        "badge": "Palacio Versailles",
        "description": "Exposiciones de arte chileno y latinoamericano en el histórico Edificio Versailles.",
        "detail": "Dependiente de la Universidad de Chile, el MAC Quinta Normal combina colección patrimonial con muestras temporales de vanguardia.",
        "schedule": "Martes a Domingo", "access": "Interior del parque, acceso Matucana",
        "image": "https://images.pexels.com/photos/6229259/pexels-photo-6229259.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "color": "#F77F00", "lat": -33.4427, "lng": -70.6792
    },
    {
        "id": "m-ciencia", "slug": "ciencia-tecnologia", "name": "Museo de Ciencia y Tecnología",
        "short_name": "Ciencia y Tecnología", "initials": "CT", "category": "Ciencia interactiva",
        "badge": "CORPDICYT",
        "description": "Salas interactivas de física experimental, telecomunicaciones y tecnología.",
        "detail": "El primer museo interactivo de Chile: módulos para tocar, experimentar y comprender principios científicos jugando.",
        "schedule": "Martes a Domingo", "access": "Interior del parque, sector poniente",
        "image": "https://images.unsplash.com/photo-1672271216639-450064f85d3c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwzfHxtdXNlbyUyMGNpZW5jaWElMjB5JTIwdGVjbm9sb2dpYSUyMHNhbnRpYWdvJTIwY2hpbGV8ZW58MHx8fHwxNzkyMjA3ODU3fDA&ixlib=rb-4.1.0&q=85",
        "color": "#2A9D8F", "lat": -33.4436, "lng": -70.6828
    },
    {
        "id": "m-infantil", "slug": "infantil", "name": "Museo Infantil",
        "short_name": "Museo Infantil", "initials": "MI", "category": "Educación y juego",
        "badge": "Ideal para Niños",
        "description": "Exposiciones didácticas pensadas para que los más pequeños aprendan jugando.",
        "detail": "Salas temáticas de ciencia, arte y oficios diseñadas para niños y niñas, con mediadores y talleres durante todo el año.",
        "schedule": "Martes a Domingo", "access": "Interior del parque, junto a la laguna",
        "image": "https://images.pexels.com/photos/36721813/pexels-photo-36721813.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "color": "#F77F00", "lat": -33.4431, "lng": -70.6816
    },
    {
        "id": "m-artequin", "slug": "artequin", "name": "Museo Artequín",
        "short_name": "Pabellón Artequín", "initials": "AQ", "category": "Artes educativas",
        "badge": "Pabellón París 1889",
        "description": "Reproducciones de grandes obras de la pintura universal en el Pabellón París.",
        "detail": "El pabellón que representó a Chile en la Exposición Universal de París de 1889 hoy acoge un museo educativo de arte con vitrales y estructura de hierro.",
        "schedule": "Martes a Domingo", "access": "Interior del parque, frente al MAC",
        "image": "https://images.unsplash.com/photo-1569339501214-16b5a5172af1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwxfHxtdXNlbyUyMGFydGVxdWluJTIwc2FudGlhZ28lMjBjaGlsZSUyMGFyY2hpdGVjdHVyZXxlbnwwfHx8fDE3OTIyMDc4NDl8MA&ixlib=rb-4.1.0&q=85",
        "color": "#D62828", "lat": -33.4419, "lng": -70.6784
    },
    {
        "id": "m-memoria", "slug": "memoria", "name": "Museo de la Memoria y los DD.HH.",
        "short_name": "Museo de la Memoria", "initials": "MM", "category": "Memoria y derechos humanos",
        "badge": "Eje Matucana",
        "description": "Centro de documentación, testimonios y exposiciones de derechos humanos.",
        "detail": "Un espacio de reflexión sobre la historia reciente de Chile, con archivo audiovisual, salas expositivas y una plaza de la memoria.",
        "schedule": "Martes a Domingo", "access": "Matucana 501, frente al Metro Quinta Normal",
        "image": "https://images.pexels.com/photos/36527114/pexels-photo-36527114.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "color": "#14213D", "lat": -33.4399, "lng": -70.6789
    },
    {
        "id": "m-biblioteca", "slug": "biblioteca", "name": "Biblioteca de Santiago",
        "short_name": "Biblioteca de Santiago", "initials": "BS", "category": "Biblioteca pública",
        "badge": "Antigua Maestranza",
        "description": "La mayor biblioteca pública de Chile, instalada en la antigua maestranza San Eugenio.",
        "detail": "Salas de lectura, ludoteca, mediateca y una agenda cultural permanente en un edificio industrial recuperado.",
        "schedule": "Martes a Domingo", "access": "Matucana 151, frente al parque",
        "image": "https://images.pexels.com/photos/7410267/pexels-photo-7410267.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "color": "#0077B6", "lat": -33.4394, "lng": -70.6780
    },
    {
        "id": "m-matucana100", "slug": "matucana-100", "name": "Centro Cultural Matucana 100",
        "short_name": "Matucana 100", "initials": "M100", "category": "Centro cultural",
        "badge": "Artes Escénicas",
        "description": "Teatro, cine, música y exposiciones en los galpones de los antiguos talleres ferroviarios.",
        "detail": "Un centro cultural de referencia con cartelera todo el año: danza, teatro, conciertos y cine al aire libre en verano.",
        "schedule": "Según cartelera", "access": "Matucana 100, sector poniente del parque",
        "image": "https://images.pexels.com/photos/33690580/pexels-photo-33690580.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "color": "#2A9D8F", "lat": -33.4406, "lng": -70.6846
    },
]

ROUTES = [
    {
        "id": "r-a", "code": "Circuito A", "name": "Infantil & Trenes",
        "title": "Ruta de las Máquinas y Juegos",
        "duration": "2 Horas", "difficulty": "Baja",
        "description": "Comienza en el Museo Ferroviario explorando las locomotoras históricas, continúa por el Museo Infantil y finaliza con un paseo junto a la laguna del parque.",
        "audience": "Recomendado para familias con niños pequeños y paseos escolares iniciales.",
        "key_stops": "Ferroviario + Infantil",
        "stops": ["ferroviario", "infantil", "ciencia-tecnologia"],
        "color": "#F77F00", "panel_bg": "#FAF0CA"
    },
    {
        "id": "r-b", "code": "Circuito B", "name": "Ciencia & Patrimonio",
        "title": "Ruta de los Descubrimientos",
        "duration": "3.5 Horas", "difficulty": "Media",
        "description": "Visita al Museo de Historia Natural, experimentos en el Museo de Ciencia y Tecnología y recorrido botánico por los árboles patrimoniales del parque.",
        "audience": "Especial para colegios de enseñanza básica y media.",
        "key_stops": "MNHN + Ciencia",
        "stops": ["historia-natural", "ciencia-tecnologia", "ferroviario"],
        "color": "#0077B6", "panel_bg": "#EBF5FB"
    },
    {
        "id": "r-c", "code": "Circuito C", "name": "Artes & Memoria",
        "title": "Ruta de la Expresión y Sociedad",
        "duration": "4 Horas", "difficulty": "Media",
        "description": "Inicia en el MAC Quinta Normal, visita los vitrales de Artequín y cruza Matucana hacia el Museo de la Memoria y la Biblioteca de Santiago.",
        "audience": "Ideal para turistas, universitarios e investigadores.",
        "key_stops": "MAC + Artequín + Memoria",
        "stops": ["mac", "artequin", "memoria", "biblioteca"],
        "color": "#D62828", "panel_bg": "#FCE8E6"
    },
]

# ---------------- Default gallery images (5 per museum, curated stock) ----------------

_IMG = {
    "ferro-hero": "https://images.pexels.com/photos/15062958/pexels-photo-15062958.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "ferro": "https://images.pexels.com/photos/32884616/pexels-photo-32884616.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "mnhn": "https://images.pexels.com/photos/9321620/pexels-photo-9321620.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "memoria": "https://images.pexels.com/photos/36527114/pexels-photo-36527114.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "trees": "https://images.pexels.com/photos/38313214/pexels-photo-38313214.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "mac": "https://images.pexels.com/photos/6229259/pexels-photo-6229259.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "biblioteca": "https://images.pexels.com/photos/7410267/pexels-photo-7410267.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "matucana": "https://images.pexels.com/photos/33690580/pexels-photo-33690580.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "artequin": "https://images.unsplash.com/photo-1569339501214-16b5a5172af1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwxfHxtdXNlbyUyMGFydGVxdWluJTIwc2FudGlhZ28lMjBjaGlsZSUyMGFyY2hpdGVjdHVyZXxlbnwwfHx8fDE3OTIyMDc4NDl8MA&ixlib=rb-4.1.0&q=85",
    "ciencia": "https://images.unsplash.com/photo-1672271216639-450064f85d3c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwzfHxtdXNlbyUyMGNpZW5jaWElMjB5JTIwdGVjbm9sb2dpYSUyMHNhbnRpYWdvJTIwY2hpbGV8ZW58MHx8fHwxNzkyMjA3ODU3fDA&ixlib=rb-4.1.0&q=85",
    "infantil": "https://images.pexels.com/photos/36721813/pexels-photo-36721813.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
}

DEFAULT_IMAGES = {
    "ferroviario": [_IMG["ferro"], _IMG["ferro-hero"], _IMG["trees"], _IMG["memoria"], _IMG["matucana"]],
    "historia-natural": [_IMG["mnhn"], _IMG["trees"], _IMG["artequin"], _IMG["infantil"], _IMG["ciencia"]],
    "mac": [_IMG["mac"], _IMG["artequin"], _IMG["matucana"], _IMG["memoria"], _IMG["trees"]],
    "ciencia-tecnologia": [_IMG["ciencia"], _IMG["infantil"], _IMG["mnhn"], _IMG["trees"], _IMG["ferro"]],
    "infantil": [_IMG["infantil"], _IMG["ciencia"], _IMG["ferro"], _IMG["trees"], _IMG["mnhn"]],
    "artequin": [_IMG["artequin"], _IMG["mac"], _IMG["trees"], _IMG["memoria"], _IMG["biblioteca"]],
    "memoria": [_IMG["memoria"], _IMG["trees"], _IMG["biblioteca"], _IMG["matucana"], _IMG["mac"]],
    "biblioteca": [_IMG["biblioteca"], _IMG["matucana"], _IMG["trees"], _IMG["memoria"], _IMG["mnhn"]],
    "matucana-100": [_IMG["matucana"], _IMG["memoria"], _IMG["trees"], _IMG["biblioteca"], _IMG["artequin"]],
}

# ---------------- Auth (admin) ----------------

JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=8), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesión expirada")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = await db.users.find_one({"email": payload["email"]})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return {"email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")}

class LoginInput(BaseModel):
    email: str
    password: str

@api_router.post("/auth/login")
async def login(input: LoginInput, request: Request, response: Response):
    email = input.email.lower().strip()
    identifier = f"{request.client.host}:{email}"
    attempts = await db.login_attempts.find_one({"identifier": identifier})
    if attempts and attempts.get("count", 0) >= 5:
        locked_until = attempts.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Cuenta bloqueada temporalmente. Intenta en 15 minutos.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(str(user["_id"]), email)
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True, samesite="none", max_age=28800, path="/")
    return {"email": email, "name": user.get("name", "Admin"), "role": user.get("role", "admin")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Sesión cerrada"}

@api_router.get("/auth/me")
async def auth_me(user=Depends(get_current_user)):
    return user

# ---------------- Admin: gestión de imágenes ----------------

UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}

@api_router.post("/admin/museums/{slug}/images")
async def upload_museum_image(slug: str, file: UploadFile = File(...), user=Depends(get_current_user)):
    museum = await db.museums.find_one({"slug": slug})
    if not museum:
        raise HTTPException(status_code=404, detail="Museo no encontrado")
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Formato no permitido. Usa JPG, PNG o WebP.")
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="La imagen supera los 8 MB.")
    filename = f"{slug}-{uuid.uuid4().hex[:10]}{ALLOWED_TYPES[file.content_type]}"
    (UPLOAD_DIR / filename).write_bytes(data)
    url = f"/api/uploads/{filename}"
    await db.museums.update_one({"slug": slug}, {"$push": {"images": url}})
    updated = await db.museums.find_one({"slug": slug}, {"_id": 0})
    return updated

@api_router.delete("/admin/museums/{slug}/images")
async def delete_museum_image(slug: str, url: str, user=Depends(get_current_user)):
    museum = await db.museums.find_one({"slug": slug})
    if not museum:
        raise HTTPException(status_code=404, detail="Museo no encontrado")
    if url not in museum.get("images", []):
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    if len(museum.get("images", [])) <= 1:
        raise HTTPException(status_code=400, detail="Cada museo debe mantener al menos una imagen.")
    await db.museums.update_one({"slug": slug}, {"$pull": {"images": url}})
    if url.startswith("/api/uploads/"):
        path = UPLOAD_DIR / url.split("/")[-1]
        if path.exists():
            path.unlink()
    updated = await db.museums.find_one({"slug": slug}, {"_id": 0})
    return updated

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Administrador",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

# ---------------- Routes ----------------

@api_router.get("/")
async def root():
    return {"message": "Quinta Matucana API"}

@api_router.get("/museums", response_model=List[Museum])
async def get_museums():
    museums = await db.museums.find({}, {"_id": 0}).to_list(100)
    return museums

@api_router.get("/routes", response_model=List[TourRoute])
async def get_routes():
    routes = await db.routes.find({}, {"_id": 0}).to_list(100)
    return routes

@api_router.post("/evaluations", response_model=Evaluation)
async def create_evaluation(input: EvaluationCreate):
    evaluation = Evaluation(**input.model_dump())
    doc = evaluation.model_dump()
    doc.pop("id", None)
    doc["_id"] = evaluation.id
    await db.evaluations.insert_one(doc)
    return evaluation

@api_router.get("/evaluations", response_model=List[Evaluation])
async def get_evaluations(limit: int = 12):
    cursor = db.evaluations.find({}, {"_id": 0}).sort("created_at", -1).limit(min(limit, 50))
    return await cursor.to_list(50)

@api_router.get("/evaluations/stats")
async def evaluation_stats():
    pipeline = [
        {"$group": {"_id": None, "avg": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    result = await db.evaluations.aggregate(pipeline).to_list(1)
    if not result:
        return {"average": 0, "count": 0}
    return {"average": round(result[0]["avg"], 1), "count": result[0]["count"]}

@app.on_event("startup")
async def seed_data():
    if await db.museums.count_documents({}) == 0:
        await db.museums.insert_many([{**m, "_id": m["id"]} for m in MUSEUMS])
    if await db.routes.count_documents({}) == 0:
        await db.routes.insert_many([{**r, "_id": r["id"]} for r in ROUTES])
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await seed_admin()
    async for m in db.museums.find({"$or": [{"images": {"$exists": False}}, {"images": {"$size": 0}}]}):
        defaults = DEFAULT_IMAGES.get(m["slug"], [m["image"]])
        await db.museums.update_one({"_id": m["_id"]}, {"$set": {"images": defaults}})

app.include_router(api_router)
app.mount("/api/uploads", StaticFiles(directory=str(ROOT_DIR / "uploads")), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
