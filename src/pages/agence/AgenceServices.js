import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes, 
  FaTools, 
  FaShip, 
  FaGasPump, 
  FaCar, 
  FaLifeRing, 
  FaGraduationCap, 
  FaEllipsisH,
  FaSave,
  FaLightbulb
} from 'react-icons/fa';

export default function AgenceServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    prix: '',
    duree: '',
    categorie: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const categories = [
    { value: 'Équipement nautique', icon: <FaLifeRing />, color: '#3b82f6' },
    { value: 'Service de nettoyage', icon: <FaTools />, color: '#10b981' },
    { value: 'Transport', icon: <FaCar />, color: '#f59e0b' },
    { value: 'Carburant', icon: <FaGasPump />, color: '#06b6d4' },
    { value: 'Assistance', icon: <FaShip />, color: '#8b5cf6' },
    { value: 'Formation', icon: <FaGraduationCap />, color: '#f97316' },
    { value: 'Autre', icon: <FaEllipsisH />, color: '#6b7280' }
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const servicesQuery = query(
        collection(db, 'services'),
        where('agenceId', '==', user.uid)
      );
      const snap = await getDocs(servicesQuery);
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des services');
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const user = auth.currentUser;
    if (!user) {
      setError('Non connecté');
      return;
    }

    if (!form.nom || !form.description || !form.prix) {
      setError('Nom, description et prix sont obligatoires');
      return;
    }

    try {
      const serviceData = {
        nom: form.nom,
        description: form.description,
        prix: Number(form.prix),
        duree: form.duree || '',
        categorie: form.categorie || 'Autre',
        agenceId: user.uid,
        updatedAt: new Date()
      };

      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), serviceData);
        setSuccess('Service modifié avec succès !');
        setEditingService(null);
      } else {
        await addDoc(collection(db, 'services'), {
          ...serviceData,
          createdAt: new Date()
        });
        setSuccess('Service ajouté avec succès !');
      }

      setForm({ nom: '', description: '', prix: '', duree: '', categorie: '' });
      setShowForm(false);
      fetchServices();
    } catch (err) {
      setError('Erreur : ' + err.message);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setForm({
      nom: service.nom,
      description: service.description,
      prix: service.prix.toString(),
      duree: service.duree || '',
      categorie: service.categorie || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'services', id));
      setServices(services.filter(s => s.id !== id));
      setSuccess('Service supprimé avec succès !');
    } catch (err) {
      setError('Erreur lors de la suppression : ' + err.message);
    }
  };

  const resetForm = () => {
    setForm({ nom: '', description: '', prix: '', duree: '', categorie: '' });
    setEditingService(null);
    setShowForm(false);
  };

  const getCategoryData = (categoryName) => {
    return categories.find(cat => cat.value === categoryName) || categories[categories.length - 1];
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
          Chargement de vos services...
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
            Nos Services
          </h1>
          <p style={{ 
            margin: 0, 
            color: '#9ca3af', 
            fontSize: '16px' 
          }}>
            Gérez les services additionnels que vous proposez avec vos bateaux
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
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
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#3b82f6';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          }}
        >
          <FaPlus />
          Ajouter un service
        </button>
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

      {/* Formulaire Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#1a1d23',
            borderRadius: '12px',
            padding: '32px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            position: 'relative',
            border: '1px solid #2a2d35'
          }}>
            <button
              onClick={resetForm}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#2a2d35',
                border: '1px solid #374151',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#9ca3af',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#374151';
                e.target.style.color = '#e8eaed';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#2a2d35';
                e.target.style.color = '#9ca3af';
              }}
            >
              <FaTimes />
            </button>

            <h3 style={{ 
              margin: '0 0 24px 0',
              fontSize: '24px',
              fontWeight: 700,
              color: '#e8eaed'
            }}>
              {editingService ? 'Modifier le service' : 'Nouveau service'}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#e8eaed',
                    fontSize: '14px'
                  }}>
                    Nom du service *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    placeholder="Ex: Gilets de sauvetage"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      outline: 'none',
                      background: '#2a2d35',
                      color: '#e8eaed'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#374151';
                      e.target.style.boxShadow = 'none';
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
                    Catégorie
                  </label>
                  <select
                    name="categorie"
                    value={form.categorie}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      outline: 'none',
                      background: '#2a2d35',
                      color: '#e8eaed'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#374151';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description détaillée du service..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    background: '#2a2d35',
                    color: '#e8eaed'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#374151';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: 600,
                    color: '#e8eaed',
                    fontSize: '14px'
                  }}>
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    name="prix"
                    value={form.prix}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      outline: 'none',
                      background: '#2a2d35',
                      color: '#e8eaed'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#374151';
                      e.target.style.boxShadow = 'none';
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
                    Unité de temps
                  </label>
                  <input
                    type="text"
                    name="duree"
                    value={form.duree}
                    onChange={handleChange}
                    placeholder="Ex: par jour, par heure..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      outline: 'none',
                      background: '#2a2d35',
                      color: '#e8eaed'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#374151';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginTop: '20px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '12px 20px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    background: '#2a2d35',
                    color: '#9ca3af',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#374151';
                    e.target.style.color = '#e8eaed';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#2a2d35';
                    e.target.style.color = '#9ca3af';
                  }}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '12px 20px',
                    background: '#3b82f6',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#3b82f6';
                  }}
                >
                  <FaSave />
                  {editingService ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des services */}
      {services.length === 0 ? (
        <div style={{
          background: '#2a2d35',
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center',
          border: '2px dashed #374151'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>
            🛠️
          </div>
          <h3 style={{ 
            color: '#e8eaed', 
            marginBottom: '12px',
            fontSize: '20px',
            fontWeight: 600
          }}>
            Aucun service disponible
          </h3>
          <p style={{ 
            color: '#9ca3af', 
            margin: 0,
            fontSize: '16px'
          }}>
            Commencez par ajouter votre premier service pour enrichir votre offre
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {services.map(service => {
            const categoryData = getCategoryData(service.categorie);
            return (
              <div 
                key={service.id}
                style={{
                  background: '#2a2d35',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #374151',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
                  e.currentTarget.style.borderColor = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                  e.currentTarget.style.borderColor = '#374151';
                }}
              >
                {/* Header avec catégorie */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: `${categoryData.color}20`,
                    borderRadius: '16px',
                    border: `1px solid ${categoryData.color}40`
                  }}>
                    <span style={{ color: categoryData.color, fontSize: '12px' }}>
                      {categoryData.icon}
                    </span>
                    <span style={{
                      color: categoryData.color,
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {service.categorie || 'Non définie'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleEdit(service)}
                      style={{
                        background: '#374151',
                        border: '1px solid #4b5563',
                        borderRadius: '6px',
                        padding: '8px',
                        cursor: 'pointer',
                        color: '#3b82f6',
                        transition: 'all 0.2s',
                        fontSize: '12px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#4b5563';
                        e.target.style.borderColor = '#6b7280';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#374151';
                        e.target.style.borderColor = '#4b5563';
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      style={{
                        background: '#374151',
                        border: '1px solid #4b5563',
                        borderRadius: '6px',
                        padding: '8px',
                        cursor: 'pointer',
                        color: '#ef4444',
                        transition: 'all 0.2s',
                        fontSize: '12px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#4b5563';
                        e.target.style.borderColor = '#6b7280';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#374151';
                        e.target.style.borderColor = '#4b5563';
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Contenu */}
                <h4 style={{ 
                  margin: '0 0 12px 0',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#e8eaed'
                }}>
                  {service.nom}
                </h4>
                
                <p style={{ 
                  color: '#9ca3af',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  margin: '0 0 20px 0'
                }}>
                  {service.description}
                </p>

                {/* Prix et durée */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0 0 0',
                  borderTop: '1px solid #374151'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#10b981'
                    }}>
                      {service.prix}€
                    </span>
                    {service.duree && (
                      <span style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        fontWeight: 500
                      }}>
                        / {service.duree}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section conseils */}
      <div style={{
        marginTop: '40px',
        background: '#2a2d35',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #374151'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            background: '#3b82f6',
            borderRadius: '8px',
            padding: '8px',
            color: '#fff',
            fontSize: '14px'
          }}>
            <FaLightbulb />
          </div>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            color: '#e8eaed'
          }}>
            Conseils pour optimiser vos services
          </h3>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '12px',
          color: '#9ca3af',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          <div>• Décrivez clairement ce qui est inclus dans chaque service</div>
          <div>• Fixez des prix compétitifs en étudiant la concurrence locale</div>
          <div>• Organisez vos services par catégories pour faciliter la navigation</div>
          <div>• Mettez à jour régulièrement vos prix et descriptions</div>
        </div>
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