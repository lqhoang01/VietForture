(function(){
  // Year
  document.getElementById('y').textContent = new Date().getFullYear();

  // Header height sync (font dependent)
  const header = document.querySelector('.site-header');
  const setH = ()=> document.documentElement.style.setProperty('--header-h', (header.offsetHeight||80)+ 'px');
  window.addEventListener('resize', setH); setH();

  // Tabs
  const tabButtons = Array.from(document.querySelectorAll('.tab'));
  const views = {
    gioithieu: document.getElementById('view-gioithieu'),
    dichvu: document.getElementById('view-dichvu'),
    tuyendung: document.getElementById('view-tuyendung'),
    tintuc: document.getElementById('view-tintuc'),
    tindung: document.getElementById('view-tindung'),
    kitucxa: document.getElementById('view-kitucxa')
  };

  function show(el){ el?.classList.add('is-visible'); }
  function hide(el){ el?.classList.remove('is-visible'); }

  function runStagger(selector){
    document.querySelectorAll(selector).forEach((el,i)=>{
      el.classList.remove('show');
      setTimeout(()=> el.classList.add('show'), 100*i);
    });
  }

  function animateHeadline(){
    const h = document.getElementById('headline');
    if (!h) return;
    h.classList.remove('anim');
    void h.offsetWidth;
    h.classList.add('anim');
  }


  function activateTab(name){
    tabButtons.forEach(b=> b.classList.toggle('is-active', b.dataset.nav===name));
    Object.entries(views).forEach(([k,el])=> (k===name? el?.classList.add('is-visible') : el?.classList.remove('is-visible')));
    if (name==='gioithieu') animateHeadline();
    if (name==='tintuc') runStagger('#view-tintuc .item');
    if (name==='tindung') runStagger('#view-tindung .teaser, #view-tindung .acc-item');
    if (name==='kitucxa') runStagger('#view-kitucxa .teaser, #view-kitucxa .acc-item');
    if (location.hash !== '#'+name) history.replaceState(null, '', '#'+name);
  }

  // Brand click
  document.getElementById('brandHome').addEventListener('click', (e)=>{ e.preventDefault(); activateTab('gioithieu'); });

  // Header tabs click
  tabButtons.forEach(btn=> btn.addEventListener('click', ()=> activateTab(btn.dataset.nav)));

  // Any element with data-nav switches tab
  document.querySelectorAll('[data-nav]').forEach(el=>{
    if (!el.classList.contains('tab')) el.addEventListener('click', ()=> activateTab(el.dataset.nav));
  });

  // Keyboard shortcuts: 1..6
  window.addEventListener('keydown', (e)=>{
    if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
    if (e.key==='1') activateTab('gioithieu');
    if (e.key==='2') activateTab('dichvu');
    if (e.key==='3') activateTab('tuyendung');
    if (e.key==='4') activateTab('tintuc');
    if (e.key==='5') activateTab('tindung');
    if (e.key==='6') activateTab('kitucxa');
  });

  // Init
  const initial = (location.hash||'#gioithieu').replace('#','');
  activateTab(initial);
  if (initial==='gioithieu') animateHeadline();

  // Accordion toggle
  document.addEventListener('click', (e)=>{
    if (e.target.classList.contains('acc-head')){
      e.target.parentElement.classList.toggle('open');
    }
  });

  // Modals
  function openModal(id){ const m=document.getElementById(id); if(!m) return; m.classList.add('show'); m.setAttribute('aria-hidden','false'); }
  function closeModal(m){ m.classList.remove('show'); m.setAttribute('aria-hidden','true'); }

  document.querySelectorAll('.js-open-consult').forEach(b=> b.addEventListener('click', ()=> openModal('consultModal')));
  document.querySelectorAll('.js-open-dorm').forEach(b=> b.addEventListener('click', ()=> openModal('dormModal')));

  document.querySelectorAll('.modal [data-close]').forEach(btn=> btn.addEventListener('click', ()=> closeModal(btn.closest('.modal'))));
  document.querySelectorAll('.modal').forEach(m=> m.addEventListener('click', (e)=>{ if(e.target===m) closeModal(m); }));

  // Dragon blast when clicking logo
  const logo = document.querySelector('.logo');
  const dragonBg = document.getElementById('dragonBg');
  function blast(){ if(!dragonBg) return; dragonBg.classList.remove('blast'); void dragonBg.offsetWidth; dragonBg.classList.add('blast'); }
  logo?.addEventListener('click', blast);
})();
