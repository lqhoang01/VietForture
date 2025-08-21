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

  function show(id) {
    const prevY = window.scrollY;

    Object.values(views).forEach(v => v && v.classList.remove('is-visible'));
    (views[id] || views.home).classList.add('is-visible');

    document.querySelectorAll('.tab').forEach(t => {
      t.setAttribute('aria-selected','false');
      t.classList.remove('is-active');
    });
    const tabMap = { home:'home', gioithieu:'about', dichvu:'dichvu', tuyendung:'tuyendung', tintuc:'tintuc' };
    for (const [k,v] of Object.entries(tabMap)) {
      if (v === id) {
        const btn = document.getElementById('tab-' + k);
        btn?.setAttribute('aria-selected','true');
        btn?.classList.add('is-active');
      }
    }

    if (id === 'about') {
      setupAbout();
      fontsReady.then(()=>after2Frames(() => { sizeStage(); window.scrollTo(0, prevY); }));
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Nav events
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

    let i = slides.findIndex(s => s.classList.contains('is-active'));
    if (i < 0) { slides[0].classList.add('is-active'); i = 0; dots[0]?.classList.add('is-active'); }

    function set(n) {
      const y = window.scrollY;
      i = (n + slides.length) % slides.length;
      slides.forEach(s => s.classList.remove('is-active'));
      slides[i].classList.add('is-active');
      dots.forEach(d => d.classList.remove('is-active'));
      dots[i]?.classList.add('is-active');
      sizeStage();
      window.scrollTo({ top: y });
    }

    document.getElementById('abPrev')?.addEventListener('click', (e) => { e.preventDefault(); set(i - 1); });
    document.getElementById('abNext')?.addEventListener('click', (e) => { e.preventDefault(); set(i + 1); });
    dots.forEach((d, idx) => d.addEventListener('click', (e) => { e.preventDefault(); set(idx); }));

    fontsReady.then(()=>after2Frames(sizeStage));
  }

  function sizeStage() {
    const stage = document.getElementById('aboutStage'); if (!stage) return;
    const active = stage.querySelector('.slide.is-active'); if (!active) return;
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 92;

    const wasHidden = getComputedStyle(active).display === 'none';
    if (wasHidden){
      active.style.cssText += 'display:block;position:absolute;visibility:hidden;inset:0;';
    }
    const h = active.offsetHeight;
    if (wasHidden){
      active.style.display=''; active.style.position=''; active.style.visibility=''; active.style.inset='';
    }

    // chừa slogan + nav ở đáy
    const isMobile = window.matchMedia('(max-width:768px)').matches;
    const reserve = isMobile ? 180 : 220;
    const minH = Math.max(h + 12, window.innerHeight - headerH) + reserve;

    stage.style.minHeight = minH + 'px';
    stage.style.height = minH + 'px';
  }

  window.addEventListener('resize', () => {
    if (views.about?.classList.contains('is-visible')) after2Frames(sizeStage);
  });

  // Lazy fade-in cards
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
  }, { threshold: .18, rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.vision-item,.core-pill,.job-item,.news-card,.svc-card').forEach(el => io.observe(el));

  // Stat counter
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
  document.querySelectorAll('.stat-num').forEach(el => statIO.observe(el));

  // First load
  if (views.about?.classList.contains('is-visible')) {
    setupAbout();
    fontsReady.then(()=>after2Frames(sizeStage));
  }
})();
