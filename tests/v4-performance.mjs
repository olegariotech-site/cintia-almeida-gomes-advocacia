import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { mkdirSync,writeFileSync } from 'node:fs';
const dir='artifacts/performance';mkdirSync(dir,{recursive:true});
const all=[];
// Alternating versions, cold storage/cache, same runner / mobile simulated throttling.
for(let run=1;run<=3;run++)for(const version of ['v3','v4']){
 const chrome=await launch({chromePath:'/usr/bin/google-chrome',chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{
  const {lhr,report}=await lighthouse(`http://127.0.0.1:${version==='v3'?4174:4173}/`,{port:chrome.port,output:['json','html'],logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo'],formFactor:'mobile',screenEmulation:{mobile:true,width:390,height:844,deviceScaleFactor:1,disabled:false},throttlingMethod:'simulate',throttling:{rttMs:150,throughputKbps:1638.4,cpuSlowdownMultiplier:4,requestLatencyMs:562.5,downloadThroughputKbps:1474.56,uploadThroughputKbps:675},disableStorageReset:false});
  writeFileSync(`${dir}/${version}-${run}.json`,report[0]);writeFileSync(`${dir}/${version}-${run}.html`,report[1]);
  if(lhr.runtimeError)throw new Error(JSON.stringify(lhr.runtimeError));
  const a=lhr.audits;
  const row={version,run,lighthouse:lhr.lighthouseVersion,environment:lhr.environment,settings:lhr.configSettings,score:lhr.categories.performance.score*100,LCP:a['largest-contentful-paint'].numericValue,CLS:a['cumulative-layout-shift'].numericValue,TBT:a['total-blocking-time'].numericValue,FCP:a['first-contentful-paint'].numericValue,transferBytes:a['total-byte-weight'].numericValue,thirdParty:a['network-requests'].details.items.filter(i=>!i.url.startsWith('http://127.0.0.1')).map(i=>({url:i.url,bytes:i.transferSize})),lcpElement:a['lcp-breakdown-insight']?.details,renderBlocking:a['render-blocking-insight']?.details};all.push(row);console.log(JSON.stringify({version,run,score:row.score,LCP:row.LCP,CLS:row.CLS,TBT:row.TBT,transferBytes:row.transferBytes}));
 }finally{await chrome.kill();}
}
const summary={};for(const version of ['v3','v4']){summary[version]={};for(const k of ['score','LCP','CLS','TBT','FCP','transferBytes']){const vals=all.filter(x=>x.version===version).map(x=>x[k]).sort((a,b)=>a-b);summary[version][k]={median:vals[1],min:vals[0],max:vals[2]};}}
writeFileSync(`${dir}/comparison.json`,JSON.stringify({base:process.env.QA_BASE,head:process.env.QA_COMMIT,notes:'Laboratory, localhost snapshots; no field INP; not a measurement of production hosting or physical devices.',summary,runs:all},null,2));console.log('MEDIANS',JSON.stringify(summary));
