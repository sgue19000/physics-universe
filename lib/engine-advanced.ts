import type { SimState } from "./sim-state";
import { clamp, rk4 } from "./physics";
import { elasticCollision1D, dragAccel, doublePendulumDeriv, doublePendulumEnergy, nBodyAccel, inclineAccel, rollingEnergies, classicalDoppler, relativisticDoppler, pointField3, wireB, qhoEnergy, qhoPsi, hydrogenMeta, hydrogenDensity, scaleFactor, gyroPrecession, sternGerlachProb, waveDispersion, snell } from "./physics-advanced";
import { defaultCam, project3, type Cam3 } from "./camera3d";
const ORBS = ["1s","2s","2p","3s","3p","3d"];
function cam(s: SimState): Cam3 { if (!s.data.cam) s.data.cam = defaultCam(7); return s.data.cam as Cam3; }
function finite(n: number, fb = 0) { return Number.isFinite(n) ? n : fb; }
export function resetAdvanced(slug: string, s: SimState) {
  const p = s.params;
  if (slug==="elastic-collision") { s.data.x1=-1.6; s.data.x2=1.2; s.data.v1=p.u1; s.data.v2=p.u2; s.data.hit=0; }
  if (slug==="projectile-drag") { s.data.alive=0; s.trail=[]; }
  if (slug==="double-pendulum") { s.data.y=[p.th1*Math.PI/180,p.w1,p.th2*Math.PI/180,0]; s.data.E0=doublePendulumEnergy(s.data.y,{m1:p.m1,m2:p.m2,L1:p.L1,L2:p.L2,g:9.81}).E; s.trail=[]; }
  if (slug==="three-body") { s.data.bodies=[{m:p.m1,x:-1,y:0,z:0,vx:0,vy:0.6*p.speed,vz:0},{m:p.m2,x:1,y:0,z:0,vx:0,vy:-0.5*p.speed,vz:0},{m:p.m3,x:0,y:1.2,z:0,vx:-0.4*p.speed,vy:0,vz:0.15*p.speed}]; s.data.trails=[[],[],[]]; s.data.E0=null; }
  if (slug==="molecular-dynamics") { s.particles=[]; const N=Math.max(4,Math.min(80,Math.floor(p.N||20))); for(let i=0;i<N;i++){ const a=Math.random()*6.28,sp=Math.sqrt(Math.max(40,p.T)/80); s.particles.push({x:0.1+Math.random()*0.8,y:0.1+Math.random()*0.8,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,extra:0}); } }
  if (slug==="stern-gerlach") { s.data.up=0; s.data.down=0; }
  if (slug==="hydrogen-orbitals") s.data.cloud=[];
  if (slug==="expanding-universe") { s.data.gals=[]; for(let i=-2;i<=2;i++) for(let j=-2;j<=2;j++) s.data.gals.push({x:i,y:j,z:0}); }
  if (slug==="gyroscope") s.data.pre=0;
  if (slug==="star-system-3d") s.data.ang=0;
}
export function stepAdvanced(slug: string, s: SimState, dt: number) {
  const p=s.params;
  if (slug==="elastic-collision") {
    s.data.x1=finite(s.data.x1)+finite(s.data.v1)*dt; s.data.x2=finite(s.data.x2)+finite(s.data.v2)*dt;
    if (!s.data.hit && Math.abs(s.data.x2-s.data.x1)<0.36) { const col=elasticCollision1D(p.m1,p.m2,s.data.v1,s.data.v2); s.data.v1=col.v1; s.data.v2=col.v2; s.data.hit=1; s.data.col=col; }
    Object.assign(s.data, s.data.col??elasticCollision1D(p.m1,p.m2,p.u1,p.u2));
  } else if (slug==="projectile-drag") {
    if (!s.data.alive) { const th=p.angle*Math.PI/180; s.data.x=0;s.data.y=0;s.data.vx=p.v0*Math.cos(th);s.data.vy=p.v0*Math.sin(th);s.data.alive=1;s.trail=[]; }
    if (s.data.alive) { const a=dragAccel(s.data.vx,s.data.vy,Math.max(0.02,p.mass),p.cd,p.rho,0.01,p.g); s.data.vx+=a.ax*dt;s.data.vy+=a.ay*dt;s.data.x+=s.data.vx*dt;s.data.y+=s.data.vy*dt; s.trail.push({x:s.data.x,y:s.data.y}); if (s.data.y<0&&s.t>0.05){s.data.alive=0;s.data.rangeDrag=s.data.x;} }
  } else if (slug==="double-pendulum") {
    const spec={m1:Math.max(0.05,p.m1),m2:Math.max(0.05,p.m2),L1:Math.max(0.1,p.L1),L2:Math.max(0.1,p.L2),g:9.81};
    s.data.y=rk4(s.data.y??[1,0,0.2,0],dt,yy=>doublePendulumDeriv(yy,spec)).map((v)=>finite(v));
    const en=doublePendulumEnergy(s.data.y,spec); Object.assign(s.data,en);
    s.data.dE=s.data.E0?(en.E-s.data.E0)/Math.abs(s.data.E0||1):0;
    s.trail.push({x:en.x2,y:en.y2}); if(s.trail.length>300)s.trail.shift();
  } else if (slug==="three-body") {
    const bodies=s.data.bodies; if(!bodies) return;
    const acc=nBodyAccel(bodies,1);
    bodies.forEach((b: {vx:number;vy:number;vz:number;x:number;y:number;z:number;m:number},i:number)=>{ b.vx=finite(b.vx+acc[i].ax*dt); b.vy=finite(b.vy+acc[i].ay*dt); b.vz=finite(b.vz+acc[i].az*dt); b.x=finite(b.x+b.vx*dt); b.y=finite(b.y+b.vy*dt); b.z=finite(b.z+b.vz*dt); });
    s.data.E=bodies.reduce((e:number,b:{m:number;vx:number;vy:number;vz:number})=>e+0.5*b.m*(b.vx**2+b.vy**2+b.vz**2),0);
  } else if (slug==="gyroscope") { const I=0.5*Math.max(0.05,p.mass)*p.radius*p.radius; s.data.L=I*p.spin; s.data.Omega=gyroPrecession(p.spin,p.torque,I); s.data.pre=finite(s.data.pre)+finite(s.data.Omega)*dt; }
  else if (slug==="rolling-motion") { const kind=p.kind<0.5?"slide":p.kind<1.5?"cylinder":"sphere"; s.data.a=inclineAccel(kind,9.81,p.angle); s.data.v=finite(s.data.v)+s.data.a*dt; Object.assign(s.data,rollingEnergies(kind,p.mass,s.data.v,Math.max(0.02,p.R)),{kind}); }
  else if (slug==="wave-surface") { const w=waveDispersion(Math.max(0.2,p.lambda),p.v); s.data.f=w.f;s.data.k=w.k;s.data.omega=w.omega; }
  else if (slug==="doppler-effect") { const c=Math.max(50,p.c); const vs=clamp(p.vs,-c+10,c-10); s.data.fobs=classicalDoppler(p.f0,vs,p.vo,c); s.data.src=finite(s.data.src)+vs*dt*0.02; }
  else if (slug==="electric-field-3d") { const f1=pointField3(-p.sep/2,0,0,p.q1*1e-9,p.probe,0,0); const f2=pointField3(p.sep/2,0,0,p.q2*1e-9,p.probe,0,0); s.data.E=Math.hypot(f1.ex+f2.ex,f1.ey+f2.ey); s.data.V=f1.V+f2.V; }
  else if (slug==="magnetic-wire") { const B=wireB(p.I,0.2,0.05); s.data.B=B.mag; s.data.F=Math.abs(p.q*1.6e-19*p.v*B.mag); }
  else if (slug==="electromagnetic-wave") { s.data.f=299792458/Math.max(0.2,p.lambda); }
  else if (slug==="molecular-dynamics") {
    for (const a of s.particles) { a.x+=a.vx*dt*0.15; a.y+=a.vy*dt*0.15; if(a.x<0.04||a.x>0.96)a.vx*=-1; if(a.y<0.06||a.y>0.94)a.vy*=-1; a.x=clamp(a.x,0.04,0.96); a.y=clamp(a.y,0.06,0.94); }
    s.data.T=s.particles.reduce((k,q)=>k+0.5*(q.vx*q.vx+q.vy*q.vy),0)/Math.max(1,s.particles.length)*160;
  } else if (slug==="maxwell-boltzmann") { const m=Math.max(0.001,p.mass/1000); s.data.vrms=Math.sqrt((3*8.314*p.T)/m); s.data.vp=Math.sqrt((2*8.314*p.T)/m); }
  else if (slug==="ray-tracing-3d") { const den=1/p.f-1/p.s; s.data.sprime=Math.abs(den)<1e-9?1e6:1/den; s.data.M=-s.data.sprime/p.s; s.data.snell=snell(1,p.n2,0.4); }
  else if (slug==="spacetime-explorer") { const b=clamp(p.beta,-0.95,0.95); s.data.gamma=1/Math.sqrt(1-b*b); s.data.tau=s.t/s.data.gamma; }
  else if (slug==="relativistic-doppler") { s.data.fobs=relativisticDoppler(p.f0,p.beta); s.data.z=p.f0/Math.max(1e-6,s.data.fobs)-1; }
  else if (slug==="quantum-harmonic-oscillator") s.data.E=qhoEnergy(p.n,Math.max(0.1,p.omega));
  else if (slug==="hydrogen-orbitals") {
    const name=ORBS[clamp(Math.round(p.orb),0,5)]; s.data.meta=hydrogenMeta(name);
    const cloud=s.data.cloud??[]; const cap=s.params.quality===0?250:s.params.quality===2?900:500;
    if (cloud.length<cap) { for(let k=0;k<24;k++){ const x=(Math.random()-0.5)*16,y=(Math.random()-0.5)*16,z=(Math.random()-0.5)*16; if(hydrogenDensity(name,x,y,z)>p.thresh*(0.2+Math.random())) cloud.push({x,y,z}); } s.data.cloud=cloud.slice(-cap); }
  } else if (slug==="stern-gerlach") { const pr=sternGerlachProb(p.theta); s.data.P=pr.up; if(Math.random()<0.08*p.shots){ if(Math.random()<pr.up)s.data.up++; else s.data.down++; } }
  else if (slug==="star-system-3d") { s.data.T=Math.sqrt(4*Math.PI*Math.PI/Math.max(0.2,p.M)); s.data.ang=finite(s.data.ang)+(2*Math.PI/s.data.T)*dt*p.speed; }
  else if (slug==="gravitational-lensing") { s.data.rs=(2*6.6743e-11*p.M*1.989e30)/(299792458**2); s.data.rph=1.5*s.data.rs; }
  else if (slug==="expanding-universe") { s.data.a=scaleFactor(p.H0,p.t); s.data.z=1/Math.max(1e-6,s.data.a)-1; }
}
export function measureAdvanced(slug: string, s: SimState) {
  const d=s.data; const f=(n:number)=>!Number.isFinite(n)?"—":Number(n).toPrecision(4);
  const map: Record<string,{k:string;v:string}[]> = {
    "elastic-collision":[{k:"p error",v:`${f((d.pErr??0)*100)}%`},{k:"K error",v:`${f((d.kErr??0)*100)}%`},{k:"p before",v:f(d.p0)},{k:"p after",v:f(d.p1)}],
    "projectile-drag":[{k:"range drag",v:f(d.rangeDrag??d.x)}],
    "double-pendulum":[{k:"E",v:f(d.E)},{k:"energy error",v:`${f((d.dE??0)*100)}%`}],
    "three-body":[{k:"E",v:f(d.E)}],
    "gyroscope":[{k:"Omega",v:f(d.Omega)},{k:"L",v:f(d.L)}],
    "rolling-motion":[{k:"a",v:f(d.a)},{k:"K rot",v:f(d.Kr)}],
    "wave-surface":[{k:"f",v:f(d.f)}],
    "doppler-effect":[{k:"f_obs",v:f(d.fobs)}],
    "electric-field-3d":[{k:"|E|",v:f(d.E)},{k:"V",v:f(d.V)}],
    "magnetic-wire":[{k:"|B|",v:f(d.B)}],
    "electromagnetic-wave":[{k:"f",v:f(d.f)}],
    "molecular-dynamics":[{k:"T est",v:f(d.T)}],
    "maxwell-boltzmann":[{k:"v_rms",v:f(d.vrms)}],
    "ray-tracing-3d":[{k:"s'",v:f(d.sprime)}],
    "spacetime-explorer":[{k:"gamma",v:f(d.gamma)}],
    "relativistic-doppler":[{k:"f'",v:f(d.fobs)},{k:"z",v:f(d.z)}],
    "quantum-harmonic-oscillator":[{k:"E",v:f(d.E)}],
    "hydrogen-orbitals":[{k:"n",v:`${d.meta?.n??""}`},{k:"l",v:`${d.meta?.l??""}`}],
    "stern-gerlach":[{k:"up",v:`${d.up??0}`},{k:"down",v:`${d.down??0}`},{k:"P",v:f(d.P)}],
    "star-system-3d":[{k:"T",v:f(d.T)}],
    "gravitational-lensing":[{k:"rs km",v:f((d.rs??0)/1000)}],
    "expanding-universe":[{k:"a",v:f(d.a)}],
  };
  return map[slug]??[];
}
export { drawAdvanced } from "./engine-draw-advanced";
