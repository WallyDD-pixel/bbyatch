import React, { useState } from "react";
import { FaMapMarkerAlt, FaRegCalendarAlt, FaRegClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function LocationSearch({ villes, ville, setVille }) {
  const [dateDebut, setDateDebut] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const navigate = useNavigate();

  async function handleSearch(e) {
    e.preventDefault();
    if (!ville) return;
    const params = new URLSearchParams({
      ville,
      dateDebut,
      heureDebut,
      dateFin,
      heureFin
    });
    navigate(`/search-results?${params.toString()}`);
  }

  // Fonction utilitaire pour le blur
  function handleBlur(e) {
    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.85)",
        borderRadius: 40,
        display: "inline-block",
        padding: "40px 30px",
        marginTop: 40,
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        maxWidth: 1200,
        width: "90%",
        position: "sticky",
        top: 0,
        zIndex: 100,
        transition: "box-shadow 0.2s, top 0.2s",
      }}
    >
      <h1 className="display-4 fw-bold mb-4">Trouvez le bateau de vos rêves</h1>
      <form onSubmit={handleSearch} className="d-flex flex-column align-items-center">
        <div className="d-flex justify-content-center mb-4">
          <div
            className="bg-white rounded-pill shadow-sm p-2 d-flex flex-wrap align-items-center w-100"
            style={{
              maxWidth: "100%",
              minWidth: 0,
              gap: 10,
              boxShadow: "0 6px 24px rgba(0,0,0,0.10)",
              border: "1.5px solid #e0e0e0",
              background: "rgba(255,255,255,0.96)",
              borderRadius: 200,
              width: "100%",
            }}
          >
            {/* Champ Lieu */}
            <div className="d-flex align-items-center bg-light rounded-pill px-2 py-1 me-2" style={{ minWidth: 140 }}>
              <span
                className="bg-white rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{ width: 28, height: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
              >
                <FaMapMarkerAlt size={14} color="#666" />
              </span>
              <select
                className="form-select border-0 bg-transparent custom-ville-select"
                style={{
                  fontWeight: 500,
                  fontSize: 13,
                  minWidth: 60,
                  padding: "6px 18px 6px 10px",
                  borderRadius: 20,
                  background: "#f8f9fa",
                  color: "#333",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                  outline: "none",
                  cursor: "pointer"
                }}
                value={ville}
                onChange={e => setVille(e.target.value)}
                onFocus={e => e.target.style.boxShadow = '0 0 0 2px #0d6efd44'}
                onBlur={handleBlur}
              >
                <option value="">Choisissez une ville</option>
                {villes.map((v, i) => (
                  <option key={i} value={v}>{v}</option>
                ))}
              </select>
            </div>
            {/* Champ Début */}
            <div
              className="d-flex align-items-center bg-light rounded-pill px-2 py-1 me-2 location-date-field"
              style={{ minWidth: 100 }}
            >
              <span
                className="bg-white rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{ width: 28, height: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
              >
                <FaRegCalendarAlt size={14} color="#666" />
              </span>
              <input
                type="date"
                className="form-control border-0 bg-transparent"
                style={{ fontWeight: 500, fontSize: 13, minWidth: 40, padding: "2px 4px" }}
                value={dateDebut}
                onChange={e => setDateDebut(e.target.value)}
                onBlur={handleBlur}
              />
            </div>
            {/* Champ Heure Début */}
            <div className="d-flex align-items-center bg-light rounded-pill px-2 py-1 me-2" style={{ minWidth: 70 }}>
              <span
                className="bg-white rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{ width: 28, height: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
              >
                <FaRegClock size={14} color="#666" />
              </span>
              <input
                type="time"
                className="form-control border-0 bg-transparent"
                style={{ fontWeight: 500, fontSize: 13, minWidth: 30, padding: "2px 4px" }}
                step="3600"
                value={heureDebut}
                onChange={e => setHeureDebut(e.target.value)}
              />
            </div>
            {/* Champ Fin */}
            <div className="d-flex align-items-center bg-light rounded-pill px-2 py-1 me-2" style={{ minWidth: 100 }}>
              <span
                className="bg-white rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{ width: 28, height: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
              >
                <FaRegCalendarAlt size={14} color="#666" />
              </span>
              <input
                type="date"
                className="form-control border-0 bg-transparent"
                style={{ fontWeight: 500, fontSize: 13, minWidth: 40, padding: "2px 4px" }}
                value={dateFin}
                onChange={e => setDateFin(e.target.value)}
                onBlur={handleBlur}
              />
            </div>
            {/* Champ Heure Fin */}
            <div className="d-flex align-items-center bg-light rounded-pill px-2 py-1 me-2" style={{ minWidth: 70 }}>
              <span
                className="bg-white rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{ width: 28, height: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
              >
                <FaRegClock size={14} color="#666" />
              </span>
              <input
                type="time"
                className="form-control border-0 bg-transparent"
                style={{ fontWeight: 500, fontSize: 13, minWidth: 30, padding: "2px 4px" }}
                step="3600"
                value={heureFin}
                onChange={e => setHeureFin(e.target.value)}
              />
            </div>
            {/* Bouton */}
            <button type="submit" className="btn btn-primary rounded-pill px-3 ms-2" style={{ minWidth: 70, fontSize: 14 }}>
              Rechercher
            </button>
          </div>
        </div>
      </form>
      {/* Résultats */}
      {/* (On n'affiche plus les résultats ici, ils sont sur la page SearchResults) */}
    </div>
  );
}

/*
Ajoute ce CSS dans App.css ou index.css :
@media (max-width: 600px) {
  .location-date-field {
    display: none !important;
  }
}
*/
