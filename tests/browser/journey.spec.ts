import { test,expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for(const width of [320,390,650,768,1440]){
 test(`the confirmed events have an uncluttered complete journey at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:941})
  await page.emulateMedia({reducedMotion:'reduce'})
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto('/#celebrations')
  await expect(page.locator('#main section').nth(3)).toHaveAttribute('id','celebrations')
  await expect(page.locator('.journey-stop')).toHaveCount(7)
  if(width<760){
   await expect(page.locator('.journey-stop-left .journey-caption').first()).toHaveCSS('text-align','left')
   await expect(page.locator('.journey-stop-right .journey-caption').first()).toHaveCSS('text-align','right')
   const [first,second]=await page.locator('.journey-ceremony-art').evaluateAll(art=>art.slice(0,2).map(el=>el.getBoundingClientRect().x))
   expect(Math.abs(first-second)).toBeGreaterThan(width*.4)
  }
  await page.locator('.journey-ceremony-art img').evaluateAll(images=>{images.forEach(i=>(i as HTMLImageElement).loading='eager');return Promise.all(images.map(i=>(i as HTMLImageElement).decode()))})
  await expect(page.locator('[data-event="wedding"] time')).toHaveAttribute('datetime','2026-12-20T03:40:00+05:30')
  await expect(page.locator('.journey-provisional')).toHaveCount(0)
  await expect(page.locator('.journey-event-actions button')).toHaveCount(2)
  for(const locale of ['en','te']){
   if(locale==='te'){await page.evaluate(()=>localStorage.setItem('wedding-language','te'));await page.goto('/?preview=te#celebrations');await page.evaluate(()=>document.fonts.ready)}
   await page.locator('#celebrations').scrollIntoViewIfNeeded()
   const collision=await page.evaluate(()=>{
    const cards=[...document.querySelectorAll('.journey-caption')].map(c=>c.getBoundingClientRect())
    const feet=[...document.querySelectorAll('.journey-step')].map(c=>c.getBoundingClientRect())
    const end=document.querySelector('.journey-end')!.getBoundingClientRect()
    return {overlap:feet.some(a=>cards.some(b=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)),endOverlap:cards.some(c=>c.bottom>end.top),overflow:document.documentElement.scrollWidth>innerWidth}
   })
   expect(collision).toEqual({overlap:false,endOverlap:false,overflow:false})
   const scan=await new AxeBuilder({page}).include('#celebrations').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
   expect(scan.violations).toEqual([])
  }
  expect(errors).toEqual([])
 })
}

test('footsteps follow scroll in both directions and each event reveals in order',async({page})=>{
 await page.goto('/#celebrations')
 const section=page.locator('#celebrations'),footprints=page.locator('.journey-step > svg')
 await expect(section).toHaveAttribute('data-journey-motion','scroll')
 const count=()=>footprints.evaluateAll(feet=>feet.filter(f=>Number(getComputedStyle(f).opacity)>.5).length)
 await page.waitForTimeout(450)
 const initial=await count(),total=await footprints.count()
 expect(initial).toBeLessThan(total/2)
 await expect(page.locator('[data-event="wedding"] h3')).toHaveCSS('opacity','0')
 for(const id of ['reception','wedding']){
  const caption=page.locator(`[data-event="${id}"] .journey-caption`)
  await caption.scrollIntoViewIfNeeded()
  await expect(caption.locator('h3')).toHaveCSS('opacity','1')
  await expect(caption.locator('a')).toHaveCSS('opacity','1')
 }
 await expect.poll(count).toBeGreaterThan(total*.7)
 await page.evaluate(()=>document.querySelector('#celebrations')!.scrollIntoView({behavior:'instant',block:'start'}))
 await expect.poll(count).toBeLessThan(total/2)
 await page.setViewportSize({width:390,height:844})
 await page.locator('[data-event="wedding"] .journey-caption').scrollIntoViewIfNeeded()
 await expect(page.locator('[data-event="wedding"] h3')).toHaveCSS('opacity','1')
 await page.emulateMedia({reducedMotion:'reduce'})
 await expect(section).toHaveAttribute('data-journey-motion','static')
 expect(await count()).toBe(total===await footprints.count()?total:await footprints.count())
})

test('both feet point down the page during reveals, reversal and reduced motion',async({page})=>{
 await page.goto('/#celebrations')
 const backwards=()=>page.locator('.journey-step use').evaluateAll(feet=>feet.filter(foot=>{
  const matrix=(foot as SVGGraphicsElement).getScreenCTM()!
  const toe=new DOMPoint(18,9).matrixTransform(matrix)
  const heel=new DOMPoint(18,64).matrixTransform(matrix)
  return toe.y<=heel.y
 }).length)
 for(const width of [1440,390,320,844]){
  await page.setViewportSize({width,height:844})
  for(const selector of ['[data-event="wedding"]','.journey-end','.journey-heading']){
   await page.locator(selector).scrollIntoViewIfNeeded()
   await expect.poll(backwards).toBe(0)
  }
 }
 await page.emulateMedia({reducedMotion:'reduce'})
 await expect.poll(backwards).toBe(0)
})

test('a foot swings forward and lands heel first after scrolling stops',async({page})=>{
 await page.setViewportSize({width:1440,height:900})
 await page.goto('/#celebrations')
 await page.evaluate(()=>window.scrollTo({top:window.scrollY+document.querySelector('.journey-route')!.getBoundingClientRect().top-80,behavior:'instant'}))
 const frames=await page.evaluate(async()=>{
  const samples:{scroll:number;feet:{foot:string;opacity:number;transform:string}[];contact:boolean}[]=[]
  for(let i=0;i<18;i++){
   samples.push({scroll:window.scrollY,feet:[...document.querySelectorAll<HTMLElement>('.journey-moving-foot')].map(foot=>({foot:foot.dataset.foot!,opacity:Number(foot.style.opacity),transform:foot.style.transform})),contact:[...document.querySelectorAll<SVGElement>('.journey-step > svg')].some(stamp=>stamp.style.transform.startsWith('scaleY')&&Number(stamp.style.opacity)>.05)})
   await new Promise(resolve=>setTimeout(resolve,80))
  }
  return samples
 })
 expect(Math.max(...frames.map(frame=>frame.scroll))-Math.min(...frames.map(frame=>frame.scroll))).toBeLessThan(2)
 for(const side of ['left','right']){
  const positions=frames.flatMap(frame=>frame.feet.filter(foot=>foot.foot===side&&foot.opacity>.15).map(foot=>foot.transform))
  expect(new Set(positions).size).toBeGreaterThan(2)
 }
 expect(frames.some(frame=>frame.contact)).toBe(true)
 await page.emulateMedia({reducedMotion:'reduce'})
 await expect(page.locator('#celebrations')).toHaveAttribute('data-journey-motion','static')
 for(const foot of await page.locator('.journey-moving-foot').all())await expect(foot).toHaveCSS('opacity','0')
})

test('a fast mobile scroll keeps visible heel landings at a quicker cadence',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/#celebrations')
 const landings=await page.evaluate(async()=>{
  const route=document.querySelector('.journey-route')!
  window.scrollTo({top:window.scrollY+route.getBoundingClientRect().top-60,behavior:'instant'})
  const seen=new Set<Element>(),events:{time:number;foot:string}[]=[]
  const observer=new MutationObserver(records=>{
   for(const record of records){
    const stamp=record.target as SVGElement,box=stamp.getBoundingClientRect()
    if(stamp.style.transform.startsWith('scaleY')&&Number(stamp.style.opacity)>.05&&!seen.has(stamp)&&box.bottom>0&&box.top<innerHeight){
     seen.add(stamp);events.push({time:performance.now(),foot:stamp.closest<HTMLElement>('.journey-step')!.dataset.foot!})
    }
   }
  })
  document.querySelectorAll('.journey-step > svg').forEach(stamp=>observer.observe(stamp,{attributes:true,attributeFilter:['style']}))
  await new Promise<void>(resolve=>{
   let start=0,last=0
   const tick=(now:number)=>{
    if(!start)start=last=now
    window.scrollBy({top:900*(now-last)/1000,behavior:'instant'});last=now
    if(now-start<2400)requestAnimationFrame(tick);else resolve()
   }
   requestAnimationFrame(tick)
  })
  observer.disconnect();return events
 })
 expect(landings.length).toBeGreaterThanOrEqual(3)
 expect(new Set(landings.map(landing=>landing.foot)).size).toBe(2)
 const intervals=landings.slice(1).map((landing,i)=>landing.time-landings[i].time)
 expect(intervals.some(interval=>interval>100&&interval<380)).toBe(true)
})

test('the confirmed venue link is keyboard accessible and reduced motion keeps details readable',async({page})=>{
 await page.goto('/#celebrations')
 await page.emulateMedia({reducedMotion:'reduce'})
 await expect(page.locator('#celebrations')).toHaveAttribute('data-journey-motion','static')
 const first=page.locator('[data-event="reception"] a')
 await first.focus()
 await expect(first).toBeFocused()
 await expect(page.locator('[data-event="reception"] h3')).toHaveCSS('opacity','1')
 await page.locator('.journey-end a').click()
 await expect(page.locator('#the-details')).toBeInViewport()
})

for(const width of [390,1440])test(`a full-route fling animates every footprint without skips at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900})
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
 await page.goto('/#home')
 await expect(page.locator('#celebrations')).toHaveAttribute('data-journey-motion','scroll')
 await page.evaluate(()=>document.fonts.ready)
 const result=await page.evaluate(async()=>{
  const stamps=[...document.querySelectorAll<SVGElement>('.journey-step > svg')]
  const feet=[...document.querySelectorAll<HTMLElement>('.journey-moving-foot')]
  const sampled=new Set<number>(),started=new Map<number,number>(),finished=new Map<number,number>()
  const transforms=new Map<number,Set<string>>()
  const frames:number[]=[];let previous=0
  const route=document.querySelector('.journey-route')!.getBoundingClientRect()
  window.scrollTo({top:window.scrollY+route.bottom-innerHeight*.6,behavior:'instant'})
  await new Promise<void>((resolve,reject)=>{
   const began=performance.now()
   const tick=(now:number)=>{
    if(previous)frames.push(now-previous);previous=now
    feet.forEach((foot,i)=>{
     if(Number(foot.style.opacity)>.005){
      if(!started.has(i))started.set(i,now)
      if(!transforms.has(i))transforms.set(i,new Set())
      transforms.get(i)!.add(foot.style.transform)
     }
    })
    stamps.forEach((stamp,i)=>{
     const opacity=Number(stamp.style.opacity)
     if(opacity>.001&&opacity<.93)sampled.add(i)
     if(opacity>=.94&&!finished.has(i))finished.set(i,now)
    })
    if(finished.size===stamps.length)return resolve()
    if(now-began>10000)return reject(new Error('The queued walk did not complete'))
    requestAnimationFrame(tick)
   }
   requestAnimationFrame(tick)
  })
  return {total:stamps.length,sampled:[...sampled],started:[...started.keys()],finished:[...finished.keys()],durations:[...finished].map(([i,time])=>time-started.get(i)!),poses:[...transforms.values()].map(set=>set.size),frames}
 })
 expect(result.started).toEqual(Array.from({length:result.total},(_,i)=>i))
 expect(result.finished).toEqual(result.started)
 expect(result.sampled).toEqual(result.started)
 expect(Math.min(...result.poses)).toBeGreaterThan(5)
 expect(Math.min(...result.durations)).toBeGreaterThan(350)
 expect(Math.max(...result.durations)).toBeLessThan(800)
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}))
 await expect.poll(()=>page.locator('.journey-step > svg').evaluateAll(stamps=>stamps.filter(stamp=>Number(getComputedStyle(stamp).opacity)>.01).length)).toBe(0)
 expect(errors).toEqual([])
})
