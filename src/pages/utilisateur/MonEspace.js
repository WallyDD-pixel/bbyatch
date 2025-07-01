import React, { useEffect, useState, useRef } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../../logo.svg';
import { FaClipboardUser, FaChevronDown, FaClipboardList, FaIdCard, FaUser, FaCircleUser, FaCircleQuestion, FaRightFromBracket } from 'react-icons/fa6';
import Modal from 'react-bootstrap/Modal';

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
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm" style={{ width: '100vw', left: 0, top: 0, position: 'fixed', zIndex: 1000 }}>
        <div className="container-fluid">
          <img src={logo} alt="BBYATCH logo" style={{ height: 40 }} className="me-2" />
          <div className="ms-auto d-flex align-items-center" style={{ marginRight: 50 }}>
            {infos.prenom && (
              <span style={{ fontWeight: 700, color: '#000', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setShowProfileMenu(v => !v)}>
                <FaClipboardUser style={{ color: '#000', fontSize: 22 }} /> {infos.prenom}
                <FaChevronDown style={{ color: '#000', fontSize: 16 }} />
                {showProfileMenu && (
                  <div ref={profileMenuRef} style={{ position: 'absolute', top: 48, right: 50, background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', minWidth: 240, zIndex: 1000, padding: 0 }}>
                    <div style={{ padding: '18px 18px 8px 18px', borderBottom: '1px solid #eee', fontWeight: 700, color: '#1e90ff', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FaCircleUser style={{ fontSize: 22 }} /> {infos.prenom}
                    </div>
                    <ul className="list-unstyled mb-0" style={{ padding: 0, margin: 0 }}>
                      <li style={menuItemStyle} onClick={() => { setShowProfileMenu(false); setTab('compte'); }}><FaUser style={iconStyle} /> Mes informations</li>
                      <li style={menuItemStyle} onClick={() => { setShowProfileMenu(false); setTab('reservations'); }}><FaClipboardList style={iconStyle} /> Mes réservations</li>
                      <li style={{ ...menuItemStyle, borderTop: '1px solid #eee', marginTop: 6 }} onClick={() => { setShowProfileMenu(false); }}><FaCircleQuestion style={iconStyle} /> Aide</li>
                      <li style={{ ...menuItemStyle, color: '#e74c3c', fontWeight: 700 }} onClick={async () => { setShowProfileMenu(false); await auth.signOut(); window.location.href = '/'; }}><FaRightFromBracket style={iconStyle} /> Se déconnecter</li>
                    </ul>
                  </div>
                )}
              </span>
            )}
          </div>
        </div>
      </nav>
      <div style={{ height: 70 }} />
      <div className="container py-5" style={{ maxWidth: 800 }}>
        <h2 className="titre-playfair mb-4">Mon espace</h2>
        <ul className="nav nav-tabs mb-4">
          
          <li className="nav-item">
            <button className={`nav-link${tab==='reservations'?' active':''}`} onClick={()=>setTab('reservations')}>Mes réservations</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link${tab==='compte'?' active':''}`} onClick={()=>setTab('compte')}>Compte</button>
          </li>
        </ul>
        
        {tab==='reservations' && (
          <div className="bg-white p-4 rounded shadow-sm">
            <h5 className="mb-3">Historique de mes réservations</h5>
            {reservations.length === 0 ? (
              <div className="text-muted">Aucune réservation trouvée.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle text-center" style={{ boxShadow: '0 4px 24px #1e90ff22', borderRadius: 16, overflow: 'hidden', background: '#fafdff' }}>
                  <thead className="table-light" style={{ background: 'linear-gradient(90deg, #e6f0fa 60%, #fff 100%)', fontWeight: 700, fontSize: 17, color: '#1e90ff', letterSpacing: 1 }}>
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
                    {reservations.map(r => (
                      <tr key={r.id} style={{ background: '#fff', borderBottom: '1.5px solid #e6f0fa', transition: 'background 0.2s' }}>
                        <td style={{ fontWeight: 600, color: '#1e90ff', fontSize: 16 }}>{r.bateauNom || bateauxMap[r.bateauId] || <span className="text-muted">-</span>}</td>
                        <td style={{ fontWeight: 500, color: '#222', fontSize: 15 }}>{r.dateDebut || <span className="text-muted">-</span>}</td>
                        <td style={{ fontWeight: 500, color: '#222', fontSize: 15 }}>{r.dateFin || <span className="text-muted">-</span>}</td>
                        <td style={{ fontWeight: 600, color: '#0a2342', fontSize: 15 }}>{r.montant ? `${r.montant} ${r.devise ? r.devise.toUpperCase() : ''}` : <span className="text-muted">-</span>}</td>
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
              </div>
            )}
          </div>
        )}
        {tab==='compte' && (
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="d-flex flex-column flex-md-row align-items-start w-100">
              <div style={{minWidth:220, maxWidth:320}} className="w-100 mb-4 mb-md-0 me-md-4">
                <h2 style={{fontWeight:700, fontSize: '1.6rem'}}>Compte</h2>
                <div style={{fontWeight:600, fontSize:16, marginBottom:24, textAlign:'left'}}>UN SEUL ENDROIT POUR GÉRER VOTRE COMPTE</div>
                <ul className="nav nav-tabs flex-md-column mb-4 w-100" style={{borderBottom:'none'}}>
                  <li className="nav-item">
                    <button className={`nav-link${compteTab==='infos'?' active':''}`} style={{border:'none', borderBottom:compteTab==='infos'?'2px solid #1e90ff':'none', color:'#222', background:'none', fontWeight:600, width:'100%', textAlign:'left'}} onClick={()=>setCompteTab('infos')}>Informations supplémentaires</button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link${compteTab==='email'?' active':''}`} style={{border:'none', borderBottom:compteTab==='email'?'2px solid #1e90ff':'none', color:'#222', background:'none', fontWeight:600, width:'100%', textAlign:'left'}} onClick={()=>setCompteTab('email')}>Adresse email</button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link${compteTab==='password'?' active':''}`} style={{border:'none', borderBottom:compteTab==='password'?'2px solid #1e90ff':'none', color:'#222', background:'none', fontWeight:600, width:'100%', textAlign:'left'}} onClick={()=>setCompteTab('password')}>Modifiez votre mot de passe</button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link${compteTab==='adresse'?' active':''}`} style={{border:'none', borderBottom:compteTab==='adresse'?'2px solid #1e90ff':'none', color:'#222', background:'none', fontWeight:600, width:'100%', textAlign:'left'}} onClick={()=>setCompteTab('adresse')}>Adresse (optionnel)</button>
                  </li>
                </ul>
              </div>
              <div style={{flex:1, minWidth:0}} className="w-100">
                {compteTab==='infos' && (
                  <form style={{
                    maxWidth:500,
                    background:'#fff',
                    borderRadius:18,
                    boxShadow:'0 2px 16px #00000022',
                    padding:32,
                    border:'1.5px solid #222'
                  }}>
                    <h3 style={{textAlign:'center', color:'#111', fontWeight:800, marginBottom:8, letterSpacing:0.5}}>Informations supplémentaires</h3>
                    <div className="row mb-4">
                      <div className="col-6">
                        <label className="form-label" style={{fontWeight:700, color:'#111'}}>Nom</label>
                        <input type="text" className="form-control" value={formInfos.nom} onChange={e=>setFormInfos({...formInfos, nom:e.target.value})} style={{fontWeight:600, color:'#111', background:'#fff', border:'1.5px solid #222', borderRadius:10, boxShadow:'none'}} />
                      </div>
                      <div className="col-6">
                        <label className="form-label" style={{fontWeight:700, color:'#111'}}>Prénom</label>
                        <input type="text" className="form-control" value={formInfos.prenom} onChange={e=>setFormInfos({...formInfos, prenom:e.target.value})} style={{fontWeight:600, color:'#111', background:'#fff', border:'1.5px solid #222', borderRadius:10, boxShadow:'none'}} />
                      </div>
                    </div>
                    <div className="row mb-4">
                      <div className="col-4">
                        <label className="form-label" style={{fontWeight:700, color:'#111'}}>Code du pays</label>
                        <select className="form-control" value={formCountryCode} onChange={e=>setFormCountryCode(e.target.value)} style={{fontWeight:600, color:'#111', background:'#fff', border:'1.5px solid #222', borderRadius:10}}>
                          <option value="+33">+33</option>
                          <option value="+32">+32</option>
                          <option value="+41">+41</option>
                          <option value="+1">+1</option>
                        </select>
                      </div>
                      <div className="col-8">
                        <label className="form-label" style={{fontWeight:700, color:'#111'}}>Numéro de téléphone</label>
                        <input type="tel" className="form-control" value={formPhone} onChange={e=>setFormPhone(e.target.value)} style={{fontWeight:600, color:'#111', background:'#fff', border:'1.5px solid #222', borderRadius:10}} />
                      </div>
                    </div>
                    <button className="btn" style={{background:'#111', color:'#fff', fontWeight:700, width:250, borderRadius:12, fontSize:18, boxShadow:'0 2px 8px #00000022'}} type="button" onClick={handleSave}>Enregistrer</button>
                    <div className="mt-4">
                      <button type="button" className="btn btn-link text-danger" style={{fontWeight:600, textDecoration:'none'}}> <i className="fa fa-trash" /> Supprimer le compte</button>
                    </div>
                  </form>
                )}
                {compteTab==='email' && (
                  <div style={{maxWidth:500}}>
                    <label className="form-label" style={{fontWeight:600}}>Adresse email</label>
                    <input type="email" className="form-control mb-3" value={infos.email} disabled readOnly style={{fontWeight:600, color:'#888', background:'none', border:'none', borderBottom:'2px solid #eee', borderRadius:0}} />
                    <div className="text-muted">Pour modifier votre email, contactez le support.</div>
                  </div>
                )}
                {compteTab==='password' && (
                  <div style={{maxWidth:500}}>
                    <label className="form-label" style={{fontWeight:600}}>Mot de passe actuel</label>
                    <input type="password" className="form-control mb-3" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} style={{fontWeight:600, color:'#111', background:'#fff', border:'1.5px solid #222', borderRadius:10}} />
                    <label className="form-label" style={{fontWeight:600}}>Nouveau mot de passe</label>
                    <input type="password" className="form-control mb-3" value={newPassword} onChange={e=>setNewPassword(e.target.value)} style={{fontWeight:600, color:'#111', background:'#fff', border:'1.5px solid #222', borderRadius:10}} />
                    <label className="form-label" style={{fontWeight:600}}>Confirmer le mot de passe</label>
                    <input type="password" className="form-control mb-3" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} style={{fontWeight:600, color:'#111', background:'#fff', border:'1.5px solid #222', borderRadius:10}} />
                    {passwordError && <div className="alert alert-danger py-2">{passwordError}</div>}
                    <button className="btn btn-dark" onClick={() => {
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
                      // Ici, tu peux ajouter la logique de changement de mot de passe Firebase
                      setPasswordError('Changement de mot de passe non implémenté.');
                    }}>Modifier le mot de passe</button>
                  </div>
                )}
                {compteTab==='adresse' && (
                  <div style={{maxWidth:500}}>
                    <label className="form-label" style={{fontWeight:600}}>Adresse (optionnel)</label>
                    <input type="text" className="form-control mb-3" placeholder="Votre adresse" style={{fontWeight:600, color:'#222', background:'none', border:'none', borderBottom:'2px solid #eee', borderRadius:0}} />
                    <button className="btn btn-outline-dark">Enregistrer l'adresse</button>
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
            <a href="#" onClick={()=>{setShowModal(false); setTab('infos');}} style={{color:'#111', fontWeight:700, textDecoration:'underline'}}>Voir mes informations</a>
          </div>
        </Modal.Body>
        <Modal.Footer style={{background:'#fff', borderTop:'1px solid #222'}}>
          <button className="btn btn-dark" onClick={()=>setShowModal(false)}>Fermer</button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
