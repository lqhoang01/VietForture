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
