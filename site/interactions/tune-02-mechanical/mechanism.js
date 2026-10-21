(() => {
'use strict';
const G=window.TUNE_GEOMETRY,stage=document.querySelector('#stage'),canvas=document.querySelector('#art'),ctx=canvas.getContext('2d'),cursor=document.querySelector('#cursor');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),TAU=Math.PI*2;
let W=innerWidth,H=innerHeight,S=1,OX=0,OY=0,dpr=1,elapsed=0,last=0,paused=reduced.matches,drag=null,hover=null,focused=null,pointer={x:-100,y:-100},interacted=false,audio=null,muted=true,voice=null,lastClick=0;
const names={T:['upper left','upper right','lower'],U:['upper left','lower left','upper right','lower right'],N:['upper left','lower left','upper right','lower right'],E:['upper left','lower left','upper right','middle right','lower right']};
const targets=[.21,.245,.22,-.23],SNAP=.09,MAX_TILT=.28;
let index=0;
const letters=G.letters.map((g,li)=>{const l={...g,path:new Path2D(g.d)};l.noCircles=new Path2D();l.noCircles.rect(-1000,-1000,3000,3000);g.nodes.forEach((n,ni)=>{n.radius=g.letter==='T'?132:ni<2?162:101;l.noCircles.moveTo(n.x+n.radius,n.y);l.noCircles.arc(n.x,n.y,n.radius,0,TAU);});l.parts=g.nodes.map((n,ni)=>{
 const hub=new Path2D();hub.arc(n.x,n.y,n.radius,0,TAU);const path=new Path2D();n.poly.forEach(([x,y],i)=>i?path.lineTo(x,y):path.moveTo(x,y));path.closePath();
 const b=document.createElement('button');b.className='joint';b.setAttribute('role','slider');b.setAttribute('aria-label',g.letter+' '+names[g.letter][ni]+' screw');b.setAttribute('aria-valuemin','-17');b.setAttribute('aria-valuemax','17');b.setAttribute('aria-valuenow','0');b.setAttribute('aria-valuetext','Aligned. Arrow keys turn; Home aligns.');stage.appendChild(b);
 const p={...n,hub,clip:path,a:0,v:0,target:ni===0?targets[li]:0,delay:3+li*26,locked:false,index:index++,letter:l,ni,button:b,sx:0,sy:0,worldAngle:0,hold:0};
 b.addEventListener('focus',()=>{focused=p;});b.addEventListener('blur',()=>{focused=null;});b.addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','Enter',' '].includes(e.key))return;
 e.preventDefault();const root=p.letter.parts[0];interacted=true;root.locked=false;
 const dir=['ArrowLeft','ArrowDown'].includes(e.key)?-1:1;
 root.a=['Home','Enter',' '].includes(e.key)?0:Math.max(-MAX_TILT,Math.min(MAX_TILT,root.a+dir*(e.shiftKey?.035:.018)));
 root.v=0;root.hold=elapsed+12;settle(root);
 });
 return p;
 });return l;});
const parts=letters.flatMap(l=>l.parts),roots=letters.map(l=>l.parts[0]);
function resize(){W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);S=Math.min(W*(W<600?.86:.59)/G.width,760/G.width,H*.23/700);OX=(W-G.width*S)/2;OY=H*.49-350*S;updatePositions();}
function rotate(x,y,a){return{x:x*Math.cos(a)-y*Math.sin(a),y:x*Math.sin(a)+y*Math.cos(a)};}
function updatePositions(){for(const l of letters){const root=l.parts[0];for(const p of l.parts){const v=rotate(p.x-root.x,p.y-root.y,root.a);p.sx=OX+(l.x+root.x+v.x)*S;p.sy=OY+(root.y+v.y)*S;p.worldAngle=root.a;p.button.style.left=p.sx+'px';p.button.style.top=p.sy+'px';}}}
function transformLetter(l){const r=l.parts[0];ctx.translate(l.x+r.x,r.y);ctx.rotate(r.a);ctx.translate(-r.x,-r.y);}
function drawGlyph(l){ctx.save();ctx.translate(0,700);ctx.scale(1,-1);ctx.fill(l.path);ctx.restore();}
function render(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(OX,OY);ctx.scale(S,S);
 if(drag){ctx.fillStyle='rgba(25,25,25,.065)';for(const l of letters){ctx.save();ctx.translate(l.x,0);drawGlyph(l);ctx.restore();}}
 ctx.fillStyle='#222';for(const l of letters){ctx.save();transformLetter(l);drawGlyph(l);ctx.restore();}ctx.restore();
 const chosen=drag?.knob||hover||focused;if(chosen){const p=chosen;ctx.save();ctx.translate(p.sx,p.sy);ctx.rotate(p.worldAngle);ctx.strokeStyle='#333';ctx.lineWidth=1;const size=Math.max(3.2,S*15);ctx.beginPath();ctx.moveTo(-size,0);ctx.lineTo(size,0);ctx.stroke();ctx.restore();if(drag||focused){const radius=Math.max(26,S*180);ctx.save();ctx.translate(p.sx,p.sy);ctx.strokeStyle='#d9d9d9';ctx.lineWidth=.8;ctx.setLineDash([2,5]);ctx.beginPath();ctx.arc(0,0,radius,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#aaa';ctx.beginPath();ctx.moveTo(0,-radius-4);ctx.lineTo(0,-radius+4);ctx.stroke();ctx.rotate(p.letter.parts[0].a);ctx.strokeStyle='#222';ctx.beginPath();ctx.moveTo(0,-radius-3);ctx.lineTo(0,-radius+3);ctx.stroke();ctx.restore();}}
}
function soundStart(){if(muted)return;try{if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();audio.resume();}catch{muted=true;document.querySelector('#sound').textContent='Sound unavailable';}}
function tone(p){if(!audio||muted)return;stopVoice();const gain=audio.createGain(),base=[220,261.63,329.63,392][letters.indexOf(p.letter)];gain.gain.setValueAtTime(0,audio.currentTime);gain.gain.linearRampToValueAtTime(.023,audio.currentTime+.05);gain.connect(audio.destination);const a=audio.createOscillator(),b=audio.createOscillator();a.type='sine';b.type='sine';a.frequency.value=base;b.frequency.value=base*Math.pow(2,p.a*.14);a.connect(gain);b.connect(gain);a.start();b.start();voice={a,b,gain,base};}
function stopVoice(){if(!voice)return;const v=voice;voice=null;v.gain.gain.setTargetAtTime(0,audio.currentTime,.025);v.a.stop(audio.currentTime+.18);v.b.stop(audio.currentTime+.18);}
function tick(p){if(!audio||muted||audio.currentTime-lastClick<.08)return;lastClick=audio.currentTime;const o=audio.createOscillator(),g=audio.createGain();o.frequency.setValueAtTime(p.locked?880:1800,audio.currentTime);g.gain.setValueAtTime(.015,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.08);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.09);}
function settle(p){if(Math.abs(p.a)<=SNAP){p.a=0;p.v=0;p.locked=true;tick(p);document.querySelector('#announcement').textContent=p.letter.letter+' aligned. It will stay in place.';return true;}return false;}
function closest(x,y){let best=null,distance=Infinity;for(const p of parts){const d=Math.hypot(x-p.sx,y-p.sy);const radius=Math.max(W<600?23:27,(p.ni===0?155:105)*S);if(d<radius&&d<distance){best=p;distance=d;}}return best;}
function cursorAt(e){pointer={x:e.clientX,y:e.clientY};const inside=e.target===canvas||stage.contains(e.target);const show=e.pointerType!=='touch'&&inside;document.body.classList.toggle('tool',show);cursor.style.display=show?'block':'none';const turn=drag?drag.part.a-drag.startA:0;cursor.style.transform=`translate(${pointer.x-3}px,${pointer.y-44}px) rotate(${turn}rad)`;}
window.addEventListener('pointermove',e=>{
 cursorAt(e);if(!drag){hover=closest(e.clientX,e.clientY);return;}if(e.pointerId!==drag.id)return;
 const p=drag.part,dx=e.clientX-drag.cx,dy=e.clientY-drag.cy,d=Math.hypot(dx,dy);
 drag.travel=Math.max(drag.travel,Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY));
 if(drag.mode==='linear'){p.a=drag.startA+(e.clientX-drag.startX)*.003;}
 else if(d>12){const a=Math.atan2(dy,dx);let delta=a-drag.lastAngle;if(delta>Math.PI)delta-=TAU;if(delta<-Math.PI)delta+=TAU;p.a+=delta*.55;drag.lastAngle=a;}
 p.a=Math.max(-MAX_TILT,Math.min(MAX_TILT,p.a));p.v=0;
 if(voice)voice.b.frequency.setTargetAtTime(voice.base*Math.pow(2,p.a*.14),audio.currentTime,.025);
 if(Math.floor(p.a*60)!==drag.step){drag.step=Math.floor(p.a*60);tick(p);}
 
});
stage.addEventListener('pointerdown',e=>{
 if(e.button!==0||drag)return;const knob=closest(e.clientX,e.clientY);if(!knob)return;
 e.preventDefault();const p=knob.letter.parts[0];interacted=true;p.locked=false;p.v=0;soundStart();tone(p);
 const d=Math.hypot(e.clientX-knob.sx,e.clientY-knob.sy);
 drag={part:p,knob,id:e.pointerId,startA:p.a,startX:e.clientX,startY:e.clientY,travel:0,cx:knob.sx,cy:knob.sy,lastAngle:Math.atan2(e.clientY-knob.sy,e.clientX-knob.sx),mode:d<14?'linear':'orbit',step:Math.floor(p.a*60)};
 stage.setPointerCapture(e.pointerId);knob.button.focus({preventScroll:true});
});
function release(e){
 if(!drag||e.pointerId!==drag.id)return;const p=drag.part;p.hold=elapsed+12;
 if(e.type!=='pointercancel'&&drag.travel<7){p.locked=true;p.v=0;tick(p);document.querySelector('#announcement').textContent=p.letter.letter+' is settling into place.';}
 else settle(p);
 drag=null;stopVoice();if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);
 
}
stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',e=>{if(drag)release(e);});window.addEventListener('blur',()=>{if(drag)release({pointerId:drag.id});cursor.style.display='none';});document.addEventListener('pointerleave',()=>{cursor.style.display='none';hover=null;});
function syncPause(){document.querySelector('#pause').textContent=paused?'Resume':'Pause';document.querySelector('#pause').setAttribute('aria-pressed',String(paused));}
document.querySelector('#pause').addEventListener('click',()=>{paused=!paused;syncPause();});
function replay(){if(drag)release({pointerId:drag.id});for(const p of parts){p.a=0;p.v=0;p.locked=false;p.hold=0;}elapsed=0;interacted=false;paused=reduced.matches;syncPause();}
document.querySelector('#replay').addEventListener('click',replay);
document.querySelector('#reset').addEventListener('click',()=>{if(drag)release({pointerId:drag.id,type:'pointercancel'});for(const p of roots){p.a=0;p.v=0;p.locked=true;}stopVoice();document.querySelector('#announcement').textContent='All four letters restored.';});window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r'&&!e.ctrlKey&&!e.metaKey&&!e.altKey)replay();});
document.querySelector('#sound').addEventListener('click',()=>{muted=!muted;if(!muted)soundStart();else stopVoice();document.querySelector('#sound').textContent=muted?'Sound off':'Sound on';document.querySelector('#sound').setAttribute('aria-pressed',String(!muted));});
reduced.addEventListener('change',e=>{if(e.matches){paused=true;syncPause();}});document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden&&drag)release({pointerId:drag.id});});window.addEventListener('resize',resize);
let readoutTime=0;
function frame(time){const dt=last?Math.min((time-last)/1000,.035):0;last=time;if(!paused&&!document.hidden&&!drag)elapsed+=dt;
 for(const p of roots){
  if(drag?.part===p)continue;
  if(p.locked){p.a*=Math.exp(-12*dt);if(Math.abs(p.a)<.0001)p.a=0;p.v=0;continue;}
  if(paused||drag||elapsed<p.hold)continue;
  const age=Math.max(0,elapsed-p.delay),t=Math.min(1,age/16),ease=t*t*(3-2*t),target=p.target*ease;
  p.v+=(target-p.a)*1.5*dt;p.v*=Math.exp(-2.5*dt);p.a=Math.max(-MAX_TILT,Math.min(MAX_TILT,p.a+p.v*dt));
 }
 updatePositions();render();if(time-readoutTime>120){
  readoutTime=time;
  
  for(const p of parts){const r=p.letter.parts[0];p.button.setAttribute('aria-valuenow',String(Math.round(r.a*180/Math.PI)));p.button.setAttribute('aria-valuetext',Math.abs(r.a)<.012?'Aligned.':Math.round(r.a*180/Math.PI)+' degrees. Tap or press Enter to straighten this letter.');}
 }
 requestAnimationFrame(frame);
}
window.tuneMechanism={get state(){return{elapsed,paused,dragging:!!drag,locked:roots.filter(p=>p.locked).length,joints:parts.map(p=>({letter:p.letter.letter,index:p.index,x:p.sx,y:p.sy,angle:p.letter.parts[0].a,locked:p.letter.parts[0].locked}))};}};
resize();syncPause();requestAnimationFrame(frame);
})();
