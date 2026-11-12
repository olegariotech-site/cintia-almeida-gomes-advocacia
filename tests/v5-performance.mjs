import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { mkdirSync,writeFileSync } from 'node:fs';
const dir='artifacts/v5-performance';mkdirSync(dir,{recursive:true});
const all=[];
// Alternating versions, cold storage/cache, same runner / mobile simulated throttling.
for(let run=1;run<=3;run++)for(const version of ['before','after']){
 const chrome=await launch({chromePath:'/usr/bin/google-chrome',chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 try{
  const {lhr,report}=await lighthouse(`http://127.0.0.1:${version==='before'?4174:4173}/`,{port:chrome.port,output:['json','html'],logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo'],formFactor:'mobile',screenEmulation:{mobile:true,width:390,height:844,deviceScaleFactor:1,disabled:false},throttlingMethod:'simulate',throttling:{rttMs:150,throughputKbps:1638.4,cpuSlowdownMultiplier:4,requestLatencyMs:562.5,downloadThroughputKbps:1474.56,uploadThroughputKbps:675},disableStorageReset:false});
  writeFileSync(`${dir}/${version}-${run}.json`,report[0]);writeFileSync(`${dir}/${version}-${run}.html`,report[1]);
  if(lhr.runtimeError)throw new Error(JSON.stringify(lhr.runtimeError));
  const a=lhr.audits;
  const row={version,run,lighthouse:lhr.lighthouseVersion,environment:lhr.environment,settings:lhr.configSettings,score:lhr.categories.performance.score*100,LCP:a['largest-contentful-paint'].numericValue,CLS:a['cumulative-layout-shift'].numericValue,TBT:a['total-blocking-time'].numericValue,FCP:a['first-contentful-paint'].numericValue,transferBytes:a['total-byte-weight'].numericValue,thirdParty:a['network-requests'].details.items.filter(i=>!i.url.startsWith('http://127.0.0.1')).map(i=>({url:i.url,bytes:i.transferSize})),lcpElement:a['lcp-breakdown-insight']?.details,renderBlocking:a['render-blocking-insight']?.details};all.push(row);console.log(JSON.stringify({version,run,score:row.score,LCP:row.LCP,CLS:row.CLS,TBT:row.TBT,transferBytes:row.transferBytes}));
 }finally{await chrome.kill();}
}
const summary={};for(const version of ['before','after']){summary[version]={};for(const k of ['score','LCP','CLS','TBT','FCP','transferBytes']){const vals=all.filter(x=>x.version===version).map(x=>x[k]).sort((a,b)=>a-b);summary[version][k]={median:vals[1],min:vals[0],max:vals[2]};}}
writeFileSync(`${dir}/comparison.json`,JSON.stringify({base:process.env.QA_BASE,head:process.env.QA_COMMIT,notes:'Published V4 hotfix snapshot versus V5 Signature Experience; same runner and simulated mobile conditions; no field INP or physical-device measurement.',summary,runs:all},null,2));console.log('MEDIANS',JSON.stringify(summary));
const before=summary.before,after=summary.after;
const gates={LCP:after.LCP.median<=before.LCP.median*1.05,CLS:after.CLS.median<=before.CLS.median+.02,TBT:after.TBT.median<=Math.max(200,before.TBT.median+50),transfer:after.transferBytes.median<=before.transferBytes.median*1.02};
writeFileSync(`${dir}/gates.json`,JSON.stringify({gates,note:'Laboratory variability is documented; a failed gate requires investigation, not a claimed production result.'},null,2));
if(Object.values(gates).includes(false))throw new Error('Performance regression gate: '+JSON.stringify(gates));
