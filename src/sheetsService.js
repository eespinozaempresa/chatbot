const { google } = require('googleapis');
const NodeCache = require('node-cache');

// Caché de 10 minutos para no llamar Sheets en cada request
const cache = new NodeCache({ stdTTL: 600 });

// ── Autenticación con Google ────────────────────────────────
function getAuth() {
  // Opción A: Service Account JSON en variable de entorno (recomendado en Render)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  }

  // Opción B: Archivo de credenciales local (desarrollo)
  return new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_KEY_FILE || 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

// ── Leer datos crudos del Sheet ─────────────────────────────
async function fetchSheetData() {
  const cached = cache.get('allData');
  if (cached) return cached;

  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = process.env.SPREADSHEET_ID;
  const range = process.env.SHEET_RANGE || 'Cursos!A:J'; // ajusta según tu hoja

  const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = response.data.values || [];

  if (rows.length < 2) return [];

  // La primera fila son encabezados (elimina acentos y normaliza espacios → _)
  const headers = rows[0].map(h =>
    h.trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/ /g, '_')
  );
  const data = rows.slice(1).map((row, idx) => {
    const obj = { id: String(idx + 1) };
    headers.forEach((h, i) => { obj[h] = (row[i] || '').trim(); });
    return obj;
  });

  cache.set('allData', data);
  return data;
}

// ── Normalizar texto para comparar ─────────────────────────
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ── Obtener lista de categorías únicas ─────────────────────
async function getCategorias() {
  const data = await fetchSheetData();
  const set = new Set();

  // Columna esperada: "categoria"
  data.forEach(row => {
    if (row.categoria) set.add(row.categoria);
  });

  return Array.from(set).sort();
}

// ── Obtener cursos de una categoría ────────────────────────
async function getCursosByCategoria(categoria) {
  const data = await fetchSheetData();
  return data
    .filter(row => normalize(row.categoria) === normalize(categoria))
    .map(row => ({ id: row.id, nombre: row.curso || row.nombre || 'Sin nombre' }));
}

// ── Obtener detalle completo de un curso ────────────────────
async function getCursoById(id) {
  const data = await fetchSheetData();
  const row = data.find(r => r.id === id);
  if (!row) return null;

  return {
    id: row.id,
    categoria:   row.categoria   || '',
    nombre:      row.curso       || row.nombre       || '',
    dia:         row.dia         || '',
    hora:        row.hora        || '',
    turno:       row.turno       || `${row.dia || ''} ${row.hora || ''}`.trim(),
    profesor:    row.profesor     || '',
    asistente:   row.asistente   || '',
    whatsapp:    row.whatsapp    || row.enlace_whatsapp || '',
    meet:        row.meet        || row.enlace_meet     || '',
    requisito:   row.requisito   || '',
  };
}

// ── Limpiar caché manualmente ───────────────────────────────
async function clearCache() {
  cache.flushAll();
}

module.exports = { getCategorias, getCursosByCategoria, getCursoById, clearCache };
