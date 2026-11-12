// Cíntia V4 — browser verification with Playwright Core and Chrome installed by runner.
// Run (after npm install --no-save playwright-core):
// CHROME_BIN=/usr/bin/google-chrome SITE_URL=http://127.0.0.1:4173 node tests/v4-browser.mjs
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const origin = process.env.SITE_URL || 'http://127.0.0.1:4173';
const chrome = process.env.CHROME_BIN || '/usr/bin/google-chrome';
const dir = 'artifacts/v4';
mkdirSync(dir, { recursive: true });
const results = [];
const errors = [];

const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
});

async function testViewport(name, viewport, isMobile = false) {
  const context = await browser.newContext({
    viewport,
    isMobile,
    hasTouch: isMobile,
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference'
  });
  // Prevent navigation to external WhatsApp while inspecting the generated destination.
  await context.addInitScript(() => {
    window.__v4Opened = [];
    window.open = (url) => { window.__v4Opened.push(url); return null; };
  });
  const page = await context.newPage();
  const jsErrors = [];
  const responseErrors = [];
  page.on('pageerror', e => jsErrors.push(e.message));
  page.on('response', response => {
    if (response.status() >= 400 && new URL(response.url()).origin === origin) {
      responseErrors.push(response.status() + ' ' + response.url());
    }
  });
  try {
    const response = await page.goto(origin + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    assert.equal(response.status(), 200, name + ': HTML status');
    await page.waitForTimeout(900);
    const reject = page.locator('#cookieReject');
    if (await reject.isVisible()) await reject.click();
    assert.equal(await page.locator('body.v4').count(), 1, name + ': V4 body class missing');
    assert.equal(await page.locator('h1').count(), 1, name + ': expected one H1');
    assert.equal(await page.locator('#contactFields').isEnabled(), true, name + ': JS should enable form');

    const base = await page.evaluate(() => {
      const images = [...document.querySelectorAll('img')].map(img => ({
        source: img.getAttribute('src'),
        loaded: img.complete && img.naturalWidth > 0,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }));
      return {
        viewportWidth: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        heroHeight: document.querySelector('.hero').getBoundingClientRect().height,
        h1Size: getComputedStyle(document.querySelector('h1')).fontSize,
        cssV4Present: [...document.styleSheets].some(s => s.href && s.href.endsWith('/v4.css')),
        images
      };
    });
    assert.equal(base.cssV4Present, true, name + ': v4.css was not loaded');
    assert.ok(base.scrollWidth <= base.viewportWidth + 2,
      name + ': horizontal overflow ' + base.scrollWidth + ' > ' + base.viewportWidth);
    assert.ok(base.heroHeight > 200, name + ': HERO collapsed');
    assert.ok(base.images.every(im => im.loaded), name + ': image not loaded: ' + JSON.stringify(base.images.filter(im => !im.loaded)));
    assert.deepEqual(responseErrors, [], name + ': first-party resource errors');
    assert.deepEqual(jsErrors, [], name + ': JS runtime errors');

    // Screenshot BEFORE interactions that change scroll position or accordions.
    await page.screenshot({ path: dir + '/' + name + '.png', fullPage: true, animations: 'disabled' });

    const directWA = await page.locator('a.js-wa').evaluateAll(as => as.map(a => a.getAttribute('href')));
    assert.ok(directWA.length >= 4, name + ': missing direct WhatsApp links');
    assert.ok(directWA.every(url => url.startsWith('https://wa.me/5519971432465?text=')),
      name + ': inconsistent WhatsApp destination');

    // Mobile menu: ensure real access by touch/mouse.
    if (viewport.width <= 1000) {
      const menu = page.locator('#toggle');
      assert.equal(await menu.isVisible(), true, name + ': mobile navigation toggle hidden');
      await menu.click();
      assert.equal(await menu.getAttribute('aria-expanded'), 'true', name + ': menu not opening');
      await page.locator('#nav a[href="#sobre"]').click();
      assert.equal(await menu.getAttribute('aria-expanded'), 'false', name + ': menu not closing');
    }

    // Native disclosure should work on all devices.
    const area = page.locator('#areas details').nth(1);
    await area.locator('summary').click();
    assert.equal(await area.getAttribute('open'), '', name + ': legal area disclosure failed');
    const faq = page.locator('#faq details').first();
    await faq.locator('summary').click();
    assert.equal(await faq.getAttribute('open'), '', name + ': FAQ disclosure failed');

    // Form: valid content should compose WhatsApp URL with official number.
    await page.locator('#nome').fill('Cliente QA');
    await page.locator('#telefone').fill('(19) 99999-0000');
    await page.locator('#area').selectOption({ label: 'Direito de Família' });
    await page.locator('#mensagem').fill('Contato de teste: não enviar mensagens.');
    await page.locator('#contactForm button[type="submit"]').click();
    const opened = await page.evaluate(() => window.__v4Opened);
    assert.equal(opened.length, 1, name + ': WhatsApp opener not called');
    assert.ok(opened[0].startsWith('https://wa.me/5519971432465?text='), name + ': form uses wrong destination');
    assert.ok(decodeURIComponent(opened[0]).includes('Cliente QA'), name + ': composed message missing name');
    assert.ok((await page.locator('#formFallback a').getAttribute('href')).startsWith('https://wa.me/5519971432465?text='),
      name + ': fallback URL incorrect');

    results.push({ name, status: 'PASS', ...base });
    console.log('PASS ' + name + ' (' + viewport.width + 'x' + viewport.height + ')');
  } catch (e) {
    const error = name + ': ' + e.stack;
    errors.push(error);
    results.push({ name, status: 'FAIL', error: e.message });
    console.error('FAIL ' + error);
    try { await page.screenshot({ path: dir + '/' + name + '-error.png', fullPage: true }); } catch {}
  } finally {
    await context.close();
  }
}

try {
  for (const [name, w, h, touch] of [
    ['desktop-1440', 1440, 900, false],
    ['notebook-1366', 1366, 768, false],
    ['compact-1024', 1024, 768, false],
    ['tablet-768', 768, 1024, true],
    ['android-390', 390, 844, true],
    ['iphone-width-375', 375, 812, true],
    ['narrow-320', 320, 740, true]
  ]) await testViewport(name, {width:w, height:h}, touch);

  const context = await browser.newContext({ viewport: { width:390, height:844 }, javaScriptEnabled:false });
  const page = await context.newPage();
  await page.goto(origin, { waitUntil:'domcontentloaded' });
  assert.ok(await page.locator('h1').isVisible(), 'No-JS headline hidden');
  assert.ok(await page.locator('.form-fallback a.js-wa').isVisible(), 'No-JS WhatsApp fallback hidden');
  assert.ok(await page.locator('nav a[href="#contato"]').isVisible(), 'No-JS navigation hidden');
  results.push({name:'no-javascript',status:'PASS'});
  await context.close();

  const motion = await browser.newContext({ viewport:{width:390,height:844}, reducedMotion:'reduce' });
  const p = await motion.newPage();
  await p.goto(origin, { waitUntil:'domcontentloaded' });
  assert.ok(await p.locator('h1').isVisible(), 'Reduced motion headline hidden');
  const opacity = await p.locator('.hero-video').evaluate(el => getComputedStyle(el).opacity);
  assert.equal(opacity, '0', 'Reduced motion video must not play visibly');
  results.push({name:'reduced-motion',status:'PASS'});
  await motion.close();
} catch (e) {
  errors.push('SPECIAL: ' + e.stack);
  console.error('FAIL ' + e.stack);
} finally {
  writeFileSync(dir + '/qa-report.json', JSON.stringify({origin, checkedAt:new Date().toISOString(), results, errors},null,2));
  await browser.close();
}
if(errors.length) process.exitCode = 1;
else console.log('V4 browser QA: PASS ('+results.length+' scenarios)');
