import { CAMERAS, CAMERA_ORDER } from './cameras.mjs';
import { CAMERA_STORIES, CHAPTERS, SOURCES } from './guide.mjs';
import { collection, bodyPhoto } from './collection.mjs';
import './site.mjs';
const requested = new URLSearchParams(location.search).get('chapter') || 'history';
const id = Object.hasOwn(CAMERA_STORIES, requested) || Object.hasOwn(CHAPTERS, requested) ? requested : 'history';
const camera = CAMERAS[id], story = CAMERA_STORIES[id], chapter = CHAPTERS[id];
const link = key => { const [label, url] = SOURCES[key]; return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label} <span aria-label="opens a new tab">↗</span></a>`; };
const title = camera ? story.title : chapter.title;
const category = camera ? 'The instrument collection' : chapter.category;
const diagram = `<svg viewBox="0 0 620 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="ray"><stop stop-color="#a34b32" stop-opacity=".1"/><stop offset=".5" stop-color="#a34b32"/><stop offset="1" stop-color="#a34b32" stop-opacity=".15"/></linearGradient></defs><circle cx="310" cy="172" r="128" fill="none" stroke="#dbd9d1"/><circle cx="310" cy="172" r="106" fill="none" stroke="#dbd9d1" stroke-dasharray="2 8"/><path d="M60 50L310 172l230 102M60 294L310 172l230-104M60 172h480" stroke="url(#ray)" stroke-width="2" fill="none"/><path d="M310 78q-38 94 0 188q38-94 0-188z" fill="#c1cbc3" fill-opacity=".6" stroke="#7a8b80"/><path d="M544 60v220" stroke="#515e53" stroke-width="4"/><circle cx="310" cy="172" r="5" fill="#a34b32"/><text x="77" y="330" font-family="sans-serif" font-size="11" letter-spacing="3" fill="#7c8078">LIGHT</text><text x="292" y="330" font-family="sans-serif" font-size="11" letter-spacing="3" fill="#7c8078">LENS</text><text x="491" y="330" font-family="sans-serif" font-size="11" letter-spacing="3" fill="#7c8078">IMAGE</text></svg>`;
document.title = `${camera ? camera.name : chapter.kicker} · Camera Archive`;
document.getElementById('article-category').textContent = category;
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function external(label,url) {
  return `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
}
function photograph(photo, hero = false) {
  const rights = photo.licenseUrl ? external(photo.license,photo.licenseUrl) : escape(photo.license);
  return `<figure class="archive-print${hero?' instrument-print':''}">
    <a class="print-link" href="${escape(photo.src)}" aria-label="View larger photograph: ${escape(photo.title)}"><img src="${escape(photo.src)}" alt="${escape(photo.alt)}" ${hero?'fetchpriority="high"':'loading="lazy"'}></a>
    <figcaption><strong>${escape(photo.title)}</strong><p>${escape(photo.caption)}</p>
    <small>${escape(photo.credit)} · ${external('Source record',photo.source)} · ${rights}</small></figcaption></figure>`;
}
let sections, aside, cta;
if (camera) {
  const entry = collection[id], context = entry.figures.filter(f=>f.role==='context'), exposures = entry.figures.filter(f=>f.role==='exposure');
  sections = `<section id="history"><h2>${escape(entry.storyTitle)}</h2><p>${escape(entry.story)}</p>${context.map(f=>photograph(f)).join('')}</section>
    <section id="photographs"><h2>Photographs made with the ${escape(camera.short)}</h2>${entry.exposureNote ? '<p>'+escape(entry.exposureNote)+'</p>' : ''}${exposures.map(f=>photograph(f)).join('')}
    ${(entry.exposureLinks || []).map(l=>`<p>${external(l.label,l.url)}</p>`).join('')}</section>
    <section id="mechanism"><h2>Inside the camera</h2>${entry.foldedFigure ? '<div id="folded">'+photograph(entry.foldedFigure)+'</div>' : ''}${entry.technical.map(t=>`<h3>${escape(t.title)}</h3><p>${escape(t.text)}</p>`).join('')}</section>
    <section id="specifications"><h2>Specifications</h2><table class="spec-table"><caption>Historical context and studio configuration</caption><tbody>${story.specs.map(([key,value])=>`<tr><th scope="row">${key}</th><td>${value}</td></tr>`).join('')}</tbody></table></section>
    <section class="scope-note" id="scope"><h2>Inside this simulation</h2><p>${story.limitation}</p><a href="./learn.html?chapter=about">Model and limits</a></section>
    <section id="sources"><h2>Sources and further reading</h2><ul class="source-list">${entry.reading.map(r=>`<li>${external(r.label,r.url)}</li>`).join('')}${story.sources.filter(k=>!entry.reading.some(r=>r.url===SOURCES[k][1])).map(k=>`<li>${link(k)}</li>`).join('')}</ul></section>`;
  aside = `<span class="eyebrow">In this chapter</span><a href="#instrument">The camera</a><a href="#history">In use</a><a href="#photographs">Photographic examples</a><a href="#mechanism">How it works</a><a href="#specifications">Specifications</a><a href="#scope">The simulation</a><a href="#sources">Sources</a><a class="aside-studio" href="./studio.html?camera=${id}">Try this instrument</a>`;
  cta = `<h2>Get to know the ${camera.short}.</h2><p>${story.exercise}</p><a class="button button-dark" href="./studio.html?camera=${id}">Open ${camera.short} in the studio ↗</a>`;
} else {
  sections = chapter.sections.map((s,i)=>`<section id="${s.id || 'detail-'+i}"><span class="article-section-number">0${i+1}</span><h2>${s.title}</h2><p>${s.text}</p>${s.sources ? `<div class="inline-sources">${s.sources.map(link).join('')}</div>` : ''}</section>`).join('');
  aside = `<span class="eyebrow">In this chapter</span>${chapter.sections.map((s,i)=>`<a href="#${s.id || 'detail-'+i}">${s.title}</a>`).join('')}<a class="aside-studio" href="./studio.html">Put it into practice ↗</a>`;
  cta = `<p class="eyebrow">Try a small experiment</p><h2>Learning happens by looking.</h2><p>${chapter.exercise}</p><a class="button button-dark" href="./studio.html">Put it into practice ↗</a><a class="text-link" href="./learn.html?chapter=${chapter.next}">Next chapter →</a>`;
}
document.getElementById('article-host').innerHTML = `<article><header class="article-hero"><div><p class="eyebrow">${camera ? `${camera.year} / ${story.label}` : chapter.kicker}</p><h1>${title}</h1><p class="article-standfirst">${camera ? story.standfirst : chapter.standfirst}</p></div><div class="article-visual" id="instrument">${camera ? photograph(bodyPhoto(id),true) : diagram}</div></header><div class="article-layout"><aside class="article-toc" aria-label="Chapter contents">${aside}</aside><div class="article-body">${sections}</div></div><div class="article-exercise">${cta}</div></article>`;
const chapterLinks = [['history','The story of images'],['light','Light & aperture'],['exposure','Time & exposure'],['seeing','Focus & framing'], ...CAMERA_ORDER.map(key=>[key,CAMERAS[key].name]),['about','About the experiment']];
document.getElementById('chapter-navigation').innerHTML = `<p class="eyebrow">Keep your curiosity going</p><div>${chapterLinks.map(([key,label])=>`<a href="./learn.html?chapter=${key}" ${key===id?'aria-current="page"':''}>${label} <span aria-hidden="true">↗</span></a>`).join('')}</div>`;
// Native anchor positioning happens before module-created sections exist.
if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
