import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { FaUserFriends, FaTachometerAlt, FaGasPump, FaCogs } from "react-icons/fa";
import logo from "../logo.svg";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from "../components/NavBar";

export default function BateauDetails() {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dateDebut = queryParams.get("dateDebut") || "";
  const heureDebut = queryParams.get("heureDebut") || "";
  const dateFin = queryParams.get("dateFin") || "";
  const heureFin = queryParams.get("heureFin") || "";
  const [bateau, setBateau] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBateau() {
      const docRef = doc(db, "bateaux", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBateau(docSnap.data());
      }
      setLoading(false);
    }
    fetchBateau();
  }, [id]);

  // Calcul du nombre de jours entre dateDebut et dateFin
  function getDaysDiff(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = d2 - d1;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
  const prix = parseFloat(queryParams.get("prix")) || (bateau ? bateau.prix : 0);
  const nbJours = (dateDebut && dateFin) ? getDaysDiff(dateDebut, dateFin) : 1;
  const total = prix * nbJours;

  function handleReservation() {
    const params = new URLSearchParams({
      dateDebut,
      heureDebut,
      dateFin,
      heureFin,
      prix: bateau.prix,
      bateauId: id
    });
    window.location.href = `/confirmation?${params.toString()}`;
  }

  if (loading) return <div className="container py-5 text-center">Chargement...</div>;
  if (!bateau) return <div className="container py-5 text-center">Bateau introuvable.</div>;

  const images = (bateau.photo && Array.isArray(bateau.photo)) ? bateau.photo.filter(img => img && img !== "") : [];

  return (
    <>
      <NavBar />
      <div style={{ paddingTop: 56 }}>
        <div className="container py-5">
          <div style={{ background: '#888', borderRadius: 20, overflow: 'hidden', maxWidth: 700, margin: '0 auto', boxShadow: '0 6px 32px rgba(0,0,0,0.10)' }}>
            <div style={{ position: 'relative', width: '100%', height: 360, background: '#222', borderRadius: '20px 20px 0 0', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
              {images.length > 0 ? (
                <Slider
                  dots={true}
                  infinite={true}
                  speed={500}
                  slidesToShow={1}
                  slidesToScroll={1}
                  arrows={true}
                  autoplay={true}
                  autoplaySpeed={3500}
                  appendDots={dots => (
                    <div style={{ position: 'absolute', bottom: 42, width: '100%' }}>
                      <ul style={{ margin: 0, padding: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>{dots}</ul>
                    </div>
                  )}
                  customPaging={i => (
                    <div style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: '#fff',
                      border: '2px solid #1e90ff',
                      boxShadow: '0 1px 4px rgba(30,60,60,0.10)',
                      margin: '0 2px',
                    }} />
                  )}
                >
                  {images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img src={img} alt={bateau.nom} style={{ width: '100%', height: 360, objectFit: 'cover', display: 'block', borderRadius: 0, transition: 'transform 0.3s' }} />
                    </div>
                  ))}
                </Slider>
              ) : (
                <div style={{ width: '100%', height: 360, background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Aucune image</div>
              )}
              <img src={logo} alt="BB YACHTS" style={{ position: 'absolute', top: 18, left: 18, height: 38, opacity: 0.9, zIndex: 2 }} />
            </div>
            <div style={{ background: '#fff', borderRadius: '18px 18px 0 0', maxWidth: 720, padding: '12px 18px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, position: 'relative', zIndex: 2, top: 0 }} className="bateau-infos-bar">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: 18 }}><FaUserFriends /> {bateau.places} Places</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: 18 }}><FaCogs /> {bateau.moteur} cv diesel</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: 18 }}><FaGasPump /> {bateau.carburant}l</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: 18 }}><FaTachometerAlt /> {bateau.vitesse} kn</span>
            </div>
            <div style={{ background: '#fff', borderRadius: '0 0 20px 20px', padding: 32, paddingTop: 40, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
              <h3 className="mb-4 text-center" style={{ fontWeight: 700, color: '#0a2342', letterSpacing: 2, fontSize: 32 }}>Réservez votre bateau</h3>
              <form className="mb-4" style={{ maxWidth: 480, margin: '0 auto', background: '#f8fafc', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 24 }}>
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="form-label" style={{ fontWeight: 600, color: '#0a2342' }}>Date de début</label>
                    <input type="text" className="form-control" value={dateDebut} readOnly style={{ borderRadius: 10, background: '#fff', fontWeight: 500, border: '1.5px solid #b3c6e0' }} />
                  </div>
                  <div className="col-6">
                    <label className="form-label" style={{ fontWeight: 600, color: '#0a2342' }}>Heure de début</label>
                    <input type="text" className="form-control" value={heureDebut} readOnly style={{ borderRadius: 10, background: '#fff', fontWeight: 500, border: '1.5px solid #b3c6e0' }} />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="form-label" style={{ fontWeight: 600, color: '#0a2342' }}>Date de fin</label>
                    <input type="text" className="form-control" value={dateFin} readOnly style={{ borderRadius: 10, background: '#fff', fontWeight: 500, border: '1.5px solid #b3c6e0' }} />
                  </div>
                  <div className="col-6">
                    <label className="form-label" style={{ fontWeight: 600, color: '#0a2342' }}>Heure de fin</label>
                    <input type="text" className="form-control" value={heureFin} readOnly style={{ borderRadius: 10, background: '#fff', fontWeight: 500, border: '1.5px solid #b3c6e0' }} />
                  </div>
                </div>
                <div className="row mb-4">
                  <div className="col-12">
                    <label className="form-label" style={{ fontWeight: 600, color: '#0a2342' }}>Prix</label>
                    <input type="text" className="form-control" value={prix + ' € / jour'} readOnly style={{ borderRadius: 10, background: '#e6f0fa', fontWeight: 600, color: '#0a2342', fontSize: 20, textAlign: 'center', border: 'none' }} />
                  </div>
                </div>
                <div className="mb-4 text-center" style={{ fontSize: 22, fontWeight: 600, color: '#0a2342', background: '#e6f0fa', borderRadius: 12, padding: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                  Nombre de jours : <span style={{ color: '#1e90ff' }}>{nbJours}</span> <br />
                  Total : <span style={{ color: '#1e90ff' }}>{total} €</span>
                </div>
                <button type="button" className="btn btn-primary w-100" style={{ borderRadius: 14, fontSize: 22, fontWeight: 700, padding: '14px 0', letterSpacing: 1, boxShadow: '0 2px 12px rgba(30,60,60,0.10)' }} onClick={handleReservation}>
                  Confirmer la réservation
                </button>
              </form>
              <div className="mb-3 mt-5" style={{ fontWeight: 600, fontSize: 20, color: '#0a2342' }}>Nos services festivité</div>
              <div className="d-flex flex-wrap justify-content-center" style={{ gap: 18 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ width: 140, height: 110, borderRadius: 14, overflow: 'hidden', background: '#222', position: 'relative', flex: '0 0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                    <img src="/Capture d’écran 2025-06-24 202048.png" alt="SUNSET" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 22, letterSpacing: 2 }}>SUNSET</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Section autres bateaux */}
          <div className="mt-5">
            <h4 className="mb-4 text-center" style={{ fontWeight: 700, color: '#0a2342', letterSpacing: 2 }}>Nous avons aussi</h4>
            <div className="row justify-content-center">
              {bateau && bateau.Ville && (
                <AutresBateaux currentId={id} ville={bateau.Ville} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// En bas du fichier, ajoute le composant AutresBateaux :
function AutresBateaux({ currentId, ville }) {
  const [bateaux, setBateaux] = React.useState([]);
  React.useEffect(() => {
    async function fetchBateaux() {
      const q = query(collection(db, "bateaux"), where("Ville", "==", ville));
      const snap = await getDocs(q);
      setBateaux(snap.docs.filter(doc => doc.id !== currentId).map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchBateaux();
  }, [ville, currentId]);
  if (bateaux.length === 0) return <div className="text-center text-muted">Aucun autre bateau disponible.</div>;
  return (
    <>
      {bateaux.map(bateau => (
        <div key={bateau.id} className="col-12 col-md-6 col-lg-4 mb-4">
          <div className="card h-100 p-2 border-0 text-start w-100" style={{ borderRadius: 14, border: "2px solid #222", background: "#f6f6f6", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", minHeight: 220, cursor: "pointer" }}>
            <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
              {bateau.photo && bateau.photo[0] && bateau.photo[0] !== "" && (
                <img src={bateau.photo[0]} className="w-100" alt={bateau.nom} style={{ height: 120, objectFit: "cover", borderRadius: 12 }} />
              )}
              <div style={{ position: "absolute", left: 0, bottom: 0, background: "rgba(30,60,60,0.7)", color: "#fff", padding: "6px 18px 4px 12px", borderRadius: "0 12px 0 0", fontSize: 18, fontWeight: 600, letterSpacing: 1 }}>
                {bateau.prix} € <span style={{ fontWeight: 400, fontSize: 14 }}>/jour</span>
              </div>
            </div>
            <div className="mt-3 mb-2 text-center" style={{ letterSpacing: 4, fontWeight: 600, fontSize: 16, color: "#222" }}>{bateau.nom && bateau.nom.toUpperCase()}</div>
          </div>
        </div>
      ))}
    </>
  );
}
