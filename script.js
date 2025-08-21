(function () {
  const views = {
    home: document.getElementById('view-home'),
    about: document.getElementById('view-about'),
    dichvu: document.getElementById('view-dichvu'),
    tuyendung: document.getElementById('view-tuyendung'),
    tintuc: document.getElementById('view-tintuc'),
    tindung: document.getElementById('view-tindung'),
    kitucxa: document.getElementById('view-kitucxa'),
  };

  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  const after2Frames = (fn)=>requestAnimationFrame(()=>requestAnimationFrame(fn));

  function setTab(id){
    document.querySelectorAll('.tab').forEach(t=>{
      t.setAttribute('aria-selected','false');t.classList.remove('is-active');
    });
    const map={home:'home',gioithieu:'about',dichvu:'dichvu',tuyendung:'tuyendung',tintuc:'tintuc'};
    for(const [k,v] of Object.entries(map)){
      if(v===id){ const btn=document.getElementById('tab-'+k); btn?.setAttribute('aria-selected','true'); btn?.classList.add('is-active'); }
    }
  }

  function show(id) {
    Object.values(views).forEach(v => v && v.classList.remove('is-visible'));
    (views[id] || views.home).classList.add('is-visible');
    setTab(id);
    if (id === 'about') { setupAbout(); fontsReady.then(()=>after2Frames(calcStageHeight)); }
    else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }

  document.getElementById('brandHome')?.addEventListener('click', (e) => { e.preventDefault(); show('home'); });
  document.getElementById('tab-home')?.addEventListener('click', () => show('home'));
  document.getElementById('tab-gioithieu')?.addEventListener('click', () => show('about'));
  document.getElementById('tab-dichvu')?.addEventListener('click', () => show('dichvu'));
  document.getElementById('tab-tuyendung')?.addEventListener('click', () => show('tuyendung'));
  document.getElementById('tab-tintuc')?.addEventListener('click', () => show('tintuc'));
  document.getElementById('btn-show-about')?.addEventListener('click', () => show('about'));
  document.querySelectorAll('.svc-card[data-nav]').forEach(b => b.addEventListener('click', () => show(b.dataset.nav)));

  function setupAbout() {
    const stage = document.getElementById('aboutStage'); if (!stage || stage.dataset.bound) return;
    stage.dataset.bound = '1';

    const slides = [...stage.querySelectorAll('.slide')];
    const dots = [...document.querySelectorAll('#stageDots .dot')];
    if (!slides.length) return;

    let i = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
    slides.forEach((s,idx)=>s.classList.toggle('is-active', idx===i));
    dots.forEach((d,idx)=>d.classList.toggle('is-active', idx===i));

    function set(n) {
      const y = window.scrollY;
      i = (n + slides.length) % slides.length;
      slides.forEach(s => s.classList.remove('is-active'));
      slides[i].classList.add('is-active');
      dots.forEach(d => d.classList.remove('is-active'));
      dots[i]?.classList.add('is-active');
      calcStageHeight();
      window.scrollTo({ top: y });
    }

    document.getElementById('abPrev')?.addEventListener('click', (e) => { e.preventDefault(); set(i - 1); });
    document.getElementById('abNext')?.addEventListener('click', (e) => { e.preventDefault(); set(i + 1); });
    dots.forEach((d, idx) => d.addEventListener('click', (e) => { e.preventDefault(); set(idx); }));

    fontsReady.then(()=>after2Frames(calcStageHeight));
    window.addEventListener('resize', debounce(calcStageHeight, 120));
  }

  function calcStageHeight(){
    const root = document.documentElement;
    const stage = document.getElementById('aboutStage'); if (!stage) return;
    const slides = [...stage.querySelectorAll('.slide')]; if(!slides.length) return;

    const headerH = parseInt(getComputedStyle(root).getPropertyValue('--header-h')) || 92;
    const sloganH = parseInt(getComputedStyle(root).getPropertyValue('--slogan-h')) || 100;

    let maxH = 0;
    slides.forEach(s=>{
      const wasHidden = getComputedStyle(s).display === 'none';
      if (wasHidden){ s.style.display='block'; s.style.position='absolute'; s.style.visibility='hidden'; s.style.inset='0'; }
      const h = s.offsetHeight;
      if (h>maxH) maxH = h;
      if (wasHidden){ s.style.display=''; s.style.position=''; s.style.visibility=''; s.style.inset=''; }
    });

    const viewH = window.innerHeight - headerH;
    const target = Math.min(maxH + sloganH + 8, viewH + 24);
    stage.style.minHeight = target + 'px';
    stage.style.height = target + 'px';
  }

  function debounce(fn, t=100){ let to; return (...args)=>{ clearTimeout(to); to=setTimeout(()=>fn(...args), t); }; }

  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
  }, { threshold: .16, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal,.info-box,.core-card,.kpi-card,.news-card,.svc-card,.job-item').forEach(el => io.observe(el));

  const statIO = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; const to = parseFloat(el.dataset.count || '0');
      let cur = 0; const step = Math.max(1, Math.ceil(to / 40));
      const t = setInterval(() => {
        cur += step;
        if (cur >= to) { cur = to; clearInterval(t); }
        el.textContent = String(cur % 1 ? cur.toFixed(1) : cur);
      }, 24);
      statIO.unobserve(el);
    });
  }, { threshold: .4 });
  document.querySelectorAll('.kpi-num,.stat-num').forEach(el => statIO.observe(el));

  if (views.about?.classList.contains('is-visible')) {
    setupAbout();
    fontsReady.then(()=>after2Frames(calcStageHeight));
  }
})();
