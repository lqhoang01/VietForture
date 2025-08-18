(()=>{'use strict';
  const tabs=[...document.querySelectorAll('.tab')];
  const views={
    gioithieu:document.getElementById('view-gioithieu'),
    dichvu:document.getElementById('view-dichvu'),
    tuyendung:document.getElementById('view-tuyendung'),
    tintuc:document.getElementById('view-tintuc'),
    tindung:document.getElementById('view-tindung'),
    kitucxa:document.getElementById('view-kitucxa')
  };
  const servicesBox=document.getElementById('services');
  // Hỗ trợ cả ảnh <img id="dragonV"> cũ lẫn wrapper 3D mới
  const dragonEl = document.getElementById('dragonV') || document.querySelector('.dragon3d-wrap');

  function setTabState(name){
    tabs.forEach(b=>{
      const active=b.dataset.nav===name;
      b.classList.toggle('is-active',active);
      b.setAttribute('aria-selected',active?'true':'false');
    });
  }
  function show(name){
    Object.entries(views).forEach(([k,el])=>{
      if(!el)return;
      const vis=k===name;
      el.classList.toggle('is-visible',vis);
      el.toggleAttribute('hidden',!vis);
    });
    setTabState(['gioithieu','dichvu','tuyendung','tintuc'].includes(name)?name:'');
    if(name==='dichvu'&&servicesBox){
      servicesBox.classList.remove('reveal');
      void servicesBox.offsetWidth;
      servicesBox.classList.add('reveal');
    }
    // Trigger hiệu ứng xuất hiện cho logo (ảnh cũ hoặc wrapper 3D)
    if(name==='gioithieu'&&dragonEl){
      dragonEl.classList.remove('show');
      void dragonEl.offsetWidth;
      dragonEl.classList.add('show');
    }
  }
  function navigate(name){
    if(!views[name]) name='gioithieu';
    if(location.hash!==`#${name}`) history.replaceState(null,'',`#${name}`);
    show(name);
  }

  document.getElementById('brandHome')?.addEventListener('click',e=>{e.preventDefault();navigate('gioithieu')});
  tabs.forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.nav)));
  document.querySelectorAll('[data-nav]').forEach(el=>{if(!el.classList.contains('tab')) el.addEventListener('click',()=>navigate(el.dataset.nav))});
  window.addEventListener('hashchange',()=>navigate((location.hash||'#gioithieu').slice(1)));
  navigate((location.hash||'#gioithieu').slice(1));

  document.getElementById('loanForm')?.addEventListener('submit',e=>{e.preventDefault();alert('Đã gửi yêu cầu tư vấn Tín Dụng. Chúng tôi sẽ liên hệ sớm nhất!')});
  document.getElementById('dormForm')?.addEventListener('submit',e=>{e.preventDefault();alert('Đã gửi yêu cầu tư vấn Ký Túc Xá. Chúng tôi sẽ liên hệ sớm nhất!')});
})();
