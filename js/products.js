/** Shared catalog for the home page and product page. No GitHub account is hardcoded. */
(() => {
  const grid = document.querySelector('[data-products]');
  if (!grid) return;
  const message = document.querySelector('[data-products-message]');
  const search = document.getElementById('product-search-input');
  const filters = [...document.querySelectorAll('.product-filter-btn')];
  const overlay = document.getElementById('product-modal-overlay');
  const closeButton = document.getElementById('product-modal-close');
  const categories = {
    'transformer-panel': 'Trạm Biến Áp & Tủ Điện',
    switchgear: 'Khí Cụ Đóng Cắt',
    'cable-tray': 'Cáp Điện & Thang Máng Cáp',
    automation: 'Đo Lường & Tự Động Hoá',
  };
  let products = [];
  let loaded = false;
  let opener;
  let previousOverflow = '';
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
  const normalize = (value) => String(value ?? '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const specs = (product) => Array.isArray(product.specs) ? product.specs : [];
  const quote = (product) => `https://zalo.me/0989584595?text=${encodeURIComponent(
    `Xin chào EPIC VIETNAM, tôi muốn nhận báo giá sản phẩm: ${product.title} (${product.model || ''})`,
  )}`;
  // CMS media paths are relative to this site, including on /repository/ Pages URLs.
  function imagePath(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    const path = value.trim().replace(/^\/+/, '');
    if (!path.startsWith('images/products/') || path.split('/').includes('..') || /[\\:]/.test(path)) return '';
    return path;
  }
  const placeholder = '<div class="product-img-placeholder"><i data-lucide="image" class="placeholder-icon"></i><span class="placeholder-text">Hình ảnh thiết bị</span></div>';
  function photo(product) {
    const src = imagePath(product.image);
    return src ? `<img class="product-photo" src="${escape(src)}" alt="${escape(product.title)}" loading="lazy">` : placeholder;
  }
  function refreshIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
  function handleImageErrors(container) {
    container.querySelectorAll('.product-photo').forEach((img) => {
      img.addEventListener('error', () => {
        img.parentElement.innerHTML = placeholder;
        refreshIcons();
      }, { once: true });
    });
  }
  function render() {
    if (!loaded) return;
    const category = filters.find((button) => button.classList.contains('active'))?.dataset.cat || 'all';
    const query = normalize(search?.value).trim();
    const shown = products.filter((p) => p.visible !== false)
      .filter((p) => grid.dataset.products !== 'featured' || p.featured === true)
      .filter((p) => category === 'all' || p.category === category)
      .filter((p) => normalize(`${p.title} ${p.model || ''} ${p.brand || ''}`).includes(query));
    grid.innerHTML = shown.map((p) => `
      <div class="product-card" data-product-cat="${escape(p.category)}">
        <div class="product-badge-top"><span class="badge-brand">${escape(p.brand || 'EPIC VIETNAM')}</span><span class="badge-status${p.status === 'Sẵn hàng' ? '' : ' order'}">${escape(p.status || 'Liên hệ')}</span></div>
        <div class="product-thumb">${photo(p)}</div>
        <div class="product-info">
          <span class="product-category-label">${escape(categories[p.category] || p.category)}</span>
          <h3 class="product-title">${escape(p.title)}</h3>
          <div class="product-model"><i data-lucide="tag" style="width:14px;height:14px"></i> Model: ${escape(p.model || 'Đang cập nhật')}</div>
          <ul class="product-specs-list">${specs(p).map((s) => `<li><i data-lucide="check"></i>${escape(s)}</li>`).join('')}</ul>
          <div class="product-pricing"><span class="price-label">Giá:</span><span class="price-value contact">${escape(p.price || 'Liên hệ báo giá')}</span></div>
          <div class="product-actions">
            <a href="${escape(quote(p))}" target="_blank" rel="noopener noreferrer" class="btn-zalo-quote"><img src="assets/icons/zalo.svg" class="zalo-button-icon" width="24" height="24" alt="" aria-hidden="true"> Báo giá Zalo</a>
            <button type="button" class="btn-view-spec" data-product-index="${products.indexOf(p)}"><i data-lucide="eye" style="width:15px;height:15px"></i> Xem thông số</button>
          </div>
        </div>
      </div>`).join('');
    message.textContent = shown.length ? '' : 'Chưa có sản phẩm phù hợp.';
    message.hidden = shown.length > 0;
    handleImageErrors(grid);
    refreshIcons();
  }
  function applyHash() {
    const category = location.hash.slice(1);
    const selected = filters.find((button) => button.dataset.cat === category) || filters[0];
    filters.forEach((button) => {
      const active = button === selected;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    render();
  }
  filters.forEach((button) => button.addEventListener('click', () => {
    history.replaceState(null, '', `${location.pathname}${location.search}${button.dataset.cat === 'all' ? '' : '#' + button.dataset.cat}`);
    applyHash();
  }));
  window.addEventListener('hashchange', applyHash);
  search?.addEventListener('input', render);
  function closeModal() {
    if (!overlay?.classList.contains('active')) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = previousOverflow;
    opener?.focus();
  }
  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-product-index]');
    if (!button || !overlay) return;
    const product = products[Number(button.dataset.productIndex)];
    opener = button;
    document.getElementById('modal-product-title').textContent = product.title;
    document.getElementById('modal-product-model').textContent = `Model: ${product.model || 'Đang cập nhật'}`;
    document.getElementById('modal-product-price').textContent = product.price || 'Liên hệ báo giá';
    document.getElementById('modal-product-description').textContent = product.description || '';
    document.getElementById('modal-zalo-link').href = quote(product);
    overlay.querySelector('.modal-img-wrap').innerHTML = photo(product);
    const rows = [['Thương hiệu', product.brand || 'EPIC VIETNAM'], ['Tình trạng', product.status || 'Liên hệ'], ...specs(product).map((s, i) => [`Thông số ${i + 1}`, s])];
    overlay.querySelector('.modal-specs-table tbody').innerHTML = rows.map(([label, value]) => `<tr><td>${escape(label)}</td><td>${escape(value)}</td></tr>`).join('');
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    handleImageErrors(overlay);
    refreshIcons();
    closeButton.focus();
  });
  closeButton?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', (event) => { if (event.target === overlay) closeModal(); });
  document.addEventListener('keydown', (event) => {
    if (!overlay?.classList.contains('active')) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'Tab') {
      const controls = [...overlay.querySelectorAll('button, a[href]')];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  applyHash();
  fetch('data/products.json', { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error('Catalog request failed');
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data.products) || data.products.some((p) => !p || typeof p.title !== 'string')) throw new Error('Invalid catalog');
      products = data.products;
      loaded = true;
      render();
    })
    .catch(() => {
      message.hidden = false;
      message.textContent = 'Không tải được danh sách sản phẩm. Vui lòng tải lại trang hoặc liên hệ để được tư vấn.';
    })
    .finally(() => grid.setAttribute('aria-busy', 'false'));
})();
