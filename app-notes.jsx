// ══════════════════════════════════════════════════════════════
//  NOTES APP — BC6 (PAC 4-III) · Note Théo + contexte Lumio + perso
// ══════════════════════════════════════════════════════════════

function NotesApp({ openNote }) {
  const D = window.LUMIO_DATA;
  const notes = [
    {
      id: 'theo',
      title: D.theoNote.title,
      date: D.theoNote.date,
      preview: 'Ce que la Zen Series ne doit pas casser…',
      theo: D.theoNote
    },
    {
      id: 'contexte',
      title: D.contexte.title,
      date: 'Mise à jour mai 2025',
      preview: 'Lumio Health franchit un cap : lancement grand public…',
      contexte: D.contexte
    },
    {
      id: 'd1', title: 'PULSE — points à tenir avant le CODIR', date: '12 mai 2025',
      preview: 'Singularité des axes · indicateur par proposition · garde-fous B2B…',
      distractor: false,
      body: '— Chaque axe doit être SINGULIER : si je peux remplacer "Lumio" par une autre marque wellness, c\'est mort\n— Un indicateur d\'impact par proposition (Jakob l\'exige) : engagement, portée, mémorisation ou intention\n— La preuve scientifique INTÉGRÉE à la création, pas en disclaimer\n— Garde-fous Camille : rien qui froisse les clients B2B (mutuelles, DRH)\n— Territoire "lucidité" plutôt que "sérénité" — sortir du champ lexical du calme\n— Au moins UN format réellement innovant dans le portefeuille (C.21-III)'
    },
    {
      id: 'd2', title: 'Notes perso — week-end', date: '10 mai 2025',
      preview: 'Rucola, vin blanc, appeler maman dimanche…',
      distractor: true,
      body: '— Marché dimanche matin\n— Rucola + pecorino\n— Appeler maman\n— Vin blanc pour samedi soir'
    }
  ];

  const [selectedId, setSelectedId] = React.useState(openNote || 'theo');
  const note = notes.find(n => n.id === selectedId) || notes[0];

  return (
    <div style={notesStyles.app}>
      <div style={notesStyles.sidebar} className="scroll">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--rule)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Toutes les notes</div>
        </div>
        {notes.map(n => (
          <div
            key={n.id}
            onClick={() => setSelectedId(n.id)}
            style={{ ...notesStyles.row, ...(selectedId === n.id ? notesStyles.rowActive : {}) }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{n.title}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 500 }}>{n.date}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.preview}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={notesStyles.editor} className="scroll">
        <div style={{ padding: '8px 28px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--ink-faint)' }}>
          <span>Aa</span><span>•</span><span>—</span><span>𝐁 𝑰 𝑈̲</span><span>· · ·</span>
          <div style={{ flex: 1 }} />
          <span>{note.date}</span>
        </div>
        {note.theo ? <TheoNoteRender data={note.theo} /> :
         note.contexte ? <ContexteNoteRender data={note.contexte} /> : (
          <div style={{ padding: '24px 32px', fontFamily: 'var(--font-display)', fontSize: 14, lineHeight: 1.8, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, marginBottom: 10 }}>{note.title}</h1>
            {note.body}
          </div>
        )}
      </div>
    </div>
  );
}

function TheoNoteRender({ data }) {
  return (
    <div style={{ padding: '28px 36px', fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: '#c4420f', textTransform: 'uppercase', marginBottom: 12 }}>{data.tag} — {data.author}</div>
      <h1 style={{ fontSize: 26, fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: 4 }}>{data.title}</h1>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)', borderBottom: '1px solid var(--rule)', paddingBottom: 14, marginBottom: 20 }}>
        {data.author} · {data.date}
      </div>
      <div style={{ background: '#fff8d8', border: '1px solid #c4420f', padding: '10px 14px', borderRadius: 4, fontSize: 12, color: '#5a3010', lineHeight: 1.55, marginBottom: 20, fontFamily: 'var(--font-sans)' }}>
        ⚠ Ce document n'est pas destiné à être partagé. Il a été mis dans votre espace par Sonia — « à vous de juger comment l'utiliser ».
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--ink-soft)', whiteSpace: 'pre-wrap' }}>
        {data.body}
      </div>
    </div>
  );
}

function ContexteNoteRender({ data }) {
  return (
    <div style={{ padding: '28px 36px', fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: '#1b3a6b', textTransform: 'uppercase', marginBottom: 12 }}>FICHE CONTEXTE — Lumio Health</div>
      <h1 style={{ fontSize: 26, fontWeight: 400, lineHeight: 1.15, marginBottom: 4 }}>{data.title}</h1>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)', borderBottom: '1px solid var(--rule)', paddingBottom: 14, marginBottom: 20 }}>{data.subtitle}</div>
      <div style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--ink-soft)', whiteSpace: 'pre-wrap' }}>
        {data.body}
      </div>
    </div>
  );
}

const notesStyles = {
  app: { display: 'flex', height: '100%', background: 'white', overflow: 'hidden' },
  sidebar: { width: 240, flexShrink: 0, borderRight: '1px solid var(--rule)', background: '#fafaf8', overflowY: 'auto' },
  row: { padding: '10px 16px', borderBottom: '1px solid var(--rule)', cursor: 'pointer' },
  rowActive: { background: 'rgba(224,181,58,0.18)', borderLeft: '3px solid #e0b53a', paddingLeft: 13 },
  editor: { flex: 1, background: 'white', overflowY: 'auto', minHeight: 0 }
};

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.notes = NotesApp;
