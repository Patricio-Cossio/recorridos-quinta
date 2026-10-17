from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

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

app.include_router(api_router)

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
