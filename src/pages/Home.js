import React, { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../logo.svg";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import ExperienceSlider from "../components/ExperienceSlider";
import LocationSearch from "../components/LocationSearch";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { FaUser, FaChevronDown, FaCar, FaIdCard, FaUserCircle, FaQuestionCircle, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';
import NavBar from "../components/NavBar";
import { Users, Gauge, Fuel } from "lucide-react";
import { FaCogs } from "react-icons/fa";
import Footer from "../components/Footer";

export default function Home() {
    const [backgroundUrl, setBackgroundUrl] = useState(
        "https://static.vecteezy.com/ti/photos-gratuite/p2/5582136-fond-blanc-texture-motif-blanc-photo.jpg"
      );
    const [villes, setVilles] = useState(["Golf Juan"]);
    const [ville, setVille] = useState("");
    const [user, setUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [presentation, setPresentation] = useState({
      titre: "Qui sommes-nous ?",
      texte: "BBYatch est une plateforme dédiée à la passion nautique. Nous accompagnons particuliers et professionnels dans la gestion, la location, l'entretien et l'achat/vente de bateaux. Notre équipe experte vous garantit un service sur-mesure, fiable et transparent.",
      sousTitre: "Que proposons-nous ?",
      sousTexte: "Découvrez une offre complète autour de quatre piliers majeurs pour répondre à tous vos besoins nautiques.",
      piliers: [
        { icon: "🛠️", color: "#495057", titre: "SAV", texte: "Service Après-Vente : entretien, réparations, conseils et accompagnement technique pour votre bateau." },
        { icon: "⚓", color: "#495057", titre: "Management", texte: "Gestion de bateaux : suivi administratif, logistique, maintenance et optimisation de la rentabilité." },
        { icon: "⛵", color: "#495057", titre: "Charter", texte: "Location de bateaux avec ou sans skipper, pour des expériences inoubliables en mer." },
        { icon: "🚤", color: "#495057", titre: "Vente d'occasion", texte: "Achat et vente de bateaux d'occasion, accompagnement personnalisé et annonces vérifiées." }
      ]
    });
    const [galerieImages, setGalerieImages] = useState([
      // Valeur par défaut si Firestore vide
      "/7TDkCJ1TfUayTCtsXxDcrKszVXM.avif",
      "/adTI19tRQIpgKsOy325gpLZijYY.avif",
      "/bJZMpRoRx8Y3rk6f7jtTssCRVg.avif",
      "/HqnAwA2OxUktnp3Cfbv3TacaXk4.avif"
    ]);
    const [bateaux, setBateaux] = useState([]);
    const [loadingBateaux, setLoadingBateaux] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const profileMenuRef = useRef();
    const navigate = useNavigate();

    // Fonction pour détecter la taille d'écran
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

    useEffect(() => {
        async function fetchBackground() {
          const docRef = doc(db, "settings", "homepage");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().accueil) {
            setBackgroundUrl(docSnap.data().accueil);
          }
        }
        fetchBackground();
    }, []);

    useEffect(() => {
      // La liste des villes est fixée à Golf Juan uniquement
      setVilles(["Golf Juan"]);
    }, []);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
      return () => unsubscribe();
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
      async function fetchPresentation() {
        const docRef = doc(db, "settings", "presentationHome");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setPresentation(snap.data());
        }
      }
      fetchPresentation();
    }, []);

    useEffect(() => {
      async function fetchGalerieImages() {
        const docRef = doc(db, "settings", "galerieHome");
        const snap = await getDoc(docRef);
        if (snap.exists() && Array.isArray(snap.data().images)) {
          setGalerieImages(snap.data().images);
        } else {
          // Création du document s'il n'existe pas
          const defaultImages = [
            "/7TDkCJ1TfUayTCtsXxDcrKszVXM.avif",
            "/adTI19tRQIpgKsOy325gpLZijYY.avif",
            "/bJZMpRoRx8Y3rk6f7jtTssCRVg.avif",
            "/HqnAwA2OxUktnp3Cfbv3TacaXk4.avif"
          ];
          await setDoc(docRef, { images: defaultImages });
          setGalerieImages(defaultImages);
        }
      }
      fetchGalerieImages();
    }, []);

    useEffect(() => {
      async function fetchBateaux() {
        setLoadingBateaux(true);
        const snap = await getDocs(collection(db, "bateaux"));
        setBateaux(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoadingBateaux(false);
      }
      fetchBateaux();
    }, []);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
        setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

  return (
    <div className="bg-light min-vh-100">
      <NavBar />
      
      {/* Ligne décorative responsive */}
      <div style={{ 
        width: '100%', 
        height: isMobile ? 2 : 3, 
        background: 'linear-gradient(90deg, #2c3e50 0%, #34495e 100%)', 
        margin: 0, 
        padding: 0 
      }} />
      
      {/* Header responsive avec image de fond */}
      <header
        className="container-fluid text-center d-flex align-items-center justify-content-center"
        style={{
          backgroundImage: `url('${backgroundUrl}')`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          height: isMobile ? "60vh" : isTablet ? "65vh" : "70vh",
          width: "100vw",
          position: "relative",
          margin: 0,
          padding: isMobile ? "0 15px" : 0,
        }}
      >
        <div style={{width:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap: isMobile ? 16 : 28}}>
          {/* Titre déplacé ici, retiré du composant LocationSearch */}
          <div style={{
            textAlign: 'center',
            fontWeight: 800,
            fontSize: isMobile ? 17 : 22,
            color: '#232323',
            margin: '0 auto',
            letterSpacing: 0.5,
            textShadow: '0 2px 8px #23232311',
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 16,
            boxShadow: '0 2px 12px #0001',
            padding: isMobile ? '10px 8px' : '18px 12px',
            maxWidth: 700,
            position: 'relative',
            zIndex: 10
          }}>
            BB SERVICE CHARTER - Location de yachts sur la Riviera française et Italienne par BB YACHTS
          </div>
          <LocationSearch villes={villes} ville={ville} setVille={setVille} showTitle={false} />
        </div>
      </header>

      {/* Section expérience responsive */}
      <section id="experiences" className="py-5" style={{ background: '#fafbfc' }}>
        <div className="container">
          <h2 className="text-center mb-5" style={{ 
            fontWeight: 700, 
            fontSize: isMobile ? 22 : isTablet ? 28 : 32, 
            color: '#2c3e50',
            letterSpacing: -0.5,
            padding: isMobile ? '0 15px' : 0
          }}>
            Vivez une expérience inoubliable
          </h2>
          <ExperienceSlider />
        </div>
      </section>

      {/* Liste des 3 bateaux les plus récents, style moderne, pas de bleu, icône moteur réaliste */}
      <div id="bateaux" style={{ paddingTop: 80, background: "#f8f9fa", minHeight: "100vh" }}>
        <div className="container py-4">
          <h2 className="text-center mb-4" style={{ fontWeight: 800, fontSize: 36, color: "#232323", letterSpacing: 0.5, textShadow: '0 2px 8px #23232311' }}>Bateaux disponibles</h2>
          {loadingBateaux && <div style={{textAlign:'center', color:'#232323', fontWeight:600, fontSize:20}}>Chargement...</div>}
          {!loadingBateaux && bateaux.length === 0 && <div style={{textAlign:'center', color:'#888', fontWeight:500, fontSize:18}}>Aucun bateau disponible.</div>}
          <div className="row" style={{gap: '32px 0'}}>
            {bateaux
              .sort((a, b) => (b.createdAt && a.createdAt ? new Date(b.createdAt) - new Date(a.createdAt) : 0))
              .slice(0, 3)
              .map(bateau => (
              <div
                key={bateau.id}
                className="col-12 col-md-6 col-lg-4 mb-4 d-flex"
              >
                <div
                  className="card w-100 h-100"
                  style={{
                    borderRadius: 24,
                    boxShadow: "0 6px 32px #0001",
                    overflow: "hidden",
                    background: '#fff',
                    border: 'none',
                    color: '#232323',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 480,
                    position: 'relative',
                    padding: 0,
                    cursor: "pointer"
                  }}
                  onClick={() => { window.location.href = `/bateau/${bateau.id}`; }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      window.location.href = `/bateau/${bateau.id}`;
                    }
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    {bateau.photo && bateau.photo[0] && (
                      <img src={bateau.photo[0]} alt={bateau.nom} style={{ width: "100%", height: 220, objectFit: "cover", borderTopLeftRadius: 24, borderTopRightRadius: 24 }} />
                    )}
                    <div style={{ position: 'absolute', top: 18, right: 18, background: '#fff', color: '#232323', fontWeight: 700, fontSize: 18, borderRadius: 16, boxShadow: '0 2px 8px #23232311', padding: '7px 18px', zIndex: 2, border: '1px solid #e5e7eb' }}>{bateau.prix} €</div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', padding: 32, paddingBottom: 18, background: '#fff' }}>
                    <h5 style={{ fontWeight: 700, color: '#232323', fontSize: 22, marginBottom: 18, textAlign: 'center' }}>{bateau.nom}</h5>
                    <div style={{ background: '#f8fafc', borderRadius: 14, border: '1px solid #e5e7eb', padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, width: '100%', maxWidth: 320, marginBottom: 18 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <Users size={22} color="#232323" />
                        <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>PLACES</span>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{bateau.places}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <Gauge size={22} color="#232323" />
                        <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>VITESSE</span>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{bateau.vitesse} kn</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <Fuel size={22} color="#232323" />
                        <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>CARBURANT</span>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{bateau.carburant}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <FaCogs size={22} color="#232323" />
                        <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>MOTEUR</span>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{bateau.moteur}</span>
                      </div>
                    </div>
                    <hr style={{ width: '80%', margin: '18px auto 10px auto', border: 'none', borderTop: '1.5px solid #e5e7eb' }} />
                    <div style={{ color: '#888', fontSize: 15, textAlign: 'center', marginTop: 0, fontWeight: 500 }}>Cliquer pour voir les détails →</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 12px 36px #23232311; }
      `}</style>

      {/* Galerie photo 2x2 */}
      <section id="galerie" className="py-5" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="text-center mb-5" style={{ fontWeight: 700, fontSize: isMobile ? 22 : isTablet ? 28 : 32, color: '#2c3e50', letterSpacing: -0.5 }}>Notre galerie photo</h2>
          <div className="row justify-content-center" style={{ gap: 0 }}>
            {galerieImages.slice(0, 4).map((img, idx) => (
              <React.Fragment key={idx}>
                <div className="col-12 col-md-6 mb-4 d-flex align-items-center justify-content-center">
                  <img src={img} alt={`galerie-${idx}`} style={{ width: '100%', maxWidth: 420, height: 260, objectFit: 'cover', borderRadius: 18, boxShadow: '0 4px 24px #0001', cursor: 'pointer', marginBottom: 0 }} onClick={() => setSelectedPhoto(img)} />
                </div>
                {idx === 1 && <div className="w-100 d-none d-md-block" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Modale d'affichage de la photo */}
      {selectedPhoto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={() => setSelectedPhoto(null)}
        >
          <img src={selectedPhoto} alt="Aperçu" style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 18, boxShadow: '0 8px 32px #0008' }} />
          <button onClick={() => setSelectedPhoto(null)} style={{ position: 'fixed', top: 30, right: 40, fontSize: 36, color: '#fff', background: 'none', border: 'none', cursor: 'pointer', zIndex: 2100 }}>&times;</button>
        </div>
      )}

      <Footer />
    </div>
  );
}

const menuItemStyle = { padding: '12px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#222', fontWeight: 500, transition: 'background 0.15s', borderRadius: 8 };
const iconStyle = { fontSize: 18, color: '#1e90ff' };