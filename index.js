// Pattern : écrire une expression régulière, la voir trouver ses correspondances en direct, comprendre chaque morceau, remplacer, et garder ses motifs.
// La recherche tourne dans un Worker arrêté au bout d'une seconde : un motif qui s'emballe (retour arrière catastrophique) ne fige jamais NeoDex.
const CSS = `
.paGrid{display:grid;grid-template-columns:minmax(0,1fr) clamp(300px,24vw,420px);gap:16px}
@media (max-width:900px){.paGrid{grid-template-columns:minmax(0,1fr)}}
.paRe{display:flex;align-items:center;gap:6px;font:18px monospace}
.paRe .f{flex:1;font:17px monospace;min-width:0}
.paRe .f.bad{outline:2px solid #e05a5a}
.paSlash{color:var(--muted);font-size:22px}
.paFlags{display:flex;gap:4px;flex-wrap:wrap;margin:8px 0}
.paFlags .btn{min-width:44px;font-family:monospace;font-size:16px}
.paText{width:100%;min-height:clamp(150px,20vh,320px);box-sizing:border-box;font:16px monospace}
.paView{font:16px monospace;white-space:pre-wrap;word-break:break-word;background:var(--bg0);border:2px solid var(--line);padding:10px;min-height:60px;max-height:max(320px,calc(100vh - 560px));overflow:auto;color:var(--lilac)}
.paView mark{color:#000;padding:0;border-bottom:2px solid #000}
.paView mark.m0{background:#ffd34f}.paView mark.m1{background:#7fe0ff}
.paView mark.empty{display:inline-block;width:2px;height:1em;background:#ff4fb0;vertical-align:-2px}
.paMsg{font-size:15px;margin:6px 0;color:var(--muted)}
.paMsg.err{color:#ff7a7a}
.paList{display:flex;flex-direction:column;gap:6px;max-height:300px;overflow:auto}
.paMatch{border:2px solid var(--line);padding:7px 9px;font:15px monospace;background:var(--bg0)}
.paMatch b{color:#fff}
.paMatch .g{color:var(--lilac);margin-left:12px;display:block}
.paExplain{display:flex;flex-direction:column;gap:3px;font-size:15px}
.paTok{display:grid;grid-template-columns:110px 1fr;gap:8px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.paTok code{font:16px monospace;color:#ffd34f;word-break:break-all}
.paTok.depth1 code{padding-left:10px}.paTok.depth2 code{padding-left:20px}.paTok.depth3 code{padding-left:30px}
.paCheat{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.paCheat button{text-align:left;font:14px monospace;padding:6px 8px;border:2px solid var(--line);background:var(--bg0);color:var(--lilac);cursor:var(--cp,pointer)}
.paCheat button b{color:#ffd34f;margin-right:6px}
.paCheat button:hover{border-color:var(--magenta)}
.paSaved{display:flex;flex-direction:column;gap:4px}
.paSaved .row{display:flex;gap:4px}
.paSaved .row .btn:first-child{flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.paTabs{display:flex;gap:6px;margin:10px 0 6px;flex-wrap:wrap}.paTabs .btn{width:auto;margin:0;flex:1 1 auto;padding-left:10px;padding-right:10px}
.paGrid>*{min-width:0}
`;
const EXAMPLES = [
  ['Adresse e-mail', '[\\w.+-]+@[\\w-]+\\.[\\w.-]+', 'gi', 'Écris à contact@exemple.fr ou à nolan.test+neo@mail.co.uk, mais pas à @rien.'],
  ['Date jj/mm/aaaa', '(?<jour>0[1-9]|[12]\\d|3[01])/(?<mois>0[1-9]|1[0-2])/(?<annee>\\d{4})', 'g', 'Né le 14/07/1998, rendez-vous le 03/12/2026, faux : 32/13/2020.'],
  ['Téléphone français', '(?:\\+33\\s?|0)[1-9](?:[\\s.-]?\\d{2}){4}', 'g', 'Appelle le 06 12 34 56 78 ou le +33 1.23.45.67.89, pas le 12345.'],
  ['Lien web', 'https?://[^\\s/$.?#].[^\\s]*', 'gi', 'Va sur https://ndesumeur.github.io/neodex-site/ ou http://exemple.com/page?x=1.'],
  ['Couleur hexadécimale', '#(?:[\\da-f]{3}){1,2}\\b', 'gi', 'Le rose #ff4fb0, le noir #000 et pas #12345.'],
  ['Adresse IPv4', '\\b(?:(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\b', 'g', 'Box : 192.168.1.254, DNS : 8.8.8.8, faux : 300.1.1.1.'],
  ['Mot répété', '\\b(\\w+)\\s+\\1\\b', 'gi', 'C\'est le le meilleur jour, vraiment vraiment.'],
  ['Nombres à virgule', '-?\\d+(?:[.,]\\d+)?', 'g', 'Il fait -3,5 degrés, 12 personnes, 0.75 litre.'],
];
const CHEAT = [
  ['.', 'n\'importe quel caractère'], ['\\d', 'un chiffre'], ['\\w', 'lettre, chiffre ou _'], ['\\s', 'un espace'], ['\\D', 'pas un chiffre'], ['\\b', 'bord de mot'],
  ['^', 'début'], ['$', 'fin'], ['[abc]', 'a, b ou c'], ['[^abc]', 'tout sauf a, b, c'], ['[a-z]', 'de a à z'], ['a|b', 'a ou b'],
  ['*', '0 fois ou plus'], ['+', '1 fois ou plus'], ['?', '0 ou 1 fois'], ['{2,5}', 'de 2 à 5 fois'], ['*?', 'le moins possible'], ['(…)', 'groupe capturant'],
  ['(?:…)', 'groupe sans capture'], ['(?<nom>…)', 'groupe nommé'], ['\\1', 'même texte que le groupe 1'], ['(?=…)', 'suivi de'], ['(?!…)', 'pas suivi de'], ['(?<=…)', 'précédé de'],
];
const FLAGS = [['g', 'toutes les correspondances (sinon seulement la première)'], ['i', 'sans tenir compte des majuscules'], ['m', '^ et $ à chaque ligne'], ['s', 'le point attrape aussi les retours à la ligne'], ['u', 'Unicode (\\p{L}, émojis…)'], ['y', 'collé : à partir de la position précédente seulement']];
const ESC = {d: 'un chiffre (0 à 9)', D: 'un caractère qui n\'est pas un chiffre', w: 'une lettre, un chiffre ou _', W: 'un caractère qui n\'est pas une lettre, un chiffre ou _', s: 'un espace, une tabulation ou un retour à la ligne',
  S: 'un caractère qui n\'est pas un espace', b: 'un bord de mot', B: 'pas un bord de mot', n: 'un retour à la ligne', t: 'une tabulation', r: 'un retour chariot'};
// découpe un motif en morceaux expliqués (couvre les constructions courantes ; le reste est montré tel quel)
function explain(src) {
  const out = []; let i = 0, depth = 0;
  const q = () => {  // un quantificateur juste après ?
    const m = /^(?:\*|\+|\?|\{\d+(?:,\d*)?\})\??/.exec(src.slice(i)); if (!m) return '';
    i += m[0].length; const t = m[0], lazy = t.length > 1 && t.endsWith('?') && t !== '?' ? ', le moins de fois possible' : '';
    const base = t[0] === '*' ? '0 fois ou plus' : t[0] === '+' ? '1 fois ou plus' : t[0] === '?' ? 'facultatif (0 ou 1 fois)' : (() => { const [a, b] = t.replace(/[{}?]/g, '').split(','); return b === undefined ? 'exactement ' + a + ' fois' : b === '' ? 'au moins ' + a + ' fois' : 'de ' + a + ' à ' + b + ' fois'; })();
    return ' — ' + base + lazy;
  };
  while (i < src.length) {
    const c = src[i], start = i; let d = '';
    if (c === '\\') {
      const n = src[i + 1] ?? ''; i += 2;
      if (ESC[n]) d = ESC[n];
      else if (/[1-9]/.test(n)) d = 'le même texte que celui trouvé par le groupe ' + n;
      else if (n === 'k' && src[i] === '<') { const e = src.indexOf('>', i); d = 'le même texte que le groupe « ' + src.slice(i + 1, e) + ' »'; i = e + 1; }
      else if (n === 'p' || n === 'P') { const e = src.indexOf('}', i); d = (n === 'P' ? 'pas ' : '') + 'un caractère de la catégorie Unicode ' + src.slice(i + 1, e); i = e + 1; }
      else if (n === 'u' || n === 'x') { const m = /^(\{[\da-f]+\}|[\da-f]{4}|[\da-f]{2})/i.exec(src.slice(i)); d = 'le caractère de code ' + (m ? m[0] : '?'); if (m) i += m[0].length; }
      else d = 'le caractère « ' + n + ' » tel quel';
    } else if (c === '[') {
      let j = i + 1; if (src[j] === '^') j++; if (src[j] === ']') j++;
      while (j < src.length && src[j] !== ']') j += src[j] === '\\' ? 2 : 1;
      const body = src.slice(i + 1, j); i = j + 1;
      d = (body[0] === '^' ? 'un caractère qui n\'est PAS dans : ' + body.slice(1) : 'un caractère parmi : ' + body);
    } else if (c === '(') {
      const m = /^\((\?:|\?=|\?!|\?<=|\?<!|\?<([A-Za-z_]\w*)>)?/.exec(src.slice(i)); i += m[0].length;
      d = !m[1] ? 'début d\'un groupe (capturé, numéroté)' : m[2] ? 'début du groupe nommé « ' + m[2] + ' »' : {'?:': 'début d\'un groupe sans capture', '?=': 'vérifie que la suite est…', '?!': 'vérifie que la suite n\'est PAS…', '?<=': 'vérifie que juste avant il y a…', '?<!': 'vérifie que juste avant il n\'y a PAS…'}[m[1]];
      out.push({t: src.slice(start, i), d, depth}); depth++; continue;
    } else if (c === ')') { i++; depth = Math.max(0, depth - 1); d = 'fin du groupe'; out.push({t: ')' + '', d: d + q(), depth}); continue; }
    else if (c === '|') { i++; d = 'OU : ce qui est à gauche, ou ce qui est à droite'; }
    else if (c === '.') { i++; d = 'n\'importe quel caractère (sauf retour à la ligne sans le drapeau s)'; }
    else if (c === '^') { i++; d = 'le début du texte (ou de la ligne avec le drapeau m)'; }
    else if (c === '$') { i++; d = 'la fin du texte (ou de la ligne avec le drapeau m)'; }
    else { let j = i; while (j < src.length && !'\\[]().|^$*+?{'.includes(src[j])) j++; if (j === i) j++; if (j - i > 1 && /^[*+?{]/.test(src[j] ?? '')) j--; d = (j - i > 1 ? 'le texte « ' : 'le caractère « ') + src.slice(i, j) + ' »'; i = j; }
    const qq = q(); out.push({t: src.slice(start, i), d: d + qq, depth});
  }
  return out;
}
// le travail fait dans le Worker : correspondances (1000 au plus) et remplacement
const WORKER = `onmessage = e => { const {src, flags, text, rep} = e.data; try { const re = new RegExp(src, flags), all = [];
  if (re.global || re.sticky) { let m; re.lastIndex = 0; while ((m = re.exec(text)) && all.length < 1000) { all.push({i: m.index, s: m[0], g: [...m].slice(1), n: m.groups || null}); if (m[0] === '') re.lastIndex++; if (re.sticky && m[0] === '') break; } }
  else { const m = re.exec(text); if (m) all.push({i: m.index, s: m[0], g: [...m].slice(1), n: m.groups || null}); }
  postMessage({all, out: rep == null ? null : text.replace(new RegExp(src, flags), rep)}); } catch (err) { postMessage({err: String(err.message || err)}); } };`;
export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const { el, toast } = ctx.host;
  ctx.host.addStyle(CSS);
  let data = null; try { data = await ctx.folder.read('pattern'); } catch {}
  const st = {src: data?.src ?? EXAMPLES[1][1], flags: data?.flags ?? EXAMPLES[1][2], text: data?.text ?? EXAMPLES[1][3], rep: data?.rep ?? '$<annee>-$<mois>-$<jour>', side: data?.side || 'explain', saved: Array.isArray(data?.saved) ? data.saved : []};
  let saveT = 0; const save = () => { clearTimeout(saveT); saveT = setTimeout(() => ctx.folder.write('pattern', st).catch(() => {}), 400); };

  let url = null; try { url = URL.createObjectURL(new Blob([WORKER], {type: 'text/javascript'})); } catch {}
  let worker = null, pending = null;
  const run = (msg, ms = 1000) => new Promise(ok => {  // une recherche à la fois : celle d'avant, si elle tourne encore, est arrêtée avec son Worker ; sans Worker, directement (rare)
    if (pending) { clearTimeout(pending.t); pending.ok({stale: true}); pending = null; worker?.terminate(); worker = null; }
    if (!url) { try { const fn = new Function('postMessage', 'return ' + WORKER.replace('onmessage = ', '')); let res; fn(r => res = r)({data: msg}); return ok(res); } catch (e) { return ok({err: e.message}); } }
    try { worker ??= new Worker(url); } catch { url = null; return ok(run(msg)); }
    const me = {ok, t: setTimeout(() => { if (pending !== me) return; pending = null; worker?.terminate(); worker = null; ok({err: 'trop long', slow: true}); }, ms)};
    pending = me;
    worker.onmessage = e => { if (pending !== me) return; clearTimeout(me.t); pending = null; ok(e.data); };
    worker.postMessage(msg);
  });
  ctx.onClose?.(() => { worker?.terminate(); worker = null; });

  view.innerHTML = '';
  const wrap = el('div', 'appWrap wide'), head = el('div', 'agHead'); head.append(el('span', 'label', 'Pattern · expressions régulières'));
  const grid = el('div', 'paGrid'), main = el('div'), side = el('div');
  const reRow = el('div', 'paRe'), re = el('input', 'f'), flagsEl = el('div', 'paFlags'), msg = el('div', 'paMsg');
  re.id = 'pa_re'; re.spellcheck = false; re.value = st.src; re.placeholder = 'ton motif, par exemple \\d+';
  reRow.append(el('span', 'paSlash', '/'), re, el('span', 'paSlash', '/'));
  for (const [f, tip] of FLAGS) { const b = el('button', 'btn px' + (st.flags.includes(f) ? ' main' : ''), f); b.title = tip; b.dataset.flag = f; b.onclick = () => { st.flags = st.flags.includes(f) ? st.flags.replace(f, '') : st.flags + f; b.classList.toggle('main'); save(); update(); }; flagsEl.append(b); }
  const text = el('textarea', 'f paText'), viewEl = el('div', 'paView'), rep = el('input', 'f'), repOut = el('div', 'paView');
  text.id = 'pa_text'; text.value = st.text; text.spellcheck = false; viewEl.id = 'pa_view'; viewEl.translate = false; repOut.translate = false; rep.id = 'pa_rep'; rep.value = st.rep; rep.placeholder = 'remplacement : $1, $<nom>, $& (tout)'; repOut.id = 'pa_repOut';
  const repRow = el('div', 'paRe'); repRow.append(el('span', 'hint', 'Remplacer par'), rep);
  const copyOut = el('button', 'btn px', 'Copier le résultat'); copyOut.onclick = () => navigator.clipboard.writeText(repOut.textContent).then(() => toast('Copié'), () => {});
  main.append(reRow, flagsEl, msg, el('span', 'label', 'Texte à tester'), text, el('span', 'label', 'Correspondances'), viewEl, repRow, repOut, copyOut);
  const sideTabs = el('div', 'paTabs'), sideBody = el('div');
  side.append(sideTabs, sideBody);
  grid.append(main, side); wrap.append(head, grid); view.append(wrap);

  re.oninput = () => { st.src = re.value; save(); update(); };
  text.oninput = () => { st.text = text.value; save(); update(); };
  rep.oninput = () => { st.rep = rep.value; save(); update(); };
  let last = {all: []};
  async function update() {
    let err = null; try { new RegExp(st.src, st.flags); } catch (e) { err = e.message; }
    re.classList.toggle('bad', !!err);
    if (err) { msg.className = 'paMsg err'; msg.textContent = 'Motif invalide : ' + err.replace(/^Invalid regular expression: /, ''); viewEl.textContent = st.text; repOut.textContent = ''; drawSide(); return; }
    const r = await run({src: st.src, flags: st.flags, text: st.text.slice(0, 50000), rep: st.rep});
    if (r.stale) return;  // une frappe plus récente a pris la main
    if (r.err) { msg.className = 'paMsg err'; msg.textContent = r.slow ? 'Recherche arrêtée au bout d\'une seconde : ce motif s\'emballe (des répétitions imbriquées comme (a+)+). Simplifie-le.' : 'Erreur : ' + r.err; return; }
    last = r; msg.className = 'paMsg';
    msg.textContent = !r.all.length ? 'Aucune correspondance.' : r.all.length + (r.all.length >= 1000 ? '+' : '') + ' correspondance(s)' + (st.flags.includes('g') ? '' : ' (sans le drapeau g : seulement la première)');
    const parts = []; let at = 0;
    r.all.forEach((m, k) => { if (m.i < at) return; parts.push(document.createTextNode(st.text.slice(at, m.i))); const mk = el('mark', m.s ? 'm' + (k % 2) : 'empty', m.s); mk.title = 'n° ' + (k + 1) + ' · position ' + m.i; parts.push(mk); at = m.i + m.s.length; });
    parts.push(document.createTextNode(st.text.slice(at)));
    viewEl.replaceChildren(...parts);
    repOut.textContent = r.out ?? '';
    drawSide();
  }
  const SIDES = [['explain', 'Explication'], ['matches', 'Détail'], ['cheat', 'Aide-mémoire'], ['saved', 'Mes motifs']];
  function drawSide() {
    sideTabs.replaceChildren(...SIDES.map(([k, t]) => { const b = el('button', 'btn px' + (st.side === k ? ' main' : ''), t); b.dataset.side = k; b.onclick = () => { st.side = k; save(); drawSide(); }; return b; }));
    const box = el('div', 'sysCard px');
    if (st.side === 'explain') {
      const ex = el('div', 'paExplain'); ex.id = 'pa_explain';
      if (!st.src) ex.append(el('span', 'hint', 'Écris un motif : chaque morceau sera expliqué ici.'));
      for (const t of explain(st.src)) { const r = el('div', 'paTok depth' + Math.min(3, t.depth)); r.append(el('code', '', t.t), el('span', '', t.d)); ex.append(r); }
      box.append(ex);
    } else if (st.side === 'matches') {
      const l = el('div', 'paList');
      if (!last.all.length) l.append(el('span', 'hint', 'Aucune correspondance.'));
      last.all.slice(0, 200).forEach((m, k) => {
        const c = el('div', 'paMatch'); c.translate = false; c.append(el('b', '', (k + 1) + '. « ' + m.s + ' »'), ' position ' + m.i);
        m.g.forEach((g, j) => { const name = m.n && Object.keys(m.n).find(n => m.n[n] === g); c.append(el('span', 'g', 'groupe ' + (j + 1) + (name ? ' (' + name + ')' : '') + ' : ' + (g === undefined ? '— (pas utilisé)' : '« ' + g + ' »'))); });
        l.append(c);
      });
      box.append(l);
    } else if (st.side === 'cheat') {
      const ch = el('div', 'paCheat');
      for (const [t, d] of CHEAT) { const b = el('button'); b.append(el('b', '', t), d); b.title = 'Insérer dans le motif'; b.onclick = () => { const s = re.selectionStart ?? re.value.length, e = re.selectionEnd ?? s, ins = t.replace('…', ''); re.value = re.value.slice(0, s) + ins + re.value.slice(e); re.focus(); re.selectionStart = re.selectionEnd = s + (t.includes('…') ? t.indexOf('…') : ins.length); re.oninput(); }; ch.append(b); }
      box.append(ch, el('p', 'hint', 'Touche : insère à l\'endroit du curseur.'), el('span', 'label', 'Exemples'));
      const exs = el('div', 'paSaved');
      for (const [n, s, f, t] of EXAMPLES) { const b = el('button', 'btn px', n); b.onclick = () => load({src: s, flags: f, text: t}); exs.append(b); }
      box.append(exs);
    } else {
      const sv = el('div', 'paSaved'), name = el('input', 'f'), add = el('button', 'btn px main', 'Garder ce motif');
      name.placeholder = 'nom du motif';
      add.onclick = () => { const n = name.value.trim() || st.src.slice(0, 30); if (!st.src) return; st.saved = [{n, src: st.src, flags: st.flags, text: st.text, rep: st.rep}, ...st.saved.filter(x => x.n !== n)].slice(0, 100); save(); drawSide(); toast('Motif gardé'); };
      sv.append(name, add);
      if (!st.saved.length) sv.append(el('p', 'hint', 'Tes motifs gardés apparaîtront ici, avec leur texte d\'essai.'));
      for (const s of st.saved) {
        const r = el('div', 'row'), o = el('button', 'btn px', s.n), x = el('button', 'btn px', '×');
        o.title = '/' + s.src + '/' + s.flags; o.onclick = () => load(s); x.title = 'Supprimer';
        x.onclick = async () => { if (await ctx.host.confirm('Supprimer le motif « ' + s.n + ' » ?')) { st.saved = st.saved.filter(y => y !== s); save(); drawSide(); } };
        r.append(o, x); sv.append(r);
      }
      box.append(sv);
    }
    sideBody.replaceChildren(box);
  }
  function load(s) {
    st.src = s.src; st.flags = s.flags; if (s.text != null) st.text = s.text; if (s.rep != null) st.rep = s.rep;
    re.value = st.src; text.value = st.text; rep.value = st.rep;
    for (const b of flagsEl.children) b.classList.toggle('main', st.flags.includes(b.dataset.flag));
    save(); update();
  }
  // vérification : l'explication découpe bien un motif courant
  { const e = explain('(?<a>\\d{2,4})+?[^x]|\\bfin$'); console.assert(e.length === 8 && e[7].t === '$' && e[1].t === '\\d{2,4}' && /de 2 à 4 fois/.test(e[1].d) && /le moins de fois possible/.test(e[2].d) && /PAS/.test(e[3].d), 'pattern : explication'); }
  update();
}
