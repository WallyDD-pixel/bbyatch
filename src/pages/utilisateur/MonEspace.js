import React, { useEffect, useState, useRef } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../../logo.svg';
import { FaClipboardUser, FaChevronDown, FaClipboardList, FaIdCard, FaUser, FaCircleUser, FaCircleQuestion, FaRightFromBracket } from 'react-icons/fa6';
import Modal from 'react-bootstrap/Modal';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';

export default function MonEspace() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('reservations');
  const [infos, setInfos] = useState({ prenom: '', nom: '', email: '' });
  const [edit, setEdit] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [compteTab, setCompteTab] = useState('infos');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+33');
  const [formInfos, setFormInfos] = useState({ prenom: '', nom: '', email: '' });
  const [formPhone, setFormPhone] = useState('');
  const [formCountryCode, setFormCountryCode] = useState('+33');
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [bateauxMap, setBateauxMap] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const profileMenuRef = useRef();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists()) {
          setInfos({
            prenom: userDoc.data().prenom || u.displayName || '',
            nom: userDoc.data().nom || '',
            email: u.email || '',
          });
          setPhone(userDoc.data().phone || '');
          setCountryCode(userDoc.data().countryCode || '+33');
        }
        fetchReservations(u.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function fetchBateaux() {
      const snap = await getDocs(collection(db, 'bateaux'));
      const map = {};
      snap.docs.forEach(doc => {
        map[doc.id] = doc.data().nom || doc.id;
      });
      setBateauxMap(map);
    }
    fetchBateaux();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (compteTab === 'infos') {
      setFormInfos(infos);
      setFormPhone(phone);
      setFormCountryCode(countryCode);
    }
  }, [compteTab, infos, phone, countryCode]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function fetchReservations(uid) {
    const q = query(collection(db, 'reservations'), where('userId', '==', uid));
    const snap = await getDocs(q);
    setReservations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }

  async function handleSave() {
    setError(''); setSuccess('');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        prenom: formInfos.prenom,
        nom: formInfos.nom,
        phone: formPhone,
        countryCode: formCountryCode
      });
      setInfos(formInfos);
      setPhone(formPhone);
      setCountryCode(formCountryCode);
      setSuccess('Vos informations ont bien été enregistrées !');
      setShowModal(true);
      setEdit(false);
    } catch (err) {
      setError("Erreur : " + err.message);
    }
  }

  const menuItemStyle = { padding: '12px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#222', fontWeight: 500, transition: 'background 0.15s', borderRadius: 8 };
  const iconStyle = { fontSize: 18, color: '#1e90ff' };

  if (loading) return <div className="container py-5 text-center">Chargement...</div>;
  if (!user) return <div className="container py-5 text-center">Veuillez vous connecter pour accéder à votre espace.</div>;

  return (
    <>
      <NavBar />
      <div style={{ height: 60 }} />
      <div className="container py-5" style={{ maxWidth: 1100, background:'#fff', minHeight:'100vh', borderRadius: 24, boxShadow: '0 4px 32px #0001', padding: '48px 32px', margin: '32px auto' }}>
        {/* Message de bienvenue et résumé */}
        <div className="mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3" style={{flexWrap: 'nowrap', gap: 32}}>
          <div style={{flex: 1, minWidth: 0}}>
            <h2 className="titre-playfair mb-1" style={{color:'#222', fontWeight:800, fontSize:32, textAlign: 'left', marginBottom: 8}}>Bienvenue, {infos.prenom} !</h2>
            <div style={{color:'#555', fontSize:18, textAlign: 'left'}}>Voici votre tableau de bord utilisateur.</div>
          </div>
          <div className="d-flex gap-3 flex-wrap justify-content-center" style={{gap: 24}}>
            <div style={{background:'#f8f9fa', borderRadius:16, padding:'18px 32px', minWidth:180, color:'#222', boxShadow:'0 2px 12px #0001', border:'1.5px solid #e5e7eb', display:'flex', flexDirection:'column', alignItems:'center'}}>
              <FaClipboardList style={{fontSize:32, color:'#1e90ff', marginBottom:8}} />
              <div style={{fontWeight:700, fontSize:28}}>{reservations.length}</div>
              <div style={{fontSize:15, color:'#888'}}>Réservations</div>
            </div>
            <div style={{background:'#f8f9fa', borderRadius:16, padding:'18px 32px', minWidth:180, color:'#222', boxShadow:'0 2px 12px #0001', border:'1.5px solid #e5e7eb', display:'flex', flexDirection:'column', alignItems:'center'}}>
              <FaUser style={{fontSize:32, color:'#1e90ff', marginBottom:8}} />
              <div style={{fontWeight:700, fontSize:28}}>{infos.email ? 'Actif' : 'Incomplet'}</div>
              <div style={{fontSize:15, color:'#888'}}>Statut du compte</div>
            </div>
          </div>
        </div>
        {/* Navigation dashboard */}
        <ul className="nav nav-tabs mb-4" style={{borderBottom:'1.5px solid #e5e7eb', background:'#fff', flexWrap: 'nowrap', fontSize: 17}}>
          <li className="nav-item" style={{width: '50%'}}>
            <button className={`nav-link${tab==='reservations'?' active':''}`} style={{background:'none', color:tab==='reservations'?'#1e90ff':'#555', border:'none', borderBottom:tab==='reservations'?'2.5px solid #1e90ff':'none', fontWeight:700, fontSize: 17, borderRadius:0, width: '100%'}} onClick={()=>setTab('reservations')}>Mes réservations</button>
          </li>
          <li className="nav-item" style={{width: '50%'}}>
            <button className={`nav-link${tab==='compte'?' active':''}`} style={{background:'none', color:tab==='compte'?'#1e90ff':'#555', border:'none', borderBottom:tab==='compte'?'2.5px solid #1e90ff':'none', fontWeight:700, fontSize: 17, borderRadius:0, width: '100%'}} onClick={()=>setTab('compte')}>Mon compte</button>
          </li>
        </ul>
        {/* Section réservations avec aperçu rapide */}
        {tab==='reservations' && (
          <div className="p-4 rounded shadow-sm" style={{background:'#f8f9fa', boxShadow:'0 4px 24px #0001', border:'1.5px solid #e5e7eb'}}>
            <h4 className="mb-3" style={{color:'#222', fontWeight:700}}>Historique de mes réservations</h4>
            {reservations.length === 0 ? (
              <div className="text-muted" style={{color:'#aaa'}}>Aucune réservation trouvée.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle text-center" style={{ boxShadow: '0 4px 24px #1e90ff11', borderRadius: 16, overflow: 'hidden', background: '#fff', color:'#222', border:'none' }}>
                  <thead className="table-light" style={{ background: 'linear-gradient(90deg, #f8f9fa 60%, #fff 100%)', fontWeight: 700, fontSize: 17, color: '#1e90ff', letterSpacing: 1, border:'none' }}>
                    <tr>
                      <th style={{ border: 'none', padding: '16px 8px' }}>Bateau</th>
                      <th style={{ border: 'none', padding: '16px 8px' }}>Date début</th>
                      <th style={{ border: 'none', padding: '16px 8px' }}>Date fin</th>
                      <th style={{ border: 'none', padding: '16px 8px' }}>Montant Acompte</th>
                      <th style={{ border: 'none', padding: '16px 8px' }}>Statut paiement</th>
                      <th style={{ border: 'none', padding: '16px 8px' }}>Paiement complet</th>
                      <th style={{ border: 'none', padding: '16px 8px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.slice(0,5).map(r => (
                      <tr key={r.id} style={{ background: '#fff', borderBottom: '1.5px solid #e5e7eb', transition: 'background 0.2s' }}>
                        <td style={{ fontWeight: 600, color: '#1e90ff', fontSize: 16 }}>{r.bateauNom || bateauxMap[r.bateauId] || <span className="text-muted">-</span>}</td>
                        <td style={{ fontWeight: 500, color: '#222', fontSize: 15 }}>{r.dateDebut || <span className="text-muted">-</span>}</td>
                        <td style={{ fontWeight: 500, color: '#222', fontSize: 15 }}>{r.dateFin || <span className="text-muted">-</span>}</td>
                        <td style={{ fontWeight: 600, color: '#1bbf4c', fontSize: 15 }}>{r.montant ? `${r.montant} ${r.devise ? r.devise.toUpperCase() : ''}` : <span className="text-muted">-</span>}</td>
                        <td>
                          {r.status || r.statut ? (
                            <span className={`badge bg-${(r.status||r.statut)==='paid'||(r.status||r.statut)==='Validée'?'success':(r.status||r.statut)==='pending'?'warning':'secondary'}`} style={{ fontSize: 15, padding: '8px 18px', borderRadius: 12, fontWeight: 700, letterSpacing: 1 }}>{(r.status||r.statut)==='paid' ? 'Payé' : (r.status||r.statut)==='pending' ? 'En attente' : (r.status||r.statut)==='Validée' ? 'Validée' : r.status||r.statut}</span>
                          ) : (
                            <span className="badge bg-secondary">-</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 600, color: r.statusComplet === true ? '#1bbf4c' : '#e67e22', fontSize: 15 }}>
                          {r.statusComplet === true ? 'Payé (complet)' : 'Acompte payé'}
                        </td>
                        <td>
                          {r.stripeSessionId ? (
                            <a href={`https://dashboard.stripe.com/test/payments/${r.stripePaymentIntent || r.stripeSessionId}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary" style={{ borderRadius: 10, fontWeight: 600, fontSize: 15 }}>Voir le reçu</a>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reservations.length > 5 && (
                  <div className="text-end mt-2">
                    <button className="btn btn-link" style={{color:'#1e90ff', fontWeight:700}} onClick={()=>window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'})}>Voir toutes les réservations</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* Section compte (fond clair) */}
        {tab==='compte' && (
          <div className="p-4 rounded shadow-sm" style={{background:'#f8f9fa', boxShadow:'0 4px 24px #0001', border:'1.5px solid #e5e7eb'}}>
            <div className="d-flex flex-column flex-md-row align-items-start w-100">
              <div style={{minWidth:220, maxWidth:320}} className="w-100 mb-4 mb-md-0 me-md-4">
                <h2 style={{fontWeight:700, fontSize: '1.6rem', color:'#222'}}>Compte</h2>
                <div style={{fontWeight:600, fontSize:16, marginBottom:24, textAlign:'left', color:'#888'}}>Gérez vos informations personnelles, email, mot de passe et adresse.</div>
                <ul className="nav nav-tabs flex-md-column mb-4 w-100" style={{borderBottom:'none', background:'#f8f9fa'}}>
                  <li className="nav-item">
                    <button className={`nav-link${compteTab==='infos'?' active':''}`} style={{border:'none', borderLeft:compteTab==='infos'?'4px solid #1e90ff':'4px solid transparent', color:compteTab==='infos'?'#1e90ff':'#555', background:'none', fontWeight:600, width:'100%', textAlign:'left', borderRadius:8, marginBottom:6, padding:'10px 16px'}} onClick={()=>setCompteTab('infos')}>Informations personnelles</button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link${compteTab==='email'?' active':''}`} style={{border:'none', borderLeft:compteTab==='email'?'4px solid #1e90ff':'4px solid transparent', color:compteTab==='email'?'#1e90ff':'#555', background:'none', fontWeight:600, width:'100%', textAlign:'left', borderRadius:8, marginBottom:6, padding:'10px 16px'}} onClick={()=>setCompteTab('email')}>Adresse email</button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link${compteTab==='password'?' active':''}`} style={{border:'none', borderLeft:compteTab==='password'?'4px solid #1e90ff':'4px solid transparent', color:compteTab==='password'?'#1e90ff':'#555', background:'none', fontWeight:600, width:'100%', textAlign:'left', borderRadius:8, marginBottom:6, padding:'10px 16px'}} onClick={()=>setCompteTab('password')}>Mot de passe</button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link${compteTab==='adresse'?' active':''}`} style={{border:'none', borderLeft:compteTab==='adresse'?'4px solid #1e90ff':'4px solid transparent', color:compteTab==='adresse'?'#1e90ff':'#555', background:'none', fontWeight:600, width:'100%', textAlign:'left', borderRadius:8, marginBottom:6, padding:'10px 16px'}} onClick={()=>setCompteTab('adresse')}>Adresse (optionnel)</button>
                  </li>
                </ul>
              </div>
              <div style={{flex:1, minWidth:0}} className="w-100">
                {compteTab==='infos' && (
                  <div style={{background:'#fff', borderRadius:18, boxShadow:'0 2px 16px #0001', padding:32, border:'1.5px solid #e5e7eb', color:'#222', marginBottom:24}}>
                    <h4 style={{color:'#222', fontWeight:700, marginBottom:8}}>Informations personnelles</h4>
                    <div style={{color:'#888', marginBottom:18}}>Modifiez votre nom, prénom et numéro de téléphone.</div>
                    <form style={{ padding: isMobile ? '0 8px' : 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="row mb-4 w-100" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 0 : 16 }}>
                        <div className="col-12 col-md-6 mb-3 mb-md-0 d-flex flex-column align-items-center" style={{ width: isMobile ? '100%' : '50%' }}>
                          <label className="form-label" style={{fontWeight:700, color:'#222', width: '100%', textAlign: isMobile ? 'center' : 'left'}}>Nom</label>
                          <input type="text" className="form-control" value={formInfos.nom} onChange={e=>setFormInfos({...formInfos, nom:e.target.value})} style={{fontWeight:600, color:'#222', background:'#f8f9fa', border:'1.5px solid #e5e7eb', borderRadius:10, boxShadow:'none', fontSize: isMobile ? 15 : 16, padding: isMobile ? '10px 12px' : '12px 18px', marginBottom: isMobile ? 12 : 0, maxWidth: 220, width: '100%'}} />
                        </div>
                        <div className="col-12 col-md-6 d-flex flex-column align-items-center" style={{ width: isMobile ? '100%' : '50%' }}>
                          <label className="form-label" style={{fontWeight:700, color:'#222', width: '100%', textAlign: isMobile ? 'center' : 'left'}}>Prénom</label>
                          <input type="text" className="form-control" value={formInfos.prenom} onChange={e=>setFormInfos({...formInfos, prenom:e.target.value})} style={{fontWeight:600, color:'#222', background:'#f8f9fa', border:'1.5px solid #e5e7eb', borderRadius:10, boxShadow:'none', fontSize: isMobile ? 15 : 16, padding: isMobile ? '10px 12px' : '12px 18px', marginBottom: isMobile ? 12 : 0, maxWidth: 220, width: '100%'}} />
                        </div>
                      </div>
                      <div className="row mb-4 w-100" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 0 : 16 }}>
                        <div className="col-12 col-md-4 mb-3 mb-md-0 d-flex flex-column align-items-center" style={{ width: isMobile ? '100%' : '33%' }}>
                          <label className="form-label" style={{fontWeight:700, color:'#222', width: '100%', textAlign: isMobile ? 'center' : 'left'}}>Code du pays</label>
                          <select className="form-control" value={formCountryCode} onChange={e=>setFormCountryCode(e.target.value)} style={{fontWeight:600, color:'#222', background:'#f8f9fa', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize: isMobile ? 15 : 16, padding: isMobile ? '10px 12px' : '12px 18px', marginBottom: isMobile ? 12 : 0, maxWidth: 120, width: '100%'}}>
                            <option value="+33">+33</option>
                            <option value="+32">+32</option>
                            <option value="+41">+41</option>
                            <option value="+1">+1</option>
                          </select>
                        </div>
                        <div className="col-12 col-md-8 d-flex flex-column align-items-center" style={{ width: isMobile ? '100%' : '67%' }}>
                          <label className="form-label" style={{fontWeight:700, color:'#222', width: '100%', textAlign: isMobile ? 'center' : 'left'}}>Numéro de téléphone</label>
                          <input type="tel" className="form-control" value={formPhone} onChange={e=>setFormPhone(e.target.value)} style={{fontWeight:600, color:'#222', background:'#f8f9fa', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize: isMobile ? 15 : 16, padding: isMobile ? '10px 12px' : '12px 18px', marginBottom: isMobile ? 12 : 0, maxWidth: 220, width: '100%'}} />
                        </div>
                      </div>
                      <button className="btn" style={{background:'#1e90ff', color:'#fff', fontWeight:700, width:250, borderRadius:12, fontSize:18, boxShadow:'0 2px 8px #1e90ff22'}} type="button" onClick={handleSave}>Enregistrer</button>
                      <div className="mt-4">
                        <button type="button" className="btn btn-link text-danger" style={{fontWeight:600, textDecoration:'none'}} onClick={async () => {
  if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
  try {
    await updateDoc(doc(db, 'users', user.uid), { deleted: true });
    await user.delete();
    await auth.signOut();
    window.location.href = '/';
  } catch (err) {
    alert('Erreur lors de la suppression du compte : ' + err.message);
  }
}}> <i className="fa fa-trash" /> Supprimer le compte</button>
                      </div>
                    </form>
                  </div>
                )}
                {compteTab==='email' && (
                  <div style={{background:'#fff', borderRadius:18, boxShadow:'0 2px 16px #0001', padding:32, border:'1.5px solid #e5e7eb', color:'#222', marginBottom:24}}>
                    <h4 style={{color:'#222', fontWeight:700, marginBottom:8}}>Adresse email</h4>
                    <div style={{color:'#888', marginBottom:18}}>Votre adresse email actuelle est affichée ci-dessous. Pour la modifier, contactez le support.</div>
                    <input type="email" className="form-control mb-3" value={infos.email} disabled readOnly style={{fontWeight:600, color:'#888', background:'none', border:'none', borderBottom:'2px solid #e5e7eb', borderRadius:0}} />
                  </div>
                )}
                {compteTab==='password' && (
                  <div style={{background:'#fff', borderRadius:18, boxShadow:'0 2px 16px #0001', padding:32, border:'1.5px solid #e5e7eb', color:'#222', marginBottom:24}}>
                    <h4 style={{color:'#222', fontWeight:700, marginBottom:8}}>Changer le mot de passe</h4>
                    <div style={{color:'#888', marginBottom:18}}>Pour plus de sécurité, choisissez un mot de passe d’au moins 6 caractères.</div>
                    <label className="form-label" style={{fontWeight:600, color:'#222'}}>Mot de passe actuel</label>
                    <input type="password" className="form-control mb-3" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} style={{fontWeight:600, color:'#222', background:'#f8f9fa', border:'1.5px solid #e5e7eb', borderRadius:10}} />
                    <label className="form-label" style={{fontWeight:600, color:'#222'}}>Nouveau mot de passe</label>
                    <input type="password" className="form-control mb-3" value={newPassword} onChange={e=>setNewPassword(e.target.value)} style={{fontWeight:600, color:'#222', background:'#f8f9fa', border:'1.5px solid #e5e7eb', borderRadius:10}} />
                    <label className="form-label" style={{fontWeight:600, color:'#222'}}>Confirmer le mot de passe</label>
                    <input type="password" className="form-control mb-3" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} style={{fontWeight:600, color:'#222', background:'#f8f9fa', border:'1.5px solid #e5e7eb', borderRadius:10}} />
                    {passwordError && <div className="alert alert-danger py-2">{passwordError}</div>}
                    <button className="btn btn-primary" style={{background:'#1e90ff', border:'none', fontWeight:700}} onClick={() => {
                      setPasswordError('');
                      if (!currentPassword) {
                        setPasswordError('Veuillez saisir votre mot de passe actuel.');
                        return;
                      }
                      if (newPassword.length < 6) {
                        setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        setPasswordError('Les mots de passe ne correspondent pas.');
                        return;
                      }
                      setPasswordError('Changement de mot de passe non implémenté.');
                    }}>Modifier le mot de passe</button>
                  </div>
                )}
                {compteTab==='adresse' && (
                  <div style={{background:'#fff', borderRadius:18, boxShadow:'0 2px 16px #0001', padding:32, border:'1.5px solid #e5e7eb', color:'#222', marginBottom:24}}>
                    <h4 style={{color:'#222', fontWeight:700, marginBottom:8}}>Adresse (optionnel)</h4>
                    <div style={{color:'#888', marginBottom:18}}>Vous pouvez renseigner une adresse postale si besoin.</div>
                    <input type="text" className="form-control mb-3" placeholder="Votre adresse" style={{fontWeight:600, color:'#222', background:'none', border:'none', borderBottom:'2px solid #e5e7eb', borderRadius:0}} />
                    <button className="btn btn-outline-primary" style={{color:'#1e90ff', borderColor:'#1e90ff'}}>Enregistrer l'adresse</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Modal show={showModal} onHide={()=>setShowModal(false)} centered>
        <Modal.Header closeButton style={{background:'#111', color:'#fff', borderBottom:'1px solid #222'}}>
          <Modal.Title style={{color:'#fff'}}>Succès</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{background:'#fff', color:'#111'}}>
          {success}
          <div className="mt-3">
            <a href="#" onClick={(e)=>{e.preventDefault(); setShowModal(false); setTab('infos');}} style={{color:'#111', fontWeight:700, textDecoration:'underline'}}>Voir mes informations</a>
          </div>
        </Modal.Body>
        <Modal.Footer style={{background:'#fff', borderTop:'1px solid #222'}}>
          <button className="btn btn-dark" onClick={()=>setShowModal(false)}>Fermer</button>
        </Modal.Footer>
      </Modal>
      <Footer />
    </>
  );
}
