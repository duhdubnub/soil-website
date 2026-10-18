import {readFileSync,existsSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {join} from 'node:path';
const html=readFileSync('dist/index.html','utf8');
const data=JSON.parse(readFileSync('src/data/site.json','utf8'));
const files=(dir)=>readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?files(join(dir,f.name)):[join(dir,f.name)]);
assert.equal(files('dist').filter(f=>f.endsWith('.html')).length,1,'Exactly one HTML page');
const sections=[...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(sections,['home','about','team','join','contact'],'Required section order');
assert.equal((html.match(/<h1\b/g)||[]).length,1,'One h1');
assert.equal(html.split(data.mission).length-1,2,'Verbatim mission in hero and About');
assert(!/UIUC|Fighting Illini|\bSciOly\b/i.test(html),'Naming restrictions');
assert(!/(?<!Science )\bOlympiad\b/.test(html.replace(/<[^>]*>/g,'')),'Science Olympiad written in full');
assert(html.includes('does not speak on behalf of the university.'),'RSO notice');
assert(html.includes('This is not an official Science Olympiad, Inc. website.'),'Trademark notice');
assert(html.includes('Skip to content')&&html.includes('aria-controls="navigation"'),'Navigation accessibility');
assert(html.includes('property="og:image"')&&html.includes('name="description"'),'Metadata');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'Unique IDs');
for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(id),`Anchor target ${id}`);
for(const section of sections)assert(html.includes(`data-section="${section}"`),`Scroll spy link ${section}`);
for(const [,path] of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:#[^"]*)?"/g)){
 assert(path.startsWith('/soil-website/'),`Base path ${path}`);
 const target=join('dist',path.slice('/soil-website/'.length));assert(existsSync(path.endsWith('/')?join(target,'index.html'):target),`Asset ${path}`);
}
for(const img of html.matchAll(/<img\b[^>]*>/g))assert(/\balt=/.test(img[0]),'Image alt attribute');
assert(!/class="[^"]*(?:eyebrow|kicker|card-number|emblem-caption)/.test(html),'No floating labels');
assert(!/<form\b/.test(html),'No forms');
const hero=html.match(/<section id="home"[\s\S]*?<\/section>/)[0];
assert(hero.indexOf('hero-logo')<hero.indexOf('<h1')&&hero.indexOf('<h1')<hero.indexOf('hero-mission')&&hero.indexOf('hero-mission')<hero.indexOf('hero-actions'),'Hero order');
assert.equal((hero.match(/<p\b/g)||[]).length,1,'Only mission paragraph in hero');
const joinSection=html.match(/<section id="join"[\s\S]*?<\/section>/)[0];
let previous=-1;
for(const link of data.joinLinks){
 const index=joinSection.indexOf(`href="${link.url}"`);assert(index>previous,'Join link order');previous=index;
 const anchors=[...html.matchAll(/<a\b[^>]*>/g)].map(m=>m[0]).filter(a=>a.includes(`href="${link.url}"`));
 assert.equal(anchors.length,2,'Join and footer links');
 for(const a of anchors)assert(a.includes('target="_blank"')&&a.includes('rel="noopener noreferrer"')&&a.includes('aria-label="'),'Accessible safe external links');
}
console.log('Passed: one page, five ordered sections, hero order, three join links, safe new-tab attributes, no floating labels/forms, anchors/assets, mission twice and required notices.');
