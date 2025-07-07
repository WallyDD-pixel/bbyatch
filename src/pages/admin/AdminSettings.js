import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const STRIPE_PUBLIC_KEY = 'pk_test_51RfY0J4M2Ak28aOKeiATxWofn76KbIrNeZ9GatrJokl9GIW00ddi4HYRkOqlVDR2kr2fSmFjEehlYVFxhVnCxhkq00ANqIOlkl';

export default function GeneralSettings() {
  const [data, setData] = useState({
    siteName: '',
    email: '',
    phone: '',
    address: '',
    facebook: '',
    instagram: '',
    logo: '',
    favicon: '',
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchGeneral();
    // eslint-disable-next-line
  }, []);

  async function fetchGeneral() {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) setData(prev => ({ ...prev, ...snap.data() }));
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
      const storageRef = ref(storage, `general/${field}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
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
      await updateDoc(doc(db, 'settings', 'general'), data);
      setSuccess('Paramètres généraux mis à jour !');
    } catch (err) {
      setError("Erreur lors de la sauvegarde : " + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 32, background: '#fff', borderRadius: 20, boxShadow: '0 4px 32px #1e90ff22' }}>
      <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: 32, fontWeight: 800, letterSpacing: 1 }}>Paramètres généraux du site</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, gap: 16 }}>
        <button type="button" onClick={() => setActiveTab('general')} style={{ padding: '10px 24px', borderRadius: 8, border: activeTab === 'general' ? '2px solid #1e90ff' : '1px solid #c0d0e0', background: activeTab === 'general' ? '#e6f0fa' : '#f8fafd', color: '#1976d2', fontWeight: 700, cursor: 'pointer' }}>Général</button>
        <button type="button" onClick={() => setActiveTab('stripe')} style={{ padding: '10px 24px', borderRadius: 8, border: activeTab === 'stripe' ? '2px solid #1e90ff' : '1px solid #c0d0e0', background: activeTab === 'stripe' ? '#e6f0fa' : '#f8fafd', color: '#1976d2', fontWeight: 700, cursor: 'pointer' }}>Stripe</button>
      </div>
      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: 10 }}>{success}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', margin: 30 }}>Chargement...</div>
      ) : activeTab === 'general' ? (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={{ fontWeight: 600 }}>Nom du site</label>
            <input name="siteName" value={data.siteName} onChange={handleFieldChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c0d0e0', fontSize: 16, marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Email</label>
            <input name="email" value={data.email} onChange={handleFieldChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c0d0e0', fontSize: 16, marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Téléphone</label>
            <input name="phone" value={data.phone} onChange={handleFieldChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c0d0e0', fontSize: 16, marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Adresse</label>
            <input name="address" value={data.address} onChange={handleFieldChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c0d0e0', fontSize: 16, marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Facebook</label>
            <input name="facebook" value={data.facebook} onChange={handleFieldChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c0d0e0', fontSize: 16, marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Instagram</label>
            <input name="instagram" value={data.instagram} onChange={handleFieldChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #c0d0e0', fontSize: 16, marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Logo</label>
            <input type="file" accept="image/*" onChange={e => handleImageUpload('logo', e.target.files[0])} style={{ display: 'block', marginTop: 8 }} />
            {data.logo && <img src={data.logo} alt="logo" style={{ width: 120, marginTop: 10, borderRadius: 8, border: '1px solid #e0e0e0' }} />}
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Favicon</label>
            <input type="file" accept="image/*" onChange={e => handleImageUpload('favicon', e.target.files[0])} style={{ display: 'block', marginTop: 8 }} />
            {data.favicon && <img src={data.favicon} alt="favicon" style={{ width: 48, marginTop: 10, borderRadius: 8, border: '1px solid #e0e0e0' }} />}
          </div>
          <button type="submit" style={{ background: '#1e90ff', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 0', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginTop: 10, boxShadow: '0 2px 8px #1e90ff22' }}>
            Enregistrer
          </button>
        </form>
      ) : (
        <div style={{ background: '#f8fafd', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px #1e90ff11', textAlign: 'center' }}>
          <h3 style={{ color: '#1976d2', marginBottom: 18 }}>Clé publique Stripe</h3>
          <div style={{ fontSize: 16, background: '#fff', border: '1px solid #c0d0e0', borderRadius: 8, padding: 16, wordBreak: 'break-all', display: 'inline-block', marginBottom: 10 }}>
            {STRIPE_PUBLIC_KEY}
          </div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
            Cette clé est utilisée pour l’intégration Stripe côté client.<br />Ne la partagez pas publiquement.
          </div>
        </div>
      )}
    </div>
  );
}
