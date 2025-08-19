/* VIETFORTURE — script.js (v17, mobile-optimized) */
(function () {
  const VIEW_IDS = [
    "view-gioithieu","view-about","view-dichvu","view-tuyendung",
    "view-tintuc","view-tindung","view-kitucxa",
  ];
  const TAB_MAP = {
    "tab-gioithieu": "view-about",
    "tab-dichvu": "view-dichvu",
    "tab-tuyendung": "view-tuyendung",
    "tab-tintuc": "view-tintuc",
  };

  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  const isCoarse = matchMedia("(pointer: coarse)").matches;

  let currentId =
    VIEW_IDS.find(id => $('#'+id)?.classList.contains('is-visible')) ||
    "view-gioithieu";

  function headerH(){
    const el = document.querySelector(".site-header .inner");
    return el ? Math.round(el.getBoundingClientRect().height) : 120;
  }

  function setActiveTabByView(viewId){
    Object.entries(TAB_MAP).forEach(([tabId, vId])=>{
      const tab = document.getElementById(tabId);
      const active = vId === viewId ||
        (vId === "view-dichvu" && (viewId === "view-tindung" || viewId === "view-kitucxa"));
      if(tab){
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      }
    });
  }

  function scrollToMainTop(){
    const main = $("#main");
    if(!main) return;
    const y = main.getBoundingClientRect().top + window.scrollY - (headerH() + 8);
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  function showView(newId, {scroll=true} = {}){
    if(newId === currentId) return;
    const cur = $('#'+currentId);
    const next = $('#'+newId);
    if(!next) return;

    if(cur){
      cur.classList.add('leaving');
      setTimeout(()=>{ cur.classList.remove('is-visible','leaving'); }, 200);
    }
    next.classList.add('is-visible','entering');
    setTimeout(()=> next.classList.remove('entering'), 300);

    currentId = newId;
    setActiveTabByView(newId);

    if(scroll){
      if(newId === "view-gioithieu") window.scrollTo({ top: 0, behavior: "smooth" });
      else scrollToMainTop();
    }

    if(newId === "view-about") setupAboutAnimations();
    if(newId === "view-tindung" || newId === "view-kitucxa") setupDetailView('#'+newId);
  }

  // Tabs
  Object.keys(TAB_MAP).forEach(tabId=>{
    $('#'+tabId)?.addEventListener('click', (e)=>{ e.preventDefault(); showView(TAB_MAP[tabId]); });
  });

  // Dịch vụ -> subviews
  $$(".svc-card[data-nav]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const nav = btn.getAttribute("data-nav");
      showView(nav === "tindung" ? "view-tindung" : "view-kitucxa");
    });
  });

  // Hero -> Giới thiệu
  $("#btn-show-about")?.addEventListener("click", ()=> showView("view-about"));

  // Logo -> Trang chủ
  $("#brandHome")?.addEventListener("click", (e)=>{ e.preventDefault(); showView("view-gioithieu"); });

  // Reveal util
  const ioReveal = new IntersectionObserver(
    entries => entries.forEach(en => en.isIntersecting && en.target.classList.add("in")),
    { rootMargin: "-10% 0px -10% 0px", threshold: 0.05 }
  );
  $$(".reveal").forEach(el => ioReveal.observe(el));

  // ===== ABOUT =====
  function setupAboutAnimations(){
    const aboutPage = $("#view-about");
    if(!aboutPage) return;

    const cards = $$(".about-card", aboutPage);
    cards.forEach((card, i)=> card.style.setProperty("--stagger", `${0.08 * i}s`));

    // Load-in 1 lần
    if(!aboutPage._loadedObserver){
      const io = new IntersectionObserver(entries=>{
        entries.forEach(en=>{
          if(en.isIntersecting){
            aboutPage.classList.add("loaded");
            io.disconnect();
          }
        });
      }, {rootMargin:"-10% 0px", threshold:.2});
      io.observe(aboutPage);
      aboutPage._loadedObserver = true;
    }

    // Tilt + ripple — tắt tilt trên màn hình cảm ứng để tiết kiệm tài nguyên
    if(aboutPage._tiltBound) return;
    aboutPage._tiltBound = true;

    cards.forEach((card)=>{
      if(!isCoarse){
        let raf = null;
        function onMove(e){
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top)  / r.height;
          const rx = (0.5 - y) * 10;
          const ry = (x - 0.5) * 12;
          if(raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(()=>{
            card.style.setProperty("--rx", rx.toFixed(2)+"deg");
            card.style.setProperty("--ry", ry.toFixed(2)+"deg");
          });
          card.classList.add("is-hover");
        }
        function onLeave(){
          card.classList.remove("is-hover");
          card.style.setProperty("--rx","0deg");
          card.style.setProperty("--ry","0deg");
        }
        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);
      }
      // Ripple cho cả mobile
      card.addEventListener("click", (e)=>{
        const r = card.getBoundingClientRect();
        const wave = document.createElement("span");
        wave.className = "click-wave";
        wave.style.left = (e.clientX - r.left) + "px";
        wave.style.top  = (e.clientY - r.top)  + "px";
        card.appendChild(wave);
        wave.addEventListener("animationend", ()=> wave.remove());
      }, {passive:true});
    });
  }

  // ===== Detail views =====
  function setupDetailView(rootSel){
    const root = document.querySelector(rootSel);
    if(!root) return;

    const stats = $$(".stat-card", root);
    const nums  = $$(".stat-num", root);

    const ioS = new IntersectionObserver(ents=>{
      ents.forEach(en=>{ if(en.isIntersecting) en.target.classList.add("show"); });
    }, {threshold:.2});
    stats.forEach(s=>ioS.observe(s));

    const ioN = new IntersectionObserver(ents=>{
      ents.forEach(en=>{
        if(!en.isIntersecting) return;
        const el = en.target;
        if(el._counted) return;
        el._counted = true;
        const target = parseFloat(el.getAttribute("data-count")||"0");
        const dur = 900;
        const t0 = performance.now();
        const step = (now)=>{
          const p = Math.min(1, (now - t0)/dur);
          const val = easeOutCubic(p) * target;
          el.textContent = formatNum(val, target);
          if(p<1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, {threshold:.6});
    nums.forEach(n=>ioN.observe(n));

    const steps = $$(".process-step", root);
    const ioP = new IntersectionObserver(ents=>{
      ents.forEach(en=>{ if(en.isIntersecting) en.target.classList.add("show"); });
    }, {threshold:.2});
    steps.forEach((st,i)=>{ st.style.transitionDelay = `${i*80}ms`; ioP.observe(st); });
  }

  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
  function formatNum(v, target){ return Number.isInteger(target) ? Math.round(v).toString() : (Math.round(v*10)/10).toString(); }

  // Init
  setActiveTabByView(currentId);
  setupAboutAnimations();

  // Recalc scroll offset on resize/orientation change
  addEventListener("resize", ()=>{ /* no-op, headerH() reads live height */ });
})();
