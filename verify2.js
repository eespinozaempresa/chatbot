const { chromium } = require('./node_modules/playwright');

const URL = 'https://chatbot-m0m3.onrender.com';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  const jsErrors = [];
  page.on('console', m => { if (m.type() === 'error') jsErrors.push(m.text()); });
  page.on('pageerror', e => jsErrors.push('PAGE ERROR: ' + e.message));

  console.log('Cargando chatbot...');
  await page.goto(URL, { waitUntil: 'networkidle' });
  await sleep(3000);

  const cats = await page.$$eval('.opt', els => els.map(e => e.textContent.trim()));
  console.log('Categorias:', cats);

  await page.click('.opt:has-text("Doctrinales")');
  await sleep(3000);

  const cursos = await page.$$eval('.opt:not(.picked)', els => els.map(e => e.textContent.trim()));
  console.log('Cursos:', cursos.slice(0, 4));

  if (!cursos.length) { console.log('ERROR: no cursos'); await browser.close(); return; }

  const nombre = cursos[0].substring(0, 25);
  await page.click(`.opt:not(.picked):has-text("${nombre}")`);
  await sleep(3000);

  const infoOpts = await page.$$eval('.opt:not(.picked)', els => els.map(e => e.textContent.trim()));
  console.log('Opciones info:', infoOpts);

  await page.click('.opt:not(.picked):has-text("Turno")');
  await sleep(3000);

  const cards = await page.$$eval('.info-card', els => els.map(e => e.innerText.trim()));
  const lastCard = cards[cards.length - 1] || '';
  console.log('\n=== TARJETA TURNO ===');
  console.log(lastCard);

  const hasRealData = /sáb|dom|pm|am|lun|mar|mié|jue|vie/i.test(lastCard);
  const dashCount = (lastCard.match(/—/g) || []).length;
  console.log(`\nDatos reales: ${hasRealData ? 'SI' : 'NO'} | Guiones: ${dashCount}`);

  if (jsErrors.length) console.log('JS ERRORS:', jsErrors);

  await browser.close();
})();
