// V5 integration, rendering and genuine motion evidence. All external contact is intercepted.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,renameSync} from 'node:fs';
import {chromium,webkit} from 'playwright';
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const dir='artifacts/v5';mkdirSync(dir,{recursive:true});
const sizes=[[1920,1080],[1366,768],[1280,720],[1024,768],[768,1024],[390,844],[375,812],[320,740],[844,390]];
const urls={v4:'http://127.0.0.1:4174',v5:'http://127.0.0.1:4173'};
const results=[];const launched=[];
async function check(name,fn,page){try{const detail=await fn();results.push({name,status:'PASS',detail});console.log('PASS',name);}catch(e){results.push({name,status:'FAIL',error:e.stack});console.error('FAIL',name,e.message);await page?.screenshot({path:`${dir}/${name}-FAIL.png`,timeout:5000}).catch(()=>{});}finally{writeFileSync(`${dir}/partial-report.json`,JSON.stringify({head:process.env.QA_COMMIT,results},null,2));}}
async function instrument(context){
 await context.route('https://wa.me/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>QA intercepted contact</title><p>No message sent.</p>'}));
 await context.addInitScript(()=>{
  window.__opened=[];window.open=url=>{window.__opened.push(url);return null;};
  window.__motion=[];window.__media={};window.__layout=[];
  if('PerformanceObserver' in window)try{new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput&&window.__layout.length<20)window.__layout.push({value:e.value,time:e.startTime,sources:e.sources.map(s=>({node:s.node?.tagName+'#'+s.node?.id+'.'+s.node?.className,previous:{x:s.previousRect.x,y:s.previousRect.y,width:s.previousRect.width,height:s.previousRect.height},current:{x:s.currentRect.x,y:s.currentRect.y,width:s.currentRect.width,height:s.currentRect.height}}))});}).observe({type:'layout-shift',buffered:true});}catch{}
  document.addEventListener('animationstart',e=>{if(window.__motion.length<80)window.__motion.push({name:e.animationName,target:e.target.className,pseudo:e.pseudoElement,time:performance.now()});},true);
  for(const name of ['loadstart','playing','pause','error'])document.addEventListener(name,e=>{if(e.target.id==='signatureVideo')window.__media[name]=(window.__media[name]||0)+1;},true);
 });
}
async function measurements(page){return page.evaluate(()=>{
 const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
 const video=document.querySelector('#signatureVideo'),photo=document.querySelector('.portrait');
 return {url:location.href,title:document.title,viewport:{width:innerWidth,height:innerHeight},scrollWidth:document.documentElement.scrollWidth,boxes:Object.fromEntries(Object.entries({header:'.top',hero:'.hero',title:'.hero h1',statement:'.hero-statement',lead:'.hero .lead',primary:'.hero-actions .gold',photo:'.portrait',caption:'.portrait-caption',card:'.hero-card',signature:'.hero-signature'}).map(([k,s])=>[k,rect(s)])),photo:{src:photo.currentSrc,width:photo.naturalWidth,height:photo.naturalHeight,fit:getComputedStyle(photo).objectFit},fonts:{status:document.fonts.status,faces:[...document.fonts].map(f=>({family:f.family,weight:f.weight,status:f.status}))},motion:window.__motion,layoutShifts:window.__layout,video:{time:video.currentTime,ready:video.readyState,paused:video.paused,muted:video.muted,inline:video.playsInline,events:window.__media},nativeTimeline:CSS.supports('animation-timeline','view()'),heap:performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize}:null};});}
try{
 for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await type.launch({headless:true,...(engine==='chromium'?{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']}: {})});launched.push(browser);
  for(const [width,height] of sizes)for(const [version,url] of Object.entries(urls)){
   const name=`${engine}-${width}x${height}-${version}`;
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,hasTouch:width<=844,isMobile:width<=844});context.setDefaultTimeout(8000);await instrument(context);
   const page=await context.newPage(),errors=[],consoleMessages=[],badResponses=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))consoleMessages.push(m.text());});page.on('response',r=>{if(r.url().startsWith(url)&&r.status()>=400)badResponses.push([r.status(),r.url()]);});
   await check(name,async()=>{
    await page.goto(url,{waitUntil:'networkidle'});await page.waitForTimeout(750);
    if([1366,390].includes(width))await page.screenshot({path:`${dir}/${name}-first-visit.png`});
    await page.locator('#cookieReject').click();const d=await measurements(page);
    assert.match(d.title,/Cíntia Almeida Gomes/);assert.ok((await page.locator('main').innerText()).length>3000);assert.equal(await page.locator('h1').count(),1);assert.deepEqual(errors,[]);assert.deepEqual(badResponses,[]);assert.deepEqual(consoleMessages,[]);
    assert.ok(d.scrollWidth<=width+1,'horizontal overflow');assert.equal(d.photo.fit,'cover');assert.ok(d.photo.width>0);
    if(version==='v5'){
     const b=d.boxes;
     if(width>=1280||width<600&&height>700)for(const k of ['title','statement','lead','primary'])assert.ok(b[k].y>=b.header.bottom-1&&b[k].bottom<=height,`${k} outside first fold`);
     assert.ok(b.title.bottom<=b.statement.y+1&&b.statement.bottom<=b.lead.y+1&&b.lead.bottom<=b.primary.y+1,'text overlap');
     assert.ok(b.signature.y>=b.hero.y-1&&b.signature.bottom<=b.hero.bottom+1,'signature outside hero');assert.ok(Math.abs(b.card.height-b.photo.height)<=3,'empty card tail');assert.ok(b.caption.bottom<=b.photo.bottom+1,'caption outside image');
     assert.equal(d.fonts.status,'loaded');assert.ok(d.fonts.faces.every(f=>f.status==='loaded'||f.status==='unloaded'),'font failure');assert.match(d.photo.src,/assets\/media\/cintia-hero-/);assert.ok((d.video.events.loadstart||0)<10,'video reload loop');
     assert.ok(d.motion.some(e=>/^v5-portrait/.test(e.name)),'photo motion not observed');assert.ok(d.motion.some(e=>e.name==='v5-edge'),'gold edge motion not observed');
    }
    await page.screenshot({path:`${dir}/${name}.png`});
    if([1920,1366,390].includes(width))await page.screenshot({path:`${dir}/${name}-full.png`,fullPage:true});
    if(version==='v5'&&width===1366){
     await page.locator('.hero-card-in').evaluate(e=>e.style.clipPath='polygon(2% 0,100% 0,100% 100%,0 100%)');await page.screenshot({path:`${dir}/${engine}-oblique-trial.png`});await page.locator('.hero-card-in').evaluate(e=>e.style.removeProperty('clip-path'));
     const t=d.video.time;await page.waitForTimeout(1100);const v=await measurements(page);assert.ok(v.video.time>t+.1,'video not advancing');
     await page.locator('#contato').scrollIntoViewIfNeeded();await page.waitForTimeout(250);assert.equal(await page.locator('#signatureVideo').evaluate(v=>v.paused),true);
     await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(350);assert.equal(await page.locator('#signatureVideo').evaluate(v=>v.paused),false);
    }
    return {engine:browser.version(),...d,consoleMessages,badResponses};
   },page);await context.close();
  }
  // New context-bound contact behavior: no automatic selection or data loss.
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await instrument(context);const page=await context.newPage();await page.goto(urls.v5,{waitUntil:'networkidle'});await page.locator('#cookieReject').click();
  await check(engine+'-area-to-contact',async()=>{
   await page.locator('#nome').fill('Cliente QA');await page.locator('#telefone').fill('(19) 99999-0000');await page.locator('#mensagem').fill('Teste fictício, sem envio.');
   assert.equal(await page.locator('#area').inputValue(),'');
   const areas=page.locator('#areas details');
   for(let i=0;i<4;i++){
    const area=areas.nth(i);if(!(await area.evaluate(e=>e.open)))await area.locator('summary').click();
    const previous=await page.locator('#area').inputValue();await page.waitForTimeout(50);assert.equal(await page.locator('#area').inputValue(),previous);
    const link=area.locator('[data-area]'),expected=await link.getAttribute('data-area');await link.focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#area').inputValue(),expected);assert.equal(await page.locator('#nome').inputValue(),'Cliente QA');assert.equal(await page.locator('#mensagem').inputValue(),'Teste fictício, sem envio.');assert.equal(new URL(page.url()).hash,'#contato');assert.equal(await page.evaluate(()=>document.activeElement.id),'contato');assert.deepEqual(await page.evaluate(()=>window.__opened),[]);
   }
   await page.locator('#contactForm button[type="submit"]').click();const opened=await page.evaluate(()=>window.__opened);assert.equal(opened.length,1);const u=new URL(opened[0]);assert.equal(u.origin+u.pathname,'https://wa.me/5519971432465');assert.match(u.searchParams.get('text'),/Direito do Consumidor/);return {areas:4,noAutomaticOpen:true,existingFieldsPreserved:true,destination:u.origin+u.pathname};
  },page);await context.close();
  // A native GET form remains usable with JS disabled; only text reaches the intercepted destination.
  const nojs=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});let nativeURL='';await nojs.route('https://wa.me/**',r=>{nativeURL=r.request().url();return r.fulfill({contentType:'text/html',body:'<title>QA intercepted</title>'});});const np=await nojs.newPage();await np.goto(urls.v5,{waitUntil:'networkidle'});
  await check(engine+'-native-no-js-form',async()=>{
   assert.ok(await np.locator('#formFallback a').isVisible());assert.ok(await np.locator('#mensagemSemJS').isVisible());await np.locator('#contactForm').evaluate(e=>e.scrollIntoView({behavior:'instant',block:'center'}));await np.waitForTimeout(200);await np.locator('#mensagemSemJS').fill('Família & imóvel — Cliente QA');
   const state=await np.locator('#contactForm').evaluate(f=>({action:f.action,method:f.method,target:f.target,valid:f.checkValidity(),fields:[...f.elements].map(e=>({tag:e.tagName,name:e.name,disabled:e.matches(':disabled'),valid:e.checkValidity?.(),value:e.value}))}));
   writeFileSync(`${dir}/${engine}-no-js-state.json`,JSON.stringify(state,null,2));assert.equal(state.valid,true,'native form invalid');await np.screenshot({path:`${dir}/${engine}-no-js-before-submit.png`});
   const [popup]=await Promise.all([nojs.waitForEvent('page',{timeout:8000}),np.locator('.native-contact button').click({noWaitAfter:true,timeout:8000})]);await popup.waitForLoadState('domcontentloaded');assert.ok(nativeURL);const u=new URL(nativeURL);assert.equal(u.pathname,'/5519971432465');assert.equal(u.searchParams.get('text'),'Família & imóvel — Cliente QA');assert.deepEqual([...u.searchParams.keys()],['text']);await np.screenshot({path:`${dir}/${engine}-no-js-form.png`});return {nativeSubmission:true,destination:u.origin+u.pathname,intercepted:true};
  },np);await nojs.close();
  const reduced=await browser.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});await instrument(reduced);const rp=await reduced.newPage();const media=[];rp.on('request',r=>{if(r.url().endsWith('.mp4'))media.push(r.url());});await rp.goto(urls.v5,{waitUntil:'networkidle'});
  await check(engine+'-reduced-motion',async()=>{assert.deepEqual(media,[]);await rp.locator('#cookieReject').click();await rp.locator('.impact').scrollIntoViewIfNeeded();const motions=await rp.evaluate(()=>document.getAnimations().map(a=>a.animationName));assert.deepEqual(motions,[]);assert.equal(await rp.locator('.impact').evaluate(e=>getComputedStyle(e).position),'relative');return {mediaRequests:0,animations:motions};},rp);await reduced.close();
  // A 1366×768 desktop at 200% reflows to 683×384 CSS pixels. This is emulation, not OS zoom.
  const zoom=await browser.newContext({viewport:{width:683,height:384},deviceScaleFactor:2});await instrument(zoom);const zp=await zoom.newPage();await zp.goto(urls.v5,{waitUntil:'networkidle'});await zp.locator('#cookieReject').click();
  await check(engine+'-200-percent-reflow',async()=>{assert.ok(await zp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await zp.locator('#toggle').click();assert.equal(await zp.locator('#toggle').getAttribute('aria-expanded'),'true');await zp.keyboard.press('Escape');await zp.locator('.hero-actions .gold').focus();assert.equal(await zp.locator('.hero-actions .gold').evaluate(e=>e===document.activeElement),true);await zp.screenshot({path:`${dir}/${engine}-zoom-reflow.png`});return {cssViewport:'683x384',deviceScaleFactor:2,physicalZoom:false};},zp);await zoom.close();
  await browser.close();
 }
 // Essential copy is visible while photographic/font/video requests are still delayed.
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});launched.push(browser);const slow=await browser.newContext({viewport:{width:1366,height:768}});await instrument(slow);await slow.route(/\.(?:webp|woff2|mp4)(?:\?.*)?$/,async r=>{await new Promise(resolve=>setTimeout(resolve,2000));await r.continue().catch(()=>{});});const sp=await slow.newPage();
 await check('immediate-content-with-slow-media',async()=>{await sp.goto(urls.v5,{waitUntil:'domcontentloaded'});assert.ok(await sp.locator('h1').isVisible());assert.ok(await sp.locator('.hero-actions .gold').isVisible());const d=await measurements(sp);assert.ok(d.boxes.primary.bottom<=768);assert.equal(await sp.locator('h1').evaluate(e=>getComputedStyle(e).opacity),'1');await sp.screenshot({path:`${dir}/immediate-content.png`,timeout:10000});return {firstObservation:d.boxes,fontsAtObservation:d.fonts.status};},sp);await slow.close();
 // Real video recording: opening + each meaningful section; no animation is simulated.
 for(const [name,width,height] of [['desktop',1366,768],['mobile',390,844]]){
  const c=await browser.newContext({viewport:{width,height},hasTouch:width<600,isMobile:width<600,recordVideo:{dir:`${dir}/recordings`,size:{width,height}}});await instrument(c);const p=await c.newPage();await p.goto(urls.v5,{waitUntil:'domcontentloaded'});await p.waitForTimeout(1800);await p.locator('#cookieReject').click();await p.waitForTimeout(800);
  for(const selector of ['#sobre','.impact','#areas','#atendimento','#contato']){await p.locator(selector).evaluate(e=>e.scrollIntoView({behavior:'instant',block:'start'}));await p.waitForTimeout(selector==='.impact'?1200:900);await p.screenshot({path:`${dir}/v5-${name}-${selector.replace(/[.#]/g,'')}.png`});if(selector==='#atendimento'){await p.mouse.wheel(0,180);await p.waitForTimeout(450);await p.mouse.wheel(0,180);await p.waitForTimeout(450);await p.screenshot({path:`${dir}/v5-${name}-process-progress.png`});}}
  const motion=await p.evaluate(()=>({events:window.__motion,steps:document.querySelectorAll('.step.is-read').length,progress:{native:CSS.supports('animation-timeline','view()'),timeline:getComputedStyle(document.querySelector('.steps'),'::after').animationTimeline},quiet:[...document.querySelectorAll('.faq .reveal,.contact .reveal')].map(e=>({animation:getComputedStyle(e).animationName,opacity:getComputedStyle(e).opacity}))}));
  await check('recorded-motion-'+name,async()=>{assert.ok(motion.events.some(e=>e.name==='v5-edge'));assert.ok(motion.events.filter(e=>e.name==='v5-pillar').length>=3);assert.ok(motion.steps>0);assert.ok(motion.quiet.every(e=>e.animation==='none'&&e.opacity==='1'));return motion;},p);
  const video=p.video();await c.close();renameSync(await video.path(),`${dir}/v5-${name}-motion.webm`);
 }
 await browser.close();
}catch(e){results.push({name:'environment',status:'BLOCKED',error:e.stack});console.error(e.stack);}
finally{await Promise.allSettled(launched.map(b=>b.close()));}
writeFileSync(`${dir}/v5-report.json`,JSON.stringify({base:process.env.QA_BASE,head:process.env.QA_COMMIT,checkedAt:new Date().toISOString(),browserPlugin:'not available; Playwright in GitHub Actions because local socket() is blocked',physicalDevices:'not tested',results},null,2));
console.log('V5',results.filter(r=>r.status==='PASS').length,'PASS;',results.filter(r=>r.status!=='PASS').length,'FAIL/BLOCKED');if(results.some(r=>r.status!=='PASS'))process.exitCode=1;
