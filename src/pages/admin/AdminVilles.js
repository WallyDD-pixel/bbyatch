// Page de gestion des villes (structure de base)
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

export default function AdminVilles() {
  const [villes, setVilles] = useState([]);
  const [newVille, setNewVille] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVilles();
  }, []);

  async function fetchVilles() {
    setLoading(true);
    const snap = await getDocs(collection(db, 'villes'));
    setVilles(snap.docs.map(doc => ({ id: doc.id, nom: doc.data().nom })));
    setLoading(false);
  }

  async function handleAddVille(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    const nom = newVille.trim();
    if (!nom) { setError('Nom de ville requis'); return; }
    if (villes.some(v => v.nom.toLowerCase() === nom.toLowerCase())) {
      setError('Cette ville existe déjà.');
      return;
    }
    try {
      await addDoc(collection(db, 'villes'), { nom });
      setSuccess('Ville ajoutée !');
      setNewVille('');
      fetchVilles();
    } catch (err) {
      setError("Erreur : " + err.message);
    }
  }

  async function handleDeleteVille(id) {
    if (!window.confirm('Supprimer cette ville ?')) return;
    try {
      await deleteDoc(doc(db, 'villes', id));
      setSuccess('Ville supprimée !');
      fetchVilles();
    } catch (err) {
      setError("Erreur : " + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(30,60,60,0.08)' }}>
      <h2 style={{ textAlign: 'center', color: '#1e90ff', marginBottom: 32 }}>Gestion des villes</h2>
      <form onSubmit={handleAddVille} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          value={newVille}
          onChange={e => setNewVille(e.target.value)}
          placeholder="Ajouter une ville..."
          style={{ flex: 1, padding: '12px 10px', borderRadius: 8, border: '1px solid #c0d0e0', fontSize: 16 }}
        />
        <button type="submit" style={{ background: '#1e90ff', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Ajouter</button>
      </form>
      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: 10 }}>{success}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', margin: 30 }}>Chargement...</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center' }}>
          {villes.map(ville => (
            <div key={ville.id} style={{ background: '#e6f0fa', borderRadius: 14, boxShadow: '0 2px 8px #1e90ff11', padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 14, minWidth: 120, fontWeight: 600, fontSize: 18, color: '#0a2342', position: 'relative' }}>
              {ville.nom}
              <button onClick={() => handleDeleteVille(ville.id)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginLeft: 8, cursor: 'pointer', boxShadow: '0 1px 4px #e74c3c22' }} title="Supprimer">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
