# PRD — Quinta Matucana: Guía de Museos del Parque Quinta Normal

## Problem statement original
"creame un sitio web interactivo con mucho color de los museos de la quinta normal incluyendo el museo ferroviario de santiago, con mapas interactivos, seleccion de recorridos y formulario de evaluacion de recorrido"

## Respuestas de descubrimiento
- Objetivo: informar sobre museos/exposiciones, planificar recorridos, educar
- Público: familias, profesores/escolares, turistas, investigadores/entusiastas
- Museos: todos los principales del parque (9 incluidos)
- Mapa: mapa del parque con pines clicables por museo
- Evaluación: estrellas + comentario, guardada y mostrada como testimonios públicos
- Extra: logotipo propio (SVG diseñado: arco de pabellón + rieles)

## Arquitectura
- Backend: FastAPI + MongoDB (motor), `/app/backend/server.py`
  - GET /api/museums, GET /api/routes (seed automático al arranque)
  - POST /api/evaluations, GET /api/evaluations, GET /api/evaluations/stats
- Frontend: React (CRA/craco) + Tailwind + react-leaflet v5 + leaflet (OSM)
  - Componentes en /app/frontend/src/components/
  - Sin React.StrictMode (conflicto con Leaflet "Map container is already initialized")
- Diseño: dirección aprobada "Quinta Matucana" (dir-2, editorial patrimonial, navy #14213D + azul #0077B6 + naranjo #F77F00 + rojo #D62828), Playfair Display + Source Serif 4

## Implementado (2026-10-17)
- Hero editorial con imagen arqueada de locomotora, marquee de museos
- Mapa interactivo Leaflet con 9 pines clicables + trazado del circuito seleccionado
- Catálogo de 9 museos con fotos, descripción, horario y acceso
- Selector de 3 circuitos (A Infantil & Trenes, B Ciencia & Patrimonio, C Artes & Memoria) con panel de detalle y botón "ver en mapa"
- Formulario de evaluación con estrellas interactivas, guardado en MongoDB
- Muro de testimonios públicos con promedio de calificación en tiempo real
- Logotipo SVG propio (arco de pabellón + rieles)
- Versión estática de un solo archivo: /app/frontend/public/quinta-matucana.html (localStorage, sin backend)

## Implementado (2026-11-12)
- Carrusel MANUAL de 5 imágenes por tarjeta de museo (flechas + puntos, sin auto-avance)
- Panel de administración en /admin: login JWT (cookie httpOnly), subida de fotos JPG/PNG/WebP máx 8MB, eliminación de imágenes; archivos en /app/backend/uploads servidos vía /api/uploads
- Credenciales admin en /app/memory/test_credentials.md
- Textos del muro actualizados: las evaluaciones se publican de inmediato

## Verificado
- API probada con curl (museos, rutas, POST/GET evaluaciones, stats)
- E2E con Playwright: render, navegación, selección de circuito, envío de evaluación y aparición en el muro

## Backlog
- P0: nada pendiente
- P1: versión en inglés para turistas; datos reales de horarios/entradas por museo
- P2: panel de moderación de testimonios; compartir circuito por WhatsApp; agenda de eventos de Matucana 100
