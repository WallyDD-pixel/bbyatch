import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import NavBar from "../components/NavBar";

export default function Vente() {
  const [bateaux, setBateaux] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBateaux() {
      setLoading(true);
      // On suppose qu'il y a un champ "type" ou "occasion" pour filtrer les bateaux d'occasion
      const q = query(collection(db, "bateaux"), where("occasion", "==", true));
      const snap = await getDocs(q);
      setBateaux(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchBateaux();
  }, []);

  return (
    <>
      <NavBar />
      <div style={{ paddingTop: 80, background: "#f4f8fb", minHeight: "100vh" }}>
        <div className="container py-4">
          <h1 className="text-center mb-4" style={{ fontWeight: 800, fontSize: 32, color: "#1e90ff" }}>Vente d’occasion</h1>
          {loading && <div style={{textAlign:'center', color:'#1e90ff', fontWeight:600, fontSize:20}}>Chargement...</div>}
          {!loading && bateaux.length === 0 && <div style={{textAlign:'center', color:'#888', fontWeight:500, fontSize:18}}>Aucun bateau d’occasion disponible.</div>}
          <div className="row" style={{gap: '24px 0'}}>
            {bateaux.map(bateau => (
              <div key={bateau.id} className="col-12 col-md-6 col-lg-4 mb-4 d-flex">
                <div className="card w-100 h-100" style={{ borderRadius: 18, boxShadow: "0 4px 18px rgba(30,60,60,0.07)", overflow: "hidden" }}>
                  {bateau.photo && bateau.photo[0] && (
                    <img src={bateau.photo[0]} alt={bateau.nom} style={{ width: "100%", height: 220, objectFit: "cover" }} />
                  )}
                  <div className="card-body">
                    <h5 className="card-title" style={{ fontWeight: 700, color: "#1e90ff" }}>{bateau.nom}</h5>
                    <p className="card-text" style={{ color: "#222" }}>{bateau.description}</p>
                    <div style={{ fontWeight: 700, fontSize: 18, color: "#0a2342" }}>{bateau.prix} €</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
