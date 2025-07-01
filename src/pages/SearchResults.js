import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { FaUserFriends, FaTachometerAlt, FaGasPump, FaCogs } from "react-icons/fa";
import logo from "../logo.svg";
import 'bootstrap/dist/css/bootstrap.min.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const queryParams = useQuery();
  const ville = queryParams.get("ville") || "";
  const dateDebut = queryParams.get("dateDebut") || "";
  const heureDebut = queryParams.get("heureDebut") || "";
  const dateFin = queryParams.get("dateFin") || "";
  const heureFin = queryParams.get("heureFin") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Calcul du nombre de jours entre deux dates
  function getDaysDiff(date1, date2) {
    if (!date1 || !date2) return 1;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = d2 - d1;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
  const nbJours = getDaysDiff(dateDebut, dateFin);
  // Calcul du prix minimum pour l'estimation
  const prixMin = results.length > 0 ? Math.min(...results.map(b => b.prix)) : 0;
  const totalEstime = prixMin * nbJours;

  // Formatage de la date en JJ/MMM (ex: 28/Juin)
  function formatShortDate(dateStr) {
    if (!dateStr) return '';
    const mois = ['Janv', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const d = new Date(dateStr);
    return d.getDate() + ' ' + mois[d.getMonth()];
  }
  const dateDebutShort = formatShortDate(dateDebut);
  const dateFinShort = formatShortDate(dateFin);

  useEffect(() => {
    async function fetchResults() {
      if (!ville) return;
      setLoading(true);
      const q = query(collection(db, "bateaux"), where("Ville", "==", ville));
      const snap = await getDocs(q);
      setResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchResults();
  }, [ville]);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm" style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <div className="container">
          <img src={logo} alt="BBYATCH logo" style={{ height: 40 }} className="me-2" />
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><span className="nav-link">Accueil</span></li>
              <li className="nav-item"><span className="nav-link">Bateaux</span></li>
              <li className="nav-item"><span className="nav-link">Contact</span></li>
              <li className="nav-item"><span className="btn btn-outline-primary ms-2">Connexion</span></li>
            </ul>
          </div>
        </div>
      </nav>
      <div style={{ paddingTop: 56, background: '#f4f8fb', minHeight: '100vh' }}>
        <div className="container py-4">
          {/* Barre récapitulative améliorée */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 2px 12px rgba(30,60,60,0.08)',
            padding: '18px 12px',
            marginBottom: 36,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 18,
            justifyContent: 'center',
            fontSize: 17,
            fontWeight: 500,
            border: '1px solid #e0e6ed',
            letterSpacing: 0.5,
            rowGap: 10,
          }}
          className="search-summary-bar-responsive"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1e90ff' }}>
              <i className="fa fa-map-marker-alt" title="Ville"></i>
              <span>{ville}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0a2342' }}>
              <i className="fa fa-calendar-alt" title="Début"></i>
              <span>Début : {dateDebutShort} {heureDebut && <span>à {heureDebut}</span>}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0a2342' }}>
              <i className="fa fa-calendar-check" title="Retour"></i>
              <span>Retour : {dateFinShort} {heureFin && <span>à {heureFin}</span>}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0a2342' }}>
              <i className="fa fa-moon" title="Nuits"></i>
              <span>{nbJours} jours{nbJours > 1 ? 's' : ''}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1e90ff', background: '#e6f0fa', borderRadius: 10, padding: '6px 18px' }}>
              <i className="fa fa-euro-sign" title="Estimation"></i>
              <span>Estimation : {totalEstime} €</span>
            </span>
          </div>
          {loading && <div style={{textAlign:'center', color:'#1e90ff', fontWeight:600, fontSize:20}}>Recherche en cours...</div>}
          {!loading && results.length === 0 && <div style={{textAlign:'center', color:'#888', fontWeight:500, fontSize:18}}>Aucun bateau trouvé.</div>}
          <div className="row" style={{gap: '24px 0'}}>
            {results.map(bateau => (
              <div key={bateau.id} className="col-12 col-md-6 col-lg-4 mb-4 d-flex">
                <button
                  type="button"
                  className="card h-100 p-2 border-0 text-start w-100"
                  style={{
                    borderRadius: 18,
                    border: "1.5px solid #e0e6ed",
                    background: "#fff",
                    boxShadow: "0 4px 18px rgba(30,60,60,0.07)",
                    minHeight: 280,
                    cursor: "pointer",
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onMouseOver={e => {e.currentTarget.style.boxShadow = '0 8px 32px rgba(30,60,60,0.13)'; e.currentTarget.style.transform = 'translateY(-4px)';}}
                  onMouseOut={e => {e.currentTarget.style.boxShadow = '0 4px 18px rgba(30,60,60,0.07)'; e.currentTarget.style.transform = 'none';}}
                  onClick={() => navigate(`/bateau/${bateau.id}?dateDebut=${dateDebut}&heureDebut=${heureDebut}&dateFin=${dateFin}&heureFin=${heureFin}&prix=${bateau.prix}`)}
                >
                  <div style={{ position: "relative", borderRadius: 14, overflow: "hidden" }}>
                    {bateau.photo && bateau.photo[0] && bateau.photo[0] !== "" && (
                      <img src={bateau.photo[0]} className="w-100" alt={bateau.nom} style={{ height: 180, objectFit: "cover", borderRadius: 14 }} />
                    )}
                    <div style={{ position: "absolute", left: 0, bottom: 0, background: "rgba(30,60,60,0.8)", color: "#fff", padding: "7px 20px 5px 14px", borderRadius: "0 14px 0 0", fontSize: 19, fontWeight: 700, letterSpacing: 1 }}>
                      {bateau.prix * nbJours} € <span style={{ fontWeight: 400, fontSize: 14 }}>/total</span>
                    </div>
                  </div>
                  <div className="mt-3 mb-2 text-center" style={{ letterSpacing: 3, fontWeight: 700, fontSize: 17, color: "#1e90ff", textTransform:'uppercase' }}>{bateau.nom}</div>
                  <div className="d-flex justify-content-center align-items-center mb-2" style={{ background: "#f4f8fb", borderRadius: 10, padding: "8px 0", gap: 12 }}>
                    <span title="Places" style={{ minWidth: 40, display: "flex", flexDirection: "column", alignItems: "center", fontSize: 13, color:'#0a2342' }}>
                      <FaUserFriends size={18} />
                      <span style={{ fontSize: 12 }}>{bateau.places} places</span>
                    </span>
                    <span title="Vitesse" style={{ minWidth: 40, display: "flex", flexDirection: "column", alignItems: "center", fontSize: 13, color:'#0a2342' }}>
                      <FaTachometerAlt size={18} />
                      <span style={{ fontSize: 12 }}>{bateau.vitesse} kn</span>
                    </span>
                    <span title="Carburant" style={{ minWidth: 40, display: "flex", flexDirection: "column", alignItems: "center", fontSize: 13, color:'#0a2342' }}>
                      <FaGasPump size={18} />
                      <span style={{ fontSize: 12 }}>{bateau.carburant}l</span>
                    </span>
                    <span title="Moteur" style={{ minWidth: 50, display: "flex", flexDirection: "column", alignItems: "center", fontSize: 13, color:'#0a2342' }}>
                      <FaCogs size={18} />
                      <span style={{ fontSize: 12 }}>{bateau.moteur} cv</span>
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// (Le style responsive a été retiré du fichier JS.)
// Veuillez placer le code CSS suivant dans un fichier .css importé :

/*
@media (max-width: 768px) {
  .search-summary-bar-responsive {
    padding: 12px 8px;
    font-size: 15px;
  }
  .search-summary-bar-responsive span {
    display: block;
    margin-bottom: 6px;
  }
}
*/
