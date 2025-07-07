// Page d'ajout et modification de bateaux (structure de base)
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { FaEdit, FaTrash, FaPlus, FaArrowLeft, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
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
    <div style={{ 
      minHeight: '100vh', 
      background: '#1a1d23', 
      color: '#e8eaed',
      padding: '24px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header avec le style du dashboard */}
      <header style={{
        background: '#2a2d35',
        padding: '24px 32px',
        borderRadius: '16px 16px 0 0',
        border: '1px solid #374151',
        borderBottom: 'none',
        marginBottom: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 20,
              fontWeight: 700
            }}>
              🚤
            </div>
            <div>
              <h1 style={{ 
                margin: 0,
                fontSize: 28,
                fontWeight: 800,
                color: '#e8eaed',
                letterSpacing: '-0.5px'
              }}>
                Gestion des Bateaux
              </h1>
              <p style={{ 
                margin: 0,
                fontSize: 14,
                color: '#9ca3af',
                fontWeight: 500
              }}>
                Gérez votre flotte de bateaux
              </p>
            </div>
          </div>
          
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)} 
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 24px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
                }
              }}
            >
              <FaPlus style={{ fontSize: 14 }} />
              Ajouter un bateau
            </button>
          )}
        </div>
      </header>

      {/* Contenu principal */}
      <main style={{
        background: '#2a2d35',
        border: '1px solid #374151',
        borderTop: 'none',
        borderRadius: '0 0 16px 16px',
        padding: '32px',
        minHeight: '600px'
      }}>
        {!showForm ? (
          <>
            {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '80px 0',
                color: '#9ca3af',
                fontSize: 18
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  border: '3px solid #374151',
                  borderTop: '3px solid #3b82f6',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Chargement des bateaux...
              </div>
            ) : (
              <div style={{ 
                background: '#1e2126',
                borderRadius: 12,
                border: '1px solid #374151',
                overflow: 'hidden'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: 14
                  }}>
                    <thead>
                      <tr style={{ background: '#374151' }}>
                        <th style={{
                          ...modernThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('nom')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Nom
                            {sortField === 'nom' ? (
                              sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
                            ) : <FaSort style={{ opacity: 0.5 }} />}
                          </div>
                        </th>
                        <th style={{
                          ...modernThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('Ville')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Ville
                            {sortField === 'Ville' ? (
                              sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
                            ) : <FaSort style={{ opacity: 0.5 }} />}
                          </div>
                        </th>
                        <th style={{
                          ...modernThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('moteur')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Moteur
                            {sortField === 'moteur' ? (
                              sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
                            ) : <FaSort style={{ opacity: 0.5 }} />}
                          </div>
                        </th>
                        <th style={{
                          ...modernThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('carburant')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Carburant
                            {sortField === 'carburant' ? (
                              sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
                            ) : <FaSort style={{ opacity: 0.5 }} />}
                          </div>
                        </th>
                        <th style={{
                          ...modernThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('places')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Places
                            {sortField === 'places' ? (
                              sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
                            ) : <FaSort style={{ opacity: 0.5 }} />}
                          </div>
                        </th>
                        <th style={{
                          ...modernThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('prix')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Prix (€)
                            {sortField === 'prix' ? (
                              sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
                            ) : <FaSort style={{ opacity: 0.5 }} />}
                          </div>
                        </th>
                        <th style={{
                          ...modernThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('vitesse')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Vitesse (kn)
                            {sortField === 'vitesse' ? (
                              sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
                            ) : <FaSort style={{ opacity: 0.5 }} />}
                          </div>
                        </th>
                        <th style={modernThStyle}>Photos</th>
                        <th style={modernThStyle}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBateaux.map((b, idx) => (
                        <tr key={b.id} style={{ 
                          background: idx % 2 === 0 ? '#1e2126' : '#262a31',
                          transition: 'all 0.2s',
                          ':hover': {
                            background: '#2d3139'
                          }
                        }}>
                          <td style={modernTdStyle}>{b.nom}</td>
                          <td style={modernTdStyle}>{b.Ville}</td>
                          <td style={modernTdStyle}>{b.moteur}</td>
                          <td style={modernTdStyle}>{b.carburant}</td>
                          <td style={modernTdStyle}>{b.places}</td>
                          <td style={modernTdStyle}>{b.prix}€</td>
                          <td style={modernTdStyle}>{b.vitesse}</td>
                          <td style={modernTdStyle}>
                            {b.photo && b.photo.length > 0 ? (
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                                {b.photo.slice(0,3).map((url, i) => (
                                  <img 
                                    key={i} 
                                    src={url} 
                                    alt="miniature" 
                                    style={{ 
                                      width: 60, 
                                      height: 45, 
                                      objectFit: 'cover', 
                                      borderRadius: 8, 
                                      border: '1px solid #374151',
                                      transition: 'transform 0.2s',
                                      cursor: 'pointer'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'
                                    }
                                  />
                                ))}
                                {b.photo.length > 3 && (
                                  <span style={{ 
                                    fontSize: 12, 
                                    color: '#9ca3af', 
                                    alignSelf: 'center',
                                    background: '#374151',
                                    padding: '4px 8px',
                                    borderRadius: 4
                                  }}>
                                    +{b.photo.length-3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: '#6b7280', fontSize: 12 }}>Aucune photo</span>
                            )}
                          </td>
                          <td style={modernTdStyle}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              <button 
                                onClick={() => handleEdit(b)} 
                                style={modernEditBtnStyle}
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                onClick={() => handleDelete(b.id)} 
                                style={modernDeleteBtnStyle}
                                title="Supprimer"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Formulaire avec design moderne sombre */
          <div style={{
            background: '#1e2126',
            borderRadius: 12,
            border: '1px solid #374151',
            padding: '32px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 16, 
              marginBottom: 32,
              paddingBottom: 24,
              borderBottom: '1px solid #374151'
            }}>
              <button 
                onClick={() => { setShowForm(false); setEditId(null); }}
                style={{
                  background: 'transparent',
                  border: '1px solid #374151',
                  color: '#9ca3af',
                  borderRadius: 8,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                  ':hover': {
                    background: '#374151',
                    color: '#e8eaed'
                  }
                }}
              >
                <FaArrowLeft /> Retour
              </button>
              <h2 style={{ 
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: '#e8eaed'
              }}>
                {editId ? 'Modifier le bateau' : 'Ajouter un nouveau bateau'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 24 
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={modernLabelStyle}>Nom du bateau</label>
                <input 
                  name="nom" 
                  value={form.nom} 
                  onChange={handleChange} 
                  placeholder="Nom du bateau"
                  style={modernInputStyle} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={modernLabelStyle}>Ville</label>
                <input 
                  name="Ville" 
                  value={form.Ville} 
                  onChange={handleChange} 
                  placeholder="Ville"
                  style={modernInputStyle} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={modernLabelStyle}>Moteur</label>
                <input 
                  name="moteur" 
                  value={form.moteur} 
                  onChange={handleChange} 
                  placeholder="Puissance moteur"
                  type="number"
                  style={modernInputStyle} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={modernLabelStyle}>Carburant (litres)</label>
                <input 
                  name="carburant" 
                  value={form.carburant} 
                  onChange={handleChange} 
                  placeholder="Capacité carburant"
                  type="number"
                  style={modernInputStyle} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={modernLabelStyle}>Places</label>
                <input 
                  name="places" 
                  value={form.places} 
                  onChange={handleChange} 
                  placeholder="Nombre de places"
                  type="number"
                  style={modernInputStyle} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={modernLabelStyle}>Prix (€)</label>
                <input 
                  name="prix" 
                  value={form.prix} 
                  onChange={handleChange} 
                  placeholder="Prix de location"
                  type="number"
                  style={modernInputStyle} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={modernLabelStyle}>Vitesse (kn)</label>
                <input 
                  name="vitesse" 
                  value={form.vitesse} 
                  onChange={handleChange} 
                  placeholder="Vitesse maximale"
                  type="number"
                  style={modernInputStyle} 
                />
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={modernLabelStyle}>Photos</label>
                <div style={{
                  background: '#2a2d35',
                  border: '2px dashed #374151',
                  borderRadius: 8,
                  padding: '24px',
                  textAlign: 'center',
                  marginBottom: 16
                }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    style={{
                      background: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600
                    }}
                  />
                  <p style={{ 
                    color: '#9ca3af', 
                    fontSize: 14, 
                    margin: '16px 0 0 0' 
                  }}>
                    Glissez-déposez vos images ou cliquez pour sélectionner
                  </p>
                </div>
                
                {form.photo.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 16,
                    marginTop: 16
                  }}>
                    {form.photo.map((url, i) => (
                      <div key={i} style={{
                        background: '#2a2d35',
                        border: '1px solid #374151',
                        borderRadius: 8,
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                      }}>
                        {url && url.trim() !== '' && (
                          <img 
                            src={url} 
                            alt="preview" 
                            style={{ 
                              width: '100%', 
                              height: 120, 
                              objectFit: 'cover', 
                              borderRadius: 6,
                              border: '1px solid #374151'
                            }} 
                          />
                        )}
                        <input
                          value={url}
                          onChange={e => handlePhotoChange(i, e.target.value)}
                          placeholder={`URL photo #${i + 1}`}
                          style={{
                            ...modernInputStyle,
                            fontSize: 12,
                            padding: '8px 12px'
                          }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            type="button" 
                            onClick={() => removePhotoField(i)}
                            style={{
                              background: '#dc2626',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 12px',
                              fontSize: 12,
                              cursor: 'pointer',
                              fontWeight: 600,
                              flex: 1
                            }}
                            disabled={form.photo.length === 1}
                          >
                            Supprimer
                          </button>
                          {i === form.photo.length - 1 && (
                            <button 
                              type="button" 
                              onClick={addPhotoField}
                              style={{
                                background: '#16a34a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 12px',
                                fontSize: 12,
                                cursor: 'pointer',
                                fontWeight: 600,
                                flex: 1
                              }}
                            >
                              Ajouter
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {error && (
                <div style={{ 
                  gridColumn: '1 / -1',
                  background: '#dc2626',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 600
                }}>
                  {error}
                </div>
              )}
              
              {success && (
                <div style={{ 
                  gridColumn: '1 / -1',
                  background: '#16a34a',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 600
                }}>
                  {success}
                </div>
              )}
              
              <div style={{ 
                gridColumn: '1 / -1',
                display: 'flex', 
                gap: 16, 
                justifyContent: 'flex-end',
                marginTop: 16,
                paddingTop: 24,
                borderTop: '1px solid #374151'
              }}>
                <button 
                  type="button" 
                  onClick={() => { setShowForm(false); setEditId(null); }}
                  style={{
                    background: 'transparent',
                    border: '1px solid #374151',
                    color: '#9ca3af',
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 32px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  {editId ? 'Modifier le bateau' : 'Créer le bateau'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

// Styles modernes pour le thème sombre
const modernThStyle = {
  padding: '16px 20px',
  fontWeight: 600,
  color: '#e8eaed',
  fontSize: 13,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #374151',
  textAlign: 'left'
};

const modernTdStyle = {
  padding: '16px 20px',
  color: '#e8eaed',
  fontSize: 14,
  borderBottom: '1px solid #374151',
  fontWeight: 500
};

const modernInputStyle = {
  background: '#374151',
  border: '1px solid #4b5563',
  color: '#e8eaed',
  borderRadius: 8,
  padding: '12px 16px',
  fontSize: 14,
  transition: 'all 0.2s',
  outline: 'none',
  ':focus': {
    borderColor: '#3b82f6',
    background: '#404652'
  }
};

const modernLabelStyle = {
  color: '#e8eaed',
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 4
};

const modernEditBtnStyle = {
  background: '#374151',
  border: '1px solid #4b5563',
  color: '#3b82f6',
  borderRadius: 8,
  padding: '8px 12px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ':hover': {
    background: '#4b5563',
    borderColor: '#3b82f6'
  }
};

const modernDeleteBtnStyle = {
  background: '#374151',
  border: '1px solid #4b5563',
  color: '#dc2626',
  borderRadius: 8,
  padding: '8px 12px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ':hover': {
    background: '#4b5563',
    borderColor: '#dc2626'
  }
};

// Styles supprimés - remplacés par les styles modernes
const inputStyle = modernInputStyle;
const submitBtnStyle = {};
const addBtnStyle = {};
const removeBtnStyle = {};
const cancelBtnStyle = {};
const thStyle = modernThStyle;
const tdStyle = modernTdStyle;
const editBtnStyle = modernEditBtnStyle;
const deleteBtnStyle = modernDeleteBtnStyle;
