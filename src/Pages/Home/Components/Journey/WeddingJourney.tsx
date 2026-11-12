import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'
import { wedding } from '@shared/wedding'
import { weddingJourney } from '@shared/journey'
import type { Locale, WeddingEvent } from '@shared/wedding'
import { translator, safeMediaUrl, eventDateLabel, eventTimeLabel } from '@/lib/content'
import { buildJourneyLayout } from './journeyGeometry'
import { createJourneyWalk, journeyStridePose } from './journeyWalk'
import { Lotus, Sun } from '@/Components/Decorations/Ornaments'
import './WeddingJourney.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function FootprintSymbol({id}:{id:string}) {
  return <svg className="journey-symbols" aria-hidden="true"><defs><symbol id={id} viewBox="0 0 36 76">
    <g fill="#a83b39" stroke="#d5a149" strokeWidth=".65">
      <path d="M22 19C29 19 32 24 30 31C29 37 23 41 22 47C21 54 26 59 25 64C24 71 12 74 8 68C3 61 6 53 8 46C11 36 5 32 7 26C9 21 16 21 22 19Z"/>
      <ellipse cx="25" cy="9" rx="5.4" ry="7"/><ellipse cx="15" cy="9" rx="3.8" ry="5.1"/><ellipse cx="8" cy="15" rx="3.1" ry="4.3"/><ellipse cx="4.3" cy="23" rx="2.6" ry="3.7"/><ellipse cx="3" cy="31" rx="2.2" ry="3.2"/>
    </g>
    <g fill="none" stroke="#edc276" strokeWidth=".6"><path d="M22 23C27 23 28 27 26 32C24 37 19 41 18 47C17 54 22 59 21 64C20 68 13 69 11 65C8 59 12 52 13 46C15 36 9 31 11 27C13 24 18 25 22 23Z"/><circle cx="19" cy="30" r="4.5"/><circle cx="16" cy="61" r="4"/><path d="M19 24v12m-6-6h12m-10-4 8 8m0-8-8 8M16 56v10m-5-5h10M14 40l5 3-5 3 5 3-5 3"/></g>
  </symbol></defs></svg>
}

function Footprint({id,foot}:{id:string;foot:'left'|'right'}) {
  return <svg viewBox="0 0 36 76"><g transform="rotate(180 18 38)"><use href={`#${id}`} transform={foot==='right'?'translate(36 0) scale(-1 1)':undefined}/></g></svg>
}

export function WeddingJourney({locale,active,paused,onCalendar}:{locale:Locale;active:boolean;paused:boolean;onCalendar:(event:WeddingEvent)=>void}) {
  const t=translator(locale)
  const root=useRef<HTMLElement>(null),route=useRef<HTMLDivElement>(null)
  const footId=`journey-foot-${useId().replace(/:/g,'')}`
  const [width,setWidth]=useState(1000)
  const events=weddingJourney
  const layout=useMemo(()=>buildJourneyLayout(width,events.length),[width,events.length])

  useLayoutEffect(()=>{
    const element=route.current
    if(!element)return
    const measure=()=>{const next=Math.round(element.getBoundingClientRect().width);if(next)setWidth(previous=>previous===next?previous:next)}
    measure()
    const observer=new ResizeObserver(measure);observer.observe(element)
    return()=>observer.disconnect()
  },[])

  useGSAP(()=>{
    const element=root.current
    if(!element||!active||paused){if(element)element.dataset.journeyMotion='static';return}
    const media=gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      element.dataset.journeyMotion='scroll'
      const stamps=[...element.querySelectorAll<SVGElement>('.journey-step > svg')]
      const feet=[...element.querySelectorAll<HTMLElement>('.journey-moving-foot')]
      const walk=createJourneyWalk(stamps.length)
      const contacts=new Float32Array(stamps.length)
      const airborne=new Uint8Array(stamps.length)
      let frame=0,last=0,disposed=false,needsSync=true,scrollSpeed=0
      const paint=(dt:number)=>{
        const state=walk.advance(dt)
        contacts.fill(0);airborne.fill(0)
        for(const moving of state.strides){
          const pose=journeyStridePose(layout.steps,moving.index,moving.age,layout.stride)
          contacts[moving.index]=pose.contact
          airborne[moving.index]=1
          const foot=feet[moving.index]
          foot.style.opacity=String(pose.opacity)
          foot.style.transform=`translate3d(${pose.x}px,${pose.y}px,0) rotate(${pose.angle}deg) scale(${pose.scale},${pose.scale*pose.roll})`
        }
        stamps.forEach((stamp,i)=>{
          const contact=i<state.planted?1:contacts[i]
          const opacity=String(contact*.94)
          const transform=contact>0&&contact<1?`scaleY(${.82+.18*contact})`:'none'
          if(stamp.style.opacity!==opacity)stamp.style.opacity=opacity
          if(stamp.style.transform!==transform)stamp.style.transform=transform
          if(!airborne[i]&&feet[i].style.opacity!=='0')feet[i].style.opacity='0'
        })
        return state.moving
      }
      const tick=(now:number)=>{
        frame=0
        if(disposed||document.hidden){last=0;return}
        // Coalesce wheel/Lenis/ScrollTrigger notifications into one read followed
        // by one render per display frame. Never paint directly from a scroll event.
        if(needsSync){
          const top=route.current!.getBoundingClientRect().top
          let visible=0
          while(visible<layout.steps.length&&layout.steps[visible].y<=innerHeight*.78-top)visible++
          walk.seek(visible,scrollSpeed)
          needsSync=false
        }
        const moving=paint(last?(now-last)/1000:0)
        last=moving?now:0
        if(moving)frame=requestAnimationFrame(tick)
      }
      const sync=(speed=0)=>{
        if(disposed)return
        scrollSpeed=speed;needsSync=true
        if(!frame&&!document.hidden)frame=requestAnimationFrame(tick)
      }
      const visibility=()=>{
        cancelAnimationFrame(frame);frame=0;last=0
        if(!document.hidden)sync()
      }
      ScrollTrigger.create({trigger:route.current,start:'top bottom',end:'bottom top',onUpdate:trigger=>sync(trigger.getVelocity()),onRefresh:()=>sync()})
      document.addEventListener('visibilitychange',visibility)
      paint(0)
      sync()
      // Keep completed reveal triggers until context cleanup. Removing once-only
      // triggers during a locale/resize refresh can invalidate GSAP's traversal.
      gsap.from('.journey-heading > *',{opacity:0,y:8,stagger:.09,duration:.9,ease:'sine.inOut',scrollTrigger:{trigger:'.journey-heading',start:'top 90%',toggleActions:'play none none none'}})
      element.querySelectorAll<HTMLElement>('.journey-stop').forEach(stop=>{
        const entrance=gsap.timeline({scrollTrigger:{trigger:stop.querySelector('.journey-caption'),start:'top 92%',toggleActions:'play none none none'},defaults:{ease:'sine.inOut',force3D:true}})
        entrance.from(stop.querySelector('.journey-ceremony-art'),{opacity:0,scale:.96,duration:.8},0)
          .from(stop.querySelectorAll('.journey-caption > *'),{opacity:0,y:8,duration:.75,stagger:.07},.08)
      })
      gsap.from('.journey-end > *',{opacity:0,y:8,duration:.85,stagger:.08,ease:'sine.inOut',scrollTrigger:{trigger:'.journey-end',start:'top 92%',toggleActions:'play none none none'}})
      void document.fonts.ready.then(()=>{if(!disposed)ScrollTrigger.refresh()})
      return()=>{
        disposed=true;cancelAnimationFrame(frame)
        document.removeEventListener('visibilitychange',visibility)
        stamps.forEach(stamp=>{stamp.style.removeProperty('opacity');stamp.style.removeProperty('transform')})
        feet.forEach(foot=>{foot.style.opacity='0'})
        element.dataset.journeyMotion='static'
      }
    })
    media.add('(prefers-reduced-motion: reduce)',()=>{element.dataset.journeyMotion='static'})
    return()=>media.revert()
  },{scope:root,dependencies:[active,paused,locale,layout],revertOnUpdate:true})

  function focusStop(stop:HTMLLIElement) {
    gsap.to(stop.querySelectorAll('.journey-caption > *, .journey-ceremony-art'),{opacity:1,y:0,scale:1,duration:.15,overwrite:'auto'})
  }

  return <section id="celebrations" className="wedding-journey" ref={root} aria-labelledby="celebrations-title">
    <FootprintSymbol id={footId}/>
    <div className="couple-border journey-border" aria-hidden="true"><i/><i/><i/><i/></div>
    {['tl','tr','bl','br'].map(corner=><div className={`couple-corner-seal couple-seal-${corner} journey-seal`} aria-hidden="true" key={corner}><Sun/></div>)}
    <header className="journey-heading"><span className="journey-eyebrow">{t('ONE STEP CLOSER TO FOREVER','కలిసి కొత్త జీవితానికి')}</span><h2 id="celebrations-title">{t('The Wedding Journey','మా వివాహ ప్రయాణం')}</h2><p>{t('Walk with us, celebration by celebration,','వేడుక నుంచి వేడుకకు, మాతో కలిసి నడవండి,')}<br/>{t('to the sacred hour.','శుభ ముహూర్తం వైపు.')}</p><div className="journey-heading-rule" aria-hidden="true"><i/><Lotus/><i/></div></header>
    <nav className="journey-chapters" aria-label={t('Explore the celebrations','వేడుకలను చూడండి')}>{events.map((moment,i)=><a key={moment.id} href={`#event-${moment.id}`}><span>{String(i+1).padStart(2,'0')}</span>{moment.title[locale]}</a>)}</nav>
    <div className="journey-route" ref={route} style={{height:layout.height}}>
      <div className="journey-footsteps" aria-hidden="true">{layout.steps.map((step,i)=><span className="journey-step" key={i} data-foot={step.foot} style={{left:step.x,top:step.y,rotate:`${step.angle}deg`}}><Footprint id={footId} foot={step.foot}/></span>)}{layout.steps.map((step,i)=><span className="journey-moving-foot" data-foot={step.foot} data-step={i} key={i}><Footprint id={footId} foot={step.foot}/></span>)}</div>
      <ol className="journey-stops" aria-label={t('Wedding celebrations in order','వివాహ వేడుకల క్రమం')}>
        {events.map((moment,i)=>{
          const node=layout.nodes[i]
          const event=moment.event
          const timestamp=event?.startsAt
          const map=safeMediaUrl(event?.mapsUrl)
          return <li className={`journey-stop journey-stop-${node.side}`} key={moment.id} style={{top:node.y}} onFocusCapture={e=>focusStop(e.currentTarget)} data-event={moment.id}>
            <div className="journey-ceremony-art" style={{left:node.x}} aria-hidden="true"><span className="journey-event-number">{String(i+1).padStart(2,'0')}</span><img src={moment.artwork} srcSet={`${moment.artwork.replace('.webp','-small.webp')} 256w, ${moment.artwork} 512w`} sizes="(max-width: 840px) 100px, 176px" alt="" width="512" height="512" loading="lazy" decoding="async"/></div>
            <div className="journey-caption" id={`event-${moment.id}`} tabIndex={-1} style={{left:node.cardX,width:node.cardWidth}}><span className="journey-event-subtitle">{moment.subtitle[locale]}</span><h3>{moment.title[locale]}</h3>
              {!event&&<p className="journey-event-description">{moment.description[locale]}</p>}
              {timestamp&&<p className="journey-event-date"><time dateTime={timestamp}><span>{eventDateLabel(timestamp,locale)}</span><strong>{eventTimeLabel(timestamp,locale)}{moment.id==='reception'&&t(' onwards',' నుండి')}</strong></time></p>}
              {event&&<><p className="journey-event-location">{wedding.venue.name[locale]}</p><p className="journey-hospitality">{event.hospitality?.[locale]}</p></>}
              {!event&&<small className="journey-timing-note">{moment.id==='mangalya-dharanam'?t('Following the Muhurtham','సుముహూర్తం అనంతరం'):t('Ritual timing to be shared','కార్యక్రమ సమయం త్వరలో')}</small>}
              {event&&<div className="journey-event-actions">{map&&<a href={map} target="_blank" rel="noopener noreferrer"><MapPin size={12}/>{t('View map','మ్యాప్ చూడండి')}<ArrowUpRight size={12}/></a>}{event.startsAt&&event.status==='confirmed'&&<button onClick={()=>onCalendar(event)}><CalendarDays size={12}/>{t('Add to calendar','క్యాలెండర్‌లో చేర్చండి')}</button>}</div>}
            </div>
          </li>
        })}
      </ol>
    </div>
    <footer className="journey-end"><Lotus/><p>{t('Every step, together.','ప్రతి అడుగులో, ఒకరికొకరం.')}</p><small>{wedding.overnightNote[locale]}</small><a href="#the-details">{t('Meet us at the venue','వేదిక వివరాలు')}<ArrowDown size={15}/></a></footer>
  </section>
}
