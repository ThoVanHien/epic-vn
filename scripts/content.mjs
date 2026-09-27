import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

export const pageNames = ['index', 'about', 'services', 'products', 'news', 'careers', 'profile', 'contact'];
export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
export function safeURL(value, media = false) {
  const url = String(value || '').trim();
  if (!url) return '';
  if (/[\x00-\x20\\]/.test(url) || /^(?:\/\/|javascript:|data:|vbscript:)/i.test(url)) throw new Error(`Đường dẫn không hợp lệ: ${url}`);
  if (media) {
    const relative = url.replace(/^\//, '');
    if (!/^(images|assets)\//.test(relative) || relative.split('/').includes('..')) throw new Error(`File cần nằm trong images/ hoặc assets/: ${url}`);
    return relative;
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(url) && !/^(https?:|mailto:|tel:)/i.test(url)) throw new Error(`Giao thức không được hỗ trợ: ${url}`);
  if (url.startsWith('/')) throw new Error(`Dùng đường dẫn tương đối để hỗ trợ GitHub Pages: ${url}`);
  return url;
}
const read = (root, file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
export function readContent(root) {
  const categories = fs.readdirSync(path.join(root, 'data/categories')).filter(f => f.endsWith('.json')).map(f => read(root, `data/categories/${f}`)).sort((a,b) => (a.order || 0) - (b.order || 0));
  return {
    site: read(root,'data/site.json'), categories,
    products: read(root,'data/products.json').products || [],
    services: read(root,'data/services.json').items || [],
    news: read(root,'data/news.json').items || [],
    jobs: read(root,'data/jobs.json').items || [],
    pages: Object.fromEntries(pageNames.map(name => [name, read(root,`data/pages/${name}.json`)])),
  };
}
export function validateContent(data, root) {
  for (const key of ['categories','products','services','news','jobs']) {
    if (!Array.isArray(data[key])) throw new Error(`${key}: dữ liệu phải là một danh sách.`);
  }
  for (const page of pageNames) {
    if (!data.pages[page]?.seo?.title?.trim()) throw new Error(`Trang ${page}: cần nhập tiêu đề trang trong phần công cụ tìm kiếm.`);
  }
  const ids = new Set();
  for (const c of data.categories) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.id) || !c.title?.trim() || ids.has(c.id)) throw new Error(`Mã/tên danh mục thiếu, trùng hoặc không hợp lệ: ${c.id}`);
    ids.add(c.id);
  }
  for (const p of data.products) {
    if (!p.title?.trim()) throw new Error('Sản phẩm cần có tên.');
    if (!ids.has(p.category)) throw new Error(`Sản phẩm "${p.title}" còn dùng danh mục "${p.category}". Hãy chuyển sản phẩm sang danh mục có sẵn trước khi xóa danh mục.`);
    if (p.specs != null && (!Array.isArray(p.specs) || p.specs.some(s => typeof s !== 'string'))) throw new Error(`Thông số của ${p.title} phải là danh sách văn bản.`);
  }
  for (const key of ['services','news']) {
    const seen = new Set();
    for (const item of data[key]) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || seen.has(item.id)) throw new Error(`Mã ${key} không hợp lệ hoặc bị trùng: ${item.id}`);
      if (!item.title?.trim()) throw new Error(`${key}: thiếu tiêu đề.`);
      seen.add(item.id);
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.site.email)) throw new Error('Email liên hệ không hợp lệ.');
  if (!/^\+?[\d ()-]{8,20}$/.test(data.site.phone)) throw new Error('Số điện thoại liên hệ không hợp lệ.');
  function checkMedia(value, key = '') {
    if (value && typeof value === 'object') return Object.entries(value).forEach(([k,v]) => checkMedia(v,k));
    if (typeof value === 'string' && value && (['image','logo','banner_image','profile_pdf'].includes(key) || key.startsWith('image_'))) {
      const relative = safeURL(value,true);
      if (root && !fs.existsSync(path.join(root,relative))) throw new Error(`Chưa tìm thấy file: ${relative}`);
    }
  }
  checkMedia(data);
}
const at = (object, key) => key.split('.').reduce((value, part) => value?.[part], object);
const image = (src, title, icon='image') => src ? `<img src="${escape(safeURL(src,true))}" alt="${escape(title)}" loading="lazy">` : `<div class="cms-image-placeholder"><i data-lucide="${icon}"></i><span>${escape(title)}</span></div>`;
const paragraphs = value => String(value || '').split(/\n+/).filter(Boolean).map(p => `<p>${escape(p)}</p>`).join('');
const visible = items => items.filter(p => p.visible !== false);
function setText($, element, value) {
  // Retain decorative icons, but never interpret CMS text as HTML.
  const e=$(element), icons=e.children('i, svg').clone();
  e.text(String(value ?? '')); if (icons.length) e.prepend(icons);
}
export function renderPage(source, page, data) {
  const $ = load(source), content = data.pages[page], site = data.site;
  $('[data-cms]').each((_,el) => {
    const value=at(content,$(el).attr('data-cms'));
    setText($,el,value);
  });
  $('[data-cms-placeholder]').each((_,el) => $(el).attr('placeholder', at(content,$(el).attr('data-cms-placeholder')) || ''));
  for (const attr of ['href','src']) $(`[data-cms-${attr}]`).each((_,el) => {
    const value=at(content,$(el).attr(`data-cms-${attr}`));
    $(el).attr(attr,safeURL(value,attr==='src'));
  });
  $('title').text(content.seo.title);
  $('meta[name="description"]').attr('content',content.seo.description);
  $('[data-site]').each((_,el) => setText($,el,site[$(el).attr('data-site')]));
  $('[data-site-src]').each((_,el)=>{
    const src=site[$(el).attr('data-site-src')];
    if(src)$(el).attr('src',safeURL(src,true));else $(el).remove();
  });
  // Shared company identifiers also occur in legal tables and profile text.
  $('body *').contents().filter((_,node)=>node.type==='text').each((_,node)=>{
    if ($(node).parents('script,style,[data-site]').length) return;
    node.data=node.data.replaceAll('CÔNG TY TNHH DỊCH VỤ KỸ THUẬT EPIC VIỆT NAM',site.legal_name).replaceAll('3703511268',site.tax_id).replaceAll('Thứ 2 - Thứ 7: 7h30 - 17h30',site.hours);
  });
  $('[data-contact]').each((_,el)=>{
    const e=$(el), kind=e.attr('data-contact'), old=e.text().trim();
    const url=kind==='phone'?`tel:${site.phone.replace(/[ ()-]/g,'')}`:kind==='email'?`mailto:${site.email}`:site[kind];
    if (!url) {e.remove();return;}
    e.attr('href',safeURL(url));
    if(kind==='phone' && /\d{3}/.test(old))setText($,el,old.includes('Gọi')?`Gọi ${site.phone_label}`:site.phone_label);
    if(kind==='email')setText($,el,site.email);
  });
  $('[data-profile-download]').each((_,el)=>{
    if(site.profile_pdf){$(el).attr('href',safeURL(site.profile_pdf,true)).removeAttr('data-contact');setText($,el,'Tải hồ sơ năng lực PDF');}
    else {$(el).attr('href',safeURL(site.zalo||`mailto:${site.email}`));setText($,el,'Yêu cầu hồ sơ năng lực');}
  });
  if(content.banner_image){
    const banner=$('.hero, .page-banner').first();
    banner.prepend(`<img class="cms-banner-image" src="${escape(safeURL(content.banner_image,true))}" alt="">`).addClass('has-banner-image');
  }
  $('[data-category-menu]').each((_,el)=>{
    const mobile=$(el).attr('data-category-menu')==='mobile';
    $(el).html((mobile?'<a href="products.html" class="sub-all-link">Xem tất cả sản phẩm</a>':'')+data.categories.map(c=>`<a class="${mobile?'':'dropdown-item'}" href="products.html#${escape(c.id)}">${escape(c.title)}</a>`).join(''));
  });
  $('.product-filter-bar').html('<button class="product-filter-btn active" data-cat="all" aria-pressed="true">Tất cả sản phẩm</button>'+data.categories.map(c=>`<button class="product-filter-btn" data-cat="${escape(c.id)}" aria-pressed="false">${escape(c.title)}</button>`).join(''));
  $('[data-service-options]').html('<option value="">Chọn nhu cầu tư vấn</option>'+visible(data.services).map(s=>`<option value="${escape(s.title)}">${escape(s.title)}</option>`).join('')+'<option value="Nhu cầu khác">Nhu cầu khác</option>');
  $('[data-render="services-preview"]').html(visible(data.services).slice(0,4).map(s=>`<article class="service-card"><div class="service-icon-box"><i data-lucide="zap"></i></div><h3 class="service-title">${escape(s.title)}</h3><p class="service-text">${escape(s.description)}</p><a class="service-link" href="services.html#${escape(s.id)}">Xem chi tiết <i data-lucide="arrow-right"></i></a></article>`).join(''));
  $('[data-render="stats"]').html((content.stats||[]).map(s=>`<div class="stat-item"><div class="stat-number">${escape(s.value)}</div><div class="stat-label">${escape(s.title)}</div></div>`).join(''));
  $('[data-render="projects"]').html(visible(content.projects||[]).map(p=>`<article class="project-card"><div class="project-thumb">${image(p.image,p.title,'building-2')}<span class="project-thumb-badge">${escape(p.badge)}</span></div><div class="project-info"><div class="project-category">${escape(p.category)}</div><h3 class="project-name">${escape(p.title)}</h3><p class="project-location">${escape(p.location)}</p><div class="project-spec"><span>${escape(p.scale)}</span><span>${escape(p.year)}</span></div></div></article>`).join(''));
  $('[data-render="features"]').html(visible(content.features||[]).map(f=>`<article class="feature-card"><h4>${escape(f.title)}</h4><p>${escape(f.description)}</p></article>`).join(''));
  $('footer .footer-links').filter((_,el)=>$(el).find('a[href^="services.html#"]').length>0).html(visible(data.services).map(s=>`<li><a href="services.html#${escape(s.id)}">${escape(s.title)}</a></li>`).join(''));
  $('[data-render="services"]').html(visible(data.services).map(s=>`<article class="service-detail-row cms-service" id="${escape(s.id)}"><div><span class="section-tag">Dịch vụ kỹ thuật</span><h2>${escape(s.title)}</h2><p>${escape(s.description)}</p><ul>${(s.details||[]).map(t=>`<li>${escape(t)}</li>`).join('')}</ul><a class="btn btn-primary" href="contact.html">Yêu cầu tư vấn</a></div><div class="cms-service-media">${image(s.image,s.title,'zap')}<h3>${escape(s.highlight)}</h3><p>${escape(s.note)}</p></div></article>`).join('')||'<p>Thông tin dịch vụ đang được cập nhật.</p>');
  $('[data-render="news"]').html(visible(data.news).map(n=>`<article class="cms-news-card" id="${escape(n.id)}"><div class="cms-news-image">${image(n.image,n.title,'newspaper')}</div><div class="cms-news-body"><span class="section-tag">${escape(n.category)}</span><h2>${escape(n.title)}</h2><p>${escape(n.summary)}</p><time>${escape(n.date)}</time>${n.body?`<details><summary>Đọc bài viết</summary><div class="cms-article-body">${paragraphs(n.body)}</div></details>`:''}</div></article>`).join('')||'<p>Chưa có bài viết được đăng.</p>');
  $('[data-render="jobs"]').html(visible(data.jobs).map(j=>`<article class="job-card cms-job"><div><span class="section-tag">${escape(j.location)}</span><h3>${escape(j.title)}</h3><p>${escape(j.requirements)}</p><strong>${escape(j.salary)}</strong></div><a class="btn btn-primary" href="mailto:${escape(site.email)}?subject=${encodeURIComponent('Ứng tuyển: '+j.title)}">Ứng tuyển qua email</a></article>`).join('')||'<p>Hiện chưa có vị trí đang tuyển. Bạn có thể gửi hồ sơ qua email để chúng tôi liên hệ khi phù hợp.</p>');
  // Public runtime settings, no credentials. Escape '<' to prevent closing the script tag.
  $('body').append(`<script id="site-config" type="application/json">${JSON.stringify({company:site.company,email:site.email,phone:site.phone,address:site.address,zalo:site.zalo,categories:data.categories}).replaceAll('<','\\u003c')}</script>`);
  $('[data-cms], [data-cms-href], [data-cms-src], [data-cms-placeholder]').removeAttr('data-cms data-cms-href data-cms-src data-cms-placeholder');
  return $.html();
}
