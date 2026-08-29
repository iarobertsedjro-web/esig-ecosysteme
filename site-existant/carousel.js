// =========================================================================
//  carousel.js — Carrousel de la page d'accueil
//  (Ne pas modifier — la liste des photos se gère dans config-site.js)
// =========================================================================

(function(){
  var INTERVAL = 5000;   // durée d'affichage de chaque photo (millisecondes)
  var slides = [];
  var dots = [];
  var current = 0;
  var timer = null;

  var reduitAnimations = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var enPause = false;

  function show(index){
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function(s, i){ s.classList.toggle('active', i === current); });
    dots.forEach(function(d, i){
      d.classList.toggle('active', i === current);
      if (i === current) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  }

  function next(){ show(current + 1); }
  function prev(){ show(current - 1); }

  function startAuto(){
    stopAuto();
    // Pas de défilement automatique si l'utilisateur limite les animations
    // ou s'il a explicitement mis le diaporama en pause.
    if (slides.length > 1 && !reduitAnimations && !enPause) timer = setInterval(next, INTERVAL);
  }
  function stopAuto(){ if (timer) { clearInterval(timer); timer = null; } }

  function restart(){ startAuto(); }  // relance le minuteur après une action manuelle

  document.addEventListener('DOMContentLoaded', function(){
    var carousel = document.getElementById('heroCarousel');
    var dotsWrap = document.getElementById('heroDots');
    if (!carousel) return;
    carousel.innerHTML = ''; // retire la diapositive statique initiale (rendue pour le LCP)

    // Source des images : liste de configuration, sinon repli sur l'image historique
    var images = (typeof CARROUSEL_ACCUEIL !== 'undefined' && CARROUSEL_ACCUEIL.length)
      ? CARROUSEL_ACCUEIL
      : ['images/hero/hero-diplomes.jpg'];

    // Construit les couches d'images
    images.forEach(function(src, i){
      var slide = document.createElement('div');
      slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
      slide.style.backgroundImage = "url('" + src + "')";
      carousel.appendChild(slide);
      slides.push(slide);

      if (dotsWrap){
        var dot = document.createElement('button');
        dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Aller à l\'image ' + (i + 1));
        dot.addEventListener('click', function(){ show(i); restart(); });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      }
    });

    // Flèches (masquées s'il n'y a qu'une seule image)
    var prevBtn = document.getElementById('heroPrev');
    var nextBtn = document.getElementById('heroNext');
    if (images.length <= 1){
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (dotsWrap) dotsWrap.style.display = 'none';
      return;
    }
    if (prevBtn) prevBtn.addEventListener('click', function(){ prev(); restart(); });
    if (nextBtn) nextBtn.addEventListener('click', function(){ next(); restart(); });

    // Bouton pause/lecture (WCAG 2.2.2 — contrôle des contenus en mouvement)
    var pauseBtn = document.getElementById('heroPause');
    if (pauseBtn){
      if (reduitAnimations) pauseBtn.style.display = 'none';
      pauseBtn.addEventListener('click', function(){
        enPause = !enPause;
        pauseBtn.setAttribute('aria-pressed', enPause ? 'true' : 'false');
        pauseBtn.setAttribute('aria-label', enPause ? 'Relancer le diaporama' : 'Mettre le diaporama en pause');
        pauseBtn.innerHTML = enPause ? '&#9654;' : '&#10074;&#10074;';
        if (enPause) stopAuto(); else startAuto();
      });
    }

    // Pause au survol (confort de lecture)
    var hero = carousel.closest('.hero');
    if (hero){
      hero.addEventListener('mouseenter', stopAuto);
      hero.addEventListener('mouseleave', startAuto);
    }

    startAuto();
  });
})();
