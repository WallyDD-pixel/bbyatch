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
      setError('Vous ne pouvez avoir que 4 images maximum dans la galerie.');
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
    <div style={{ 
      maxWidth: 800, 
      margin: '40px auto', 
      padding: '32px', 
      backgroundColor: '#ffffff', 
      borderRadius: 8, 
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)', 
      border: '1px solid #e9ecef' 
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: '#2c3e50', 
        marginBottom: '32px', 
        fontWeight: 600, 
        fontSize: 24 
      }}>
        Galerie d'accueil
      </h2>
      
      {/* Message informatif sobre */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 24, 
        padding: '16px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: 8, 
        color: '#6c757d',
        fontWeight: 500,
        fontSize: 14,
        border: '1px solid #e9ecef'
      }}>
        📷 Vous pouvez ajouter jusqu'à 4 images maximum dans la galerie d'accueil ({images.length}/4)
      </div>
      
      {error && (
        <div style={{ 
          color: '#e74c3c', 
          textAlign: 'center', 
          marginBottom: 16, 
          padding: '12px',
          backgroundColor: '#fdf2f2',
          borderRadius: 6,
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ 
          color: '#27ae60', 
          textAlign: 'center', 
          marginBottom: 16,
          padding: '12px',
          backgroundColor: '#f2f8f2',
          borderRadius: 6,
          border: '1px solid #c3e6cb'
        }}>
          {success}
        </div>
      )}
      
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          margin: '40px 0',
          color: '#6c757d',
          fontSize: 16
        }}>
          Chargement...
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 20, 
          justifyContent: 'center', 
          marginBottom: 24 
        }}>
          {images.map((img, idx) => (
            <div key={idx} style={{ 
              position: 'relative', 
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e9ecef',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
            }}>
              <img 
                src={img} 
                alt={`Galerie ${idx + 1}`} 
                style={{ 
                  width: '100%', 
                  height: 140, 
                  objectFit: 'cover',
                  display: 'block'
                }} 
              />
              <button 
                onClick={() => removeImage(img)} 
                style={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  backgroundColor: '#e74c3c', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '50%', 
                  width: 28, 
                  height: 28, 
                  cursor: 'pointer', 
                  fontWeight: 600, 
                  fontSize: 16, 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#c0392b';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#e74c3c';
                }}
              >
                ×
              </button>
            </div>
          ))}
          
          {/* Bouton d'ajout sobre */}
          {images.length < 4 && (
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: 140, 
              border: '2px dashed #bdc3c7', 
              borderRadius: 8, 
              cursor: 'pointer', 
              color: '#6c757d', 
              fontWeight: 600, 
              fontSize: 32,
              backgroundColor: '#f8f9fa',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3498db';
              e.currentTarget.style.color = '#3498db';
              e.currentTarget.style.backgroundColor = '#f0f8ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#bdc3c7';
              e.currentTarget.style.color = '#6c757d';
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}>
              +
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={e => e.target.files[0] && addImage(e.target.files[0])} 
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}