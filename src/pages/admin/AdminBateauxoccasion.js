// Page d'ajout et modification de bateaux d'occasion
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { FaEdit, FaTrash, FaPlus, FaArrowLeft, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminBateauxOccasion() {
  const [form, setForm] = useState({
    nom: '',
    Ville: '',
    moteur: '',
    carburant: '',
    places: '',
    prix: '',
    vitesse: '',
    annee: '',
    etat: '',
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
      const snap = await getDocs(collection(db, 'bateauxoccasion'));
      setBateaux(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchBateaux();
  }, [success]);

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
    if (window.confirm('Supprimer ce bateau d\'occasion ?')) {
      await deleteDoc(doc(db, 'bateauxoccasion', id));
      setSuccess('Bateau d\'occasion supprimé !');
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
      annee: bateau.annee || '',
      etat: bateau.etat || '',
      photo: bateau.photo && bateau.photo.length ? bateau.photo : [''],
    });
    setShowForm(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess(''); setError('');
    if (!form.nom || !form.Ville || !form.moteur || !form.carburant || !form.places || !form.prix || !form.vitesse || !form.annee || !form.etat) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    try {
      if (editId) {
        await updateDoc(doc(db, 'bateauxoccasion', editId), {
          nom: form.nom,
          Ville: form.Ville,
          moteur: Number(form.moteur),
          carburant: Number(form.carburant),
          places: Number(form.places),
          prix: Number(form.prix),
          vitesse: Number(form.vitesse),
          annee: form.annee,
          etat: form.etat,
          photo: form.photo.filter(url => url.trim() !== ''),
        });
        setSuccess('Bateau d\'occasion modifié avec succès !');
      } else {
        await addDoc(collection(db, 'bateauxoccasion'), {
          nom: form.nom,
          Ville: form.Ville,
          moteur: Number(form.moteur),
          carburant: Number(form.carburant),
          places: Number(form.places),
          prix: Number(form.prix),
          vitesse: Number(form.vitesse),
          annee: form.annee,
          etat: form.etat,
          photo: form.photo.filter(url => url.trim() !== ''),
        });
        setSuccess('Bateau d\'occasion ajouté avec succès !');
      }
      setForm({ nom: '', Ville: '', moteur: '', carburant: '', places: '', prix: '', vitesse: '', annee: '', etat: '', photo: [''] });
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
      const storageRef = ref(storage, `bateauxoccasion/${Date.now()}_${file.name}`);
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
      padding: '24px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header professionnel sombre */}
      <header style={{
        background: '#2a2d35',
        padding: '24px 32px',
        borderRadius: '12px 12px 0 0',
        border: '1px solid #374151',
        borderBottom: 'none',
        marginBottom: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
              ⚓
            </div>
            <div>
              <h1 style={{ 
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
                color: '#e8eaed',
                letterSpacing: '-0.5px'
              }}>
                Gestion des bateaux d'occasion
              </h1>
              <p style={{ 
                margin: 0,
                fontSize: 14,
                color: '#9ca3af',
                fontWeight: 500
              }}>
                Gérez votre catalogue de bateaux d'occasion
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
                borderRadius: 8,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <FaPlus style={{ fontSize: 12 }} />
              Ajouter un bateau d'occasion
            </button>
          )}
        </div>
      </header>

      {/* Contenu principal */}
      <main style={{
        background: '#2a2d35',
        border: '1px solid #374151',
        borderTop: 'none',
        borderRadius: '0 0 12px 12px',
        padding: '32px',
        minHeight: '600px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {!showForm ? (
          <>
            {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '80px 0',
                color: '#9ca3af',
                fontSize: 16
              }}>
                <div style={{
                  width: 32,
                  height: 32,
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
                borderRadius: 8,
                border: '1px solid #374151',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                          ...darkThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('nom')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Nom
                            {sortField === 'nom' ? (
                              sortOrder === 'asc' ? <FaSortUp style={{ color: '#3b82f6' }} /> : <FaSortDown style={{ color: '#3b82f6' }} />
                            ) : <FaSort style={{ opacity: 0.4 }} />}
                          </div>
                        </th>
                        <th style={{
                          ...darkThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('Ville')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Ville
                            {sortField === 'Ville' ? (
                              sortOrder === 'asc' ? <FaSortUp style={{ color: '#3b82f6' }} /> : <FaSortDown style={{ color: '#3b82f6' }} />
                            ) : <FaSort style={{ opacity: 0.4 }} />}
                          </div>
                        </th>
                        <th style={{
                          ...darkThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('moteur')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Moteur
                            {sortField === 'moteur' ? (
                              sortOrder === 'asc' ? <FaSortUp style={{ color: '#3b82f6' }} /> : <FaSortDown style={{ color: '#3b82f6' }} />
                            ) : <FaSort style={{ opacity: 0.4 }} />}
                          </div>
                        </th>
                        <th style={{
                          ...darkThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('carburant')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Carburant
                            {sortField === 'carburant' ? (
                              sortOrder === 'asc' ? <FaSortUp style={{ color: '#3b82f6' }} /> : <FaSortDown style={{ color: '#3b82f6' }} />
                            ) : <FaSort style={{ opacity: 0.4 }} />}
                          </div>
                        </th>
                        <th style={{
                          ...darkThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('places')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Places
                            {sortField === 'places' ? (
                              sortOrder === 'asc' ? <FaSortUp style={{ color: '#3b82f6' }} /> : <FaSortDown style={{ color: '#3b82f6' }} />
                            ) : <FaSort style={{ opacity: 0.4 }} />}
                          </div>
                        </th>
                        <th style={{
                          ...darkThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('prix')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Prix (€)
                            {sortField === 'prix' ? (
                              sortOrder === 'asc' ? <FaSortUp style={{ color: '#3b82f6' }} /> : <FaSortDown style={{ color: '#3b82f6' }} />
                            ) : <FaSort style={{ opacity: 0.4 }} />}
                          </div>
                        </th>
                        <th style={{
                          ...darkThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('vitesse')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Vitesse (kn)
                            {sortField === 'vitesse' ? (
                              sortOrder === 'asc' ? <FaSortUp style={{ color: '#3b82f6' }} /> : <FaSortDown style={{ color: '#3b82f6' }} />
                            ) : <FaSort style={{ opacity: 0.4 }} />}
                          </div>
                        </th>
                        <th style={{
                          ...darkThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('annee')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            Année
                            {sortField === 'annee' ? (
                              sortOrder === 'asc' ? <FaSortUp style={{ color: '#3b82f6' }} /> : <FaSortDown style={{ color: '#3b82f6' }} />
                            ) : <FaSort style={{ opacity: 0.4 }} />}
                          </div>
                        </th>
                        <th style={{
                          ...darkThStyle,
                          cursor: 'pointer',
                          userSelect: 'none'
                        }} onClick={() => handleSort('etat')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            État
                            {sortField === 'etat' ? (
                              sortOrder === 'asc' ? <FaSortUp style={{ color: '#3b82f6' }} /> : <FaSortDown style={{ color: '#3b82f6' }} />
                            ) : <FaSort style={{ opacity: 0.4 }} />}
                          </div>
                        </th>
                        <th style={darkThStyle}>Photos</th>
                        <th style={darkThStyle}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBateaux.map((b, idx) => (
                        <tr key={b.id} style={{ 
                          background: idx % 2 === 0 ? '#1e2126' : '#262a31',
                          borderBottom: '1px solid #374151',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d3139'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#1e2126' : '#262a31'}
                        >
                          <td style={darkTdStyle}>{b.nom}</td>
                          <td style={darkTdStyle}>{b.Ville}</td>
                          <td style={darkTdStyle}>{b.moteur}</td>
                          <td style={darkTdStyle}>{b.carburant}</td>
                          <td style={darkTdStyle}>{b.places}</td>
                          <td style={darkTdStyle}><strong style={{ color: '#3b82f6' }}>{b.prix}€</strong></td>
                          <td style={darkTdStyle}>{b.vitesse}</td>
                          <td style={darkTdStyle}>{b.annee}</td>
                          <td style={darkTdStyle}>{b.etat}</td>
                          <td style={darkTdStyle}>
                            {b.photo && b.photo.length > 0 ? (
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                                {b.photo.slice(0,3).map((url, i) => (
                                  <img 
                                    key={i} 
                                    src={url} 
                                    alt="miniature" 
                                    style={{ 
                                      width: 50, 
                                      height: 38, 
                                      objectFit: 'cover', 
                                      borderRadius: 4, 
                                      border: '1px solid #374151',
                                      transition: 'transform 0.2s ease',
                                      cursor: 'pointer'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'
                                    }
                                  />
                                ))}
                                {b.photo.length > 3 && (
                                  <span style={{ 
                                    fontSize: 11, 
                                    color: '#9ca3af', 
                                    alignSelf: 'center',
                                    background: '#374151',
                                    padding: '2px 6px',
                                    borderRadius: 3,
                                    border: '1px solid #4b5563'
                                  }}>
                                    +{b.photo.length-3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: '#6b7280', fontSize: 12, fontStyle: 'italic' }}>Aucune photo</span>
                            )}
                          </td>
                          <td style={darkTdStyle}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                              <button 
                                onClick={() => handleEdit(b)} 
                                style={darkEditBtnStyle}
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                onClick={() => handleDelete(b.id)} 
                                style={darkDeleteBtnStyle}
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
          /* Formulaire avec design sombre professionnel */
          <div style={{
            background: '#1e2126',
            borderRadius: 8,
            border: '1px solid #374151',
            padding: '32px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                  border: '1px solid #4b5563',
                  color: '#9ca3af',
                  borderRadius: 6,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                  fontSize: 14
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#374151';
                  e.target.style.color = '#e8eaed';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#9ca3af';
                }}
              >
                <FaArrowLeft /> Retour
              </button>
              <h2 style={{ 
                margin: 0,
                fontSize: 22,
                fontWeight: 600,
                color: '#e8eaed'
              }}>
                {editId ? 'Modifier le bateau d\'occasion' : 'Ajouter un nouveau bateau d\'occasion'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20 
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={darkLabelStyle}>Nom du bateau</label>
                <input 
                  name="nom" 
                  value={form.nom} 
                  onChange={handleChange} 
                  placeholder="Nom du bateau"
                  style={darkInputStyle} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={darkLabelStyle}>Ville</label>
                <input 
                  name="Ville" 
                  value={form.Ville} 
                  onChange={handleChange} 
                  placeholder="Ville"
                  style={darkInputStyle} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={darkLabelStyle}>Moteur (CV)</label>
                <input 
                  name="moteur" 
                  value={form.moteur} 
                  onChange={handleChange} 
                  placeholder="Puissance moteur"
                  type="number"
                  style={darkInputStyle} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={darkLabelStyle}>Carburant (litres)</label>
                <input 
                  name="carburant" 
                  value={form.carburant} 
                  onChange={handleChange} 
                  placeholder="Capacité carburant"
                  type="number"
                  style={darkInputStyle} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={darkLabelStyle}>Places</label>
                <input 
                  name="places" 
                  value={form.places} 
                  onChange={handleChange} 
                  placeholder="Nombre de places"
                  type="number"
                  style={darkInputStyle} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={darkLabelStyle}>Prix (€)</label>
                <input 
                  name="prix" 
                  value={form.prix} 
                  onChange={handleChange} 
                  placeholder="Prix de vente"
                  type="number"
                  style={darkInputStyle} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={darkLabelStyle}>Vitesse (kn)</label>
                <input 
                  name="vitesse" 
                  value={form.vitesse} 
                  onChange={handleChange} 
                  placeholder="Vitesse maximale"
                  type="number"
                  style={darkInputStyle} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={darkLabelStyle}>Année</label>
                <input 
                  name="annee" 
                  value={form.annee} 
                  onChange={handleChange} 
                  placeholder="Année de fabrication"
                  style={darkInputStyle} 
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={darkLabelStyle}>État général</label>
                <input 
                  name="etat" 
                  value={form.etat} 
                  onChange={handleChange} 
                  placeholder="État du bateau"
                  style={darkInputStyle} 
                />
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={darkLabelStyle}>Photos</label>
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
                      padding: '10px 20px',
                      borderRadius: 6,
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
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
                            ...darkInputStyle,
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
                              borderRadius: 4,
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
                                borderRadius: 4,
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
                  borderRadius: 6,
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 500
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
                  borderRadius: 6,
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 500
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
                    border: '1px solid #4b5563',
                    color: '#9ca3af',
                    borderRadius: 6,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#374151';
                    e.target.style.color = '#e8eaed';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#9ca3af';
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
                    borderRadius: 6,
                    padding: '12px 32px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
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

// Styles professionnels - thème sombre
const darkThStyle = {
  padding: '16px 18px',
  fontWeight: 600,
  color: '#e8eaed',
  fontSize: 13,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #374151',
  textAlign: 'left'
};

const darkTdStyle = {
  padding: '14px 18px',
  color: '#e8eaed',
  fontSize: 14,
  borderBottom: '1px solid #374151',
  fontWeight: 500
};

const darkInputStyle = {
  background: '#374151',
  border: '1px solid #4b5563',
  color: '#e8eaed',
  borderRadius: 6,
  padding: '12px 16px',
  fontSize: 14,
  transition: 'all 0.2s',
  outline: 'none'
};

const darkLabelStyle = {
  color: '#e8eaed',
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 4
};

const darkEditBtnStyle = {
  background: '#374151',
  border: '1px solid #4b5563',
  color: '#3b82f6',
  borderRadius: 6,
  padding: '8px 10px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12
};

const darkDeleteBtnStyle = {
  background: '#374151',
  border: '1px solid #4b5563',
  color: '#dc2626',
  borderRadius: 6,
  padding: '8px 10px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12
};

// Styles réutilisés mis à jour
const inputStyle = darkInputStyle;
const submitBtnStyle = {
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '12px 32px',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
};
const addBtnStyle = {
  background: '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '6px 12px',
  fontWeight: 600,
  fontSize: 12,
  cursor: 'pointer'
};
const removeBtnStyle = {
  background: '#dc3545',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '6px 12px',
  fontWeight: 600,
  fontSize: 12,
  cursor: 'pointer'
};
const cancelBtnStyle = {
  background: '#6c757d',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer'
};
const thStyle = darkThStyle;
const tdStyle = darkTdStyle;
const editBtnStyle = darkEditBtnStyle;
const deleteBtnStyle = darkDeleteBtnStyle;
