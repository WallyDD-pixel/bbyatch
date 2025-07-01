import React, { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../logo.svg";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
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
    const [villes, setVilles] = useState([]);
    const [ville, setVille] = useState("");
    const [user, setUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef();
    const navigate = useNavigate();

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
      async function fetchVilles() {
        const villesCol = collection(db, "villes");
        const villesSnap = await getDocs(villesCol);
        setVilles(villesSnap.docs.map(doc => doc.data().nom));
      }
      fetchVilles();
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

  return (
    <div className="bg-light min-vh-100">
      <NavBar />
      <div style={{ width: '100%', height: 3, background: '#111', margin: 0, padding: 0 }} />
      <style>{`
        .navbar-nav .nav-link, .navbar-nav .btn, .navbar-nav .prenom-profil {
          position: relative;
          transition: color 0.2s;
        }
        .navbar-nav .nav-link::after, .navbar-nav .btn::after, .navbar-nav .prenom-profil::after {
          content: '';
          display: block;
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0;
          height: 2.5px;
          background: #1e90ff;
          border-radius: 2px;
          transition: width 0.6s cubic-bezier(.4,0,.2,1);
        }
        .navbar-nav .nav-link:hover::after, .navbar-nav .btn:hover::after, .navbar-nav .prenom-profil:hover::after {
          width: 100%;
        }
      `}</style>
      <header
        className="container-fluid text-center d-flex align-items-center justify-content-center"
        style={{
          backgroundImage: `url('${backgroundUrl}')`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          minHeight: "100vh",
          width: "100vw",
          position: "relative",
          margin: 0,
          padding: 0,
        }}
      >
        <LocationSearch villes={villes} ville={ville} setVille={setVille} />
      </header>
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4 titre-playfair">Vivez une expérience inoubliable</h2>
          <ExperienceSlider />
        </div>
      </section>
      <section className="text-center" style={{ background: "#fff", padding: window.innerWidth < 600 ? "0" : "0" }}>
        <img
          src="/adTI19tRQIpgKsOy325gpLZijYY.avif"
          alt="BB Yachts"
          style={{
            width: "100%",
            maxWidth: "100vw",
            height: window.innerWidth < 600 ? 250 : 560,
            objectFit: "cover",
            borderRadius: 0,
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            display: "block",
            margin: 0
          }}
        />
      </section>
      <ServicesSection />
    </div>
  );
}

const menuItemStyle = { padding: '12px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#222', fontWeight: 500, transition: 'background 0.15s', borderRadius: 8 };
const iconStyle = { fontSize: 18, color: '#1e90ff' };