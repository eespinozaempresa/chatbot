require('dotenv').config();
const { google } = require('googleapis');

const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
const auth = new google.auth.GoogleAuth({ credentials: creds, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const sheets = google.sheets({ version: 'v4', auth });

async function main() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'Cursos!A:K',
  });

  const rows = res.data.values || [];
  console.log(`Total filas (incluyendo header): ${rows.length}`);

  console.log('\n=== ENCABEZADOS RAW (fila 1) ===');
  const rawHeaders = rows[0] || [];
  rawHeaders.forEach((h, i) => {
    const col = String.fromCharCode(65 + i);
    const normalized = h.trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/ /g, '_');
    console.log(`  ${col}: raw="${h}"  →  normalizado="${normalized}"`);
  });

  if (rows[1]) {
    console.log('\n=== DATOS FILA 2 ===');
    rawHeaders.forEach((h, i) => {
      console.log(`  [${h.trim()}] = "${rows[1][i] || '(vacío)'}"`);
    });
  }

  // Simulate getCursoById field access
  console.log('\n=== SIMULACIÓN getCursoById(row fila 2) ===');
  const headers = rawHeaders.map(h =>
    h.trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/ /g, '_')
  );
  if (rows[1]) {
    const obj = { id: '1' };
    headers.forEach((h, i) => { obj[h] = (rows[1][i] || '').trim(); });
    console.log('  obj.categoria =', obj.categoria || '(vacío)');
    console.log('  obj.curso     =', obj.curso || '(vacío)');
    console.log('  obj.dia       =', obj.dia || '(vacío)');
    console.log('  obj.hora      =', obj.hora || '(vacío)');
    console.log('  obj.profesor  =', obj.profesor || '(vacío)');
    console.log('  obj.asistente =', obj.asistente || '(vacío)');
    console.log('  obj.whatsapp  =', obj.whatsapp || '(vacío)');
    console.log('  obj.meet      =', obj.meet || '(vacío)');
    console.log('  obj.requisito =', obj.requisito || '(vacío)');
    console.log('\nAll keys in obj:', Object.keys(obj));
  }
}

main().catch(console.error);
