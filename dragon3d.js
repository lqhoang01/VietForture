// Dragon 3D (ESM) — external file to avoid inline-module caching issues on GitHub Pages
// Usage in index.html (before </body>):
// <script type="module" src="dragon3d.js?v=2"></script>

import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { SVGLoader } from 'https://unpkg.com/three@0.161.0/examples/jsm/loaders/SVGLoader.js';

const mount = document.getElementById('dragon3d');
if (!mount) {
  console.warn('[dragon3d] #dragon3d not found');
} else {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 100);
  camera.position.set(0, 0.4, 6);

  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  mount.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(4,5,5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff5577, 0.8); rim.position.set(-3,1,-4); scene.add(rim);

  const logo = new THREE.Group(); scene.add(logo);

  const ro = new ResizeObserver(resize); ro.observe(mount);
  function resize(){
    const w=mount.clientWidth||200, h=mount.clientHeight||200;
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
  } resize();

  // Try SVG extrude first
  const loader = new SVGLoader();
  loader.load('dragon.svg', onSVG, undefined, onSVGFallback);

  function onSVG(data){
    const shapes=[]; for (const p of data.paths) for (const s of SVGLoader.createShapes(p)) shapes.push(s);
    const geom = new THREE.ExtrudeGeometry(shapes,{ depth:0.38, bevelEnabled:true, bevelThickness:0.10, bevelSize:0.05, bevelSegments:8, curveSegments:28 });
    geom.center();
    const red = 0xef4444;
    const mat = new THREE.MeshPhysicalMaterial({ color:red, metalness:0.35, roughness:0.35, clearcoat:0.6, clearcoatRoughness:0.25, emissive:0x2b0000, emissiveIntensity:0.55 });
    const mesh = new THREE.Mesh(geom, mat); mesh.castShadow=true; logo.add(mesh);
    const glow = new THREE.Mesh(geom.clone(), new THREE.MeshBasicMaterial({ color:red, transparent:true, opacity:0.12, blending:THREE.AdditiveBlending, depthWrite:false }));
    glow.scale.multiplyScalar(1.02); logo.add(glow);
    ready();
  }

  function onSVGFallback(){
    console.warn('[dragon3d] SVG failed; falling back to PNG');
    new THREE.TextureLoader().load('dragon-cutout.png', tex=>{
      const h=3.0, w=h*(tex.image.width/tex.image.height);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshStandardMaterial({ map:tex, transparent:true, metalness:0.15, roughness:0.55 }));
      m.castShadow=true; logo.add(m); ready();
    }, undefined, err=> console.error('[dragon3d] PNG load error', err));
  }

  let spin=true, t=0; const tilt=new THREE.Vector2(0,0);
  function ready(){
    mount.addEventListener('pointermove', e=>{
      const r=mount.getBoundingClientRect();
      const x=((e.clientX-r.left)/r.width)*2-1, y=((e.clientY-r.top)/r.height)*2-1;
      tilt.set(y*0.30, x*0.40);
    });
    mount.addEventListener('click', ()=>{ spin=!spin; });
    animate();
  }

  const clock=new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const dt=Math.min(clock.getDelta(),0.033); t+=dt;
    if(logo.children.length){
      const L=(a,b,k)=>a+(b-a)*k;
      logo.position.y=Math.sin(t*1.2)*0.18;
      logo.rotation.x=L(logo.rotation.x, tilt.x, 0.08);
      logo.rotation.y=L(logo.rotation.y, tilt.y + (spin? t*0.35:0), 0.06);
      logo.rotation.z=Math.sin(t*2.0)*0.012;
    }
    renderer.render(scene, camera);
  }
}
