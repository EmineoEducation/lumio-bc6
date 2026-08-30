// ==============================================================
//  LIVRAISON F44 - CONVERGENCE DE L'ECHANGE SLACK
//  DEPOT       : EmineoEducation/lumio-bc6
//  TITRE       : MSMC     BLOC : bc6
//  CLE REDIS   : msmc:bc6
//  DESTINATION : app-slack.jsx   (racine du depot, ecrase l'existant)
//  DATE        : 30/08/2026
// ==============================================================
// ══════════════════════════════════════════════════════════════
//  SLACK APP — générique · persona dynamique (cfg.commanditaire)
//  PAC · Parcours Activation Compétences · Éminéo
//  Ne contient aucun contenu figé par affaire : tout est lu depuis
//  window.LUMIO_DATA (D) et window.PAC_CONFIG / window.PASS_CONFIG (cfg).
// ══════════════════════════════════════════════════════════════
const { useState: useSlackState, useEffect: useSlackEffect, useRef: useSlackRef } = React;

// ══════════════════════════════════════════════════════════════
// F39 · RÉSEAU INSTABLE
// Les étudiants travaillent sur leurs propres machines, en partage de
// connexion mobile. Sur un réseau qui tombe une seconde, `fetch` échoue
// franchement : la requête n'atteint jamais le serveur, elle n'apparaît
// donc dans aucun journal côté Vercel, et le personnage se taisait — ce
// qui, du poste de l'encadrant sur une connexion stable, était
// impossible à reproduire.
// Correctif : trois tentatives espacées avant d'abandonner. Une coupure
// d'une ou deux secondes devient invisible pour l'étudiant·e.
// Bloc générique et idempotent.
// ══════════════════════════════════════════════════════════════
if (!window.PAC_FETCH) {
  window.PAC_FETCH = async function (url, options, essais) {
    const max = essais == null ? 3 : essais;
    let derniere = null;
    for (let i = 0; i < max; i++) {
      try {
        return await fetch(url, options);
      } catch (e) {
        derniere = e;
        console.warn('PAC_FETCH — tentative ' + (i + 1) + '/' + max + ' échouée', e);
        if (i < max - 1) await new Promise(r => setTimeout(r, 800 * (i + 1)));
      }
    }
    throw derniere;
  };
}


// ══════════════════════════════════════════════════════════════
// F33 · PAC_PERSIST — sauvegarde incrémentale de l'état applicatif
// ──────────────────────────────────────────────────────────────
// Avant F33, seuls l'identité et le timerStart survivaient à un reload :
// la conversation Slack et la saisie du livrable vivaient uniquement en
// state React et disparaissaient au moindre rechargement.
// Ce helper écrit des tranches nommées dans la session Redis existante.
// api/session.js FUSIONNE l'objet reçu avec l'existant : envoyer une
// tranche seule n'écrase donc jamais studentName / timerStart / phase.
// Bloc générique et idempotent — défini par le premier fichier chargé
// (app-slack.jsx), réutilisé tel quel par app-livrable.jsx.
// ══════════════════════════════════════════════════════════════
if (!window.PAC_PERSIST) {
  window.PAC_PERSIST = (function () {
    var timers = {};
    var pending = null;
    var state = { ok: null, lastSaved: null, lastError: null };
    var listeners = [];

    var sid = function () {
      try { return localStorage.getItem('lumio_sid') || null; } catch (e) { return null; }
    };
    var notify = function () { listeners.forEach(function (f) { try { f(state); } catch (e) {} }); };

    // Appel réseau direct plutôt que window.LUMIO_SESSION : le helper de
    // main.jsx avale les erreurs dans un console.warn et renvoie null quoi
    // qu'il arrive. Or un échec de sauvegarde silencieux est exactement le
    // scénario qui coûte des heures de travail — il doit être visible.
    var write = function (slot, value) {
      var id = sid();
      if (!id) return Promise.resolve(false);
      var payload = {}; payload[slot] = value;
      return window.PAC_FETCH('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, session: payload })
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        state.ok = true; state.lastSaved = Date.now(); state.lastError = null;
        notify(); return true;
      }).catch(function (e) {
        state.ok = false; state.lastError = String(e && e.message || e);
        console.warn('PAC_PERSIST — échec de sauvegarde (' + slot + ') :', e);
        notify(); return false;
      });
    };

    return {
      sid: sid,
      status: function () { return state; },
      onChange: function (f) {
        listeners.push(f);
        return function () { listeners = listeners.filter(function (x) { return x !== f; }); };
      },
      // Écriture différée : une seule requête après 1,2 s sans frappe.
      save: function (slot, value, delay) {
        if (!sid()) return;
        clearTimeout(timers[slot]);
        timers[slot] = setTimeout(function () { write(slot, value); }, delay == null ? 1200 : delay);
      },
      // Écriture immédiate : fermeture d'onglet, remise du livrable.
      flush: function (slot, value) {
        clearTimeout(timers[slot]);
        return write(slot, value);
      },
      // Lecture : un seul GET partagé par toutes les apps au montage.
      load: function () {
        var id = sid();
        if (!id) return Promise.resolve(null);
        if (!pending) {
          pending = window.PAC_FETCH('/api/session?id=' + encodeURIComponent(id))
            .then(function (r) { return r.status === 404 ? null : r.json(); })
            .then(function (j) { return (j && j.session) || null; })
            .catch(function () { return null; });
        }
        return pending;
      }
    };
  })();
}

// ─── Casting Lumio Health — repères visuels de repli ─────────
// Utilisé seulement si D.personnages ne fournit pas déjà avatar/couleur/rôle
// pour la personne concernée. N'importe quel nom absent de cette table
// reçoit des initiales et une couleur neutre générées automatiquement.
const LUMIO_CAST = {
  'Théo Marczak':   { avatar: 'TM', color: '#5c2d8f', role: 'CEO fondateur' },
  'Sonia Ferracci': { avatar: 'SF', color: '#c4420f', role: 'Directrice Marketing' },
  'Camille Ott':    { avatar: 'CO', color: '#0a7a6e', role: 'Responsable partenariats B2B' },
  'Jakob Rein':     { avatar: 'JR', color: '#1b3a6b', role: 'Partner, Northgate Capital' },
  'Yassine Morel':  { avatar: 'YM', color: '#2d6a4f', role: 'Content Manager' },
  'Isabelle Kwan':  { avatar: 'IK', color: '#7a3b46', role: 'Directrice des Ressources Humaines' }
};

function slackSlugify(name) {
  return (name || 'contact').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'contact';
}

function slackAutoInitials(name) {
  return (name || '??').split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase() || '??';
}

// ─── Construction du prompt d'évaluation (dialogue courant) ──
function buildSlackEvalPrompt(primaryName, role, cfg, D) {
  const contexte = (D.contexte && D.contexte.body) || '';
  const brief = (D.briefEmail && D.briefEmail.body) || '';
  const titre = cfg.titre || cfg.epreuve || 'la mission en cours';
  return `Tu es ${primaryName}, ${role} chez Lumio Health.

Tu accompagnes ou tu as mandaté un·e consultant·e externe sur la mission suivante : "${titre}".

Contexte factuel dont tu disposes — n'invente aucun fait qui n'y figure pas :
"""
${contexte}
"""

Le cadrage de la mission, tel qu'il a été transmis :
"""
${brief}
"""

Ta posture dans cet échange Slack :
- Tu évalues les hypothèses du/de la consultant·e sans jamais donner la réponse à sa place.
- Tu relances par une question précise quand une hypothèse manque de méthode, de preuve ou de chiffres issus du dossier.
- Tu gardes le ton et les priorités de ton rôle (${role}) — jamais un ton de coach ou de professeur.
- Si le/la consultant·e ne s'appuie sur aucune source du dossier, tu le relèves directement.

Format de réponse strict :
- 2 à 3 messages courts séparés par "---SPLIT---"
- Chaque message : 1 à 3 phrases
- Termine par une question précise ou une demande concrète
- Maximum 150 mots cumulés
- N'écris jamais "Bonjour" ni "Merci" en ouverture. Entre directement dans le sujet.`;
}

// ─── Prompt de réaction au livrable soumis ────────────────────
function buildSlackLivrablePrompt(primaryName, role, cfg) {
  const titre = cfg.titre || cfg.epreuve || 'la mission';
  return `Tu es ${primaryName}, ${role} chez Lumio Health. Le/la consultant·e externe vient de soumettre sa production pour "${titre}". Tu la parcours rapidement et tu réagis en Slack : dis si ça tient la route par rapport à ce que tu attendais, ce qui te convainc ou t'interroge encore, puis termine par la question exigeante que tu poserais avant de la valider. 2 à 3 messages séparés par "---SPLIT---", 120 mots maximum cumulés. Ne commence jamais par "Bonjour" ou "Merci".`;
}

// ══════════════════════════════════════════════════════════════
// F35 · INTERLOCUTEURS MUETS
// Seule la persona commanditaire était branchée sur l'IA. Les autres
// personnages apparaissaient dans la liste des messages directs, certains
// invitaient même à leur écrire, mais ne pouvaient jamais répondre :
// l'étudiant·e attendait indéfiniment. Chacun répond désormais, dans son
// rôle, à partir des données du bloc.
// ══════════════════════════════════════════════════════════════
const buildSecondairePrompt = (nom, role, cfg) => {
  return `Tu es ${nom}${role ? ', ' + role : ''} chez Lumio Health.

Tu échanges en messagerie interne avec un·e consultant·e externe missionné·e sur ${cfg.titre || cfg.epreuve || 'la mission en cours'}. Tu n'es pas le commanditaire : tu es un collègue, une source de terrain. Tu réponds volontiers.

Règles de conduite, non négociables :
- Tu réponds TOUJOURS à la question posée, avec ce que tu sais de ton poste et de ton point de vue.
- Tu ne renvoies JAMAIS vers quelqu'un d'autre sans avoir d'abord donné ta propre réponse.
- Tu ne dis jamais que tu ne peux pas aider, ni que ce n'est pas ton sujet.
- Si tu ignores quelque chose, tu le dis franchement et tu expliques pourquoi.
- Tu ne demandes jamais d'attendre : tu donnes ta réponse maintenant.
- Tu parles depuis ton expérience concrète, avec des exemples, pas en généralités.
- Tu peux poser une question en retour, mais seulement après avoir répondu.

Style : messagerie interne. Phrases courtes, ton direct et humain, aucune formule de politesse.

Format : 2 à 3 messages courts séparés par "---SPLIT---". Chaque message 1 à 3 phrases. 150 mots cumulés maximum. Ne commence jamais par "Bonjour".`;
};

// ══════════════════════════════════════════════════════════════
// F40 · LE COMMANDITAIRE INVENTAIT LE LIVRABLE
// Observé en séance : à une étudiante qui signalait un bouton grisé,
// Sonia a répondu « ton livrable c'est la note en trois paragraphes
// qu'on a finalisée ensemble », puis lui a demandé de l'envoyer par mail.
// Rien de tout cela n'existe : le livrable de ce bloc est composé de
// compétences numérotées, saisies dans l'application Livrable, et aucun
// autre canal de remise n'est valable. Le prompt ne disait nulle part
// en quoi consiste le livrable — le modèle comblait le vide.
// Correctif : les faits sont injectés depuis PAC_CONFIG, avec interdiction
// d'improviser un format ou un canal de remise.
// ══════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
// F32 · FICHIER FANTÔME — carte des documents
// Le commanditaire évoquait des documents sans savoir où ils se
// trouvent dans l'interface. Quand l'étudiant·e répondait « je ne le
// trouve pas », le modèle improvisait un Drive, une pièce jointe ou un
// « je te le renvoie » — trois impasses. bc6 est le bloc le plus dense
// (dix pièces dans Aperçu), donc le plus exposé.
// La localisation réelle vient de window.LUMIO_DATA.docIndex (data.js).
// Générique — aucun contenu de bloc écrit ici.
// ══════════════════════════════════════════════════════════════
const buildDocMapBlock = () => {
  const D = window.LUMIO_DATA || {};
  const idx = D.docIndex || [];
  const lignes = idx.length
    ? idx.map(d => `- ${d.nom} → ${d.ou}`).join('\n')
    : "- (aucun index fourni : ne cite alors AUCUN document par son emplacement)";
  const prec = (D.docPrecisions || []).length
    ? '\n\nPrécisions :\n' + D.docPrecisions.map(p => '- ' + p).join('\n')
    : '';
  return `

═══ LOCALISATION DES DOCUMENTS — RÈGLE ABSOLUE ═══

Tous les documents sont DÉJÀ installés sur le poste de mission de la personne. Rien ne reste à envoyer.

${lignes}${prec}

Règles non négociables :
1. Si on te demande où trouver un document, tu donnes sa localisation exacte telle qu'écrite ci-dessus, en UNE phrase, puis tu relances immédiatement sur le fond.
2. Tu ne proposes JAMAIS d'envoyer, de renvoyer, de transférer, de partager, de joindre ou de déposer un fichier. Tu n'en as pas la possibilité — tout est déjà là.
3. Tu ne mentionnes JAMAIS de Drive, Dropbox, Notion, SharePoint, WeTransfer, pièce jointe, lien de téléchargement, ni aucun outil qui n'existe pas sur ce poste.
4. Tu ne cites JAMAIS un document absent de la liste ci-dessus. Si la personne réclame une pièce qui n'existe pas, tu le dis franchement : elle n'est pas au dossier, et c'est à elle de traiter ce manque dans sa proposition.
5. Tu ne décris pas le contenu d'un document à la place de la personne. Tu dis où il est ; elle le lit.`;
};

// ══════════════════════════════════════════════════════════════
//  F44 · CONVERGENCE DE L'ÉCHANGE SLACK
//
//  Symptôme : le dialogue avec le commanditaire ne se terminait
//  jamais. Trois causes cumulées, toutes corrigées ici.
//
//  (a) Le prompt de persona impose « termine par une question » à
//      CHAQUE tour, sans aucune condition de sortie. Le personnage
//      avait l'ordre de relancer indéfiniment, et jamais
//      l'autorisation de conclure.
//      → window.PAC_CONV() ci-dessous ajoute une doctrine de
//        convergence par paliers, branchée sur le compteur réel
//        d'échanges (window.LUMIO_DATA._slackExchanges).
//
//  (b) L'historique transmis était borné à slice(-16) — soit 16
//      MESSAGES, pas 16 échanges. Comme chaque réponse est éclatée
//      en 2 ou 3 fragments par ---SPLIT---, la fenêtre réelle
//      tombait à 4 ou 5 échanges : au-delà, le personnage ne voyait
//      plus le début de la conversation et reposait ses questions.
//      → porté à slice(-40), soit environ 12 échanges.
//
//  (c) Les textes d'interface promettaient qu'un échange Slack
//      « débloque la suite » ou « débloque l'app Livrable ». C'est
//      faux depuis toujours : le Livrable n'a jamais été verrouillé
//      (le compteur pilote uniquement une animation du Dock et une
//      pastille). L'apprenant relançait donc en attendant une porte
//      qui n'existe pas.
//      → textes neutralisés à l'exécution, juste en dessous.
//
//  Ce bloc est STRICTEMENT IDENTIQUE dans les 18 dépôts.
// ══════════════════════════════════════════════════════════════

// ── (c) Neutralisation des promesses de déverrouillage ────────
// Réécrit à la volée les chaînes fautives de LUMIO_DATA et de
// PAC_CONFIG, avant tout rendu. N'altère AUCUN contenu de fiction :
// « débloquer les 6 M€ » (Northgate, CDRH-bc2) est préservé, les
// motifs ci-dessous ne visent que « la suite » et « le Livrable ».
(function () {
  if (window.__PAC_F44_TEXTES) return;
  window.__PAC_F44_TEXTES = true;
  var MOTIFS = [
    [/Sa réaction débloque la suite\./g, "Sa réaction t'aide à trancher — le Livrable, lui, est ouvert dès maintenant."],
    [/Sa réaction débloque la suite/g, "Sa réaction t'aide à trancher"],
    [/\s*—?\s*\d+\s*échanges?\s+débloquent?\s+l['’]app\s+Livrable\.?/g, ""],
    [/\s*\(Slack\)\s*pour\s+débloquer\s+le\s+Livrable/g, " (Slack)"],
    [/\s*(?:pour|afin\s+de)\s+débloquer\s+le\s+Livrable/g, ""],
    [/débloquent?\s+l['’]app\s+Livrable/g, "font avancer votre analyse"]
  ];
  var corrige = function (s) {
    if (s.indexOf('ébloqu') === -1) return s;
    for (var i = 0; i < MOTIFS.length; i++) s = s.replace(MOTIFS[i][0], MOTIFS[i][1]);
    return s;
  };
  var vus = (typeof WeakSet === 'function') ? new WeakSet() : null;
  var parcours = function (n, prof) {
    if (!n || prof > 12 || typeof n !== 'object') return;
    if (vus) { if (vus.has(n)) return; vus.add(n); }
    var cles = Object.keys(n);
    for (var i = 0; i < cles.length; i++) {
      var k = cles[i], v = n[k];
      if (typeof v === 'string') { var c = corrige(v); if (c !== v) n[k] = c; }
      else if (v && typeof v === 'object') parcours(v, prof + 1);
    }
  };
  try { parcours(window.LUMIO_DATA, 0); } catch (e) { console.warn('F44 textes — LUMIO_DATA', e); }
  try { parcours(window.PAC_CONFIG, 0); } catch (e) { console.warn('F44 textes — PAC_CONFIG', e); }
  try { if (window.PASS_CONFIG && window.PASS_CONFIG !== window.PAC_CONFIG) parcours(window.PASS_CONFIG, 0); } catch (e) {}
})();

// ── (a) Doctrine de convergence injectée dans le prompt système ──
// Renvoie une chaîne vide en cas d'anomalie : jamais bloquant pour
// l'appel /api/chat.
window.PAC_CONV = function () {
  try {
    var D = window.LUMIO_DATA || {};
    var n = D._slackExchanges || 0;
    var palier;
    if (D._livrableSubmitted) {
      palier = "Le livrable a déjà été soumis. Tu ne relances plus sur le fond : tu réagis à ce qui t'a été remis, en deux phrases, et tu clos l'échange.";
    } else if (n <= 3) {
      palier = "Phase d'ouverture. Tu creuses, tu contestes, tu peux terminer par une question.";
    } else if (n <= 6) {
      palier = "Phase de resserrage. UNE question maximum, et elle porte sur une rubrique précise du livrable, pas sur le contexte général. Tu commences à renvoyer la personne vers sa production.";
    } else {
      palier = "Phase de clôture. Tu NE POSES PLUS DE QUESTION. Tu résumes en deux phrases ce que tu retiens de ses positions, tu nommes le point qui reste le plus faible, et tu la renvoies explicitement au Livrable — dans tes mots : « là tu as de quoi écrire, ouvre le Livrable et pose ça ». Si elle t'écrit encore après ça, tu réponds en une seule phrase et tu la renvoies au Livrable.";
    }
    return "\n\n═══ CONVERGENCE DE L'ÉCHANGE — RÈGLE ABSOLUE ═══\n\n"
      + "Cet échange a un but : que la personne reparte produire. Il n'a pas vocation à durer.\n\n"
      + "Échanges déjà eus avec elle : " + n + ".\n"
      + palier + "\n\n"
      + "Règles non négociables :\n"
      + "1. RIEN N'EST VERROUILLÉ. Le Livrable est accessible depuis la première minute. Tu ne dis JAMAIS qu'un échange, un message ou une validation « débloque », « ouvre », « donne accès à » ou « autorise » quoi que ce soit. Si la personne croit devoir t'écrire pour ouvrir le Livrable, tu la détrompes en une phrase et tu l'y envoies.\n"
      + "2. Tu ne redemandes jamais une information qu'elle t'a déjà donnée. Si tu ne la retrouves pas dans l'historique, considère qu'elle a été donnée et passe à la suite.\n"
      + "3. Si tu t'apprêtes à reformuler une relance que tu as déjà faite, ne la fais pas : conclus à la place.\n"
      + "4. Si la personne pose deux fois la même question, c'est que ta réponse précédente n'était pas exploitable. Réponds franchement cette fois, même si cela revient à donner un élément de méthode.\n"
      + "5. Tu ne réclames jamais une pièce, un chiffre ou un document dont elle ne dispose pas. Tout ce qui existe est déjà installé sur son poste : tu ne proposes jamais d'envoyer, de renvoyer, de transférer ou de partager un fichier, et tu ne mentionnes aucun outil externe (Drive, Notion, WeTransfer, pièce jointe).\n"
      + "6. Si elle annonce qu'elle part rédiger, tu ne la retiens pas : tu valides et tu coupes court.";
  } catch (e) {
    console.warn('PAC_CONV', e);
    return '';
  }
};

const buildLivrableFactsBlock = () => {
  const cfg = window.PAC_CONFIG || window.PASS_CONFIG || {};
  const comps = cfg.competences || [];
  const lignes = comps.length
    ? comps.map(c => `- ${c.code} : ${c.label}${c.min ? ' (' + c.min + ' mots minimum)' : ''}`).join('\n')
    : '- (structure non fournie : ne décris alors JAMAIS le contenu du livrable)';
  return `

═══ LE LIVRABLE — FAITS, RÈGLE ABSOLUE ═══

Le livrable attendu se remplit dans l'application « Livrable » du poste de la personne. Il est composé des rubriques suivantes :

${lignes}

Les nombres de mots indiqués sont des REPÈRES, pas des conditions : depuis F42, une copie plus courte peut être soumise après confirmation. Le bouton n'est grisé que si une rubrique est vide ou quasi vide (moins de quinze mots). Un bouton grisé ne signale jamais une panne.

Règles non négociables :
1. Tu ne décris JAMAIS le livrable autrement que par les rubriques ci-dessus. Tu n'inventes ni format, ni nombre de paragraphes, ni nombre de sources.
2. Tu ne dis JAMAIS avoir validé, relu ou finalisé quoi que ce soit « ensemble ». Tu n'as rien reçu tant que le livrable n'a pas été soumis.
3. Tu ne proposes JAMAIS un autre canal de remise : ni mail, ni copier-coller, ni pièce jointe, ni message. La remise se fait uniquement par l'application Livrable. Aucune autre voie ne sera évaluée.
4. Si on te signale un problème technique (bouton grisé, page qui ne répond pas, message d'erreur), tu réponds en une phrase que ce n'est pas de ton ressort et qu'il faut voir avec le référent de campus, puis tu reviens au fond. Tu ne proposes aucun contournement.
5. Si on te demande de confirmer qu'un travail est « bon » alors qu'il ne t'a pas été soumis, tu dis que tu ne l'as pas encore reçu.`;
};

function SlackApp({ openChannel }) {
  const D = window.LUMIO_DATA;
  const cfg = window.PAC_CONFIG || window.PASS_CONFIG || {};

  // ── Repères visuels : D.personnages (si présent) prime sur LUMIO_CAST ──
  const personnagesData = D.personnages || {};
  const overrides = {};
  Object.keys(personnagesData).forEach(k => {
    const p = personnagesData[k];
    if (p && p.nom) overrides[p.nom] = { avatar: p.avatar, color: p.couleur, role: p.role };
  });
  const castOf = (name) => overrides[name] || LUMIO_CAST[name] || {
    avatar: slackAutoInitials(name), color: '#5b6b85', role: ''
  };

  const slackSeed = D.slackMessages || {};
  const primaryName = cfg.commanditaire
    || (slackSeed.initial && slackSeed.initial[0] && slackSeed.initial[0].from)
    || 'Commanditaire';
  const primaryId = slackSlugify(primaryName);
  const primaryRole = castOf(primaryName).role || 'commanditaire de la mission';
  const primaryFirst = primaryName.split(' ')[0];

  // ── DM list construite depuis les personnes réellement citées dans D.slackMessages ──
  const seenNames = [];
  const pushName = (n) => { if (n && seenNames.indexOf(n) === -1) seenNames.push(n); };
  pushName(primaryName);
  (slackSeed.initial || []).forEach(m => pushName(m.from));
  (slackSeed.delayed || []).forEach(m => pushName(m.from));

  const dms = seenNames.map(name => {
    const info = castOf(name);
    return { id: slackSlugify(name), name, avatar: info.avatar, color: info.color, status: name === primaryName ? 'online' : 'away' };
  });

  const channels = [
    { id: 'general', name: 'général', type: 'channel', members: 12 }
  ];

  const [unreads, setUnreads] = useSlackState({});
  const [activeId, setActiveId] = useSlackState(openChannel || primaryId);
  const activeIdRef = useSlackRef(openChannel || primaryId);
  const setActive = (id) => { activeIdRef.current = id; setActiveId(id); };
  const [chatHistory, setChatHistory] = useSlackState({});
  const [draft, setDraft] = useSlackState('');
  const [sending, setSending] = useSlackState(false);
  const [exchangeCount, setExchangeCountLocal] = useSlackState(0);
  const scrollRef = useSlackRef(null);

  const studentName = (D && D.student && D.student.name) || 'Lou Bertrand';

  // ══ F33 · Restauration puis initialisation ══════════════════
  // Le seed n'est plus posé d'emblée : on lit d'abord la session, et
  // s'il existe une conversation sauvegardée, elle prime.
  // `hydrated` interdit toute écriture tant que la lecture n'a pas eu
  // lieu ; `restored` indique qu'on est reparti d'une session existante
  // (il sert à ne pas rejouer les messages différés, voir plus bas).
  const [hydrated, setHydrated] = useSlackState(false);
  const [restored, setRestored] = useSlackState(false);

  const buildSeed = () => {
    const seed = {};
    seed[primaryId] = (slackSeed.initial || []).map(m => {
      const info = castOf(m.from);
      return { from: m.from, avatar: info.avatar, color: info.color, time: m.time || '', text: m.text };
    });
    seed.general = [
      { from: 'lumio-bot', avatar: '🤖', color: '#9a9ea8', time: '08:00', text: '☀️ Bonjour à tous · 18 personnes connectées ce matin' }
    ];
    return seed;
  };

  useSlackEffect(() => {
    let annule = false;
    window.PAC_PERSIST.load().then(session => {
      if (annule) return;
      const s = (session && session.slack) || null;
      if (s && s.history && Object.keys(s.history).length) {
        setChatHistory(s.history);
        if (s.unreads) setUnreads(s.unreads);
        const n = s.exchangeCount || 0;
        setExchangeCountLocal(n);
        setRestored(true);
        // Rejoue le compteur pour que desktop.jsx redéverrouille le
        // livrable : l'état `livrableUnlocked` en dépend et n'est pas
        // persisté de son côté.
        if (n > 0 && window.__onSlackExchange) {
          try { window.__onSlackExchange(n); } catch (e) {}
        }
      } else {
        setChatHistory(buildSeed());
      }
      setHydrated(true);
    });
    return () => { annule = true; };
  }, []);

  // Sauvegarde différée à chaque évolution du fil.
  useSlackEffect(() => {
    if (!hydrated) return;
    window.PAC_PERSIST.save('slack', {
      history: chatHistory, unreads, exchangeCount, savedAt: Date.now()
    });
  }, [hydrated, chatHistory, unreads, exchangeCount]);

  // Filet : écriture immédiate si l'onglet se ferme.
  useSlackEffect(() => {
    const bye = () => {
      if (!hydrated) return;
      window.PAC_PERSIST.flush('slack', {
        history: chatHistory, unreads, exchangeCount, savedAt: Date.now()
      });
    };
    window.addEventListener('beforeunload', bye);
    return () => window.removeEventListener('beforeunload', bye);
  }, [hydrated, chatHistory, unreads, exchangeCount]);
  // ══ fin F33 ═════════════════════════════════════════════════

  // ── Révélation différée des messages "delayed" ──
  // F33 · Ces messages arrivent 8 à 30 s après le montage. Sur une
  // session restaurée ils sont déjà dans l'historique : sans le garde-fou
  // `restored`, un simple rechargement les ferait apparaître en double.
  // L'effet n'est donc armé qu'une fois la session lue, et seulement
  // lorsqu'on repart d'un seed neuf.
  useSlackEffect(() => {
    if (!hydrated || restored) return;
    const list = slackSeed.delayed || [];
    const timers = list.map((m, i) => {
      const match = /(\d+)\s*min/i.exec(m.time || '');
      const mins = match ? parseInt(match[1], 10) : (i + 1) * 12;
      const realDelayMs = Math.min(8000 + mins * 400, 30000);
      return setTimeout(() => {
        const chanId = slackSlugify(m.from);
        const info = castOf(m.from);
        setChatHistory(h => ({ ...h, [chanId]: [...(h[chanId] || []), { from: m.from, avatar: info.avatar, color: info.color, time: m.time || '', text: m.text }] }));
        if (activeIdRef.current !== chanId) setUnreads(u => ({ ...u, [chanId]: (u[chanId] || 0) + 1 }));
      }, realDelayMs);
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, [hydrated, restored]);

  useSlackEffect(() => {
    if (openChannel) { setActive(openChannel); setUnreads(u => ({ ...u, [openChannel]: 0 })); }
  }, [openChannel]);

  // ── Alertes temps (émises par le bureau) → messages du commanditaire dans le fil ──
  useSlackEffect(() => {
    const info = castOf(primaryName);
    const nowT = () => { const t = new Date(); return `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`; };
    const toMsg = (text) => ({ from: primaryName, avatar: info.avatar, color: info.color, time: nowT(), text });
    // Rattrapage : alertes émises pendant que la fenêtre Slack était fermée
    setChatHistory(h => {
      const alerts = (window.LUMIO_DATA._timeAlerts || []).map(a => a.text);
      if (!alerts.length) return h;
      const cur = h[primaryId] || [];
      const known = {}; cur.forEach(m => { known[m.text] = true; });
      const add = alerts.filter(t => !known[t]).map(toMsg);
      return add.length ? { ...h, [primaryId]: [...cur, ...add] } : h;
    });
    const onAlert = (e) => {
      const text = (e.detail && e.detail.text) || '';
      if (!text) return;
      setChatHistory(h => {
        const cur = h[primaryId] || [];
        if (cur.some(m => m.text === text)) return h;
        return { ...h, [primaryId]: [...cur, toMsg(text)] };
      });
      if (activeIdRef.current !== primaryId) setUnreads(u => ({ ...u, [primaryId]: (u[primaryId] || 0) + 1 }));
    };
    window.addEventListener('pac:time-alert', onAlert);
    return () => window.removeEventListener('pac:time-alert', onAlert);
  }, []);


  useSlackEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, activeId, sending]);

  // ── Réaction de la persona commanditaire quand le livrable est soumis ──
  useSlackEffect(() => {
    window.__onSoniaLivrableReaction = async (sections) => {
      setActive(primaryId);
      setSending(true);
      const livrableResume = Object.entries(sections || {})
        .map(([code, text]) => `${code} : ${(text || '').substring(0, 300)}`)
        .join('\n\n');
      const prompt = `${buildSlackLivrablePrompt(primaryName, primaryRole, cfg)}\n\nProduction reçue :\n${livrableResume}`;
      const info = castOf(primaryName);
      try {
        const resp = await window.PAC_FETCH('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, messages: [{ role: 'user', content: prompt }] })
        });
        const data = await resp.json();
        const raw = data.content?.map(b => b.text || '').join('') || '';
        const replies = raw.split('---SPLIT---').map(s => s.trim()).filter(Boolean);
        let delay = 600;
        for (const reply of replies) {
          await new Promise(r => setTimeout(r, delay));
          const t = new Date();
          const tt = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
          setChatHistory(h => ({ ...h, [cible.id]: [...(h[cible.id] || []), { from: cible.name, avatar: info.avatar, color: info.color, time: tt, text: reply }] }));
          if (activeIdRef.current !== cible.id) setUnreads(u => ({ ...u, [cible.id]: (u[cible.id] || 0) + 1 }));
          delay = 1200 + reply.length * 8;
        }
      } catch (e) {
        setChatHistory(h => ({ ...h, [primaryId]: [...(h[primaryId] || []), { from: primaryName, avatar: info.avatar, color: info.color, time: 'maintenant', text: 'Bien reçu. J\'y reviens rapidement.' }] }));
        if (activeIdRef.current !== primaryId) setUnreads(u => ({ ...u, [primaryId]: (u[primaryId] || 0) + 1 }));
      } finally {
        setSending(false);
      }
    };
    return () => { window.__onSoniaLivrableReaction = null; };
  }, [chatHistory]);

  const isPrimary = activeId === primaryId;
  const messages = chatHistory[activeId] || [];

  const sendMessage = async () => {
    if (!draft.trim() || sending) return;
    const text = draft.trim();
    setDraft('');
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const studentInitial = (studentName.split(' ').map(w => w[0]).join('') || 'LB').substring(0, 2).toUpperCase();
    const userMsg = { from: studentName, avatar: studentInitial, color: '#1a2436', time, text, isMe: true };
    setChatHistory(h => ({ ...h, [activeId]: [...(h[activeId] || []), userMsg] }));

    // F35 · Tout interlocuteur répond, plus seulement le commanditaire.
    const cible = dms.find(d => d.id === activeId);
    if (!cible) return;
    const estCommanditaire = activeId === primaryId;
    const cibleRole = castOf(cible.name).role || '';
    const cibleFirst = cible.name.split(' ')[0];

    const newCount = exchangeCount + 1;
    setExchangeCountLocal(newCount);
    if (window.__onSlackExchange) window.__onSlackExchange(newCount);
    if (window.__onSlackSent) window.__onSlackSent();

    setSending(true);
    setTimeout(async () => {
      const info = castOf(cible.name);
      try {
        // F36 · L'historique complet du fil partait dans le prompt à chaque
        // message et gonflait sans limite : passé un certain volume, la
        // réponse dépassait la durée maximale de la fonction Vercel et
        // l'appel échouait. On ne transmet plus que les 16 derniers.
        const history = (chatHistory[activeId] || []).slice(-40).map(m =>
          `${m.isMe ? studentName.split(' ')[0] : cibleFirst}: ${m.text}`
        ).join('\n');
        const userPrompt = `${history}\n${studentName.split(' ')[0]}: ${text}\n\nRéponds maintenant en tant que ${cible.name} (2-3 messages courts séparés par ---SPLIT---).`;
        const resp = await window.PAC_FETCH('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 500,
            system: (estCommanditaire
              ? buildSlackEvalPrompt(primaryName, primaryRole, cfg, D) + (window.__pacSessionBrief ? window.__pacSessionBrief() : '')
              : buildSecondairePrompt(cible.name, cibleRole, cfg)) + buildDocMapBlock() + buildLivrableFactsBlock() + (window.PAC_CONV ? window.PAC_CONV() : ''),
            messages: [{ role: 'user', content: userPrompt }]
          })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        const raw = data.content?.map(b => b.text || '').join('') || '';
        const replies = raw.split('---SPLIT---').map(s => s.trim()).filter(Boolean);
        let delay = 800;
        for (const reply of replies) {
          await new Promise(r => setTimeout(r, delay));
          const t = new Date();
          const tt = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
          setChatHistory(h => ({ ...h, [cible.id]: [...(h[cible.id] || []), { from: cible.name, avatar: info.avatar, color: info.color, time: tt, text: reply }] }));
          if (activeIdRef.current !== cible.id) setUnreads(u => ({ ...u, [cible.id]: (u[cible.id] || 0) + 1 }));
          delay = 1400 + reply.length * 8;
        }
      } catch (e) {
        // F36 · Le texte de secours part désormais dans le bon fil, invite
        // explicitement à relancer, et l'erreur réelle est tracée.
        console.error('Slack · échec de réponse (' + activeId + ')', e);
        setChatHistory(h => ({ ...h, [cible.id]: [...(h[cible.id] || []), { from: cible.name, avatar: info.avatar, color: info.color, time, text: "Mon message n'est pas passé — renvoie-moi ta question, je suis là." }] }));
        if (activeIdRef.current !== cible.id) setUnreads(u => ({ ...u, [cible.id]: (u[cible.id] || 0) + 1 }));
      } finally {
        setSending(false);
      }
    }, 600);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const activeMeta = [...channels, ...dms].find(x => x.id === activeId);
  const primaryInfo = castOf(primaryName);

  return (
    <div style={slackStyles.app}>
      {/* Sidebar */}
      <div style={slackStyles.sidebar} className="scroll">
        <div style={slackStyles.workspace}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Lumio Health</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>● {studentName} · invité</div>
        </div>
        <div style={slackStyles.section}>
          <div style={slackStyles.sectionTitle}>▼ Canaux</div>
          {channels.map(c => (
            <div key={c.id} onClick={() => { setActive(c.id); setUnreads(u => ({ ...u, [c.id]: 0 })); }}
              style={{ ...slackStyles.item, ...(activeId === c.id ? slackStyles.itemActive : {}), ...(unreads[c.id] ? slackStyles.itemUnread : {}) }}>
              <span style={{ opacity: 0.7 }}>#</span>
              <span>{c.name}</span>
              {unreads[c.id] > 0 && <span style={slackStyles.badge}>{unreads[c.id]}</span>}
            </div>
          ))}
        </div>
        <div style={slackStyles.section}>
          <div style={slackStyles.sectionTitle}>▼ Messages directs</div>
          {dms.map(d => (
            <div key={d.id} onClick={() => { setActive(d.id); setUnreads(u => ({ ...u, [d.id]: 0 })); }}
              style={{ ...slackStyles.item, ...(activeId === d.id ? slackStyles.itemActive : {}), ...(unreads[d.id] ? slackStyles.itemUnread : {}) }}>
              <span style={{ ...slackStyles.statusDot, background: d.status === 'online' ? '#2eb67d' : '#9a9ea8' }} />
              <span>{d.name}</span>
              {unreads[d.id] > 0 && <span style={slackStyles.badge}>{unreads[d.id]}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Zone principale */}
      <div style={slackStyles.main}>
        <div style={slackStyles.chatHead}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
              {activeMeta?.type === 'channel' ? '# ' : ''}{activeMeta?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>
              {activeMeta?.type === 'channel'
                ? `${activeMeta.members} membres`
                : (activeMeta?.status === 'online' ? '● En ligne' : '○ Inactif')}
            </div>
          </div>
        </div>

        <div ref={scrollRef} style={slackStyles.chatBody} className="scroll">
          {messages.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-faint)' }}>
              Début de la conversation avec <strong>{activeMeta?.name}</strong>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={slackStyles.message}>
              <div style={{ ...slackStyles.msgAvatar, background: m.color }}>{m.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{m.from}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{m.time}</div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 1, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.text}</div>
              </div>
            </div>
          ))}
          {sending && dms.some(d => d.id === activeId) && (
            <div style={slackStyles.message}>
              {/* F35 · L'indicateur affichait toujours le commanditaire. */}
              <div style={{ ...slackStyles.msgAvatar, background: (dms.find(d => d.id === activeId) || primaryInfo).color }}>{(dms.find(d => d.id === activeId) || primaryInfo).avatar}</div>
              <div>
                <div style={{ display: 'flex', gap: 4, padding: '6px 0' }}>
                  <span style={slackStyles.typeDot} />
                  <span style={{ ...slackStyles.typeDot, animationDelay: '0.15s' }} />
                  <span style={{ ...slackStyles.typeDot, animationDelay: '0.3s' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{((dms.find(d => d.id === activeId) || {}).name || primaryName).split(' ')[0]} est en train d'écrire…</div>
              </div>
            </div>
          )}
        </div>

        <div style={slackStyles.composer}>
          <div style={slackStyles.composerInner}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={dms.some(d => d.id === activeId)
                ? `Écris à ${(dms.find(d => d.id === activeId) || {}).name.split(' ')[0]}…  (Entrée pour envoyer)`
                : `Message ${activeMeta?.type === 'channel' ? '#' + activeMeta?.name : activeMeta?.name}`}
              style={slackStyles.textarea}
              rows={2}
            />
            <div style={slackStyles.composerToolbar}>
              <div style={{ display: 'flex', gap: 8, color: 'var(--ink-faint)' }}>
                <span>𝐁</span><span>𝑰</span><span>🔗</span><span>📎</span><span>😊</span>
              </div>
              <button
                onClick={sendMessage}
                disabled={!draft.trim() || sending}
                style={{ ...slackStyles.sendBtn, ...(!draft.trim() || sending ? slackStyles.sendBtnDisabled : {}) }}>
                {sending ? '…' : '↑'}
              </button>
            </div>
          </div>
          {isPrimary && messages.filter(m => m.isMe).length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
              💬 {primaryFirst} attend votre première hypothèse. Envoyez votre lecture du dossier — sa réaction débloque l'accès au Livrable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const slackStyles = {
  app: { display: 'flex', height: '100%', background: 'white', overflow: 'hidden' },
  sidebar: { width: 220, flexShrink: 0, background: '#3f0e40', color: 'rgba(255,255,255,0.85)', padding: 0, overflowY: 'auto' },
  workspace: { padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  section: { padding: '12px 0' },
  sectionTitle: { padding: '4px 16px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.02em' },
  item: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', fontSize: 13.5, cursor: 'pointer' },
  itemActive: { background: 'rgba(255,255,255,0.15)', color: 'white' },
  itemUnread: { fontWeight: 700, color: 'white' },
  statusDot: { width: 8, height: 8, borderRadius: '50%' },
  badge: { marginLeft: 'auto', background: '#cd2553', color: 'white', fontSize: 10, fontWeight: 700, padding: '0 6px', borderRadius: 9, minWidth: 16, textAlign: 'center', height: 16, lineHeight: '16px' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', background: 'white', minWidth: 0, overflow: 'hidden' },
  chatHead: { padding: '10px 20px', borderBottom: '1px solid var(--rule)', flexShrink: 0 },
  chatBody: { flex: 1, padding: '12px 0', overflowY: 'auto', minHeight: 0 },
  message: { display: 'flex', gap: 12, padding: '6px 20px', alignItems: 'flex-start' },
  msgAvatar: { width: 32, height: 32, borderRadius: 4, color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  typeDot: { width: 6, height: 6, borderRadius: '50%', background: '#9a9ea8', display: 'inline-block', animation: 'typedot 1.2s infinite' },
  composer: { padding: '0 20px 12px', flexShrink: 0 },
  composerInner: { border: '1px solid rgba(20,24,36,0.18)', borderRadius: 8, background: 'white' },
  textarea: { width: '100%', border: 'none', outline: 'none', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', resize: 'none', color: 'var(--ink)' },
  composerToolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderTop: '1px solid var(--rule)' },
  sendBtn: { background: '#3f0e40', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  sendBtnDisabled: { background: 'rgba(20,24,36,0.1)', color: 'var(--ink-faint)', cursor: 'not-allowed' }
};

const slackKeyframes = document.createElement('style');
slackKeyframes.textContent = `@keyframes typedot { 0%,60%,100% { opacity: 0.2; } 30% { opacity: 1; } }`;
document.head.appendChild(slackKeyframes);

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.slack = SlackApp;
