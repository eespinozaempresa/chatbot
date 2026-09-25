const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const express = require('express');
const cors = require('cors');
const sheetsService = require('./sheetsService');

// El valor real vive en Secret Manager (ver instrucciones de despliegue).
// Al enlazarlo con "secrets" abajo, Functions lo inyecta en
// process.env.GOOGLE_SERVICE_ACCOUNT_JSON en tiempo de ejecución,
// tal como lo hacía el .env — por eso sheetsService.js no cambia.
const googleServiceAccountJson = defineSecret('GOOGLE_SERVICE_ACCOUNT_JSON');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Evitar que el navegador cachee respuestas del API
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  next();
});

// ── Rutas API ──────────────────────────────────────────────
// Nota: se mantiene el prefijo /api porque firebase.json reenvía
// la ruta completa ("/api/**") a esta función, sin recortarla.

app.get('/api/categorias', async (req, res) => {
  try {
    const categorias = await sheetsService.getCategorias();
    res.json({ ok: true, data: categorias });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al obtener categorías' });
  }
});

app.get('/api/cursos/:categoria', async (req, res) => {
  try {
    const cursos = await sheetsService.getCursosByCategoria(req.params.categoria);
    res.json({ ok: true, data: cursos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al obtener cursos' });
  }
});

app.get('/api/curso/:id', async (req, res) => {
  try {
    const curso = await sheetsService.getCursoById(req.params.id);
    if (!curso) return res.status(404).json({ ok: false, error: 'Curso no encontrado' });
    res.json({ ok: true, data: curso });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al obtener el curso' });
  }
});

app.post('/api/refresh', async (req, res) => {
  try {
    await sheetsService.clearCache();
    res.json({ ok: true, message: 'Caché limpiado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al limpiar caché' });
  }
});

// Se exporta el app de Express por si src/server.js lo reutiliza en local
// (evita mantener las rutas duplicadas en dos archivos).
exports.app = app;

// Función HTTP que Firebase Hosting invoca vía el rewrite "/api/**" -> "api"
exports.api = onRequest(
  { region: 'us-central1', memory: '256MiB', secrets: [googleServiceAccountJson] },
  app
);
