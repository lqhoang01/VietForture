(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  const after2Frames = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));
  const debounce = (fn, t = 100) => { let to; return (...a) => { clearTimeout(to); to = setTimeout(() => fn(...a), t); }; };

  // Views
  const views = {
    home:     $('#view-home'),
    about:    $('#view-about'),
    dichvu:   $('#view-dichvu'),
    tuyendung:$('#view-tuyendung'),
    tintuc:   $('#view-tintuc'),
    tindung:  $('#view-tindung'),
    kitucxa:  $('#view-kitucxa'),
  };

  function setTab(id){
    $$('.tab').forEach(t => { t.setAttribute('aria-selected','false'); t.classList.remove('is-active'); });
    const map = { home:'home', gioithieu:'about', dichvu:'dichvu', tuyendung:'tuyendung', tintuc:'tintuc' };
    for (const [k,v] of Object.entries(map)) {
      if (v === id) { const btn = document.getElementById('tab-'+k); btn?.setAttribute('aria-selected','true'); btn?.classList.add('is-active'); }
    }
  }

  function show(id) {
    Object.values(views).forEach(v => v && v.classList.remove('is-visible'));
    (views[id] || views.home).classList.add('is-visible');
    setTab(id);
    $('.tabs')?.classList.remove('is-open'); $('.nav-toggle')?.setAttribute('aria-expanded','false');

    if (id === 'about') { setupAbout(); fontsReady.then(() => after2Frames(calcStageHeight)); }
    else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }

  // Header nav
  $('#brandHome')?.addEventListener('click', (e) => { e.preventDefault(); show('home'); });
  $('#tab-home')?.addEventListener('click', () => show('home'));
  $('#tab-gioithieu')?.addEventListener('click', () => show('about'));
  $('#tab-dichvu')?.addEventListener('click', () => show('dichvu'));
  $('#tab-tuyendung')?.addEventListener('click', () => show('tuyendung'));
  $('#tab-tintuc')?.addEventListener('click', () => show('tintuc'));
  $('#btn-show-about')?.addEventListener('click', () => show('about'));
  $$('.svc-card[data-nav]').forEach(b => b.addEventListener('click', () => show(b.dataset.nav)));

  // Hamburger
  (function mountHamburger(){
    const row = $('.brand-row'); if (!row) return;
    if ($('.nav-toggle')) return;
    const btn = document.createElement('button');
    btn.className = 'nav-toggle'; btn.setAttribute('aria-label','Mở menu'); btn.setAttribute('aria-expanded','false'); btn.innerHTML = '<span></span>';
    row.appendChild(btn);
    btn.addEventListener('click', () => {
      const list = $('.tabs'); if (!list) return;
      const open = !list.classList.contains('is-open');
      list.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open));
    });
  })();

  // Header glass on scroll
  (function glassHeader(){
    const header = $('.site-header'); if (!header) return;
    const onScroll = () => header.classList.toggle('header--scrolled', window.scrollY > 4);
    onScroll(); window.addEventListener('scroll', onScroll, { passive:true });
  })();

  // About slides
  function setupAbout() {
    const stage = $('#aboutStage'); if (!stage || stage.dataset.bound) return;
    stage.dataset.bound = '1';
    const slides = $$('.slide', stage);
    const dots = $$('.dot', $('#stageDots'));
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
      calcStageHeight(); window.scrollTo({ top: y });
    }
    $('#abPrev')?.addEventListener('click', (e) => { e.preventDefault(); set(i - 1); });
    $('#abNext')?.addEventListener('click', (e) => { e.preventDefault(); set(i + 1); });
    dots.forEach((d, idx) => d.addEventListener('click', (e) => { e.preventDefault(); set(idx); }));

    fontsReady.then(()=>after2Frames(calcStageHeight));
    window.addEventListener('resize', debounce(calcStageHeight, 120));
  }

  function calcStageHeight(){
    const root = document.documentElement;
    const stage = $('#aboutStage'); if (!stage) return;
    const slides = $$('.slide', stage); if (!slides.length) return;

    const headerH = parseInt(getComputedStyle(root).getPropertyValue('--header-h')) || 92;
    const sloganH = parseInt(getComputedStyle(root).getPropertyValue('--slogan-h')) || 100;

    let maxH = 0;
    slides.forEach(s=>{
      const hidden = getComputedStyle(s).display === 'none';
      if (hidden){ s.style.display='block'; s.style.position='absolute'; s.style.visibility='hidden'; s.style.inset='0'; }
      const h = s.offsetHeight; if (h>maxH) maxH = h;
      if (hidden){ s.style.display=''; s.style.position=''; s.style.visibility=''; s.style.inset=''; }
    });

    const viewH = window.innerHeight - headerH;
    const target = Math.min(maxH + sloganH + 8, viewH + 24);
    stage.style.minHeight = target + 'px';
    stage.style.height = target + 'px';
  }

  // Reveal & KPI counters
  const io = new IntersectionObserver((ents, ob) => {
    ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); ob.unobserve(e.target); } });
  }, { threshold: .16, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal,.info-box,.core-card,.kpi-card,.news-card,.svc-card,.job-item').forEach(el => io.observe(el));

  const statIO = new IntersectionObserver((ents, ob) => {
    ents.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; const to = parseFloat(el.dataset.count || '0');
      let cur = 0; const step = Math.max(1, Math.ceil(to / 40));
      const t = setInterval(() => { cur += step; if (cur >= to) { cur = to; clearInterval(t); } el.textContent = String(cur); }, 24);
      ob.unobserve(el);
    });
  }, { threshold: .4 });
  $$('.kpi-num,.stat-num').forEach(el => statIO.observe(el));

  // Generic Modal
  function bindModal(openId, modalId, closeIds = []) {
    const openBtn = document.getElementById(openId);
    const modal = document.getElementById(modalId);
    if (!modal) return;
    let lastActive = null;
    const open = () => {
      lastActive = document.activeElement;
      modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
      const first = modal.querySelector('input,select,textarea,button'); first && first.focus();
    };
    const close = () => {
      modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true');
      document.body.style.overflow = ''; lastActive && lastActive.focus && lastActive.focus();
    };
    openBtn?.addEventListener('click', open);
    closeIds.forEach(id => document.getElementById(id)?.addEventListener('click', close));
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => { if (modal.classList.contains('is-open') && e.key === 'Escape') close(); });
    return { open, close };
  }

  // Bind 2 modal đúng yêu cầu
  bindModal('openCreditForm', 'creditModal', ['closeCreditForm','cancelCreditForm']);
  bindModal('openStayForm',   'stayModal',   ['closeStayForm','cancelStayForm']);

  // Form handlers (mailto)
  function wireForm(formId, fields, subject) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {};
      for (const [k, id] of Object.entries(fields)) data[k] = (document.getElementById(id)?.value || '').trim();
      if (formId === 'creditForm') {
        if (!data.name || !data.phone || !data.amount || !data.purpose) { alert('Điền Họ tên, SĐT, Số tiền và Mục đích vay.'); return; }
      } else {
        if (!data.name || !data.phone || !data.type) { alert('Điền Họ tên, SĐT và Loại lưu trú.'); return; }
      }
      const to = 'vietforture@gmail.com';
      const body = encodeURIComponent(Object.entries(data).map(([k,v]) => `${k}: ${v || ''}`).join('\n'));
      const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
      window.location.href = url;
      // đóng modal nếu đang mở
      $('.modal.is-open')?.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  }

  // Mask tiền cho credit amount
  const amountEl = $('#cr_amount');
  const onlyDigits = s => (s||'').replace(/[^0-9]/g,'');
  if (amountEl) {
    amountEl.addEventListener('input', () => {
      const raw = onlyDigits(amountEl.value);
      amountEl.value = raw ? Number(raw).toLocaleString('vi-VN') : '';
    });
  }

  wireForm('creditForm', {
    name:'cr_name', phone:'cr_phone', email:'cr_email',
    city:'cr_city', amount:'cr_amount', purpose:'cr_purpose',
    term:'cr_term', note:'cr_note'
  }, 'Đăng ký vay vốn — VietForture Credit');

  wireForm('stayForm', {
    name:'st_name', phone:'st_phone', email:'st_email',
    city:'st_city', type:'st_type', note:'st_note'
  }, 'Đăng ký nhận phòng — VietForture Home');

  // Init if About visible
  if (views.about?.classList.contains('is-visible')) {
    setupAbout(); fontsReady.then(()=>after2Frames(calcStageHeight));
  }
})();
