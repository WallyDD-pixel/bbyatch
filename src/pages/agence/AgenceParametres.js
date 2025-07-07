import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaSave, 
  FaBuilding,
  FaEdit,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

export default function AgenceParametres() {
  const [agenceInfo, setAgenceInfo] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    description: '',
    siteWeb: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchAgenceInfo();
  }, []);

  async function fetchAgenceInfo() {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const agenceDoc = await getDoc(doc(db, 'agences', user.uid));
      if (agenceDoc.exists()) {
        setAgenceInfo(agenceDoc.data());
      } else {
        // Initialiser avec les informations de base de l'utilisateur
        setAgenceInfo(prev => ({
          ...prev,
          email: user.email || '',
          nom: user.displayName || ''
        }));
      }
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des informations');
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setAgenceInfo({
      ...agenceInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const user = auth.currentUser;
    if (!user) {
      setError('Non connecté');
      setSaving(false);
      return;
    }

    if (!agenceInfo.nom || !agenceInfo.email) {
      setError('Le nom et l\'email sont obligatoires');
      setSaving(false);
      return;
    }

    try {
      const agenceData = {
        ...agenceInfo,
        updatedAt: new Date(),
        agenceId: user.uid
      };

      await setDoc(doc(db, 'agences', user.uid), agenceData, { merge: true });
      
      setSuccess('Informations mises à jour avec succès !');
      setEditMode(false);
    } catch (err) {
      setError('Erreur lors de la sauvegarde : ' + err.message);
    }
    setSaving(false);
  };

  const cancelEdit = () => {
    setEditMode(false);
    fetchAgenceInfo(); // Recharger les données originales
  };

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
          Chargement de vos informations...
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            margin: 0,
            fontSize: '28px',
            fontWeight: 700,
            color: '#e8eaed',
            marginBottom: '8px'
          }}>
            Paramètres de l'agence
          </h1>
          <p style={{ 
            margin: 0, 
            color: '#9ca3af', 
            fontSize: '16px' 
          }}>
            Gérez les informations de votre agence
          </p>
        </div>
        
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            style={{
              background: '#3b82f6',
              border: 'none',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#2563eb';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#3b82f6';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <FaEdit />
            Modifier
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={cancelEdit}
              style={{
                background: '#6b7280',
                border: 'none',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FaTimes />
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                background: saving ? '#6b7280' : '#10b981',
                border: 'none',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {saving ? (
                <>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid transparent',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <FaCheck />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        )}
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
      <div style={{
        background: '#1a1d23',
        borderRadius: '12px',
        padding: '32px',
        border: '1px solid #2a2d35',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Informations principales */}
          <div style={{
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '1px solid #2a2d35'
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
              <FaBuilding style={{ color: '#3b82f6' }} />
              Informations principales
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Nom de l'agence *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={agenceInfo.nom}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: editMode ? '#2a2d35' : '#1f2937',
                    color: '#e8eaed',
                    cursor: editMode ? 'text' : 'not-allowed'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={agenceInfo.email}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: editMode ? '#2a2d35' : '#1f2937',
                    color: '#e8eaed',
                    cursor: editMode ? 'text' : 'not-allowed'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={agenceInfo.telephone}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="Ex: +33 1 23 45 67 89"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: editMode ? '#2a2d35' : '#1f2937',
                    color: '#e8eaed',
                    cursor: editMode ? 'text' : 'not-allowed'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Site web
                </label>
                <input
                  type="url"
                  name="siteWeb"
                  value={agenceInfo.siteWeb}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="Ex: https://mon-agence.com"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: editMode ? '#2a2d35' : '#1f2937',
                    color: '#e8eaed',
                    cursor: editMode ? 'text' : 'not-allowed'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div style={{
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '1px solid #2a2d35'
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
              <FaMapMarkerAlt style={{ color: '#3b82f6' }} />
              Adresse
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Adresse complète
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={agenceInfo.adresse}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="Ex: 123 rue de la Marine"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: editMode ? '#2a2d35' : '#1f2937',
                    color: '#e8eaed',
                    cursor: editMode ? 'text' : 'not-allowed'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Ville
                </label>
                <input
                  type="text"
                  name="ville"
                  value={agenceInfo.ville}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="Ex: Cannes"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: editMode ? '#2a2d35' : '#1f2937',
                    color: '#e8eaed',
                    cursor: editMode ? 'text' : 'not-allowed'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Code postal
                </label>
                <input
                  type="text"
                  name="codePostal"
                  value={agenceInfo.codePostal}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="Ex: 06400"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: editMode ? '#2a2d35' : '#1f2937',
                    color: '#e8eaed',
                    cursor: editMode ? 'text' : 'not-allowed'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#e8eaed',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FaUser style={{ color: '#3b82f6' }} />
              Description
            </h3>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 600,
                color: '#e8eaed',
                fontSize: '14px'
              }}>
                Présentation de votre agence
              </label>
              <textarea
                name="description"
                rows="4"
                value={agenceInfo.description}
                onChange={handleChange}
                disabled={!editMode}
                placeholder="Décrivez votre agence, vos services, votre expertise..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: editMode ? '#2a2d35' : '#1f2937',
                  color: '#e8eaed',
                  cursor: editMode ? 'text' : 'not-allowed',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}