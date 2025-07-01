import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { auth, db } from "../firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useLocation } from "react-router-dom";

export default function Felicitation() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [stripeSession, setStripeSession] = useState(null);
  const [reservationSaved, setReservationSaved] = useState(false);
  const location = useLocation();

  // Récupère le session_id Stripe dans l'URL
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get("session_id");

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

  // Récupère la session Stripe et enregistre la réservation
  useEffect(() => {
    console.log('DEBUG: sessionId', sessionId);
    console.log('DEBUG: user', user);
    console.log('DEBUG: userData', userData);
    console.log('DEBUG: reservationSaved', reservationSaved);
    if (!sessionId || !user || !userData || reservationSaved) return;
    fetch(`http://localhost:4242/checkout-session?session_id=${sessionId}`)
      .then(async res => {
        console.log('DEBUG: fetch status', res.status);
        const data = await res.json();
        console.log('DEBUG: fetch data', data);
        return data;
      })
      .then(async (session) => {
        setStripeSession(session);
        console.log('Session Stripe récupérée:', session);
        // Récupération du nom du bateau
        let bateauNom = null;
        let bateauId = session.bateauId || (userData && userData.bateauId);
        if (bateauId) {
          try {
            const bateauRef = doc(db, "bateaux", bateauId);
            const bateauSnap = await getDoc(bateauRef);
            if (bateauSnap.exists()) {
              bateauNom = bateauSnap.data().nom || null;
            }
          } catch (e) {
            console.error('Erreur récupération nom bateau:', e);
          }
        }
        const docToAdd = {
          userId: user.uid,
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          genre: userData.genre || null,
          phone: userData.phone || null,
          bateauId: bateauId || session.metadata?.bateauId || null,
          bateauNom: bateauNom,
          dateDebut: session.metadata?.dateDebut || null,
          heureDebut: session.metadata?.heureDebut || null,
          dateFin: session.metadata?.dateFin || null,
          heureFin: session.metadata?.heureFin || null,
          prix: session.metadata?.prix || null,
          stripeSessionId: session.id,
          stripePaymentIntent: session.payment_intent,
          montant: session.amount_total ? session.amount_total / 100 : null,
          devise: session.currency || null,
          status: session.payment_status || null,
          statusComplet: false, // Nouveau champ pour le paiement complet
          createdAt: new Date(),
          stripeRaw: session // pour garder toutes les infos utiles
        };
        console.log('DEBUG: doc envoyé à Firestore', docToAdd);
        try {
          await addDoc(collection(db, "reservations"), docToAdd);
          setReservationSaved(true);
          console.log('Réservation enregistrée dans Firestore');
        } catch (e) {
          console.error('Erreur Firestore:', e);
        }
      })
      .catch(err => {
        console.error('Erreur récupération session Stripe:', err);
      });
  }, [sessionId, user, userData, reservationSaved]);

  return (
    <>
      <NavBar />
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', marginTop: 60, padding: '0 8px' }}>
        <div className="card w-100" style={{ maxWidth: 540, boxShadow: '0 4px 24px #1e90ff22', borderRadius: 20, padding: 0, border: 'none', background: '#fafdff' }}>
          <div className="card-body text-center py-5" style={{ padding: window.innerWidth < 600 ? 18 : 40 }}>
            <h1 style={{ color: '#1bbf4c', fontWeight: 700, fontSize: window.innerWidth < 600 ? 26 : 36 }}>🎉 Félicitations !</h1>
            <p style={{ fontSize: window.innerWidth < 600 ? 16 : 22, marginTop: 24, marginBottom: 24 }}>
              Votre réservation est bien prise en compte.<br />
              Nous vous donnons rendez-vous à l'agence pour finaliser votre location et embarquer à bord de votre bateau.
            </p>
            {user && userData && (
              <div className="card mx-auto mb-4" style={{ maxWidth: 400, fontSize: window.innerWidth < 600 ? 15 : 20, color: '#0a2342', boxShadow: '0 2px 12px #1e90ff22', borderRadius: 16, border: 'none', background: '#f3f8ff' }}>
                <div className="card-body p-3 p-md-4">
                  <h5 className="card-title" style={{ color: '#1e90ff', fontWeight: 700, fontSize: window.innerWidth < 600 ? 18 : 22 }}>Vos informations</h5>
                  <p className="card-text mb-2"><b>Nom :</b> {userData.nom} {userData.prenom}</p>
                  <p className="card-text mb-2"><b>Email :</b> {userData.email}</p>
                  {userData.genre && <p className="card-text mb-0"><b>Genre :</b> {userData.genre}</p>}
                </div>
              </div>
            )}
            <div style={{ marginTop: 32, fontSize: window.innerWidth < 600 ? 15 : 18, color: '#0a2342', background: '#e6f0fa', borderRadius: 12, padding: window.innerWidth < 600 ? 10 : 18, marginBottom: 18 }}>
              Un email de confirmation vous a été envoyé.<br />
              Pour toute question, contactez-nous au <b>01 23 45 67 89</b> ou par email à <b>contact@bbyatch.com</b>.
            </div>
            <a href="/espace" className="btn btn-primary mt-4" style={{ fontSize: window.innerWidth < 600 ? 16 : 20, borderRadius: 12, padding: window.innerWidth < 600 ? '8px 18px' : '10px 32px', fontWeight: 600, letterSpacing: 1 }}>
              Gérer mes réservations
            </a>
            <a href="/" className="btn btn-outline-primary mt-3" style={{ fontSize: window.innerWidth < 600 ? 15 : 18, borderRadius: 12, padding: window.innerWidth < 600 ? '7px 16px' : '9px 28px', fontWeight: 600, letterSpacing: 1 }}>
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
