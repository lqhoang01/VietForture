(() => {
  'use strict';

  // Năm footer
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  // KHÔNG đồng bộ header height nữa -> giữ --header-h mặc định từ CSS
  // (tránh layout nhảy khi Google Translate/toolbar xuất hiện)

  // Tabs / Views
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const views = {
    gioithieu: document.getElementById('view-gioithieu'),
    dichvu: document.getElementById('view-dichvu'),
    tuyendung: document.getElementById('view-tuyendung'),
    tintuc: document.getElementById('view-tintuc'),
    tindung: document.getElementById('view-tindung'),
    kitucxa: document.getElementById('view-kitucxa')
  };

  function setTabState(name){
    tabs.forEach(btn => {
      const active = btn.dataset.nav === name;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      btn.setAttribute('tabindex', active ? '0' : '-1');
    });
  }

  function show(name){
    Object.entries(views).forEach(([k,el])=>{
      if(!el) return;
      const vis = (k===name);
      el.classList.toggle('is-visible', vis);
      el.toggleAttribute('hidden', !vis);
    });
    setTabState(['gioithieu','dichvu','tuyendung','tintuc'].includes(name) ? name : '');
  }

  function navigate(name){
    if (!views[name]) name = 'gioithieu';
    if (location.hash !== `#${name}`) history.replaceState(null, '', `#${name}`);
    show(name);
  }

  // Brand & header tabs
  const brand = document.getElementById('brandHome');
  brand && brand.addEventListener('click', (e)=>{ e.preventDefault(); navigate('gioithieu'); });
  tabs.forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.nav)));

  // Các phần tử có data-nav (CTA…)
  document.querySelectorAll('[data-nav]').forEach(el=>{
    if (!el.classList.contains('tab')) el.addEventListener('click', ()=> navigate(el.dataset.nav));
  });

  // Hash change + init
  window.addEventListener('hashchange', () => navigate((location.hash || '#gioithieu').slice(1)));
  navigate((location.hash || '#gioithieu').slice(1));

  // Accordion
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.acc-head');
    if (!btn) return;
    const item = btn.closest('.acc-item');
    const content = item.querySelector('.acc-content');
    const open = !item.classList.contains('open');
    item.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    content.toggleAttribute('hidden', !open);
  });

  // Modals (giữ đơn giản)
  function openModal(id){
    const m = document.getElementById(id); if (!m) return;
    m.classList.add('show'); m.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(m){
    if(!m) return;
    m.classList.remove('show'); m.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('.js-open-consult').forEach(b=> b.addEventListener('click', ()=> openModal('consultModal')));
  document.querySelectorAll('.js-open-dorm').forEach(b=> b.addEventListener('click', ()=> openModal('dormModal')));
  document.querySelectorAll('.modal [data-close]').forEach(btn=> btn.addEventListener('click', ()=> closeModal(btn.closest('.modal'))));
  document.querySelectorAll('.modal').forEach(m=> m.addEventListener('click', (e)=>{ if(e.target===m) closeModal(m); }));

  // Forms
  function hookForm(form){
    if(!form) return;
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      if (form.checkValidity && !form.checkValidity()) { form.reportValidity?.(); return; }
      alert('Đã gửi! Chúng tôi sẽ liên hệ sớm.');
      const modal = form.closest('.modal'); if (modal) closeModal(modal);
      form.reset();
    });
  }
  hookForm(document.querySelector('#consultModal form'));
  hookForm(document.querySelector('#dormModal form'));
})();
