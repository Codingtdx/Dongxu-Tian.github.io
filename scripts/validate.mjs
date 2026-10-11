import {readFileSync,existsSync,statSync,realpathSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const projectRoot=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const languages=['en','zh'];
const labelKeys=['fullResolution','skip','navAbout','navResearch','navPapers','navEducation','navContact','explore','filterAll','filterFirst','current','backTop','firstAuthor','ongoing','viewFigure','close','figureNote','menuOpen','menuClose','allLabel','selectedResearch','paper','scrollHint'];
const doiPattern=/^10\.\d{4,9}\/[^\s<>"?#]+$/;
export function validateContent(data,root=projectRoot){
 const errors=[],issue=(field,message)=>errors.push(`${field}：${message}`);
 const object=(value,field)=>{if(!value||typeof value!=='object'||Array.isArray(value)){issue(field,'应为对象 {}');return {};}return value;};
 const array=(value,field)=>{if(!Array.isArray(value)){issue(field,'应为数组 []');return [];}return value;};
 const text=(value,field)=>{if(typeof value!=='string'||!value.trim())issue(field,'请填写非空文本');};
 const bilingual=(value,field)=>{const pair=object(value,field);for(const lang of languages)text(pair[lang],`${field}.${lang}`);};
 const optionalText=(value,field)=>{if(value!==undefined)text(value,field);};
 const optionalLocalized=(value,field)=>{if(value!==undefined){if(typeof value==='string')text(value,field);else bilingual(value,field);}};
 const boolean=(value,field)=>{if(value!==undefined&&typeof value!=='boolean')issue(field,'应为 true 或 false');};
 const unique=(items,field)=>{const seen=new Set();items.forEach((item,index)=>{const id=item?.id;if(typeof id!=='string'||! /^[a-z][a-z0-9-]*$/.test(id)){issue(`${field}[${index}].id`,'请填写以小写字母开头的字母/数字/连字符 ID');return;}if(seen.has(id))issue(`${field}[${index}].id`,`ID 重复：${id}`);seen.add(id);});};
 const d=object(data,'内容');if(d.version!==1)issue('version','当前支持格式版本 1');
 const profile=object(d.profile,'profile');for(const key of ['name','pageTitle','description','role','institution','status','bio'])bilingual(profile[key],`profile.${key}`);
 if(profile.socialDescription!==undefined)bilingual(profile.socialDescription,'profile.socialDescription');
 const hero=object(profile.heroLines,'profile.heroLines');for(const lang of languages){const lines=array(hero[lang],`profile.heroLines.${lang}`);if(!lines.length)issue(`profile.heroLines.${lang}`,'至少填写一行主张');lines.forEach((line,i)=>text(line,`profile.heroLines.${lang}[${i}]`));}
 if(profile.topics!==undefined)array(profile.topics,'profile.topics').forEach((v,i)=>text(v,`profile.topics[${i}]`));
 const labels=object(d.labels,'labels');for(const lang of languages){const values=object(labels[lang],`labels.${lang}`);for(const key of labelKeys)text(values[key],`labels.${lang}.${key}`);}
 const research=array(d.research,'research'),publications=array(d.publications,'publications'),education=array(d.education,'education');unique(research,'research');unique(publications,'publications');unique(education,'education');
 const anchors=new Set(['main','top','research','publications','about','education','contact',...research.map(r=>`project-${r?.id}`)]);
 function resource(value,field,image=false){
  if(typeof value!=='string'||!value.trim()){issue(field,'请填写 URL 或 ./ 开头的本地路径');return;}
  if(value.startsWith('#')&&!image){if(!anchors.has(value.slice(1)))issue(field,`页内目标不存在：${value}`);return;}
  if(value.startsWith('./')){
   try{
    const pathname=decodeURIComponent(value.split(/[?#]/)[0]),dist=path.resolve(root,'dist'),target=path.resolve(dist,pathname);
    if(!target.startsWith(dist+path.sep))issue(field,'本地路径必须位于 dist 内');
    else if(!existsSync(target))issue(field,`本地文件不存在：${value}（相对于 dist）`);
    else if(!statSync(target).isFile())issue(field,`本地目标必须是普通文件，不能是目录：${value}`);
    else if(!realpathSync(target).startsWith(realpathSync(dist)+path.sep))issue(field,'本地资源不能通过符号链接指向 dist 之外');
    else if(image&&!['.png','.jpg','.jpeg','.webp','.gif','.svg','.avif'].includes(path.extname(target).toLowerCase()))issue(field,`图片需使用 PNG、JPEG、WebP、GIF、SVG 或 AVIF 文件：${value}`);
   }catch{issue(field,'本地路径格式不正确');}return;
  }
  try{const url=new URL(value);if(!['https:','http:'].includes(url.protocol)||!url.hostname)throw new Error();}catch{issue(field,'外部链接必须是有效的完整 http:// 或 https:// URL；本地文件用 ./ 开头');}
 }
 research.forEach((raw,index)=>{
  const field=`research[${index}]`,item=object(raw,field);for(const lang of languages){const c=object(item[lang],`${field}.${lang}`);text(c.title,`${field}.${lang}.title`);text(c.summary,`${field}.${lang}.summary`);if(item.figure!==undefined)text(c.alt,`${field}.${lang}.alt`);else optionalText(c.alt,`${field}.${lang}.alt`);}
  if(item.layout!==undefined&&!['wide','detail','routes','landscape'].includes(item.layout))issue(`${field}.layout`,'可选值为 wide、detail、routes、landscape');boolean(item.ongoing,`${field}.ongoing`);
  if(item.paper!==undefined&&(typeof item.paper!=='string'||!doiPattern.test(item.paper)))issue(`${field}.paper`,'请填写 DOI，例如 10.1234/example；不含 https://doi.org/');if(item.url!==undefined)resource(item.url,`${field}.url`);
  if(item.figure!==undefined){const f=object(item.figure,`${field}.figure`);resource(f.preview,`${field}.figure.preview`,true);if(f.original!==undefined)resource(f.original,`${field}.figure.original`,true);for(const k of ['width','height'])if(!Number.isInteger(f[k])||f[k]<=0)issue(`${field}.figure.${k}`,'请填写预览图像素尺寸的正整数；figure 整体可省略');}
 });
 const seenDOIs=new Set();publications.forEach((raw,index)=>{
  const field=`publications[${index}]`,p=object(raw,field);if(!Number.isInteger(p.year)||p.year<1000||p.year>9999)issue(`${field}.year`,'请填写四位年份整数，例如 2026');if(typeof p.title==='string')text(p.title,`${field}.title`);else bilingual(p.title,`${field}.title`);
  if(p.authors!==undefined)array(p.authors,`${field}.authors`).forEach((a,i)=>text(a,`${field}.authors[${i}]`));optionalLocalized(p.journal,`${field}.journal`);optionalLocalized(p.details,`${field}.details`);boolean(p.first,`${field}.first`);
  if(p.doi!==undefined){if(typeof p.doi!=='string'||!doiPattern.test(p.doi))issue(`${field}.doi`,'请填写 DOI，例如 10.1234/example；不含 https://doi.org/');else if(seenDOIs.has(p.doi.toLowerCase()))issue(`${field}.doi`,`DOI 重复：${p.doi}`);if(typeof p.doi==='string')seenDOIs.add(p.doi.toLowerCase());}if(p.url!==undefined)resource(p.url,`${field}.url`);
 });
 education.forEach((raw,index)=>{const field=`education[${index}]`,item=object(raw,field);for(const key of ['date','degree','school'])bilingual(item[key],`${field}.${key}`);boolean(item.current,`${field}.current`);});
 const contact=object(d.contact,'contact');if(contact.email!==undefined&&(typeof contact.email!=='string'||! /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(contact.email)))issue('contact.email','请填写有效邮箱地址，或省略 email');
 function link(raw,field){const value=object(raw,field);bilingual(value.label,`${field}.label`);resource(value.url,`${field}.url`);}if(contact.scholar!==undefined)link(contact.scholar,'contact.scholar');
 if(contact.links!==undefined){const links=array(contact.links,'contact.links');unique(links,'contact.links');links.forEach((v,i)=>link(v,`contact.links[${i}]`));}
 const templatePath=path.join(root,'src/index.template.html');if(existsSync(templatePath)){const template=readFileSync(templatePath,'utf8');for(const match of template.matchAll(/(?:src|href)="(\.\/[^"{}]+)"/g)){if(!['./content.js','./renderer.js'].includes(match[1]))resource(match[1],'布局中的资源');}}
 if(errors.length)throw new Error(`内容校验未通过（${errors.length} 项）：\n- ${errors.join('\n- ')}`);return data;
}
export function loadContent(contentPath=path.join(projectRoot,'content/site.json'),root=projectRoot){
 let data;try{data=JSON.parse(readFileSync(contentPath,'utf8'));}catch(error){throw new Error(`无法读取内容配置 ${path.relative(root,contentPath)}：请检查文件是否存在、JSON 逗号/引号/括号是否正确。\n${error.message}`);}return validateContent(data,root);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const args=process.argv.slice(2);if(args.length&&!(args.length===2&&args[0]==='--content'))throw new Error('用法：node scripts/validate.mjs [--content 文件路径]');const data=loadContent(args.length?path.resolve(args[1]):undefined);console.log(`内容校验通过：${data.research.length} 项研究、${data.publications.length} 篇论文、${data.education.length} 项教育。外部 URL 仅校验格式，不检测远站是否存活。`);}catch(error){console.error(error.message);process.exitCode=1;}
}
