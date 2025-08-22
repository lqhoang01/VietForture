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
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setTab(id){
    const parentOf = { tindung: 'dichvu', kitucxa: 'dichvu' };
    const normalized = parentOf[id] || id;

    document.querySelectorAll('.tab').forEach(t=>{
      t.setAttribute('aria-selected','false');
      t.classList.remove('is-active');
      t.tabIndex = -1;
    });

    const map={home:'home',gioithieu:'about',dichvu:'dichvu',tuyendung:'tuyendung',tintuc:'tintuc'};
    for(const [k,v] of Object.entries(map)){
      if(v===normalized){
        const btn=document.getElementById('tab-'+k);
        if(btn){ btn.setAttribute('aria-selected','true'); btn.classList.add('is-active'); btn.tabIndex = 0; }
      }
    }
  }

  function show(id,{push=true}={}) {
    Object.values(views).forEach(v => v && v.classList.remove('is-visible'));
    (views[id] || views.home).classList.add('is-visible');
    setTab(id);
    if (push) history.replaceState(null,'','#'+id);

    if (id === 'about') {
      setupAbout();
      fontsReady.then(()=>after2Frames(calcStageHeight));
    } else {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }

  // brand + tabs
  document.getElementById('brandHome')?.addEventListener('click', (e) => { e.preventDefault(); show('home'); });
  document.getElementById('tab-home')?.addEventListener('click', () => show('home'));
  document.getElementById('tab-gioithieu')?.addEventListener('click', () => show('about'));
  document.getElementById('tab-dichvu')?.addEventListener('click', () => show('dichvu'));
  document.getElementById('tab-tuyendung')?.addEventListener('click', () => show('tuyendung'));
  document.getElementById('tab-tintuc')?.addEventListener('click', () => show('tintuc'));
  document.getElementById('btn-show-about')?.addEventListener('click', () => show('about'));
  document.querySelectorAll('.svc-card[data-nav]').forEach(b => b.addEventListener('click', () => show(b.dataset.nav)));

  /* ABOUT slides */
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

    // Keyboard
    stage.tabIndex = 0;
    stage.addEventListener('keydown', (e)=>{
      if (e.key === 'ArrowLeft') { e.preventDefault(); set(i-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); set(i+1); }
      if (e.key === 'Home') { e.preventDefault(); set(0); }
      if (e.key === 'End') { e.preventDefault(); set(slides.length-1); }
    });

    fontsReady.then(()=>after2Frames(calcStageHeight));
    window.addEventListener('resize', debounce(calcStageHeight, 120));
  }

  function calcStageHeight(){
    const root = document.documentElement;
    const stage = document.getElementById('aboutStage'); if (!stage) return;
    const slides = [...stage.querySelectorAll('.slide')]; if(!slides.length) return;

    const headerH = parseInt(getComputedStyle(root).getPropertyValue('--header-h')) || 92;
    const sloganH = parseInt(getComputedStyle(root).getPropertyValue('--slogan-h')) || 100;

    const measure = (el) => {
      const wasHidden = getComputedStyle(el).display === 'none';
      if (wasHidden){ el.style.display='block'; el.style.position='absolute'; el.style.visibility='hidden'; el.style.inset='0'; }
      const h = el.offsetHeight;
      if (wasHidden){ el.style.display=''; el.style.position=''; el.style.visibility=''; el.style.inset=''; }
      return h;
    };

    const active = slides.find(s => s.classList.contains('is-active')) || slides[0];
    let activeH = measure(active);
    if (!activeH) { let maxH = 0; slides.forEach(s => { maxH = Math.max(maxH, measure(s)); }); activeH = maxH; }

    const viewH = window.innerHeight - headerH;
    const targetMin = Math.max(activeH + sloganH + 8, viewH + 24);
    stage.style.minHeight = targetMin + 'px';
    stage.style.height = 'auto';
  }

  function debounce(fn, t=100){ let to; return (...args)=>{ clearTimeout(to); to=setTimeout(()=>fn(...args), t); }; }

  /* Reveal */
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
  }, { threshold: .16, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal,.info-box,.core-card,.kpi-card,.news-card,.svc-card,.job-item').forEach(el => io.observe(el));

  /* Counter (desktop mới hiện KPI) */
  const statIO = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; const to = parseFloat(el.dataset.count || '0');
      if (reducedMotion || getComputedStyle(el).display === 'none'){
        el.textContent = String(to % 1 ? to.toFixed(1) : to); statIO.unobserve(el); return;
      }
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

  /* Hash init */
  window.addEventListener('DOMContentLoaded', () => {
    const id = (location.hash || '#home').slice(1);
    show(id, {push:false});
    setupCurrencyMask();
    populateCities();
  });
  window.addEventListener('hashchange', () => {
    const id = (location.hash || '#home').slice(1);
    show(id, {push:false});
  });

  /* FORM handlers */
  const creditForm = document.getElementById('creditForm');
  creditForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const msg = document.getElementById('creditMsg');
    if (!creditForm.checkValidity()){
      msg.textContent = 'Vui lòng điền đầy đủ thông tin bắt buộc.'; msg.className='form-msg err'; return;
    }
    // Giá trị thô của amount (không dấu chấm)
    const amountRaw = document.getElementById('amount')?.dataset.raw || '';
    // TODO: gửi amountRaw + các field khác lên backend khi sẵn sàng
    msg.textContent = 'Đã nhận đăng ký. Chúng tôi sẽ liên hệ sớm!'; msg.className='form-msg ok';
    creditForm.reset();
  });

  const dormForm = document.getElementById('dormForm');
  dormForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const msg = document.getElementById('dormMsg');
    if (!dormForm.checkValidity()){
      msg.textContent = 'Vui lòng điền tối thiểu Họ tên và SĐT.'; msg.className='form-msg err'; return;
    }
    msg.textContent = 'Đã ghi nhận nhu cầu KTX. Chúng tôi sẽ liên hệ tư vấn!'; msg.className='form-msg ok';
    dormForm.reset();
  });

  /* === Extras === */

  // Mask tiền VND
  function setupCurrencyMask(){
    const el = document.getElementById('amount');
    if (!el) return;
    const nf = new Intl.NumberFormat('vi-VN');
    const unformat = (s) => s.replace(/[^\d]/g,'');

    function formatNow(){
      const raw = unformat(el.value);
      el.dataset.raw = raw; // giữ giá trị thô để submit
      el.value = raw ? nf.format(parseInt(raw,10)) : '';
    }

    el.addEventListener('input', () => {
      const start = el.selectionStart;
      formatNow();
      el.setSelectionRange(el.value.length, el.value.length); // caret cuối cho đơn giản
    });
    el.addEventListener('blur', formatNow);
  }

  // Dropdown Thành phố mở rộng
  function populateCities(){
    const sel = document.getElementById('citySelect');
    if (!sel) return;
    const cities = [
      'TP. Hồ Chí Minh','Hà Nội','Đà Nẵng','Cần Thơ','Hải Phòng','Bình Dương','Đồng Nai',
      'Bà Rịa - Vũng Tàu','Long An','Tiền Giang','An Giang','Kiên Giang','Cà Mau','Bạc Liêu',
      'Vĩnh Long','Trà Vinh','Sóc Trăng','Tây Ninh','Bình Phước','Bình Thuận','Khánh Hòa',
      'Lâm Đồng','Đắk Lắk','Gia Lai','Nghệ An','Thanh Hóa','Thừa Thiên Huế','Quảng Ninh'
    ];
    cities.forEach(name=>{
      const opt = document.createElement('option');
      opt.textContent = name; opt.value = name;
      sel.appendChild(opt);
    });
  }

})();
