
(function () {
  const $  = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;

  /* =================== VIEWS & NAV =================== */
  const views = {
    home: $('#view-home'),
    about: $('#view-about'),
    dichvu: $('#view-dichvu'),
    luutru: $('#view-luutru'),           // ✅ thêm để router tới Lưu trú v2
    tuyendung: $('#view-tuyendung'),
    tintuc: $('#view-tintuc'),
    tindung: $('#view-tindung'),
    kitucxa: $('#view-kitucxa'),
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

    if (cur) {
      cur.classList.remove('is-visible');
      cur.classList.add('is-leaving');
      setTimeout(()=>cur.classList.remove('is-leaving'), 280);
    }

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
  window.show = window.show || show;
  $('#tab-home')?.addEventListener('click', ()=>show('home'));
  $('#tab-gioithieu')?.addEventListener('click', ()=>show('about'));
  $('#tab-home-d')?.addEventListener('click', ()=>show('home'));
  $('#tab-gioithieu-d')?.addEventListener('click', ()=>show('about'));
  $('#tab-dichvu')?.addEventListener('click', ()=>show('dichvu'));
  $('#tab-tuyendung')?.addEventListener('click', ()=>show('tuyendung'));
  $('#tab-tintuc')?.addEventListener('click', ()=>show('tintuc'));
  $('#tab-thongbao')?.addEventListener('click', ()=>show('thongbao'));
  $('#brandHome')?.addEventListener('click', (e)=>{ e.preventDefault(); show('home'); });
  $('#btn-show-about')?.addEventListener('click', ()=>show('about'));

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
    const upl = $('#ap_cv').closest('.uploader'); upl && upl.classList.toggle('ok', !!e.target.files?.[0]);
  });

  /* =================== GAS SUBMIT =================== */
  const GAS_URL = "https://script.google.com/macros/s/AKfycbxAWCzN11bJsBy2R7BQLo17pi1drRSvu_cGOCoum7JzJb8D6F5wIps8UGNJ_EMckwymTw/exec";

  function postFormUrlEncoded(url, data) {
    const body = new URLSearchParams(data).toString();
    return fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body
    });
  }

  // Apply (view) → GAS
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

  /* =================== SERVICES PANEL V3 (tự fallback nếu không có modal) =================== */
  (function(){
    const svcPanel = $('#svcPanel');
    const svcPanelTitle = $('#svcPanelTitle');
    const svcPanelContent = $('#svcPanelContent');

    function setHash(h){
      if(h[0] !== '#') h = '#'+h;
      try{ history.replaceState(null, '', h); }catch(e){}
    }

    // Fallback mode: không có modal -> route thẳng sang view
    if(!svcPanel || !svcPanelTitle || !svcPanelContent){
      window.openSvc = window.openSvc || function(kind){
        if(typeof show!=='function') return;
        if(kind==='credit') show('tindung');
        else if(kind==='stay') show('luutru');
        else show('tintuc');
      };
      function handleHashForServices(){
        const h = (location.hash||'').replace(/^#/,'');
        if(h==='services' || h==='credit'){ show('tindung'); return; }
        if(h==='stay'){ show('luutru'); return; }
        if(h==='news'){ show('tintuc'); return; }
      }
      window.addEventListener('hashchange', handleHashForServices, {passive:true});
      document.addEventListener('DOMContentLoaded', handleHashForServices);
      return;
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

    function openPanel(){ svcPanel.classList.add('is-open'); svcPanel.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open'); }
    function closePanel(){ svcPanel.classList.remove('is-open'); svcPanel.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); }
    $('#closeSvcPanel')?.addEventListener('click', closePanel);
    $('#cancelSvcPanel')?.addEventListener('click', closePanel);
    svcPanel?.addEventListener('click', (e)=>{ if(e.target===svcPanel) closePanel(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closePanel(); });

    function renderMenu(kind){
      if (!svcPanelTitle || !svcPanelContent) return;
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
      const d = DETAILS[key]; if(!d || !svcPanelContent) return;
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
        setHash(kind);
      });
      $('#svcApplyBtn')?.addEventListener('click', ()=>{
        const modal = $('#svcApplyModal');
        if(modal){
          $('#sa_type') && ($('#sa_type').value = d.apply || d.title);
          modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
        }else{
          show('apply');
          const pos = $('#ap_pos'); if(pos) pos.value = d.apply || d.title;
          history.replaceState(null,'','#apply');
          closePanel();
        }
      });
    }

    function openSvc(kind){ openPanel(); renderMenu(kind); }
    window.openSvc = openSvc;

    // Hash router (modal)
    function handleHashForServices(){
      const h = (location.hash||'').replace(/^#/,'');
      if(h==='services'){ openSvc('credit'); return; }
      if(h==='credit'){ openSvc('credit'); return; }
      if(h==='stay'){ openSvc('stay'); return; }
      if(h==='news'){ show('tintuc'); return; }
      if(DETAILS[h]){ openPanel(); renderDetail(h); return; }
    }
    window.addEventListener('hashchange', handleHashForServices, {passive:true});
    document.addEventListener('DOMContentLoaded', handleHashForServices);
  })();

  /* =================== SVC APPLY MODAL -> GAS =================== */
  (function(){
    const modal = $('#svcApplyModal');
    if(!modal) return;
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

/* ===== CREDIT VIEW bindings (compat for old HTML) ===== */
(function(){
  const $  = (s, c=document)=>c.querySelector(s);
  const $$ = (s, c=document)=>Array.from(c.querySelectorAll(s));

  const creditRoot = $('#view-tindung');
  if(!creditRoot) return;

  // Main tabs: Cá nhân / Doanh nghiệp (cr-*)
  const segBtns = $$('.cr-seg__btn', creditRoot);
  segBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      segBtns.forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const tab = btn.dataset.tab;
      $$('.cr-panel', creditRoot).forEach(p=>p.classList.remove('is-active'));
      if(tab==='personal') $('#cr-personal', creditRoot)?.classList.add('is-active');
      if(tab==='business') $('#cr-business', creditRoot)?.classList.add('is-active');
      creditRoot.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // Sub tabs in Business
  const subBtns = $$('.cr-subseg__btn', creditRoot);
  subBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const parent = btn.closest('#cr-business');
      if(!parent) return;
      $$('.cr-subseg__btn', parent).forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const key = btn.dataset.sub;
      $$('.cr-subpanel', parent).forEach(p=>p.classList.remove('is-active'));
      if(key==='biz-unsec') $('#cr-biz-unsec', parent)?.classList.add('is-active');
      if(key==='biz-sec')   $('#cr-biz-sec', parent)?.classList.add('is-active');
    });
  });

  function openApply(kind){
    const openBtn = document.getElementById('openCreditForm');
    if(openBtn){ openBtn.click(); return; }
    const svcApply = document.getElementById('svcApplyModal');
    if(svcApply){
      const saType = document.getElementById('sa_type');
      if(saType){
        const map = {
          'credit-unsec':'Đăng ký vay tín chấp',
          'credit-sec-home':'Vay mua/xây/sửa nhà',
          'credit-sec-auto':'Vay mua ô tô',
          'credit-sec-biz':'Vay SXKD / VLĐ',
          'biz-unsec':'Vay DN tín chấp',
          'biz-sec':'Vay DN thế chấp'
        };
        saType.value = map[kind] || 'Đăng ký vay';
      }
      svcApply.classList.add('is-open');
      svcApply.setAttribute('aria-hidden','false');
      document.body.classList.add('modal-open');
      return;
    }
    if(typeof show==='function'){ show('apply'); return; }
    alert('Mời vào mục Đăng ký để hoàn tất thông tin.');
  }

  $$('.cr-apply', creditRoot).forEach(btn=>{
    btn.addEventListener('click', ()=>openApply(btn.dataset.kind||'credit-unsec'));
  });

  $$('[data-action="discover"]', creditRoot).forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(typeof window.openSvc==='function'){ window.openSvc('credit'); }
      else{ creditRoot.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  });
})();

/* ==== CREDIT & STAY (crx*, stx*): tabs + apply ==== */
(function(){
  const $  = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

  // Credit tabs (crx*)
  const credit = $('#view-tindung');
  if(credit){
    const btns = $$('.crx-seg__btn', credit);
    const panels = { per: $('#crx-per', credit), biz: $('#crx-biz', credit) };
    btns.forEach(b=>b.addEventListener('click', ()=>{
      btns.forEach(x=>x.classList.remove('is-active'));
      b.classList.add('is-active');
      const k=b.dataset.tab;
      panels.per?.classList.toggle('is-active', k==='per');
      panels.biz?.classList.toggle('is-active', k==='biz');
      credit.scrollIntoView({behavior:'smooth',block:'start'});
    }));

    // Apply -> svcApplyModal hoặc view Apply
    credit.addEventListener('click', (e)=>{
      const btn = e.target.closest('.crx-apply'); if(!btn) return;
      const title = btn.dataset.title || 'Đăng ký';
      const modal = document.getElementById('svcApplyModal');
      if(modal){
        modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false');
        document.body.classList.add('modal-open');
        const saType = document.getElementById('sa_type'); if(saType) saType.value = title;
      }else if(typeof window.show==='function'){
        show('apply'); const pos = document.getElementById('ap_pos'); if(pos) pos.value = title;
      }
    });
    credit.addEventListener('click', (e)=>{
      if(e.target.closest('.crx-backtop')) credit.scrollIntoView({behavior:'smooth',block:'start'});
    });
  }

  // Stay tabs (stx*)
  const stay = $('#view-luutru');
  if(stay){
    const btns = $$('.stx-seg__btn', stay);
    const panels = { apt: $('#stx-apt', stay), dorm: $('#stx-dorm', stay) };
    btns.forEach(b=>b.addEventListener('click', ()=>{
      btns.forEach(x=>x.classList.remove('is-active'));
      b.classList.add('is-active');
      const k=b.dataset.tab;
      panels.apt?.classList.toggle('is-active', k==='apt');
      panels.dorm?.classList.toggle('is-active', k==='dorm');
      stay.scrollIntoView({behavior:'smooth',block:'start'});
    }));

    stay.addEventListener('click', (e)=>{
      const btn = e.target.closest('.stx-apply'); if(!btn) return;
      const title = btn.dataset.title || 'Đăng ký nhận phòng';
      const modal = document.getElementById('svcApplyModal');
      if(modal){
        modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false');
        document.body.classList.add('modal-open');
        const saType = document.getElementById('sa_type'); if(saType) saType.value = title;
      }else if(typeof window.show==='function'){
        show('apply'); const pos = document.getElementById('ap_pos'); if(pos) pos.value = title;
      }
    });
  }
})();

/* ==== Banking (bk*) ==== */
(function(){
  const root = document.getElementById('view-tindung'); if(!root) return;
  const btns = root.querySelectorAll('.bk-seg__btn');
  const per  = root.querySelector('#bank-per');
  const biz  = root.querySelector('#bank-biz');
  btns.forEach(b=>b.addEventListener('click', ()=>{
    btns.forEach(x=>x.classList.remove('is-active')); b.classList.add('is-active');
    const k = b.dataset.tab;
    per?.classList.toggle('is-active', k==='per'); per?.toggleAttribute('hidden', k!=='per');
    biz?.classList.toggle('is-active', k==='biz'); biz?.toggleAttribute('hidden', k!=='biz');
    root.scrollIntoView({behavior:'smooth',block:'start'});
  }));
})();

/* ===== appended: banking-view interactions ===== */
(function(){
  try{
    const hero = document.querySelector('#view-tindung .bk-hero');
    const sticky = document.querySelector('#view-tindung .sticky-cta');
    if(hero){
      const obs = new IntersectionObserver(entries=>{
        entries.forEach(ent=>{
          if(ent.intersectionRatio < 0.02){
            hero.classList.add('bk-hero--scrolled');
            if(sticky) sticky.hidden = false;
          } else {
            hero.classList.remove('bk-hero--scrolled');
            if(sticky) sticky.hidden = true;
          }
        });
      }, {threshold:[0,0.02], root:null, rootMargin:'-56px 0px 0px 0px'});
      obs.observe(hero);
    }
  }catch(e){console.warn('banking hero observer failed', e)}

  // Accessible details
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Enter' && e.key !== ' ') return;
    const s = document.activeElement;
    if(!s) return;
    if(s.tagName === 'SUMMARY'){
      e.preventDefault();
      const d = s.parentElement;
      if(d) d.open = !d.open;
      setTimeout(()=>{ if(d && d.open) d.scrollIntoView({behavior:'smooth',block:'center'}); }, 80);
    }
  });
})();

/* ===== Discover router (idempotent, đã gộp & tránh trùng lặp) ===== */
(function(){
  var btns = document.querySelectorAll('.svc-act[data-action="discover"]');
  btns.forEach(function(btn){
    if(btn.dataset.boundDiscover) return;
    btn.dataset.boundDiscover = '1';
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var kind = btn.dataset.kind;
      if(kind === 'credit'){
        if(typeof show==='function') show('tindung'); else window.openSvc && window.openSvc('credit');
      }else if(kind === 'stay'){
        if(typeof show==='function') show('luutru'); else window.openSvc && window.openSvc('stay');
        document.getElementById('stayv2') && document.getElementById('stayv2').scrollIntoView({behavior:'smooth',block:'start'});
      }else{
        if(typeof show==='function') show('tintuc');
      }
    });
  });

  // Tile click
  document.querySelectorAll('.svc-tile[data-nav="tindung"]').forEach(el=>{
    el.addEventListener('click', (e)=>{
      if(e.target.closest('.svc-act')) return;
      if(typeof show==='function') show('tindung');
    });
  });
  document.querySelectorAll('.svc-tile[data-nav="kitucxa"]').forEach(el=>{
    el.addEventListener('click', (e)=>{
      if(e.target.closest('.svc-act')) return;
      if(typeof show==='function') show('luutru');
      document.getElementById('stayv2')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
})();
/* ===== LƯU TRÚ v2 (sv2*): tabs + apply ===== */
(function(){
  const root = document.getElementById('stayv2'); if(!root) return;
  const btns = root.querySelectorAll('.sv2-seg__btn');
  const panels = {
    apt: document.getElementById('sv2-apt'),
    dorm2: document.getElementById('sv2-dorm2')
  };
  btns.forEach(b=>{
    b.addEventListener('click', ()=>{
      btns.forEach(x=>{ x.classList.remove('is-active'); x.setAttribute('aria-selected','false'); });
      b.classList.add('is-active'); b.setAttribute('aria-selected','true');
      const k = b.dataset.tab;
      Object.entries(panels).forEach(([key, el])=>{
        const active = (key===k);
        if(!el) return;
        el.classList.toggle('is-active', active);
        el.toggleAttribute('hidden', !active);
      });
      root.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
  root.addEventListener('click', (e)=>{
    const btn = e.target.closest('.sv2-apply'); if(!btn) return;
    const title = btn.dataset.title || 'Đăng ký nhận phòng';
    const modal = document.getElementById('svcApplyModal');
    if(modal){
      modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false');
      document.body.classList.add('modal-open');
      const saType = document.getElementById('sa_type'); if(saType) saType.value = title;
    }else if(typeof window.show==='function'){
      show('apply');
      const pos = document.getElementById('ap_pos'); if(pos) pos.value = title;
      try{ history.replaceState(null,'','#apply'); }catch(e){}
    }
  });
})();


/* LƯU TRÚ: hero sub-title & switch sync */
(function(){
  const root = document.getElementById('stayv2'); if(!root) return;
  const tag = document.getElementById('sv2-heroTag');
  function sync(){
    const active = root.querySelector('.sv2-panel.is-active')?.id || 'sv2-dorm2';
    if(tag) tag.textContent = active==='sv2-apt' ? 'Căn hộ dịch vụ' : 'Kí túc xá (KTX)';
    const sw = root.querySelector('.sv2-switch');
    if(sw){
      sw.dataset.active = active==='sv2-apt' ? 'apt' : 'dorm2';
      sw.querySelectorAll('.sv2-seg__btn').forEach(b=>{
        const on = b.dataset.tab === (active==='sv2-apt' ? 'apt' : 'dorm2');
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on?'true':'false');
      });
    }
  }
  sync();
  root.addEventListener('click', (e)=>{
    if(e.target.closest('.sv2-seg__btn')){
        const sw = root.querySelector('.sv2-switch');
        sw?.classList.add('is-anim');
        setTimeout(()=>sw?.classList.remove('is-anim'), 500);
        setTimeout(sync,0);
      }
  });
  // Notify button scroll
  root.addEventListener('click', (e)=>{
    const n = e.target.closest('.sv2-notify'); if(!n) return;
    const active = root.querySelector('.sv2-panel.is-active')?.id;
    const id = active==='sv2-apt' ? 'offers-apt' : 'offers-ktx';
    document.getElementById(id)?.scrollIntoView({behavior:'smooth', block:'start'});
  });
  // Apply button scroll to contact
  root.addEventListener('click', (e)=>{
    const n = e.target.closest('.sv2-apply'); if(!n) return;
    const active = root.querySelector('.sv2-panel.is-active')?.id;
    const id = active==='sv2-apt' ? 'contact-apt' : 'contact-ktx';
    document.getElementById(id)?.scrollIntoView({behavior:'smooth', block:'start'});
  });
})();
// Sticky CTA scroll
(function(){
  const root = document.getElementById('stayv2'); if(!root) return;
  document.getElementById('stay-sticky')?.addEventListener('click', (e)=>{
    if(!e.target.closest('.sv2-apply')) return;
    const active = root.querySelector('.sv2-panel.is-active')?.id;
    const id = active==='sv2-apt' ? 'contact-apt' : 'contact-ktx';
    document.getElementById(id)?.scrollIntoView({behavior:'smooth', block:'start'});
  });
})();



// KTX chips + lightbox
(function(){
  const root = document.getElementById('stayv2'); if(!root) return;
  // filter chips
  root.addEventListener('click', (e)=>{
    const chip = e.target.closest('.roomx .chip'); if(!chip) return;
    const type = chip.dataset.type;
    chip.parentElement.querySelectorAll('.chip').forEach(c=>c.classList.toggle('is-on', c===chip));
    root.querySelectorAll('#sv2-dorm2 .roomx .flip').forEach(card=>{
      const ok = type==='all' || card.dataset.type===type;
      card.style.display = ok ? '' : 'none';
    });
  });
  // lightbox
  const lb = document.getElementById('stay-lightbox');
  root.addEventListener('click', (e)=>{
    const btn = e.target.closest('.view-img'); if(!btn) return;
    const src = btn.dataset.img;
    if(lb){ lb.querySelector('img').src = src; lb.classList.add('is-open'); }
  });
  lb?.addEventListener('click', ()=> lb.classList.remove('is-open'));
})();
// Lightbox stronger binding and Zalo form handler
(function(){
  const root = document.getElementById('stayv2'); if(!root) return;
  // lightbox: delegate on document for robustness
  const lb = document.getElementById('stay-lightbox');
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.view-img'); if(btn){ 
      const src = btn.dataset.img || btn.getAttribute('data-img');
      if(lb && src){ lb.querySelector('img').src = src; lb.classList.add('is-open'); }
    }
    if(lb && (e.target === lb || e.target.closest('#stay-lightbox img')==null && e.target.closest('.lightbox'))){
      // click backdrop closes
      if(e.target.classList.contains('lightbox')) lb.classList.remove('is-open');
    }
  }, true);

  // Zalo form submit
  const zaloForm = document.getElementById('contact-zalo-ktx')?.querySelector('form');
  zaloForm?.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const f = ev.target;
    const payload = {
      name: f.name.value.trim(),
      phone: f.phone.value.trim(),
      email: f.email.value.trim(),
      room: f.room.value,
      note: f.note.value.trim()
    };
    const msg = `Xin chào, tôi muốn đăng ký xem phòng KTX.\nHọ tên: ${payload.name}\nĐiện thoại: ${payload.phone}\nEmail: ${payload.email}\nLoại phòng: ${payload.room}\nGhi chú: ${payload.note}`;
    // Open Zalo company link
    window.open('https://zalo.me/2857015321649379174', '_blank');
    alert('Đã mở Zalo. Vui lòng dán hoặc gửi thông tin cho CSKH nếu cần.');
  });
})();

// Reveal on scroll
(function(){
  const root = document.getElementById('stayv2'); if(!root) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); } });
  },{threshold:.12});
  root.querySelectorAll('#view-luutru [data-reveal]').forEach(el=>io.observe(el));
})();

// CTA scroll to Zalo contact
(function(){
  const container = document.getElementById('stayv2'); if(!container) return;
  container.addEventListener('click', (e)=>{
    const btn = e.target.closest('.sv2-apply, .sv2-heroActions .btn'); if(!btn) return;
    const target = document.getElementById('contact-zalo-ktx');
    if(target){ target.scrollIntoView({behavior:'smooth', block:'start'}); }
    else { window.open('https://zalo.me/2857015321649379174', '_blank'); }
  });
})();

// Force CTA -> Zalo scroll with capture to override other handlers
(function(){
  const container = document.getElementById('stayv2'); if(!container) return;
  function handler(e){
    const targetBtn = e.target.closest('.sv2-apply'); if(!targetBtn) return;
    // Stop all other click handlers
    e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();
    const contact = document.getElementById('contact-zalo-ktx');
    if(contact){ contact.scrollIntoView({behavior:'smooth', block:'start'}); }
    else{ window.open('https://zalo.me/2857015321649379174','_blank'); }
  }
  // capture=true to intercept before modal handlers
  document.addEventListener('click', handler, true);
})();

// Lưu trú: switch & CTA behavior for new hero
(function(){
  const view = document.getElementById('view-luutru'); if(!view) return;
  const switcher = view.querySelector('.sv2-switch');
  const sub = view.querySelector('#lt-subtitle');
  const dorm = view.querySelector('#sv2-dorm2');
  const apt  = view.querySelector('#sv2-apt');

  function show(tab){
    if(!switcher) return;
    switcher.dataset.active = tab;
    view.querySelectorAll('.sv2-seg__btn').forEach(b=>{
      const on = b.dataset.tab === tab;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    if(sub) sub.textContent = (tab==='dorm2') ? 'Ký túc xá (KTX)' : 'Căn hộ dịch vụ';
    if(dorm) dorm.hidden = (tab!=='dorm2');
    if(apt)  apt.hidden  = (tab!=='apt');
  }
  // init
  show(switcher?.dataset.active || 'dorm2');
  view.addEventListener('click', (e)=>{
    const seg = e.target.closest('.sv2-seg__btn');
    if(seg){ show(seg.dataset.tab); }

    const cta = e.target.closest('.sv2-apply');
    if(cta){
      const active = switcher?.dataset.active || 'dorm2';
      const target = view.querySelector(active==='dorm2' ? '#contact-ktx' : '#contact-apt');
      if(target){ target.scrollIntoView({behavior:'smooth',block:'start'}); }
      else{ window.open('https://zalo.me/2857015321649379174','_blank'); }
    }
  });
})();
/* === UI Enhancements: progress, parallax, ripple, tilt === */
(function enhanceUI(){
  // progress bar
  let bar = document.createElement('div'); bar.className='scroll-progress'; document.body.appendChild(bar);
  function setProg(){
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max ? (h.scrollTop / max) * 100 : 0;
    bar.style.width = p+'%';
  }
  document.addEventListener('scroll', setProg, {passive:true}); setProg();

  // parallax hero word
  const heroWord = document.querySelector('.vf-hero .word');
  if(heroWord){ heroWord.classList.add('parallax'); }
  document.addEventListener('scroll', () => {
    if(!heroWord) return;
    const y = Math.min(40, window.scrollY * 0.06);
    heroWord.style.transform = `translateY(${y}px)`;
  }, {passive:true});

  // ripple coordinates
  document.addEventListener('pointerdown', e=>{
    const t = e.target.closest?.('.btn,.tab,.menu-link'); if(!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty('--rx', (e.clientX - r.left)+'px');
    t.style.setProperty('--ry', (e.clientY - r.top)+'px');
  });

  // auto add tilt to service tiles to tránh sửa HTML
  document.querySelectorAll('.svc-tiles .svc-tile').forEach(el=>{
    el.classList.add('tilt');
    const ico = el.querySelector('.svc-tile__ico'); if(ico) ico.classList.add('tilt-pop');
  });

  // tilt bind
  const TILT_MAX = 10;
  function bindTilt(el){
    let r = el.getBoundingClientRect();
    function onMove(e){
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (0.5 - y) * TILT_MAX;
      const ry = (x - 0.5) * TILT_MAX;
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
    function reset(){ el.style.transform = ''; }
    el.addEventListener('pointerenter', ()=>{ r = el.getBoundingClientRect(); });
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', reset);
  }
  document.querySelectorAll('.tilt').forEach(bindTilt);
})();

/* === Floating Chatbot: rule-based + deep-link vào views === */
(function vfChatbot(){
  const el = {
    root: document.getElementById('vfChat'),
    btn:  document.getElementById('vfChatBtn'),
    panel:document.getElementById('vfChatPanel'),
    close:document.getElementById('vfChatClose'),
    body: document.getElementById('vfChatBody'),
    form: document.getElementById('vfChatForm'),
    input:document.getElementById('vfChatInput')
  };
  if(!el.root) return;

  function open(){ el.panel.classList.add('is-open'); el.panel.setAttribute('aria-hidden','false'); el.btn.setAttribute('aria-expanded','true'); el.body.focus(); }
  function close(){ el.panel.classList.remove('is-open'); el.panel.setAttribute('aria-hidden','true'); el.btn.setAttribute('aria-expanded','false'); }
  el.btn.addEventListener('click', ()=>{ const openState = !el.panel.classList.contains('is-open'); openState ? open() : close(); });
  el.close.addEventListener('click', close);

  function addMsg(txt, who='bot', options={}){
    const wrap = document.createElement('div'); wrap.className = 'msg '+(who==='you'?'you':'bot');
    const b = document.createElement('div'); b.className='bubble'; b.textContent = txt; wrap.appendChild(b);
    if(options.suggest && options.suggest.length){
      const sug = document.createElement('div'); sug.className='suggest';
      options.suggest.forEach(s=>{
        const btn = document.createElement('button'); btn.type='button'; btn.textContent=s.label;
        btn.addEventListener('click', ()=>handleInput(s.send));
        sug.appendChild(btn);
      });
      wrap.appendChild(sug);
    }
    el.body.appendChild(wrap); el.body.scrollTop = el.body.scrollHeight;
  }

  // intents đơn giản, điều hướng qua router show()
  const intents = [
    {test:/\b(tín.?dụng|vay|credit)\b/i, reply:()=>({
      text:'Bạn quan tâm Tín dụng. Chọn nhóm để xem chi tiết.',
      suggest:[
        {label:'Cá nhân', send:'tín dụng cá nhân'},
        {label:'Doanh nghiệp', send:'tín dụng doanh nghiệp'},
        {label:'Hồ sơ cần gì?', send:'hồ sơ vay cần gì'}
      ],
      go:()=>window.show?.('tindung')
    })},
    {test:/\b(cá nhân)\b/i, reply:()=>({text:'Mời xem các gói vay cá nhân.', go:()=>window.show?.('tindung')})},
    {test:/\b(doanh nghiệp|SME)\b/i, reply:()=>({text:'Giải pháp cho doanh nghiệp đã mở.', go:()=>window.show?.('tindung')})},
    {test:/\b(lưu trú|căn hộ|ký túc|stay|home)\b/i, reply:()=>({
      text:'Bạn quan tâm lưu trú. Mời chọn:',
      suggest:[
        {label:'Căn hộ dịch vụ', send:'căn hộ'},
        {label:'Ký túc xá', send:'ký túc xá'}
      ],
      go:()=>window.show?.('luutru')
    })},
    {test:/\b(căn hộ)\b/i, reply:()=>({text:'Đã chuyển tới Căn hộ dịch vụ.', go:()=>{window.location.hash='#stay'; window.show?.('luutru');}})},
    {test:/\b(ký túc|ktx)\b/i, reply:()=>({text:'Đã mở mục Ký túc xá.', go:()=>{window.location.hash='#stay'; window.show?.('luutru');}})},
    {test:/\b(tuyển dụng|việc làm|job)\b/i, reply:()=>({text:'Đã mở Tuyển dụng.', go:()=>window.show?.('tuyendung')})},
    {test:/\b(tin tức|thông báo|news|lãi suất)\b/i, reply:()=>({text:'Đã mở Tin tức/Thông báo.', go:()=>window.show?.('tintuc')})},
    {test:/\b(hồ sơ|giấy tờ)\b/i, reply:()=>({text:'Hồ sơ cơ bản: CCCD, sao kê thu nhập. Có thể cần TSĐB/HĐLĐ/BHNT tùy gói.'})},
    {test:/\b(liên hệ|tư vấn|đăng ký)\b/i, reply:()=>({text:'Bạn muốn đăng ký tư vấn. Mời điền form ngắn.', go:()=>window.show?.('apply')})}
  ];

  function handleInput(raw){
    const q = String(raw||'').trim();
    if(!q) return;
    addMsg(q, 'you');
    const intent = intents.find(it => it.test.test(q));
    if(intent){
      const out = intent.reply();
      addMsg(out.text, 'bot', {suggest:out.suggest});
      out.go && out.go();
    }else{
      addMsg('Bạn muốn xem Tín dụng, Lưu trú, Tuyển dụng hay Đăng ký tư vấn?', 'bot', {
        suggest:[
          {label:'Tín dụng', send:'tín dụng'},
          {label:'Lưu trú', send:'lưu trú'},
          {label:'Tuyển dụng', send:'tuyển dụng'},
          {label:'Đăng ký', send:'đăng ký'}
        ]
      });
    }
  }

  el.form.addEventListener('submit', e=>{ e.preventDefault(); handleInput(el.input.value); el.input.value=''; el.input.focus(); });

  // chào mừng
  addMsg('Xin chào! Tôi là trợ lý VietForture. Tôi có thể giúp gì cho bạn?', 'bot', {
    suggest:[
      {label:'Tín dụng', send:'tín dụng'},
      {label:'Lưu trú', send:'lưu trú'},
      {label:'Tuyển dụng', send:'tuyển dụng'}
    ]
  });
})();
/* === VIETBOT: intro nhảy và dock thành nút chat === */
(function vietbotIntro(){
  const intro = document.getElementById('vietbotIntro');
  const svg = document.getElementById('vietbotSVG');
  const btn = document.getElementById('vfChatBtn');
  if(!intro || !svg || !btn) return;

  // hiển thị intro 1 lần mỗi phiên
  const KEY = 'vf_vietbot_seen';
  if(sessionStorage.getItem(KEY)) { attachMiniIcon(); return; }

  intro.classList.add('is-on');
  svg.classList.add('vb-in');
  const shadow = intro.querySelector('.vietbot-shadow');

  // chuỗi animation
  setTimeout(()=>{ svg.classList.remove('vb-in'); svg.classList.add('vb-hop'); shadow.classList.add('vb-shadow-hop'); }, 520);
  setTimeout(()=>{ svg.classList.remove('vb-hop'); shadow.classList.remove('vb-shadow-hop'); svg.classList.add('vb-dock'); }, 2400);
  setTimeout(()=>{ // ẩn intro, gắn icon nhỏ vào nút chat
    intro.classList.remove('is-on');
    attachMiniIcon();
    sessionStorage.setItem(KEY, '1');
  }, 3200);

  // tạo icon nhỏ cho nút chat
  function attachMiniIcon(){
    btn.classList.add('has-vietbot');
    btn.innerHTML = miniSVG();
  }

  function miniSVG(){
    return `
    <svg class="vb-mini" viewBox="0 0 44 48" aria-hidden="true">
      <defs>
        <linearGradient id="mRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ff6b79"/><stop offset="1" stop-color="#c1121f"/>
        </linearGradient>
      </defs>
      <rect x="16" y="2" width="4" height="6" rx="2" fill="url(#mRed)"/>
      <circle cx="18" cy="2" r="4" fill="url(#mRed)"/>
      <rect x="6" y="6" width="32" height="22" rx="10" fill="#fff" stroke="#c1121f" stroke-width="3"/>
      <rect x="11" y="10" width="22" height="14" rx="7" fill="#0b1220"/>
      <circle cx="18" cy="17" r="2" fill="#36d399"/><circle cx="26" cy="17" r="2" fill="#36d399"/>
      <path d="M15 21 Q22 24 29 21" stroke="#36d399" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="10" y="28" width="24" height="14" rx="8" fill="#fff" stroke="#c1121f" stroke-width="3"/>
      <circle cx="22" cy="35" r="4" fill="url(#mRed)"/>
    </svg>`;
  }
})();
/* === VIETBOT: chào theo giờ Việt Nam + làm header dễ thương === */
(function vietbotGreeting(){
  const head = document.querySelector('#vfChatPanel .vfchat-head');
  const close = document.getElementById('vfChatClose');
  if(!head || !close) return;

  // avatar SVG nhỏ, đỏ trắng
  const avatar = `
    <svg viewBox="0 0 44 48" aria-hidden="true">
      <defs>
        <linearGradient id="vbMiniRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ff8a96"/><stop offset="1" stop-color="#c1121f"/>
        </linearGradient>
      </defs>
      <rect x="16" y="2" width="4" height="6" rx="2" fill="url(#vbMiniRed)"/>
      <circle cx="18" cy="2" r="4" fill="url(#vbMiniRed)"/>
      <rect x="6" y="6" width="32" height="22" rx="10" fill="#fff" stroke="#c1121f" stroke-width="3"/>
      <rect x="11" y="10" width="22" height="14" rx="7" fill="#0b1220"/>
      <circle cx="18" cy="17" r="2" fill="#36d399"/><circle cx="26" cy="17" r="2" fill="#36d399"/>
      <path d="M15 21 Q22 24 29 21" stroke="#36d399" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="10" y="28" width="24" height="14" rx="8" fill="#fff" stroke="#c1121f" stroke-width="3"/>
      <circle cx="22" cy="35" r="4" fill="url(#vbMiniRed)"/>
    </svg>`;

  // dựng lại phần trái của header với avatar + tên
  const left = document.createElement('div');
  left.className = 'vb-badge';
  left.innerHTML = `${avatar}<strong>VIETBOT</strong>`;

  // chèn vào đầu header, vẫn giữ nút đóng
  head.insertBefore(left, head.firstChild);

  // chào theo giờ VN
  function greetVN(){
    const now = new Date();
    const hourVN = Number(new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', hour12: false, timeZone: 'Asia/Ho_Chi_Minh'
    }).format(now));

    const buoi = hourVN < 12 ? 'buổi sáng' : (hourVN < 18 ? 'buổi chiều' : 'buổi tối');
    return `Chào ${buoi}! Tôi là VIETBOT.`;
  }

  // nếu chatbot đã có đoạn chào mặc định trước đó, bỏ qua; còn không thì chào mới
  const body = document.getElementById('vfChatBody');
  if(body && !body.querySelector('.msg')) {
    // thêm gợi ý như cũ
    const suggest = [
      {label:'Tín dụng', send:'tín dụng'},
      {label:'Lưu trú', send:'lưu trú'},
      {label:'Tuyển dụng', send:'tuyển dụng'}
    ];
    // tận dụng addMsg và handleInput đã có
    const addMsg = (txt, who='bot', options={})=>{
      const wrap = document.createElement('div'); wrap.className = 'msg '+(who==='you'?'you':'bot');
      const b = document.createElement('div'); b.className='bubble'; b.textContent = txt; wrap.appendChild(b);
      if(options.suggest && options.suggest.length){
        const sug = document.createElement('div'); sug.className='suggest';
        options.suggest.forEach(s=>{
          const btn = document.createElement('button'); btn.type='button'; btn.textContent=s.label;
          btn.addEventListener('click', ()=>document.getElementById('vfChatInput').value=s.send);
          sug.appendChild(btn);
        });
        wrap.appendChild(sug);
      }
      body.appendChild(wrap); body.scrollTop = body.scrollHeight;
    };
    addMsg(greetVN(), 'bot', {suggest});
  }
})();
/* === VIETBOT: chào VN, vẫy tay, dock mượt tới đúng nút chat === */
(function vietbotIntro(){
  const intro = document.getElementById('vietbotIntro');
  const svg   = document.getElementById('vietbotSVG');
  const sayEl = document.getElementById('vietbotGreet');
  const btn   = document.getElementById('vfChatBtn');
  const shadow= document.querySelector('.vietbot-shadow');
  if(!intro || !svg || !sayEl || !btn || !shadow) return;

  // chạy lại intro phiên này
  const KEY = 'vf_vietbot_seen_v4';
  if(sessionStorage.getItem(KEY)) { attachMiniIcon(); return; }

  // 1) Lời chào theo giờ Việt Nam
  function vnGreeting(){
    const h = Number(new Intl.DateTimeFormat('en-US',{hour:'numeric',hour12:false,timeZone:'Asia/Ho_Chi_Minh'}).format(new Date()));
    const buoi = h < 12 ? 'SÁNG' : (h < 18 ? 'CHIỀU' : 'TỐI');
    return `VIETFORTURE CHÀO BUỔI ${buoi}`;
    // nếu muốn: + ` — Tôi là VIETBOT`
  }
  sayEl.textContent = vnGreeting();

  // 2) Hiện intro, nhảy, vẫy
  intro.classList.add('is-on');           // hiện toast
  svg.classList.add('vb-in');             // float in
  setTimeout(()=>{                         // hop + wave
    svg.classList.remove('vb-in');
    svg.classList.add('vb-hop','vb-wave');
    shadow.classList.add('vb-shadow-hop');
  }, 480);

  // 3) Dock mượt: dùng Web Animations API tới đúng tọa độ nút chat
  setTimeout(()=>{
    svg.classList.remove('vb-hop','vb-wave');
    shadow.classList.remove('vb-shadow-hop');

    // vị trí hiện tại của robot
    const botBox = svg.getBoundingClientRect();
    // tâm mục tiêu: giữa nút chat
    const btnBox = btn.getBoundingClientRect();
    const targetX = btnBox.left + btnBox.width/2;
    const targetY = btnBox.top  + btnBox.height/2;

    // tâm hiện tại của robot
    const botX = botBox.left + botBox.width/2;
    const botY = botBox.top  + botBox.height/2;

    // delta
    const dx = targetX - botX;
    const dy = targetY - botY;

    // animate translate + scale mượt
    const anim = svg.animate([
      { transform: `translate(0px,0px) scale(1)`, offset: 0 },
      { transform: `translate(${dx*0.6}px,${dy*0.6}px) scale(0.6)`, offset: 0.6 },
      { transform: `translate(${dx}px,${dy}px) scale(0.25)`, offset: 1 }
    ], { duration: 720, easing: 'cubic-bezier(.22,.9,.26,1)', fill: 'forwards' });

    anim.onfinish = () => {
      intro.classList.remove('is-on');   // ẩn toast
      attachMiniIcon();                  // gắn icon vào nút chat
      sessionStorage.setItem(KEY,'1');
    };
  }, 2100);

  function attachMiniIcon(){
    btn.classList.add('has-vietbot');
    btn.innerHTML = miniSVG();
  }
  function miniSVG(){
    return `
    <svg class="vb-mini" viewBox="0 0 44 48" aria-hidden="true">
      <defs><linearGradient id="mRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a96"/><stop offset="1" stop-color="#c1121f"/></linearGradient></defs>
      <rect x="16" y="2" width="4" height="6" rx="2" fill="url(#mRed)"/>
      <circle cx="18" cy="2" r="4" fill="url(#mRed)"/>
      <rect x="6" y="6" width="32" height="22" rx="10" fill="#fff" stroke="#c1121f" stroke-width="3"/>
      <rect x="11" y="10" width="22" height="14" rx="7" fill="#0b1220"/>
      <circle cx="18" cy="17" r="2" fill="#36d399"/><circle cx="26" cy="17" r="2" fill="#36d399"/>
      <path d="M15 21 Q22 24 29 21" stroke="#36d399" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="10" y="28" width="24" height="14" rx="8" fill="#fff" stroke="#c1121f" stroke-width="3"/>
      <circle cx="22" cy="35" r="4" fill="url(#mRed)"/>
    </svg>`;
  }
})();
//* === VIETBOT: overlay tối, chào VN ở giữa, vẫy tay, dock mượt, ẩn khung chào khi dock === */
(function vietbotIntro(){
  const intro = document.getElementById('vietbotIntro');
  const svg   = document.getElementById('vietbotSVG');
  const sayBox= document.getElementById('vietbotSay');
  const greet = document.getElementById('vietbotGreet');
  const btn   = document.getElementById('vfChatBtn');
  const shadow= intro?.querySelector('.vietbot-shadow');
  if(!intro || !svg || !sayBox || !greet || !btn || !shadow) return;

  // chạy lại intro sau chỉnh
  const KEY='vf_vietbot_seen_v8'; sessionStorage.removeItem(KEY);

  // chào theo giờ VN
  function vnGreeting(){
    const h = Number(new Intl.DateTimeFormat('en-US',{hour:'numeric',hour12:false,timeZone:'Asia/Ho_Chi_Minh'}).format(new Date()));
    const buoi = h < 12 ? 'SÁNG' : (h < 18 ? 'CHIỀU' : 'TỐI');
    return `VIETFORTURE CHÀO BUỔI ${buoi}`;
  }

  if(!sessionStorage.getItem(KEY)){
    greet.textContent = vnGreeting();

    // bật overlay + float-in
    intro.classList.add('is-on');
    svg.classList.add('vb-in');

    // hop + vẫy, giữ khung chào
    setTimeout(()=>{
      svg.classList.remove('vb-in');
      svg.classList.add('vb-hop','vb-wave');
      shadow.classList.add('vb-shadow-hop');
    }, 500);

    // bắt đầu dock: ẩn khung chào trước khi trượt
    setTimeout(()=>{ sayBox.classList.add('hide'); }, 1900);

    // dock mượt tới nút chat
    setTimeout(()=>{
      svg.classList.remove('vb-hop','vb-wave');
      shadow.classList.remove('vb-shadow-hop');

      const bot = svg.getBoundingClientRect();
      const tgt = btn.getBoundingClientRect();
      const dx = (tgt.left + tgt.width/2) - (bot.left + bot.width/2);
      const dy = (tgt.top  + tgt.height/2) - (bot.top  + bot.height/2);

      if(svg.animate){
        svg.animate([
          { transform: 'translate(0,0) scale(1)' },
          { transform: `translate(${dx*0.62}px,${dy*0.62}px) scale(.62)`, offset:.62 },
          { transform: `translate(${dx}px,${dy}px) scale(.25)` }
        ], { duration: 780, easing: 'cubic-bezier(.22,.9,.26,1)', fill: 'forwards' })
        .addEventListener('finish', done);
      }else{
        svg.style.setProperty('--dx', dx+'px');
        svg.style.setProperty('--dy', dy+'px');
        svg.style.animation='vbDockEase .78s cubic-bezier(.22,.9,.26,1) forwards';
        setTimeout(done, 800);
      }

      function done(){
        intro.classList.remove('is-on');      // tắt overlay
        btn.classList.add('has-vietbot');
        btn.innerHTML = miniSVG();
        sessionStorage.setItem(KEY,'1');
      }
    }, 2100);
  }

  function miniSVG(){
    return `
    <svg class="vb-mini" viewBox="0 0 44 48" aria-hidden="true">
      <defs><linearGradient id="mRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff93a0"/><stop offset="1" stop-color="#c1121f"/></linearGradient></defs>
      <rect x="16" y="2" width="4" height="6" rx="2" fill="url(#mRed)"/><circle cx="18" cy="2" r="4" fill="url(#mRed)"/>
      <rect x="6" y="6" width="32" height="22" rx="10" fill="#fff" stroke="#c1121f" stroke-width="3"/>
      <rect x="11" y="10" width="22" height="14" rx="7" fill="#0b1220"/>
      <circle cx="18" cy="17" r="2" fill="#36d399"/><circle cx="26" cy="17" r="2" fill="#36d399"/>
      <path d="M15 21 Q22 24 29 21" stroke="#36d399" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="10" y="28" width="24" height="14" rx="8" fill="#fff" stroke="#c1121f" stroke-width="3"/>
      <circle cx="22" cy="35" r="4" fill="url(#mRed)"/>
    </svg>`;
  }
})();
/* === VIETBOT v10: overlay tối, chào VN giữa, tay chuẩn, dock mượt === */
(function vietbotV10(){
  const intro = document.getElementById('vietbotIntro');
  const svg   = document.getElementById('vietbotSVG');
  const sayBox= document.getElementById('vietbotSay');
  const greet = document.getElementById('vietbotGreet');
  const btn   = document.getElementById('vfChatBtn');
  const shadow= intro?.querySelector('.vietbot-shadow');
  if(!intro || !svg || !sayBox || !greet || !btn || !shadow) return;

  // ép chạy intro lại
  const KEY='vf_vietbot_seen_v10'; sessionStorage.removeItem(KEY);

  function vnGreeting(){
    const h = Number(new Intl.DateTimeFormat('en-US',{hour:'numeric',hour12:false,timeZone:'Asia/Ho_Chi_Minh'}).format(new Date()));
    const buoi = h < 12 ? 'SÁNG' : (h < 18 ? 'CHIỀU' : 'TỐI');
    return `VIETFORTURE CHÀO BUỔI ${buoi}`;
  }

  if(!sessionStorage.getItem(KEY)){
    greet.textContent = vnGreeting();
    intro.classList.add('is-on');
    svg.classList.add('vb-in');

    // hop + vẫy
    setTimeout(()=>{
      svg.classList.remove('vb-in');
      svg.classList.add('vb-hop','vb-wave');
      shadow.classList.add('vb-shadow-hop');
      centerBubble(); // đảm bảo bubble thật sự giữa
    }, 480);

    // Ẩn bubble trước khi dock
    setTimeout(()=>{ sayBox.classList.add('hide'); }, 1850);

    // dock mượt về nút chat
    setTimeout(()=>{
      svg.classList.remove('vb-hop','vb-wave');
      shadow.classList.remove('vb-shadow-hop');

      const bot = svg.getBoundingClientRect();
      const tgt = btn.getBoundingClientRect();
      const dx = (tgt.left + tgt.width/2) - (bot.left + bot.width/2);
      const dy = (tgt.top  + tgt.height/2) - (bot.top  + bot.height/2);

      if(svg.animate){
        svg.animate([
          { transform: 'translate(0,0) scale(1)' },
          { transform: `translate(${dx*0.62}px,${dy*0.62}px) scale(.62)`, offset:.62 },
          { transform: `translate(${dx}px,${dy}px) scale(.25)` }
        ], { duration: 780, easing: 'cubic-bezier(.22,.9,.26,1)', fill: 'forwards' })
        .addEventListener('finish', done);
      }else{
        svg.style.setProperty('--dx', dx+'px');
        svg.style.setProperty('--dy', dy+'px');
        svg.style.animation='vbDockEase .78s cubic-bezier(.22,.9,.26,1) forwards';
        setTimeout(done, 800);
      }

      function done(){
        intro.classList.remove('is-on');      // tắt overlay
        btn.classList.add('has-vietbot');
        btn.innerHTML = miniSVG();
        sessionStorage.setItem(KEY,'1');
      }
    }, 2100);
  }

  // Bubble luôn giữa và không đè tay
  function centerBubble(){
    const stage = document.querySelector('.vietbot-stage');
    if(!stage) return;
    const sb = sayBox.getBoundingClientRect();
    const head = document.getElementById('vbHead').getBoundingClientRect();
    // nếu bubble đè đầu/tay => đẩy lên thêm 8px
    const collide = !(sb.right < head.left || sb.left > head.right || sb.bottom < head.top || sb.top > head.bottom);
    if(collide){ sayBox.style.top = '6%'; } else { sayBox.style.top = '10%'; }
  }

  function miniSVG(){
    return `
    <svg class="vb-mini" viewBox="0 0 44 48" aria-hidden="true">
      <defs><linearGradient id="mRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9aa6"/><stop offset="1" stop-color="#c1121f"/></linearGradient></defs>
      <rect x="16" y="2" width="4" height="6" rx="2" fill="url(#mRed)"/><circle cx="18" cy="2" r="4" fill="url(#mRed)"/>
      <rect x="6" y="6" width="32" height="22" rx="10" fill="#fff" stroke="#c1121f" stroke-width="3"/>
      <rect x="11" y="10" width="22" height="14" rx="7" fill="#0b1220"/>
      <circle cx="18" cy="17" r="2" fill="#36d399"/><circle cx="26" cy="17" r="2" fill="#36d399"/>
      <path d="M15 21 Q22 24 29 21" stroke="#36d399" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="10" y="28" width="24" height="14" rx="8" fill="#fff" stroke="#c1121f" stroke-width="3"/>
      <circle cx="22" cy="35" r="4" fill="url(#mRed)"/>
    </svg>`;
  }
})();
/* === VIETBOT v11: fix tay lộ + hiệu ứng halo & pháo sáng, vẫn giữ code cũ === */
(function vietbotPatch(){
  const intro = document.getElementById('vietbotIntro');
  const svg   = document.getElementById('vietbotSVG');
  const hand  = document.getElementById('vbHand');
  const stage = document.querySelector('.vietbot-stage');
  if(!intro || !svg || !hand || !stage) return;

  // 1) Ngăn lộ tay khi CSS chưa tải: đặt tay về 0deg ngay lập tức
  try{ hand.setAttribute('transform','rotate(0 192 164)'); }catch(e){}

  // 2) Khi chuẩn bị chạy intro, bỏ hidden rồi thêm lớp .is-on như code cũ đang làm
  //    Nếu IIFE trước đã bật intro thì khối này không can thiệp.

  // 3) Đặc sắc: halo + pháo sáng khi .vb-wave được thêm vào #vietbotSVG
  let halo = document.createElement('div'); halo.className='vb-halo'; stage.appendChild(halo);

  const obs = new MutationObserver(()=>{
    if(svg.classList.contains('vb-wave')) { emitHalo(); emitSparks(12); }
  });
  obs.observe(svg, {attributes:true, attributeFilter:['class']});

  function emitHalo(){
    halo.classList.remove('on');
    // force reflow để restart animation
    // eslint-disable-next-line no-unused-expressions
    halo.offsetHeight;
    halo.classList.add('on');
  }

  function emitSparks(n=12){
    const boxH = hand.getBoundingClientRect();
    const boxS = stage.getBoundingClientRect();
    const baseX = boxH.left + boxH.width/2 - boxS.left;
    const baseY = boxH.top  + boxH.height/2 - boxS.top;

    for(let i=0;i<n;i++){
      const d = document.createElement('div');
      d.className='vb-spark';
      d.style.left = (baseX + (Math.random()*24-12))+'px';
      d.style.top  = (baseY + (Math.random()*16-20))+'px';
      const ang = (Math.random()*Math.PI/2 - Math.PI/6); // toả lên trên
      const dist = 60 + Math.random()*40;
      d.style.setProperty('--sx',  Math.cos(ang)*dist+'px');
      d.style.setProperty('--sy', -Math.abs(Math.sin(ang))*dist - 30 +'px');
      stage.appendChild(d);
      setTimeout(()=>d.remove(), 720);
    }
  }

  // 4) Đổi version key để bạn thấy hiệu ứng ngay lần tới
  try{ sessionStorage.removeItem('vf_vietbot_seen_v10'); }catch(e){}
})();
/* === VIETBOT Greeting Style A + panel intro === */
(function greetStyleA(){
  const MESSENGER_PAGE = '61579142315521'; // dùng page bạn đã cung cấp
  const panel = document.getElementById('vfChatPanel');
  const btn   = document.getElementById('vfChatBtn');

  // 1) Bubble trên robot: "VIETFORTURE chào buổi {sáng|chiều|tối}"
  const gEl = document.getElementById('vietbotGreet');
  if(gEl){
    const h = Number(new Intl.DateTimeFormat('vi-VN',{hour:'numeric',hour12:false,timeZone:'Asia/Ho_Chi_Minh'}).format(new Date()));
    const buoi = h < 12 ? 'sáng' : (h < 18 ? 'chiều' : 'tối');
    gEl.textContent = `VIETFORTURE chào buổi ${buoi}`;
  }

  // 2) Panel mở lần đầu: “Tôi là VIETBOT. Chọn: …”
  const KEY = 'vf_panel_greet_styleA';
  function addMsgA(text, actions){
    const body = document.getElementById('vfChatBody'); if(!body) return;
    const wrap = document.createElement('div'); wrap.className='msg bot';
    const b = document.createElement('div'); b.className='bubble'; b.textContent = text;
    wrap.appendChild(b);

    if(actions && actions.length){
      const sug = document.createElement('div'); sug.className='suggest';
      actions.forEach(([label, fn])=>{
        const bt = document.createElement('button'); bt.type='button'; bt.textContent=label;
        bt.addEventListener('click', fn);
        sug.appendChild(bt);
      });
      wrap.appendChild(sug);
    }
    body.appendChild(wrap); body.scrollTop = body.scrollHeight;
  }

  function routeStay(){ try{ window.show && window.show('luutru'); }catch(e){} if(location.hash!=='#stay') location.hash='#stay'; }
  function routeCredit(){ try{ window.show && window.show('tindung'); }catch(e){} }
  function routeJobs(){ try{ window.show && window.show('tuyendung'); }catch(e){} }
  function openMessenger(){
    try{ if(window.FB && FB.CustomerChat){ FB.CustomerChat.show(true); FB.CustomerChat.showDialog(); } }catch(e){}
    window.open(`https://m.me/${MESSENGER_PAGE}?ref=vietbot`,'_blank','noopener');
  }

  function greetPanelOnce(){
    if(sessionStorage.getItem(KEY)) return;
    addMsgA('Tôi là VIETBOT. Chọn:', [
      ['Tín dụng', routeCredit],
      ['Lưu trú', routeStay],
      ['Tuyển dụng', routeJobs],
      ['Chat trực tiếp', openMessenger]
    ]);
    sessionStorage.setItem(KEY,'1');
  }

  btn && btn.addEventListener('click', ()=>setTimeout(()=>{
    if(panel && panel.classList.contains('is-open')) greetPanelOnce();
  },120));
  panel && new MutationObserver(()=>{ if(panel.classList.contains('is-open')) greetPanelOnce(); })
    .observe(panel,{attributes:true,attributeFilter:['class']});
})();
/* === VIETBOT v12: chào kiểu A, robot nâng cấp, halo+pháo sáng, bounce, chips, typing, handoff, intent === */
(function vietbotV12(){
  const intro = document.getElementById('vietbotIntro');
  const svg   = document.getElementById('vietbotSVG');
  const sayBox= document.getElementById('vietbotSay');
  const greet = document.getElementById('vietbotGreet');
  const skip  = document.getElementById('vbSkip');
  const btn   = document.getElementById('vfChatBtn');
  const panel = document.getElementById('vfChatPanel');
  const stage = document.querySelector('.vietbot-stage');
  const shadow= intro?.querySelector('.vietbot-shadow');
  if(!intro || !svg || !sayBox || !greet || !btn || !shadow || !stage) return;

  // cấu hình
  const VERSION_KEY='vf_vietbot_seen_v12';
  const RUN_MODE='drop'; // 'drop' hoặc 'run' (mini-run từ mép phải)
  const MESSENGER_PAGE='61579142315521';
  const ZALO_OAID='YOUR_ZALO_OAID'; // cập nhật khi có

  // tránh FOUC tay
  const hand = document.getElementById('vbHand');
  try{ hand.setAttribute('transform','rotate(0 192 164)'); }catch(e){}

  // 1) Bubble: chào kiểu A
  function vnGreeting(){
    const h = Number(new Intl.DateTimeFormat('vi-VN',{hour:'numeric',hour12:false,timeZone:'Asia/Ho_Chi_Minh'}).format(new Date()));
    const buoi = h < 12 ? 'sáng' : (h < 18 ? 'chiều' : 'tối');
    return `VIETFORTURE chào buổi ${buoi}`;
  }
  greet.textContent = vnGreeting();

  // skip lần sau
  skip.addEventListener('click', ()=>{ sessionStorage.setItem('vf_vietbot_skip','1'); closeIntro(); });

  // hiển thị intro nếu không skip
  if(!sessionStorage.getItem('vf_vietbot_skip')){
    intro.removeAttribute('hidden');
    runIntro();
  }

  function runIntro(){
    sessionStorage.removeItem(VERSION_KEY);
    intro.classList.add('is-on');

    if(RUN_MODE==='run'){
      // mini-run từ phải
      svg.style.transform='translateX(160px) translateY(24px) scale(.9)';
      svg.animate([
        { transform:'translateX(160px) translateY(24px) scale(.9)', opacity:0 },
        { transform:'translateX(40px) translateY(0) scale(1)', opacity:1, offset:.6 },
        { transform:'translateX(0px) translateY(0) scale(1)' }
      ], {duration:520, easing:'cubic-bezier(.2,.8,.2,1)', fill:'forwards'});
    }else{
      svg.classList.add('vb-in');
    }

    setTimeout(()=>{
      svg.classList.remove('vb-in');
      svg.classList.add('vb-hop','vb-wave','vb-beat'); // hop + wave 2 nhịp + anten beat
      shadow.classList.add('vb-shadow-hop');
      emitHalo(); emitSparks(8);
    }, 520);

    // Ẩn bubble trước khi dock
    setTimeout(()=>{ sayBox.classList.add('hide'); }, 1050+580);

    // Dock mượt + bounce
    setTimeout(()=>{
      svg.classList.remove('vb-hop','vb-wave','vb-beat');
      shadow.classList.remove('vb-shadow-hop');

      const bot = svg.getBoundingClientRect();
      const tgt = btn.getBoundingClientRect();
      const dx = (tgt.left + tgt.width/2) - (bot.left + bot.width/2);
      const dy = (tgt.top  + tgt.height/2) - (bot.top  + bot.height/2);

      if(svg.animate){
        svg.animate([
          { transform: 'translate(0,0) scale(1)' },
          { transform: `translate(${dx*0.62}px,${dy*0.62}px) scale(.62)`, offset:.62 },
          { transform: `translate(${dx}px,${dy}px) scale(.25)` }
        ], { duration: 780, easing: 'cubic-bezier(.22,.9,.26,1)', fill: 'forwards' })
        .addEventListener('finish', ()=>{
          // bounce nhẹ sau khi tới nút
          svg.animate([
            { transform: `translate(${dx}px,${dy}px) scale(.25)` },
            { transform: `translate(${dx}px,${dy-6}px) scale(.26)` , offset:.4 },
            { transform: `translate(${dx}px,${dy}px) scale(.25)` }
          ], { duration: 260, easing:'ease-out', fill:'forwards' }).addEventListener('finish', done);
        });
      }else{
        svg.style.setProperty('--dx', dx+'px');
        svg.style.setProperty('--dy', dy+'px');
        svg.style.animation='vbDockEase .78s cubic-bezier(.22,.9,.26,1) forwards';
        setTimeout(done, 800);
      }
    }, 520+580);

    function done(){ closeIntro(); focusChatBtn(); sessionStorage.setItem(VERSION_KEY,'1'); }
  }

  function closeIntro(){ intro.classList.remove('is-on'); }
  function focusChatBtn(){ try{ btn.focus(); }catch(e){} }

  // Halo + sparks
  function emitHalo(){
    const halo = stage.querySelector('.vb-halo'); if(!halo) return;
    halo.classList.remove('on'); void halo.offsetHeight; halo.classList.add('on');
  }
  function emitSparks(n){
    const boxH = hand.getBoundingClientRect(); const boxS = stage.getBoundingClientRect();
    const baseX = boxH.left + boxH.width/2 - boxS.left; const baseY = boxH.top + boxH.height/2 - boxS.top;
    for(let i=0;i<n;i++){
      const d = document.createElement('div'); d.className='vb-spark';
      d.style.left = (baseX + (Math.random()*24-12))+'px';
      d.style.top  = (baseY + (Math.random()*16-20))+'px';
      const ang = (Math.random()*Math.PI/2 - Math.PI/6); const dist = 60 + Math.random()*40;
      d.style.setProperty('--sx',  Math.cos(ang)*dist+'px'); d.style.setProperty('--sy', -Math.abs(Math.sin(ang))*dist - 30 +'px');
      stage.appendChild(d); setTimeout(()=>d.remove(), 720);
    }
  }

  /* ===== Chatbot enhancements ===== */
  // Quick chips khi mở panel + typing + handoff + intent
  const openMessenger=()=>{ try{ if(window.FB&&FB.CustomerChat){FB.CustomerChat.show(true);FB.CustomerChat.showDialog();} }catch(e){} window.open(`https://m.me/${MESSENGER_PAGE}?ref=vietbot`,'_blank','noopener'); };
  const openZalo=()=>{ if(!ZALO_OAID||ZALO_OAID==='YOUR_ZALO_OAID'){alert('Chưa cấu hình Zalo OAID');return;} window.open(`https://zalo.me/${ZALO_OAID}`,'_blank','noopener'); };
  const callHotline=()=>{ window.location.href='tel:+84000000000'; }; // cập nhật số thật nếu có

  function addTyping(ms){
    const body = document.getElementById('vfChatBody'); if(!body) return Promise.resolve();
    const wrap = document.createElement('div'); wrap.className='msg bot';
    const t = document.createElement('div'); t.className='typing'; t.innerHTML='<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    wrap.appendChild(t); body.appendChild(wrap); body.scrollTop = body.scrollHeight;
    return new Promise(res=>setTimeout(()=>{ wrap.remove(); res(); }, ms));
  }
  function addMsg(text){
    const body = document.getElementById('vfChatBody'); if(!body) return;
    const wrap = document.createElement('div'); wrap.className='msg bot';
    const b = document.createElement('div'); b.className='bubble'; b.textContent=text; wrap.appendChild(b);
    body.appendChild(wrap); body.scrollTop = body.scrollHeight;
  }
  function injectChips(){
    const body = document.getElementById('vfChatBody'); if(!body) return;
    if(body.querySelector('.chat-quickchips')) return;
    const row = document.createElement('div'); row.className='chat-quickchips';
    const chips = [
      ['Tín dụng', ()=>route('tindung')],
      ['Lưu trú', ()=>route('luutru','#stay')],
      ['Tuyển dụng', ()=>route('tuyendung')],
      ['Đăng ký', ()=>openMiniForm()],
      ['Messenger', openMessenger],
      ['Zalo', openZalo],
      ['Gọi', callHotline]
    ];
    chips.forEach(([label,fn])=>{ const c=document.createElement('button'); c.type='button'; c.className='chip'; c.textContent=label; c.onclick=()=>{fn(); trackIntent(label.toLowerCase());}; row.appendChild(c); });
    body.appendChild(row); body.scrollTop = body.scrollHeight;
  }
  function route(id, hash){
    try{ if(typeof window.show==='function') window.show(id); }catch(e){}
    if(hash && location.hash!==hash) location.hash=hash;
    const sec = document.querySelector(`[data-view="${id}"], #${id}, section#${id}`);
    sec && sec.scrollIntoView({behavior:'smooth', block:'start'});
  }

  // greet panel lần đầu theo kiểu A + chips + gợi ý theo thời điểm
  const PANEL_KEY='vf_panel_greet_styleA_v12';
  document.getElementById('vfChatBtn')?.addEventListener('click', ()=>setTimeout(async ()=>{
    if(!panel || !panel.classList.contains('is-open')) return;
    if(sessionStorage.getItem(PANEL_KEY)) { injectChips(); return; }
    const h = Number(new Intl.DateTimeFormat('vi-VN',{hour:'numeric',hour12:false,timeZone:'Asia/Ho_Chi_Minh'}).format(new Date()));
    const hint = h>=18 ? 'Buổi tối thường xem phòng và đặt lịch tư vấn. Bạn cần gì?' : 'Tôi là VIETBOT. Chọn:';
    await addTyping(600+Math.random()*300);
    addMsg(hint);
    injectChips();
    sessionStorage.setItem(PANEL_KEY,'1');
  },120));

  // intent tracking + gửi về GAS theo lô
  const INTENT_KEY='vf_intents';
  function trackIntent(label){
    const data = JSON.parse(localStorage.getItem(INTENT_KEY)||'{}');
    data[label]=(data[label]||0)+1; data.__hits=(data.__hits||0)+1;
    localStorage.setItem(INTENT_KEY, JSON.stringify(data));
    if(data.__hits%8===0) sendStats();
  }
  function sendStats(){
    try{
      if(!window.GAS_URL) return;
      const data = localStorage.getItem(INTENT_KEY); if(!data) return;
      fetch(window.GAS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams({type:'intent',data})});
    }catch(e){}
  }

  // mini form 2 bước trong chat
  function openMiniForm(){
    const body = document.getElementById('vfChatBody'); if(!body) return;
    const box = document.createElement('div'); box.className='msg bot'; const b=document.createElement('div'); b.className='bubble'; box.appendChild(b);
    b.innerHTML = `
      <form id="vbMiniForm" class="vb-mini">
        <div style="display:grid;gap:8px">
          <input required name="name" placeholder="Tên của bạn" />
          <input required name="phone" placeholder="Số điện thoại" />
          <select name="need">
            <option value="credit">Tư vấn vay</option>
            <option value="stay">Tìm phòng</option>
            <option value="jobs">Ứng tuyển</option>
          </select>
          <div style="display:flex;gap:8px"><button class="btn" type="submit">Gửi</button><button class="btn ghost" type="button" id="vbMiniCancel">Hủy</button></div>
        </div>
      </form>`;
    body.appendChild(box); body.scrollTop = body.scrollHeight;
    document.getElementById('vbMiniCancel').onclick=()=>box.remove();
    document.getElementById('vbMiniForm').onsubmit=(e)=>{
      e.preventDefault();
      const fd=new FormData(e.target);
      try{
        if(window.GAS_URL){
          fetch(window.GAS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:new URLSearchParams({type:'lead',name:fd.get('name'),phone:fd.get('phone'),need:fd.get('need')})});
        }
      }catch(err){}
      trackIntent('lead_'+fd.get('need'));
      const thanks = document.createElement('div'); thanks.className='msg bot';
      const bb=document.createElement('div'); bb.className='bubble'; bb.textContent='Đã nhận thông tin. Chúng tôi sẽ liên hệ sớm.'; thanks.appendChild(bb);
      body.appendChild(thanks); box.remove(); body.scrollTop=body.scrollHeight;
    };
  }
})();
/* === VIETBOT v13: chào A căn giữa, bỏ nút Bỏ qua, UI chat tốt hơn, swim-dock mượt, liên kết Zalo/Messenger === */
(function vietbotV13(){
  const intro = document.getElementById('vietbotIntro');
  const svg   = document.getElementById('vietbotSVG');
  const sayBox= document.getElementById('vietbotSay');
  const greet = document.getElementById('vietbotGreet');
  const btn   = document.getElementById('vfChatBtn');
  const panel = document.getElementById('vfChatPanel');
  const stage = document.querySelector('.vietbot-stage');
  const shadow= intro?.querySelector('.vietbot-shadow');
  const hand  = document.getElementById('vbHand');
  if(!intro || !svg || !sayBox || !greet || !btn || !shadow || !stage || !hand) return;

  // cấu hình kênh liên hệ
  const FB_HOME   = '61579142315521'; // VIETFORTURE HOME
  const FB_CREDIT = '61579311806964'; // VIETFORTURE CREDIT
  const ZALO_OAID = '2857015321649379174';

  // chống FOUC tay
  try{ hand.setAttribute('transform','rotate(0 192 164)'); }catch(e){}

  // chào kiểu A
  function vnGreeting(){
    const h = Number(new Intl.DateTimeFormat('vi-VN',{hour:'numeric',hour12:false,timeZone:'Asia/Ho_Chi_Minh'}).format(new Date()));
    const buoi = h < 12 ? 'sáng' : (h < 18 ? 'chiều' : 'tối');
    return `VIETFORTURE chào buổi ${buoi}`;
  }
  greet.textContent = vnGreeting();

  // Hiện intro lần này
  intro.removeAttribute('hidden');
  intro.classList.add('is-on');
  svg.classList.add('vb-in');

  // Hop + vẫy + anten beat + hiệu ứng đặc sắc
  setTimeout(()=>{
    svg.classList.remove('vb-in');
    svg.classList.add('vb-hop','vb-wave','vb-beat');
    shadow.classList.add('vb-shadow-hop');
    emitHalo(); emitSparks(8);
    placeBubble(); // đảm bảo bubble giữa, không đè robot
  }, 520);

  // Ẩn bubble trước khi chuyển động xuống
  setTimeout(()=>{ sayBox.classList.add('hide'); }, 520+600);

  // SWIM → DOCK: bơi lượn xuống nút chat (đường cong mượt)
  setTimeout(()=>{
    svg.classList.remove('vb-hop','vb-wave','vb-beat');
    shadow.classList.remove('vb-shadow-hop');
    swimDock();
  }, 520+600+80);

  function swimDock(){
    const bot = svg.getBoundingClientRect();
    const tgt = btn.getBoundingClientRect();
    const dx = (tgt.left + tgt.width/2) - (bot.left + bot.width/2);
    const dy = (tgt.top  + tgt.height/2) - (bot.top  + bot.height/2);

    // tạo các điểm cong dạng sin cho cảm giác "bơi"
    const kfs = [];
    const steps = 6;
    for(let i=0;i<=steps;i++){
      const t = i/steps;
      const x = dx * t + Math.sin(t*Math.PI*1.2) * 36; // lượn ngang
      const y = dy * t - Math.sin(t*Math.PI) * 16;     // lượn dọc
      const s = 1 - t*.75; // scale 1 → .25
      kfs.push({ transform: `translate(${x}px,${y}px) scale(${s})` , offset: t });
    }

    if(svg.animate){
      svg.animate(kfs, { duration: 900, easing: 'cubic-bezier(.22,.9,.26,1)', fill: 'forwards' })
         .addEventListener('finish', bounceAndFinish);
    }else{
      svg.style.setProperty('--dx', dx+'px');
      svg.style.setProperty('--dy', dy+'px');
      svg.style.animation='vbDockEase .9s cubic-bezier(.22,.9,.26,1) forwards';
      setTimeout(bounceAndFinish, 920);
    }

    function bounceAndFinish(){
      // rebound nhỏ
      if(svg.animate){
        const end = kfs[kfs.length-1].transform;
        svg.animate([
          { transform: end },
          { transform: end.replace(/scale\([^)]+\)/, 'scale(.27)') , offset:.4 },
          { transform: end }
        ], { duration: 240, easing:'ease-out', fill:'forwards' })
        .addEventListener('finish', done);
      }else{ done(); }
    }
    function done(){
      intro.classList.remove('is-on');
      btn.classList.add('has-vietbot');
      btn.innerHTML = miniSVG();
    }
  }

  // bubble vị trí thông minh, không chèn vào robot
  function placeBubble(){
    const sb = sayBox.getBoundingClientRect();
    const head = document.getElementById('vbHead').getBoundingClientRect();
    const collide = !(sb.right < head.left || sb.left > head.right || sb.bottom < head.top || sb.top > head.bottom);
    sayBox.style.top = collide ? '6%' : '10%';
  }

  // Hiệu ứng halo + pháo sáng
  function emitHalo(){
    const halo = stage.querySelector('.vb-halo'); if(!halo) return;
    halo.classList.remove('on'); void halo.offsetHeight; halo.classList.add('on');
  }
  function emitSparks(n){
    const boxH = hand.getBoundingClientRect(); const boxS = stage.getBoundingClientRect();
    const baseX = boxH.left + boxH.width/2 - boxS.left; const baseY = boxH.top + boxH.height/2 - boxS.top;
    for(let i=0;i<n;i++){
      const d = document.createElement('div'); d.className='vb-spark';
      d.style.left = (baseX + (Math.random()*24-12))+'px';
      d.style.top  = (baseY + (Math.random()*16-20))+'px';
      const ang = (Math.random()*Math.PI/2 - Math.PI/6); const dist = 60 + Math.random()*40;
      d.style.setProperty('--sx',  Math.cos(ang)*dist+'px'); d.style.setProperty('--sy', -Math.abs(Math.sin(ang))*dist - 30 +'px');
      stage.appendChild(d); setTimeout(()=>d.remove(), 720);
    }
  }

  /* ===== Chat UI: chips nhanh + typing + liên hệ trực tiếp ===== */
  const openMessengerHome   = ()=>{ try{ if(window.FB&&FB.CustomerChat){FB.CustomerChat.show(true);FB.CustomerChat.showDialog();} }catch(e){} window.open(`https://m.me/${FB_HOME}?ref=vietbot-home`,'_blank','noopener'); };
  const openMessengerCredit = ()=>{ try{ if(window.FB&&FB.CustomerChat){FB.CustomerChat.show(true);FB.CustomerChat.showDialog();} }catch(e){} window.open(`https://m.me/${FB_CREDIT}?ref=vietbot-credit`,'_blank','noopener'); };
  const openZalo            = ()=>{ window.open(`https://zalo.me/${ZALO_OAID}`,'_blank','noopener'); };
  const callHotline         = ()=>{ window.location.href='tel:+84000000000'; }; // thay số thật nếu có

  function addTyping(ms){
    const body = document.getElementById('vfChatBody'); if(!body) return Promise.resolve();
    const wrap = document.createElement('div'); wrap.className='msg bot';
    const t = document.createElement('div'); t.className='typing'; t.innerHTML='<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    wrap.appendChild(t); body.appendChild(wrap); body.scrollTop = body.scrollHeight;
    return new Promise(res=>setTimeout(()=>{ wrap.remove(); res(); }, ms));
  }
  function addMsg(text){
    const body = document.getElementById('vfChatBody'); if(!body) return;
    const wrap = document.createElement('div'); wrap.className='msg bot';
    const b = document.createElement('div'); b.className='bubble'; b.textContent=text; wrap.appendChild(b);
    body.appendChild(wrap); body.scrollTop = body.scrollHeight;
  }
  function injectChips(){
    const body = document.getElementById('vfChatBody'); if(!body) return;
    if(body.querySelector('.chat-quickchips')) return;
    const row = document.createElement('div'); row.className='chat-quickchips';
    const chips = [
      ['Tín dụng', ()=>route('tindung')],
      ['Lưu trú', ()=>route('luutru','#stay')],
      ['Tuyển dụng', ()=>route('tuyendung')],
      ['Messenger HOME', openMessengerHome],
      ['Messenger CREDIT', openMessengerCredit],
      ['Zalo', openZalo],
      ['Gọi', callHotline]
    ];
    chips.forEach(([label,fn])=>{ const c=document.createElement('button'); c.type='button'; c.className='chip'; c.textContent=label; c.onclick=fn; row.appendChild(c); });
    body.appendChild(row); body.scrollTop = body.scrollHeight;
  }
  function route(id, hash){
    try{ if(typeof window.show==='function') window.show(id); }catch(e){}
    if(hash && location.hash!==hash) location.hash=hash;
    const sec = document.querySelector(`[data-view="${id}"], #${id}, section#${id}`);
    sec && sec.scrollIntoView({behavior:'smooth', block:'start'});
  }

  // Greet panel lần đầu theo kiểu A + chips
  const PANEL_KEY='vf_panel_greet_styleA_v13';
  document.getElementById('vfChatBtn')?.addEventListener('click', ()=>setTimeout(async ()=>{
    if(!panel || !panel.classList.contains('is-open')) return;
    if(sessionStorage.getItem(PANEL_KEY)) { injectChips(); return; }
    await addTyping(650);
    addMsg('Tôi là VIETBOT. Chọn: Tín dụng · Lưu trú · Tuyển dụng · Chat trực tiếp');
    injectChips();
    sessionStorage.setItem(PANEL_KEY,'1');
  },120));
})();


// === BEGIN: Site handoff config injected ===
window.SITE_HANDOFF = {
  messenger: "https://m.me/vietfunds",
  zalo: "https://zalo.me/2857015321649379174"
};

function openMessenger() {
  try {
    const url = (window.SITE_HANDOFF && window.SITE_HANDOFF.messenger) || "https://m.me/vietfunds";
    window.open(url, "_blank", "noopener");
    if (typeof gtag === "function") gtag('event', 'handoff_messenger', {method:'chatbot'});
  } catch (e) {}
}

function openZaloOA() {
  try {
    const url = (window.SITE_HANDOFF && window.SITE_HANDOFF.zalo) || "https://zalo.me/2857015321649379174";
    window.open(url, "_blank", "noopener");
    if (typeof gtag === "function") gtag('event', 'handoff_zalo', {method:'chatbot'});
  } catch (e) {}
}
// === END: Site handoff config injected ===


/* ==== Credit v16: DOM-ready, purge text, hero autoplay, cards align, calc + contact ==== */
(function(){ 
  function onReady(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  onReady(function(){
    const root = document.getElementById('view-tindung'); if(!root) return;
    const $ = (s,c=document)=>c.querySelector(s);
    const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

    // Purge listed legacy phrases
    const kill = ["Kh\u00f4ng c\u1ea7n t\u00e0i s\u1ea3n b\u1ea3o \u0111\u1ea3m. H\u1ed3 s\u01a1 g\u1ecdn. Gi\u1ea3i ng\u00e2n nhanh.", "1C\u00e1c g\u00f3i vay ph\u00f9 h\u1ee3p nhi\u1ec1u \u0111\u1ed1i t\u01b0\u1ee3ng", "Thu nh\u1eadp t\u1eeb l\u01b0\u01a1ng", "C\u00e1n b\u1ed9 c\u00f4ng ch\u1ee9c, vi\u00ean ch\u1ee9c", "Kh\u00e1ch h\u00e0ng l\u00e0 ph\u1ee5 n\u1eef", "H\u1ee3p \u0111\u1ed3ng b\u1ea3o hi\u1ec3m nh\u00e2n th\u1ecd", "L\u1ecbch s\u1eed vay t\u1ea1i TCTD", "Ch\u1ee7 kinh doanh", "Vay theo CCCD", "2\u0110i\u1ec1u ki\u1ec7n & thanh to\u00e1n", "Th\u1eddi h\u1ea1n6\u201360 th\u00e1ng", "L\u00e3i su\u1ea5tC\u1ea1nh tranh", "Thanh to\u00e1n\u0110MX/TGD\u0110 \u00b7 Momo \u00b7 Viettel \u00b7 chuy\u1ec3n kho\u1ea3n", "3\u0110\u1ed1i t\u00e1c", "SHBFinance LOTTE Finance FE Credit", "\u0110\u0103ng k\u00fd", "V\u1ec1 \u0111\u1ea7u m\u1ee5c", "Kho\u1ea3n vay l\u1edbn. K\u1ef3 h\u1ea1n d\u00e0i. Tr\u1ea3 n\u1ee3 linh ho\u1ea1t.", "B\u00e0i 1: Vay mua nh\u00e0, x\u00e2y s\u1eeda nh\u00e0 t\u1edbi 35 n\u0103m", "B\u00e0i 2: Vay mua \u00f4 t\u00f4 ph\u00ea duy\u1ec7t nhanh", "B\u00e0i 3: Vay SXKD & B\u1ed5 sung VL\u0110", "T\u0103ng v\u1ed1n l\u01b0u \u0111\u1ed9ng", "Chi ph\u00ed v\u1eadn h\u00e0nh: l\u01b0\u01a1ng, nguy\u00ean li\u1ec7u, thu\u00ea m\u1eb7t b\u1eb1ng.", "\u0110\u1ea7u t\u01b0 m\u1edf r\u1ed9ng", "M\u1edf quy m\u00f4, mua thi\u1ebft b\u1ecb, tri\u1ec3n khai d\u1ef1 \u00e1n.", "Gi\u1ea3i quy\u1ebft t\u1ea1m th\u1eddi", "D\u00f2ng ti\u1ec1n thi\u1ebfu h\u1ee5t ng\u1eafn h\u1ea1n.", "H\u1ea1n m\u1ee9c t\u1edbi 100 t\u1ef7 \u0111\u1ed3ng", "Th\u1ea9m \u0111\u1ecbnh d\u1ef1a tr\u00ean 100% b\u00e1o c\u00e1o t\u00e0i ch\u00ednh", "H\u1ed7 tr\u1ee3 to\u00e0n qu\u1ed1c", "Vay mua \u00f4 t\u00f4", "M\u1edbi ho\u1eb7c \u0111\u00e3 qua s\u1eed d\u1ee5ng.", "B\u1ed5 sung VL\u0110", "T\u1ed1i \u01b0u d\u00f2ng ti\u1ec1n theo m\u00f9a v\u1ee5.", "Vay mua B\u0110S", "M\u1eb7t b\u1eb1ng, kho b\u00e3i, nh\u00e0 x\u01b0\u1edfng.", "\u0110\u1eb7c \u0111i\u1ec3m", "Ph\u01b0\u01a1ng th\u1ee9c tr\u1ea3 n\u1ee3 linh ho\u1ea1t", "T\u00e0i s\u1ea3n b\u1ea3o \u0111\u1ea3m \u0111a d\u1ea1ng", "T\u1ef7 l\u1ec7 cho vay t\u1edbi 85% gi\u00e1 tr\u1ecb t\u00e0i s\u1ea3n", "H\u1ed7 tr\u1ee3 c\u1ea5p h\u1ea1n m\u1ee9c doanh nghi\u1ec7p"];
    $$('#view-tindung *').forEach(el=>{ const t=(el.textContent||'').trim(); if(kill.includes(t)) el.remove(); });

    // Build cards from CREDIT_CONTENT fallback or embedded DATA
    const DATA = window.CREDIT_CONTENT || {"per": [{"title": "Vay tín chấp tiêu dùng cá nhân", "sub": "Giải pháp nhanh, không yêu cầu tài sản bảo đảm.", "img": "img/credit-personal-unsecured.jpg", "points": ["Nguồn thu nhập phù hợp nhiều hồ sơ", "Kỳ hạn 6–60 tháng", "Lãi suất cạnh tranh", "Thanh toán ví điện tử và hệ thống đối tác"]}, {"title": "Vay mua nhà, xây sửa nhà", "sub": "Kỳ hạn dài, tỷ lệ tài trợ cao.", "img": "img/credit-mortgage-home.jpg", "points": ["Tối đa ~85% giá trị tài sản", "Thời hạn tới 35 năm", "Chứng minh thu nhập linh hoạt"]}, {"title": "Vay mua ô tô", "sub": "Hỗ trợ xe mới và đã qua sử dụng.", "img": "img/credit-mortgage-auto.jpg", "points": ["Tài trợ đến ~80% giá trị xe", "Phê duyệt nhanh", "Kỳ hạn đến 72 tháng"]}, {"title": "Vay SXKD & Bổ sung VLĐ", "sub": "Cho hộ và cá nhân kinh doanh.", "img": "img/credit-sme-workingcap.jpg", "points": ["Hạn mức 50 triệu – 10 tỷ", "TSBĐ BĐS tối đa ~80%", "Chu kỳ vốn lưu động 24 tháng"]}], "biz": [{"title": "Vay tín chấp doanh nghiệp", "sub": "Bổ sung vốn lưu động, đầu tư nhanh.", "img": "img/credit-biz-unsecured.jpg", "points": ["Dựa trên báo cáo tài chính", "Hạn mức đến ~100 tỷ", "Giải quyết thiếu hụt dòng tiền ngắn hạn"]}, {"title": "Vay thế chấp doanh nghiệp", "sub": "Vay mua ô tô · Bổ sung VLĐ · Vay mua BĐS", "img": "img/credit-biz-secured.jpg", "points": ["Tài sản bảo đảm đa dạng", "Tỷ lệ vay tới ~85%", "Phương thức trả nợ linh hoạt"]}]};
    function cardHTML(it){
      const lis = (it.points||[]).map(pt=>`<li class="cc-li anim">${pt}</li>`).join('');
      return `<article class="ccard anim"><div class="ccard__inner">
        <div class="cc-media" style="--img:url('${it.img||""}')"></div>
        <div class="cc-body">
          <h3 class="cc-title anim">${it.title||""}</h3>
          <p class="cc-sub anim">${it.sub||""}</p>
          <ul class="cc-list">${lis}</ul>
          <div class="cc-cta">
            <button class="btn primary act-apply" data-title="${it.title||""}">Đăng ký</button>
            <button class="btn ghost act-consult" data-title="${it.title||""}">Hỏi tư vấn</button>
          </div>
        </div></div>
      </article>`;
    }
    function render(group){
      const grid = document.getElementById('cc-grid-'+group); if(!grid) return;
      grid.innerHTML = (DATA[group]||[]).map(cardHTML).join('');
    }
    render('per'); render('biz');

    // Reveal
    const io = new IntersectionObserver((ents)=>{ ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {threshold:.15});
    $$('.anim', root).forEach(el=>io.observe(el));

    // Hero slider autoplay
    (function(){
      const stage = $('.cr-hero__stage', root); if(!stage) return;
      const slides = $$('.slide', stage); const dots = $$('.cr-hero__dots .dot', root);
      if(!slides.length) return;
      let idx = 0, t=null;
      function go(i){ slides[idx]?.classList.remove('is-active'); dots[idx]?.classList.remove('is-active'); idx=(i+slides.length)%slides.length; slides[idx]?.classList.add('is-active'); dots[idx]?.classList.add('is-active'); }
      function next(){ go(idx+1); }
      function play(){ stop(); t=setInterval(next, 4000); }
      function stop(){ if(t) clearInterval(t), t=null; }
      dots.forEach((d,i)=>d.addEventListener('click', ()=>{ go(i); play(); }));
      stage.addEventListener('mouseenter', stop); stage.addEventListener('mouseleave', play);
      go(0); play();
    })();

    // Calculator
    function bindCalc(gid){
      const p = document.getElementById('calc_'+gid+'_p'),
            r = document.getElementById('calc_'+gid+'_r'),
            n = document.getElementById('calc_'+gid+'_n'),
            b = document.getElementById('calc_'+gid+'_btn'),
            out = document.getElementById('calc_'+gid+'_out');
      if(!p||!r||!n||!b||!out) return;
      function fmt(x){ return x.toLocaleString('vi-VN'); }
      function calc(){ 
        const P=+p.value||0, R=(+r.value||0)/100/12, N=+n.value||0;
        if(P<=0||R<=0||N<=0){ out.textContent=''; return; }
        const A = P*R*Math.pow(1+R,N)/(Math.pow(1+R,N)-1);
        const total = A*N, interest = total-P;
        out.innerHTML = `Trả mỗi tháng: <b>${fmt(Math.round(A))} đ</b> · Tổng lãi: <b>${fmt(Math.round(interest))} đ</b> · Tổng trả: <b>${fmt(Math.round(total))} đ</b>`;
      }
      b.addEventListener('click', calc);
    }
    bindCalc('per'); bindCalc('biz');

    // Contact form -> GAS
    const GAS_URL = window.GAS_URL || "https://script.google.com/macros/s/AKfycbxAWC...placeholder/exec";
    function postFormUrlEncoded(url, data) {
      const body = new URLSearchParams(data).toString();
      return fetch(url, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}, body });
    }
    ;['per','biz'].forEach(gid=>{
      const form = document.getElementById('creditContactForm_'+gid);
      if(!form) return;
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        data.type = 'credit_contact_'+gid; data.source = 'credit_view';
        postFormUrlEncoded(GAS_URL, data);
        form.reset();
        alert('Đã gửi. Chúng tôi sẽ liên hệ.');
      });
    });

    // Tab sync
    const segBtns = $$('.bk-seg__btn', root);
    function sync(){
      const k = (root.querySelector('.bk-seg__btn.is-active')?.dataset.tab)||'per';
      ['per','biz'].forEach(g=>document.getElementById('cc-grid-'+g)?.toggleAttribute('hidden', g!==k));
      ['faq','calc','contact'].forEach(s=>['per','biz'].forEach(g=>document.getElementById(`cr-${s}-${g}`)?.toggleAttribute('hidden', g!==k)));
    }
    segBtns.forEach(b=>b.addEventListener('click', sync));
    sync();
  });
})();


/* ==== Credit v17: kill hero, directional anim, calc sliders, slogan actions ==== */
(function(){
  function onReady(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  onReady(function(){
    const root = document.getElementById('view-tindung'); if(!root) return;
    const $ = (s,c=document)=>c.querySelector(s);
    const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

    // Directional anim: tag media/body
    $$('.ccard').forEach(card=>{
      card.querySelector('.cc-media')?.classList.add('anim','fi-left');
      card.querySelector('.cc-body')?.classList.add('anim','fi-right');
    });
    // Intersection reveal
    const io = new IntersectionObserver((ents)=>{
      ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
    }, {threshold:.15});
    $$('.anim', root).forEach(el=>io.observe(el));

    // Enhance calculator with sliders + live calc
    function enhanceCalc(gid){
      const p = $('#calc_'+gid+'_p'), r = $('#calc_'+gid+'_r'), n = $('#calc_'+gid+'_n'), out = $('#calc_'+gid+'_out'), btn = $('#calc_'+gid+'_btn');
      if(!p||!r||!n||!out||!btn) return;
      // Add sliders row
      let sliders = $('.sliders', p.closest('.cr-calc'));
      if(!sliders){
        sliders = document.createElement('div'); sliders.className='sliders anim fi-up';
        sliders.innerHTML = `
          <input type="range" class="slider" id="s_${gid}_p" min="10000000" max="2000000000" step="1000000" value="200000000">
          <input type="range" class="slider" id="s_${gid}_r" min="4" max="30" step="0.1" value="12">
          <input type="range" class="slider" id="s_${gid}_n" min="6" max="360" step="1" value="24">
        `;
        btn.closest('.calc-row').after(sliders);
        io.observe(sliders);
      }
      const sp = $('#s_'+gid+'_p'), sr = $('#s_'+gid+'_r'), sn = $('#s_'+gid+'_n');
      function sync(from){
        if(from==='num'){ sp.value = p.value||0; sr.value = r.value||0; sn.value = n.value||0; }
        else { p.value = sp.value; r.value = sr.value; n.value = sn.value; }
        calc();
      }
      function fmt(x){ return (+x).toLocaleString('vi-VN'); }
      function calc(){
        const P=+p.value||0, R=(+r.value||0)/100/12, N=+n.value||0;
        if(P<=0||R<=0||N<=0){ out.textContent=''; return; }
        const A = P*R*Math.pow(1+R,N)/(Math.pow(1+R,N)-1);
        const total = A*N, interest = total-P;
        out.innerHTML = `
          <div>Trả mỗi tháng: <b>${fmt(Math.round(A))} đ</b></div>
          <div>Tổng lãi ước tính: <b>${fmt(Math.round(interest))} đ</b> · Tổng phải trả: <b>${fmt(Math.round(total))} đ</b></div>
        `;
        out.classList.remove('pop'); void out.offsetWidth; out.classList.add('pop');
      }
      ;[p,r,n].forEach(el=>el.addEventListener('input', ()=>sync('num')));
      ;[sp,sr,sn].forEach(el=>el.addEventListener('input', ()=>sync('range')));
      btn.addEventListener('click', calc);
      sync('range');
    }
    enhanceCalc('per'); enhanceCalc('biz');

    // Slogan actions: seg buttons and detail links
    const slog = $('#credit-slogan', root);
    if(slog){
      slog.querySelectorAll('.seg-btn').forEach(b=>b.addEventListener('click', ()=>{
        const t = b.getAttribute('data-tab');
        const tabBtn = root.querySelector(`.bk-seg__btn[data-tab="${t}"]`);
        tabBtn?.click();
        root.scrollIntoView({behavior:'smooth'});
      }));
      slog.querySelectorAll('.link-btn').forEach(b=>b.addEventListener('click', ()=>{
        const sel = b.getAttribute('data-scroll'); const tgt = sel && document.querySelector(sel);
        tgt?.scrollIntoView({behavior:'smooth', block:'start'});
      }));
    }
  });
})();


/* ==== Credit v18: ensure single hero, reveal trust ==== */
(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    const root = document.getElementById('view-tindung'); if(!root) return;
    const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));
    // Remove extra heroes accidentally injected by caches
    const heroes = $$('.cr-hero', root);
    if(heroes.length>1){ heroes.slice(1).forEach(h=>h.remove()); }
    // Animate trust items
    const io = new IntersectionObserver((ents)=>{
      ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
    }, {threshold:.15});
    $$('.cr-trust .trust-item, .cr-trust, .credit-slogan', root).forEach(el=>io.observe(el));
  });
})();


/* ==== Credit v19: calc ring + breakdown ==== */
(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    const root = document.getElementById('view-tindung'); if(!root) return;
    const $ = (s,c=document)=>c.querySelector(s);
    const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

    function mountRing(gid){
      const calc = $('#cr-calc-'+gid);
      if(!calc) return;
      if(calc.querySelector('.wrap')) return;
      const row = calc.querySelector('.calc-row');
      const wrap = document.createElement('div'); wrap.className='wrap';
      const panel1 = document.createElement('div'); panel1.className='panel'; panel1.appendChild(row);
      const panel2 = document.createElement('div'); panel2.className='panel meter';
      panel2.innerHTML = `<div class="ring" id="ring_${gid}" style="--p:0%"></div><div class="ring-label" id="ringlbl_${gid}">0 đ/tháng</div>`;
      const panel3 = document.createElement('div'); panel3.className='panel breakdown';
      panel3.innerHTML = `<div class="line"><span>Gốc phải trả</span><b id="bk_p_${gid}">0 đ</b></div>
                          <div class="line"><span>Tổng lãi</span><b id="bk_i_${gid}">0 đ</b></div>
                          <div class="line"><span>Tổng phải trả</span><b id="bk_t_${gid}">0 đ</b></div>`;
      wrap.append(panel1, panel2, panel3);
      calc.appendChild(wrap);
      const out = $('#calc_'+gid+'_out'); if(out){ out.remove(); }
    }

    function fmt(x){ return (+x).toLocaleString('vi-VN'); }

    function bindRingUpdate(gid){
      const p = $('#calc_'+gid+'_p'), r = $('#calc_'+gid+'_r'), n = $('#calc_'+gid+'_n');
      const ring = $('#ring_'+gid), lbl = $('#ringlbl_'+gid);
      const bkp = $('#bk_p_'+gid), bki = $('#bk_i_'+gid), bkt = $('#bk_t_'+gid);
      if(!p||!r||!n||!ring||!lbl) return;
      function calc(){
        const P=+p.value||0, R=(+r.value||0)/100/12, N=+n.value||0;
        if(P<=0||R<=0||N<=0){ ring.style.setProperty('--p','0%'); lbl.textContent='0 đ/tháng'; bkp.textContent=bki.textContent=bkt.textContent='0 đ'; return; }
        const A = P*R*Math.pow(1+R,N)/(Math.pow(1+R,N)-1);
        const total = A*N, I = total-P;
        lbl.textContent = fmt(Math.round(A))+' đ/tháng';
        bkp.textContent = fmt(Math.round(P))+' đ';
        bki.textContent = fmt(Math.round(I))+' đ';
        bkt.textContent = fmt(Math.round(total))+' đ';
        const pcent = Math.min(99, Math.max(1, Math.round((I/total)*100)));
        ring.style.setProperty('--p', pcent+'%');
      }
      ['input','change'].forEach(ev=>{ p.addEventListener(ev, calc); r.addEventListener(ev, calc); n.addEventListener(ev, calc); });
      calc();
    }

    ['per','biz'].forEach(g=>{ mountRing(g); bindRingUpdate(g); });

    // Trust & slogan reveal
    const io = new IntersectionObserver((ents)=>{
      ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
    }, {threshold:.15});
    $$('.cr-trust .trust-item, #cr-trust, #credit-slogan', root).forEach(el=>io.observe(el));
  });
})();


/* ==== Credit v27: zigzag cards with <img>, alt animations ==== */
(function(){
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    const root = document.getElementById('view-tindung'); if(!root) return;
    const $ = (s,c=document)=>c.querySelector(s);
    const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

    const DATA = window.CREDIT_CONTENT;
    function cardHTML(it, idx){
      const mediaDir = (idx%2===0) ? 'fi-left' : 'fi-right';
      const bodyDir  = (idx%2===0) ? 'fi-right' : 'fi-left';
      const altClass = (idx%2===0) ? '' : ' is-alt';
      const img = it.img || '';
      const lis = (it.points||[]).map(pt=>`<li class="cc-li anim">${pt}</li>`).join('');
      return `<article class="ccard anim${altClass}"><div class="ccard__inner">
        <div class="cc-media anim ${mediaDir}" style="--img:url('${img}')">${img?`<img src="${img}" alt="">`:''}</div>
        <div class="cc-body anim ${bodyDir}">
          <h3 class="cc-title anim">${it.title||""}</h3>
          <p class="cc-sub anim">${it.sub||""}</p>
          <ul class="cc-list">${lis}</ul>
          <div class="cc-cta">
            <button class="btn primary act-apply" data-title="${it.title||""}">Đăng ký</button>
            <button class="btn ghost act-consult" data-title="${it.title||""}">Hỏi tư vấn</button>
          </div>
        </div></div>
      </article>`;
    }
    function renderZ(group){
      const grid = document.getElementById('cc-grid-'+group);
      if(!grid) return;
      const src = (DATA && DATA[group]) || grid.__fallback;
      if(!src) return;
      grid.innerHTML = src.map((it,idx)=>cardHTML(it, idx)).join('');
      const io = new IntersectionObserver((ents)=>{ ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); } }); }, {threshold:.15});
      $$('.anim', grid).forEach(el=>io.observe(el));
    }
    ['per','biz'].forEach(g=>{
      const grid = document.getElementById('cc-grid-'+g);
      if(!grid) return;
      if(!DATA){
        const cards = $$('.ccard', grid);
        if(cards.length){
          grid.__fallback = cards.map(c=>{
            return { title: c.querySelector('.cc-title')?.textContent.trim() || '',
                     sub:   c.querySelector('.cc-sub')?.textContent.trim() || '',
                     img:   c.querySelector('.cc-media img')?.getAttribute('src') || '' ,
                     points: $$('.cc-li', c).map(li=>li.textContent.trim()) };
          });
        }
      }
      renderZ(g);
    });
  });
})();


/* v29: animate trust/slogan + chatbot + smooth scroll */
(function(){
  // animations
  const root = document.getElementById('view-tindung'); if(root){
    const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));
    const io = new IntersectionObserver((ents)=>ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); }}), {threshold:.2});
    $$('.anim', root).forEach(el=>io.observe(el));
    root.addEventListener('click',(e)=>{
      const b = e.target.closest('.link-btn[data-scroll]'); if(!b) return;
      const t = document.querySelector(b.dataset.scroll); if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  }

  // chatbot newbie
  const w = document.querySelector('.chatbot-widget');
  if(w && !w.querySelector('.welcome')){
    w.insertAdjacentHTML('afterbegin', '<div class="welcome">Xin chào! Tôi có thể hỗ trợ gì?<div class="actions"><button class="btn" data-go="#view-tindung">Xem Tín dụng</button><button class="btn" data-go="#contact">Liên hệ</button><button class="btn" data-go="#faq">FAQ</button></div></div>');
    w.addEventListener('click', (e)=>{
      const b = e.target.closest('.actions .btn'); if(!b) return;
      const t = document.querySelector(b.dataset.go); if(t){ t.scrollIntoView({behavior:"smooth", block:"start"}); }
    });
  }
})();


/* v29.1: animations + dedupe images + single hero, and chatbot gap fix */
(function(){
  const root = document.getElementById('view-tindung'); if(root){
    const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));
    // reveal
    const io = new IntersectionObserver((ents)=>ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); }}), {threshold:.2});
    $$('.anim', root).forEach(el=>io.observe(el));

    // keep only first hero
    const heroes = $$('.cr-hero', root);
    heroes.slice(1).forEach(h=>h.remove());

    // dedupe images inside each card by src
    ['per','biz'].forEach(g=>{
      const grid = document.getElementById('cc-grid-'+g);
      if(!grid) return;
      $$('.ccard', grid).forEach(card=>{
        const imgs = $$('.cc-media img', card);
        const seen = new Set();
        imgs.forEach((im, idx)=>{
          const s = im.getAttribute('src')||'__none';
          if(seen.has(s) || idx>0){ im.remove(); } else { seen.add(s); }
        });
      });
    });
  }

  // chatbot: nuke white spacer blocks
  const chat = document.querySelector('.chatbot-widget');
  if(chat){
    chat.querySelectorAll('.gap,.spacer,.empty, :empty').forEach(n=>{ if(n && n.className && /gap|spacer|empty/i.test(n.className)) n.remove(); });
    // ensure single welcome
    if(!chat.querySelector('.welcome')){
      chat.insertAdjacentHTML('afterbegin','<div class="welcome">Xin chào! Tôi có thể hỗ trợ gì?<div class="actions"><button class="btn" data-go="#view-tindung">Xem Tín dụng</button><button class="btn" data-go="#contact">Liên hệ</button><button class="btn" data-go="#faq">FAQ</button></div></div>');
    }
    chat.addEventListener('click', (e)=>{
      const b = e.target.closest('.actions .btn'); if(!b) return;
      const t = document.querySelector(b.dataset.go); if(t){ t.scrollIntoView({behavior:"smooth", block:"start"}); }
    });
  }
})();


/* v30: reveal anim, dedupe images, chatbot compact, ensure Zalo icon, single hero */
(function(){
  const root = document.getElementById('view-tindung');
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

  if(root){
    // reveal
    const io = new IntersectionObserver((ents)=>ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); }}), {threshold:.2});
    $$('.anim', root).forEach(el=>io.observe(el));

    // keep single hero
    const heroes = $$('.cr-hero', root); heroes.slice(1).forEach(h=>h.remove());

    // dedupe imgs in both grids
    ['per','biz'].forEach(g=>{
      const grid = document.getElementById('cc-grid-'+g); if(!grid) return;
      $$('.ccard', grid).forEach(card=>{
        const imgs = $$('.cc-media img', card);
        const seen = new Set();
        imgs.forEach((im, idx)=>{
          const s = im.getAttribute('src')||'__none';
          if(seen.has(s) || idx>0){ im.remove(); } else { seen.add(s); }
        });
      });
    });
  }

  // Chatbot: remove white gaps and set compact welcome + actions
  const chat = document.querySelector('.chatbot-widget, #chatbot, [class*="chatbot"]');
  if(chat){
    // remove tiny/empty nodes
    Array.from(chat.querySelectorAll('*')).forEach(n=>{
      const h = n.getBoundingClientRect ? n.getBoundingClientRect().height : 0;
      if(!n.firstElementChild && !n.textContent.trim() && h < 8) n.remove();
      if(/gap|spacer|empty/i.test(n.className||'')) n.remove();
    });
    if(!chat.querySelector('.welcome')){
      chat.insertAdjacentHTML('afterbegin','<div class="welcome">Xin chào! Tôi có thể hỗ trợ gì?<div class="actions"><button class="btn" data-go="#view-tindung">Xem Tín dụng</button><button class="btn" data-go="#contact">Liên hệ</button><button class="btn" data-go="#faq">FAQ</button></div></div>');
    }
    chat.addEventListener('click', (e)=>{
      const b = e.target.closest('.actions .btn'); if(!b) return;
      const t = document.querySelector(b.dataset.go); if(t){ t.scrollIntoView({behavior:"smooth", block:"start"}); }
    });
  }

  // Footer: ensure Z icon inner content and push right
  document.querySelectorAll('.footer a.zalo').forEach(a=>{ a.textContent='Z'; });
})(); 
