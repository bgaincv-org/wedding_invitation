import {test,expect} from '@playwright/test'

test('changing language and rotating a touch phone keeps the animated invitation mounted',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})
 const page=await context.newPage(),errors:string[]=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.goto('http://127.0.0.1:5173/#with-love')
 await page.getByRole('button',{name:'Switch to Telugu'}).click()
 await page.setViewportSize({width:844,height:390})
 await page.locator('#home').scrollIntoViewIfNeeded()
 await expect(page.locator('#hero-title')).toBeVisible()
 await page.getByRole('button',{name:'Switch to English'}).click()
 await page.setViewportSize({width:390,height:844})
 await page.locator('[data-event="gathering"] .journey-caption').scrollIntoViewIfNeeded()
 await expect(page.locator('[data-event="gathering"] h3')).toHaveCSS('opacity','1')
 expect(errors).toEqual([])
 await context.close()
})

for(const [width,height] of [[320,568],[390,844],[600,900],[844,390]]){
 test(`the complete mobile invitation stays usable at ${width} by ${height}`,async({page})=>{
  await page.setViewportSize({width,height})
  await page.emulateMedia({reducedMotion:'reduce'})
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
  await page.goto('/')
  const open=page.getByRole('button',{name:'Open invitation',exact:true})
  await expect(open).toBeInViewport()
  await open.click()
  await expect(page.locator('#hero-title')).toBeFocused()
  await page.locator('#rsvp').scrollIntoViewIfNeeded()
  await page.locator('.rsvp-form').waitFor({state:'attached'})
  for(const locale of ['en','te']){
   if(locale==='te')await page.getByRole('button',{name:'Switch to Telugu'}).click()
   await page.evaluate(()=>document.fonts.ready)
   for(const selector of ['#home','#muhurtham','#celebrations','#our-invitation','#our-families','.woven-journey','#traditions','#the-details','#moments','#rsvp','#with-love','.site-footer']){
    const section=page.locator(selector)
    await section.scrollIntoViewIfNeeded()
    const clipped=await section.locator('h1,h2,h3,p,button,a,input:not([type=radio]):not([type=checkbox]),select,textarea').evaluateAll(elements=>elements.filter(e=>!e.closest('[aria-hidden="true"],.sr-only')&&e.getBoundingClientRect().width>0).filter(e=>{const r=e.getBoundingClientRect();return r.left<-.5||r.right>innerWidth+.5}).map(e=>e.className||e.tagName))
    expect(clipped,`${selector} in ${locale}`).toEqual([])
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
   const form=page.locator('.rsvp-form')
   const fontSize=await form.locator('input[name="name"]').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))
   if(width<=760)expect(fontSize).toBeGreaterThanOrEqual(16)
   if(width<=540){
    const name=await form.locator('input[name="name"]').boundingBox(),email=await form.locator('input[name="email"]').boundingBox()
    expect(email!.y).toBeGreaterThan(name!.y+name!.height)
   }
  }
  expect(errors).toEqual([])
 })
}

test('phone dialogs, tabs and reply form remain usable without sending a reply',async({page})=>{
 await page.setViewportSize({width:320,height:568})
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/#our-invitation')
 await page.getByRole('button',{name:'Open the invitation',exact:true}).click()
 await expect(page.locator('.invitation-dialog')).toBeVisible()
 expect(await page.locator('.invitation-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true)
 await page.keyboard.press('Escape')
 await page.getByRole('tab',{name:'Saptapadi',exact:true}).click()
 await expect(page.getByRole('tab',{name:'Saptapadi',exact:true})).toHaveAttribute('aria-selected','true')
 await page.getByRole('button',{name:'Open: An evening wrapped in jasmine'}).click()
 await expect(page.locator('.memory-dialog')).toBeVisible()
 await page.getByRole('button',{name:'Next image',exact:true}).click()
 await expect(page.locator('.memory-dialog h3')).toHaveText('A little letter. So much love.')
 await page.keyboard.press('Escape')
 await page.getByRole('button',{name:'A note from our hearts'}).click()
 await expect(page.locator('.closing-revealed')).toBeVisible()
 await page.locator('.closing-revealed a').click()
 await page.getByLabel('Your name',{exact:true}).fill('Mobile layout check')
 await page.getByLabel('Sending love',{exact:true}).check()
 await expect(page.getByLabel('Guests, including you')).toHaveCount(0)
 await expect(page.getByLabel('A little note (optional)')).toBeVisible()
})
