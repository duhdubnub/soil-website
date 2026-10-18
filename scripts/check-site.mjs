import {readFileSync,existsSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import './check-tournaments.mjs';
const data=JSON.parse(readFileSync('src/data/site.json','utf8'));
const files=(dir)=>readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?files(join(dir,f.name)):[join(dir,f.name)]);
// One page per main navigation entry, plus the invitational details page.
const order=['home','about','community','tournaments','join','contact'];
const url=(id)=>id==='home'?'/soil-website/':`/soil-website/${id}/`;
const pages=Object.fromEntries(order.map(id=>[id,readFileSync(id==='home'?'dist/index.html':`dist/${id}/index.html`,'utf8')]));
assert.equal(files('dist').filter(f=>f.endsWith('.html')).length,order.length+1,'Main pages and invitational page');
for(const [id,html] of Object.entries(pages)){
 const sections=[...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(sections,id==='home'?['home','highlights']:[id],`Sections on ${id}`);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`One h1 on ${id}`);
 assert(html.includes(`<link rel="canonical" href="https://duhdubnub.github.io${url(id)}">`),`Canonical ${id}`);
 const nav=html.match(/<nav id="navigation"[\s\S]*?<\/nav>/)[0];
 assert.deepEqual([...nav.matchAll(/href="([^"]+)"/g)].map(m=>m[1]),order.map(url),'Navigation page order');
 assert.deepEqual([...nav.matchAll(/<a href="([^"]+)" aria-current="page"/g)].map(m=>m[1]),[url(id)],`Current page ${id}`);
 assert(!/UIUC|Fighting Illini|\bSciOly\b/i.test(html),'Naming restrictions');
 assert(!/(?<!Science )\bOlympiad\b/.test(html.replace(/<[^>]*>/g,'')),'Science Olympiad written in full');
 assert(html.includes('does not speak on behalf of the university.'),'RSO notice');
 assert(html.includes('Science Olympiad at Illinois is an official alumni chapter registered with Science Olympiad, Inc. Science Olympiad and the Science Olympiad logo are trademarks of Science Olympiad, Inc.'),'Chapter and trademark notice');
 assert(html.includes('Skip to content')&&html.includes('aria-controls="navigation"'),'Navigation accessibility');
 assert(html.includes('property="og:image"')&&html.includes('name="description"'),'Metadata');
 for(const img of html.matchAll(/<img\b[^>]*>/g))assert(/\balt=/.test(img[0]),'Image alt attribute');
 assert(!/class="[^"]*(?:eyebrow|kicker|card-number|emblem-caption)/.test(html),'No floating labels');
 assert(!/<form\b/.test(html),'No forms');
 assert(!html.includes('application/ld+json'));
 for(const link of data.joinLinks){
  const anchors=[...html.matchAll(/<a\b[^>]*>/g)].map(m=>m[0]).filter(a=>a.includes(`href="${link.url}"`));
  assert.equal(anchors.length,id==='join'?2:1,'Join and footer links');
  for(const a of anchors)assert(a.includes('target="_blank"')&&a.includes('rel="noopener noreferrer"')&&a.includes('aria-label="'),'Accessible safe external links');
 }
}
const all=Object.values(pages).join('');
assert.equal(all.split(data.mission).length-1,1,'Verbatim mission in hero');
assert.equal(pages.about.split(data.missionStatement).length-1,1,'Verbatim mission statement in About');
const aboutGrid=pages.about.match(/<div class="about-grid[\s\S]*?<\/div><\/div><\/div>/)[0];
assert(aboutGrid.indexOf(data.missionStatement)<aboutGrid.indexOf('What is Science Olympiad?')&&aboutGrid.includes(data.about.science),'Mission statement beside What is Science Olympiad?');
for(const link of data.links)assert(pages.about.includes(`href="${link.url}"`),`About resource link ${link.label}`);
assert(!/about-columns|activity-grid/.test(pages.about),'About shows only mission, Science Olympiad summary, resource links, and team');
assert(pages.about.indexOf('class="resource-row')<pages.about.indexOf('id="team"')&&pages.about.includes('class="team-grid'),'Team follows About resource links');
assert(!all.includes('/soil-website/team/')&&!existsSync('dist/team'),'No standalone Team page');
const hero=pages.home.match(/<section id="home"[\s\S]*?<\/section>/)[0];
assert(hero.indexOf('hero-logo')<hero.indexOf('<h1')&&hero.indexOf('<h1')<hero.indexOf('hero-mission')&&hero.indexOf('hero-mission')<hero.indexOf('hero-actions'),'Hero order');
assert.equal((hero.match(/<p\b/g)||[]).length,1,'Only mission paragraph in hero');
assert(hero.indexOf('href="/soil-website/join/"')<hero.indexOf('href="/soil-website/about/"'),'Hero buttons link to Join and About pages');
const joinSection=pages.join.match(/<section id="join"[\s\S]*?<\/section>/)[0];
let previous=-1;
for(const link of data.joinLinks){const index=joinSection.indexOf(`href="${link.url}"`);assert(index>previous,'Join link order');previous=index}
const tournament=pages.tournaments.match(/<section id="tournaments"[\s\S]*?<\/section>/)[0];
assert(!tournament.includes('TODO'),'No raw tournament TODOs');
assert(tournament.includes('class="tournament-info"'),'Shared info lines');
const tournaments=JSON.parse(readFileSync('src/data/tournaments.json','utf8')).tournaments;
if(tournaments.length===1){
 const t=tournaments[0];
 if(!t.registration?.url)assert(tournament.includes('aria-disabled="true"')&&tournament.includes('Registration opens soon'),'Registration unavailable');
 if(!t.events?.length)assert(!tournament.includes('Event list to be announced'),'Events kept on details page');
 if(!t.schedule?.length)assert(!tournament.includes('Schedule to be announced'),'Schedule kept on details page');
 if(!t.contactEmail)assert(tournament.includes('href="/soil-website/contact/"'),'Contact fallback');
}
// Home highlight cards: Community Impact first, then the featured tournament.
const highlights=pages.home.match(/<section id="highlights"[\s\S]*?<\/section>/)[0];
const featured=tournaments.find(t=>t.featured)??tournaments[0];
const cards=[...highlights.matchAll(/<article class="highlight-card[\s\S]*?<\/article>/g)].map(m=>m[0]);
assert.equal(cards.length,2,'Two highlight cards');
assert(cards[0].includes('Community Impact')&&cards[0].includes('href="/soil-website/community/"'),'Community Impact card links to Community page');
assert(cards[0].includes(data.communityImpact.replaceAll("'",'&#39;'))&&!cards[0].includes('TODO'),'Community Impact card text');
assert(cards[1].includes(featured.name)&&cards[1].includes('href="/soil-website/tournaments/"')&&cards[1].includes('Info + Register'),'Tournament card links to Tournaments page');
console.log('Passed: six pages, page navigation, home highlights, tournament pending states, hero, join links and compliance copy.');

const detail=readFileSync('dist/invitational/index.html','utf8');
assert(detail.includes('<title>2027 SOIL Satellite Invitational | Science Olympiad at Illinois</title>'));
assert(tournament.includes('href="/soil-website/invitational/"'));
assert(!detail.includes('application/ld+json'));
for(const page of [...Object.values(pages),detail]){
 assert.equal((page.match(/<h1\b/g)||[]).length,1);
 assert(page.includes('/fonts/Geist-Variable.woff2')&&page.includes('font-display:swap'));
 assert(page.includes('alt="Science Olympiad logo"'));
 const pageIds=[...page.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(pageIds).size,pageIds.length,'Unique IDs');
 for(const [,id] of page.matchAll(/href="#([^"]+)"/g))assert(pageIds.includes(id),`Anchor target ${id}`);
 for(const [,path] of page.matchAll(/(?:href|src|srcset)="(\/[^"#?]*)(?:#[^"]*)?"/g)){
  assert(path.startsWith('/soil-website/'),`Base path ${path}`);
  const target=join('dist',path.slice('/soil-website/'.length));assert(existsSync(path.endsWith('/')?join(target,'index.html'):target),`Asset ${path}`);
 }
}
const event=tournaments.find(t=>t.id==='2027-soil-invitational');
for(const [id,present] of [['updates',!!event.updates?.length],['volunteer',!!event.volunteerUrl],['team',!!event.team?.length]]){
 assert.equal(detail.includes(`id="${id}"`),present);
 assert.equal(detail.includes(`data-event-link="${id}"`),present);
}
if(!event.events?.length)assert(detail.includes('Event list to be announced'));
if(!event.schedule?.length)assert(detail.includes('Schedule to be announced'));
assert(detail.includes('href="/soil-website/tournaments/">← Back to Tournaments'));
assert(/href="\/soil-website\/tournaments\/" aria-current="page"/.test(detail));
console.log('Passed: invitational routing, conditional navigation, shared assets, font preload, and pending content.');

const facts=detail.match(/<h3>Key facts<\/h3>([\s\S]*?)<\/section>/)[1];
assert.deepEqual([...facts.matchAll(/<strong>([^<]+):<\/strong>/g)].map(m=>m[1]),['Date','Divisions','Teams','Fee']);
assert.equal((tournament.match(/class="tournament-info"/g)||[]).length,1);
assert(!tournament.includes('Teams:')&&!tournament.includes('Fee:'));
assert(tournament.indexOf('<h3>')<tournament.indexOf('tournament-date'));
assert(tournament.indexOf('tournament-date')<tournament.indexOf('tournament-description'));
assert.deepEqual(Object.keys(event.registration),['url']);
