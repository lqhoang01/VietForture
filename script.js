(function(){
  const VIEWS=["view-gioithieu","view-about","view-dichvu","view-tuyendung","view-tintuc","view-tindung","view-kitucxa"];
  const MAP={"tab-gioithieu":"view-about","tab-dichvu":"view-dichvu","tab-tuyendung":"view-tuyendung","tab-tintuc":"view-tintuc"};
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const coarse=matchMedia("(pointer: coarse)").matches;

  let current=VIEWS.find(id=>$('#'+id)?.classList.contains('is-visible'))||"view-gioithieu";

  function hH(){const el=$(".site-header .inner");return el?Math.round(el.getBoundingClientRect().height):120}
  function setActive(viewId){
    Object.entries(MAP).forEach(([tabId,vId])=>{
      const t=$('#'+tabId);
      const a=vId===viewId||(vId==="view-dichvu"&&(viewId==="view-tindung"||viewId==="view-kitucxa"));
      if(t){t.classList.toggle("is-active",a);t.setAttribute("aria-selected",String(a))}
    });
  }
  function scrollTopMain(){
    const main=$("#main");if(!main)return;
    const y=main.getBoundingClientRect().top+scrollY-(hH()+8);
    scrollTo({top:y,behavior:"smooth"});
  }
  function show(id,{scroll=true}={}){
    if(id===current)return;
    const cur=$('#'+current), nxt=$('#'+id); if(!nxt)return;
    if(cur){cur.classList.add('leaving');setTimeout(()=>{cur.classList.remove('is-visible','leaving')},200)}
    nxt.classList.add('is-visible','entering');setTimeout(()=>nxt.classList.remove('entering'),300);
    current=id; setActive(id);
    if(scroll){ if(id==="view-gioithieu") scrollTo({top:0,behavior:"smooth"}); else scrollTopMain() }
    if(id==="view-about") initAbout();
    if(id==="view-tindung"||id==="view-kitucxa") initDetail('#'+id);
  }

  Object.keys(MAP).forEach(id=>$('#'+id)?.addEventListener('click',e=>{e.preventDefault();show(MAP[id])}));
  $$(".svc-card[data-nav]").forEach(b=>b.addEventListener("click",()=>{show(b.dataset.nav==="tindung"?"view-tindung":"view-kitucxa")}));
  $("#btn-show-about")?.addEventListener("click",()=>show("view-about"));
  $("#brandHome")?.addEventListener("click",e=>{e.preventDefault();show("view-gioithieu")});

  const ioReveal=new IntersectionObserver(es=>es.forEach(en=>en.isIntersecting&&en.target.classList.add("in")),{rootMargin:"-10% 0px -10% 0px",threshold:.05});
  $$(".reveal").forEach(el=>ioReveal.observe(el));

  function initAbout(){
    const page=$("#view-about"); if(!page) return;
    const cards=$$(".about-card",page);
    cards.forEach((c,i)=>c.style.setProperty("--stagger",`${.08*i}s`));
    if(!page._loaded){
      const io=new IntersectionObserver(es=>{es.forEach(en=>{if(en.isIntersecting){page.classList.add("loaded");io.disconnect()}})},{rootMargin:"-10% 0px",threshold:.2});
      io.observe(page); page._loaded=true;
    }
    if(page._tilt) return; page._tilt=true;
    cards.forEach(c=>{
      if(!coarse){
        let raf=null;
        function move(e){
          const r=c.getBoundingClientRect();
          const x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
          const rx=(.5-y)*10, ry=(x-.5)*12;
          if(raf) cancelAnimationFrame(raf);
          raf=requestAnimationFrame(()=>{c.style.setProperty("--rx",rx.toFixed(2)+"deg");c.style.setProperty("--ry",ry.toFixed(2)+"deg")});
          c.classList.add("is-hover");
        }
        function leave(){c.classList.remove("is-hover");c.style.setProperty("--rx","0deg");c.style.setProperty("--ry","0deg")}
        c.addEventListener("pointermove",move); c.addEventListener("pointerleave",leave);
      }
      c.addEventListener("click",e=>{
        const r=c.getBoundingClientRect(), w=document.createElement("span");
        w.className="click-wave"; w.style.left=(e.clientX-r.left)+"px"; w.style.top=(e.clientY-r.top)+"px";
        c.appendChild(w); w.addEventListener("animationend",()=>w.remove());
      },{passive:true});
    });
  }

  function initDetail(sel){
    const root=$(sel); if(!root) return;
    const stats=$$(".stat-card",root), nums=$$(".stat-num",root), steps=$$(".process-step",root);

    const ioS=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting) en.target.classList.add("show")}),{threshold:.2});
    stats.forEach(s=>ioS.observe(s));

    const ioN=new IntersectionObserver(es=>{
      es.forEach(en=>{
        if(!en.isIntersecting) return;
        const el=en.target; if(el._c) return; el._c=true;
        const target=parseFloat(el.getAttribute("data-count")||"0"), dur=900, t0=performance.now();
        const step=now=>{
          const p=Math.min(1,(now-t0)/dur), v=(1-Math.pow(1-p,3))*target;
          el.textContent=Number.isInteger(target)?Math.round(v):Math.round(v*10)/10;
          if(p<1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    },{threshold:.6});
    nums.forEach(n=>ioN.observe(n));

    const ioP=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting) en.target.classList.add("show")}),{threshold:.2});
    steps.forEach((st,i)=>{st.style.transitionDelay=`${i*80}ms`;ioP.observe(st)});
  }

  setActive(current);
  initAbout();
})();
