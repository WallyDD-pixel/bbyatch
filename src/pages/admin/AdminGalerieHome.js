import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminGalerieHome() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGalerie();
  }, []);

  async function fetchGalerie() {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'settings', 'galerieHome'));
      setImages(snap.exists() && Array.isArray(snap.data().images) ? snap.data().images : []);
    } catch (err) {
      setError("Erreur lors du chargement : " + err.message);
    }
    setLoading(false);
  }

  async function addImage(file) {
    setError(''); setSuccess('');
    
    // Vérifier la limite de 4 images
    if (images.length >= 4) {
      setError('Vous ne pouvez avoir que 4 images maximum dans la galerie d\'accueil.');
      return;
    }
    
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `settings/galerieHome_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'settings', 'galerieHome'), { images: arrayUnion(url) });
      setSuccess('Image ajoutée !');
      fetchGalerie();
    } catch (err) {
      setError("Erreur lors de l'ajout : " + err.message);
    }
  }

  async function removeImage(url) {
    setError(''); setSuccess('');
    try {
      await updateDoc(doc(db, 'settings', 'galerieHome'), { images: arrayRemove(url) });
      setSuccess('Image supprimée !');
      fetchGalerie();
    } catch (err) {
      setError("Erreur lors de la suppression : " + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 20, boxShadow: '0 4px 32px #1e90ff22' }}>
      <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: 32, fontWeight: 800, letterSpacing: 1 }}>Galerie d'accueil</h2>
      
      {/* Message informatif sur la limite */}
      <div style={{ textAlign: 'center', marginBottom: 20, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
        <p style={{ margin: 0, color: '#6c757d', fontSize: 14 }}>
          Vous pouvez ajouter jusqu'à 4 images dans la galerie d'accueil ({images.length}/4)
        </p>
      </div>
      
      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: 10 }}>{success}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', margin: 30 }}>Chargement...</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', marginBottom: 24 }}>
          {images.map((img, idx) => (
            <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
              <img src={img} alt={'galerie'+idx} style={{ width: 180, height: 120, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #e0e0e0', boxShadow: '0 2px 8px #1976d222' }} />
              <button onClick={() => removeImage(img)} style={{ position: 'absolute', top: 6, right: 6, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontWeight: 700, fontSize: 18, boxShadow: '0 2px 8px #e74c3c22' }}>×</button>
            </div>
          ))}
          {images.length < 4 && (
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 180, height: 120, border: '2px dashed #1e90ff', borderRadius: 10, cursor: 'pointer', color: '#1e90ff', fontWeight: 700, fontSize: 38 }}>
              +
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && addImage(e.target.files[0])} />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
