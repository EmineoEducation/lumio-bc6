// ─── Guide de mission ────────────────────────────────────────
function GuideApp() {
  const G = {
    app: { display: 'flex', flexDirection: 'column', height: '100%', background: '#1a2436', overflow: 'hidden' },
    header: { padding: '20px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 },
    eyebrow: { fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(196,66,15,0.8)', marginBottom: 6 },
    title: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'rgba(255,255,255,0.92)', lineHeight: 1.2 },
    body: { flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 },
    section: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '16px 20px' },
    sectionDay: { fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(196,66,15,0.7)', marginBottom: 8 },
    sectionTitle: { fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.88)', marginBottom: 8 },
    tip: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, fontFamily: 'var(--font-display)', fontStyle: 'italic' },
    action: { marginTop: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 5, fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' },
    divider: { height: 1, background: 'rgba(255,255,255,0.06)' },
    footer: { padding: '12px 28px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)', flexShrink: 0 }
  };

  const tips = [
    {
      day: 'Acte 1 · Entrée dans la mission',
      title: 'Par où commencer ?',
      body: 'Sonia Ferracci t\'a écrit ce matin. Son brief PULSE est dans Mail — lis-le en premier. Puis ouvre le brief créatif (DOC-01) et l\'étude insights cible (DOC-02) dans l\'Aperçu PDF. C\'est là que se trouve la matière première de tes axes.',
      action: '→ Mail → Brief PULSE — Sonia Ferracci'
    },
    {
      day: 'Acte 2 · Cerner les contraintes',
      title: 'Croiser les sources',
      body: 'Trois forces tirent la création dans des directions opposées : Jakob (Northgate) exige un indicateur d\'impact par proposition (DOC-04), les partenaires B2B imposent des garde-fous identitaires (DOC-05 + mémo Camille), et le territoire wellness est saturé (benchmark DOC-03). Note ce qui est non négociable avant de créer.',
      action: '→ Aperçu → Benchmark créatif (DOC-03) / → Mail → Exigences Northgate (DOC-04)'
    },
    {
      day: 'Acte 3 · Prendre position',
      title: 'Sonia attend un parti-pris',
      body: 'Tu n\'as pas besoin d\'avoir tout finalisé pour écrire à Sonia. Propose-lui un territoire pour la Zen Series et l\'insight qui le légitime. Elle testera : si c\'est générique, elle le dira. C\'est comme ça qu\'on affûte un angle. Yassine et Camille sont aussi en DM.',
      action: '→ Slack → DM Sonia Ferracci'
    },
    {
      day: 'Acte 4 · Produire la stratégie',
      title: 'Rédiger la stratégie créative',
      body: 'L\'app Livrable t\'attend dans le dock (icône verte). Tu dois couvrir C.20-III (axes générateurs), C.21-III (idées originales + ≥1 format innovant) et C.22-III (concrétisations : maquettes ou scripts). Chaque proposition doit porter un indicateur d\'impact. Jakob doit pouvoir suivre chaque KPI.',
      action: '→ Dock → Livrable (icône verte avec coche)'
    },
    {
      day: 'En cas de blocage',
      title: 'Ce que tu cherches est dans ces apps',
      body: 'Si tu tournes en rond, ouvre le Finder → Mission Lumio. Tous les documents sont là, dont le moodboard partiel (DOC-06) à réorienter. Si tu ne sais pas par où entrer, écris : "L\'insight que je choisis est… donc l\'axe est…" et force-toi à compléter.',
      action: '→ Finder → Mission Lumio'
    }
  ];

  return (
    <div style={G.app}>
      <div style={G.header}>
        <div style={G.eyebrow}>Guide de mission · BC6 · PAC</div>
        <div style={G.title}>Lumio Health — Opération PULSE</div>
      </div>
      <div style={G.body}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontFamily: 'var(--font-display)', padding: '0 0 4px' }}>
          Ce guide est là si tu te sens bloqué. Il ne donne pas les réponses — il indique où chercher.
        </div>
        {tips.map((t, i) => (
          <div key={i} style={G.section}>
            <div style={G.sectionDay}>{t.day}</div>
            <div style={G.sectionTitle}>{t.title}</div>
            <div style={G.tip}>{t.body}</div>
            <div style={G.action}>{t.action}</div>
          </div>
        ))}
        <div style={G.divider} />
        <div style={{ ...G.section, background: 'rgba(19,69,71,0.18)', borderColor: 'rgba(93,226,152,0.25)' }}>
          <div style={{ ...G.sectionDay, color: '#5DE298' }}>Rappel · Livrable final — {(window.PAC_CONFIG?.competences || []).map(c => c.code).join(' · ')}</div>
          <div style={G.sectionTitle}>Ce que tu dois produire</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {(window.PAC_CONFIG?.competences || []).map((c) => (
              <div key={c.code} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 7px', background: 'rgba(93,226,152,0.18)', color: '#5DE298', borderRadius: 4, flexShrink: 0, marginTop: 2 }}>{c.code}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{c.label}</div>
              </div>
            ))}
            {window.PAC_CONFIG?.note_reflexive && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 7px', background: 'rgba(92,45,143,0.25)', color: '#c9a8ff', borderRadius: 4, flexShrink: 0, marginTop: 2 }}>E7</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Note réflexive — minimum 100 mots, obligatoire pour la conformité.</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={G.footer}>Ce guide est disponible à tout moment via le bouton ? en bas à gauche du desktop.</div>
    </div>
  );
}

// ─── PDF Viewer ───────────────────────────────────────────────
const { useState: usePdfState } = React;

function PdfApp({ openGuide }) {
  const D = window.LUMIO_DATA;
  const [activeDoc, setActiveDoc] = usePdfState('deck'); // 'deck' | 'veille'
  const [page, setPage] = usePdfState(1);

  if (openGuide) return <GuideApp />;

  const deckPages = (D.deckBoard?.pages?.length) || 1;
  const veillePages = 1;
  const totalPages = activeDoc === 'deck' ? deckPages : veillePages;

  const switchDoc = (doc) => { setActiveDoc(doc); setPage(1); };

  return (
    <div style={pdfStyles.app}>
      <div style={pdfStyles.toolbar}>
        {/* Sélecteur de document */}
        <div style={{ display: 'flex', gap: 4, marginRight: 8 }}>
          <button
            onClick={() => switchDoc('deck')}
            style={{ ...pdfStyles.tbBtn, background: activeDoc === 'deck' ? 'rgba(27,58,107,0.15)' : 'transparent', fontWeight: activeDoc === 'deck' ? 700 : 400, color: activeDoc === 'deck' ? '#1b3a6b' : 'var(--ink-soft)' }}>
            Deck Board Q3
          </button>
          <button
            onClick={() => switchDoc('veille')}
            style={{ ...pdfStyles.tbBtn, background: activeDoc === 'veille' ? 'rgba(196,66,15,0.12)' : 'transparent', fontWeight: activeDoc === 'veille' ? 700 : 400, color: activeDoc === 'veille' ? '#c4420f' : 'var(--ink-soft)' }}>
            Veille Yassine ⚠
          </button>
        </div>
        <div style={pdfStyles.tbDivider} />
        <div style={pdfStyles.tbGroup}>
          <button style={pdfStyles.tbBtn} onClick={() => setPage(Math.max(1, page-1))}>‹</button>
          <span style={pdfStyles.pageInd}>{page} / {totalPages}</span>
          <button style={pdfStyles.tbBtn} onClick={() => setPage(Math.min(totalPages, page+1))}>›</button>
        </div>
        <div style={pdfStyles.tbDivider} />
        <div style={pdfStyles.tbGroup}>
          <button style={pdfStyles.tbBtn}>—</button>
          <span style={{ fontSize: 11, color: 'var(--ink-soft)', minWidth: 36, textAlign: 'center' }}>100 %</span>
          <button style={pdfStyles.tbBtn}>+</button>
        </div>
        <div style={{ flex: 1 }} />
        <button style={pdfStyles.tbBtn}>🔍</button>
        <button style={pdfStyles.tbBtn}>🖨</button>
        <button style={pdfStyles.tbBtn}>↗</button>
      </div>

      <div style={pdfStyles.body}>
        <div style={pdfStyles.thumbCol} className="scroll">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <div key={p} onClick={() => setPage(p)}
              style={{ ...pdfStyles.thumb, ...(page===p ? pdfStyles.thumbActive : {}) }}>
              <div style={pdfStyles.thumbPage}>
                <div style={{ height: 4, background: activeDoc === 'deck' ? '#1b3a6b' : '#1a2436', width: '70%', margin: '4px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '3px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '2px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '60%', margin: '2px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '6px auto 2px' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '2px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '50%', margin: '2px auto' }} />
              </div>
              <div style={pdfStyles.thumbLabel}>{p}</div>
            </div>
          ))}
        </div>

        <div style={pdfStyles.pageWrap} className="scroll">
          {activeDoc === 'deck' && <DeckBoardPage page={page} deck={D.deckBoard} />}
          {activeDoc === 'veille' && <VeillePage page={page} r={D.yassineVeille} />}
        </div>
      </div>
    </div>
  );
}

// ── Deck PULSE ─────────────────────────────────────────────────
function DeckBoardPage({ page, deck }) {
  const pages = deck.pages || [];
  const slide = pages[page - 1] || {};
  const isFirst = page === 1;
  const deckTitle = deck.title || 'Présentation PULSE';
  return (
    <div style={pdfStyles.page}>
      {isFirst ? (
        <>
          <div style={{ background: '#134547', margin: '-50px -56px 36px', padding: '36px 56px 28px', color: 'white' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Lumio Health · Opération PULSE</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'white', marginBottom: 6, lineHeight: 1.2 }}>{deckTitle}</h1>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Lancement grand public de la Zen Series</div>
            <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Présenté au CODIR élargi · 13 mai 2025</div>
          </div>
          <div style={{ background: '#E3FFF0', borderRadius: 6, padding: '14px 18px', marginBottom: 18, fontSize: 12, color: '#134547', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}>
            📋 Support de cadrage de l'opération PULSE. Il pose l'ambition, la cible et les livrables créatifs attendus pour le lancement du 2 juin.
          </div>
        </>
      ) : (
        <div style={{ borderBottom: '2px solid #134547', paddingBottom: 10, marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', color: '#134547', textTransform: 'uppercase' }}>Lumio Health · PULSE · Cadrage créatif</div>
        </div>
      )}
      <h2 style={{ ...pdfStyles.h2, borderBottomColor: '#134547', color: '#134547' }}>{slide.titre}</h2>
      <pre style={{ ...pdfStyles.p, fontFamily: 'var(--font-sans)', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
        {slide.body}
      </pre>
      <div style={pdfStyles.pageNum}>— {page} —</div>
    </div>
  );
}

// ── Veille Yassine ────────────────────────────────────────────
function VeillePage({ page, r }) {
  return (
    <div style={pdfStyles.page}>
      <VeilleBodyPage r={r} />
    </div>
  );
}

function VeilleBodyPage({ r }) {
  return (
    <>
      <div style={{ borderBottom: '2px solid #134547', paddingBottom: 14, marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: '#c4420f', textTransform: 'uppercase' }}>Veille créative · Yassine Morel · {r.date || 'mai 2025'}</div>
      </div>
      <h1 style={pdfStyles.title}>{r.title || 'Veille créative — wellness & medtech'}</h1>
      <pre style={{ ...pdfStyles.p, fontFamily: 'var(--font-sans)', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
        {r.body}
      </pre>
      <div style={pdfStyles.pageNum}>— 1 —</div>
    </>
  );
}

const pdfStyles = {
  app: { display: 'flex', flexDirection: 'column', height: '100%', background: '#3a3f4a', overflow: 'hidden' },
  toolbar: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px',
    background: 'linear-gradient(180deg, #f0eee8, #e0ded8)',
    borderBottom: '1px solid rgba(0,0,0,0.15)',
    flexShrink: 0
  },
  tbGroup: { display: 'flex', alignItems: 'center', gap: 2 },
  tbDivider: { width: 1, height: 18, background: 'rgba(0,0,0,0.15)', margin: '0 6px' },
  tbBtn: { background: 'transparent', border: 'none', padding: '5px 10px', fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer', borderRadius: 4 },
  pageInd: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)', minWidth: 50, textAlign: 'center' },

  body: { flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 },
  thumbCol: {
    width: 110, flexShrink: 0,
    background: '#2a2e36',
    padding: '12px 8px',
    display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'
  },
  thumb: { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  thumbPage: { width: 80, height: 110, background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', padding: 8 },
  thumbActive: { },
  thumbLabel: { fontSize: 10, color: '#9a9ea8', fontFamily: 'var(--font-mono)' },

  pageWrap: {
    flex: 1, padding: '28px 40px', overflowY: 'auto',
    display: 'flex', justifyContent: 'center'
  },
  page: {
    width: '100%', maxWidth: 580,
    background: 'white', padding: '50px 56px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    fontFamily: 'Georgia, var(--font-display), serif',
    minHeight: 720,
    position: 'relative'
  },
  title: { fontSize: 22, fontWeight: 700, color: '#1a2436', marginBottom: 8, lineHeight: 1.2 },
  byline: { fontSize: 12, color: '#6a6f7a', marginBottom: 24, fontStyle: 'italic' },
  h2: { fontSize: 16, fontWeight: 700, color: '#1a2436', marginTop: 24, marginBottom: 10, paddingBottom: 4, borderBottom: '1px solid #ccc' },
  h3: { fontSize: 13, fontWeight: 700, color: '#3a3f4a', marginTop: 14, marginBottom: 6 },
  p: { fontSize: 12.5, lineHeight: 1.7, color: '#1a2436', marginBottom: 10 },
  ul: { fontSize: 12.5, lineHeight: 1.7, color: '#1a2436', marginLeft: 20, marginBottom: 14 },
  table: { width: '100%', fontSize: 11, borderCollapse: 'collapse', marginBottom: 14, fontFamily: 'var(--font-sans)' },
  warningBox: { background: '#fff8d8', border: '1px solid #c4420f', padding: '10px 14px', fontSize: 12, lineHeight: 1.5, marginBottom: 16, fontFamily: 'var(--font-sans)', color: '#5a3010' },
  handAnnotation: { textAlign: 'right', margin: '4px 0 16px' },
  pageNum: { position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9a9ea8' }
};

// Add table cell styling
const pdfTableStyle = document.createElement('style');
pdfTableStyle.textContent = `
  .${'pdf-table-fix'} {}
  body table th { padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #6a6f7a; border-bottom: 1.5px solid #1a2436; background: #f4f2ee; font-weight: 700; }
  body table td { padding: 6px 8px; border-bottom: 1px solid #e8e6e0; vertical-align: top; }
`;
document.head.appendChild(pdfTableStyle);

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.pdf = PdfApp;
