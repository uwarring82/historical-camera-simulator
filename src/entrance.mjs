import { CAMERA_ORDER, getCamera } from './cameras.mjs';
import { cameraArtwork } from './illustrations.mjs';
import { CAMERA_STORIES } from './guide.mjs';
import './site.mjs';
const $ = id => document.getElementById(id);
function previewCamera(id) {
  const camera = getCamera(id), story = CAMERA_STORIES[id];
  $('hero-camera').innerHTML = cameraArtwork(id, 'hero-' + id);
  $('hero-camera').setAttribute('aria-label', `Schematic illustration of the ${camera.name}`);
  $('hero-year').textContent = camera.year;
  $('hero-camera-name').textContent = camera.name;
  $('hero-camera-subtitle').textContent = story.tagline;
  $('hero-camera-link').href = `./learn.html?chapter=${id}`;
  $('hero-camera-link').setAttribute('aria-label', `Explore the ${camera.name}`);
  document.querySelectorAll('.hero-tab').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.camera === id)));
}
for (const id of CAMERA_ORDER) {
  const camera = getCamera(id), story = CAMERA_STORIES[id];
  const button = document.createElement('button');
  button.className = 'hero-tab'; button.type = 'button'; button.dataset.camera = id;
  button.textContent = camera.short; button.setAttribute('aria-pressed', String(id === 'apollo'));
  button.addEventListener('click', () => previewCamera(id)); $('hero-tabs').append(button);
  const card = document.createElement('article'); card.className = `collection-card collection-${id}`;
  card.innerHTML = `<div class="card-heading"><span>${camera.year}</span><span>${story.format}</span></div><a class="collection-art" href="./learn.html?chapter=${id}" aria-label="Discover the ${camera.name}">${cameraArtwork(id, 'collection-' + id)}</a><div class="collection-copy"><p class="eyebrow">${story.label}</p><h3>${camera.name}</h3><p>${story.intro}</p><div class="card-links"><a class="text-link" href="./learn.html?chapter=${id}">Its story & details ↗</a><a class="try-camera" href="./studio.html?camera=${id}" aria-label="Try the ${camera.name}">Take the controls <span aria-hidden="true">→</span></a></div></div>`;
  $('collection-grid').append(card);
}
previewCamera('apollo');
const apertures = ['2.8','4','5.6','8','11','16'];
const ratios = ['16×','8×','4×','2×','the same amount of','½'];
function showAperture() {
  const index = Number($('aperture-demo').value);
  const scale = [1,.84,.7,.58,.48,.39][index];
  $('aperture-opening').style.setProperty('--opening', scale);
  $('aperture-blades').style.transform = `rotate(${index * 13}deg)`;
  $('aperture-demo-value').value = 'f/' + apertures[index];
  $('aperture-demo').setAttribute('aria-valuetext', 'f/' + apertures[index]);
  $('aperture-demo-info').textContent = `At f/${apertures[index]}, the opening admits ${index === 4 ? 'the same amount of light as' : ratios[index] + ' the light of'} f/11. A conceptual illustration at a fixed shutter speed.`;
}
$('aperture-demo').addEventListener('input', showAperture); showAperture();
