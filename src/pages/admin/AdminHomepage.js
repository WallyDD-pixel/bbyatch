import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaImage, FaUpload, FaSave, FaHome } from 'react-icons/fa';

export default function AdminHomepage() {
  const [data, setData] = useState({ accueil: '' });
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHomepage();
  }, []);

  async function fetchHomepage() {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'settings', 'homepage'));
      if (snap.exists()) {
        setData({
          accueil: snap.data().accueil || '',
        });
      }
    } catch (err) {
      setError("Erreur lors du chargement : " + err.message);
    }
    setLoading(false);
  }

  async function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(''); 
    setSuccess('');
    setLoading(true);
    try {
      await updateDoc(doc(db, 'settings', 'homepage'), { accueil: data.accueil });
      setSuccess('Image d\'accueil mise à jour avec succès !');
    } catch (err) {
      setError("Erreur lors de la sauvegarde : " + err.message);
    }
    setLoading(false);
  }

  async function handleImageChange(e) {
    setError(''); 
    setSuccess('');
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadLoading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `homepage/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setData({ ...data, accueil: url });
      setSuccess('Image uploadée ! Cliquez sur Enregistrer pour valider.');
    } catch (err) {
      setError("Erreur lors de l'upload : " + err.message);
    }
    setUploadLoading(false);
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #2a2d35',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ 
          color: '#9ca3af', 
          fontSize: '16px', 
          fontWeight: 500 
        }}>
          Chargement des paramètres...
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'transparent',
      minHeight: '100%',
      color: '#e8eaed'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          margin: 0,
          fontSize: '28px',
          fontWeight: 700,
          color: '#e8eaed',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaHome style={{ color: '#3b82f6' }} />
          Gestion de l'image d'accueil
        </h1>
        <p style={{ 
          margin: 0, 
          color: '#9ca3af', 
          fontSize: '16px' 
        }}>
          Gérez l'image principale qui s'affiche sur la page d'accueil de votre site
        </p>
      </div>

      {/* Messages */}
      {success && (
        <div style={{
          background: '#065f46',
          color: '#10b981',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: 500,
          border: '1px solid #10b981'
        }}>
          ✅ {success}
        </div>
      )}

      {error && (
        <div style={{
          background: '#7f1d1d',
          color: '#ef4444',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: 500,
          border: '1px solid #ef4444'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSave}>
        <div style={{
          background: '#1a1d23',
          borderRadius: '12px',
          padding: '32px',
          border: '1px solid #2a2d35',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#e8eaed',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaImage style={{ color: '#3b82f6' }} />
            Image d'accueil
          </h3>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: '#e8eaed',
              fontSize: '14px'
            }}>
              URL de l'image
            </label>
            <input 
              name="accueil" 
              value={data.accueil} 
              onChange={handleChange}
              placeholder="https://exemple.com/image.jpg"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#2a2d35',
                color: '#e8eaed',
                marginBottom: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: '#e8eaed',
              fontSize: '14px'
            }}>
              Ou télécharger une nouvelle image
            </label>
            <div style={{
              position: 'relative',
              display: 'inline-block'
            }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                disabled={uploadLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: '#2a2d35',
                  color: '#e8eaed',
                  cursor: uploadLoading ? 'not-allowed' : 'pointer'
                }}
              />
              {uploadLoading && (
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  border: '2px solid #374151',
                  borderTop: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              )}
            </div>
          </div>

          {/* Aperçu de l'image */}
          {data.accueil && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#e8eaed',
                marginBottom: '12px'
              }}>
                Aperçu de l'image
              </h4>
              <div style={{
                border: '1px solid #374151',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#2a2d35'
              }}>
                <img 
                  src={data.accueil} 
                  alt="Image d'accueil" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '300px', 
                    objectFit: 'cover',
                    display: 'block'
                  }} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '200px',
                  color: '#9ca3af',
                  fontSize: '14px'
                }}>
                  ❌ Impossible de charger l'image
                </div>
              </div>
            </div>
          )}

          {/* Conseils */}
          <div style={{
            background: '#2a2d35',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #374151',
            color: '#9ca3af',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            <strong style={{ color: '#e8eaed' }}>💡 Conseils :</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Utilisez une image de haute qualité (minimum 1920x1080)</li>
              <li>Formats recommandés : JPG, PNG, WebP</li>
              <li>Évitez les images trop lourdes (max 2MB)</li>
              <li>L'image sera redimensionnée automatiquement</li>
            </ul>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            disabled={loading || uploadLoading}
            style={{
              background: (loading || uploadLoading) ? '#6b7280' : '#10b981',
              border: 'none',
              color: '#fff',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: (loading || uploadLoading) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto',
              transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <FaSave />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
