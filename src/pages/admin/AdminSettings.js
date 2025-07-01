// Page de gestion des paramètres (structure de base)
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const snap = await getDocs(collection(db, 'settings'));
    setSettings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  }

  async function handleImageChange(docId, field, file) {
    setError(''); setSuccess('');
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `settings/${docId}_${field}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'settings', docId), { [field]: url });
      setSuccess('Image mise à jour !');
      fetchSettings();
    } catch (err) {
      setError("Erreur lors de l'upload : " + err.message);
    }
  }

  async function handleUrlChange(docId, field, url) {
    setError(''); setSuccess('');
    try {
      await updateDoc(doc(db, 'settings', docId), { [field]: url });
      setSuccess('Image mise à jour !');
      fetchSettings();
    } catch (err) {
      setError("Erreur lors de la mise à jour : " + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(30,60,60,0.08)' }}>
      <h2 style={{ textAlign: 'center', color: '#1e90ff', marginBottom: 32 }}>Paramètres - Images</h2>
      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: 10 }}>{success}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', margin: 30 }}>Chargement...</div>
      ) : (
        settings.map(setting => (
          <div key={setting.id} style={{ marginBottom: 36, borderBottom: '1px solid #e0e0e0', paddingBottom: 24 }}>
            <h4 style={{ color: '#1e90ff', marginBottom: 18 }}>{setting.id}</h4>
            {Object.entries(setting).filter(([k]) => k !== 'id').map(([field, value]) => (
              typeof value === 'string' && value.startsWith('http') ? (
                <div key={field} style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{field}</div>
                  <img src={value} alt={field} style={{ width: 180, height: 120, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e0e0e0', marginBottom: 8 }} />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => e.target.files[0] && handleImageChange(setting.id, field, e.target.files[0])}
                      style={{ marginRight: 8 }}
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={e => handleUrlChange(setting.id, field, e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #c0d0e0', fontSize: 15, flex: 1 }}
                    />
                  </div>
                </div>
              ) : null
            ))}
          </div>
        ))
      )}
    </div>
  );
}
