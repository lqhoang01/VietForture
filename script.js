/* ===================== Base helpers & setup ===================== */
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

  const morePanel = $('#morePanel');
  const navTg    = $('#navToggle');

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

  /* ============== Mobile burger dropdown (inside header) ============== */
  function closeMore(){ morePanel?.classList.remove('is-open'); navTg?.setAttribute('aria-expanded','false'); morePanel?.setAttribute('aria-hidden','true'); }
  function toggleMore(){
    const open = !morePanel.classList.contains('is-open');
    morePanel.classList.toggle('is-open', open);
    morePanel.setAttribute('aria-hidden', open ? 'false' : 'true');
    navTg.setAttribute('aria-expanded', String(open));
  }
  navTg?.addEventListener('click', (e)=>{ e.stopPropagation(); toggleMore(); });
  document.addEventListener('click', (e)=>{
    if (!morePanel) return;
    if (!morePanel.contains(e.target) && !navTg.contains(e.target)) closeMore();
  });
  // Links in panel
  $$('.menu-link').forEach(b=>b.addEventListener('click', ()=>{ show(b.dataset.nav); closeMore(); }));

  /* ============== View switching ============== */
  function setTab(id){
    // mark mobile primary
    $('#tab-home')?.setAttribute('aria-selected', String(id==='home'));
    $('#tab-gioithieu')?.setAttribute('aria-selected', String(id==='about'));
    // mark desktop tabs
    $('#tab-home-d')?.setAttribute('aria-selected', String(id==='home'));
    $('#tab-gioithieu-d')?.setAttribute('aria-selected', String(id==='about'));
    $('#tab-dichvu')?.setAttribute('aria-selected', String(id==='dichvu'));
    $('#tab-tuyendung')?.setAttribute('aria-selected', String(id==='tuyendung'));
    $('#tab-tintuc')?.setAttribute('aria-selected', String(id==='tintuc'));
  }
  function show(id){
    Object.values(views).forEach(v=>v && v.classList.remove('is-visible'));
    (views[id] || views.home).classList.add('is-visible');
    setTab(id);
    if(id==='about'){ setupAbout(); fontsReady.then(()=>after2Frames(calcStageHeight)); }
    else{ window.scrollTo({top:0,behavior:'smooth'}); }
  }
  // mobile primary
  $('#tab-home')?.addEventListener('click', ()=>show('home'));
  $('#tab-gioithieu')?.addEventListener('click', ()=>show('about'));
  // desktop tabs
  $('#tab-home-d')?.addEventListener('click', ()=>show('home'));
  $('#tab-gioithieu-d')?.addEventListener('click', ()=>show('about'));
  $('#tab-dichvu')?.addEventListener('click', ()=>show('dichvu'));
  $('#tab-tuyendung')?.addEventListener('click', ()=>show('tuyendung'));
  $('#tab-tintuc')?.addEventListener('click', ()=>show('tintuc'));
  // brand click
  $('#brandHome')?.addEventListener('click', (e)=>{ e.preventDefault(); show('home'); });
  // hero CTA
  $('#btn-show-about')?.addEventListener('click', ()=>show('about'));
  // service cards
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
  $$('.animate-in,.info-box,.core-card,.kpi-card,.news-card,.svc-card,.job-card').forEach(el=>io.observe(el));

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

  /* ============== Helper: modal binder ============== */
  function bindModal(openBtns, modalSel, closeSel, cancelSel, onOpen){
    const modal = $(modalSel); if(!modal) return {openFn:()=>{},closeFn:()=>{},modal:null};
    const closeBtn = $(closeSel);
    const cancelBtn = $(cancelSel);
    const opens = typeof openBtns==='string' ? $$(openBtns) : (openBtns || []);

    const openFn = (evt)=>{ if(onOpen) onOpen(evt); modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); };
    const closeFn = ()=>{ modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); };

    opens.forEach(b=>b?.addEventListener('click', openFn));
    closeBtn?.addEventListener('click', closeFn);
    cancelBtn?.addEventListener('click', closeFn);
    modal.addEventListener('click', e=>{ if(e.target===modal) closeFn(); });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeFn(); });
    return {openFn, closeFn, modal};
  }

  /* ============== Credit & Stay modals (mailto) ============== */
  // (ĐÃ BỎ các nút ở tab Dịch vụ theo yêu cầu) – chỉ để ở cuối trang con
  const creditBind = bindModal(
    ['#openCreditFormFoot'],
    '#creditModal','#closeCreditForm','#cancelCreditForm'
  );
  $('#creditForm')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = $('#cr_name').value.trim();
    const phone= $('#cr_phone').value.trim();
    const email= $('#cr_email').value.trim();
    const city = $('#cr_city').value.trim();
    const amount = $('#cr_amount').value.trim();
    const purpose= $('#cr_purpose').value;
    const term = $('#cr_term').value.trim();
    const note = $('#cr_note').value.trim();
    if(!name || !phone || !amount || !purpose){ alert('Điền Họ tên, SĐT, Số tiền, Mục đích vay.'); return; }
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
    window.location.href = `mailto:vietforture@gmail.com?subject=${subject}&body=${body}`;
    creditBind?.closeFn();
  });

  const stayBind = bindModal(
    ['#openStayFormFoot'],
    '#stayModal','#closeStayForm','#cancelStayForm'
  );
  $('#stayForm')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = $('#st_name').value.trim();
    const phone= $('#st_phone').value.trim();
    const email= $('#st_email').value.trim();
    const city = $('#st_city').value.trim();
    const type = $('#st_type').value;
    const note = $('#st_note').value.trim();
    if(!name || !phone || !type){ alert('Điền Họ tên, SĐT, Loại lưu trú.'); return; }
    const subject = encodeURIComponent(`Đăng ký lưu trú - ${type} - ${name}`);
    const body = encodeURIComponent([
      `Họ tên: ${name}`,
      `SĐT: ${phone}`,
      `Email: ${email || '(không cung cấp)'}`,
      `Thành phố: ${city || '(chưa nhập)'}`,
      `Loại lưu trú: ${type}`,
      `Ghi chú: ${note || ''}`
    ].join('\n'));
    window.location.href = `mailto:vietforture@gmail.com?subject=${subject}&body=${body}`;
    stayBind?.closeFn();
  });

  /* ============== Jobs: info & apply ============== */
  // Cơ chế chuẩn + thêm event delegation để chắc chắn luôn mở
  const jobInfo = bindModal(
    $$('.job-info'),
    '#jobInfoModal','#closeJobInfo','#cancelJobInfo',
    (evt)=>{
      const btn = evt?.currentTarget;
      const tid = btn?.dataset.template;
      const tpl = $('#'+tid);
      const box = $('#jobInfoContent');
      if (tpl && box) box.innerHTML = tpl.innerHTML;
    }
  );
  const jobApply = bindModal(
    $$('.job-apply'),
    '#jobApplyModal','#closeJobApply','#cancelJobApply',
    (evt)=>{
      const btn = evt?.currentTarget;
      const title = btn?.dataset.title || '';
      const input = $('#ja_pos');
      if(input) input.value = title;
    }
  );

  // Event delegation (phòng khi click không bắt được do DOM khác môi trường)
  $('.jobs-grid')?.addEventListener('click', (e)=>{
    const infoBtn = e.target.closest?.('.job-info');
    const applyBtn = e.target.closest?.('.job-apply');

    if (infoBtn) {
      const tid = infoBtn.dataset.template;
      const tpl = $('#'+tid);
      const box = $('#jobInfoContent');
      if (tpl && box) box.innerHTML = tpl.innerHTML;
      $('#jobInfoModal')?.classList.add('is-open');
      $('#jobInfoModal')?.setAttribute('aria-hidden','false');
    }
    if (applyBtn) {
      const title = applyBtn.dataset.title || '';
      const input = $('#ja_pos'); if(input) input.value = title;
      $('#jobApplyModal')?.classList.add('is-open');
      $('#jobApplyModal')?.setAttribute('aria-hidden','false');
    }
  });

  ['#openCreditForm', '#openCreditFormFoot'].forEach(sel => {
    document.querySelector(sel)?.addEventListener('click', () => {
      document.getElementById('creditModal').classList.add('is-open');
    });
  });
  ['#openStayForm', '#openStayFormFoot'].forEach(sel => {
    document.querySelector(sel)?.addEventListener('click', () => {
      document.getElementById('stayModal').classList.add('is-open');
    });
  });
})();
