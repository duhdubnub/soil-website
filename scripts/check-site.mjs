import {readFileSync,existsSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import './check-tournaments.mjs';
const html=readFileSync('dist/index.html','utf8');
const data=JSON.parse(readFileSync('src/data/site.json','utf8'));
const files=(dir)=>readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?files(join(dir,f.name)):[join(dir,f.name)]);
assert.equal(files('dist').filter(f=>f.endsWith('.html')).length,2,'Home and invitational pages');
const sections=[...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(sections,['home','about','tournaments','team','join','contact'],'Required section order');
assert.equal((html.match(/<h1\b/g)||[]).length,1,'One h1');
assert.equal(html.split(data.mission).length-1,1,'Verbatim mission in hero');
assert.equal(html.split(data.missionStatement).length-1,1,'Verbatim mission statement in About');
assert(!/UIUC|Fighting Illini|\bSciOly\b/i.test(html),'Naming restrictions');
assert(!/(?<!Science )\bOlympiad\b/.test(html.replace(/<[^>]*>/g,'')),'Science Olympiad written in full');
assert(html.includes('does not speak on behalf of the university.'),'RSO notice');
assert(html.includes('Science Olympiad at Illinois is an official alumni chapter registered with Science Olympiad, Inc. Science Olympiad and the Science Olympiad logo are trademarks of Science Olympiad, Inc.'),'Chapter and trademark notice');
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
const tournament=html.match(/<section id="tournaments"[\s\S]*?<\/section>/)[0];
assert(!tournament.includes('TODO'),'No raw tournament TODOs');
assert(tournament.includes('class="tournament-info"'),'Shared info lines');
const tournaments=JSON.parse(readFileSync('src/data/tournaments.json','utf8')).tournaments;
if(tournaments.length===1){
 const t=tournaments[0];
 if(!t.registration?.url)assert(tournament.includes('aria-disabled="true"')&&tournament.includes('Registration opens soon'),'Registration unavailable');
 if(!t.events?.length)assert(!tournament.includes('Event list to be announced'),'Events moved off home');
 if(!t.schedule?.length)assert(!tournament.includes('Schedule to be announced'),'Schedule moved off home');
 if(!t.contactEmail)assert(tournament.includes('href="#contact"'),'Contact fallback');
}
console.log('Passed: single page, six ordered sections, tournament pending states, navigation, hero, join links, assets and compliance copy.');

const detail=readFileSync('dist/invitational/index.html','utf8');
assert(detail.includes('<title>2027 SOIL Invitational | Science Olympiad at Illinois</title>'));
assert(tournament.includes('href="/soil-website/invitational/"'));
assert(!html.includes('application/ld+json'));
for(const page of [html,detail]){
 assert.equal((page.match(/<h1\b/g)||[]).length,1);
 assert(page.includes('/fonts/Geist-Variable.woff2')&&page.includes('font-display:swap'));
 assert(page.includes('alt="Science Olympiad logo"'));
 const pageIds=[...page.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(pageIds).size,pageIds.length);
 for(const [,id] of page.matchAll(/href="#([^"]+)"/g))assert(pageIds.includes(id),id);
 for(const [,path] of page.matchAll(/(?:href|src|srcset)="(\/[^"#?]*)(?:#[^"]*)?"/g)){
  assert(path.startsWith('/soil-website/'));
  const target=join('dist',path.slice('/soil-website/'.length));assert(existsSync(path.endsWith('/')?join(target,'index.html'):target),path);
 }
}
const event=tournaments.find(t=>t.id==='2027-soil-invitational');
for(const [id,present] of [['updates',!!event.updates?.length],['volunteer',!!event.volunteerUrl],['team',!!event.team?.length]]){
 assert.equal(detail.includes(`id="${id}"`),present);
 assert.equal(detail.includes(`data-event-link="${id}"`),present);
}
if(!event.events?.length)assert(detail.includes('Event list to be announced'));
if(!event.schedule?.length)assert(detail.includes('Schedule to be announced'));
assert(detail.includes('href="/soil-website/#about"'));
assert(/href="\/soil-website\/#tournaments" aria-current="location"/.test(detail));
console.log('Passed: invitational routing, conditional navigation, shared assets, font preload, and pending content.');

assert(!detail.includes('application/ld+json'));
const facts=detail.match(/<h3>Key facts<\/h3>([\s\S]*?)<\/section>/)[1];
assert.deepEqual([...facts.matchAll(/<strong>([^<]+):<\/strong>/g)].map(m=>m[1]),['Date','Divisions','Teams','Fee']);
assert.equal((tournament.match(/class="tournament-info"/g)||[]).length,1);
assert(!tournament.includes('Teams:')&&!tournament.includes('Fee:'));
assert(tournament.indexOf('<h3>')<tournament.indexOf('tournament-date'));
assert(tournament.indexOf('tournament-date')<tournament.indexOf('tournament-description'));
assert.deepEqual(Object.keys(event.registration),['url']);
