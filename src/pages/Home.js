import React, { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../logo.svg";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import ExperienceSlider from "../components/ExperienceSlider";
import ServicesSection from "../components/ServicesSection";
import LocationSearch from "../components/LocationSearch";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { FaUser, FaChevronDown, FaCar, FaIdCard, FaUserCircle, FaQuestionCircle, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';
import NavBar from "../components/NavBar";

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
        <LocationSearch villes={villes} ville={ville} setVille={setVille} />
      </header>

      {/* Section expérience responsive */}
      <section className="py-5" style={{ background: '#fafbfc' }}>
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

      {/* Galerie photos responsive optimisée iPhone 15 */}
      <section className="py-5" style={{ background: '#ffffff' }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div style={{
            background: '#f8f9fa',
            borderRadius: isMobile ? 12 : 16,
            padding: isMobile ? '20px 12px' : isTablet ? '32px 24px' : '48px 40px',
            border: '1px solid #e1e5e9',
            position: 'relative',
            margin: isMobile ? '0 8px' : '0 auto'
          }}>
            {/* Ligne décorative responsive */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: isMobile ? 12 : isTablet ? 24 : 40,
              right: isMobile ? 12 : isTablet ? 24 : 40,
              height: isMobile ? 3 : 4,
              background: 'linear-gradient(90deg, #2c3e50 0%, #34495e 100%)',
              borderRadius: '0 0 2px 2px'
            }}></div>
            
            <h2 className="text-center mb-4" style={{ 
              fontWeight: 700, 
              fontSize: isMobile ? 20 : isTablet ? 26 : 32, 
              color: '#2c3e50',
              letterSpacing: -0.5,
              paddingTop: 8,
              marginBottom: isMobile ? '20px' : '32px'
            }}>
              Galerie photos
            </h2>
            
            {/* Grille optimisée pour iPhone 15 et autres mobiles */}
            <div className={`row g-${isMobile ? '3' : '4'} justify-content-center`}>
              {galerieImages.map((src, idx) => (
                <div 
                  className={isMobile ? "col-6" : "col-12 col-md-6"} 
                  key={idx}
                  style={{ 
                    padding: isMobile ? '6px' : undefined 
                  }}
                >
                  <div style={{ 
                    borderRadius: isMobile ? 8 : 16, 
                    overflow: 'hidden', 
                    boxShadow: isMobile ? '0 2px 12px rgba(0, 0, 0, 0.08)' : '0 4px 20px rgba(0, 0, 0, 0.1)', 
                    background: '#fff',
                    border: '1px solid #e1e5e9',
                    transition: 'all 0.3s ease',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                    }
                  }}>
                    <img 
                      src={src} 
                      alt={`Galerie ${idx + 1}`} 
                      style={{ 
                        width: '100%', 
                        height: isMobile ? 120 : isTablet ? 200 : 250, 
                        objectFit: 'cover',
                        display: 'block',
                        maxWidth: '100%',
                        borderRadius: 'inherit'
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <ServicesSection />
    </div>
  );
}

const menuItemStyle = { padding: '12px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#222', fontWeight: 500, transition: 'background 0.15s', borderRadius: 8 };
const iconStyle = { fontSize: 18, color: '#1e90ff' };