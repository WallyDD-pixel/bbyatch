import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

export default function Vente() {
  const [bateaux, setBateaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBateaux() {
      setLoading(true);
      // Correction : lire la collection 'bateauxoccasion' directement
      const snap = await getDocs(collection(db, "bateauxoccasion"));
      setBateaux(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchBateaux();
  }, []);

  return (
    <>
      <NavBar />
      <div style={{ paddingTop: 80, background: "#f8f9fa", minHeight: "100vh" }}>
        <div className="container py-4">
          <h1 className="text-center mb-4" style={{ fontWeight: 800, fontSize: 36, color: "#1976d2", letterSpacing: 0.5, textShadow: '0 2px 8px #1976d211' }}>Vente de bateaux d’occasion</h1>
          {loading && <div style={{textAlign:'center', color:'#1976d2', fontWeight:600, fontSize:20}}>Chargement...</div>}
          {!loading && bateaux.length === 0 && <div style={{textAlign:'center', color:'#888', fontWeight:500, fontSize:18}}>Aucun bateau d’occasion disponible.</div>}
          <div className="row" style={{gap: '32px 0'}}>
            {bateaux.map(bateau => (
              <div key={bateau.id} className="col-12 col-md-6 col-lg-4 mb-4 d-flex">
                <div
                  className="card w-100 h-100"
                  style={{ 
                    borderRadius: 18, 
                    boxShadow: "0 6px 32px #0001", 
                    overflow: "hidden", 
                    background: '#fff',
                    border: '1.5px solid #e5e7eb',
                    color: '#222',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.18s',
                    minHeight: 420,
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/bateau/${bateau.id}`)}
                >
                  {bateau.photo && bateau.photo[0] && (
                    <img src={bateau.photo[0]} alt={bateau.nom} style={{ width: "100%", height: 220, objectFit: "cover", borderBottom: '1.5px solid #e5e7eb' }} />
                  )}
                  <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 24 }}>
                    <div>
                      <h5 className="card-title" style={{ fontWeight: 700, color: "#1976d2", fontSize: 22, marginBottom: 8 }}>{bateau.nom}</h5>
                      <div style={{ color: "#888", fontSize: 15, marginBottom: 8 }}><b>Ville :</b> {bateau.Ville}</div>
                      <div style={{ color: "#888", fontSize: 15, marginBottom: 8 }}><b>Moteur :</b> {bateau.moteur} CV</div>
                      <div style={{ color: "#888", fontSize: 15, marginBottom: 8 }}><b>Places :</b> {bateau.places}</div>
                      <div style={{ color: "#888", fontSize: 15, marginBottom: 8 }}><b>Année :</b> {bateau.annee}</div>
                      <div style={{ color: "#888", fontSize: 15, marginBottom: 8 }}><b>État :</b> {bateau.etat}</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 22, color: "#10b981", marginTop: 18 }}>{bateau.prix} €</div>
                  </div>
                  {bateau.photo && bateau.photo.length > 1 && (
                    <div style={{ display: 'flex', gap: 6, padding: '0 16px 16px 16px', flexWrap: 'wrap' }}>
                      {bateau.photo.slice(1, 4).map((url, i) => (
                        <img key={i} src={url} alt="miniature" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px #0001' }} />
                      ))}
                      {bateau.photo.length > 4 && (
                        <span style={{ fontSize: 12, color: '#888', alignSelf: 'center', background: '#f3f4f6', padding: '2px 8px', borderRadius: 3, border: '1px solid #e5e7eb' }}>+{bateau.photo.length-4}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        body { background: #f8f9fa !important; }
        .card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 12px 36px #1976d211; }
      `}</style>
    </>
  );
}
