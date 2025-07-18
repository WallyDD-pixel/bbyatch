import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import NavBar from "../components/NavBar";
import { FaMapMarkerAlt, FaCogs, FaUserFriends, FaGasPump, FaCalendarAlt, FaTachometerAlt, FaStar } from 'react-icons/fa';

export default function BateauOccasionDetail() {
  const { id } = useParams();
  const [bateau, setBateau] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    async function fetchBateau() {
      setLoading(true);
      const ref = doc(db, "bateauxoccasion", id);
      const snap = await getDoc(ref);
      setBateau(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    }
    fetchBateau();
  }, [id]);

  const images = bateau?.photo?.filter(Boolean) || [];

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  const selectImage = (i) => setCurrentImage(i);

  return (
    <>
      <NavBar />
      <div style={{ paddingTop: 80, background: "#f8f9fa", minHeight: "100vh" }}>
        <div className="container py-4">
          {loading && <div style={{textAlign:'center', color:'#1976d2', fontWeight:600, fontSize:20}}>Chargement...</div>}
          {!loading && !bateau && <div style={{textAlign:'center', color:'#888', fontWeight:500, fontSize:18}}>Bateau introuvable.</div>}
          {!loading && bateau && (
            <div className="row justify-content-center">
              <div className="col-12 col-md-10 col-lg-8">
                <div className="card" style={{ borderRadius: 18, boxShadow: "0 6px 32px #0001", overflow: "hidden", background: '#fff', border: '1.5px solid #e5e7eb', color: '#222', minHeight: 420 }}>
                  {/* Badge occasion */}
                  <div style={{ position: 'absolute', top: 18, left: 18, background: '#10b981', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 8, padding: '6px 18px', zIndex: 2, boxShadow: '0 2px 8px #0002' }}>
                    <FaStar style={{ marginRight: 8 }} /> Occasion
                  </div>
                  {/* Galerie d'images */}
                  {images.length > 0 && (
                    <div style={{ position: 'relative', width: '100%', height: 340, background: '#f4f8fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={images[currentImage]} alt={bateau.nom} style={{ width: '100%', height: 340, objectFit: 'cover', borderBottom: '1.5px solid #e5e7eb', borderRadius: '18px 18px 0 0', transition: 'transform 0.3s' }} />
                      {images.length > 1 && (
                        <>
                          <button onClick={prevImage} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, width: 38, height: 38, fontSize: 22, color: '#1976d2', boxShadow: '0 2px 8px #0001', cursor: 'pointer', opacity: 0.8 }}>&lt;</button>
                          <button onClick={nextImage} style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, width: 38, height: 38, fontSize: 22, color: '#1976d2', boxShadow: '0 2px 8px #0001', cursor: 'pointer', opacity: 0.8 }}>&gt;</button>
                          <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
                            {images.map((img, i) => (
                              <img key={i} src={img} alt="miniature" onClick={() => selectImage(i)} style={{ width: 54, height: 38, objectFit: 'cover', borderRadius: 6, border: i === currentImage ? '2px solid #1976d2' : '1px solid #e5e7eb', boxShadow: '0 1px 4px #0001', cursor: 'pointer', opacity: i === currentImage ? 1 : 0.7, transition: 'transform 0.2s', transform: i === currentImage ? 'scale(1.1)' : 'scale(1)' }} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <div className="card-body" style={{ padding: 32 }}>
                    <h2 style={{ fontWeight: 800, color: "#1976d2", fontSize: 32, marginBottom: 16 }}>{bateau.nom}</h2>
                    {/* Caractéristiques avec icônes */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 24 }}>
                      <div style={{ color: "#888", fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><FaMapMarkerAlt /> <b>Ville :</b> {bateau.Ville}</div>
                      <div style={{ color: "#888", fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><FaCogs /> <b>Moteur :</b> {bateau.moteur} CV</div>
                      <div style={{ color: "#888", fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><FaUserFriends /> <b>Places :</b> {bateau.places}</div>
                      <div style={{ color: "#888", fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><FaCalendarAlt /> <b>Année :</b> {bateau.annee}</div>
                      <div style={{ color: "#888", fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><FaStar /> <b>État :</b> {bateau.etat}</div>
                      <div style={{ color: "#888", fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><FaGasPump /> <b>Carburant :</b> {bateau.carburant} L</div>
                      <div style={{ color: "#888", fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><FaTachometerAlt /> <b>Vitesse :</b> {bateau.vitesse} kn</div>
                    </div>
                    {/* Description si dispo */}
                    {bateau.description && (
                      <div style={{ background: '#f4f8fb', borderRadius: 10, padding: 18, marginBottom: 18, color: '#222', fontSize: 17 }}>
                        <b>Description :</b> {bateau.description}
                      </div>
                    )}
                    <div style={{ fontWeight: 800, fontSize: 28, color: "#10b981", marginTop: 24 }}>{bateau.prix} €</div>
                    <button style={{
                      marginTop: 24,
                      padding: '14px 32px',
                      background: '#1976d2',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 18,
                      border: 'none',
                      borderRadius: 10,
                      boxShadow: '0 2px 8px #0001',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}>Contacter</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
