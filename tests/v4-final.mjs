// Final QA: real browser engines in CI; never sends WhatsApp messages or analytics.
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { chromium, webkit } from 'playwright';

const dir = 'artifacts/final';
mkdirSync(dir, { recursive: true });
const origin = process.env.SITE_URL || 'http://127.0.0.1:4173';
const key = 'cintia_cookie_consent_v1';
const results = [];
const browsers = {};
const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
async function check(name, fn, page) {
  try { const detail = await fn(); results.push({ name, status: 'PASS', detail }); console.log('PASS', name); }
  catch (error) {
    results.push({ name, status: 'FAIL', error: error.stack }); console.error('FAIL', name, error.message);
    if (page) await page.screenshot({ path: `${dir}/${name.replace(/[^a-z0-9-]/gi,'-')}-FAIL.png`, fullPage: true }).catch(()=>{});
  }
}
async function instrument(context) {
  await context.route('https://wa.me/**', route => route.abort());
  await context.addInitScript(() => { window.__opened=[]; window.open=url=>{window.__opened.push(url); return null;}; });
}
try {
for (const [engine, type] of [['webkit',webkit],['chromium',chromium]]) {
  const browser = await type.launch({ headless:true, ...(engine==='chromium'?{executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']}: {}) });
  browsers[engine] = browser.version();
  for (const [width,height] of [[1440,900],[390,844],[375,812],[320,740],[844,390],[768,1024]]) {
    const name=`${engine}-${width}x${height}`;
    const context=await browser.newContext({viewport:{width,height},hasTouch:width<=844,isMobile:width<=844});
    context.setDefaultTimeout(8000);
    await instrument(context);
    const page=await context.newPage(); const errors=[],badResponses=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)badResponses.push([r.status(),r.url()]);});
    await page.goto(origin,{waitUntil:'networkidle'});
    await page.locator('#cookieReject').click();
    await check(name+'-render',async()=>{
      assert.match(await page.title(),/Cíntia Almeida Gomes/); assert.equal(new URL(page.url()).origin,origin);
      assert.ok((await page.locator('main').innerText()).length>3000); assert.equal(await page.locator('h1').count(),1);
      const detail=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,images:[...document.images].map(i=>({src:i.getAttribute('src'),alt:i.hasAttribute('alt'),loaded:i.complete&&i.naturalWidth>0})),fonts:document.fonts.status,headings:[...document.querySelectorAll('h1,h2,h3')].map(h=>({level:h.tagName,text:h.textContent.trim()})),brokenAnchors:[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(h=>!document.getElementById(h.slice(1)))}));
      assert.ok(detail.scrollWidth<=width+2); assert.ok(detail.images.every(i=>i.loaded&&i.alt)); assert.deepEqual(detail.brokenAnchors,[]);
      assert.deepEqual(errors,[]); assert.deepEqual(badResponses,[]);
      await page.screenshot({path:`${dir}/${name}.png`,fullPage:true,animations:'disabled'}); return detail;
    },page);
    await check(name+'-contact-menu-disclosures',async()=>{
      if(width<=1000){await page.locator('#toggle').click(); assert.equal(await page.locator('#toggle').getAttribute('aria-expanded'),'true'); await page.keyboard.press('Escape'); assert.equal(await page.locator('#toggle').getAttribute('aria-expanded'),'false'); assert.equal(await page.locator('#toggle').evaluate(e=>e===document.activeElement),true); await page.locator('#toggle').click(); await page.locator('#nav a[href="#sobre"]').click(); assert.equal(await page.locator('#toggle').getAttribute('aria-expanded'),'false'); assert.equal(await page.locator('#sobre').evaluate(e=>e===document.activeElement),true);}
      for(const selector of ['#areas details:nth-child(2) summary','#faq details:first-child summary']){const s=page.locator(selector);await s.focus();await page.keyboard.press('Enter');assert.equal(await s.evaluate(e=>e.parentElement.open),true);await page.keyboard.press('Space');assert.equal(await s.evaluate(e=>e.parentElement.open),false);}
      const submit=page.locator('#contactForm button[type="submit"]'); await submit.click(); assert.equal((await page.evaluate(()=>window.__opened)).length,0); assert.equal(await page.locator('#nome').evaluate(e=>e.validity.valueMissing),true);
      await page.locator('#nome').fill('Cliente QA & família');await page.locator('#telefone').fill('(19) 99999-0000');await page.locator('#area').selectOption({label:'Direito de Família'});await page.locator('#mensagem').fill('Teste fictício: ação, guarda & contrato? Não enviar.');
      assert.equal(await page.locator('.float').evaluate(e=>getComputedStyle(e).visibility),'hidden'); await submit.click();
      const opened=await page.evaluate(()=>window.__opened);assert.equal(opened.length,1);const url=new URL(opened[0]);assert.equal(url.origin+url.pathname,'https://wa.me/5519971432465'); assert.match(url.searchParams.get('text'),/Cliente QA & família/);assert.match(url.searchParams.get('text'),/ação, guarda & contrato\?/);
      assert.equal(await page.locator('#formFallback a').getAttribute('href'),opened[0]);assert.ok((await page.locator('#status').innerText()).length>0);
      await page.locator('#area').selectOption({label:'Direito Civil / Contratos'});assert.notEqual(await page.locator('#formFallback a').getAttribute('href'),opened[0]);
      await page.locator('#cookieSettings').focus();assert.equal(await page.locator('.float').evaluate(e=>getComputedStyle(e).visibility),'visible');
      return {popupBlocked:true,destination:url.origin+url.pathname,noMessageSent:true};
    },page);
    await check(name+'-focus-targets',async()=>{
      await page.keyboard.press('Tab');
      const measurements=await page.evaluate(()=>{
        function lum(c){const a=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
        const items=['#cookieSettings','#top .brand','.hero-actions .btn.gold'];return items.map(s=>{const e=document.querySelector(s);e.focus();const c=getComputedStyle(e);let p=e.parentElement;while(p&&getComputedStyle(p).backgroundColor==='rgba(0, 0, 0, 0)')p=p.parentElement;
          // Offset outlines sit outside the control. The fixed preferences button
          // uses an espresso halo so its ring remains visible over either canvas.
          const bg=s==='#cookieSettings'?c.backgroundColor:getComputedStyle(p||document.body).backgroundColor;const a=lum(c.outlineColor),b=lum(bg);return {selector:s,height:e.getBoundingClientRect().height,outline:c.outlineStyle,color:c.outlineColor,background:bg,halo:c.boxShadow,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
      });
      writeFileSync(`${dir}/${name}-focus.json`,JSON.stringify(measurements,null,2));
      assert.ok(measurements[0].height>=44,'Cookie preferences target below 44px');
      for(const m of measurements){assert.equal(m.outline,'solid');assert.ok(m.ratio>=3,`${m.selector}: focus contrast ${m.ratio.toFixed(2)} < 3`);} return measurements;
    },page);
    if(width===390 || width===1440)await check(name+'-axe',async()=>{
      await page.addScriptTag({content:axe});const report=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
      writeFileSync(`${dir}/${name}-axe.json`,JSON.stringify(report,null,2));assert.deepEqual(report.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[]);return {passes:report.passes.length,incomplete:report.incomplete.length};
    },page);
    if(width===390) {
      await check(name+'-video',async()=>{
        await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(1800);
        const media=await page.locator('#signatureVideo').evaluate(v=>({paused:v.paused,readyState:v.readyState,time:v.currentTime,muted:v.muted,inline:v.playsInline,opacity:getComputedStyle(v).opacity,poster:getComputedStyle(v.parentElement).backgroundImage}));
        assert.ok(media.muted&&media.inline);assert.ok(media.time>0||media.poster.includes('cintia-logo-hero-poster.jpg'));await page.screenshot({path:`${dir}/${engine}-video-or-poster.png`});return media;
      },page);
    }
    await context.close();
  }
  for(const mode of ['no-js','reduced-motion','autoplay-blocked','media-error','storage-denied']){
    const context=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:mode!=='no-js',reducedMotion:mode==='reduced-motion'?'reduce':'no-preference'});
    if(mode==='autoplay-blocked')await context.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('QA autoplay denied','NotAllowedError'));};});
    if(mode==='media-error')await context.route('**/*.mp4',r=>r.abort());
    if(mode==='storage-denied')await context.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new DOMException('QA storage unavailable','SecurityError');};Storage.prototype.setItem=()=>{throw new DOMException('QA storage unavailable','SecurityError');};});
    const page=await context.newPage();const requests=[];page.on('request',r=>requests.push(r.url()));
    await page.goto(origin,{waitUntil:'networkidle'});
    await check(engine+'-'+mode,async()=>{
      assert.ok(await page.locator('h1').isVisible());assert.ok(await page.locator('#formFallback a').isVisible());
      if(mode==='no-js'){assert.ok(await page.locator('#nav a[href="#contato"]').isVisible());assert.equal(await page.locator('#contactFields').isVisible(),false);}
      else if(mode==='storage-denied'){await page.locator('#cookieReject').click();assert.equal(await page.locator('#contactFields').isEnabled(),true);}
      else {assert.equal(await page.locator('#signatureVideo').evaluate(e=>getComputedStyle(e).opacity),'0');assert.match(await page.locator('.hero-signature').evaluate(e=>getComputedStyle(e).backgroundImage),/poster/);}
      if(mode==='no-js'||mode==='reduced-motion')assert.equal(requests.some(u=>u.endsWith('.mp4')),false);
      await page.screenshot({path:`${dir}/${engine}-${mode}.png`,fullPage:true});return {optionalTagsRequested:requests.filter(u=>/googletagmanager|google-analytics/.test(u))};
    },page);await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:844}});let gtm=0,optional=0;
  context.setDefaultTimeout(8000);
  // A deterministic stand-in validates tag lifetime without firing real client analytics.
  await context.route('https://www.googletagmanager.com/gtm.js*',r=>{gtm++;return r.fulfill({contentType:'application/javascript',body:'window.__qaTagTimer=setInterval(()=>fetch("/__qa_optional__"),100);'});});
  await context.route('**/__qa_optional__',r=>{optional++;return r.fulfill({body:'ok'});});
  const page=await context.newPage();await page.goto(origin,{waitUntil:'networkidle'});
  await check(engine+'-privacy-first-reject',async()=>{
    assert.equal(gtm,0);await page.locator('#cookieReject').click();await page.reload({waitUntil:'networkidle'});assert.equal(gtm,0);assert.equal(await page.locator('#cookieBanner').isVisible(),false);assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),'rejected');return {gtmRequests:gtm};
  },page);
  await check(engine+'-privacy-preferences-keyboard',async()=>{
    await page.locator('#cookieSettings').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#cookieBanner').isVisible(),true);assert.equal(await page.locator('#cookieReject').evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Enter');assert.equal(await page.locator('#cookieSettings').evaluate(e=>e===document.activeElement),true);
  },page);
  await check(engine+'-privacy-accept-revoke',async()=>{
    await page.locator('#cookieSettings').click();await page.locator('#cookieAccept').click();await page.waitForTimeout(400);assert.equal(gtm,1);assert.ok(optional>0);assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),'accepted');
    await page.reload({waitUntil:'domcontentloaded'});await page.waitForTimeout(400);assert.equal(gtm,2);assert.equal(await page.locator('#cookieBanner').isVisible(),false);
    await page.locator('#cookieSettings').click();await page.locator('#cookieReject').click();await page.waitForTimeout(900);const count=optional;await page.waitForTimeout(500);assert.equal(optional,count,'Optional tag continues executing after refusal');assert.equal(await page.locator('script[data-ot-gtm]').count(),0);assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),'rejected');return {gtmRequests:gtm,optionalRequestsBeforeRevocation:count};
  },page);await context.close();
  const c404=await browser.newContext();const p404=await c404.newPage();await p404.goto(origin+'/404.html');
  await check(engine+'-404-return-home',async()=>{await p404.locator('a.btn').click();assert.equal(new URL(p404.url()).pathname,'/');assert.ok(await p404.locator('#hero').isVisible());},p404);await c404.close();
  await browser.close();
}
} catch(error) {results.push({name:'environment',status:'BLOCKED',error:error.stack});console.error(error);}
writeFileSync(`${dir}/qa-report.json`,JSON.stringify({checkedAt:new Date().toISOString(),commit:process.env.QA_COMMIT,origin,browsers,physicalDevices:'NOT AVAILABLE — required release gate',browserPlugin:'Browser plugin not available; executed Playwright in GitHub Actions (local launch blocked)',results},null,2));
console.log(`FINAL QA: ${results.filter(r=>r.status==='PASS').length} PASS; ${results.filter(r=>r.status!=='PASS').length} FAIL/BLOCKED`);
if(results.some(r=>r.status!=='PASS'))process.exitCode=1;
