// Before/after layout and media evidence. No external contacts or analytics sent.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, webkit } from 'playwright';

process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = '1';
const dir='artifacts/hero-hotfix'; mkdirSync(dir,{recursive:true});
const versions={before:'http://127.0.0.1:4174',after:'http://127.0.0.1:4173'};
const sizes=[[1920,1080],[1366,768],[1280,720],[768,1024],[390,844],[375,812],[320,740],[844,390]];
const results=[];const launched=[];

async function measure(page) {
  return page.evaluate(()=>{
    const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
    const selectors={header:'.top',hero:'.hero',grid:'.hero-grid',badge:'.hero .badge',title:'.hero h1',statement:'.hero-statement',lead:'.hero .lead',primary:'.hero-actions .gold',secondary:'.hero-actions .out',note:'.hero-note',photo:'.hero-card .portrait',card:'.hero-card',caption:'.portrait-caption',captionTitle:'.portrait-caption h2',signature:'.hero-signature'};
    const boxes=Object.fromEntries(Object.entries(selectors).map(([k,s])=>[k,rect(s)]));
    const v=document.querySelector('#signatureVideo');
    return {viewport:{width:innerWidth,height:innerHeight},boxes,scrollWidth:document.documentElement.scrollWidth,title:document.title,fonts:document.fonts.status,fontErrors:[...document.fonts].filter(f=>f.status==='error').map(f=>f.family),photo:{naturalWidth:document.querySelector('.portrait').naturalWidth,naturalHeight:document.querySelector('.portrait').naturalHeight,fit:getComputedStyle(document.querySelector('.portrait')).objectFit},caption:{position:getComputedStyle(document.querySelector('.portrait-caption')).position,border:getComputedStyle(document.querySelector('.portrait-caption')).borderTopWidth},video:{paused:v.paused,currentTime:v.currentTime,readyState:v.readyState,muted:v.muted,inline:v.playsInline,autoplay:v.autoplay,currentSrc:v.currentSrc,error:v.error?{code:v.error.code,message:v.error.message}:null,canPlayType:v.canPlayType('video/mp4; codecs="avc1.64001f"'),opacity:getComputedStyle(v).opacity,background:getComputedStyle(v.parentElement).backgroundImage,events:window.__heroMediaEvents}};
  });
}

try {
for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await type.launch({headless:true,...(engine==='chromium'?{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']}: {})});launched.push(browser);
  for(const [width,height] of sizes)for(const [version,url] of Object.entries(versions)){
    const name=`${engine}-${width}x${height}-${version}`;
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,hasTouch:width<=844,isMobile:width<=844});context.setDefaultTimeout(10000);
    const page=await context.newPage(); const errors=[],networkErrors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>networkErrors.push({url:r.url(),failure:r.failure()}));
    await page.addInitScript(()=>{
      window.__heroMediaEvents=[];
      for(const name of ['loadstart','loadedmetadata','canplay','playing','pause','error'])document.addEventListener(name,e=>{if(e.target.id==='signatureVideo')window.__heroMediaEvents.push({name,time:performance.now(),currentTime:e.target.currentTime,error:e.target.error?.code});},true);
      window.open=()=>null;
    });
    try{
      await page.goto(url,{waitUntil:'networkidle'});
      await page.waitForTimeout(900);
      // First visit: preserve the real cookie banner for review before dismissing.
      if([1366,390].includes(width))await page.screenshot({path:`${dir}/${name}-first-visit.png`});
      await page.locator('#cookieReject').click();
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      const data=await measure(page);
      await page.screenshot({path:`${dir}/${name}.png`});
      if([1920,1366,390].includes(width))await page.screenshot({path:`${dir}/${name}-full.png`,fullPage:true});
      assert.ok(data.title.includes('Cíntia Almeida Gomes'));assert.equal(await page.locator('h1').count(),1);assert.equal(data.fontErrors.length,0);assert.deepEqual(errors,[]);
      if(version==='after'){
        assert.ok(data.scrollWidth<=width+1,'horizontal overflow');
        assert.equal(data.photo.fit,'cover');assert.ok(data.photo.naturalWidth>0);
        const b=data.boxes;
        // Fit is required at ordinary laptop/desktop sizes, not a short landscape phone.
        if(width>=1280 || (width<600&&height>700))for(const key of ['title','statement','lead','primary']){
          assert.ok(b[key].y>=b.header.bottom-1,`${key} overlaps header`);
          assert.ok(b[key].bottom<=height,`${key} below fold: ${b[key].bottom} > ${height}`);
        }
        assert.ok(b.title.bottom<=b.statement.y+1,'headline overlaps supporting copy');
        assert.ok(b.statement.bottom<=b.lead.y+1,'supporting copy overlaps areas');
        assert.ok(b.lead.bottom<=b.primary.y+1,'areas overlap primary CTA');
        assert.equal(data.caption.position,'absolute');assert.equal(data.caption.border,'0px');
        assert.ok(b.captionTitle.y>=b.photo.y && b.captionTitle.bottom<=b.photo.bottom+1,'caption outside portrait');
        assert.ok(Math.abs(b.card.height-b.photo.height)<=3,'empty card tail');
        assert.ok(b.signature.y>=b.hero.y-1 && b.signature.bottom<=b.hero.bottom+1,'signature outside HERO');
        if(width>=1280)assert.ok(b.hero.bottom-b.card.bottom<=96,'excess space below portrait');
      }
      results.push({name,status:'PASS',engineVersion:browser.version(),...data,networkErrors});
      console.log('PASS',name,JSON.stringify({heroHeight:data.boxes.hero.height,primaryBottom:data.boxes.primary.bottom,signatureTop:data.boxes.signature.y,video:data.video.readyState}));
      if(version==='after'&&width===1366){
        const t=data.video.currentTime;await page.waitForTimeout(1200);const next=await measure(page);
        writeFileSync(`${dir}/${engine}-video-timeline.json`,JSON.stringify({start:data.video,next:next.video,advanced:next.video.currentTime>t+.1},null,2));
        await page.screenshot({path:`${dir}/${engine}-1366x768-video-later.png`});
        assert.ok(next.video.currentTime>t+.1 || next.video.opacity==='0','stalled visible video');
      }
    }catch(e){results.push({name,status:'FAIL',error:e.stack,diagnostic:await measure(page).catch(()=>null)});console.error('FAIL',name,e.message);await page.screenshot({path:`${dir}/${name}-FAIL.png`,timeout:5000}).catch(()=>{});}
    finally{await context.close();}
  }
  for(const mode of ['reduced-motion','autoplay-denied']){
    const context=await browser.newContext({viewport:{width:375,height:812},reducedMotion:mode==='reduced-motion'?'reduce':'no-preference'});
    if(mode==='autoplay-denied')await context.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('QA autoplay denied','NotAllowedError'));};});
    const page=await context.newPage();const mediaRequests=[];page.on('request',r=>{if(r.url().endsWith('.mp4'))mediaRequests.push(r.url());});
    try{await page.goto(versions.after,{waitUntil:'networkidle'});await page.waitForTimeout(500);await page.locator('#cookieReject').click();const data=await measure(page);assert.equal(data.video.opacity,'0');assert.match(data.video.background,/poster/);if(mode==='reduced-motion')assert.deepEqual(mediaRequests,[]);await page.screenshot({path:`${dir}/${engine}-${mode}.png`});results.push({name:`${engine}-${mode}`,status:'PASS',video:data.video});}
    catch(e){results.push({name:`${engine}-${mode}`,status:'FAIL',error:e.stack});}finally{await context.close();}
  }
  await browser.close();
}
}catch(e){results.push({name:'environment',status:'BLOCKED',error:e.stack});}
finally{await Promise.allSettled(launched.map(b=>b.close()));}
writeFileSync(`${dir}/layout-media-report.json`,JSON.stringify({base:process.env.QA_BASE,head:process.env.QA_COMMIT,checkedAt:new Date().toISOString(),physicalDevices:'not available; these are browser engine/viewport tests',results},null,2));
console.log('HOTFIX',results.filter(r=>r.status==='PASS').length,'PASS;',results.filter(r=>r.status!=='PASS').length,'FAIL/BLOCKED');
if(results.some(r=>r.status!=='PASS'))process.exitCode=1;
