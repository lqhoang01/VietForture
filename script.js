/* ===================== Base helpers ===================== */
(function () {
  const $  = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;

  const views = {
    home: $('#view-home'),
    about: $('#view-about'),
    dichvu: $('#view-dichvu'),
    tuyendung: $('#view-tuyendung'),
    tintuc: $('#view-tintuc'),
    tindung: $('#view-tindung'),
    kitucxa: $('#view-kitucxa'),
  };

  const tabsEl   = $('#tabs');
  const navTg    = $('#navToggle');
  const btnAbout = $('#btn-show-about');

  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  const after2Frames = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

  /* ============== Header glass on scroll ============== */
  (function glassHeader(){
    const header = $('.site-header');
    if(!header) return;
    const onScroll = () => {
      if (window.scrollY > 4) header.classList.add('header--scrolled');
      else header.classList.remove('header--scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  })();

  /* ============== Mobile burger ============== */
  function closeMenu(){ tabsEl?.classList.remove('is-open'); navTg?.setAttribute('aria-expanded','false'); }
  navTg?.addEventListener('click', (e)=>{
    e.stopPropagation();
    const open = !tabsEl.classList.contains('is-open');
    tabsEl.classList.toggle('is-open', open);
    navTg.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e)=>{
    if (!tabsEl) return;
    if (!tabsEl.contains(e.target) && !navTg.contains(e.target)) closeMenu();
  });

  /* ============== View switching ============== */
  function setTab(id){
    $$('.tab').forEach(t=>{ t.setAttribute('aria-selected','false'); t.classList.remove('is-active'); });
    const map={home:'home',gioithieu:'about',dichvu:'dichvu',tuyendung:'tuyendung',tintuc:'tintuc'};
    for(const [k,v] of Object.entries(map)){
      if(v===id){ const btn=$('#tab-'+k); btn?.setAttribute('aria-selected','true'); btn?.classList.add('is-active'); }
    }
  }
  function show(id){
    Object.values(views).forEach(v=>v && v.classList.remove('is-visible'));
    (views[id] || views.home).classList.add('is-visible');
    setTab(id);
    closeMenu();
    if(id==='about'){ setupAbout(); fontsReady.then(()=>after2Frames(calcStageHeight)); }
    else{ window.scrollTo({top:0,behavior:'smooth'}); }
  }
  $('#brandHome')?.addEventListener('click', e=>{ e.preventDefault(); show('home'); });
  $('#tab-home')?.addEventListener('click', ()=>show('home'));
  $('#tab-gioithieu')?.addEventListener('click', ()=>show('about'));
  $('#tab-dichvu')?.addEventListener('click', ()=>show('dichvu'));
  $('#tab-tuyendung')?.addEventListener('click', ()=>show('tuyendung'));
  $('#tab-tintuc')?.addEventListener('click', ()=>show('tintuc'));
  btnAbout?.addEventListener('click', ()=>show('about'));
  $$('.svc-card[data-nav]').forEach(b=>b.addEventListener('click', ()=>show(b.dataset.nav)));

  /* ============== About slider + height fix ============== */
  function setupAbout(){
    const stage = $('#aboutStage'); if(!stage || stage.dataset.bound) return;
    stage.dataset.bound='1';
    const slides=[...stage.querySelectorAll('.slide')];
    const dots=[...$('#stageDots')?.querySelectorAll('.dot')||[]];
    if(!slides.length) return;

    let i = Math.max(0, slides.findIndex(s=>s.classList.contains('is-active')));
    slides.forEach((s,idx)=>s.classList.toggle('is-active', idx===i));
    dots.forEach((d,idx)=>d.classList.toggle('is-active', idx===i));

    function set(n){
      const y=window.scrollY;
      i=(n+slides.length)%slides.length;
      slides.forEach(s=>s.classList.remove('is-active'));
      slides[i].classList.add('is-active');
      dots.forEach(d=>d.classList.remove('is-active'));
      dots[i]?.classList.add('is-active');
      calcStageHeight();
      window.scrollTo({top:y});
    }
    $('#abPrev')?.addEventListener('click', e=>{ e.preventDefault(); set(i-1); });
    $('#abNext')?.addEventListener('click', e=>{ e.preventDefault(); set(i+1); });
    dots.forEach((d,idx)=>d.addEventListener('click', e=>{ e.preventDefault(); set(idx); }));

    fontsReady.then(()=>after2Frames(calcStageHeight));
    window.addEventListener('resize', debounce(calcStageHeight, 120));
  }
  function calcStageHeight(){
    const stage = $('#aboutStage'); if(!stage) return;
    const slides=[...stage.querySelectorAll('.slide')]; if(!slides.length) return;

    const headerH = parseInt(getComputedStyle(root).getPropertyValue('--header-h'))||92;
    const sloganH = parseInt(getComputedStyle(root).getPropertyValue('--slogan-h'))||100;

    let maxH=0;
    slides.forEach(s=>{
      const wasHidden = getComputedStyle(s).display==='none';
      if(wasHidden){ s.style.display='block'; s.style.position='absolute'; s.style.visibility='hidden'; s.style.inset='0'; }
      maxH = Math.max(maxH, s.offsetHeight);
      if(wasHidden){ s.style.display=''; s.style.position=''; s.style.visibility=''; s.style.inset=''; }
    });
    const viewH = window.innerHeight - headerH;
    const target = Math.min(maxH + sloganH + 8, viewH + 24);
    stage.style.minHeight = target+'px';
    stage.style.height    = target+'px';
  }
  function debounce(fn, t=100){ let to; return (...a)=>{ clearTimeout(to); to=setTimeout(()=>fn(...a), t); }; }

  if (views.about?.classList.contains('is-visible')) {
    setupAbout();
    fontsReady.then(()=>after2Frames(calcStageHeight));
  }

  /* ============== Animations on enter + KPI counter ============== */
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); }
    });
  }, {threshold:.16, rootMargin:'0px 0px -8% 0px'});
  $$('.animate-in,.info-box,.core-card,.kpi-card,.news-card,.svc-card,.job-item').forEach(el=>io.observe(el));

  const statIO = new IntersectionObserver((ents)=>{
    ents.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target; const to = parseFloat(el.dataset.count||'0');
      let cur=0; const step = Math.max(1, Math.ceil(to/40));
      const t=setInterval(()=>{
        cur += step;
        if(cur>=to){ cur=to; clearInterval(t); }
        el.textContent = String(cur);
      }, 24);
      statIO.unobserve(el);
    });
  }, {threshold:.4});
  $$('.kpi-num').forEach(el=>statIO.observe(el));

  /* ============== Modals: Credit & Stay ============== */
  function bindModal(openBtnSel, modalSel, closeSel, cancelSel, formSel, buildMailto){
    const openBtn = $(openBtnSel);
    const modal = $(modalSel);
    if(!modal) return;
    const closeBtn = $(closeSel);
    const cancelBtn= $(cancelSel);
    const form = $(formSel);

    const openFn = ()=>{ modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); };
    const closeFn = ()=>{ modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); };

    openBtn?.addEventListener('click', openFn);
    closeBtn?.addEventListener('click', closeFn);
    cancelBtn?.addEventListener('click', closeFn);
    modal.addEventListener('click', e=>{ if(e.target===modal) closeFn(); });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeFn(); });

    form?.addEventListener('submit', e=>{
      e.preventDefault();
      const href = buildMailto();
      if(href){ window.location.href = href; }
      closeFn();
    });
  }

  // Credit modal
  bindModal(
    '#openCreditForm', '#creditModal', '#closeCreditForm', '#cancelCreditForm', '#creditForm',
    ()=> {
      const name = $('#cr_name').value.trim();
      const phone= $('#cr_phone').value.trim();
      const email= $('#cr_email').value.trim();
      const city = $('#cr_city').value.trim();
      const amount = $('#cr_amount').value.trim();
      const purpose= $('#cr_purpose').value;
      const term = $('#cr_term').value.trim();
      const note = $('#cr_note').value.trim();
      if(!name || !phone || !amount || !purpose){ alert('Điền Họ tên, SĐT, Số tiền, Mục đích vay.'); return ''; }
      const subject = encodeURIComponent(`Đăng ký vay - ${purpose} - ${name}`);
      const body = encodeURIComponent([
        `Họ tên: ${name}`,
        `SĐT: ${phone}`,
        `Email: ${email || '(không cung cấp)'}`,
        `Thành phố: ${city || '(chưa nhập)'}`,
        `Số tiền: ${amount}`,
        `Mục đích: ${purpose}`,
        `Thời hạn: ${term || '(chưa nhập)'}`,
        `Ghi chú: ${note || ''}`
      ].join('\n'));
      return `mailto:vietforture@gmail.com?subject=${subject}&body=${body}`;
    }
  );

  // Stay modal
  bindModal(
    '#openStayForm', '#stayModal', '#closeStayForm', '#cancelStayForm', '#stayForm',
    ()=>{
      const name = $('#st_name').value.trim();
      const phone= $('#st_phone').value.trim();
      const email= $('#st_email').value.trim();
      const city = $('#st_city').value.trim();
      const type = $('#st_type').value;
      const note = $('#st_note').value.trim();
      if(!name || !phone || !type){ alert('Điền Họ tên, SĐT, Loại lưu trú.'); return ''; }
      const subject = encodeURIComponent(`Đăng ký lưu trú - ${type} - ${name}`);
      const body = encodeURIComponent([
        `Họ tên: ${name}`,
        `SĐT: ${phone}`,
        `Email: ${email || '(không cung cấp)'}`,
        `Thành phố: ${city || '(chưa nhập)'}`,
        `Loại lưu trú: ${type}`,
        `Ghi chú: ${note || ''}`
      ].join('\n'));
      return `mailto:vietforture@gmail.com?subject=${subject}&body=${body}`;
    }
  );

  /* ============== Safe defaults on first load ============== */
  // If About was visible at load, make sure height is correct
  if (views.about?.classList.contains('is-visible')) {
    fontsReady.then(()=>after2Frames(calcStageHeight));
  }
})();
