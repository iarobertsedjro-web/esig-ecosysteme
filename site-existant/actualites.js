// =========================================================================
//  actualites.js — Moteur d'affichage des actualités et de la galerie
//  (Ne pas modifier — le contenu se gère dans actualites-data.js et galerie-data.js)
// =========================================================================

function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function toggleMenu(){
  document.getElementById('navLinks').classList.toggle('mobile-open');
}
function goToPreinscription(){
  window.location.href = 'index.html?preinscription=1';
}

// Couleur de pastille par catégorie
const CAT_CLASS = {
  "Événement": "cat-event",
  "Annonce": "cat-annonce",
  "Vie étudiante": "cat-vie",
  "Partenariat": "cat-partenariat"
};

// ---------- ACTUALITÉS ----------
function renderActualites(){
  if (typeof ACTUALITES === 'undefined' || !ACTUALITES.length) return '';

  // Tri par date décroissante (plus récent en premier)
  var items = ACTUALITES.slice().sort(function(a, b){
    return (b.date || '').localeCompare(a.date || '');
  });

  // Sépare "à venir" et "passées" par rapport à aujourd'hui
  var today = new Date().toISOString().slice(0, 10);
  var avenir = items.filter(function(x){ return (x.date || '') >= today; });
  var passees = items.filter(function(x){ return (x.date || '') < today; });

  var html = '';

  if (avenir.length){
    // Les événements à venir : du plus proche au plus lointain
    avenir.sort(function(a, b){ return (a.date || '').localeCompare(b.date || ''); });
    html += '<div class="actu-block"><h2 class="actu-block-title">À venir</h2>' +
            '<div class="actu-grid">' + avenir.map(renderActuCard).join('') + '</div></div>';
  }

  if (passees.length){
    html += '<div class="actu-block"><h2 class="actu-block-title">Actualités récentes</h2>' +
            '<div class="actu-grid">' + passees.map(renderActuCard).join('') + '</div></div>';
  }

  return html;
}

function renderActuCard(a){
  var catClass = CAT_CLASS[a.categorie] || 'cat-annonce';
  var img = a.image
    ? '<div class="actu-img" style="background-image:url(\'' + a.image + '\')"></div>'
    : '<div class="actu-img actu-img-empty"><span>ESIG</span></div>';
  var lieu = a.lieu ? '<div class="actu-lieu">📍 ' + esc(a.lieu) + '</div>' : '';
  var videoBtn = a.video
    ? '<button type="button" class="actu-video-btn" data-video="' + esc(a.video) + '">▶ Voir la vidéo</button>'
    : '';

  return '<article class="actu-card">' +
      img +
      '<div class="actu-body">' +
        '<div class="actu-meta">' +
          '<span class="actu-cat ' + catClass + '">' + esc(a.categorie) + '</span>' +
          '<span class="actu-date">' + esc(a.date_texte) + '</span>' +
        '</div>' +
        '<h3 class="actu-titre">' + esc(a.titre) + '</h3>' +
        '<p class="actu-resume">' + esc(a.resume) + '</p>' +
        lieu +
        videoBtn +
      '</div>' +
    '</article>';
}

// ---------- GALERIE ----------
function renderGalerie(){
  if (typeof ALBUMS === 'undefined' || !ALBUMS.length) return '';

  return ALBUMS.map(function(album){
    var medias = (album.medias || []).map(renderMedia).join('');
    var desc = album.description ? '<p class="album-desc">' + esc(album.description) + '</p>' : '';
    return '<div class="album">' +
        '<h3 class="album-titre">' + esc(album.titre) + '</h3>' +
        desc +
        '<div class="galerie-grid">' + medias + '</div>' +
      '</div>';
  }).join('');
}

function renderMedia(m){
  if (m.type === 'video' && m.youtube){
    var thumb = 'https://img.youtube.com/vi/' + encodeURIComponent(m.youtube) + '/hqdefault.jpg';
    return '<button type="button" class="media-item media-video" data-video="' + esc(m.youtube) + '" ' +
      'style="background-image:url(\'' + thumb + '\')" aria-label="' + esc(m.legende || 'Vidéo') + '">' +
      '<span class="media-play">▶</span>' +
      '<span class="media-legende">' + esc(m.legende || '') + '</span>' +
      '</button>';
  }
  // photo
  return '<button type="button" class="media-item" data-photo="' + esc(m.src) + '" data-legende="' + esc(m.legende || '') + '" ' +
    'style="background-image:url(\'' + esc(m.src) + '\')" aria-label="' + esc(m.legende || 'Photo') + '">' +
    (m.legende ? '<span class="media-legende">' + esc(m.legende) + '</span>' : '') +
    '</button>';
}

// ---------- LIGHTBOX (agrandissement photo / lecteur vidéo) ----------
function openPhoto(src, legende){
  var lb = document.getElementById('lightbox');
  lb.querySelector('.lb-content').innerHTML =
    '<img src="' + esc(src) + '" alt="' + esc(legende) + '">' +
    (legende ? '<div class="lb-legende">' + esc(legende) + '</div>' : '');
  lb.classList.add('open');
}

function openVideo(youtubeId){
  var lb = document.getElementById('lightbox');
  lb.querySelector('.lb-content').innerHTML =
    '<div class="lb-video"><iframe src="https://www.youtube-nocookie.com/embed/' + youtubeId + '?autoplay=1" ' +
    'frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
    'allowfullscreen></iframe></div>';
  lb.classList.add('open');
}

function closeLightbox(){
  var lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  lb.querySelector('.lb-content').innerHTML = ''; // stoppe la vidéo
}

// Onglets Actualités / Galerie (appelé via commun.js — data-actu-tab)
function switchActuTab(id, btn){
  document.querySelectorAll('.actu-panel').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('.actu-tab').forEach(function(t){ t.classList.remove('active'); });
  document.getElementById('panel-' + id).classList.add('active');
  btn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function(){
  // Délégation : boutons vidéo / photo générés dynamiquement (compatibles CSP)
  document.addEventListener('click', function(e){
    var v = e.target.closest('[data-video]');
    if (v) { openVideo(v.getAttribute('data-video')); return; }
    var p = e.target.closest('[data-photo]');
    if (p) { openPhoto(p.getAttribute('data-photo'), p.getAttribute('data-legende') || ''); }
  });

  var actuEl = document.getElementById('actualitesContent');
  if (actuEl) actuEl.innerHTML = renderActualites() || '<p class="empty-note">Aucune actualité pour le moment.</p>';

  var galEl = document.getElementById('galerieContent');
  if (galEl) galEl.innerHTML = renderGalerie() || '<p class="empty-note">La galerie sera bientôt enrichie.</p>';

  // Fermeture lightbox : clic sur le fond ou touche Échap
  var lb = document.getElementById('lightbox');
  if (lb){
    lb.addEventListener('click', function(e){ if (e.target === lb || e.target.classList.contains('lb-close')) closeLightbox(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeLightbox(); });
  }
});
