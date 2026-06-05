// ══════════════════════════════════════════════════════════════
//  LIVRABLE APP — BC6 (PAC 4-III · Manager Marketing & Communication)
//  PAC · Parcours Activation Compétences · Éminéo · MSMC
//  · Compétences C.20-III, C.21-III, C.22-III
//  · Opération PULSE — stratégie créative Lumio Zen Series
//  · Jury IA — critères RNCP BC6 stricts
//  · Note réflexive E7
// ══════════════════════════════════════════════════════════════

const wc = (txt) => (txt || '').trim() ? (txt || '').trim().split(/\s+/).length : 0;
const GLOBAL_MIN = (window.PAC_CONFIG && window.PAC_CONFIG.livrableMinMots) || 520;

// ─── Prompt jury BC6 (depuis la config) ─────────────────────
const JURY_PROMPT = (window.PAC_CONFIG && window.PAC_CONFIG.juryPrompt)
  || `Tu es le jury certifiant du bloc 4-III (Manager Marketing & Communication). Évalue la production aux critères RNCP stricts.`;


// ══════ Portfolio Éminéo — composants partagés (canonique) ══════
function parseJuryResult(juryText, competences) {
  const results = {};
  const niveauMap = {
    'satisfaisant': 'Satisfaisante',
    'insuffisant': 'Insuffisante',
    'absent': 'Absente',
    'conforme avec distinction': 'Maximale',
    'conforme': 'Haute',
    'partiellement conforme': 'Moyenne',
    'non conforme': 'Insuffisante'
  };

  competences.forEach(c => {
    const pattern = new RegExp(`###\\s*${c.code.replace('.', '\\.')}[^\\n]*\\[([^\\]]+)\\]`, 'i');
    const match = juryText.match(pattern);
    if (match) {
      const raw = match[1].toLowerCase().trim();
      results[c.code] = {
        niveau: niveauMap[raw] || match[1],
        acquis: raw !== 'insuffisant' && raw !== 'absent' && raw !== 'non conforme'
      };
    } else {
      results[c.code] = { niveau: 'Non évalué', acquis: false };
    }
  });

  // Global level
  const globalMatch = juryText.match(/\*\*\[([^\]]+)\]\*\*/);
  const globalRaw = globalMatch ? globalMatch[1].toLowerCase() : '';
  results._global = {
    label: globalMatch ? globalMatch[1] : 'Non évalué',
    acquis: globalRaw.includes('conforme') && !globalRaw.includes('non conforme')
  };

  // Question jury
  const qMatch = juryText.match(/## Question de jury\n([^\n]+)/);
  results._question = qMatch ? qMatch[1] : null;

  return results;
}

function PortfolioScreen({ studentName, studentEmail, competences, wordCounts, juryResult, globalWords, answers, blocLabel, affaire }) {
  const [sendState, setSendState] = React.useState('idle'); // idle | sending | sent | error
  const parsed = React.useMemo(() => parseJuryResult(juryResult || '', competences), [juryResult, competences]);
  const acquises = competences.filter(c => parsed[c.code]?.acquis);
  const nonAcquises = competences.filter(c => !parsed[c.code]?.acquis);
  const portfolioEarned = parsed._global?.acquis && acquises.length >= Math.ceil(competences.length * 0.5);
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const prenom = (studentName || '').split(' ')[0] || 'Étudiant';

  // ── Métadonnées affaire / livrable (depuis PASS_CONFIG avec fallbacks) ──
  const cfg = window.PASS_CONFIG || {};
  const blocId = blocLabel || cfg.bloc || 'BC1';
  const affaireTitre = affaire || cfg.titre_affaire || cfg.accroche || 'Affaire Lumio Health';
  const livrableTitre = cfg.livrableTitre || cfg.deliverable || 'Livrable certifiant PAC';
  const livrableMeta = cfg.epreuve || 'MSMC RNCP 38504';

  // ── Récit hybride : généré par l'IA depuis les réponses, éditable ──
  const [recit, setRecit] = React.useState('');
  const [signature, setSignature] = React.useState('');
  const [recitState, setRecitState] = React.useState('loading'); // loading | ready | error
  const [editing, setEditing] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const genRecit = async () => {
      setRecitState('loading');
      try {
        const reponsesText = competences.map(c =>
          `${c.code} — ${c.label} :\n${(answers && answers[c.code]) || '(non renseigné)'}`
        ).join('\n\n');
        const sys = `Tu es l'étudiant ${prenom}, qui vient de produire un livrable certifiant pour le bloc ${blocId} (PAC Lumio Health). À partir de ses réponses ci-dessous, écris à la PREMIÈRE PERSONNE deux courts textes qui expriment sa POSTURE professionnelle et ses CHOIX — pas un résumé.

RÈGLES STRICTES :
- "recit" : 2 à 3 phrases. Commence par un fait concret tiré des réponses (un chiffre, une contradiction, une tension repérée), puis un choix posé ("j'ai choisi de…"). Ton sobre, professionnel, première personne. Pas de superlatif.
- "signature" : 1 phrase, sur le modèle "Dans cette affaire, j'ai choisi de … — parce que …". Elle nomme le parti-pris central et sa justification.
- Réponds UNIQUEMENT avec un objet JSON valide, sans balise Markdown, sans préambule : {"recit":"…","signature":"…"}`;
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5',
            max_tokens: 400,
            system: sys,
            messages: [{ role: 'user', content: reponsesText }]
          })
        });
        if (!resp.ok) throw new Error('api');
        const data = await resp.json();
        const raw = (Array.isArray(data.content) ? data.content.map(b => b.text || '').join('') : '').trim();
        const clean = raw.replace(/```json|```/g, '').trim();
        const obj = JSON.parse(clean);
        if (cancelled) return;
        setRecit((obj.recit || '').trim());
        setSignature((obj.signature || '').trim());
        setRecitState('ready');
      } catch {
        if (cancelled) return;
        setRecit(`Dans cette affaire, j'ai dû trancher à partir de documents qui se contredisaient. J'ai choisi de nommer les tensions avant de proposer une direction, plutôt que de produire une réponse lisse qui les aurait masquées.`);
        setSignature(`Dans cette affaire, j'ai choisi de poser un diagnostic honnête avant de recommander — parce qu'une décision défendable vaut mieux qu'une note rassurante.`);
        setRecitState('ready');
      }
    };
    if (portfolioEarned) genRecit();
    else setRecitState('skip');
    return () => { cancelled = true; };
  }, [portfolioEarned]);

  const sendPortfolio = async () => {
    if (sendState === 'sending' || sendState === 'sent' || !portfolioEarned) return;
    if (!studentEmail) { setSendState('error'); return; }
    setSendState('sending');
    try {
      const portfolioHTML = generatePortfolioHTML(studentName, acquises, today, { blocId, affaireTitre, livrableTitre, recit, signature, prenom });
      const resp = await fetch('/api/send-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: studentEmail, studentName, portfolioHTML,
          bloc: blocId, acquises: acquises.map(c => c.code), date: today
        })
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.sent) setSendState('sent');
      else setSendState('error');
    } catch { setSendState('error'); }
  };

  const G = C_EMINEO;

  // ════════════════ Portfolio NON délivré → bilan sobre ════════════════
  if (!portfolioEarned) {
    return (
      <div style={{ height: '100%', overflowY: 'auto', background: G.givre, fontFamily: "'IBM Plex Sans', sans-serif" }}>
        <div style={{ background: `linear-gradient(160deg, ${G.petrole} 0%, ${G.abysse} 100%)`, padding: '28px 32px 24px' }}>
          <div style={{ fontSize: 11, color: G.saumon, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            Bilan PAC · {blocId} · {today}
          </div>
          <div style={{ fontSize: 22, fontWeight: 300, color: 'white', lineHeight: 1.2, marginBottom: 8 }}>{studentName}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232,155,119,0.15)', border: `1px solid ${G.saumon}`, borderRadius: 20, padding: '5px 14px' }}>
            <span style={{ fontSize: 11, color: G.saumon, fontWeight: 600 }}>Portfolio non délivré — voir le détail ci-dessous</span>
          </div>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {acquises.length > 0 && <CompetenceBlock title={`Compétences acquises — ${acquises.length}/${competences.length}`} comps={acquises} parsed={parsed} ok G={G} />}
          {nonAcquises.length > 0 && <CompetenceBlock title={`À renforcer — ${nonAcquises.length}/${competences.length}`} comps={nonAcquises} parsed={parsed} G={G} />}
          {parsed._question && (
            <div style={{ background: G.abysse, borderRadius: 10, padding: '14px 18px' }}>
              <div style={{ fontSize: 9, color: G.menthe, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Question de jury à préparer</div>
              <div style={{ fontSize: 13, color: 'white', lineHeight: 1.6, fontStyle: 'italic' }}>"{parsed._question}"</div>
            </div>
          )}
          <div style={{ textAlign: 'center', padding: '8px 0 16px', fontSize: 10, color: G.petrole, opacity: 0.45, letterSpacing: '0.08em' }}>
            PAC · Éminéo Éducation · MSMC RNCP 38504 · {today}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════ Portfolio DÉLIVRÉ → carte façon PJ, charte Éminéo ════════════════
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: G.givre, fontFamily: "'IBM Plex Sans', sans-serif", padding: '24px 22px 30px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 40px rgba(11,43,45,0.14)', border: `1px solid rgba(19,69,71,0.08)` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr' }} className="pac-portfolio-grid">

          {/* ── Volet image ── */}
          <div style={{ position: 'relative', minHeight: 460, background: `linear-gradient(155deg, ${G.petrole} 0%, ${G.abysse} 100%)`, padding: '26px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
            {/* halo décoratif */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${G.menthe}22 0%, transparent 70%)` }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <svg width="30" height="30" viewBox="0 0 52 52" fill="none">
                  <circle cx="26" cy="26" r="26" fill={G.givre}/>
                  <circle cx="26" cy="22" r="8" fill={G.abysse}/>
                  <path d="M26 30 C26 30 14 34 14 42 L38 42 C38 34 26 30 26 30Z" fill={G.abysse}/>
                </svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: '0.02em' }}>emineo</div>
                  <div style={{ fontSize: 8, color: G.menthe, letterSpacing: '0.18em', textTransform: 'uppercase' }}>ÉDUCATION</div>
                </div>
              </div>
              <div style={{ display: 'inline-block', background: G.menthe, color: G.abysse, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.04em' }}>
                {blocId}
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 10, color: G.menthe, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>Portfolio de compétences</div>
              <div style={{ fontSize: 22, fontWeight: 300, color: 'white', lineHeight: 1.25, marginBottom: 14 }}>{affaireTitre}</div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', margin: '14px 0' }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>{studentName}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{livrableMeta} · {today}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, background: 'rgba(93,226,152,0.15)', border: `1px solid ${G.menthe}`, borderRadius: 20, padding: '4px 12px' }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><polyline points="10 3 5 9 2 6" stroke={G.menthe} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 10, color: G.menthe, fontWeight: 600 }}>{parsed._global?.label || 'Conforme'}</span>
              </div>
            </div>
          </div>

          {/* ── Volet contenu ── */}
          <div style={{ padding: '30px 32px' }}>

            {/* Livrable produit */}
            <div style={{ fontSize: 10, color: G.menthe, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Livrable produit</div>
            <div style={{ fontSize: 19, fontWeight: 600, color: G.abysse, lineHeight: 1.3, marginBottom: 6 }}>{livrableTitre}</div>
            <div style={{ fontSize: 12, color: G.petrole, opacity: 0.7, marginBottom: 10 }}>{globalWords} mots produits · {acquises.length}/{competences.length} compétences validées</div>
            <div style={{ display: 'inline-block', background: G.givre, color: G.petrole, fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 6 }}>
              Évalué conforme par l'IA pédagogique
            </div>

            <div style={{ height: 1, background: 'rgba(19,69,71,0.1)', margin: '22px 0' }} />

            {/* Compétences mobilisées */}
            <div style={{ fontSize: 10, color: G.menthe, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Compétences mobilisées</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {acquises.map(c => (
                <div key={c.code} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: G.menthe, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><polyline points="8 2 4 8 2 5" stroke={G.abysse} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div style={{ fontSize: 13, color: G.abysse, lineHeight: 1.45 }}>
                    <span style={{ fontWeight: 700, color: G.petrole, fontFamily: 'monospace', fontSize: 11, marginRight: 6 }}>{c.code}</span>
                    {c.label}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: 'rgba(19,69,71,0.1)', margin: '22px 0' }} />

            {/* Récit + signature — première personne, éditable */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: G.menthe, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>Ma posture</div>
              {recitState === 'ready' && (
                <button onClick={() => setEditing(e => !e)} style={{ background: 'none', border: `1px solid ${G.petrole}`, color: G.petrole, fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {editing ? '✓ Terminer' : '✎ Modifier'}
                </button>
              )}
            </div>

            {recitState === 'loading' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', color: G.petrole, opacity: 0.6, fontSize: 13, fontStyle: 'italic' }}>
                <div style={{ width: 16, height: 16, border: `2px solid rgba(19,69,71,0.2)`, borderTopColor: G.petrole, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                L'IA rédige une proposition de récit à partir de vos réponses…
              </div>
            )}

            {recitState === 'ready' && (
              <div style={{ background: `linear-gradient(135deg, ${G.givre} 0%, rgba(157,240,196,0.25) 100%)`, borderRadius: 12, padding: '20px 22px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 8, left: 14, fontSize: 42, color: G.menthe, opacity: 0.5, fontFamily: 'Georgia, serif', lineHeight: 1 }}>“</div>
                {editing ? (
                  <>
                    <textarea value={recit} onChange={e => setRecit(e.target.value)} rows={4}
                      style={{ width: '100%', background: 'white', border: `1px solid ${G.menthe}`, borderRadius: 8, padding: '10px 12px', fontSize: 13.5, lineHeight: 1.6, color: G.abysse, fontFamily: 'inherit', resize: 'vertical', marginBottom: 10, marginTop: 8 }} />
                    <textarea value={signature} onChange={e => setSignature(e.target.value)} rows={2}
                      style={{ width: '100%', background: 'white', border: `1px solid ${G.menthe}`, borderRadius: 8, padding: '10px 12px', fontSize: 13, lineHeight: 1.5, color: G.petrole, fontStyle: 'italic', fontFamily: 'inherit', resize: 'vertical' }} />
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: G.abysse, margin: '6px 0 14px', position: 'relative', zIndex: 1 }}>{recit}</p>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: G.petrole, fontStyle: 'italic', margin: 0, paddingTop: 12, borderTop: `1px solid rgba(19,69,71,0.12)` }}>
                      {signature}
                    </p>
                    <p style={{ fontSize: 12, color: G.petrole, fontWeight: 600, marginTop: 10, textAlign: 'right' }}>— {studentName}</p>
                  </>
                )}
              </div>
            )}

            {/* Envoi portfolio */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 11, color: G.petrole, opacity: 0.65, marginBottom: 10 }}>
                Recevez votre portfolio par email : <strong>{studentEmail || 'email non renseigné'}</strong>
              </div>
              <button onClick={sendPortfolio} disabled={sendState === 'sending' || sendState === 'sent'}
                style={{ width: '100%', padding: '11px 0', background: sendState === 'sent' ? G.menthe : sendState === 'sending' ? 'rgba(19,69,71,0.4)' : G.abysse, color: sendState === 'sent' ? G.abysse : 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: (sendState === 'idle' || sendState === 'error') ? 'pointer' : 'default', transition: 'all .25s', fontFamily: 'inherit' }}>
                {sendState === 'idle' && '📧 Recevoir mon portfolio →'}
                {sendState === 'sending' && 'Envoi en cours…'}
                {sendState === 'sent' && '✓ Portfolio envoyé'}
                {sendState === 'error' && '⚠ Erreur — réessayez'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer carte */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', background: G.abysse }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: G.menthe }} />
            <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.04em' }}>PAC · Lumio Health · MSMC RNCP 38504</span>
          </div>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)' }}>Éminéo Éducation · {today}</div>
        </div>
      </div>
    </div>
  );
}

// Bloc compétences réutilisable (bilan non-délivré)
function CompetenceBlock({ title, comps, parsed, ok, G }) {
  const accent = ok ? G.menthe : G.saumon;
  return (
    <div style={{ background: 'white', borderRadius: 10, overflow: 'hidden', border: `1px solid ${ok ? 'rgba(93,226,152,0.25)' : 'rgba(232,155,119,0.25)'}` }}>
      <div style={{ padding: '12px 16px', background: ok ? G.abysse : 'rgba(232,155,119,0.12)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{title}</span>
      </div>
      {comps.map((c, i) => (
        <div key={c.code} style={{ padding: '10px 16px', borderBottom: i < comps.length - 1 ? `1px solid ${G.givre}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: ok ? G.menthe : 'rgba(232,155,119,0.15)', border: ok ? 'none' : `1px solid ${G.saumon}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
            {ok
              ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="8 2 4 8 2 5" stroke={G.abysse} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <span style={{ fontSize: 10, color: G.saumon, fontWeight: 700 }}>–</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: G.petrole, fontFamily: 'monospace' }}>{c.code}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: G.abysse }}>{c.label}</span>
            </div>
            <div style={{ fontSize: 10, color: accent, fontWeight: 600 }}>{parsed[c.code]?.niveau || (ok ? 'Acquise' : 'Non acquise')}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function generatePortfolioHTML(studentName, acquises, date, meta) {
  meta = meta || {};
  const blocId = meta.blocId || 'BC1';
  const affaireTitre = meta.affaireTitre || 'Affaire Lumio Health';
  const livrableTitre = meta.livrableTitre || 'Livrable certifiant PAC';
  const recit = meta.recit || '';
  const signature = meta.signature || '';
  const comps = acquises.map(c =>
    `<tr><td style="padding:7px 0;font-family:monospace;font-weight:700;color:#134547;font-size:11px;width:42px;vertical-align:top;">${c.code}</td><td style="padding:7px 0;font-size:13px;color:#0B2B2D;">${c.label}</td></tr>`
  ).join('');
  return `<!DOCTYPE html><html><body style="margin:0;background:#E3FFF0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:28px 16px;">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(11,43,45,0.14);">
  <div style="background:linear-gradient(155deg,#134547,#0B2B2D);padding:30px 34px;">
    <div style="font-size:13px;font-weight:700;color:white;letter-spacing:.02em;">emineo <span style="font-size:9px;color:#5DE298;letter-spacing:.18em;">ÉDUCATION</span></div>
    <div style="display:inline-block;background:#5DE298;color:#0B2B2D;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;margin-top:16px;">${blocId}</div>
    <div style="font-size:10px;color:#5DE298;letter-spacing:.16em;text-transform:uppercase;margin-top:18px;">Portfolio de compétences</div>
    <div style="font-size:22px;font-weight:300;color:white;line-height:1.25;margin:6px 0 14px;">${affaireTitre}</div>
    <div style="font-size:15px;font-weight:600;color:white;">${studentName}</div>
    <div style="font-size:11px;color:rgba(255,255,255,.55);margin-top:3px;">MSMC RNCP 38504 · Délivré le ${date}</div>
  </div>
  <div style="padding:26px 34px;">
    <div style="font-size:10px;color:#5DE298;letter-spacing:.16em;text-transform:uppercase;font-weight:700;margin-bottom:6px;">Livrable produit</div>
    <div style="font-size:18px;font-weight:600;color:#0B2B2D;line-height:1.3;margin-bottom:18px;">${livrableTitre}</div>
    <div style="font-size:10px;color:#5DE298;letter-spacing:.16em;text-transform:uppercase;font-weight:700;margin-bottom:8px;">Compétences mobilisées</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;"><tbody>${comps}</tbody></table>
    ${recit ? `<div style="background:linear-gradient(135deg,#E3FFF0,rgba(157,240,196,.25));border-radius:12px;padding:20px 22px;margin-top:18px;">
      <div style="font-size:10px;color:#134547;letter-spacing:.16em;text-transform:uppercase;font-weight:700;margin-bottom:10px;">Ma posture</div>
      <p style="font-size:14px;line-height:1.7;color:#0B2B2D;margin:0 0 14px;">${recit}</p>
      ${signature ? `<p style="font-size:13px;line-height:1.6;color:#134547;font-style:italic;margin:0;padding-top:12px;border-top:1px solid rgba(19,69,71,.12);">${signature}</p>` : ''}
      <p style="font-size:12px;color:#134547;font-weight:600;margin:10px 0 0;text-align:right;">— ${studentName}</p>
    </div>` : ''}
  </div>
  <div style="padding:14px 34px;background:#0B2B2D;font-size:10.5px;color:rgba(255,255,255,.6);">PAC · Lumio Health · MSMC RNCP 38504 · Éminéo Éducation · ${date}</div>
</div></body></html>`;
}


function LivrableApp() {
  const cfg = window.PASS_CONFIG;
  const COMPETENCES = cfg ? cfg.competences : [];
  const GABARITS = cfg ? cfg.gabarits : {};

  const TABS = [...COMPETENCES.map(c => c.code), 'reflexive'];

  const [answers, setAnswers] = React.useState(() => {
    try {
      const saved = localStorage.getItem('lumio_livrable_answers_bc5');
      return saved ? JSON.parse(saved) : Object.fromEntries([...COMPETENCES.map(c => [c.code, '']), ['reflexive', '']]);
    } catch { return Object.fromEntries([...COMPETENCES.map(c => [c.code, '']), ['reflexive', '']]); }
  });

  const [gabaritMode, setGabaritMode] = React.useState(null); // 'ROLES' | 'RISQUES'
  const [gabaritData, setGabaritData] = React.useState({ ROLES: {}, RISQUES: {} });
  const [activeTab, setActiveTab] = React.useState(COMPETENCES[0]?.code || 'C.20-III');
  const [phase, setPhase] = React.useState('edit');
  const [juryFeedback, setJuryFeedback] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const scrollRef = React.useRef(null);

  const setAnswer = (code, val) => {
    const next = { ...answers, [code]: val };
    setAnswers(next);
    try { localStorage.setItem('lumio_livrable_answers_bc5', JSON.stringify(next)); } catch {}
  };

  const totalWords = COMPETENCES.reduce((s, c) => s + wc(answers[c.code]), 0);
  const reflexiveWords = wc(answers['reflexive']);
  const activeComp = COMPETENCES.find(c => c.code === activeTab);
  const isReflexive = activeTab === 'reflexive';

  const getTabColor = (code) => {
    if (code === 'reflexive') return '#5c2d8f';
    const palette = ['#1b4f8a', '#c4420f', '#1a6641', '#134547'];
    const idx = COMPETENCES.findIndex(x => x.code === code);
    return idx >= 0 ? palette[idx % palette.length] : '#134547';
  };
  const activeColor = getTabColor(activeTab);

  const wcComp = (code) => wc(answers[code]);
  const minComp = (code) => {
    const c = COMPETENCES.find(x => x.code === code);
    return c ? c.min : 80;
  };

  const injectGabarit = (key) => {
    const gab = GABARITS[key];
    if (!gab) return;
    const lines = gab.structure.map(row => {
      const val = (gabaritData[key] || {})[row.cle] || '';
      return `**${row.label}**\n${val || '[À compléter]'}`;
    });
    const block = `\n\n— ${gab.label} —\n\n${lines.join('\n\n')}\n`;
    const targetCode = (COMPETENCES[1] && COMPETENCES[1].code) || activeTab;
    setAnswer(targetCode, (answers[targetCode] || '') + block);
    setGabaritMode(null);
  };

  const handleSubmit = async () => {
    if (totalWords < GLOBAL_MIN) return;
    if (reflexiveWords < 100) {
      alert('La note réflexive doit faire au moins 100 mots (E7 obligatoire).');
      setActiveTab('reflexive');
      return;
    }
    setSubmitting(true);
    setPhase('submitting');

    const livrableContent = COMPETENCES.map(c =>
      `### ${c.code} — ${c.label}\n${answers[c.code] || '(non renseigné)'}`
    ).join('\n\n') + `\n\n### Note réflexive E7\n${answers['reflexive'] || '(non renseignée)'}`;

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1000,
          system: JURY_PROMPT,
          messages: [{ role: 'user', content: `Évalue cette contribution individuelle BC6 (PAC 4-III) :\n\n${livrableContent}` }]
        })
      });
      const data = await resp.json();
      const feedback = Array.isArray(data.content) ? data.content[0]?.text : 'Retour jury indisponible.';
      setJuryFeedback(feedback);
      setPhase('done');
    } catch {
      setJuryFeedback('Le jury IA est temporairement indisponible. Votre contribution a été enregistrée.');
      setPhase('done');
    }
    setSubmitting(false);
  };

  // ── Phase done ───────────────────────────────────────────────
  if (phase === 'done') {
    const wordCounts = Object.fromEntries(COMPETENCES.map(c => [c.code, wc(answers[c.code])]));
    return (
      <PortfolioScreen
        studentName={window.LUMIO_DATA?.student?.name || 'Étudiant'}
        studentEmail={window.LUMIO_DATA?.student?.email || ''}
        competences={COMPETENCES}
        wordCounts={wordCounts}
        juryResult={juryFeedback}
        globalWords={totalWords}
        answers={answers}
        blocLabel={cfg?.bloc || 'BC6'}
        affaire={cfg?.titre_affaire || cfg?.accroche || ''}
      />
    );
  }

  // ── Phase edit ───────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'var(--font-sans)', background: '#f4f2ee' }}>

      {/* Header */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(20,24,36,0.08)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', color: '#c4420f', textTransform: 'uppercase' }}>PAC · BC6 · E7</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#141824' }}>Contribution individuelle — Stratégie créative PULSE</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: totalWords >= GLOBAL_MIN ? '#1a6641' : '#c4420f', fontWeight: 700 }}>
            {totalWords} / {GLOBAL_MIN} mots
          </div>
          <div style={{ fontSize: 10, color: '#9aa0ae' }}>minimum global</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(20,24,36,0.08)', background: 'white', overflowX: 'auto', flexShrink: 0 }}>
        {TABS.map(code => {
          const isActive = activeTab === code;
          const label = code === 'reflexive' ? '✦ Réflexive' : code;
          const comp = COMPETENCES.find(c => c.code === code);
          const words = wc(answers[code]);
          const min = code === 'reflexive' ? 100 : (comp?.min || 80);
          const ok = words >= min;
          const color = getTabColor(code);
          return (
            <button key={code} onClick={() => setActiveTab(code)} style={{
              padding: '8px 14px', border: 'none', background: 'transparent',
              borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
              color: isActive ? color : '#5b6473', fontWeight: isActive ? 700 : 400,
              fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer',
              letterSpacing: '0.08em', whiteSpace: 'nowrap', transition: 'all 0.15s'
            }}>
              {label} {ok ? '✓' : `${words}/${min}`}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Zone de rédaction */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white' }}>

          {/* Sous-header compétence */}
          {!isReflexive && activeComp && (
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(20,24,36,0.06)', background: '#fafaf8' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: activeColor, letterSpacing: '0.12em', fontWeight: 700 }}>
                {activeComp.code} · {activeComp.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 11, color: '#5b6473', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{wcComp(activeComp.code)} / {minComp(activeComp.code)} mots min.</span>
                {activeComp.conseil && <span style={{ color: '#9aa0ae' }}>— {activeComp.conseil}</span>}
              </div>

              {/* Boutons gabarits pour la 2e compétence */}
              {GABARITS && Object.keys(GABARITS).length > 0 && activeTab === (COMPETENCES[1] && COMPETENCES[1].code) && (
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  {Object.entries(GABARITS).map(([key, gab]) => (
                    <button key={key} onClick={() => setGabaritMode(gabaritMode === key ? null : key)} style={{
                      padding: '4px 10px', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
                      background: gabaritMode === key ? activeColor : 'transparent',
                      color: gabaritMode === key ? 'white' : activeColor,
                      border: `1px solid ${activeColor}`, borderRadius: 4, cursor: 'pointer'
                    }}>
                      + {gab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Gabarit ouvert */}
              {gabaritMode && GABARITS && Object.keys(GABARITS).length > 0 && activeTab === (COMPETENCES[1] && COMPETENCES[1].code) && (
                <div style={{ marginTop: 10, background: '#f4f2ee', borderRadius: 6, padding: '12px 14px', border: '1px solid rgba(20,24,36,0.08)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: activeColor, fontWeight: 700, marginBottom: 10, letterSpacing: '0.1em' }}>
                    {GABARITS[gabaritMode]?.label}
                  </div>
                  {GABARITS[gabaritMode]?.structure.map(row => (
                    <div key={row.cle} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#2a3142', marginBottom: 3 }}>{row.label}</div>
                      <textarea
                        value={(gabaritData[gabaritMode] || {})[row.cle] || ''}
                        onChange={e => setGabaritData(prev => ({ ...prev, [gabaritMode]: { ...(prev[gabaritMode] || {}), [row.cle]: e.target.value } }))}
                        placeholder={row.placeholder}
                        rows={2}
                        style={{ width: '100%', fontSize: 11, fontFamily: 'var(--font-display)', lineHeight: 1.5, padding: '6px 8px', border: '1px solid rgba(20,24,36,0.15)', borderRadius: 4, resize: 'vertical', background: 'white', color: '#141824' }}
                      />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => injectGabarit(gabaritMode)} style={{ padding: '6px 14px', background: activeColor, color: 'white', border: 'none', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Injecter dans la compétence →
                    </button>
                    <button onClick={() => setGabaritMode(null)} style={{ padding: '6px 14px', background: 'transparent', color: '#5b6473', border: '1px solid rgba(20,24,36,0.15)', borderRadius: 5, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isReflexive && (
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(20,24,36,0.06)', background: '#fafaf8' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5c2d8f', letterSpacing: '0.12em', fontWeight: 700 }}>NOTE RÉFLEXIVE · E7 · OBLIGATOIRE</div>
              <div style={{ fontSize: 11, color: '#5b6473', marginTop: 3 }}>
                {reflexiveWords} / 100 mots min. — Retour sur vos choix d'innovation et d'accompagnement. Ce que vous auriez fait différemment. Ce que ce projet révèle de votre posture professionnelle face à l'IA.
              </div>
            </div>
          )}

          <textarea
            ref={scrollRef}
            value={answers[activeTab] || ''}
            onChange={e => setAnswer(activeTab, e.target.value)}
            placeholder={isReflexive
              ? 'Revenez sur vos choix. Qu\'est-ce que cette affaire a révélé de votre façon d\'aborder l\'innovation ? Qu\'auriez-vous fait différemment ? Sur quelle compétence avez-vous le plus progressé ? (min. 100 mots)'
              : (activeComp?.placeholder || '')}
            style={{
              flex: 1, width: '100%', border: 'none', outline: 'none',
              padding: '16px 18px', fontSize: 13.5,
              fontFamily: 'var(--font-display)', lineHeight: 1.75,
              color: '#141824', resize: 'none', background: 'white', minHeight: 0
            }}
          />
        </div>

        {/* Colonne droite — référentiel */}
        <div style={{ width: 220, background: '#f4f2ee', overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14, borderLeft: '1px solid rgba(20,24,36,0.08)', flexShrink: 0 }}>

          {!isReflexive && activeComp && (
            <>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: activeColor, fontWeight: 700, marginBottom: 6 }}>
                  {activeComp.code} · Attendu RNCP
                </div>
                <div style={{ fontSize: 11.5, color: '#2a3142', lineHeight: 1.65 }}>{activeComp.rncp}</div>
              </div>

              {activeComp.motsCles && (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: '#9aa0ae', textTransform: 'uppercase', marginBottom: 6 }}>Mots-clés attendus</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {activeComp.motsCles.map(m => (
                      <span key={m} style={{ background: 'rgba(20,24,36,0.06)', borderRadius: 3, padding: '2px 6px', fontSize: 10, color: '#5b6473', fontFamily: 'var(--font-mono)' }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ background: 'white', borderRadius: 6, padding: '10px 12px', border: `1px solid ${activeColor}22` }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: activeColor, textTransform: 'uppercase', marginBottom: 5, fontWeight: 700 }}>Conseil jury</div>
                <div style={{ fontSize: 11, color: '#2a3142', lineHeight: 1.6 }}>{activeComp.conseil}</div>
              </div>
            </>
          )}

          {isReflexive && (
            <div style={{ background: 'white', borderRadius: 6, padding: '10px 12px', border: '1px solid rgba(92,45,143,0.2)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: '#5c2d8f', textTransform: 'uppercase', marginBottom: 5, fontWeight: 700 }}>Consigne E7</div>
              <div style={{ fontSize: 11, color: '#2a3142', lineHeight: 1.6 }}>
                La note réflexive est évaluée par le jury au même titre que les compétences. Elle doit montrer votre capacité à prendre du recul sur vos propres choix professionnels.
              </div>
            </div>
          )}

          {/* Avancement global */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: '#9aa0ae', textTransform: 'uppercase', marginBottom: 8 }}>Avancement</div>
            {COMPETENCES.map(c => {
              const words = wcComp(c.code);
              const min = c.min;
              const pct = Math.min(100, Math.round(words / min * 100));
              const col = getTabColor(c.code);
              return (
                <div key={c.code} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: col, fontWeight: 700 }}>{c.code}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9aa0ae' }}>{words}/{min}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(20,24,36,0.08)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? col : '#e8e4de', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#5c2d8f', fontWeight: 700 }}>Réflexive</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9aa0ae' }}>{reflexiveWords}/100</span>
              </div>
              <div style={{ height: 4, background: 'rgba(20,24,36,0.08)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${Math.min(100, Math.round(reflexiveWords / 100 * 100))}%`, background: reflexiveWords >= 100 ? '#5c2d8f' : '#e8e4de', borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer — Soumettre */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(20,24,36,0.08)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: totalWords >= GLOBAL_MIN ? '#1a6641' : '#c4420f' }}>
          {totalWords >= GLOBAL_MIN
            ? `✓ ${totalWords} mots — seuil atteint`
            : `${GLOBAL_MIN - totalWords} mots manquants avant soumission`}
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || totalWords < GLOBAL_MIN}
          style={{
            padding: '8px 20px', background: totalWords >= GLOBAL_MIN ? '#134547' : '#ccc',
            color: 'white', border: 'none', borderRadius: 6, fontSize: 12,
            fontWeight: 700, cursor: totalWords >= GLOBAL_MIN ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', letterSpacing: '0.04em'
          }}>
          {submitting ? 'Évaluation en cours…' : 'Soumettre au jury →'}
        </button>
      </div>
    </div>
  );
}
