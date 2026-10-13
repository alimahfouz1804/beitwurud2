(function (global) {
  'use strict';

  var STORAGE_KEY = 'beit-wurud-cart-v1';
  var MAX_QUANTITY = 99;
  var CUSTOM_DESIGN_MESSAGE = 'Hello Beit Wurud! I would like to request a custom flower design. Could you please help me?';
  var CONTACT_MESSAGE = 'Hello Beit Wurud! I would like to learn more.';

  function normalizeQuantity(value, fallback) {
    var number = typeof value === 'number' ? value : (/^\d+$/.test(String(value).trim()) ? Number(value) : NaN);
    if (!Number.isSafeInteger(number) || number < 1) return fallback === undefined ? 1 : fallback;
    return Math.min(number, MAX_QUANTITY);
  }

  function findProduct(id, products) {
    return products.find(function (product) { return product.id === id; });
  }

  function sanitizeCart(value, products) {
    if (!Array.isArray(value)) return [];
    var clean = [];
    // Bound processing of corrupted or unnecessarily large stored data.
    value.slice(0, 1000).forEach(function (line) {
      if (!line || typeof line !== 'object' || typeof line.id !== 'string') return;
      if (!findProduct(line.id, products)) return;
      var quantity = normalizeQuantity(line.quantity, 0);
      if (!quantity) return;
      var existing = clean.find(function (item) { return item.id === line.id; });
      if (existing) existing.quantity = Math.min(existing.quantity + quantity, MAX_QUANTITY);
      else clean.push({ id: line.id, quantity: quantity });
    });
    return clean;
  }

  function isPriced(product) {
    return typeof product.price === 'number' && Number.isFinite(product.price) && product.price >= 0;
  }

  function productCurrency(product, config) {
    var currency = product.currency || config.currency || 'USD';
    return typeof currency === 'string' && /^[A-Z]{3}$/.test(currency) ? currency : 'USD';
  }

  function formatMoney(amount, currency) {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
    } catch (error) {
      return currency + ' ' + amount.toFixed(2);
    }
  }

  function getTotals(cart, products, config) {
    var totals = {};
    var unpriced = 0;
    var count = 0;
    sanitizeCart(cart, products).forEach(function (line) {
      var product = findProduct(line.id, products);
      count += line.quantity;
      if (isPriced(product)) {
        var currency = productCurrency(product, config);
        totals[currency] = (totals[currency] || 0) + product.price * line.quantity;
      } else unpriced += line.quantity;
    });
    return { totals: totals, unpriced: unpriced, count: count };
  }

  function buildOrderMessage(cart, products, config) {
    var clean = sanitizeCart(cart, products);
    if (!clean.length) return '';
    var lines = ['Hello Beit Wurud! I would like to order:', ''];
    clean.forEach(function (line) {
      var product = findProduct(line.id, products);
      var amount = isPriced(product)
        ? formatMoney(product.price * line.quantity, productCurrency(product, config))
        : 'Price on request';
      lines.push(line.quantity + ' × ' + product.name + ' — ' + amount);
    });
    var summary = getTotals(clean, products, config);
    lines.push('', 'Items: ' + summary.count);
    Object.keys(summary.totals).sort().forEach(function (currency) {
      lines.push((summary.unpriced ? 'Priced items subtotal: ' : 'Total: ') + formatMoney(summary.totals[currency], currency));
    });
    lines.push('', 'Please confirm availability, final prices, and pickup or delivery details. Thank you!');
    return lines.join('\n');
  }

  function validWhatsAppNumber(number) {
    return typeof number === 'string' && /^[1-9]\d{6,14}$/.test(number);
  }

  function buildWhatsAppUrl(number, message) {
    return validWhatsAppNumber(number) && message ? 'https://wa.me/' + number + '?text=' + encodeURIComponent(message) : null;
  }

  var api = {
    STORAGE_KEY: STORAGE_KEY,
    MAX_QUANTITY: MAX_QUANTITY,
    CUSTOM_DESIGN_MESSAGE: CUSTOM_DESIGN_MESSAGE,
    normalizeQuantity: normalizeQuantity,
    sanitizeCart: sanitizeCart,
    getTotals: getTotals,
    buildOrderMessage: buildOrderMessage,
    buildWhatsAppUrl: buildWhatsAppUrl,
    validWhatsAppNumber: validWhatsAppNumber,
    formatMoney: formatMoney
  };
  global.BWCart = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (!global.document) return;

  function init() {
    var document = global.document;
    var products = Array.isArray(global.BeitWurudProducts) ? global.BeitWurudProducts : [];
    var cart = [];
    var lastFocus = null;
    var contactLastFocus = null;
    var storageAvailable = true;

    function config() { return global.BeitWurudConfig || {}; }

    try {
      cart = sanitizeCart(JSON.parse(global.localStorage.getItem(STORAGE_KEY) || '[]'), products);
    } catch (error) {
      storageAvailable = false;
      cart = [];
    }

    function element(tag, className, content) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (content !== undefined) node.textContent = content;
      return node;
    }

    function button(className, content, label) {
      var node = element('button', className, content);
      node.type = 'button';
      if (label) node.setAttribute('aria-label', label);
      return node;
    }

    var status = document.querySelector('[data-cart-status]') || element('div', 'cart-status sr-only');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    if (!status.parentNode) document.body.appendChild(status);

    var drawer = element('dialog', 'cart-drawer');
    drawer.id = 'cart-dialog';
    drawer.setAttribute('aria-labelledby', 'cart-dialog-title');
    var header = element('div', 'cart-drawer__header');
    var title = element('h2', 'cart-drawer__title', 'Your flower basket');
    title.id = 'cart-dialog-title';
    var close = button('cart-drawer__close', '×', 'Close basket');
    header.append(title, close);
    var body = element('div', 'cart-drawer__body');
    var footer = element('div', 'cart-drawer__footer');
    var summary = element('div', 'cart-drawer__summary');
    var checkout = button('button button--primary cart-drawer__checkout', 'Order via WhatsApp');
    var continueShopping = button('button button--secondary cart-drawer__continue', 'Continue shopping');
    var feedback = element('div', 'cart-drawer__feedback');
    feedback.setAttribute('aria-live', 'polite');
    footer.append(summary, checkout, continueShopping, feedback);
    drawer.append(header, body, footer);
    document.body.appendChild(drawer);

    var contact = element('dialog', 'contact-dialog');
    contact.setAttribute('aria-labelledby', 'contact-dialog-title');
    var contactClose = button('contact-dialog__close', '×', 'Close contact details');
    var contactTitle = element('h2', 'contact-dialog__title', 'Contact Beit Wurud');
    contactTitle.id = 'contact-dialog-title';
    var contactBody = element('div', 'contact-dialog__body');
    contact.append(contactClose, contactTitle, contactBody);
    document.body.appendChild(contact);

    function announce(message) {
      status.textContent = message;
    }

    function persist() {
      try {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        storageAvailable = true;
      } catch (error) {
        storageAvailable = false;
      }
    }

    function clearFeedback() { feedback.replaceChildren(); }

    function saveAndRender(message, focusTarget) {
      persist();
      render();
      if (message) announce(message);
      if (focusTarget) {
        var target = body.querySelector(focusTarget);
        if (target) target.focus();
      }
    }

    function add(id, quantity) {
      var product = findProduct(id, products);
      if (!product) return false;
      var amount = normalizeQuantity(quantity, 0);
      if (!amount) return false;
      var existing = cart.find(function (line) { return line.id === id; });
      var exceedsMaximum = existing && existing.quantity + amount > MAX_QUANTITY;
      if (existing) existing.quantity = Math.min(existing.quantity + amount, MAX_QUANTITY);
      else cart.push({ id: id, quantity: amount });
      saveAndRender(exceedsMaximum
        ? product.name + ' is at the maximum of 99 in your basket.'
        : product.name + ' added to your basket.');
      return true;
    }

    function setQuantity(id, quantity, focusTarget) {
      var line = cart.find(function (item) { return item.id === id; });
      if (!line) return;
      var amount = normalizeQuantity(quantity, 0);
      if (!amount) return;
      line.quantity = amount;
      saveAndRender('Basket updated.', focusTarget);
    }

    function remove(id) {
      var product = findProduct(id, products);
      var index = cart.findIndex(function (line) { return line.id === id; });
      if (index < 0) return;
      cart.splice(index, 1);
      saveAndRender(product.name + ' removed from your basket.');
      var nextRemove = body.querySelectorAll('.cart-item__remove')[Math.min(index, cart.length - 1)];
      (nextRemove || close).focus();
    }

    function makeLine(line) {
      var product = findProduct(line.id, products);
      var item = element('li', 'cart-item');
      item.dataset.productId = line.id;
      var photo = element('img', 'cart-item__image');
      photo.src = product.image;
      photo.alt = product.alt || product.name;
      photo.width = 100;
      photo.height = 120;
      var details = element('div', 'cart-item__details');
      var name = element('h3', 'cart-item__name', product.name);
      var price = element('p', 'cart-item__price', isPriced(product)
        ? formatMoney(product.price, productCurrency(product, config())) + ' each'
        : 'Price on request');
      var controls = element('div', 'cart-item__controls');
      var quantityControl = element('div', 'quantity-control');
      var minus = button('quantity-control__button', '−', 'Decrease quantity of ' + product.name);
      minus.disabled = line.quantity <= 1;
      minus.dataset.quantityAction = 'decrease';
      var input = element('input', 'quantity-control__input');
      input.type = 'number';
      input.inputMode = 'numeric';
      input.min = '1';
      input.max = String(MAX_QUANTITY);
      input.step = '1';
      input.value = String(line.quantity);
      input.setAttribute('aria-label', 'Quantity of ' + product.name);
      input.dataset.quantityInput = line.id;
      var plus = button('quantity-control__button', '+', 'Increase quantity of ' + product.name);
      plus.disabled = line.quantity >= MAX_QUANTITY;
      plus.dataset.quantityAction = 'increase';
      var removeButton = button('cart-item__remove', 'Remove', 'Remove ' + product.name + ' from basket');
      quantityControl.append(minus, input, plus);
      controls.append(quantityControl, removeButton);
      details.append(name, price, controls);
      item.append(photo, details);
      function focusSelector(action) {
        return '[data-product-id="' + line.id + '"] [data-quantity-action="' + action + '"]';
      }
      minus.addEventListener('click', function () {
        setQuantity(line.id, line.quantity - 1, line.quantity === 2 ? '[data-quantity-input="' + line.id + '"]' : focusSelector('decrease'));
      });
      plus.addEventListener('click', function () {
        setQuantity(line.id, line.quantity + 1, line.quantity === MAX_QUANTITY - 1 ? '[data-quantity-input="' + line.id + '"]' : focusSelector('increase'));
      });
      input.addEventListener('change', function () {
        var amount = normalizeQuantity(input.value, 0);
        if (!amount || !input.checkValidity()) {
          input.value = String(line.quantity);
          announce('Please choose a whole number from 1 to 99.');
          return;
        }
        setQuantity(line.id, amount, '[data-quantity-input="' + line.id + '"]');
      });
      removeButton.addEventListener('click', function () { remove(line.id); });
      return item;
    }

    function render() {
      clearFeedback();
      var totals = getTotals(cart, products, config());
      document.querySelectorAll('[data-cart-count]').forEach(function (badge) {
        badge.textContent = String(totals.count);
      });
      document.querySelectorAll('[data-cart-open]').forEach(function (trigger) {
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.setAttribute('aria-controls', drawer.id);
        trigger.setAttribute('aria-label', 'Open flower basket, ' + totals.count + (totals.count === 1 ? ' item' : ' items'));
      });
      body.replaceChildren();
      summary.replaceChildren();
      checkout.disabled = !cart.length;
      if (!cart.length) {
        var empty = element('div', 'cart-drawer__empty');
        empty.append(element('p', '', 'Your basket is empty.'), element('p', '', 'Choose a bouquet to get started.'));
        var browse = element('a', 'button button--secondary', 'Explore our flowers');
        browse.href = 'flowers.html';
        empty.appendChild(browse);
        body.appendChild(empty);
        return;
      }
      var list = element('ul', 'cart-drawer__items');
      cart.forEach(function (line) { list.appendChild(makeLine(line)); });
      body.appendChild(list);
      summary.appendChild(element('p', 'cart-drawer__count', totals.count + (totals.count === 1 ? ' flower arrangement' : ' flower arrangements')));
      Object.keys(totals.totals).sort().forEach(function (currency) {
        summary.appendChild(element('p', 'cart-drawer__total', (totals.unpriced ? 'Priced items subtotal: ' : 'Total: ') + formatMoney(totals.totals[currency], currency)));
      });
      if (totals.unpriced) summary.appendChild(element('p', 'cart-drawer__price-note', 'Prices confirmed on WhatsApp.'));
      summary.appendChild(element('p', 'cart-drawer__note', 'We’ll confirm availability and pickup or delivery with you.'));
      if (!storageAvailable) summary.appendChild(element('p', 'cart-drawer__note', 'Your browser could not save this basket. Keep this page open while you prepare your order.'));
    }

    function openCart(trigger) {
      lastFocus = trigger || document.activeElement;
      render();
      if (!drawer.open) drawer.showModal();
      document.body.classList.add('has-modal');
      close.focus();
    }

    function restoreFocus(target) {
      document.body.classList.remove('has-modal');
      if (target && target.isConnected && typeof target.focus === 'function') target.focus();
    }

    function addFallback(container, message) {
      container.replaceChildren();
      var fallback = element('div', 'order-fallback');
      var note = element('p', 'order-fallback__note', 'Our WhatsApp link is being updated. You can copy your message below and share it with Beit Wurud through your usual contact.');
      var field = element('textarea', 'order-fallback__message');
      field.readOnly = true;
      field.rows = Math.min(Math.max(message.split('\n').length, 4), 10);
      field.value = message;
      field.setAttribute('aria-label', 'Your message to Beit Wurud');
      var copy = button('button button--secondary order-fallback__copy', 'Copy message');
      var copyStatus = element('p', 'order-fallback__status');
      copyStatus.setAttribute('role', 'status');
      copy.addEventListener('click', function () {
        if (global.navigator.clipboard && global.isSecureContext) {
          global.navigator.clipboard.writeText(message).then(function () {
            copyStatus.textContent = 'Message copied. You can share it with Beit Wurud.';
          }).catch(function () { selectForCopy(); });
        } else selectForCopy();
      });
      function selectForCopy() {
        field.focus();
        field.select();
        copyStatus.textContent = 'Message selected. Use your device’s Copy command to copy it.';
      }
      fallback.append(note, field, copy, copyStatus);
      container.appendChild(fallback);
      return field;
    }

    function launchWhatsApp(message, fallbackContainer) {
      var url = buildWhatsAppUrl(config().whatsappNumber, message);
      if (!url) {
        var field = addFallback(fallbackContainer, message);
        field.focus();
        return false;
      }
      // A direct user click opens the draft. The user sends it in WhatsApp.
      var link = element('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    }

    close.addEventListener('click', function () { drawer.close(); });
    continueShopping.addEventListener('click', function () { drawer.close(); });
    drawer.addEventListener('close', function () { restoreFocus(lastFocus); });
    contactClose.addEventListener('click', function () { contact.close(); });
    contact.addEventListener('close', function () { restoreFocus(contactLastFocus); });
    [drawer, contact].forEach(function (dialog) {
      dialog.addEventListener('click', function (event) {
        if (event.target !== dialog) return;
        var rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
      });
    });
    checkout.addEventListener('click', function () {
      var message = buildOrderMessage(cart, products, config());
      if (message) launchWhatsApp(message, feedback);
    });
    document.querySelectorAll('[data-cart-open]').forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        openCart(trigger);
      });
    });
    document.querySelectorAll('[data-product-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('[name="quantity"]');
        if (input && !input.reportValidity()) return;
        var amount = normalizeQuantity(input ? input.value : 1, 0);
        if (!amount) { announce('Please choose a whole number from 1 to 99.'); return; }
        if (add(form.dataset.productId, amount)) {
          openCart(event.submitter || form.querySelector('[type="submit"]'));
        }
      });
    });
    document.querySelectorAll('[data-whatsapp], [data-custom-design]').forEach(function (trigger) {
      if (!validWhatsAppNumber(config().whatsappNumber)) trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        var message = trigger.hasAttribute('data-custom-design') ? CUSTOM_DESIGN_MESSAGE : CONTACT_MESSAGE;
        if (buildWhatsAppUrl(config().whatsappNumber, message)) {
          launchWhatsApp(message, contactBody);
          return;
        }
        contactLastFocus = trigger;
        contactTitle.textContent = trigger.hasAttribute('data-custom-design') ? 'Your custom floral design' : 'Contact Beit Wurud';
        addFallback(contactBody, message);
        if (!contact.open) contact.showModal();
        document.body.classList.add('has-modal');
        contactClose.focus();
      });
    });
    global.addEventListener('storage', function (event) {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      try { cart = sanitizeCart(JSON.parse(event.newValue || '[]'), products); }
      catch (error) { cart = []; }
      render();
      announce('Basket updated from another tab.');
    });

    api.add = add;
    api.setQuantity = setQuantity;
    api.remove = remove;
    api.open = openCart;
    api.getItems = function () { return cart.map(function (line) { return { id: line.id, quantity: line.quantity }; }); };
    api.getMessage = function () { return buildOrderMessage(cart, products, config()); };
    render();
  }

  if (global.document.readyState === 'loading') global.document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
