import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminServicesHome() {
  const [data, setData] = useState({ sousTitre: '', sousTexte: '', titre: '', texte: '' });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  // Ajout d'un état pour chaque image
  const [images, setImages] = useState({});

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'settings', 'services'));
      if (snap.exists()) {
        setData(snap.data());
        // Pré-remplit les images si des URLs existent
        const initialImages = {};
        Object.entries(snap.data()).forEach(([k, v]) => {
          if (typeof v === 'string' && (v.startsWith('http') || v.startsWith('/')) && v.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
            initialImages[k] = v;
          }
        });
        setImages(initialImages);
      }
    } catch (err) {
      setError("Erreur lors du chargement : " + err.message);
    }
    setLoading(false);
  }

  function handleFieldChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  async function handleImageUpload(field, file) {
    setError(''); setSuccess('');
    if (!file) return;
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `services/${field}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImages(prev => ({ ...prev, [field]: url }));
      setData(prev => ({ ...prev, [field]: url }));
      setSuccess('Image uploadée ! Cliquez sur Enregistrer pour valider.');
    } catch (err) {
      setError("Erreur lors de l'upload : " + err.message);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await updateDoc(doc(db, 'settings', 'services'), data);
      setSuccess('Section services mise à jour !');
    } catch (err) {
      setError("Erreur lors de la sauvegarde : " + err.message);
    }
  }

  function renderFields() {
    return Object.entries(data)
      .map(([k, v]) => {
        // On considère que tout champ dont la valeur est une URL http(s) ou / et qui contient .jpg, .jpeg, .png, .gif, .webp, .avif est une image
        const isImage = typeof v === 'string' && (v.startsWith('http') || v.startsWith('/')) && v.match(/\.(jpg|jpeg|png|gif|webp|avif)(\?.*)?$/i);
        return (
          <div key={k} style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>{k}</label>
            {isImage ? (
              <>
                <div style={{ margin: '8px 0' }}>
                  <img src={images[k] || v} alt={k} style={{ width: 200, borderRadius: 8, border: '1px solid #e0e0e0', objectFit: 'cover' }} />
                </div>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(k, e.target.files[0])} style={{ display: 'block', marginTop: 8 }} />
              </>
            ) : (
              <>
                {k.toLowerCase().includes('texte') || k.toLowerCase().includes('desc') ? (
                  <textarea name={k} value={v} onChange={handleFieldChange} rows={3} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c0d0e0', fontSize: 16, marginTop: 4 }} />
                ) : (
                  <input name={k} value={v} onChange={handleFieldChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c0d0e0', fontSize: 16, marginTop: 4 }} />
                )}
                {/* Si la valeur est une URL d'image, affiche l'image même si ce n'est pas détecté initialement */}
                {typeof v === 'string' && (v.startsWith('http') || v.startsWith('/')) && v.match(/\.(jpg|jpeg|png|gif|webp|avif)(\?.*)?$/i) && (
                  <img src={images[k] || v} alt={k} style={{ width: 200, borderRadius: 8, border: '1px solid #e0e0e0', marginTop: 8, objectFit: 'cover' }} />
                )}
                <input type="file" accept="image/*" onChange={e => handleImageUpload(k, e.target.files[0])} style={{ display: 'block', marginTop: 8 }} />
              </>
            )}
          </div>
        );
      });
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 20, boxShadow: '0 4px 32px #1e90ff22' }}>
      <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: 32, fontWeight: 800, letterSpacing: 1 }}>Section Services</h2>
      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: 10 }}>{success}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', margin: 30 }}>Chargement...</div>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {renderFields()}
          <button type="submit" style={{ background: '#1e90ff', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 0', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginTop: 10, boxShadow: '0 2px 8px #1e90ff22' }}>
            Enregistrer
          </button>
        </form>
      )}
    </div>
  );
}
