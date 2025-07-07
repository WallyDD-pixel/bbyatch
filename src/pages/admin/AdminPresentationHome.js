import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function AdminPresentationHome() {
  const [data, setData] = useState({ titre: '', texte: '', image: '' });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPresentation();
  }, []);

  async function fetchPresentation() {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'settings', 'presentationHome'));
      if (snap.exists()) {
        setData(snap.data()); // Récupère dynamiquement tous les champs
      }
    } catch (err) {
      setError("Erreur lors du chargement : " + err.message);
    }
    setLoading(false);
  }

  function handleFieldChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  function handlePilierChange(idx, field, value) {
    const newPiliers = [...(data.piliers || [])];
    newPiliers[idx][field] = value;
    setData({ ...data, piliers: newPiliers });
  }

  // Affichage dynamique de tous les champs sauf piliers, avec sousTitre puis titre en premier
  function renderFields() {
    const entries = Object.entries(data).filter(([k]) => k !== 'piliers');
    // Trie pour mettre sousTitre puis titre en premier
    entries.sort(([a], [b]) => {
      if (a === 'sousTitre') return -2;
      if (b === 'sousTitre') return 2;
      if (a === 'titre') return -1;
      if (b === 'titre') return 1;
      return 0;
    });
    return entries.map(([k, v]) => (
      <div key={k} style={{ marginBottom: 18 }}>
        <label style={{ fontWeight: 600 }}>{k}</label>
        {typeof v === 'string' ? (
          k.toLowerCase().includes('texte') || k.toLowerCase().includes('desc') ? (
            <textarea name={k} value={v} onChange={handleFieldChange} rows={3} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c0d0e0', fontSize: 16, marginTop: 4 }} />
          ) : (
            <input name={k} value={v} onChange={handleFieldChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c0d0e0', fontSize: 16, marginTop: 4 }} />
          )
        ) : typeof v === 'number' ? (
          <input name={k} type="number" value={v} onChange={handleFieldChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c0d0e0', fontSize: 16, marginTop: 4 }} />
        ) : typeof v === 'boolean' ? (
          <input name={k} type="checkbox" checked={v} onChange={e => handleFieldChange({ target: { name: k, value: e.target.checked } })} style={{ marginLeft: 8 }} />
        ) : (
          <pre style={{ background: '#f4f8fb', borderRadius: 8, padding: 10, fontSize: 14, marginTop: 4 }}>{JSON.stringify(v, null, 2)}</pre>
        )}
      </div>
    ));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await updateDoc(doc(db, 'settings', 'presentationHome'), data);
      setSuccess('Présentation mise à jour !');
    } catch (err) {
      setError("Erreur lors de la sauvegarde : " + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 20, boxShadow: '0 4px 32px #1e90ff22' }}>
      <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: 32, fontWeight: 800, letterSpacing: 1 }}>Présentation de la page d’accueil</h2>
      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: 10 }}>{success}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', margin: 30 }}>Chargement...</div>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Champs dynamiques */}
          {renderFields()}
          {/* Piliers (tableau d'objets) */}
          {Array.isArray(data.piliers) && (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
              {data.piliers.map((p, idx) => (
                <div key={idx} style={{ background: '#fafdff', borderRadius: 14, boxShadow: '0 2px 8px #1e90ff11', border: '2px solid #e6f0fa', padding: 18, minWidth: 220, maxWidth: 260, flex: 1 }}>
                  {Object.entries(p).map(([field, value]) => (
                    <div key={field} style={{ marginBottom: 8 }}>
                      <label style={{ fontWeight: 600 }}>{field}</label>
                      {field === 'color' ? (
                        <input
                          type="color"
                          value={value}
                          onChange={e => handlePilierChange(idx, field, e.target.value)}
                          style={{ width: 48, height: 32, border: 'none', background: 'none', marginRight: 8, verticalAlign: 'middle' }}
                        />
                      ) : field === 'texte' ? (
                        <textarea value={value} onChange={e => handlePilierChange(idx, field, e.target.value)} rows={3} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #c0d0e0', fontSize: 15, marginTop: 4 }} />
                      ) : (
                        <input value={value} onChange={e => handlePilierChange(idx, field, e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #c0d0e0', fontSize: 15, marginTop: 4 }} />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          <button type="submit" style={{ background: '#1e90ff', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginTop: 10, boxShadow: '0 2px 8px #1e90ff22' }}>
            Enregistrer
          </button>
        </form>
      )}
    </div>
  );
}
