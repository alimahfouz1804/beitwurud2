/* Navigation, gallery and gentle progressive enhancement. No dependencies. */
(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-navigation');
  const setMenu = open => {
    toggle?.setAttribute('aria-expanded', String(open));
    toggle?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav?.classList.toggle('is-open', open);
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav?.addEventListener('click', event => { if (event.target.closest('a, button')) setMenu(false); });
  document.addEventListener('click', event => { if (!header?.contains(event.target)) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  matchMedia('(min-width:621px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 15);
  window.addEventListener('scroll', updateHeader, {passive:true}); updateHeader();
  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });

  document.querySelectorAll('[data-quantity-step]').forEach(button => button.addEventListener('click', () => {
    const input = button.closest('.quantity-control').querySelector('input');
    const current = Number(input.value);
    const next = (Number.isFinite(current) ? Math.trunc(current) : 1) + Number(button.dataset.quantityStep);
    input.value = String(Math.max(1, Math.min(99, next)));
    input.dispatchEvent(new Event('change', {bubbles:true}));
  }));

  // Text in product cards follows the editable catalogue in products.js.
  (window.BeitWurudProducts || []).forEach(product => {
    document.querySelectorAll(`[data-product-name="${product.id}"]`).forEach(node => { node.textContent = product.name; });
    document.querySelectorAll(`[data-product-placeholder="${product.id}"]`).forEach(node => { node.hidden = !product.placeholderName; });
    if (typeof product.price === 'number' && Number.isFinite(product.price) && product.price >= 0) {
      document.querySelectorAll(`[data-product-price="${product.id}"]`).forEach(node => {
        node.textContent = new Intl.NumberFormat('en-US',{style:'currency',currency:product.currency || window.BeitWurudConfig.currency || 'USD'}).format(product.price);
      });
    }
  });

  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('is-pending'); entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); }
    }), {threshold:0.06});
    document.querySelectorAll('.reveal').forEach(node => { node.classList.add('is-pending'); reveal.observe(node); });
  }

  const photos = document.querySelectorAll('[data-lightbox]');
  if (photos.length) {
    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox'; dialog.setAttribute('aria-label', 'Our space photo');
    dialog.innerHTML = '<button class="lightbox-close" aria-label="Close enlarged photo" type="button">×</button><img alt=""><p></p>';
    document.body.append(dialog);
    const close = () => dialog.close();
    dialog.querySelector('button').addEventListener('click', close);
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(); } });
    photos.forEach(button => button.addEventListener('click', () => {
      dialog.querySelector('img').src = button.dataset.lightbox;
      dialog.querySelector('img').alt = button.dataset.caption;
      dialog.querySelector('p').textContent = button.dataset.caption;
      dialog.showModal();
    }));
  }
})();
