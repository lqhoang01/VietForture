v// VietForture – app script (vanilla)
// - Tabs & views
// - About slider + counters
// - Jobs modal + Apply routing
// - Services panel V3: hiển thị menu + chi tiết NGAY TRONG MODAL (không mở trang nền)
// - CTA -> modal form (#svcApplyModal) nếu có, fallback sang view #apply
// - Gửi GAS x-www-form-urlencoded (no-cors) theo endpoint của bạn

(function () {
  const $  = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;

  /* =================== VIEWS & NAV =================== */
  const views = {
    home: $('#view-home'),
    about: $('#view-about'),
    dichvu: $('#view-dichvu'),
    tuyendung: $('#view-tuyendung'),
    tintuc: $('#view-tintuc'),
    tindung: $('#view-tindung'),   // còn để tương thích cũ (không điều hướng tới)
    kitucxa: $('#view-kitucxa'),   // còn để tương thích cũ (không điều hướng tới)
    apply: $('#view-apply'),
    thongbao: $('#view-thongbao'),
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

  /* Mobile burger – FIX thiếu ngoặc trước đó */
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
    $('#tab-thongbao')?.setAttribute('aria-selected', String(id==='thongbao'));
  }
  function closeAllModals() {
    document.querySelectorAll('.modal.is-open').forEach(modal => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    });
    document.body.classList.remove('modal-open');
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
        setTimeout(()=>{ next.classList.remove('is-entering'); next.style.display = ''; }, 320);
      });
    }

    setTab(id);
    // Hash gọn cho các view chính
    if(id==='home'){
      if(location.hash) history.replaceState(null, '', location.pathname + location.search);
    }else{
      let hash = '#' + id;
      if(id==='dichvu') hash = '#services';
      if(id==='about') hash = '#about';
      if(id==='tuyendung') hash = '#jobs';
      if(id==='tintuc' || id==='thongbao') hash = '#news';
      if(id==='apply') hash = '#apply';
      if(location.hash !== hash) history.replaceState(null, '', hash);
    }
    if(id==='about'){ setupAbout(); fontsReady.then(()=>after2Frames(calcStageHeight)); }
    else{ window.scrollTo({top:0,behavior:'smooth'}); }
  }
  $('#tab-home')?.addEventListener('click', ()=>show('home'));
  $('#tab-gioithieu')?.addEventListener('click', ()=>show('about'));
  $('#tab-home-d')?.addEventListener('click', ()=>show('home'));
  $('#tab-gioithieu-d')?.addEventListener('click', ()=>show('about'));
  $('#tab-dichvu')?.addEventListener('click', ()=>show('dichvu'));
  $('#tab-tuyendung')?.addEventListener('click', ()=>show('tuyendung'));
  $('#tab-tintuc')?.addEventListener('click', ()=>show('thongbao'));
  $('#tab-thongbao')?.addEventListener('click', ()=>show('thongbao'));
  $('#brandHome')?.addEventListener('click', (e)=>{ e.preventDefault(); show('home'); });
  $('#btn-show-about')?.addEventListener('click', ()=>show('about'));
  // Thẻ dịch vụ chỉ mở panel (không chuyển sang trang nền)
  $$('.svc-card[data-nav="tindung"]').forEach(b=>b.addEventListener('click', ()=>openSvc('credit')));
  $$('.svc-card[data-nav="kitucxa"]').forEach(b=>b.addEventListener('click', ()=>openSvc('stay')));
  $$('.svc-card[data-nav="thongbao"]').forEach(b=>b.addEventListener('click', ()=>{ show('thongbao'); }));

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

  /* Reveal on view + KPI count */
  const io = new IntersectionObserver((ents)=>{ ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); } }); }, {threshold:.16, rootMargin:'0px 0px -8% 0px'});
  $$('.animate-in,.info-box,.core-card,.kpi-card,.news-card,.svc-card,.job-card').forEach(el=>io.observe(el));
  const statIO = new IntersectionObserver((ents)=>{ ents.forEach(e=>{ if(!e.isIntersecting) return; const el=e.target; const to = parseFloat(el.dataset.count||'0'); let cur=0; const step = Math.max(1, Math.ceil(to/40)); const t=setInterval(()=>{ cur += step; if(cur>=to){ cur=to; clearInterval(t); } el.textContent = String(cur); }, 24); statIO.unobserve(el); }); }, {threshold:.4});
  $$('.kpi-num').forEach(el=>statIO.observe(el));

  /* =================== JOBS: modal chi tiết + apply =================== */
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
    const jobHash = applyBtn.dataset.hash ? `#job-${applyBtn.dataset.hash}` : '#job';
    if(location.hash !== jobHash) history.replaceState(null, '', jobHash);
    $('#jobInfoModal')?.classList.add('is-open');
    $('#jobInfoModal')?.setAttribute('aria-hidden','false');
  });
  function closeJobInfo() {
    $('#jobInfoModal')?.classList.remove('is-open');
    $('#jobInfoModal')?.setAttribute('aria-hidden', 'true');
    if(location.hash && location.hash.startsWith('#job-')){
      history.replaceState(null, '', location.pathname + location.search);
    }
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

  /* =================== APPLY VIEW (fallback form) =================== */
  $('#ap_cover_toggle')?.addEventListener('change', (e) => {
    $('#ap_cover_wrap').style.display = e.target.checked ? 'block' : 'none';
  });
  $('#ap_cv')?.addEventListener('change', (e) => {
    $('#ap_cv_name').textContent = e.target.files?.[0]?.name || '';
  });

  /* =================== GAS SUBMIT =================== */
  const GAS_URL = "https://script.google.com/macros/s/AKfycbxAWCzN11bJsBy2R7BQLo17pi1drRSvu_cGOCoum7JzJb8D6F5wIps8UGNJ_EMckwymTw/exec";

  function postFormUrlEncoded(url, data) {
    const body = new URLSearchParams(data).toString();
    return fetch(url, {
      method: 'POST',
      mode: 'no-cors', // tránh CORS khi chạy file://
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body
    });
  }

  // Apply (view) → gửi GAS (fallback khi không có #svcApplyModal)
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
    const payload = { type:'apply', name, phone, email, city, pos, drive, file, note: cover };
    postFormUrlEncoded(GAS_URL, payload).finally(()=>{
      alert('Đã gửi đăng ký/ứng tuyển. Chúng tôi sẽ liên hệ sớm!');
      $('#applyForm')?.reset();
      $('#ap_cv_name').textContent='';
    });
  });

  /* =================== SERVICES PANEL V3 =================== */
  const svcPanel = $('#svcPanel');
  const svcPanelTitle = $('#svcPanelTitle');
  const svcPanelContent = $('#svcPanelContent');

  function openPanel(){ if(!svcPanel) return; svcPanel.classList.add('is-open'); svcPanel.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open'); }
  function closePanel(){ if(!svcPanel) return; svcPanel.classList.remove('is-open'); svcPanel.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); }
  $('#closeSvcPanel')?.addEventListener('click', closePanel);
  $('#cancelSvcPanel')?.addEventListener('click', closePanel);
  svcPanel?.addEventListener('click', (e)=>{ if(e.target===svcPanel) closePanel(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closePanel(); });

  function setHash(h){
    if(h[0] !== '#') h = '#'+h;
    try{
      location.hash = h;
      if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(location.href).catch(()=>{});
    }catch(e){}
  }

  const DETAILS = {
    'credit/personal/tinchap': {
      title:'Tín dụng Cá nhân – Tín chấp',
      subtitle:'Kỳ hạn 6–60 tháng, xét duyệt nhanh, nhiều đối tác.',
      bullets:[
        'Đối tượng: nhận lương/CBCCVC/kinh doanh tự do/BHNT/lịch sử vay tốt',
        'Thanh toán linh hoạt, lãi suất cạnh tranh',
        'Hồ sơ tối giản, tư vấn 1-1'
      ],
      tags:['Giải ngân nhanh','Không TSĐB','Đối tác: SHBFinance · LOTTE Finance · FE Credit'],
      cta:'Đăng Ký vay', apply:'Vay tín chấp cá nhân'
    },
    'credit/personal/thechap': {
      title:'Tín dụng Cá nhân – Thế chấp',
      subtitle:'TSĐB: nhà đất, ô tô, sổ tiết kiệm…',
      bullets:['Định giá minh bạch, thời hạn linh hoạt','Quy trình rõ ràng, chuyên viên đồng hành'],
      tags:['Hạn mức cao','Lãi suất ưu đãi'],
      cta:'Đăng Ký vay', apply:'Vay thế chấp cá nhân'
    },
    'credit/biz/tinchap': {
      title:'Tín dụng Doanh nghiệp – Tín chấp',
      subtitle:'Vốn lưu động nhanh cho SME; thẩm định tinh gọn.',
      bullets:['Không TSĐB','Điều kiện linh hoạt theo dòng tiền'],
      tags:['SME','Thẩm định nhanh'],
      cta:'Đăng Ký vay', apply:'Tín chấp doanh nghiệp'
    },
    'credit/biz/thechap': {
      title:'Tín dụng Doanh nghiệp – Thế chấp',
      subtitle:'TSĐB: BĐS thương mại, máy móc, phương tiện…',
      bullets:['Hạn mức lớn','Kỳ hạn đa dạng'],
      tags:['Dòng tiền tối ưu','Hạn mức lớn'],
      cta:'Đăng Ký vay', apply:'Thế chấp doanh nghiệp'
    },
    'stay/canho': {
      title:'Căn hộ dịch vụ',
      subtitle:'Không gian riêng tư, full nội thất; dọn vào ở ngay.',
      bullets:['An ninh 24/7','Dịch vụ hỗ trợ'],
      tags:['Full nội thất','Hỗ trợ bảo trì'],
      cta:'Đăng ký nhận phòng', apply:'Căn hộ dịch vụ'
    },
    'stay/ktx': {
      title:'Ký túc xá',
      subtitle:'Giường tầng hiện đại, tủ riêng, chi phí tối ưu.',
      bullets:['Phù hợp SV & người đi làm','Vị trí kết nối'],
      tags:['An ninh 24/7','Tiện ích chung'],
      cta:'Đăng ký nhận phòng', apply:'Ký túc xá'
    }
  };

  function renderMenu(kind){
    svcPanelTitle.textContent = (kind==='stay' ? 'Lưu Trú' : 'Tín Dụng');
    const mk = (ttl, arr)=>`
      <div class="svc-group">
        <div class="svc-group-title">${ttl}</div>
        <div>${arr.map(x=>`<span class="svc-chip"><button class="btn primary" data-svc-key="${x.key}">${x.title}</button></span>`).join('')}</div>
      </div>`;
    svcPanelContent.innerHTML =
      kind==='credit'
        ? mk('Cá nhân',[{title:'Tín chấp',key:'credit/personal/tinchap'},{title:'Thế chấp',key:'credit/personal/thechap'}])+
          mk('Doanh nghiệp',[{title:'Tín chấp',key:'credit/biz/tinchap'},{title:'Thế chấp',key:'credit/biz/thechap'}])
        : mk('Lưu trú',[{title:'Căn hộ dịch vụ',key:'stay/canho'},{title:'Ký túc xá',key:'stay/ktx'}]);

    svcPanelContent.querySelectorAll('[data-svc-key]').forEach(b=>{
      b.addEventListener('click', ()=>renderDetail(b.getAttribute('data-svc-key')));
    });
  }

  function renderDetail(key){
    const d = DETAILS[key]; if(!d) return;
    setHash(key);
    svcPanelContent.innerHTML = `
      <div class="svc-detail">
        <button class="btn ghost" id="svcBack" type="button">← Quay lại</button>
        <h3 class="text-xl" style="font-weight:900;color:#c1121f">${d.title}</h3>
        <p>${d.subtitle||''}</p>
        ${d.bullets?.length?`<ul class="list-disc" style="padding-left:18px">${d.bullets.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}
        ${d.tags?.length?`<div>${d.tags.map(t=>`<span class="badge">${t}</span>`).join(' ')}</div>`:''}
        <div class="ui-cta"><button class="btn primary" id="svcApplyBtn" type="button">${d.cta}</button></div>
      </div>`;
    $('#svcBack')?.addEventListener('click', ()=>{
      const kind = key.startsWith('stay/') ? 'stay' : 'credit';
      renderMenu(kind);
      setHash(kind); // hash nhẹ khi ở menu
    });
    $('#svcApplyBtn')?.addEventListener('click', ()=>{
      // ƯU TIÊN form modal riêng nếu có
      const modal = $('#svcApplyModal');
      if(modal){
        $('#sa_type') && ($('#sa_type').value = d.apply || d.title);
        modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
      }else{
        // Fallback view Apply
        show('apply');
        const pos = $('#ap_pos'); if(pos) pos.value = d.apply || d.title;
        history.replaceState(null,'','#apply');
        closePanel();
      }
    });
  }

  function openSvc(kind){ openPanel(); renderMenu(kind); }

  // Bind cards đã gắn ở trên (click -> openSvc)

  // Hash router: CHỈ mở modal (không mở view nền)
  function handleHashForServices(){
    const h = (location.hash||'').replace(/^#/,'');
    if(h==='services'){ openSvc('credit'); return; } // optional
    if(h==='credit'){ openSvc('credit'); return; }
    if(h==='stay'){ openSvc('stay'); return; }
    if(h==='news'){ show('thongbao'); return; }
    if(DETAILS[h]){ openPanel(); renderDetail(h); return; }
  }
  window.addEventListener('hashchange', handleHashForServices, {passive:true});
  document.addEventListener('DOMContentLoaded', handleHashForServices);

  /* =================== SVC APPLY MODAL -> GAS =================== */
  (function(){
    const modal = $('#svcApplyModal');
    if(!modal) return; // nếu không có, dùng fallback view Apply ở trên
    const form  = $('#svcApplyForm');
    const closeBtn = $('#closeSvcApply');
    const cancelBtn= $('#cancelSvcApply');
    const close = ()=>{ modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); form?.reset(); };
    closeBtn?.addEventListener('click', close);
    cancelBtn?.addEventListener('click', close);
    modal.addEventListener('click', (e)=>{ if(e.target===modal) close(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });

    form?.addEventListener('submit', (e)=>{
      e.preventDefault();
      const payload = {
        type   : 'service',
        service: $('#sa_type')?.value?.trim() || '',
        name   : $('#sa_name')?.value?.trim() || '',
        phone  : $('#sa_phone')?.value?.trim() || '',
        email  : $('#sa_email')?.value?.trim() || '',
        city   : $('#sa_city')?.value?.trim() || '',
        note   : $('#sa_note')?.value?.trim() || '',
      };
      if(!payload.name || !payload.phone || !payload.email){ alert('Điền Họ tên, SĐT, Email.'); return; }
      const btn = $('#sa_submit'); const old = btn?.textContent;
      if(btn){ btn.disabled=true; btn.textContent='Đang gửi...'; }
      postFormUrlEncoded(GAS_URL, payload).finally(()=>{
        if(btn){ btn.disabled=false; btn.textContent=old; }
        alert('Đã gửi đăng ký. Chúng tôi sẽ liên hệ sớm!');
        close();
      });
    });
  })();

  /* =================== HASH SHORTCUTS (jobs/apply) =================== */
  function handleHash(){
    const h = location.hash;
    if (h === '#apply') {
      show('apply');
      $('#ap_name')?.focus();
      return;
    }
    if (h && h.startsWith('#job-')) {
      const hash = h.replace('#job-','');
      const btn = document.querySelector(`.job-apply[data-hash="${hash}"]`);
      if(btn){
        btn.scrollIntoView({behavior:'smooth', block:'center'});
        btn.click();
      }
    }
  }
  window.addEventListener('hashchange', handleHash, {passive:true});
  document.addEventListener('DOMContentLoaded', handleHash);

  /* =========== small helpers for UX =========== */
  document.addEventListener('click', e=>{
    const a = e.target.closest?.('.cta-down');
    if (!a) return;
    e.preventDefault();
    $('#view-about')?.scrollIntoView({behavior:'smooth'});
  });

})();
