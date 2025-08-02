import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { FaCalendarAlt, FaPlus, FaShip } from "react-icons/fa";

export default function AdminExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const [bateaux, setBateaux] = useState([]);
  const [loadingBateaux, setLoadingBateaux] = useState(false);
  const [showBateaux, setShowBateaux] = useState(null); // id de l'expérience sélectionnée pour afficher les bateaux
  const [showAddBateau, setShowAddBateau] = useState(false);
  const [form, setForm] = useState({ nom: '', prix: '', images: [] });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nom: '', Date: '', description: '', image: '', info: '' });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [editBateauId, setEditBateauId] = useState(null);
  const [editBateauForm, setEditBateauForm] = useState({ nom: '', places: '', moteur: '', prix: '', image: '' });
  const [editBateauError, setEditBateauError] = useState('');
  const [editBateauSuccess, setEditBateauSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [addExpForm, setAddExpForm] = useState({ nom: '', Date: '', description: '', image: '', info: '' });
  const [addExpError, setAddExpError] = useState('');
  const [addExpSuccess, setAddExpSuccess] = useState('');
  const [uploadingExpImage, setUploadingExpImage] = useState(false);

  // Ajout : charger tous les bateaux existants pour la sélection
  const [allBateaux, setAllBateaux] = useState([]);
  useEffect(() => {
    async function fetchAllBateaux() {
      const snap = await getDocs(collection(db, "bateaux"));
      setAllBateaux(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchAllBateaux();
  }, []);

  useEffect(() => {
    async function fetchExperiences() {
      setLoading(true);
      const snap = await getDocs(collection(db, "experience"));
      setExperiences(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchExperiences();
  }, []);

  // Fonction pour charger les bateaux d'une expérience
  async function fetchBateauxForExperience(expId) {
    setLoadingBateaux(true);
    const snap = await getDocs(collection(db, "experience", expId, "bateaux"));
    setBateaux(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoadingBateaux(false);
  }

  // Fonction pour ajouter un bateau à une expérience
  async function handleAddBateau(expId) {
    setAddError(''); setAddSuccess('');
    if (!form.nom || !form.prix) {
      setAddError('Tous les champs sont obligatoires');
      return;
    }
    try {
      await addDoc(collection(db, "experience", expId, "bateaux"), {
        nom: form.nom,
        prix: form.prix,
        images: form.images || []
      });
      setAddSuccess('Bateau ajouté !');
      setForm({ nom: '', prix: '', images: [] });
      fetchBateauxForExperience(expId);
      setShowAddBateau(false);
    } catch (e) {
      setAddError('Erreur lors de l\'ajout');
    }
  }

  // Préparer l'édition
  function startEdit(exp) {
    setEditId(exp.id);
    setEditForm({
      nom: exp.nom || '',
      Date: exp.Date || '',
      description: exp.description || '',
      image: exp.image || '',
      info: exp.info || ''
    });
    setEditError('');
    setEditSuccess('');
  }

  // Sauvegarder l'édition
  async function handleEditExperience() {
    setEditError(''); setEditSuccess('');
    if (!editForm.nom || !editForm.Date || !editForm.description) {
      setEditError('Tous les champs principaux sont obligatoires');
      return;
    }
    try {
      await updateDoc(doc(db, "experience", editId), editForm);
      setEditSuccess('Expérience modifiée !');
      setEditId(null);
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      setEditError('Erreur lors de la modification');
    }
  }

  // Préparer l'édition d'un bateau
  function startEditBateau(bateau) {
    setEditBateauId(bateau.id);
    setEditBateauForm({
      nom: bateau.nom || '',
      places: bateau.places || '',
      moteur: bateau.moteur || '',
      prix: bateau.prix || '',
      image: bateau.image || ''
    });
    setEditBateauError('');
    setEditBateauSuccess('');
  }

  // Sauvegarder l'édition d'un bateau
  async function handleEditBateau() {
    setEditBateauError(''); setEditBateauSuccess('');
    if (!editBateauForm.nom || !editBateauForm.places || !editBateauForm.moteur || !editBateauForm.prix) {
      setEditBateauError('Tous les champs sont obligatoires');
      return;
    }
    try {
      await updateDoc(doc(db, "experience", showBateaux, "bateaux", editBateauId), editBateauForm);
      setEditBateauSuccess('Bateau modifié !');
      setEditBateauId(null);
      fetchBateauxForExperience(showBateaux);
    } catch (e) {
      setEditBateauError('Erreur lors de la modification');
    }
  }

  // Fonction d'upload d'images pour l'ajout de bateau (plusieurs images)
  async function handleFileUploadBateau(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const storage = (await import('firebase/storage')).getStorage();
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const uploadPromises = files.map(async (file) => {
        const storageRef = ref(storage, `experience/${showBateaux}/bateaux/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      });
      const urls = await Promise.all(uploadPromises);
      setForm(f => ({ ...f, images: [...(f.images || []), ...urls] }));
    } catch (err) {
      setAddError("Erreur lors de l'upload des images : " + (err && err.message ? err.message : JSON.stringify(err)));
    }
    setUploadingImages(false);
  }

  // Fonction pour supprimer un bateau
  async function handleDeleteBateau(bateauId) {
    if (!showBateaux) return;
    if (!window.confirm('Supprimer ce bateau ?')) return;
    try {
      await deleteDoc(doc(db, "experience", showBateaux, "bateaux", bateauId));
      fetchBateauxForExperience(showBateaux);
    } catch (e) {
      alert("Erreur lors de la suppression du bateau");
    }
  }

  // Fonction pour supprimer une expérience
  async function handleDeleteExperience(expId) {
    if (!window.confirm('Supprimer cette expérience ?')) return;
    try {
      await deleteDoc(doc(db, "experience", expId));
      setExperiences(experiences => experiences.filter(e => e.id !== expId));
      if (showBateaux === expId) setShowBateaux(null);
    } catch (e) {
      alert("Erreur lors de la suppression de l'expérience");
    }
  }

  // Fonction pour ajouter une expérience
  async function handleAddExperience() {
    setAddExpError(''); setAddExpSuccess('');
    if (!addExpForm.nom || !addExpForm.Date || !addExpForm.description) {
      setAddExpError('Tous les champs principaux sont obligatoires');
      return;
    }
    try {
      await addDoc(collection(db, "experience"), addExpForm);
      setAddExpSuccess('Expérience ajoutée !');
      setAddExpForm({ nom: '', Date: '', description: '', image: '', info: '' });
      setShowAddExperience(false);
      // Rafraîchir la liste
      const snap = await getDocs(collection(db, "experience"));
      setExperiences(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      setAddExpError('Erreur lors de l\'ajout');
    }
  }

  if (loading) return <div style={{ color: '#bbb', textAlign: 'center', fontSize: 18, background:'#181a20', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>Chargement des expériences...</div>;
  if (experiences.length === 0) return <div style={{ color: '#bbb', textAlign: 'center', fontSize: 18, background:'#181a20', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>Aucune expérience trouvée.</div>;

  // Affichage liste simple
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', background:'#181a20', minHeight:'100vh', paddingBottom:40 }}>
      <h2 style={{ fontWeight: 800, fontSize: 32, color: '#e8eaed', marginBottom: 32, textAlign: 'center', letterSpacing:1 }}>Liste des expériences</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#232733', borderRadius: 12, boxShadow: '0 4px 24px #0004', overflow: 'hidden', fontSize: 15, color: '#e8eaed' }}>
        <thead style={{ background: '#232733' }}>
          <tr>
            <th style={{ padding: '14px 8px', fontWeight: 700, color: '#10b981', borderBottom: '1.5px solid #374151' }}>Image</th>
            <th style={{ padding: '14px 8px', fontWeight: 700, color: '#10b981', borderBottom: '1.5px solid #374151' }}>Nom</th>
            <th style={{ padding: '14px 8px', fontWeight: 700, color: '#10b981', borderBottom: '1.5px solid #374151' }}>Date</th>
            <th style={{ padding: '14px 8px', fontWeight: 700, color: '#10b981', borderBottom: '1.5px solid #374151' }}>Description</th>
            <th style={{ padding: '14px 8px', fontWeight: 700, color: '#10b981', borderBottom: '1.5px solid #374151' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {experiences.map(exp => (
            <tr key={exp.id} style={{ borderBottom: '1px solid #232733', background: '#232733', transition: 'background 0.2s' }}>
              <td style={{ padding: 10, textAlign: 'center' }}>
                {exp.image && <img src={exp.image} alt={exp.nom} style={{ width: 70, height: 50, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px #0004' }} />}
              </td>
              <td style={{ padding: 10, fontWeight: 700, color: '#e8eaed' }}>{exp.nom}</td>
              <td style={{ padding: 10, color: '#3b82f6', fontWeight: 600 }}>{exp.Date}</td>
              <td style={{ padding: 10, color: '#b5bac8', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description}</td>
              <td style={{ padding: 10 }}>
                <button onClick={() => {
                  setShowBateaux(exp.id);
                  fetchBateauxForExperience(exp.id);
                }} style={{ background: showBateaux === exp.id ? '#10b981' : '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 14, marginRight: 8, boxShadow:'0 2px 8px #0002' }}>
                  {showBateaux === exp.id ? 'Masquer bateaux' : 'Voir bateaux'}
                </button>
                <button onClick={() => startEdit(exp)} style={{ background: '#f59e42', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 14, marginRight: 8, boxShadow:'0 2px 8px #0002' }}>Modifier</button>
                <button onClick={() => handleDeleteExperience(exp.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 14, boxShadow:'0 2px 8px #0002' }}>Supprimer</button>
              </td>
            </tr>
            )
          )}
        </tbody>
      </table>
      {/* Affichage bateaux */}
      {showBateaux && (
        <div style={{ marginTop: 32, background: '#181a20', borderRadius: 12, padding: 18, border: '1px solid #232733', boxShadow: '0 2px 8px #0004' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <b style={{ fontSize: 17, color: '#10b981' }}>Bateaux pour cette expérience</b>
            <button onClick={() => { setShowAddBateau(true); setForm({ nom: '', prix: '', images: [] }); setAddError(''); setAddSuccess(''); }} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, boxShadow:'0 2px 8px #0002' }}>
              <FaPlus /> Ajouter un bateau
            </button>
          </div>
          {loadingBateaux ? (
            <div style={{ color: '#bbb' }}>Chargement...</div>
          ) : bateaux.length === 0 ? (
            <div style={{ color: '#bbb' }}>Aucun bateau pour cette expérience.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
              {bateaux.map(b => (
                <div key={b.id} style={{ background: '#232733', border: '1px solid #444', borderRadius: 10, padding: 14, marginBottom: 8, minWidth: 200, maxWidth: 240, boxShadow: '0 2px 8px #0004', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <b style={{ fontSize: 16, color: '#10b981' }}>{b.nom}</b>
                  {/* Affichage de l'image du bateau avec clic pour prévisualiser */}
                  {b.image && (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                      <img src={b.image} alt={b.nom} style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px #0004', cursor: 'pointer' }} onClick={() => setPreviewImage(b.image)} />
                    </div>
                  )}
                  <span style={{ color: '#3b82f6', fontWeight: 600 }}>{b.prix} €</span>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => startEditBateau(b)} style={{ background: '#f59e42', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 14, boxShadow:'0 2px 8px #0002' }}>Modifier</button>
                    <button onClick={() => handleDeleteBateau(b.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 14, boxShadow:'0 2px 8px #0002' }}>Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Aperçu image en grand (modale) */}
          {previewImage && (
            <div onClick={() => setPreviewImage(null)} style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'#000b', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-out' }}>
              <img src={previewImage} alt="Aperçu" style={{ maxWidth:'90vw', maxHeight:'90vh', borderRadius:12, boxShadow:'0 4px 32px #000a', background:'#222' }} />
              <span style={{ position:'absolute', top:30, right:40, color:'#fff', fontSize:36, fontWeight:900, cursor:'pointer', zIndex:1001 }} onClick={e => { e.stopPropagation(); setPreviewImage(null); }}>&times;</span>
            </div>
          )}
          {showAddBateau && (
            <div style={{ marginTop: 18, background: '#232733', border: '1px solid #374151', borderRadius: 10, padding: 18, maxWidth: 340 }}>
              <h4 style={{ marginBottom: 12, fontSize: 18, color:'#10b981' }}>Associer un bateau existant</h4>
              <label style={{ color:'#e8eaed', fontWeight:600, marginBottom:4, display:'block' }}>Sélectionner un bateau</label>
              <select value={form.bateauId || ''} onChange={e => setForm(f => ({ ...f, bateauId: e.target.value }))} style={{ marginBottom: 8, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', background:'#181a20', color:'#e8eaed' }}>
                <option value="">-- Choisir --</option>
                {allBateaux.map(b => (
                  <option key={b.id} value={b.id}>{b.nom} - {b.Ville} ({b.places} places)</option>
                ))}
              </select>
              {form.bateauId && (
                <div style={{ marginBottom: 8, textAlign: 'center' }}>
                  {(() => {
                    const b = allBateaux.find(x => x.id === form.bateauId);
                    return b && b.photo && b.photo[0] ? <img src={b.photo[0]} alt={b.nom} style={{ maxWidth: 80, maxHeight: 60, borderRadius: 8, boxShadow: '0 2px 8px #0004' }} /> : null;
                  })()}
                </div>
              )}
              <button onClick={async () => {
                setAddError(''); setAddSuccess('');
                if (!form.bateauId) {
                  setAddError('Veuillez sélectionner un bateau');
                  return;
                }
                try {
                  // On associe le bateau à l'expérience (stocke l'id et les infos principales)
                  const b = allBateaux.find(x => x.id === form.bateauId);
                  await addDoc(collection(db, "experience", showBateaux, "bateaux"), {
                    bateauId: b.id,
                    nom: b.nom,
                    prix: b.prix,
                    image: b.photo && b.photo[0] ? b.photo[0] : '',
                    places: b.places,
                    moteur: b.moteur,
                    Ville: b.Ville
                  });
                  setAddSuccess('Bateau associé !');
                  setForm({ bateauId: '' });
                  fetchBateauxForExperience(showBateaux);
                  setShowAddBateau(false);
                } catch (e) {
                  setAddError('Erreur lors de l\'association');
                }
              }} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', marginTop: 8, boxShadow:'0 2px 8px #0002' }}>Associer</button>
              {addError && <div style={{ color: '#ef4444', marginTop: 8 }}>{addError}</div>}
              {addSuccess && <div style={{ color: '#10b981', marginTop: 8 }}>{addSuccess}</div>}
              <button onClick={() => setShowAddBateau(false)} style={{ marginTop: 8, background: '#232733', color: '#e8eaed', border: '1px solid #374151', borderRadius: 8, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
            </div>
          )}
        </div>
      )}
      {/* Formulaire d'édition */}
      {editId && (
        <div style={{ marginTop: 32, background: '#232733', border: '1px solid #374151', borderRadius: 12, padding: 24, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 2px 8px #0004' }}>
          <h3 style={{ marginBottom: 18, color: '#10b981' }}>Modifier l'expérience</h3>
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Nom</label>
          <input placeholder="Nom" value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} style={{ marginBottom: 10, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', background:'#181a20', color:'#e8eaed' }} />
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Date</label>
          <input placeholder="Date" value={editForm.Date} onChange={e => setEditForm(f => ({ ...f, Date: e.target.value }))} style={{ marginBottom: 10, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', background:'#181a20', color:'#e8eaed' }} />
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Image (URL)</label>
          <input placeholder="Image (URL)" value={editForm.image} onChange={e => setEditForm(f => ({ ...f, image: e.target.value }))} style={{ marginBottom: 10, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', background:'#181a20', color:'#e8eaed' }} />
          {/* Prévisualisation de l'image */}
          {editForm.image && (
            <div style={{ marginBottom: 10, textAlign: 'center' }}>
              <img src={editForm.image} alt="Prévisualisation" style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, boxShadow: '0 2px 8px #0004', margin: '0 auto' }} />
            </div>
          )}
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Ou téléverser une image</label>
          <input type="file" accept="image/*" onChange={async e => {
            const file = e.target.files[0];
            if (!file) return;
            // Upload Firebase Storage
            try {
              const storage = (await import('firebase/storage')).getStorage();
              const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
              const storageRef = ref(storage, `experience/${Date.now()}_${file.name}`);
              await uploadBytes(storageRef, file);
              const url = await getDownloadURL(storageRef);
              setEditForm(f => ({ ...f, image: url }));
            } catch (err) {
              alert('Erreur lors de l\'upload de l\'image');
            }
          }} style={{ marginBottom: 10, width: '100%' }} />
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Description</label>
          <textarea placeholder="Description" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} style={{ marginBottom: 10, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', minHeight: 60, background:'#181a20', color:'#e8eaed' }} />
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Infos pratiques</label>
          <textarea placeholder="Infos pratiques" value={editForm.info} onChange={e => setEditForm(f => ({ ...f, info: e.target.value }))} style={{ marginBottom: 10, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', minHeight: 40, background:'#181a20', color:'#e8eaed' }} />
          <button onClick={handleEditExperience} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', marginRight: 8, boxShadow:'0 2px 8px #0002' }}>Enregistrer</button>
          <button onClick={() => setEditId(null)} style={{ background: '#232733', color: '#e8eaed', border: '1px solid #374151', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
          {editError && <div style={{ color: '#ef4444', marginTop: 8 }}>{editError}</div>}
          {editSuccess && <div style={{ color: '#10b981', marginTop: 8 }}>{editSuccess}</div>}
        </div>
      )}
      {/* Formulaire d'édition de bateau */}
      {editBateauId && (
        <div style={{ marginTop: 24, background: '#232733', border: '1px solid #374151', borderRadius: 12, padding: 20, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 2px 8px #0004' }}>
          <h4 style={{ marginBottom: 14, color: '#10b981' }}>Modifier le bateau</h4>
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Nom</label>
          <input placeholder="Nom" value={editBateauForm.nom} onChange={e => setEditBateauForm(f => ({ ...f, nom: e.target.value }))} style={{ marginBottom: 8, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', background:'#181a20', color:'#e8eaed' }} />
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Places</label>
          <input placeholder="Places" value={editBateauForm.places} onChange={e => setEditBateauForm(f => ({ ...f, places: e.target.value }))} style={{ marginBottom: 8, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', background:'#181a20', color:'#e8eaed' }} />
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Moteur</label>
          <input placeholder="Moteur" value={editBateauForm.moteur} onChange={e => setEditBateauForm(f => ({ ...f, moteur: e.target.value }))} style={{ marginBottom: 8, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', background:'#181a20', color:'#e8eaed' }} />
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Prix</label>
          <input placeholder="Prix" value={editBateauForm.prix} onChange={e => setEditBateauForm(f => ({ ...f, prix: e.target.value }))} style={{ marginBottom: 8, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', background:'#181a20', color:'#e8eaed' }} />
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Image (URL)</label>
          <input placeholder="Image (URL)" value={editBateauForm.image} onChange={e => setEditBateauForm(f => ({ ...f, image: e.target.value }))} style={{ marginBottom: 8, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', background:'#181a20', color:'#e8eaed' }} />
          {editBateauForm.image && (
            <div style={{ marginBottom: 8, textAlign: 'center' }}>
              <img src={editBateauForm.image} alt="Prévisualisation" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 8, boxShadow: '0 2px 8px #0004', margin: '0 auto' }} />
            </div>
          )}
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Ou téléverser une image</label>
          <input type="file" accept="image/*" onChange={async e => {
            const file = e.target.files[0];
            if (!file) return;
            try {
              const storage = (await import('firebase/storage')).getStorage();
              const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
              const storageRef = ref(storage, `experience/${showBateaux}/bateaux/${Date.now()}_${file.name}`);
              await uploadBytes(storageRef, file);
              const url = await getDownloadURL(storageRef);
              setEditBateauForm(f => ({ ...f, image: url }));
            } catch (err) {
              alert('Erreur lors de l\'upload de l\'image');
            }
          }} style={{ marginBottom: 10, width: '100%' }} />
          <button onClick={handleEditBateau} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', marginRight: 8, boxShadow:'0 2px 8px #0002' }}>Enregistrer</button>
          <button onClick={() => setEditBateauId(null)} style={{ background: '#232733', color: '#e8eaed', border: '1px solid #374151', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
          {editBateauError && <div style={{ color: '#ef4444', marginTop: 8 }}>{editBateauError}</div>}
          {editBateauSuccess && <div style={{ color: '#10b981', marginTop: 8 }}>{editBateauSuccess}</div>}
        </div>
      )}
      {/* Bouton et formulaire d'ajout d'expérience */}
      <div style={{ maxWidth: 900, margin: '0 auto', marginTop: 24, marginBottom: 24, textAlign: 'center' }}>
        <button onClick={() => { setShowAddExperience(true); setAddExpForm({ nom: '', Date: '', description: '', image: '', info: '' }); setAddExpError(''); setAddExpSuccess(''); }} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 16, boxShadow:'0 2px 8px #0002' }}>
          <FaPlus style={{ marginRight: 8 }} /> Ajouter une expérience
        </button>
      </div>
      {showAddExperience && (
        <div style={{ margin: '0 auto 32px auto', background: '#232733', border: '1px solid #374151', borderRadius: 12, padding: 24, maxWidth: 500, boxShadow: '0 2px 8px #0004' }}>
          <h3 style={{ marginBottom: 18, color: '#10b981' }}>Ajouter une expérience</h3>
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Nom</label>
          <input placeholder="Nom" value={addExpForm.nom} onChange={e => setAddExpForm(f => ({ ...f, nom: e.target.value }))} style={{ marginBottom: 10, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', background:'#181a20', color:'#e8eaed' }} />
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Date</label>
          <input placeholder="Date" value={addExpForm.Date} onChange={e => setAddExpForm(f => ({ ...f, Date: e.target.value }))} style={{ marginBottom: 10, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', background:'#181a20', color:'#e8eaed' }} />
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Image (URL)</label>
          <input placeholder="Image (URL)" value={addExpForm.image} onChange={e => setAddExpForm(f => ({ ...f, image: e.target.value }))} style={{ marginBottom: 10, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', background:'#181a20', color:'#e8eaed' }} />
          {/* Prévisualisation de l'image */}
          {addExpForm.image && (
            <div style={{ marginBottom: 10, textAlign: 'center' }}>
              <img src={addExpForm.image} alt="Prévisualisation" style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, boxShadow: '0 2px 8px #0004', margin: '0 auto' }} />
            </div>
          )}
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Ou téléverser une image</label>
          <input type="file" accept="image/*" onChange={async e => {
            const file = e.target.files[0];
            if (!file) return;
            setUploadingExpImage(true);
            try {
              const storage = (await import('firebase/storage')).getStorage();
              const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
              const storageRef = ref(storage, `experience/${Date.now()}_${file.name}`);
              await uploadBytes(storageRef, file);
              const url = await getDownloadURL(storageRef);
              setAddExpForm(f => ({ ...f, image: url }));
            } catch (err) {
              setAddExpError('Erreur lors de l\'upload de l\'image');
            }
            setUploadingExpImage(false);
          }} style={{ marginBottom: 10, width: '100%' }} />
          {uploadingExpImage && <div style={{ color: '#10b981', marginBottom: 8 }}>Téléversement en cours...</div>}
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Description</label>
          <textarea placeholder="Description" value={addExpForm.description} onChange={e => setAddExpForm(f => ({ ...f, description: e.target.value }))} style={{ marginBottom: 10, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', minHeight: 60, background:'#181a20', color:'#e8eaed' }} />
          <label style={{ fontWeight: 600, marginBottom: 4, display: 'block', color:'#e8eaed' }}>Infos pratiques</label>
          <textarea placeholder="Infos pratiques" value={addExpForm.info} onChange={e => setAddExpForm(f => ({ ...f, info: e.target.value }))} style={{ marginBottom: 10, width: '100%', padding: 8, borderRadius: 6, border: '1px solid #374151', minHeight: 40, background:'#181a20', color:'#e8eaed' }} />
          <button onClick={handleAddExperience} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', marginRight: 8, boxShadow:'0 2px 8px #0002' }}>Ajouter</button>
          <button onClick={() => setShowAddExperience(false)} style={{ background: '#232733', color: '#e8eaed', border: '1px solid #374151', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
          {addExpError && <div style={{ color: '#ef4444', marginTop: 8 }}>{addExpError}</div>}
          {addExpSuccess && <div style={{ color: '#10b981', marginTop: 8 }}>{addExpSuccess}</div>}
        </div>
      )}
    </div>
  );
}
