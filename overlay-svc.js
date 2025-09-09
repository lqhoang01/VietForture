/* VietForture Services Overlay - standalone */
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  const overlay = $('#svcOverlay');
  if (!overlay) return;
  const shell = overlay.querySelector('.svc-shell');
  const backdrop = $('#svcBackdrop');
  const views = {
    root: $('#svcRoot'),
    credit: $('#svcCredit'),
    lodging: $('#svcLodging'),
    personal: $('#svcCreditPersonal'),
    business: $('#svcCreditBusiness')
  };
  const closeBtn = $('#svcClose');
  const stickyBtn = $('#svcOpenForm');

  function setHidden(view, hidden) { if (view) view.hidden = hidden; }
  function showOverlay(show) {
    overlay.setAttribute('aria-hidden', show ? 'false' : 'true');
    document.body.style.overflow = show ? 'hidden' : '';
    if (show) shell?.focus();
  }

  function route(hash){
    const h = (hash || location.hash || '').replace(/^#/, '');
    if (!h || h === 'svc') {
      showOverlay(true);
      setHidden(views.root, false);
      setHidden(views.credit, true);
      setHidden(views.personal, true);
      setHidden(views.business, true);
      setHidden(views.lodging, true);
      return;
    }
    if (h === 'svc/credit') {
      showOverlay(true);
      setHidden(views.root, true);
      setHidden(views.credit, false);
      setHidden(views.personal, true);
      setHidden(views.business, true);
      setHidden(views.lodging, true);
      return;
    }
    if (h.startsWith('svc/credit/personal')) {
      showOverlay(true);
      setHidden(views.root, true);
      setHidden(views.credit, true);
      setHidden(views.personal, false);
      setHidden(views.business, true);
      setHidden(views.lodging, true);
      return;
    }
    if (h.startsWith('svc/credit/business')) {
      showOverlay(true);
      setHidden(views.root, true);
      setHidden(views.credit, true);
      setHidden(views.personal, true);
      setHidden(views.business, false);
      setHidden(views.lodging, true);
      return;
    }
    if (h.startsWith('svc/lodging')) {
      showOverlay(true);
      setHidden(views.root, true);
      setHidden(views.credit, true);
      setHidden(views.personal, true);
      setHidden(views.business, true);
      setHidden(views.lodging, false);
      return;
    }
  }

  window.addEventListener('hashchange', () => route(location.hash));

  // Open from any element linking to #svc
  $$('a[href="#svc"],button[data-open="svc"]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); location.hash = 'svc'; });
  });

  // Close overlay
  closeBtn?.addEventListener('click', () => {
    if (location.hash.startsWith('#svc')) history.replaceState(null, '', location.pathname + location.search);
    showOverlay(false);
  });
  backdrop?.addEventListener('click', () => {
    if (location.hash.startsWith('#svc')) history.replaceState(null, '', location.pathname + location.search);
    showOverlay(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') {
      if (location.hash.startsWith('#svc')) history.replaceState(null, '', location.pathname + location.search);
      showOverlay(false);
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); toggleCmdk(true); }
    if (!/input|textarea|select/i.test(e.target.tagName)) {
      if (e.key.toLowerCase() === 'p') location.hash = 'svc/credit/personal';
      if (e.key.toLowerCase() === 'b') location.hash = 'svc/credit/business';
      if (e.key === '/') { e.preventDefault(); toggleCmdk(true); }
    }
  });

  // Sticky CTA focus
  stickyBtn?.addEventListener('click', () => {
    const personalVisible = views.personal && !views.personal.hidden;
    const form = personalVisible ? $('#svcFormPersonal') : $('#svcFormBusiness');
    form?.querySelector('button[type="submit"]')?.focus();
  });

  // Forms
  function attachSvcForm(id) {
    const form = $(id);
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const note = form.querySelector('.svc-form-note');
      const data = new FormData(form);
      try {
        if (window.GAS_URL) {
          await fetch(window.GAS_URL, { method:'POST', mode:'no-cors', body: data });
          note.textContent = 'Đã gửi yêu cầu. Chúng tôi sẽ liên hệ sớm.';
        } else {
          note.textContent = 'GAS_URL chưa cấu hình. Thêm window.GAS_URL trong script.';
        }
        form.reset();
      } catch(err) {
        note.textContent = 'Gửi thất bại. Thử lại.';
      }
    });
  }
  attachSvcForm('#svcFormPersonal');
  attachSvcForm('#svcFormBusiness');

  // Command palette basic
  const cmdk = $('#cmdk'), cmdInput = $('#cmdkInput'), cmdList = $('#cmdkList');
  function toggleCmdk(open){
    if (!cmdk) return;
    cmdk.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) { cmdInput.value=''; renderCmdk(''); cmdInput.focus(); }
  }
  function renderCmdk(q){
    const items = [
      {label:'Mở Dịch vụ', hash:'svc'},
      {label:'Tín dụng · Cá nhân', hash:'svc/credit/personal'},
      {label:'Tín dụng · Doanh nghiệp', hash:'svc/credit/business'},
      {label:'Lưu trú', hash:'svc/lodging'}
    ].filter(x => x.label.toLowerCase().includes(q.toLowerCase()));
    cmdList.innerHTML = items.map((x,i)=>`<li role="option" data-hash="${x.hash}" tabindex="-1" ${i===0?'aria-selected="true"':''}>${x.label}</li>`).join('');
  }
  cmdInput?.addEventListener('input', e => renderCmdk(e.target.value));
  cmdList?.addEventListener('click', e => {
    const li = e.target.closest('li'); if (!li) return;
    location.hash = li.dataset.hash; toggleCmdk(false);
  });

  // Init
  route(location.hash);
})();