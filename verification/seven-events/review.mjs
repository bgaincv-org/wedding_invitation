import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
await mkdir('verification/seven-events',{recursive:true})
const browser=await chromium.launch({channel:'msedge',headless:true})
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}})
 const problems=[]
 page.on('pageerror',e=>problems.push(e.message))
 page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')problems.push(m.text())})
 const response=await page.goto('http://127.0.0.1:3005/#home')
 const csp=response.headers()['content-security-policy']
 if(!csp?.includes('frame-src https://www.google.com'))throw new Error('Production map policy missing')
 await page.evaluate(()=>document.fonts.ready)
 await page.waitForTimeout(1500)
 const timing=await page.evaluate(async()=>{
  const frames=[];let start=0,last=0
  const distance=document.documentElement.scrollHeight-innerHeight
  await new Promise(resolve=>{
   const tick=now=>{
    if(!start)start=last=now
    if(now>last)frames.push(now-last)
    last=now;const progress=Math.min(1,(now-start)/12000)
    window.scrollTo({top:distance*progress,behavior:'instant'})
    if(progress<1)requestAnimationFrame(tick);else resolve()
   }
   requestAnimationFrame(tick)
  })
  const sorted=[...frames].sort((a,b)=>a-b)
  return {samples:frames.length,p50:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)],p99:sorted[Math.floor(sorted.length*.99)],maximum:sorted.at(-1),over33ms:frames.filter(v=>v>33.4).length}
 })
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.locator('.journey-ceremony-art img').evaluateAll(images=>{images.forEach(i=>i.loading='eager');return Promise.all(images.map(i=>i.decode()))})
 await page.locator('#celebrations').screenshot({path:'verification/seven-events/journey-1440.png'})
 await page.locator('#event-reception').scrollIntoViewIfNeeded()
 await page.screenshot({path:'verification/seven-events/events-detail-1440.png'})
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:900})
  await page.locator('#moments').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}))
  await page.locator('#moments img').evaluateAll(images=>{images.forEach(i=>i.loading='eager');return Promise.all(images.map(i=>i.decode()))})
  await page.screenshot({path:`verification/seven-events/toran-${width}.png`})
  await page.locator('.venue-map-preview').scrollIntoViewIfNeeded()
  await page.waitForTimeout(2500)
  await page.locator('#the-details').screenshot({path:`verification/seven-events/venue-${width}.png`})
 }
 const provider=page.frames().find(frame=>frame.url().startsWith('https://www.google.com/maps/embed'))
 console.log(JSON.stringify({timing,mapProviderLoaded:!!provider,providerUrl:provider?.url(),problems},null,2))
 await writeFile('verification/seven-events/production-report.json',JSON.stringify({timing,mapProviderLoaded:!!provider,csp,problems},null,2))
} finally {await browser.close()}