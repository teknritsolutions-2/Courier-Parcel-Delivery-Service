'use strict';
(()=>{
 const shell=document.querySelector('.globe-shell');if(!shell)return;
 const stage=shell.querySelector('.globe-stage'),info=shell.querySelector('[data-route-label]'),cityInfo=shell.querySelector('[data-city-info]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let globe=null,selected=0,rotating=false,ready=false,watchdog;
 const path= document.body.dataset.page==='home'?'assets/':'../assets/';
 const fallback=()=>{shell.classList.remove('globe-ready');stage.replaceChildren();const p=shell.querySelector('.globe-fallback p');if(p)p.textContent='Explore the sample routes below. Interactive Earth is unavailable on this device.';shell.querySelectorAll('.globe-controls button').forEach(b=>b.disabled=true);};
 function inspectCity(d){cityInfo.textContent=`${d.name} · ${d.lat.toFixed(2)}° N, ${d.lng.toFixed(2)}° E`;if(globe){globe.controls().autoRotate=false;rotating=false;syncRotation();globe.labelsData([d]);globe.pointOfView({lat:d.lat,lng:d.lng,altitude:1.6},reduced.matches?0:600);}}
 shell.querySelector('[data-globe-city]').addEventListener('change',e=>{const city=Arcway.city(e.target.value);if(city)inspectCity(city);});
 const update=(id)=>{rotating=false;if(globe)globe.controls().autoRotate=false;syncRotation();selected=Number(id);const r=Arcway.routes[selected];document.querySelectorAll('[data-route]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.route)===selected)));info.textContent=Arcway.city(r.origin).name+' → '+Arcway.city(r.destination).name;if(globe){globe.arcColor(d=>d.id===selected?'#ff996c':'#ac644a').arcStroke(d=>d.id===selected?.65:.25).arcDashLength(d=>d.id===selected&&!reduced.matches?.55:1).arcDashGap(d=>d.id===selected&&!reduced.matches?.4:0).arcDashAnimateTime(reduced.matches?0:3800);globe.labelsData([Arcway.city(r.origin),Arcway.city(r.destination)]);globe.pointOfView({lat:22,lng:79,altitude:2.05},reduced.matches?0:700);}};
 document.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>{update(b.dataset.route);if(globe)globe.controls().autoRotate=false;}));update(0);
 const load=()=>new Promise((resolve,reject)=>{if(window.Globe)return resolve();const script=document.createElement('script');script.src=path+'vendor/globe.gl-2.46.2.min.js';script.onload=resolve;script.onerror=reject;document.head.append(script);});
 async function init(){
  try{
   const canvas=document.createElement('canvas');if(!canvas.getContext('webgl2'))return fallback();
   await load();
   globe=new Globe(stage,{animateIn:false,rendererConfig:{antialias:devicePixelRatio<2,alpha:true},onGlobeReady:()=>{}})
    .width(shell.clientWidth).height(shell.clientHeight).backgroundColor('rgba(0,0,0,0)')
    .globeImageUrl(path+'images/earth-blue-marble.jpg').showAtmosphere(true).atmosphereColor('#6f9cae').atmosphereAltitude(.12)
    .pointsData(Arcway.cities).pointLat('lat').pointLng('lng').pointAltitude(.009).pointRadius(.32).pointColor(()=> '#ffa878').pointLabel(d=>`${d.name}, ${d.state}`).onPointClick(inspectCity)
    .labelsData([Arcway.city('hyderabad'),Arcway.city('mumbai')]).labelLat('lat').labelLng('lng').labelText('name').labelSize(innerWidth<600?2.1:1.65).labelDotRadius(.25).labelDotOrientation(d=>d.id==='mumbai'||d.id==='bengaluru'||d.id==='kochi'?'right':'left').labelColor(()=> '#fff0e5').labelAltitude(.02).labelResolution(2).labelRotation(d=>d.id==='hyderabad'?-10:0)
    .arcsData(Arcway.routes).arcStartLat('startLat').arcStartLng('startLng').arcEndLat('endLat').arcEndLng('endLng').arcAltitude(.055).arcCurveResolution(40).arcsTransitionDuration(0).onArcClick(r=>update(r.id));
   globe.renderer().setPixelRatio(Math.min(devicePixelRatio,1.5));
   globe.pointOfView({lat:22,lng:79,altitude:2.05});
   globe.controls().enableZoom=false;globe.controls().enablePan=false;globe.controls().autoRotate=false;globe.controls().autoRotateSpeed=.1;
   globe.controls().addEventListener('start',()=>{rotating=false;globe.controls().autoRotate=false;syncRotation();});
   update(0);
   const texture=new Image();texture.onload=()=>{ready=true;clearTimeout(watchdog);shell.classList.add('globe-ready');};texture.onerror=fallback;texture.src=path+'images/earth-blue-marble.jpg';watchdog=setTimeout(()=>{if(!ready)fallback();},15000);
   const resize=new ResizeObserver(()=>{if(globe)globe.width(shell.clientWidth).height(shell.clientHeight);});resize.observe(shell);
   const visibility=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting&&!document.hidden)globe.resumeAnimation();else globe.pauseAnimation();});},{threshold:.05});visibility.observe(shell);
   const onVisibility=()=>{if(document.hidden)globe.pauseAnimation();else if(shell.getBoundingClientRect().bottom>0)globe.resumeAnimation();};document.addEventListener('visibilitychange',onVisibility);
   stage.querySelector('canvas')?.addEventListener('webglcontextlost',e=>{e.preventDefault();globe.pauseAnimation();fallback();});
   window.addEventListener('pageshow',event=>{if(event.persisted)globe.resumeAnimation();});
   window.addEventListener('pagehide',event=>{if(event.persisted){globe.pauseAnimation();return;}clearTimeout(watchdog);resize.disconnect();visibility.disconnect();document.removeEventListener('visibilitychange',onVisibility);globe._destructor();});
   reduced.addEventListener('change',()=>{rotating=false;globe.controls().autoRotate=false;update(selected);syncRotation();});
  }catch(error){console.warn('Earth fallback:',error.message);fallback();}
 }
 function syncRotation(){const b=shell.querySelector('[data-globe-rotate]');b.setAttribute('aria-pressed',String(rotating));b.setAttribute('aria-label',rotating?'Pause Earth rotation':'Start slow Earth rotation');}
 shell.querySelector('[data-globe-reset]').addEventListener('click',()=>{if(!globe)return;rotating=false;globe.controls().autoRotate=false;cityInfo.textContent='Illustrative network · Drag to explore';syncRotation();update(0);});
 shell.querySelector('[data-globe-rotate]').addEventListener('click',()=>{if(!globe)return;if(reduced.matches){Arcway.toast('Automatic rotation is disabled by your reduced-motion preference. Drag to explore or choose a route.');return;}rotating=!rotating;globe.controls().autoRotate=rotating;syncRotation();});
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();init();}},{rootMargin:'100px'});observer.observe(shell);
})();
