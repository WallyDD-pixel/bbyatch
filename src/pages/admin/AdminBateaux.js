// Page d'ajout et modification de bateaux (structure de base)
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminBateaux() {
  const [form, setForm] = useState({
    nom: '',
    Ville: '',
    moteur: '',
    carburant: '',
    places: '',
    prix: '',
    vitesse: '',
    photo: [''],
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [bateaux, setBateaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [sortField, setSortField] = useState('nom');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    async function fetchBateaux() {
      setLoading(true);
      const snap = await getDocs(collection(db, 'bateaux'));
      setBateaux(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchBateaux();
  }, [success]); // refresh la liste après ajout

  const sortedBateaux = [...bateaux].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (i, value) => {
    const newPhotos = [...form.photo];
    newPhotos[i] = value;
    setForm({ ...form, photo: newPhotos });
  };

  const addPhotoField = () => {
    setForm({ ...form, photo: [...form.photo, ''] });
  };

  const removePhotoField = i => {
    if (form.photo.length === 1) return;
    const newPhotos = form.photo.filter((_, idx) => idx !== i);
    setForm({ ...form, photo: newPhotos });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce bateau ?')) {
      await deleteDoc(doc(db, 'bateaux', id));
      setSuccess('Bateau supprimé !');
    }
  };

  const handleEdit = (bateau) => {
    setEditId(bateau.id);
    setForm({
      nom: bateau.nom || '',
      Ville: bateau.Ville || '',
      moteur: bateau.moteur || '',
      carburant: bateau.carburant || '',
      places: bateau.places || '',
      prix: bateau.prix || '',
      vitesse: bateau.vitesse || '',
      photo: bateau.photo && bateau.photo.length ? bateau.photo : [''],
    });
    setShowForm(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess(''); setError('');
    if (!form.nom || !form.Ville || !form.moteur || !form.carburant || !form.places || !form.prix || !form.vitesse) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    try {
      if (editId) {
        await updateDoc(doc(db, 'bateaux', editId), {
          nom: form.nom,
          Ville: form.Ville,
          moteur: Number(form.moteur),
          carburant: Number(form.carburant),
          places: Number(form.places),
          prix: Number(form.prix),
          vitesse: Number(form.vitesse),
          photo: form.photo.filter(url => url.trim() !== ''),
        });
        setSuccess('Bateau modifié avec succès !');
      } else {
        await addDoc(collection(db, 'bateaux'), {
          nom: form.nom,
          Ville: form.Ville,
          moteur: Number(form.moteur),
          carburant: Number(form.carburant),
          places: Number(form.places),
          prix: Number(form.prix),
          vitesse: Number(form.vitesse),
          photo: form.photo.filter(url => url.trim() !== ''),
        });
        setSuccess('Bateau ajouté avec succès !');
      }
      setForm({ nom: '', Ville: '', moteur: '', carburant: '', places: '', prix: '', vitesse: '', photo: [''] });
      setShowForm(false);
      setEditId(null);
    } catch (err) {
      setError('Erreur lors de l\'ajout/modification : ' + err.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `bateaux/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm(f => ({ ...f, photo: [...f.photo, url] }));
      setSuccess('Image ajoutée !');
    } catch (err) {
      setError("Erreur lors de l'upload : " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(30,60,60,0.08)' }}>
      <h2 style={{ textAlign: 'center', color: '#1e90ff', marginBottom: 32 }}>Gestion des bateaux</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={{ ...addBtnStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>+</span> Ajouter un bateau
          </button>
        )}
      </div>
      {!showForm && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', margin: 30 }}>Chargement...</div>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, background: '#fff' }}>
                <thead>
                  <tr style={{ background: '#e6f0fa' }}>
                    <th style={thStyle} onClick={() => handleSort('nom')}>Nom {sortField === 'nom' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                    <th style={thStyle} onClick={() => handleSort('Ville')}>Ville {sortField === 'Ville' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                    <th style={thStyle} onClick={() => handleSort('moteur')}>Moteur {sortField === 'moteur' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                    <th style={thStyle} onClick={() => handleSort('carburant')}>Carburant {sortField === 'carburant' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                    <th style={thStyle} onClick={() => handleSort('places')}>Places {sortField === 'places' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                    <th style={thStyle} onClick={() => handleSort('prix')}>Prix {sortField === 'prix' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                    <th style={thStyle} onClick={() => handleSort('vitesse')}>Vitesse {sortField === 'vitesse' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
                    <th style={thStyle}>Photos</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBateaux.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={tdStyle}>{b.nom}</td>
                      <td style={tdStyle}>{b.Ville}</td>
                      <td style={tdStyle}>{b.moteur}</td>
                      <td style={tdStyle}>{b.carburant}</td>
                      <td style={tdStyle}>{b.places}</td>
                      <td style={tdStyle}>{b.prix}</td>
                      <td style={tdStyle}>{b.vitesse}</td>
                      <td style={tdStyle}>
                        {b.photo && b.photo.length > 0 ? (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {b.photo.slice(0,3).map((url, i) => (
                              <img key={i} src={url} alt="miniature" style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e0e0e0', boxShadow: '0 1px 4px #0001', margin: '0 8px' }} />
                            ))}
                            {b.photo.length > 3 && <span style={{ fontSize: 13, color: '#888', marginLeft: 4 }}>+{b.photo.length-3}</span>}
                          </div>
                        ) : 'Aucune'}
                      </td>
                      <td style={tdStyle}>
                        <button onClick={() => handleEdit(b)} style={editBtnStyle} title="Modifier">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(b.id)} style={deleteBtnStyle} title="Supprimer">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 24 }}>
          <input name="nom" value={form.nom} onChange={handleChange} placeholder="Nom du bateau" style={inputStyle} />
          <input name="Ville" value={form.Ville} onChange={handleChange} placeholder="Ville" style={inputStyle} />
          <input name="moteur" value={form.moteur} onChange={handleChange} placeholder="Moteur (chiffre)" type="number" style={inputStyle} />
          <input name="carburant" value={form.carburant} onChange={handleChange} placeholder="Carburant (litres)" type="number" style={inputStyle} />
          <input name="places" value={form.places} onChange={handleChange} placeholder="Places" type="number" style={inputStyle} />
          <input name="prix" value={form.prix} onChange={handleChange} placeholder="Prix (€)" type="number" style={inputStyle} />
          <input name="vitesse" value={form.vitesse} onChange={handleChange} placeholder="Vitesse (kn)" type="number" style={inputStyle} />
          <div>
            <label style={{ fontWeight: 600, color: '#0a2342' }}>Photos</label>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ marginBottom: 10 }} />
            {form.photo.map((url, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                {url && url.trim() !== '' && (
                  <img src={url} alt="miniature" style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e0e0e0', boxShadow: '0 1px 4px #0001', margin: '0 8px' }} />
                )}
                <input
                  value={url}
                  onChange={e => handlePhotoChange(i, e.target.value)}
                  placeholder={`URL photo #${i + 1}`}
                  style={{ ...inputStyle, flex: 1, minWidth: 180, display: 'none' }}
                />
                <button type="button" onClick={() => removePhotoField(i)} style={removeBtnStyle} disabled={form.photo.length === 1}>Supprimer</button>
                {i === form.photo.length - 1 && (
                  <button type="button" onClick={addPhotoField} style={addBtnStyle}>Ajouter</button>
                )}
              </div>
            ))}
          </div>
          {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
          {success && <div style={{ color: 'green', textAlign: 'center' }}>{success}</div>}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" style={submitBtnStyle}>{editId ? 'Modifier' : 'Enregistrer'}</button>
            <button type="button" style={cancelBtnStyle} onClick={() => { setShowForm(false); setEditId(null); }}>Annuler</button>
          </div>
        </form>
      )}
    </div>
  );
}

const inputStyle = {
  padding: '12px 10px',
  borderRadius: 8,
  border: '1px solid #c0d0e0',
  fontSize: 16,
};
const submitBtnStyle = {
  background: 'linear-gradient(90deg, #1e90ff 60%, #4fc3f7 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '12px 0',
  fontWeight: 700,
  fontSize: 18,
  cursor: 'pointer',
  minWidth: 140,
  boxShadow: '0 2px 8px #1e90ff22',
  letterSpacing: 1,
  transition: 'background 0.2s, box-shadow 0.2s',
};
const addBtnStyle = {
  background: '#1e90ff',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '0 12px',
  fontWeight: 700,
  fontSize: 20,
  cursor: 'pointer',
};
const removeBtnStyle = {
  background: '#e74c3c',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '0 10px',
  fontWeight: 700,
  fontSize: 20,
  cursor: 'pointer',
};
const cancelBtnStyle = {
  background: '#888',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '12px 0',
  fontWeight: 600,
  fontSize: 17,
  cursor: 'pointer',
  minWidth: 120,
};
const thStyle = { padding: 10, fontWeight: 700, color: '#0a2342', background: '#e6f0fa', borderBottom: '2px solid #b3c6e0' };
const tdStyle = { padding: 8, textAlign: 'center', color: '#0a2342' };
const editBtnStyle = {
  background: 'linear-gradient(90deg, #e6f0fa 60%, #d0e8ff 100%)',
  border: '2px solid #1e90ff',
  borderRadius: '50%',
  color: '#1e90ff',
  fontSize: 20,
  width: 40,
  height: 40,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 4px',
  cursor: 'pointer',
  boxShadow: '0 2px 8px #1e90ff22',
  transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
};
const deleteBtnStyle = {
  background: '#fff0f0',
  border: '1.5px solid #e74c3c',
  borderRadius: '50%',
  color: '#e74c3c',
  fontSize: 18,
  width: 36,
  height: 36,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 4px',
  cursor: 'pointer',
  transition: 'background 0.2s, border 0.2s',
};
