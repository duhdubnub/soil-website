import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { join } from 'node:path';
const pages=['','about','what-we-do','events','get-involved','team','alumni','contact','legal'];
const data=JSON.parse(readFileSync('src/data/site.json','utf8'));
for(const page of pages){
 const html=readFileSync(join('dist',page,'index.html'),'utf8');
 assert(!/UIUC|Fighting Illini|\bSciOly\b/i.test(html),`${page}: prohibited name`);
 assert(!/(?<!Science )\bOlympiad\b/.test(html.replace(/<[^>]*>/g,'')),`${page}: abbreviated Science Olympiad`);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`${page}: one H1`);
 assert(html.includes('does not speak on behalf of the university.'),`${page}: RSO notice`);
 assert(html.includes('This is not an official Science Olympiad, Inc. website.'),`${page}: trademark notice`);
 assert(html.includes('name="description"')&&html.includes('property="og:image"'),`${page}: metadata`);
 assert(html.includes('Skip to content'),`${page}: skip link`);
 for(const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:#[^"]*)?"/g)){
  const path=match[1];assert(path.startsWith('/soil-website/'),`${page}: base path ${path}`);
  const relative=path.slice('/soil-website/'.length);const target=join('dist',relative);
  assert(existsSync(path.endsWith('/')?join(target,'index.html'):target),`${page}: missing link ${path}`);
 }
 for(const img of html.matchAll(/<img\b[^>]*>/g))assert(/\balt=/.test(img[0]),`${page}: image alt`);
 if(page===''||page==='about')assert(html.includes(data.mission),`${page}: exact mission`);
}
console.log('Passed: 9 pages, local asset/page links, base paths, naming, mission, notices, metadata, H1s and image alt attributes.');
