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
                <div className="card" style={{ borderRadius: 22, boxShadow: "0 8px 32px #0002", overflow: "hidden", background: '#fff', border: '1.5px solid #e5e7eb', color: '#232323', minHeight: 480, position: 'relative' }}>
                  {/* Badge occasion */}
                  <div style={{ position: 'absolute', top: 18, left: 18, background: '#10b981', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 10, padding: '7px 22px', zIndex: 2, boxShadow: '0 2px 8px #0002', letterSpacing: 1 }}>
                    <FaStar style={{ marginRight: 8 }} /> Occasion
                  </div>
                  {/* Galerie d'images */}
                  {images.length > 0 && (
                    <div style={{ position: 'relative', width: '100%', height: 360, background: '#f4f8fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={images[currentImage]} alt={bateau.nom} style={{ width: '100%', height: 360, objectFit: 'cover', borderBottom: '1.5px solid #e5e7eb', borderRadius: '22px 22px 0 0', transition: 'transform 0.3s', boxShadow: '0 8px 32px #1976d211' }} />
                      {images.length > 1 && (
                        <>
                          <button onClick={prevImage} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, width: 38, height: 38, fontSize: 22, color: '#1976d2', boxShadow: '0 2px 8px #0001', cursor: 'pointer', opacity: 0.8, zIndex: 2 }}>&lt;</button>
                          <button onClick={nextImage} style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, width: 38, height: 38, fontSize: 22, color: '#1976d2', boxShadow: '0 2px 8px #0001', cursor: 'pointer', opacity: 0.8, zIndex: 2 }}>&gt;</button>
                          <div style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 2 }}>
                            {images.map((img, i) => (
                              <img key={i} src={img} alt="miniature" onClick={() => selectImage(i)} style={{ width: 54, height: 38, objectFit: 'cover', borderRadius: 6, border: i === currentImage ? '2px solid #1976d2' : '1px solid #e5e7eb', boxShadow: '0 1px 4px #0001', cursor: 'pointer', opacity: i === currentImage ? 1 : 0.7, transition: 'transform 0.2s', transform: i === currentImage ? 'scale(1.1)' : 'scale(1)' }} />
                            ))}
                          </div>
                        </>
                      )}
                      {/* Badge prix sur l'image */}
                      <div style={{ position: 'absolute', bottom: 18, right: 18, background: '#10b981', color: '#fff', fontWeight: 900, fontSize: 22, borderRadius: 12, padding: '10px 28px', boxShadow: '0 2px 8px #0002', letterSpacing: 1, zIndex: 2 }}>
                        {bateau.prix} €
                      </div>
                    </div>
                  )}
                  <div className="card-body" style={{ padding: 40 }}>
                    <h1 style={{ fontWeight: 900, color: "#232323", fontSize: 36, marginBottom: 10, letterSpacing: -1 }}>{bateau.nom}</h1>
                    <div style={{ color: '#1976d2', fontWeight: 700, fontSize: 20, marginBottom: 18, letterSpacing: 0.5 }}>{bateau.Ville}</div>
                    <div style={{ color: '#555', fontSize: 18, marginBottom: 24, fontWeight: 500, textAlign: 'center', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>Exclusivité BB YACHTS</span> – Découvrez ce bateau d’occasion soigneusement sélectionné, inspecté et prêt à naviguer. Profitez d’un accompagnement personnalisé pour votre projet d’achat, de la visite à la livraison.
                    </div>
                    {/* Caractéristiques avec icônes */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 28 }}>
                      <div style={{ color: "#232323", fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><FaMapMarkerAlt /> <b>Ville :</b> {bateau.Ville}</div>
                      <div style={{ color: "#232323", fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><FaCogs /> <b>Moteur :</b> {bateau.moteur} CV</div>
                      <div style={{ color: "#232323", fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><FaUserFriends /> <b>Places :</b> {bateau.places}</div>
                      <div style={{ color: "#232323", fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><FaCalendarAlt /> <b>Année :</b> {bateau.annee}</div>
                      <div style={{ color: "#232323", fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><FaStar /> <b>État :</b> {bateau.etat}</div>
                      <div style={{ color: "#232323", fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><FaGasPump /> <b>Carburant :</b> {bateau.carburant} L</div>
                      <div style={{ color: "#232323", fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}><FaTachometerAlt /> <b>Vitesse :</b> {bateau.vitesse} kn</div>
                    </div>
                    {/* Description si dispo */}
                    {bateau.description && (
                      <div style={{ background: '#f4f8fb', borderRadius: 10, padding: 22, marginBottom: 18, color: '#232323', fontSize: 18, fontWeight: 500 }}>
                        <b>Description :</b> {bateau.description}
                      </div>
                    )}
                    {/* Bloc avantages */}
                    <div style={{ background: '#e8f4fd', borderRadius: 10, padding: 22, marginBottom: 18, color: '#1976d2', fontSize: 17, fontWeight: 600, textAlign: 'center', border: '1px solid #b6e0fe' }}>
                      ✔️ Garantie mécanique 3 mois incluse<br />
                      ✔️ Dossier administratif géré par BB YACHTS<br />
                      ✔️ Reprise possible de votre ancien bateau<br />
                      ✔️ Financement sur mesure possible<br />
                      ✔️ Livraison partout en France et Europe
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 32, color: "#10b981", marginTop: 24, marginBottom: 10, textAlign: 'center' }}>{bateau.prix} €</div>
                    <div style={{ color: '#888', fontSize: 15, marginBottom: 18, textAlign: 'center' }}>
                      Prix affiché TTC, hors frais d’immatriculation et de livraison. Possibilité de financement et de reprise de votre ancien bateau.
                    </div>
                    <button style={{
                      marginTop: 10,
                      padding: '16px 38px',
                      background: 'linear-gradient(90deg,#1976d2 60%,#10b981 100%)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 20,
                      border: 'none',
                      borderRadius: 12,
                      boxShadow: '0 2px 8px #1976d233',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      letterSpacing: 1,
                      display: 'block',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      marginBottom: 18
                    }}>Contacter BB YACHTS</button>
                    <div style={{ marginTop: 32, color: '#1976d2', fontWeight: 700, fontSize: 18, textAlign: 'center', letterSpacing: 0.5 }}>
                      Pour toute question ou pour organiser une visite, contactez-nous au <a href="tel:+33609176282" style={{ color: '#10b981', textDecoration: 'underline', fontWeight: 800 }}>+33 6 09 17 62 82</a> ou par email à <a href="mailto:charter@bb-yachts.com" style={{ color: '#10b981', textDecoration: 'underline', fontWeight: 800 }}>charter@bb-yachts.com</a>
                    </div>
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
