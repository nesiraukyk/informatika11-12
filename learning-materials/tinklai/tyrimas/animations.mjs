export function animateNetwork(svg,state,result,speed=1){
 let frame=0,cancelled=false,start;const ns='http://www.w3.org/2000/svg',layer=svg.querySelector('.flow-layer');
 if(!layer||result.path.length<2)return ()=>{};
 const points=result.path.map(id=>state.devices.find(d=>d.id===id)).filter(Boolean);
 const dot=document.createElementNS(ns,'circle');dot.setAttribute('r','7');dot.setAttribute('class',result.ok?'traveller':'traveller fault');layer.append(dot);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function draw(time){if(cancelled)return;start??=time;const progress=reduced?points.length-1:(time-start)/(700/speed),segment=Math.min(points.length-2,Math.floor(progress)),t=Math.min(1,progress-segment),a=points[segment],b=points[segment+1];dot.setAttribute('cx',a.x+(b.x-a.x)*t);dot.setAttribute('cy',a.y+(b.y-a.y)*t);if(progress<points.length-1)frame=requestAnimationFrame(draw);else dot.remove()}
 frame=requestAnimationFrame(draw);return ()=>{cancelled=true;cancelAnimationFrame(frame);dot.remove()};
}
