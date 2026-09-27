import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from 'cheerio';
import YAML from 'yaml';
import { readContent, validateContent, renderPage, pageNames, safeURL } from '../scripts/content.mjs';
const root = new URL('../',import.meta.url).pathname;
const content=readContent(root);
const source=page=>fs.readFileSync(new URL(`../${page}.html`,import.meta.url),'utf8');
function fixture() {
  const data=structuredClone(content);
  data.categories=[{id:'test-category',title:'Danh mục thử',order:1}];
  data.products=[{title:'Sản phẩm thử',category:'test-category',specs:[]}];
  data.services=[{id:'test-service',title:'Dịch vụ thử',description:'Mô tả',details:[],visible:true}];
  data.news=[{id:'bai-viet-1',title:'Bài thử 1',visible:true},{id:'bai-viet-2',title:'Bài thử 2',visible:true}];
  data.jobs=[{title:'Vị trí thử',visible:true}];
  return data;
}


test('current CMS data builds every page with one footer and shared contact settings',()=>{
  validateContent(content,root);
  for(const page of pageNames){
    const $=load(renderPage(source(page),page,content));
    assert.equal($('footer').length,1,page);
    assert.equal($('h1').length,1,page);
    assert.equal($('[data-cms]').length,0);
    assert.equal($('title').text(),content.pages[page].seo.title);
    assert.equal(JSON.parse($('#site-config').text()).email,content.site.email);
    const ids=$('[id]').map((_,e)=>$(e).attr('id')).get();
    assert.equal(new Set(ids).size,ids.length,`Duplicate IDs in ${page}`);
  }
});
test('every editable template binding exists in its CMS schema and data',()=>{
  const config=YAML.parse(fs.readFileSync(new URL('../.pages.yml',import.meta.url),'utf8'));
  const pages=config.content.find(c=>c.name==='pages').items;
  for(const page of pageNames){
    const entry=pages.find(e=>e.name===`page_${page}`),$=load(source(page));
    for(const attr of ['data-cms','data-cms-href','data-cms-src','data-cms-placeholder']){
      $(`[${attr}]`).each((_,el)=>{
        const parts=$(el).attr(attr).split('.');let fields=entry.fields,value=content.pages[page];
        for(const part of parts){const field=fields.find(f=>f.name===part);assert(field,`${page}: ${part}`);fields=field.fields;value=value?.[part];}
      });
    }
  }
  assert.equal(config.content.find(c=>c.name==='catalog').fields[0].fields.find(f=>f.name==='category').options.collection,'categories');
});
test('category rename/add reaches menus and filters; referenced delete is blocked',()=>{
  const data=fixture();
  data.categories[0].title='Danh mục đã đổi';data.categories.push({id:'new-category',title:'Danh mục mới',order:5});
  const $=load(renderPage(source('products'),'products',data));
  assert.equal($('[data-cat="new-category"]').text(),'Danh mục mới');
  assert.equal($('.dropdown-menu a').first().text(),'Danh mục đã đổi');
  data.categories.shift();assert.throws(()=>validateContent(data),/chuyển sản phẩm/);
});
test('CMS page edits, shared phone and image appear without injecting HTML',()=>{
  const data=fixture();
  data.pages.index.hero.title='<script>alert(1)</script>';
  data.site.phone='0901234567';data.site.phone_label='0901 234 567';data.pages.index.banner_image='images/logo.png';
  const $=load(renderPage(source('index'),'index',data));
  assert.equal($('.hero-title').text(),'<script>alert(1)</script>');assert.equal($('.hero-title script').length,0);
  assert.equal($('.cms-banner-image').attr('src'),'images/logo.png');
  $('a[data-contact="phone"]').each((_,e)=>assert.equal($(e).attr('href'),'tel:0901234567'));
});
test('services, news and jobs support additions, hidden entries and empty collections',()=>{
  const data=fixture();
  data.news[0].visible=false;data.news.push({id:'news-test',title:'Bài mới',body:'Dòng 1\nDòng 2',visible:true});
  let $=load(renderPage(source('news'),'news',data));assert.equal($('#news-test h2').text(),'Bài mới');assert.equal($('#news-test .cms-article-body p').length,2);assert.equal($('#bai-viet-1').length,0);
  data.services[0].visible=false;$=load(renderPage(source('index'),'index',data));assert.equal($('.services-grid .service-card').length,0);
  data.jobs=[];$=load(renderPage(source('careers'),'careers',data));assert.match($('.job-list').text(),/chưa có vị trí/);
});
test('invalid references, unsafe links, duplicate IDs and missing files stop publication',()=>{
  for(const url of ['javascript:alert(1)','data:text/html,hi','//evil.example','/repo/image.jpg'])assert.throws(()=>safeURL(url));
  assert.throws(()=>safeURL('images/../secret',true));
  const data=fixture();data.news[1].id=data.news[0].id;assert.throws(()=>validateContent(data),/trùng/);
  const media=structuredClone(content);media.site.logo='images/missing-test-image.png';assert.throws(()=>validateContent(media,root),/Chưa tìm thấy/);
});
test('PDF file and form settings use the shared configuration',()=>{
  const data=fixture();data.site.profile_pdf='assets/documents/profile.pdf';
  const $=load(renderPage(source('profile'),'profile',data));assert.equal($('[data-profile-download]').attr('href'),'assets/documents/profile.pdf');
  const home=load(renderPage(source('index'),'index',data));assert.equal(home('#contact-form').length,1);assert.equal(home('#contact-form [required]').length,2);
  assert.equal(home('[data-service-options] option').length,data.services.length+2);
});
