// recherche-404.js — moteur de recherche de la page 404 (catalogue des formations)
(function () {
  var form = document.getElementById('form404');
  var zone = document.getElementById('resultats404');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = document.getElementById('q404').value.trim().toLowerCase();
    zone.innerHTML = '';
    if (!q || typeof FORMATIONS_DATA === 'undefined') return;
    var resultats = [];
    Object.keys(FORMATIONS_DATA).forEach(function (niv) {
      (FORMATIONS_DATA[niv].domaines || []).forEach(function (d) {
        (d.specialites || []).forEach(function (spec) {
          var texte = (spec.titre + ' ' + (spec.competences || '') + ' ' + (spec.domaine || '')).toLowerCase();
          if (texte.indexOf(q) !== -1 && resultats.length < 8) {
            resultats.push(spec);
          }
        });
      });
    });
    if (!resultats.length) {
      zone.innerHTML = '<li><a href="/parcours-academique.html">Aucun résultat direct — parcourir tout le catalogue<small>BTS, Licences, Masters, formation continue</small></a></li>';
      return;
    }
    resultats.forEach(function (spec) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      var prefixe = (spec.niveau_id === 'langues' ? 'langue' : spec.niveau_id) + '-';
      var court = spec.slug.indexOf(prefixe) === 0 ? spec.slug.slice(prefixe.length) : spec.slug;
      a.href = '/formations/' + spec.niveau_id + '/' + court + '.html';
      a.innerHTML = '<strong></strong><small></small>';
      a.querySelector('strong').textContent = spec.titre;
      a.querySelector('small').textContent = (spec.niveau_label || '') + ' · ' + (spec.domaine || '');
      li.appendChild(a);
      zone.appendChild(li);
    });
  });
})();
