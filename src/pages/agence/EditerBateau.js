import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function EditerBateau() {
  const { id } = useParams();
  const [form, setForm] = useState({
    nom: '',
    Ville: '',
    moteur: '',
    carburant: '',
    places: '',
    prix: '',
    vitesse: '',
    agence: '',
    dashboard: '',
    photo: [],
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBateau() {
      setLoading(true);
      const docRef = doc(db, 'bateaux', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setForm(f => ({ ...f, ...docSnap.data(), photo: docSnap.data().photo || [] }));
      }
      setLoading(false);
    }
    fetchBateau();
    // eslint-disable-next-line
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Suppression d'une image
  const handleDeletePhoto = (i) => {
    setForm(f => ({ ...f, photo: f.photo.filter((_, idx) => idx !== i) }));
  };
  // Ajout/remplacement d'une image
  const handlePhotoChange = (i, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(f => {
        const newPhotos = [...f.photo];
        newPhotos[i] = reader.result;
        return { ...f, photo: newPhotos };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await updateDoc(doc(db, 'bateaux', id), {
        nom: form.nom,
        Ville: form.Ville,
        moteur: Number(form.moteur),
        carburant: Number(form.carburant),
        places: Number(form.places),
        prix: Number(form.prix),
        vitesse: Number(form.vitesse),
        agence: form.agence || '',
        dashboard: form.dashboard || '',
        photo: form.photo,
      });
      setSuccess('Bateau modifié !');
      setTimeout(() => navigate('/agence/dashboard/bateaux'), 1200);
    } catch (err) {
      setError('Erreur : ' + err.message);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #1e90ff22' }}>
      <h2 style={{ color: '#1e90ff', marginBottom: 24 }}>Modifier le bateau</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <input name="nom" value={form.nom} onChange={handleChange} placeholder="Nom du bateau" className="form-control" />
        <input name="Ville" value={form.Ville} onChange={handleChange} placeholder="Ville (ex: Nice)" className="form-control" />
        <input name="moteur" value={form.moteur} onChange={handleChange} placeholder="Moteur (chiffre)" type="number" className="form-control" />
        <input name="carburant" value={form.carburant} onChange={handleChange} placeholder="Carburant (litres)" type="number" className="form-control" />
        <input name="places" value={form.places} onChange={handleChange} placeholder="Places" type="number" className="form-control" />
        <input name="prix" value={form.prix} onChange={handleChange} placeholder="Prix (€)" type="number" className="form-control" />
        <input name="vitesse" value={form.vitesse} onChange={handleChange} placeholder="Vitesse (kn)" type="number" className="form-control" />
        <input name="agence" value={form.agence || ''} onChange={handleChange} placeholder="Nom de l'agence" className="form-control" readOnly style={{ background: '#f4f8fb', fontWeight: 600 }} />
        <input name="dashboard" value={form.dashboard} onChange={handleChange} placeholder="Dashboard" className="form-control" />
        <div>
          <label style={{ fontWeight: 600, color: '#0a2342' }}>Photos</label>
          {form.photo && form.photo.length > 0 && form.photo.map((url, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
              <img src={url} alt="miniature" style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e0e0e0', boxShadow: '0 1px 4px #0001', marginRight: 8 }} />
              <input type="file" accept="image/*" onChange={e => handlePhotoChange(i, e)} style={{ flex: 1 }} />
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeletePhoto(i)}>Supprimer</button>
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-success">Enregistrer</button>
        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: 'green', textAlign: 'center' }}>{success}</div>}
      </form>
    </div>
  );
}
