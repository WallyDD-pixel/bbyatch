import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import NavBar from "../components/NavBar";
import { FaCogs, FaEuroSign, FaCalendarAlt, FaTag } from "react-icons/fa";

export default function ExperiencePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bateaux, setBateaux] = useState([]);
  const [loadingBateaux, setLoadingBateaux] = useState(true);
  const [selectedBateau, setSelectedBateau] = useState(null);
  const [modalBateau, setModalBateau] = useState(null);
  const [modalImageIdx, setModalImageIdx] = useState(0);

  useEffect(() => {
    async function fetchExperienceAndBateaux() {
      setLoading(true);
      setLoadingBateaux(true);
      const ref = doc(db, "experience", id);
      const snap = await getDoc(ref);
      const data = snap.exists() ? { id: snap.id, ...snap.data() } : null;
      setExperience(data);
      setLoading(false);
      // Charger la sous-collection bateaux
      if (data) {
        const bateauxRef = collection(db, "experience", id, "bateaux");
        const bateauxSnap = await getDocs(bateauxRef);
        setBateaux(bateauxSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setBateaux([]);
      }
      setLoadingBateaux(false);
    }
    fetchExperienceAndBateaux();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
      <div style={{ textAlign: 'center', color: '#6c757d' }}>
        <div className="spinner-border text-muted" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p style={{ marginTop: 20, fontSize: 16 }}>Chargement de l'expérience...</p>
      </div>
    </div>
  );

  if (!experience) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: 8, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', maxWidth: 400, border: '1px solid #e9ecef' }}>
        <h3 style={{ color: '#495057', marginBottom: 16, fontWeight: 600 }}>Expérience introuvable</h3>
        <p style={{ color: '#6c757d', margin: 0 }}>L'expérience demandée n'existe pas ou n'est plus disponible.</p>
      </div>
    </div>
  );

  const image = experience.image && experience.image.trim() !== "" ? experience.image : "/default-experience.jpg";

  return (
    <>
      <NavBar />
      <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: 80, paddingBottom: 40 }}>
        <div className="container">
          <div style={{
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 6px 32px #0001',
            overflow: 'hidden',
            border: '1.5px solid #e5e7eb',
            color: '#232323',
            maxWidth: 900,
            margin: '0 auto',
            marginTop: 24
          }}>
            {/* Image principale */}
            <div style={{ position: 'relative', width: '100%', height: 340, background: '#f4f8fb' }}>
              <img src={image} alt={experience.nom} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px 18px 0 0', borderBottom: '1.5px solid #e5e7eb' }} />
            </div>
            <div className="card-body" style={{ padding: 40 }}>
              <h2 style={{ fontWeight: 800, color: "#232323", fontSize: 32, marginBottom: 16 }}>{experience.nom}</h2>
              
              {experience.date && (
                <div style={{ color: '#1976d2', fontWeight: 600, fontSize: 18, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FaCalendarAlt /> {experience.date}
                </div>
              )}
              {experience.description && (
                <div style={{ background: '#f4f8fb', borderRadius: 10, padding: 18, marginBottom: 18, color: '#222', fontSize: 17 }}>
                  <b>Description :</b> {experience.description}
                </div>
              )}
              {/* Infos pratiques / contact */}
              {experience.info && (
                <div style={{ background: '#e8f4fd', borderRadius: 10, padding: 18, marginBottom: 18, color: '#232323', fontSize: 16, fontWeight: 500, border: '1px solid #b6e0fe' }}>
                  <b>Infos pratiques :</b><br />
                  {experience.info}
                </div>
              )}
              {/* Caractéristiques techniques ou autres infos */}
              {experience.details && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontWeight: 700, color: '#232323', marginBottom: 12 }}>Détails</h4>
                  <div style={{ color: '#555', fontSize: 16 }}>{experience.details}</div>
                </div>
              )}
            </div>
          </div>
          {/* Section bateaux disponibles pour l'expérience */}
          <div style={{ maxWidth: 900, margin: '32px auto 0', background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px #0001', border: '1.5px solid #e5e7eb', padding: 32 }}>
            <h3 style={{ fontWeight: 700, color: '#232323', fontSize: 24, marginBottom: 24, textAlign: 'center' }}>Sélectionner un bateau disponible pour l'expérience</h3>
            {loadingBateaux ? (
              <div style={{ color: '#888', textAlign: 'center', fontSize: 18 }}>Chargement des bateaux...</div>
            ) : bateaux.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', fontSize: 18 }}>Aucun bateau disponible pour cette expérience.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
                {bateaux.map((b, i) => {
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBateau(b.id)}
                      style={{
                        background: selectedBateau === b.id ? '#e8f4fd' : '#f8f9fa',
                        borderRadius: 18,
                        boxShadow: selectedBateau === b.id ? '0 6px 24px #1976d233' : '0 2px 8px #0001',
                        border: selectedBateau === b.id ? '2.5px solid #1976d2' : '1.5px solid #e5e7eb',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 0,
                        cursor: 'pointer',
                        transition: 'all 0.25s',
                        minHeight: 370,
                        position: 'relative'
                      }}
                    >
                      {/* Image principale */}
                      <div style={{ width: '100%', height: 170, background: '#e8eaf0', position: 'relative' }}>
                        <img src={Array.isArray(b.images) && b.images[0] ? b.images[0] : '/default-bateau.jpg'} alt={b.nom} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px 18px 0 0', transition: 'transform 0.2s', boxShadow: selectedBateau === b.id ? '0 4px 16px #1976d233' : 'none' }} />
                        {selectedBateau === b.id && (
                          <div style={{ position: 'absolute', top: 12, right: 12, background: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 8, padding: '6px 14px', boxShadow: '0 2px 8px #1976d222' }}>Sélectionné</div>
                        )}
                      </div>
                      {/* Contenu */}
                      <div style={{ flex: 1, width: '100%', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: 20, color: '#232323', marginBottom: 8, textAlign: 'center', letterSpacing: -0.5 }}>{b.nom}</div>
                        <div style={{ fontSize: 16, color: '#232323', fontWeight: 700, marginBottom: 10 }}>{b.prix} €</div>
                        {b.description && <div style={{ color: '#232323', fontSize: 15, marginBottom: 10, textAlign: 'center', minHeight: 38, maxHeight: 48, overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.description}</div>}
                        {/* Bouton ou action possible */}
                        <button
                          style={{
                            background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 15, marginTop: 10, boxShadow: '0 2px 8px #1976d222', letterSpacing: 1
                          }}
                          onClick={e => { e.stopPropagation(); setModalBateau(b); setModalImageIdx(0); }}
                        >Voir</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Récapitulatif du bateau sélectionné */}
            {selectedBateau && (() => {
              const b = bateaux.find(x => x.id === selectedBateau);
              if (!b) return null;
              return (
                <div style={{
                  marginTop: 40,
                  background: '#e8f4fd',
                  borderRadius: 16,
                  padding: 28,
                  boxShadow: '0 2px 12px #1976d211',
                  border: '1.5px solid #b6e0fe',
                  maxWidth: 600,
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  <h4 style={{ color: '#1976d2', fontWeight: 800, fontSize: 22, marginBottom: 18, textAlign: 'center' }}>Récapitulatif de votre sélection</h4>
                  <div style={{ display: 'flex', flexDirection: 'row', gap: 24, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {/* Images du bateau */}
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
                      {Array.isArray(b.images) && b.images.length > 0 ? b.images.map((img, idx) => (
                        <img key={idx} src={img} alt={b.nom} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px #1976d222' }} />
                      )) : b.image ? (
                        <img src={b.image} alt={b.nom} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px #1976d222' }} />
                      ) : null}
                    </div>
                    {/* Infos */}
                    <div style={{ minWidth: 180 }}>
                      <div style={{ fontWeight: 700, fontSize: 18, color: '#232323', marginBottom: 6 }}>{b.nom}</div>
                      <div style={{ fontSize: 16, color: '#1976d2', fontWeight: 700, marginBottom: 6 }}>{b.prix} €</div>
                      {b.description && <div style={{ color: '#232323', fontSize: 15, marginBottom: 6 }}>{b.description}</div>}
                      {b.places && <div style={{ color: '#232323', fontSize: 15 }}>Places : {b.places}</div>}
                      {b.moteur && <div style={{ color: '#232323', fontSize: 15 }}>Moteur : {b.moteur}</div>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 28 }}>
                    <button style={{
                      background: 'linear-gradient(90deg,#1976d2 60%,#10b981 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '16px 48px',
                      fontWeight: 900,
                      fontSize: 20,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px #1976d244',
                      letterSpacing: 1,
                      marginTop: 18,
                      transition: 'background 0.2s, transform 0.2s',
                      outline: 'none',
                    }}
                      onClick={() => navigate('/recap', { state: { bateau: b, experience } })}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >Suivant</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      {/* Modal d'affichage des images du bateau */}
      {modalBateau && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000b', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        }}
          onClick={() => setModalBateau(null)}
        >
          <div style={{ position: 'relative', background: '#232733', borderRadius: 16, padding: 24, boxShadow: '0 4px 32px #000a', minWidth: 320, minHeight: 220, maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
            <span style={{ position: 'absolute', top: 12, right: 18, color: '#fff', fontSize: 36, fontWeight: 900, cursor: 'pointer', zIndex: 1001 }} onClick={() => setModalBateau(null)}>&times;</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
              {/* Flèche gauche */}
              {Array.isArray(modalBateau.images) && modalBateau.images.length > 1 && (
                <button onClick={() => setModalImageIdx(idx => (idx - 1 + modalBateau.images.length) % modalBateau.images.length)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer', fontWeight: 700 }}>&lt;</button>
              )}
              {/* Image principale */}
              <img
                src={Array.isArray(modalBateau.images) && modalBateau.images.length > 0 ? modalBateau.images[modalImageIdx] : modalBateau.image}
                alt={modalBateau.nom}
                style={{ maxWidth: '70vw', maxHeight: '70vh', borderRadius: 12, boxShadow: '0 2px 16px #000a', background: '#222' }}
              />
              {/* Flèche droite */}
              {Array.isArray(modalBateau.images) && modalBateau.images.length > 1 && (
                <button onClick={() => setModalImageIdx(idx => (idx + 1) % modalBateau.images.length)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer', fontWeight: 700 }}>&gt;</button>
              )}
            </div>
            {/* Miniatures si plusieurs images */}
            {Array.isArray(modalBateau.images) && modalBateau.images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
                {modalBateau.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={modalBateau.nom}
                    style={{ width: 60, height: 44, objectFit: 'cover', borderRadius: 6, border: idx === modalImageIdx ? '2.5px solid #10b981' : '2px solid #374151', cursor: 'pointer', boxShadow: '0 1px 4px #0006' }}
                    onClick={() => setModalImageIdx(idx)}
                  />
                ))}
              </div>
            )}
            <div style={{ color: '#e8eaed', fontWeight: 700, fontSize: 18, marginTop: 18 }}>{modalBateau.nom}</div>
          </div>
        </div>
      )}
      <footer style={{
        background: '#232323',
        color: '#fff',
        textAlign: 'center',
        padding: '32px 0 18px 0',
        fontSize: 16,
        letterSpacing: 0.5,
        marginTop: 40,
        borderTop: '1.5px solid #e5e7eb',
        width: '100%'
      }}>
        © {new Date().getFullYear()} BB YACHTS. Tous droits réservés.
      </footer>
    </>
  );
}
