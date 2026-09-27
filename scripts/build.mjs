import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pageNames, readContent, validateContent, renderPage } from './content.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = readContent(root);
validateContent(data, root);
// Generate everything before touching the previous build.
const pages = pageNames.map(name => [name, renderPage(fs.readFileSync(path.join(root,`${name}.html`),'utf8'),name,data)]);
const dist = path.join(root,'dist');
fs.rmSync(dist,{recursive:true,force:true});
fs.mkdirSync(dist,{recursive:true});
for (const folder of ['css','js','images','assets']) fs.cpSync(path.join(root,folder),path.join(dist,folder),{recursive:true});
fs.mkdirSync(path.join(dist,'data'));
fs.writeFileSync(path.join(dist,'data/products.json'),JSON.stringify({products:data.products.filter(p=>p.visible!==false)},null,2));
for (const [name,html] of pages) fs.writeFileSync(path.join(dist,`${name}.html`),html);
for (const file of ['CNAME','robots.txt']) if(fs.existsSync(path.join(root,file)))fs.copyFileSync(path.join(root,file),path.join(dist,file));
fs.writeFileSync(path.join(dist,'.nojekyll'),'');
console.log(`Đã tạo ${pages.length} trang trong dist/. Dữ liệu CMS và danh mục hợp lệ.`);
