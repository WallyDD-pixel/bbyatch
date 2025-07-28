import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import { Users, Gauge, Fuel, CircleDollarSign } from "lucide-react";
import Footer from "../components/Footer";

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
          <h1 className="text-center mb-4" style={{ fontWeight: 800, fontSize: 36, color: "#232323", letterSpacing: 0.5, textShadow: '0 2px 8px #23232311', marginBottom: 40 }}>Vente de bateaux d’occasion</h1>
          <p style={{ textAlign: 'center', color: '#555', fontSize: 18, marginBottom: 40, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto', fontWeight: 500 }}>
            Découvrez notre sélection exclusive de bateaux d’occasion soigneusement vérifiés. Chaque bateau est inspecté, révisé et prêt à naviguer. Contactez-nous pour une visite, un essai ou un accompagnement personnalisé dans votre projet d’achat.
          </p>
          {loading && <div style={{textAlign:'center', color:'#1976d2', fontWeight:600, fontSize:20}}>Chargement...</div>}
          {!loading && bateaux.length === 0 && <div style={{textAlign:'center', color:'#888', fontWeight:500, fontSize:18}}>Aucun bateau d’occasion disponible.</div>}
          <div className="row" style={{gap: '32px 0'}}>
            {bateaux.map(bateau => (
              <div key={bateau.id} className="col-12 col-md-6 col-lg-4 mb-4 d-flex">
                <div className="card w-100 h-100" style={{ 
                  borderRadius: 24, 
                  boxShadow: "0 8px 32px #0002", 
                  overflow: "hidden", 
                  background: '#fff',
                  border: '1.5px solid #e5e7eb',
                  color: '#232323',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 520,
                  position: 'relative',
                  padding: 0,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/bateauxoccasion/${bateau.id}`)}
                >
                  <div style={{ position: 'relative', width: '100%', height: 220, background: '#f4f8fb' }}>
                    {bateau.photo && bateau.photo[0] && (
                      <img src={bateau.photo[0]} alt={bateau.nom} style={{ width: "100%", height: '100%', objectFit: "cover", borderTopLeftRadius: 24, borderTopRightRadius: 24, transition: 'transform 0.2s' }} />
                    )}
                    <div style={{ position: 'absolute', top: 18, right: 18, background: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 18, borderRadius: 16, boxShadow: '0 2px 8px #1976d211', padding: '7px 18px', zIndex: 2, border: '1.5px solid #e5e7eb' }}>{bateau.prix} €</div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', padding: 32, paddingBottom: 18, background: '#fff' }}>
                    <h5 style={{ fontWeight: 800, color: '#232323', fontSize: 22, marginBottom: 18, textAlign: 'center', letterSpacing: -0.5 }}>{bateau.nom}</h5>
                    <div style={{ background: '#f8fafc', borderRadius: 14, border: '1px solid #e5e7eb', padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, width: '100%', maxWidth: 320, marginBottom: 18 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <Users size={22} color="#1976d2" />
                        <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>PLACES</span>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{bateau.places}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <Gauge size={22} color="#1976d2" />
                        <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>VITESSE</span>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{bateau.vitesse} kn</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <Fuel size={22} color="#1976d2" />
                        <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>CARBURANT</span>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{bateau.carburant}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <CircleDollarSign size={22} color="#1976d2" />
                        <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>MOTEUR</span>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>{bateau.moteur}</span>
                      </div>
                    </div>
                    {bateau.description && <div style={{ color: '#555', fontSize: 15, textAlign: 'center', marginBottom: 14, fontWeight: 500, minHeight: 40, maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>{bateau.description}</div>}
                    <hr style={{ width: '80%', margin: '18px auto 10px auto', border: 'none', borderTop: '1.5px solid #e5e7eb' }} />
                    <div style={{ color: '#1976d2', fontSize: 16, textAlign: 'center', marginTop: 0, fontWeight: 700, letterSpacing: 0.2 }}>Voir la fiche détaillée</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      <style>{`
        body { background: #f8f9fa !important; }
        .card:hover { transform: translateY(-8px) scale(1.025); box-shadow: 0 16px 40px #1976d222; }
      `}</style>
    </>
  );
}
