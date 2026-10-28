import {readFileSync,existsSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {join} from 'node:path';
import './check-tournaments.mjs';
const data=JSON.parse(readFileSync('src/data/site.json','utf8'));
const files=(dir)=>readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?files(join(dir,f.name)):[join(dir,f.name)]);
// One page per main navigation entry, plus the invitational details page.
const order=['home','about','community','tournaments','join','contact'];
const url=(id)=>id==='home'?'/':`/${id}/`;
const pages=Object.fromEntries(order.map(id=>[id,readFileSync(id==='home'?'dist/index.html':`dist/${id}/index.html`,'utf8')]));
// Google Search Console ownership file: must stay published unchanged at the site root, or Google revokes verification.
const googleVerification='google26416d21fdc69b58.html';
assert.equal(readFileSync(join('dist',googleVerification),'utf8').trim(),`google-site-verification: ${googleVerification}`,'Google Search Console verification file');
assert.equal(files('dist').filter(f=>f.endsWith('.html')&&!f.endsWith(googleVerification)).length,order.length+2,'Main pages, invitational page and 404 page');
for(const [id,html] of Object.entries(pages)){
 const sections=[...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(sections,id==='home'?['home','highlights']:[id],`Sections on ${id}`);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`One h1 on ${id}`);
 assert(html.includes(`<link rel="canonical" href="https://sciolyatillinois.org${url(id)}">`),`Canonical ${id}`);
 const nav=html.match(/<nav id="navigation"[\s\S]*?<\/nav>/)[0];
 assert.deepEqual([...nav.matchAll(/href="([^"]+)"/g)].map(m=>m[1]),order.map(url),'Navigation page order');
 assert.deepEqual([...nav.matchAll(/<a href="([^"]+)" aria-current="page"/g)].map(m=>m[1]),[url(id)],`Current page ${id}`);
 assert(!/UIUC|Fighting Illini|\bSciOly\b/i.test(html),'Naming restrictions');
 assert(!/(?<!Science )\bOlympiad\b/.test(html.replace(/<[^>]*>/g,'')),'Science Olympiad written in full');
 assert(html.includes('does not speak on behalf of the university.'),'RSO notice');
 assert(html.includes('Science Olympiad at Illinois is an official alumni chapter registered with Science Olympiad, Inc. Science Olympiad and the Science Olympiad logo are trademarks of Science Olympiad, Inc.'),'Chapter and trademark notice');
 const address=html.match(/<address class="footer-address">[\s\S]*?<\/address>/)?.[0]??'';
 for(const line of data.address)assert(address.includes(line),`Footer address line ${line}`);
 if(data.email)assert(address.includes(`href="mailto:${data.email}"`),'Footer email');
 assert(!/\[TODO/i.test(html),`No TODO placeholders on ${id}`);
 assert(!/\/soil-website|duhdubnub\.github\.io/.test(html),`No old GitHub Pages paths on ${id}`);
 assert(html.includes('Skip to content')&&html.includes('aria-controls="navigation"'),'Navigation accessibility');
 assert(html.includes('property="og:image"')&&html.includes('name="description"'),'Metadata');
 for(const img of html.matchAll(/<img\b[^>]*>/g))assert(/\balt=/.test(img[0]),'Image alt attribute');
 assert(!/class="[^"]*(?:eyebrow|kicker|card-number|emblem-caption)/.test(html),'No floating labels');
 assert(!/<form\b/.test(html),'No forms');
 // Search metadata: each page has its own description and the shared site name; only Home carries structured data.
 assert.equal([...html.matchAll(/<meta name="description" content="([^"]*)"/g)].map(m=>m[1].replaceAll('&#39;',"'"))[0],data.seo[id],`SEO description ${id}`);
 assert(html.includes(`<meta property="og:site_name" content="${data.name}">`)&&html.includes('<link rel="sitemap" href="/sitemap-index.xml">'),`Site name and sitemap link ${id}`);
 assert.equal(html.includes('application/ld+json'),id==='home',`Structured data only on Home (${id})`);
 for(const link of data.joinLinks){
  const anchors=[...html.matchAll(/<a\b[^>]*>/g)].map(m=>m[0]).filter(a=>a.includes(`href="${link.url}"`));
  assert.equal(anchors.length,id==='join'?2:1,'Join and footer links');
  for(const a of anchors)assert(a.includes('target="_blank"')&&a.includes('rel="noopener noreferrer"')&&a.includes('aria-label="'),'Accessible safe external links');
 }
}
const all=Object.values(pages).join('');
assert.equal(new Set(Object.values(data.seo)).size,Object.keys(data.seo).length,'Unique page descriptions');
for(const text of Object.values(data.seo))assert(text.length<=155,`Description fits search snippet: ${text}`);
assert(pages.home.includes(`<title>${data.name}</title>`),'Home title is the plain club name');
const ld=JSON.parse(pages.home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const website=ld['@graph'].find(n=>n['@type']==='WebSite'), org=ld['@graph'].find(n=>n['@type']==='Organization');
assert(website.name===data.name&&website.url===data.url&&org.name===data.name&&org.url===data.url&&org.email===data.email,'WebSite and Organization structured data');
assert.deepEqual(org.sameAs,data.joinLinks.map(link=>link.url),'Organization profile links');
// Crawling: robots.txt points at the generated sitemap, which lists every page on the domain.
assert(readFileSync('dist/robots.txt','utf8').includes(`Sitemap: ${data.url}sitemap-index.xml`),'robots.txt sitemap');
const sitemapUrls=[...readFileSync('dist/sitemap-0.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).sort();
assert.deepEqual(sitemapUrls,[...order.map(id=>`https://sciolyatillinois.org${url(id)}`),'https://sciolyatillinois.org/invitational/'].sort(),'Sitemap lists every page');
assert.equal(all.split(data.mission).length-1,1,'Verbatim mission in hero');
assert.equal(pages.about.split(data.missionStatement).length-1,1,'Verbatim mission statement in About');
const aboutGrid=pages.about.match(/<div class="about-grid[\s\S]*?<\/div><\/div><\/div>/)[0];
assert(aboutGrid.indexOf(data.missionStatement)<aboutGrid.indexOf('What is Science Olympiad?')&&aboutGrid.includes(data.about.science),'Mission statement beside What is Science Olympiad?');
for(const link of data.links)assert(pages.about.includes(`href="${link.url}"`),`About resource link ${link.label}`);
assert(!/about-columns|activity-grid/.test(pages.about),'About shows only mission, Science Olympiad summary, resource links, and team');
assert(pages.about.indexOf('class="resource-row')<pages.about.indexOf('id="team"')&&pages.about.includes('class="team-grid'),'Team follows About resource links');
assert(!all.includes('href="/team/"')&&!existsSync('dist/team'),'No standalone Team page');
const officerGrid=pages.about.match(/<div class="team-grid officer-grid">[\s\S]*?<\/article><\/div>/)[0];
const officerCards=[...officerGrid.matchAll(/<article class="officer-card">[\s\S]*?<\/article>/g)].map(m=>m[0]);
assert.equal(officerCards.length,data.officers.length,'One card per officer');
const esc=(s)=>s.replaceAll('&','&amp;');
data.officers.forEach((officer,i)=>{
 assert(officerCards[i].includes(`<h3>${esc(officer.name)}</h3>`)&&officerCards[i].includes(esc(officer.role)),`Officer ${officer.name} in order`);
 if(officer.favoriteEvent)assert(officerCards[i].includes(esc(officer.favoriteEvent)),`${officer.name} favorite event`);
 if(officer.favoriteMemory)assert(officerCards[i].includes(esc(officer.favoriteMemory)),`${officer.name} favorite memory`);
 if(officer.email)assert(officerCards[i].includes(`href="mailto:${officer.email}"`),`${officer.name} email link`);
});
const hero=pages.home.match(/<section id="home"[\s\S]*?<\/section>/)[0];
assert(hero.indexOf('hero-logo')<hero.indexOf('<h1')&&hero.indexOf('<h1')<hero.indexOf('hero-mission')&&hero.indexOf('hero-mission')<hero.indexOf('hero-actions'),'Hero order');
assert.equal((hero.match(/<p\b/g)||[]).length,1,'Only mission paragraph in hero');
assert(hero.indexOf('href="/join/"')<hero.indexOf('href="/about/"'),'Hero buttons link to Join and About pages');
const joinSection=pages.join.match(/<section id="join"[\s\S]*?<\/section>/)[0];
assert(joinSection.includes(`<p>${data.joinIntro}</p>`),'Join page description');
// Membership facts sit between the intro and the sign-up cards, in data order.
const joinFacts=[...(joinSection.match(/<dl class="join-facts">[\s\S]*?<\/dl>/)?.[0]??'').matchAll(/<dt>([^<]+)<\/dt><dd>([^<]+)<\/dd>/g)].map(m=>({label:m[1],value:m[2]}));
assert.deepEqual(joinFacts,data.joinFacts,'Join membership facts');
if(joinFacts.length)assert(joinSection.indexOf(data.joinIntro)<joinSection.indexOf('join-facts')&&joinSection.indexOf('join-facts')<joinSection.indexOf('join-cards'),'Join facts between intro and cards');
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
 if(!t.contactEmail)assert(tournament.includes('href="/contact/"'),'Contact fallback');
}
// Home highlight cards: Community Impact first, then the featured tournament.
const highlights=pages.home.match(/<section id="highlights"[\s\S]*?<\/section>/)[0];
const featured=tournaments.find(t=>t.featured)??tournaments[0];
const cards=[...highlights.matchAll(/<article class="highlight-card[\s\S]*?<\/article>/g)].map(m=>m[0]);
assert.equal(cards.length,2,'Two highlight cards');
assert(cards[0].includes('Community Impact')&&cards[0].includes('href="/community/"'),'Community Impact card links to Community page');
assert(cards[0].includes(data.communityImpact.replaceAll("'",'&#39;'))&&!cards[0].includes('TODO'),'Community Impact card text');
assert(cards[1].includes(featured.name)&&cards[1].includes('href="/tournaments/"')&&cards[1].includes('Info + Register'),'Tournament card links to Tournaments page');
// Community page: one card per communityCards entry, side by side, with the email (or its placeholder) on contact cards.
const communityCards=[...pages.community.matchAll(/<article class="highlight-card">[\s\S]*?<\/article>/g)].map(m=>m[0]);
assert.equal(communityCards.length,data.communityCards.length,'Community cards');
data.communityCards.forEach((card,i)=>{
 assert(communityCards[i].includes(`<h2>${card.title.replaceAll('&','&amp;')}</h2>`)&&communityCards[i].includes(card.description.replaceAll("'",'&#39;')),`Community card ${card.title}`);
 if(card.contactEmail)assert(communityCards[i].includes(data.email?`href="mailto:${data.email}"`:'href="/contact/"'),'Community card email or Contact page link');
});
// Contact page: club email as the preferred contact, plus a link to the officer list.
if(data.email)assert(pages.contact.includes(`href="mailto:${data.email}"`)&&pages.contact.includes('preferred way to reach'),'Contact page club email message');
assert(pages.contact.includes('href="/about/#team"')&&pages.about.includes('id="team"'),'Contact page links to About Team');
const galleryBlock=pages.community.match(/<div id="gallery"[\s\S]*?<\/section>/)?.[0]??'';
if(data.gallery.length){
 assert(galleryBlock.includes('id="gallery-title">Gallery</h2>')&&pages.community.indexOf('class="highlight-grid')<pages.community.indexOf('id="gallery"'),'Gallery follows Community cards');
 const photos=[...galleryBlock.matchAll(/<figure>[\s\S]*?<\/figure>/g)].map(m=>m[0]);
 assert.equal(photos.length,data.gallery.length,'One figure per gallery photo');
 data.gallery.forEach((photo,i)=>assert(photo.alt.trim()&&photos.some(figure=>figure.includes(`alt="${photo.alt}"`)),`Gallery photo ${i+1} has alt text`));
 data.gallery.filter(photo=>photo.caption).forEach(photo=>assert(photos.some(figure=>figure.includes(`src="${photo.src}"`)&&figure.includes(`<figcaption>${photo.caption}</figcaption>`)),`Gallery caption stays with ${photo.src}`));
 const months=['january','february','march','april','may','june','july','august','september','october','november','december'];
 const dates=photos.map(figure=>{const m=figure.match(/<figcaption>\[(\w+)\s+(\d{4})\]/);return m?Number(m[2])*12+Math.max(months.indexOf(m[1].toLowerCase()),0):-1});
 assert(dates.every((date,i)=>i===0||dates[i-1]>=date),'Gallery runs newest to oldest');
}else assert(!galleryBlock,'Gallery hidden when there are no photos');
assert(pages.community.includes(`<p>${data.communityIntro.replaceAll("'",'&#39;')}</p>`),'Community intro');
// 404 page: GitHub Pages serves dist/404.html for any missing address, at any depth, so every link and asset must be root-relative.
const notFound=readFileSync('dist/404.html','utf8');
assert(notFound.includes('<title>Page Not Found | Science Olympiad at Illinois</title>')&&notFound.includes('<meta name="robots" content="noindex">'),'404 title and noindex');
assert(!notFound.includes('rel="canonical"')&&!notFound.includes('og:url')&&!notFound.includes('application/ld+json'),'404 has no canonical address or structured data');
assert(notFound.includes('id="not-found-title">Page not found</h1>')&&notFound.includes('class="orbital-field"'),'404 heading and branded background');
assert(notFound.includes('href="/">Back to Home')&&notFound.includes('class="site-header"')&&notFound.includes('<footer>'),'404 keeps site navigation and footer');
assert(!/aria-current/.test(notFound.match(/<nav id="navigation"[\s\S]*?<\/nav>/)[0]),'404 marks no nav item as current');
for(const [,path] of notFound.matchAll(/(?:href|src)="([^"]*)"/g))assert(/^(\/|#|https?:|mailto:)/.test(path),`404 link works from any address: ${path}`);
assert(!/UIUC|\bSciOly\b|\[TODO/i.test(notFound)&&!/(?<!Science )\bOlympiad\b/.test(notFound.replace(/<[^>]*>/g,'')),'404 naming rules');
console.log('Passed: six pages, page navigation, home highlights, tournament pending states, hero, join links, compliance copy and 404 page.');

const detail=readFileSync('dist/invitational/index.html','utf8');
assert(detail.includes('<title>2027 SOIL Satellite Invitational | Science Olympiad at Illinois</title>'));
assert(tournament.includes('href="/invitational/"'));
assert(!detail.includes('application/ld+json'));
for(const page of [...Object.values(pages),detail,notFound]){
 // Link rule: → only on internal links; ↗ only on external links, which open in a new tab and say so to screen readers; email links show no arrow.
 for(const [,attrs,text] of page.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)){
  const href=attrs.match(/href="([^"]*)"/)?.[1]??'';
  const newTabText=/\(opens in a new tab\)/.test(attrs+text);
  if(/^https?:/.test(href))assert(attrs.includes('target="_blank"')&&attrs.includes('rel="noopener noreferrer"')&&newTabText&&!text.includes('→'),`External link opens in a new tab: ${href}`);
  else assert(!text.includes('↗')&&!attrs.includes('target="_blank"')&&!newTabText,`Internal or email link has no external marker: ${href}`);
  if(href.startsWith('mailto:'))assert(!/[→↗]/.test(text)&&text.includes(href.slice(7)),`Email link shows its address: ${href}`);
 }
 assert.equal((page.match(/<h1\b/g)||[]).length,1);
 assert(page.includes('/fonts/Geist-Variable.woff2')&&page.includes('font-display:swap'));
 assert(page.includes('alt="Science Olympiad logo"'));
 const pageIds=[...page.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(pageIds).size,pageIds.length,'Unique IDs');
 for(const [,id] of page.matchAll(/href="#([^"]+)"/g))assert(pageIds.includes(id),`Anchor target ${id}`);
 for(const [,path] of page.matchAll(/(?:href|src|srcset)="(\/[^"#?]*)(?:#[^"]*)?"/g)){
  assert(!path.startsWith('//'),`Root-relative path ${path}`);
  const target=join('dist',path.slice(1));assert(existsSync(path.endsWith('/')?join(target,'index.html'):target),`Asset ${path}`);
 }
}
const event=tournaments.find(t=>t.id==='2027-soil-invitational');
for(const [id,present] of [['updates',!!event.updates?.length],['volunteer',!!event.volunteerUrl],['team',!!event.team?.length]]){
 assert.equal(detail.includes(`id="${id}"`),present);
 assert.equal(detail.includes(`data-event-link="${id}"`),present);
}
if(!event.events?.length)assert(detail.includes('Event list to be announced'));
if(!event.schedule?.length)assert(detail.includes('Schedule to be announced'));
assert(detail.includes('href="/tournaments/">← Back to Tournaments'));
assert(/href="\/tournaments\/" aria-current="page"/.test(detail));
console.log('Passed: invitational routing, conditional navigation, shared assets, font preload, and pending content.');

const facts=detail.match(/<h3>Key facts<\/h3>([\s\S]*?)<\/section>/)[1];
assert.deepEqual([...facts.matchAll(/<strong>([^<]+):<\/strong>/g)].map(m=>m[1]),['Date','Divisions','Teams','Fee']);
assert.equal((tournament.match(/class="tournament-info"/g)||[]).length,1);
assert(!tournament.includes('Teams:')&&!tournament.includes('Fee:'));
assert(tournament.indexOf('<h3>')<tournament.indexOf('tournament-date'));
assert(tournament.indexOf('tournament-date')<tournament.indexOf('tournament-description'));
assert.deepEqual(Object.keys(event.registration),['url']);
