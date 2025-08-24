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
    apply: $('#view-apply'),
  };

  const morePanel = $('#morePanel');
  const navTg    = $('#navToggle');

  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  const after2Frames = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

  /* Header glass on scroll */
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

  /* Mobile burger */
  function closeMore(){
    morePanel?.classList.remove('is-open');
    navTg?.setAttribute('aria-expanded','false');
    morePanel?.setAttribute('aria-hidden','true');
  }
  function toggleMore(){
    if(!morePanel) return;
    const open = !morePanel.classList.contains('is-open');
    morePanel.classList.toggle('is-open', open);
    morePanel.setAttribute('aria-hidden', open ? 'false' : 'true');
    navTg?.setAttribute('aria-expanded', String(open));
  }
  navTg?.addEventListener('click', (e)=>{ e.stopPropagation(); toggleMore(); });
  document.addEventListener('click', (e)=>{
    if (!morePanel) return;
    if (!morePanel.contains(e.target) && !navTg?.contains(e.target)) closeMore();
  });
  $$('.menu-link').forEach(b=>b.addEventListener('click', ()=>{ show(b.dataset.nav); closeMore(); }));

  /* View switching (smooth) */
  function setTab(id){
    $('#tab-home')?.setAttribute('aria-selected', String(id==='home'));
    $('#tab-gioithieu')?.setAttribute('aria-selected', String(id==='about'));
    $('#tab-home-d')?.setAttribute('aria-selected', String(id==='home'));
    $('#tab-gioithieu-d')?.setAttribute('aria-selected', String(id==='about'));
    $('#tab-dichvu')?.setAttribute('aria-selected', String(id==='dichvu'));
    $('#tab-tuyendung')?.setAttribute('aria-selected', String(id==='tuyendung'));
    $('#tab-tintuc')?.setAttribute('aria-selected', String(id==='tintuc'));
  }
  function closeAllModals() {
    document.querySelectorAll('.modal.is-open').forEach(modal => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    });
  }
  function show(id){
    closeAllModals();
    const next = views[id] || views.home;
    const cur  = Object.values(views).find(v=>v && v.classList.contains('is-visible'));

    if (cur === next) return;

    // animate out current
    if (cur) {
      cur.classList.remove('is-visible');
      cur.classList.add('is-leaving');
      setTimeout(()=>cur.classList.remove('is-leaving'), 280);
    }

    // animate in next
    if (next) {
      next.classList.add('is-entering');
      next.style.display = 'block';
      requestAnimationFrame(()=>{
        next.classList.add('is-visible');
        setTimeout(()=>{
          next.classList.remove('is-entering');
          next.style.display = '';
        }, 320);
      });
    }

    setTab(id);
    if(id==='about'){ setupAbout(); fontsReady.then(()=>after2Frames(calcStageHeight)); }
    else{ window.scrollTo({top:0,behavior:'smooth'}); }
  }
  $('#tab-home')?.addEventListener('click', ()=>show('home'));
  $('#tab-gioithieu')?.addEventListener('click', ()=>show('about'));
  $('#tab-home-d')?.addEventListener('click', ()=>show('home'));
  $('#tab-gioithieu-d')?.addEventListener('click', ()=>show('about'));
  $('#tab-dichvu')?.addEventListener('click', ()=>show('dichvu'));
  $('#tab-tuyendung')?.addEventListener('click', ()=>show('tuyendung'));
  $('#tab-tintuc')?.addEventListener('click', ()=>show('tintuc'));
  $('#brandHome')?.addEventListener('click', (e)=>{ e.preventDefault(); show('home'); });
  $('#btn-show-about')?.addEventListener('click', ()=>show('about'));
  $$('.svc-card[data-nav]').forEach(b=>b.addEventListener('click', ()=>show(b.dataset.nav)));

  /* About slider + height fix */
  function setupAbout(){
    const stage = $('#aboutStage'); if(!stage || stage.dataset.bound) return;
    stage.dataset.bound='1';
    const slides=[...stage.querySelectorAll('.slide')];
    const dots=[...($('#stageDots')?.querySelectorAll('.dot')||[])];
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
  if (views.about?.classList.contains('is-visible')) { setupAbout(); fontsReady.then(()=>after2Frames(calcStageHeight)); }

  /* Reveal on view */
  const io = new IntersectionObserver((ents)=>{ ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); } }); }, {threshold:.16, rootMargin:'0px 0px -8% 0px'});
  $$('.animate-in,.info-box,.core-card,.kpi-card,.news-card,.svc-card,.job-card').forEach(el=>io.observe(el));
  const statIO = new IntersectionObserver((ents)=>{ ents.forEach(e=>{ if(!e.isIntersecting) return; const el=e.target; const to = parseFloat(el.dataset.count||'0'); let cur=0; const step = Math.max(1, Math.ceil(to/40)); const t=setInterval(()=>{ cur += step; if(cur>=to){ cur=to; clearInterval(t); } el.textContent = String(cur); }, 24); statIO.unobserve(el); }); }, {threshold:.4});
  $$('.kpi-num').forEach(el=>statIO.observe(el));

  /* Modal helper */
  function bindModal(openBtns, modalSel, closeSel, cancelSel, onOpen){
    const modal = $(modalSel);
    if(!modal) return {openFn:()=>{},closeFn:()=>{},modal:null};

    let opens = [];
    const pushSel = (sel)=>{ if(typeof sel==='string') opens.push(...$$(sel)); else if(sel?.addEventListener) opens.push(sel); };
    if (typeof openBtns === 'string' || openBtns?.addEventListener) pushSel(openBtns);
    else if (Array.isArray(openBtns)) openBtns.forEach(pushSel);

    const closeBtn = $(closeSel);
    const cancelBtn = $(cancelSel);

    const openFn = (evt)=>{ if(onOpen) onOpen(evt); modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); };
    const closeFn = ()=>{ modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); };

    opens.forEach(b=>b?.addEventListener('click', openFn));
    closeBtn?.addEventListener('click', closeFn);
    cancelBtn?.addEventListener('click', closeFn);
    modal.addEventListener('click', e=>{ if(e.target===modal) closeFn(); });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeFn(); });

    return {openFn, closeFn, modal};
  }

  /* Credit & Stay (mailto) */
  const creditBind = bindModal(['#openCreditForm','#openCreditFormFoot'], '#creditModal','#closeCreditForm','#cancelCreditForm');
  $('#creditForm')?.addEventListener('submit', function(e){
    e.preventDefault();
    const name = $('#cr_name').value.trim(); const phone= $('#cr_phone').value.trim();
    const email= $('#cr_email').value.trim(); const city = $('#cr_city').value.trim();
    const amount = $('#cr_amount').value.trim(); const purpose= $('#cr_purpose').value;
    const term = $('#cr_term').value.trim(); const note = $('#cr_note').value.trim();
    if(!name || !phone || !amount || !purpose){ alert('Điền Họ tên, SĐT, Số tiền, Mục đích vay.'); return; }
    const subject = encodeURIComponent(`Đăng ký vay - ${purpose} - ${name}`);
    const body = encodeURIComponent([`Họ tên: ${name}`,`SĐT: ${phone}`,`Email: ${email || '(không cung cấp)'}`,`Thành phố: ${city || '(chưa nhập)'}`,`Số tiền: ${amount}`,`Mục đích: ${purpose}`,`Thời hạn: ${term || '(chưa nhập)'}`,`Ghi chú: ${note || ''}`].join('\n'));
    creditBind?.closeFn();
  });

  const stayBind = bindModal(['#openStayForm','#openStayFormFoot'], '#stayModal','#closeStayForm','#cancelStayForm');
  $('#stayForm')?.addEventListener('submit', function(e){
    e.preventDefault();
    const name=$('#st_name').value.trim(); const phone=$('#st_phone').value.trim();
    const email=$('#st_email').value.trim(); const city=$('#st_city').value.trim();
    const type=$('#st_type').value; const note=$('#st_note').value.trim();
    if(!name || !phone || !type){ alert('Điền Họ tên, SĐT, Loại lưu trú.'); return; }
    const subject=encodeURIComponent(`Đăng ký lưu trú - ${type} - ${name}`);
    const body=encodeURIComponent([`Họ tên: ${name}`,`SĐT: ${phone}`,`Email: ${email || '(không cung cấp)'}`,`Thành phố: ${city || '(chưa nhập)'}`,`Loại lưu trú: ${type}`,`Ghi chú: ${note || ''}`].join('\n'));
    stayBind?.closeFn();
  });

  /* JOBS: mở modal chi tiết + nút Nộp đơn */
  $('.jobs-grid')?.addEventListener('click', (e)=>{
    const applyBtn = e.target.closest?.('.job-apply');
    if (!applyBtn) return;
    const tplId = applyBtn.dataset.template;
    const title = applyBtn.dataset.title || '';
    const tpl = tplId ? document.getElementById(tplId) : null;
    const box = $('#jobInfoContent');
    if (tpl && box) box.innerHTML = tpl.innerHTML;
    const openBtn = $('#jobInfoApply');
    if (openBtn) openBtn.dataset.title = title;
    $('#jobInfoModal')?.classList.add('is-open');
    $('#jobInfoModal')?.setAttribute('aria-hidden','false');
  });

  function closeJobInfo() {
    $('#jobInfoModal')?.classList.remove('is-open');
    $('#jobInfoModal')?.setAttribute('aria-hidden', 'true');
  }
  $('#closeJobInfo')?.addEventListener('click', closeJobInfo);
  $('#cancelJobInfo')?.addEventListener('click', closeJobInfo);

  $('#jobInfoApply')?.addEventListener('click', () => {
    const title = $('#jobInfoApply')?.dataset.title || 'Vị trí ứng tuyển';
    closeJobInfo();
    show('apply');
    const pos = $('#ap_pos'); if (pos) pos.value = title;
    $('#ap_name')?.focus();
    if (location.hash !== '#apply') history.replaceState(null,'','#apply');
  });

  // Fallback delegation
  document.addEventListener('click', (e)=>{
    if(e.target?.id==='jobInfoApply'){
      const title = $('#jobInfoApply')?.dataset.title || 'Vị trí ứng tuyển';
      closeJobInfo();
      show('apply');
      const pos = $('#ap_pos'); if (pos) pos.value = title;
      $('#ap_name')?.focus();
      if (location.hash !== '#apply') history.replaceState(null,'','#apply');
    }
  });

  /* Apply view */
  $('#ap_cover_toggle')?.addEventListener('change', (e) => {
    $('#ap_cover_wrap').style.display = e.target.checked ? 'block' : 'none';
  });
  $('#ap_cv')?.addEventListener('change', (e) => {
    $('#ap_cv_name').textContent = e.target.files?.[0]?.name || '';
  });
  $('#applyForm')?.addEventListener('submit', function(e){
    e.preventDefault();
    const name = $('#ap_name')?.value?.trim();
    const phone = $('#ap_phone')?.value?.trim();
    const email = $('#ap_email')?.value?.trim();
    const city  = $('#ap_city')?.value?.trim() || '';
    const pos   = $('#ap_pos')?.value?.trim();
    const cover = $('#ap_cover_toggle')?.checked ? ($('#ap_cover')?.value?.trim()||'') : '';
    const drive = $('#ap_cv_drive')?.value?.trim() || '';
    const file  = $('#ap_cv')?.files?.[0]?.name || '';
    if(!name || !phone || !email || !pos){ alert('Điền Họ tên, SĐT, Email, Vị trí.'); return; }
    const subject = encodeURIComponent(`Ứng tuyển - ${pos} - ${name}`);
    const body = encodeURIComponent([
      `Họ tên: ${name}`,
      `SĐT: ${phone}`,
      `Email: ${email}`,
      `Thành phố: ${city || '(chưa nhập)'}`,
      `Vị trí ứng tuyển: ${pos}`,
      drive ? `Link CV (Drive): ${drive}` : '',
      file ? `CV đính kèm (tên file): ${file}` : '',
      cover ? `\n--- Thư giới thiệu ---\n${cover}\n----------------------` : '',
      '\n(Vui lòng đính kèm CV nếu chưa có trong Drive)'
    ].filter(Boolean).join('\n'));
  });

  // Uploader check + reset
  document.addEventListener('DOMContentLoaded', function() {
    const up = document.querySelector('#applyForm .uploader');
    const upFile = document.getElementById('ap_cv');
    const upDrive = document.getElementById('ap_cv_drive');
    function markUploader(){
      const has = (upFile?.files?.length>0) || (upDrive?.value?.trim());
      up?.classList.toggle('ok', !!has);
    }
    upFile?.addEventListener('change', function(e){
      document.getElementById('ap_cv_name').textContent = e.target.files?.[0]?.name || '';
      markUploader();
    });
    upDrive?.addEventListener('input', markUploader);
    document.getElementById('applyForm')?.addEventListener('reset', function(){
      setTimeout(markUploader, 10);
      const coverWrap = document.getElementById('ap_cover_wrap');
      if (coverWrap) coverWrap.style.display = 'none';
    });
  });

  /* Hash direct to #apply */
  function handleHash(){
    if (location.hash === '#apply') {
      show('apply');
      $('#ap_name')?.focus();
    }
  }
  window.addEventListener('hashchange', handleHash);
  handleHash();

  // ================== CẤU HÌNH ==================
  const GAS_URL = "https://script.google.com/macros/s/AKfycbwzpGCuygPcq41C3WpvDtF1LXxsywk9nii1hw8kt4yqKofM6oP9juysrGok7fz_cXG6/exec";

  // Convert file thành base64
  function fileToBase64(file){
    return new Promise((resolve, reject)=>{
      if (!file) return resolve(null);
      const fr = new FileReader();
      fr.onload = () => {
        const s = String(fr.result || '');
        resolve({
          base64: s.split('base64,')[1] || '',
          mimeType: file.type,
          name: file.name
        });
      };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  async function postToGAS(payload){
    const r = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return r.ok;
  }

  // Ví dụ form Nộp đơn
  document.getElementById('applyForm')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const name = ap_name.value.trim();
    const phone= ap_phone.value.trim();
    const email= ap_email.value.trim();
    const city = ap_city.value.trim();
    const pos  = ap_pos.value.trim();
    const note = ap_cover.value.trim();
    const file = ap_cv.files[0];

    if(!name || !phone || !email || !pos){ alert("Điền đủ thông tin"); return; }

    const cv = await fileToBase64(file);

    await postToGAS({ type:"apply", name, phone, email, city, pos, note, cv });

    alert("Đã gửi hồ sơ thành công!");
    e.target.reset();
    document.getElementById('ap_cv_name').textContent = '';
  });
})();

