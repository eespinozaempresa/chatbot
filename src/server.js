// Servidor SOLO para desarrollo local (npm start / npm run dev).
//
// En producción, Firebase Hosting sirve la carpeta "public" y reenvía
// "/api/**" a la Cloud Function "api" (ver functions/index.js y firebase.json).
// Aquí se reutiliza ese mismo app de Express para no duplicar las rutas.
const path = require('path');
const express = require('express');

// El SDK de Functions v2 carga automáticamente functions/.env al desplegar;
// en local hay que cargarlo a mano para que sheetsService.js tenga las
// variables (SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON, etc.).
require('dotenv').config({ path: path.join(__dirname, '../functions/.env') });

const { app } = require('../functions');

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
    }
  },
}));

// Fallback → servir el frontend (igual que el rewrite "**" de firebase.json)
// Se usa app.use() sin ruta (en vez de app.get('*', ...)) porque en Express 5
// el "*" suelto ya no es una ruta valida (hay que nombrarlo, ej. "/*splat").
// app.use() sin ruta evita ese problema y funciona igual en Express 4 y 5.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor local corriendo en http://localhost:${PORT}`);
  console.log('   Usa las mismas rutas /api/* que en producción (definidas en functions/index.js)');
});
