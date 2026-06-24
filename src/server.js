require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sheetsService = require('./sheetsService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
    }
  }
}));

// ── Rutas API ──────────────────────────────────────────────

// Obtener todas las categorías
app.get('/api/categorias', async (req, res) => {
  try {
    const categorias = await sheetsService.getCategorias();
    res.json({ ok: true, data: categorias });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al obtener categorías' });
  }
});

// Obtener cursos de una categoría
app.get('/api/cursos/:categoria', async (req, res) => {
  try {
    const cursos = await sheetsService.getCursosByCategoria(req.params.categoria);
    res.json({ ok: true, data: cursos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al obtener cursos' });
  }
});

// Obtener detalle de un curso
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

// Forzar refresco del caché
app.post('/api/refresh', async (req, res) => {
  try {
    await sheetsService.clearCache();
    res.json({ ok: true, message: 'Caché limpiado correctamente' });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Error al limpiar caché' });
  }
});

// Fallback → servir el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
