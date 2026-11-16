// Controle van de Nederlandse Eurostat-cijfers die alleen voor de vergelijking met andere landen dienen.
// Starten met: node buitenland/landen/nederland/test.js. Werkt ook in de browser via buitenland/proef.html.
(function (root) {
  'use strict';
  var node = typeof module !== 'undefined' && module.exports;
  var D = node ? require('./data.js') : root.DataNederland;
  var Belgie = node ? require('../belgie/data.js') : root.DataBelgie;
  var fout = 0, regels = [];
  function log(t) { regels.push(t); if (typeof console !== 'undefined') console.log(t); }
  function ok(naam, goed) { if (!goed) fout++; log((goed ? 'OK   ' : 'FOUT ') + naam); }
  var som = function (l) { return l.reduce(function (a, x) { return a + x.mld; }, 0); };

  ok('Uitgaven tellen op tot het totaal (' + som(D.UITGAVEN).toFixed(3) + ' van ' + D.UITGAVEN_TOTAAL + ')', Math.abs(som(D.UITGAVEN) - D.UITGAVEN_TOTAAL) < 0.0005);
  var gebruikt = [].concat.apply([], D.GROEPEN.map(function (g) { return g.delen; })).sort().join(',');
  ok('Elk onderdeel zit in precies één groep', gebruikt === D.UITGAVEN.map(function (u) { return u.id; }).sort().join(','));
  ok('Inkomstenposten passen binnen het totaal', som(D.INKOMSTEN) <= D.INKOMSTEN_TOTAAL);
  // De vergelijking klopt alleen als beide landen dezelfde bron, hetzelfde jaar en dezelfde groepen gebruiken
  ok('Zelfde jaar als België', D.JAAR_CIJFERS === Belgie.JAAR_CIJFERS);
  var vorm = function (d) { return d.GROEPEN.map(function (g) { return g.id + ':' + g.delen.join('+'); }).join(','); };
  ok('Zelfde groepen als België', vorm(D) === vorm(Belgie));
  ok('Zelfde inkomstenposten als België', D.INKOMSTEN.map(function (i) { return i.naam; }).sort().join('|') === Belgie.INKOMSTEN.map(function (i) { return i.naam; }).sort().join('|'));

  log(fout ? fout + ' fout(en)' : 'Alle controles geslaagd');
  if (node) process.exit(fout ? 1 : 0);
  else root.TestNederland = { fout: fout, regels: regels };
})(typeof window !== 'undefined' ? window : this);
