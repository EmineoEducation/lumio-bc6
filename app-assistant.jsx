// ══════════════════════════════════════════════════════════════
//  JEFFERSON — Guide procédural PAC BC6 (PAC 4-III)
//  Opération PULSE · Stratégie créative Lumio Zen Series
//  Charte Éminéo : #0B2B2D #5DE298 #E3FFF0 #E89B77
//  Posture : dit quoi faire, quand, avec quel outil
// ══════════════════════════════════════════════════════════════
const { useState: useJState, useEffect: useJEffect, useRef: useJRef } = React;

function buildJeffersonPrompt(studentName, elapsedMin) {
  const prenom = (studentName || '').split(' ')[0] || 'vous';
  const timeLeft = Math.max(0, 210 - elapsedMin);

  let phase, objectifPhase, toolsPhase, nextAction;

  if (elapsedMin < 20) {
    phase = 'Acte 1 — Ancrage terrain (0–20 min)';
    objectifPhase = 'Entrer dans l\'univers. Comprendre l\'enjeu : Lumio Health, jusqu\'ici 100% B2B, lance la Lumio Zen Series pour le grand public. Sonia vous confie la stratégie créative. Identifier les acteurs. Pas de production encore — observation.';
    toolsPhase = 'Mail (brief Sonia — Opération PULSE), Finder > Fiche contexte Lumio, Finder > Portraits (Sonia / Yassine / Théo / Camille / Jakob), Slack (messages Sonia)';
    nextAction = 'Ouvrir Mail en premier. Lire le brief PULSE de Sonia entièrement. Puis ouvrir le brief créatif (DOC-01) et l\'étude insights cible (DOC-02) dans le PDF Viewer.';
  } else if (elapsedMin < 50) {
    phase = 'Acte 2 — Entrée dans l\'affaire (20–50 min)';
    objectifPhase = 'Les contraintes se précisent. Trois tensions à intégrer : l\'exigence d\'impact mesurable de Northgate (Jakob), les garde-fous identitaires des partenaires B2B (mutuelles/DRH), et la saturation des codes créatifs wellness (Calm, Headspace).';
    toolsPhase = 'PDF Viewer (DOC-03 benchmark créatif, DOC-04 exigences Northgate), Navigateur (veille Yassine), Mémos vocaux (Camille Ott — garde-fous B2B)';
    nextAction = 'Ouvrir le PDF Viewer. Lire le benchmark créatif (DOC-03) pour repérer les territoires saturés, puis l\'email de Théo relayant les exigences de Northgate (DOC-04). Notez ce qui est non négociable.';
  } else if (elapsedMin < 95) {
    phase = 'Acte 3 — Diagnostic (50–95 min)';
    objectifPhase = 'Construire votre position créative sur Slack avec Sonia. Elle teste vos hypothèses. 2 échanges débloquent l\'app Livrable. Consultez aussi le compte rendu transversal B2B/B2C dans Notes.';
    toolsPhase = 'Slack (DM Sonia Ferracci — prioritaire ; Yassine et Théo aussi disponibles), Notes (CR réunion B2B/B2C — DOC-05)';
    nextAction = 'Ouvrir Slack. Écrire à Sonia votre intuition créative : quel territoire pour la Zen Series, quel insight cible le légitime, et comment éviter le "déjà-vu Calm" ? Soyez direct — elle attend un parti-pris, pas un résumé du brief.';
  } else if (elapsedMin < 175) {
    phase = 'Acte 4 — Production (95–175 min)';
    objectifPhase = 'Rédiger la contribution individuelle BC6. 3 compétences RNCP : C.20-III (axes générateurs), C.21-III (idées originales + 1 format innovant), C.22-III (concrétisation = maquettes/scripts). Chaque axe doit être ancré dans un insight et porter un indicateur d\'impact.';
    toolsPhase = 'App Livrable (débloquée après 2 échanges Slack) — onglets C.20-III, C.21-III, C.22-III, Note réflexive. Moodboard partiel (DOC-06) à critiquer/réorienter pour C.22-III.';
    nextAction = 'Ouvrir l\'app Livrable dans le dock. Commencer par C.20-III (les axes générateurs) — tout en découle. Puis C.21-III (le portefeuille d\'idées, dont un format innovant). C.22-III en dernier (les maquettes concrètes).';
  } else {
    phase = 'Acte 5 — Réflexion (175–210 min)';
    objectifPhase = 'Note réflexive E7 obligatoire — minimum 100 mots. Retour sur vos choix créatifs. Ce que vous auriez fait différemment face à la contrainte "audace grand public vs sobriété medtech". Soumettre avant la fin du timer.';
    toolsPhase = 'App Livrable (onglet Réflexive + bouton Soumettre)';
    nextAction = 'Ouvrir l\'onglet "Réflexive" dans le Livrable. Écrire 100 mots minimum sur ce que cette affaire vous a appris sur la création de marque sous contrainte. Puis soumettre — ne laissez pas le timer expirer.';
  }

  return `Tu es Jefferson — le compagnon guide du PAC (Parcours d'Activation des Compétences) d'Éminéo, BC6 (PAC 4-III) — Développer la stratégie créative de la marque dans des supports et contenus originaux et innovants.

Tu es un lapin avec une montre. Tu sais toujours où on en est. Tu dis exactement quoi faire, avec quel outil, dans quel ordre. Tu ne poses pas de questions philosophiques. Tu guides.

CONTEXTE SESSION BC6 — Opération PULSE, Lumio Health :
- Étudiant·e : ${prenom}
- Temps écoulé : ${elapsedMin} min sur 210 min
- Temps restant : ${timeLeft} min
- Phase actuelle : ${phase}
- Mission : produire la stratégie créative E7 du lancement grand public de la Lumio Zen Series (axes, idées, concrétisation)

OBJECTIF DE CETTE PHASE :
${objectifPhase}

OUTILS À UTILISER MAINTENANT :
${toolsPhase}

PROCHAINE ACTION CONCRÈTE :
${nextAction}

TENSIONS CLÉS DU CAS BC6 :
- Lumio est une medtech crédible scientifiquement mais inconnue du grand public — il faut translater l'expertise en émotion sans perdre la rigueur
- Jakob Rein (Northgate) conditionne le second tour de table à des indicateurs d'impact explicites sur chaque proposition créative
- Les partenaires B2B (mutuelles, DRH) imposent des garde-fous : certains codes doivent rester compatibles avec un usage professionnel
- Le territoire wellness est saturé (Calm, Headspace, Withings) — deux axes ont déjà été rejetés en pré-comité car "trop génériques"
- La cible grand public (CSP+ 25-45 ans) est dans le déni du stress, méfiante envers la tech intrusive, et exige des preuves accessibles

COMPÉTENCES C.20-III À C.22-III (livrable) :
- C.20-III : Définir les axes générateurs — chaque axe ancré dans un insight cible + lié à la proposition de valeur + décliné sur ≥3 supports
- C.21-III : Générer des idées originales — portefeuille de 4 à 6 idées, dont AU MOINS UN format innovant (IA générative, immersif, interactif), chacune avec sa mécanique d'engagement
- C.22-III : Concrétiser — 2 idées transformées en maquettes narratives ou scripts détaillés, avec techniques narratives + design + interactivité
- Note réflexive E7 : 100 mots minimum — obligatoire pour la conformité E7

ERREURS À ÉVITER :
- C.20-III : ne pas proposer des axes interchangeables avec n'importe quelle marque wellness — ils doivent être ancrés dans un insight Lumio précis
- C.21-III : ne pas oublier le format innovant vérifiable — sans lui, la compétence est insuffisante
- C.21-III / C.20-III : ne jamais proposer une idée ou un axe sans indicateur d'impact (engagement, portée, mémorisation, conversion)
- C.22-III : ne pas se limiter à une description sommaire — le jury doit pouvoir visualiser ce que le public verra, lira ou vivra
- Toutes : ignorer la cohérence entre l'identité medtech et les codes créatifs choisis = rupture pénalisante

RÈGLES JEFFERSON :
- Réponses courtes et directes — 3 à 5 lignes maximum
- Toujours terminer par une action concrète avec l'outil exact à ouvrir
- Jamais de "peut-être" ou "vous pourriez" — le guide dit ce qu'il faut faire
- Si l'étudiant·e hésite entre deux options, donner la réponse, pas la question`;
}

function getElapsedMin() {
  try {
    const start = parseInt(sessionStorage.getItem('pac_start_time') || localStorage.getItem('pac_start_time') || '0');
    if (!start) return 0;
    return Math.floor((Date.now() - start) / 60000);
  } catch { return 0; }
}

function getPhaseIndex(elapsed) {
  if (elapsed < 20) return 0;
  if (elapsed < 50) return 1;
  if (elapsed < 95) return 2;
  if (elapsed < 175) return 3;
  return 4;
}

function now() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Composant Jefferson ──────────────────────────────────────
function JeffersonApp() {
  const [messages, setMessages] = useJState([]);
  const [draft, setDraft] = useJState('');
  const [sending, setSending] = useJState(false);
  const [open, setOpen] = useJState(false);
  const [unread, setUnread] = useJState(0);
  const [, force] = useJState(0);
  const scrollRef = useJRef(null);
  const inputRef = useJRef(null);

  useJEffect(() => { const t = setInterval(() => force(n => n + 1), 2000); return () => clearInterval(t); }, []);

  // Init
  useJEffect(() => {
    if (!window.LUMIO_TIMER_START) return;
    try {
      const saved = sessionStorage.getItem('pac_jefferson_history');
      if (saved) { setMessages(JSON.parse(saved)); return; }
    } catch {}

    const elapsed = getElapsedMin();
    const studentName = window.LUMIO_DATA?.student?.name || '';
    const prenom = (studentName || '').split(' ')[0] || '';

    const phase = getPhaseIndex(elapsed);
    const welcomeTexts = [
      `Bonjour ${prenom}. Je suis Jefferson — votre guide.\n\nCommencez par ouvrir Mail. Le brief PULSE de Sonia Ferracci est là. Lisez-le entièrement, puis ouvrez le brief créatif et l'étude insights dans le PDF Viewer.`,
      `Vous êtes en Acte 2. Les contraintes du lancement Zen Series se précisent.\n\nAvez-vous lu le benchmark créatif (DOC-03) et les exigences de Northgate relayées par Théo (DOC-04) dans le PDF Viewer ?\n\nSi oui : écoutez le mémo vocal de Camille Ott — elle pose les garde-fous B2B.`,
      `Acte 3 — il faut construire votre position créative sur Slack avec Sonia.\n\nOuvrez Slack. Proposez-lui un territoire pour la Zen Series et l'insight qui le légitime. Soyez direct — elle attend un parti-pris, pas un résumé du brief.`,
      `Acte 4 — l'app Livrable vous attend.\n\nOuvrez-la dans le dock. Commencez par C.20-III (les axes générateurs). Puis C.21-III : 4 à 6 idées dont au moins un format innovant. C.22-III en dernier : 2 maquettes concrètes. Chaque proposition doit porter un indicateur d'impact.`,
      `Acte 5 — relecture et note réflexive.\n\nOuvrez l'onglet Réflexive dans le Livrable. 100 mots minimum — obligatoire pour E7. Puis soumettre avant la fin du timer.`
    ];
    setMessages([{ role: 'assistant', text: welcomeTexts[phase], time: now() }]);
    if (!open) setUnread(u => u + 1);
  }, [window.LUMIO_TIMER_START]);

  useJEffect(() => {
    try { sessionStorage.setItem('pac_jefferson_history', JSON.stringify(messages)); } catch {}
  }, [messages]);

  useJEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  useJEffect(() => {
    if (!open && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === 'assistant') setUnread(u => u + 1);
    }
  }, [messages]);

  useJEffect(() => {
    if (open) { setUnread(0); if (inputRef.current) inputRef.current.focus(); }
  }, [open]);

  const send = async (text) => {
    const msg = (text || draft).trim();
    if (!msg || sending) return;
    setDraft('');
    const userMsg = { role: 'user', text: msg, time: now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setSending(true);

    try {
      const apiHistory = next.map(m => ({ role: m.role, content: m.text }));
      const studentName = window.LUMIO_DATA?.student?.name || '';
      const elapsed = getElapsedMin();

      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system: buildJeffersonPrompt(studentName, elapsed),
          messages: apiHistory
        })
      });
      if (!resp.ok) throw new Error('API ' + resp.status);
      const data = await resp.json();
      const reply = (Array.isArray(data.content) && data.content[0]?.text)
        ? data.content[0].text
        : 'Jefferson ne peut pas répondre — l\'API est indisponible. Réessayez.';
      setMessages(h => [...h, { role: 'assistant', text: reply, time: now() }]);
      if (!open) setUnread(u => u + 1);
    } catch (err) {
      setMessages(h => [...h, { role: 'assistant', text: 'Connexion impossible. Réessayez dans quelques secondes.', time: now() }]);
    }
    setSending(false);
  };

  const quickActions = [
    { label: 'Où j\'en suis ?', action: () => send('Où j\'en suis dans la session ?') },
    { label: 'Quoi faire maintenant ?', action: () => send('Que dois-je faire maintenant ?') },
    { label: 'C.20-III — aide', action: () => send('Comment aborder C.20-III, les axes générateurs ? Je ne sais pas par où commencer.') },
    { label: 'Tensions du cas', action: () => send('Rappelle-moi les tensions clés du cas que je dois traiter.') }
  ];

  // ── Rendu dock + fenêtre ──────────────────────────────────────
  const phaseLabels = ['Acte 1 · Ancrage', 'Acte 2 · Affaire', 'Acte 3 · Diagnostic', 'Acte 4 · Production', 'Acte 5 · Réflexion'];
  const suggestionsByPhase = [
    ['Par où commencer ?', 'Quel est l\'objectif de la mission ?', 'Quels outils utiliser ?'],
    ['J\'ai lu le brief, et après ?', 'Quels insights cibles retenir ?', 'Quelles contraintes ne pas oublier ?'],
    ['Comment proposer un territoire à Sonia ?', 'Comment éviter le "déjà-vu Calm" ?', 'Quel parti-pris créatif adopter ?'],
    ['Comment formuler un axe générateur ?', 'Quel format innovant proposer ?', 'Comment montrer l\'impact mesurable ?'],
    ['Comment rédiger la note réflexive ?', 'Dois-je tout relire ?', 'Comment soumettre ?']
  ];
  const suggestions = suggestionsByPhase[getPhaseIndex(getElapsedMin())] || suggestionsByPhase[0];

  // injection unique de l'animation de pulsation + points
  useJEffect(() => {
    if (!document.getElementById('jeff-fab-style')) {
      const s = document.createElement('style');
      s.id = 'jeff-fab-style';
      s.textContent = `
        @keyframes jeff-pulse { 0%,100%{box-shadow:0 6px 22px rgba(11,43,45,.35),0 0 0 0 rgba(93,226,152,.5)} 50%{box-shadow:0 6px 22px rgba(11,43,45,.35),0 0 0 10px rgba(93,226,152,0)} }
        @keyframes jeff-in { from{opacity:0;transform:translateY(14px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes jeff-dot { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-4px);opacity:1} }
        .jeff-panel{animation:jeff-in .22s cubic-bezier(.34,1.4,.64,1) both}
        .jeff-fab-attn{animation:jeff-pulse 2.4s ease-in-out infinite}
      `;
      document.head.appendChild(s);
    }
  }, []);

  if (!window.LUMIO_TIMER_START) return null;

  // ── Rendu chatbot flottant (bas-droite) ──────────────────────
  const elapsedR = getElapsedMin();
  const phaseIdxR = getPhaseIndex(elapsedR);
  const remainingR = Math.max(0, 210 - elapsedR);
  const isUrgentR = remainingR < 45;
  const jState = sending ? 'talking' : isUrgentR ? 'alert' : 'idle';
  const C = { abysse: '#0B2B2D', petrole: '#134547', menthe: '#5DE298', givre: '#E3FFF0', eau: '#9DF0C4', saumon: '#E89B77' };
  const Avatar = window.JeffersonAvatar || window.JeffersonIcon || (() => React.createElement('span', null, '🐰'));


  return (
    <>
      {/* Lanceur flottant — la tête du lapin */}
      <button
        onClick={() => { setOpen(o => !o); setUnread(0); }}
        aria-label="Jefferson — Guide PAC"
        title="Jefferson — votre guide"
        className={!open && unread > 0 ? 'jeff-fab-attn' : ''}
        style={{
          position: 'fixed', bottom: 22, right: 22, zIndex: 100000,
          width: 60, height: 60, borderRadius: '50%', padding: 0,
          border: open ? `2px solid ${C.menthe}` : '2px solid rgba(255,255,255,0.7)',
          background: C.givre, cursor: 'pointer', overflow: 'hidden',
          boxShadow: '0 6px 22px rgba(11,43,45,0.35)',
          transition: 'transform .18s cubic-bezier(.34,1.56,.64,1)'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {React.createElement(Avatar, { size: 56, state: open ? 'idle' : jState })}
        {!open && unread > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, background: C.saumon, color: C.abysse, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>{unread}</span>
        )}
      </button>

      {/* Panneau de conversation */}
      {open && (
        <div className="jeff-panel" style={{
          position: 'fixed', bottom: 92, right: 22, zIndex: 100000,
          width: 360, maxWidth: 'calc(100vw - 44px)', height: 520, maxHeight: 'calc(100vh - 130px)',
          background: C.givre, borderRadius: 18, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 18px 60px rgba(11,43,45,0.34)', border: '1px solid rgba(93,226,152,0.35)',
          fontFamily: "'IBM Plex Sans', -apple-system, sans-serif"
        }}>
          {/* Header */}
          <div style={{ padding: '12px 14px', background: `linear-gradient(135deg, ${C.petrole}, ${C.abysse})`, display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.givre, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {React.createElement(Avatar, { size: 38, state: jState })}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Jefferson</div>
              <div style={{ fontSize: 10, color: C.menthe, letterSpacing: '0.04em', opacity: 0.9 }}>Guide PAC · {phaseLabels[phaseIdxR]}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: isUrgentR ? C.saumon : 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 9px', flexShrink: 0 }}>
              <span style={{ fontSize: 10 }}>⏱</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: isUrgentR ? C.abysse : 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-mono, monospace)' }}>{remainingR}′</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Réduire" style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6 }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: C.abysse, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, marginBottom: 2 }}>
                    {React.createElement(Avatar, { size: 22, state: 'idle' })}
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  background: m.role === 'user' ? C.abysse : 'white',
                  color: m.role === 'user' ? 'white' : C.abysse,
                  borderRadius: m.role === 'user' ? '13px 13px 3px 13px' : '13px 13px 13px 3px',
                  padding: '9px 12px', fontSize: 13, lineHeight: 1.6,
                  boxShadow: '0 1px 4px rgba(11,43,45,0.08)',
                  border: m.role === 'assistant' ? '1px solid rgba(93,226,152,0.22)' : 'none',
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.text}
                  {m.time && <div style={{ fontSize: 9, marginTop: 3, textAlign: 'right', opacity: 0.35 }}>{m.time}</div>}
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: C.abysse, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {React.createElement(Avatar, { size: 22, state: 'talking' })}
                </div>
                <div style={{ background: 'white', borderRadius: '13px 13px 13px 3px', padding: '11px 14px', border: '1px solid rgba(93,226,152,0.22)', display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.petrole, animation: 'jeff-dot 1.2s ease-in-out infinite', animationDelay: `${i*0.18}s` }} />)}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div style={{ padding: '0 12px 8px', display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
              {(suggestions || []).map((q, i) => (
                <button key={i} onClick={() => send(q)} style={{
                  background: 'white', border: '1px solid rgba(93,226,152,0.3)', borderRadius: 8,
                  padding: '7px 11px', fontSize: 12, color: C.abysse, cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit', transition: 'all .12s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.eau; e.currentTarget.style.borderColor = C.menthe; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(93,226,152,0.3)'; }}
                >{q}</button>
              ))}
            </div>
          )}

          {/* Saisie */}
          <div style={{ padding: '9px 12px 12px', borderTop: '1px solid rgba(93,226,152,0.22)', background: 'white', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef} value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Demandez à Jefferson…"
                rows={1}
                style={{ flex: 1, resize: 'none', border: '1px solid rgba(11,43,45,0.15)', borderRadius: 9, padding: '8px 10px', fontSize: 13, color: C.abysse, background: C.givre, outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 80 }}
                onFocus={e => e.target.style.borderColor = C.menthe}
                onBlur={e => e.target.style.borderColor = 'rgba(11,43,45,0.15)'}
              />
              <button onClick={() => send()} disabled={!draft.trim() || sending} style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: draft.trim() && !sending ? C.abysse : 'rgba(11,43,45,0.08)', border: 'none',
                cursor: draft.trim() && !sending ? 'pointer' : 'default',
                color: draft.trim() && !sending ? 'white' : 'rgba(11,43,45,0.25)',
                fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s'
              }}>↑</button>
            </div>
            <div style={{ fontSize: 9, color: C.petrole, marginTop: 4, paddingLeft: 2, opacity: 0.5 }}>
              Jefferson dit quoi faire, pas quoi penser
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// JeffersonApp est monté directement par le composant Desktop (portée Babel partagée via window)
window.JeffersonApp = JeffersonApp;
window.LUMIO_APPS = window.LUMIO_APPS || {};
