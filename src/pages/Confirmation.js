import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../logo.svg";
import 'bootstrap/dist/css/bootstrap.min.css';
import { auth, db } from "../firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import NavBar from "../components/NavBar";

const protections = [
  {
    id: 0,
    title: "Aucune protection supplémentaire",
    stars: 0,
    franchise: "Jusqu'à la valeur du bateau",
    franchiseColor: "#d32d2f",
    franchiseLabel: "Franchise : jusqu'à la valeur du bateau",
    price: "Inclus",
    priceValue: 0,
    oldPrice: null,
    remise: null,
    noFranchise: false,
    avantages: [
      { label: "Assurance responsabilité civile obligatoire incluse", ok: true },
      { label: "Aucune couverture pour les dommages au bateau ou vol", ok: false },
      { label: "Pas d'assistance en mer", ok: false },
      { label: "Pas de protection annulation", ok: false },
    ],
  },
  {
    id: 1,
    title: "Protection Basique Charter",
    stars: 1,
    franchise: "Jusqu'à 3000 €",
    franchiseColor: "#222",
    franchiseLabel: "Franchise : jusqu'à 3000 €",
    price: "19 € / jour",
    priceValue: 19,
    oldPrice: null,
    remise: null,
    noFranchise: false,
    avantages: [
      { label: "Assurance dommages accidentels (collision, heurts, tempête)", ok: true },
      { label: "Assistance en mer 24/7", ok: true },
      { label: "Protection annulation partielle", ok: false },
      { label: "Vol et vandalisme", ok: false },
    ],
  },
  {
    id: 2,
    title: "Protection Intermédiaire Charter",
    stars: 2,
    franchise: "Jusqu'à 1000 €",
    franchiseColor: "#1bbf4c",
    franchiseLabel: "Franchise : jusqu'à 1000 €",
    price: "39 € / jour",
    priceValue: 39,
    oldPrice: "49 € / jour",
    remise: "-20% de remise",
    noFranchise: false,
    avantages: [
      { label: "Assurance dommages accidentels (collision, heurts, tempête)", ok: true },
      { label: "Assistance en mer 24/7", ok: true },
      { label: "Protection annulation partielle", ok: true },
      { label: "Vol et vandalisme", ok: true },
    ],
  },
  {
    id: 3,
    title: "Protection Complète Charter",
    stars: 3,
    franchise: null,
    franchiseColor: "#1bbf4c",
    franchiseLabel: "Aucune franchise",
    price: "59 € / jour",
    priceValue: 59,
    oldPrice: "79 € / jour",
    remise: "-25% de remise",
    noFranchise: true,
    avantages: [
      { label: "Assurance tous risques (dommages, vol, vandalisme, tempête)", ok: true },
      { label: "Assistance en mer 24/7 premium", ok: true },
      { label: "Protection annulation totale", ok: true },
      { label: "Remboursement de caution inclus", ok: true },
    ],
  },
];

const reservationApercu = [
  "Location de bateau en charter (avec ou sans skipper)",
  "Assurance responsabilité civile incluse",
  "Assistance en mer selon protection choisie",
  "Options : paddle, wakeboard, hôtesse, etc. sur demande",
  "Annulation flexible selon protection"
];

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const dateDebut = queryParams.get("dateDebut") || "";
  const heureDebut = queryParams.get("heureDebut") || "";
  const dateFin = queryParams.get("dateFin") || "";
  const heureFin = queryParams.get("heureFin") || "";
  const prix = queryParams.get("prix") || "";

  // Calcul du nombre de jours
  function getDaysDiff(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = d2 - d1;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
  const nbJours = (dateDebut && dateFin) ? getDaysDiff(dateDebut, dateFin) : 1;
  const prixBase = prix ? parseFloat(prix) * nbJours : 0;
  const [selected, setSelected] = React.useState(0);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const protection = protections[selected];
  const total = (prixBase + (protection.priceValue * nbJours)).toFixed(2);

  // Calcul acompte 20%
  const acompte = (total * 0.2).toFixed(2);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUserData(snap.data());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  async function handleContinue() {
    let nom = form.nom;
    let prenom = form.prenom;
    let email = form.email;
    if (user && userData) {
      nom = userData.nom || "";
      prenom = userData.prenom || "";
      email = userData.email || user.email || "";
    }
    if (!user && (!nom || !prenom || !email)) {
      setSubmitted(true);
      return;
    }
    // Récupérer les infos de l'URL
    const infosReservation = {
      dateDebut,
      heureDebut,
      dateFin,
      heureFin,
      prix,
      bateauId: queryParams.get("bateauId") || null
    };
    if (!user) {
      await addDoc(collection(db, "userNoAuth"), {
        nom,
        prenom,
        email,
        ...infosReservation,
        createdAt: new Date()
      });
    }
    fetch("https://bbyatch-2.onrender.com/create-checkout-session",", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(Number(acompte) * 100),
        nom: nom + (prenom ? " " + prenom : ""),
        email,
        ...infosReservation
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert("Erreur lors de la création de la session de paiement.");
        }
      });
  }

  function handleBack() {
    navigate(-1);
  }

  return (
    <>
      <NavBar />
      <div style={{ paddingTop: 56, minHeight: '100vh', background: 'linear-gradient(120deg, #e6f0fa 0%, #f8fafc 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 5vw 0 5vw', flexWrap: 'wrap', rowGap: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: 1, color: '#0a2342', textShadow: '0 2px 8px #e6f0fa', flex: '1 1 220px', minWidth: 180 }}>
            <span style={{ color: '#1e90ff', fontSize: 28, marginRight: 10 }}>⛵</span>
            DE QUELLES PROTECTIONS AVEZ-VOUS BESOIN ?
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: '0 0 auto', marginTop: 12 }}>
            <div style={{ fontSize: 18, color: '#0a2342' }}>Total : <span style={{ fontWeight: 700, color: '#1e90ff' }}>{total} €</span></div>
            <button className="btn" style={{ background: 'linear-gradient(90deg,#1e90ff,#00c6fb)', color: '#fff', fontWeight: 700, fontSize: 18, borderRadius: 12, padding: '8px 24px', boxShadow: '0 2px 12px #1e90ff33', border: 'none' }} onClick={handleContinue}>Continuer</button>
          </div>
        </div>
        <div style={{ margin: '20px 5vw 0 5vw', background: '#f3f4f6', borderRadius: 12, padding: 14, fontSize: 15, color: '#222', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 2px 8px #1e90ff11', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#1e90ff' }}>ℹ️</span>
          Le paiement en ligne concerne uniquement un acompte de <span style={{ color: '#1e90ff', fontWeight: 700 }}>{acompte} €</span> (20% du montant total). Le solde sera à régler le jour de l'embarquement.
        </div>
        <div style={{ display: 'flex', gap: 14, margin: '24px 5vw 0 5vw', flexWrap: 'wrap', justifyContent: 'center' }}>
          {protections.map((p, idx) => (
            <div key={p.id} onClick={() => setSelected(idx)}
              style={{
                flex: '1 1 320px',
                minWidth: 'min(95vw, 270px)',
                maxWidth: 340,
                background: selected === idx ? 'linear-gradient(120deg,#e6f0fa 60%,#fff 100%)' : '#fff',
                border: selected === idx ? '3px solid #1e90ff' : '2px solid #e0e0e0',
                borderRadius: 18,
                boxShadow: selected === idx ? '0 8px 32px #1e90ff22' : '0 2px 8px #1e90ff11',
                cursor: 'pointer',
                padding: 0,
                position: 'relative',
                transition: 'all 0.2s',
                marginBottom: 18,
                width: '100%',
                minHeight: 320
              }}
            >
              <div style={{ padding: '22px 12px 12px 12px', background: 'transparent', borderRadius: '18px 18px 0 0' }}>
                <div style={{ fontWeight: 700, fontSize: 20, color: '#0a2342', marginBottom: 6 }}>{p.title}</div>
                <div style={{ margin: '8px 0 8px 0', fontSize: 16 }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} style={{ color: i < p.stars ? '#1e90ff' : '#bbb', fontSize: 18 }}>★</span>
                  ))}
                  {p.remise && <span style={{ marginLeft: 8, background: '#e6f0fa', color: '#1e90ff', borderRadius: 8, fontWeight: 600, fontSize: 13, padding: '2px 8px' }}>{p.remise}</span>}
                </div>
                <div style={{ color: p.franchiseColor, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{p.franchiseLabel}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 15 }}>
                  {p.avantages.map((a, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: a.ok ? '#1bbf4c' : '#d32d2f', fontSize: 16 }}>{a.ok ? '✓' : '✗'}</span>
                      <span style={{ marginLeft: 8 }}>{a.label}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ fontWeight: 700, fontSize: 20, marginTop: 12, color: selected === idx ? '#1e90ff' : '#0a2342' }}>{p.price} {p.oldPrice && <span style={{ color: '#888', fontWeight: 400, fontSize: 15, textDecoration: 'line-through', marginLeft: 8 }}>{p.oldPrice}</span>}</div>
              </div>
              <div style={{ position: 'absolute', top: 14, right: 14, width: 26, height: 26, borderRadius: '50%', border: selected === idx ? '4px solid #1e90ff' : '2px solid #bbb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: selected === idx ? '0 2px 8px #1e90ff33' : 'none' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: selected === idx ? '#1e90ff' : '#fff', border: selected === idx ? '2px solid #1e90ff' : '2px solid #fff' }}></div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ margin: '24px 5vw 0 5vw', background: '#f3f4f6', borderRadius: 14, padding: 18, fontSize: 16, color: '#0a2342', maxWidth: 700, boxShadow: '0 2px 12px #1e90ff11', width: '100%' }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 10, color: '#1e90ff' }}>Aperçu de votre réservation :</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {reservationApercu.map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ color: '#1bbf4c', fontWeight: 700, fontSize: 16, marginRight: 8 }}>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        {!user && (
        <form onSubmit={e => { e.preventDefault(); handleContinue(); }} style={{ maxWidth: 400, margin: '32px auto' }}>
          <div className="mb-3">
            <label className="form-label">Nom</label>
            <input className="form-control" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Prénom</label>
            <input className="form-control" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          {submitted && <div className="alert alert-danger">Merci de remplir tous les champs pour continuer.</div>}
          <button className="btn btn-primary" type="submit" style={{ fontSize: 18, borderRadius: 12, padding: '8px 24px', marginTop: 8 }}>Continuer</button>
        </form>
      )}
      </div>
    </>
  );
}
