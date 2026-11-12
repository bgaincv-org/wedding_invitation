import { test, expect } from '@playwright/test'
import { WELCOME_SESSION_KEY } from '../../src/lib/content'
import { mkdir, writeFile } from 'node:fs/promises'

test.beforeEach(async ({ page }) => { await page.addInitScript(key => sessionStorage.setItem(key, 'yes'), WELCOME_SESSION_KEY) })

for (const width of [320,390,1440]) test(`the continuous knot opens and clears in under five seconds at ${width}px`,async({page})=>{
 const errors:string[]=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.setViewportSize({width,height:900})
 await page.addInitScript(()=>{
  document.addEventListener('click',event=>{
   if(!(event.target as Element).closest('.cover-open-button'))return
   const result={start:performance.now(),firstPaint:0,duration:0,frames:[] as number[],stages:[] as string[]}
   Object.assign(window,{knotTiming:result})
   let previous=0,seen=false
   const frame=(now:number)=>{
    const element=document.querySelector<HTMLElement>('.knot-curtain')
    if(element){
     seen=true
     if(previous)result.frames.push(now-previous)
     previous=now
     const stage=element.dataset.stage!
     if(!result.stages.includes(stage))result.stages.push(stage)
     if(!result.firstPaint&&Number(element.querySelector<HTMLElement>('.knot-art')?.style.opacity)>0)result.firstPaint=performance.now()-result.start
    }else if(seen){result.duration=performance.now()-result.start;return}
    requestAnimationFrame(frame)
   }
   requestAnimationFrame(frame)
  },{once:true})
 })
 await page.goto('/')
 await page.getByRole('button',{name:'Open invitation',exact:true}).click()
 const curtain=page.locator('.knot-curtain'),art=page.locator('.knot-art')
 await expect(curtain).toHaveClass(/has-webgl/)
 await expect(curtain).toHaveAttribute('data-cloths','2')
 await expect(art.locator('canvas')).toHaveCount(1)
 await expect(art.locator('img')).toHaveCSS('visibility','hidden')
 await page.waitForFunction(()=>document.querySelector('.knot-curtain')?.getAttribute('data-stage')==='threading')
 const rendering=await art.locator('canvas').evaluate(element=>{
  const gl=(element as HTMLCanvasElement).getContext('webgl')!,program=gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram
  return {depth:gl.isEnabled(gl.DEPTH_TEST),blend:gl.isEnabled(gl.BLEND),shadows:gl.getUniform(program,gl.getUniformLocation(program,'u_shadows')!)}
 })
 expect(rendering).toEqual({depth:true,blend:false,shadows:1})
 const box=await art.boundingBox()
 expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width)
 expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height).toBeLessThanOrEqual(900)
 await page.waitForFunction(()=>document.querySelector('.knot-curtain')?.getAttribute('data-stage')==='settling')
 await mkdir('verification/knot-rework',{recursive:true})
 await page.screenshot({path:`verification/knot-rework/live-${width}.png`})
 await expect(page.locator('#hero-title')).toBeFocused({timeout:6000})
 await expect(curtain).not.toBeAttached()
 const timing=await page.evaluate(()=>(window as unknown as {knotTiming:{firstPaint:number;duration:number;frames:number[];stages:string[]}}).knotTiming)
 expect(timing.firstPaint).toBeLessThan(250)
 expect(timing.firstPaint).toBeGreaterThanOrEqual(0)
 expect(timing.duration).toBeGreaterThan(4200);expect(timing.duration).toBeLessThan(5000)
 expect(timing.stages).toEqual(['arriving','crossing','looping','threading','tightening','settling','revealing'])
 await writeFile(`verification/knot-rework/live-timing-${width}.json`,JSON.stringify(timing,null,2))
 expect(errors).toEqual([])
})

test('GPU loss uses the prepared reference and preserves the same completion clock',async({page})=>{
 await page.goto('/')
 await page.getByRole('button',{name:'Open invitation',exact:true}).click()
 await expect(page.locator('.knot-curtain')).toHaveClass(/has-webgl/)
 await page.locator('.knot-art canvas').evaluate(element=>(element as HTMLCanvasElement).getContext('webgl')!.getExtension('WEBGL_lose_context')!.loseContext())
 await expect(page.locator('.knot-art img')).toBeVisible()
 await expect(page.locator('#hero-title')).toBeFocused({timeout:6000})
})

test('hidden tabs suspend the motion and dissolve together, then resume without a jump',async({page})=>{
 await page.goto('/')
 await page.getByRole('button',{name:'Open invitation',exact:true}).click()
 await page.waitForFunction(()=>document.querySelector('.knot-curtain')?.getAttribute('data-stage')==='threading')
 const state=()=>page.locator('.knot-art').evaluate(element=>{
  const gl=element.querySelector('canvas')!.getContext('webgl')!,program=gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram
  return [element.getAttribute('style'),gl.getUniform(program,gl.getUniformLocation(program,'u_time')!)]
 })
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))})
 const before=await state();await page.waitForTimeout(180);expect(await state()).toEqual(before)
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))})
 await expect(page.locator('#hero-title')).toBeFocused({timeout:6000})
})

test('missing silk, missing reference and unsupported WebGL cannot block entry',async({page})=>{
 await page.route('**/art/dharmavaram-silk.webp',route=>route.abort())
 await page.route('**/art/cover/wedding-knot.webp',route=>route.abort())
 await page.addInitScript(()=>Object.defineProperty(HTMLCanvasElement.prototype,'getContext',{value:()=>null}))
 await page.goto('/')
 await page.getByRole('button',{name:'Open invitation',exact:true}).click()
 await expect(page.locator('.knot-curtain')).not.toHaveClass(/has-webgl/)
 await expect(page.locator('#hero-title')).toBeFocused({timeout:6000})
})

test('repeated clicks run one knot and a reduced-motion change exits immediately',async({page})=>{
 await page.goto('/')
 const button=page.getByRole('button',{name:'Open invitation',exact:true})
 await expect(button).toBeEnabled()
 await button.evaluate(element=>{(element as HTMLButtonElement).click();(element as HTMLButtonElement).click();(element as HTMLButtonElement).click()})
 await expect(page.locator('.knot-curtain')).toHaveCount(1)
 await page.emulateMedia({reducedMotion:'reduce'})
 await expect(page.locator('.knot-curtain')).not.toBeAttached()
 await expect(page.locator('#hero-title')).toBeFocused()
})
test('a first visit prepares the knot during the cover and keeps the complete opening flow',async({page})=>{
 await page.addInitScript(()=>sessionStorage.clear())
 await page.goto('/')
 await expect(page.locator('.split-curtain')).toBeVisible()
 await expect(page.locator('.knot-curtain')).not.toBeAttached()
 const open=page.getByRole('button',{name:'Open invitation',exact:true})
 await expect(open).toBeEnabled({timeout:12000})
 await open.click()
 await expect(page.locator('.knot-curtain')).toHaveClass(/has-webgl/)
 await page.waitForFunction(()=>document.querySelector('.knot-curtain')?.getAttribute('data-stage')==='settling')
 await page.screenshot({path:'verification/knot-rework/final-desktop.png'})
 await expect(page.locator('#hero-title')).toBeFocused({timeout:6000})
})

test('a late texture cannot delay opening or replace an already visible fallback',async({page})=>{
 let release=()=>{}
 const gate=new Promise<void>(resolve=>{release=resolve})
 await page.route('**/art/dharmavaram-silk.webp',async route=>{await gate;await route.continue()})
 await page.goto('/',{waitUntil:'domcontentloaded'})
 await page.getByRole('button',{name:'Open invitation',exact:true}).click()
 await expect(page.locator('.knot-curtain')).not.toHaveClass(/has-webgl/)
 await expect(page.locator('.knot-art img')).toBeVisible()
 release()
 await page.waitForFunction(()=>document.querySelector('.knot-curtain')?.getAttribute('data-stage')==='threading')
 await expect(page.locator('.knot-curtain')).not.toHaveClass(/has-webgl/)
 await expect(page.locator('#hero-title')).toBeFocused({timeout:6000})
})

test('individual leaves receive distinct angles with opposing local movement',async({page})=>{
 await page.addInitScript(()=>{
  const locations=new WeakMap<WebGLUniformLocation,string>()
  const get=WebGLRenderingContext.prototype.getUniformLocation,put=WebGLRenderingContext.prototype.uniform1f
  Object.assign(window,{leafAngles:[] as number[]})
  WebGLRenderingContext.prototype.getUniformLocation=function(program,name){const value=get.call(this,program,name);if(value)locations.set(value,name);return value}
  WebGLRenderingContext.prototype.uniform1f=function(location,value){if(location&&locations.get(location)==='u_angle'){const angles=(window as unknown as {leafAngles:number[]}).leafAngles;angles.push(value);if(angles.length>64)angles.shift()}return put.call(this,location,value)}
 })
 await page.goto('/#home')
 await expect(page.locator('.couple-garland')).toHaveAttribute('data-breeze-live','true')
 await expect(page.locator('.toran-leaf')).toHaveCount(32)
 await expect.poll(()=>page.evaluate(()=>{const a=(window as unknown as {leafAngles:number[]}).leafAngles.slice(-32);return a.length===32&&Math.min(...a)<-.02&&Math.max(...a)>.02})).toBe(true)
})
