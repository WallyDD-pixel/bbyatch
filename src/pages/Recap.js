import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function Recap() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bateau, experience } = location.state || {};
  const [loadingStripe, setLoadingStripe] = useState(false);

  if (!bateau || !experience) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: 12, textAlign: 'center', boxShadow: '0 2px 10px #0001', maxWidth: 400, border: '1px solid #e9ecef' }}>
          <h3 style={{ color: '#1976d2', marginBottom: 16, fontWeight: 700 }}>Aucune sélection</h3>
          <p style={{ color: '#6c757d', margin: 0 }}>Aucune expérience ou bateau sélectionné.<br />Veuillez recommencer votre réservation.</p>
          <button onClick={() => navigate(-1)} style={{ marginTop: 24, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Retour</button>
        </div>
      </div>
    );
  }

  async function handleStripe() {
    setLoadingStripe(true);
    const acompte = Math.round((Number(bateau.prix) || 0) * 0.10);
    try {
      const res = await fetch("https://bbyatch-2.onrender.com/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: acompte * 100,
          bateauNom: bateau.nom,
          experienceNom: experience.nom,
          bateauId: bateau.id,
          experienceId: experience.id
        })
      });
      const data = await res.json();
      setLoadingStripe(false);
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur lors de la création de la session de paiement.");
      }
    } catch (e) {
      setLoadingStripe(false);
      alert("Erreur lors de la création de la session de paiement.");
    }
  }

  return (
    <>
      <NavBar />
      <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: 80, paddingBottom: 40 }}>
        <div className="container">
          <div style={{
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 6px 32px #0001',
            overflow: 'hidden',
            border: '1.5px solid #e5e7eb',
            color: '#232323',
            maxWidth: 700,
            margin: '0 auto',
            marginTop: 32,
            padding: 36
          }}>
            <h2 style={{ fontWeight: 800, color: '#1976d2', fontSize: 28, marginBottom: 24, textAlign: 'center' }}>Récapitulatif de votre réservation</h2>
            {/* Expérience */}
            <div style={{ marginBottom: 28 }}>
              <h4 style={{ color: '#10b981', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Expérience</h4>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{experience.nom}</div>
              {experience.date && <div style={{ color: '#1976d2', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{experience.date}</div>}
              {experience.description && <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}>{experience.description}</div>}
            </div>
            {/* Bateau */}
            <div style={{ marginBottom: 28 }}>
              <h4 style={{ color: '#10b981', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Bateau sélectionné</h4>
              <div style={{
                background: '#f8f9fa',
                borderRadius: 14,
                boxShadow: '0 2px 8px #0001',
                border: '1.5px solid #e5e7eb',
                padding: 22,
                display: 'flex',
                gap: 18,
                alignItems: 'center',
                flexWrap: 'wrap',
                marginTop: 8
              }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {Array.isArray(bateau.images) && bateau.images.length > 0 ? bateau.images.map((img, idx) => (
                    <img key={idx} src={img} alt={bateau.nom} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px #1976d222' }} />
                  )) : bateau.image ? (
                    <img src={bateau.image} alt={bateau.nom} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px #1976d222' }} />
                  ) : null}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#232323', marginBottom: 6 }}>{bateau.nom}</div>
                  <div style={{ fontSize: 16, color: '#1976d2', fontWeight: 700, marginBottom: 6 }}>{bateau.prix} €</div>
                  {bateau.description && <div style={{ color: '#232323', fontSize: 15, marginBottom: 6 }}>{bateau.description}</div>}
                  {bateau.places && <div style={{ color: '#232323', fontSize: 15 }}>Places : {bateau.places}</div>}
                  {bateau.moteur && <div style={{ color: '#232323', fontSize: 15 }}>Moteur : {bateau.moteur}</div>}
                </div>
              </div>
            </div>
            {/* Actions */}
            <div style={{
              background: '#f4f8fb',
              borderRadius: 10,
              padding: '18px 24px',
              margin: '32px 0 24px 0',
              color: '#1976d2',
              fontWeight: 600,
              fontSize: 17,
              textAlign: 'center',
              border: '1px solid #b6e0fe'
            }}>
              Pour valider votre réservation, vous payez aujourd'hui un acompte de 10% du prix du bateau directement sur la plateforme.<br />
              Le solde sera à régler le jour de l'expérience, directement auprès de l'équipe BBYatch.
              <br />
              <span style={{ color: '#10b981', fontWeight: 800, fontSize: 20 }}>
                Acompte à payer maintenant : {Math.round((Number(bateau.prix) || 0) * 0.10)} €
              </span>
            </div>
            <div style={{ textAlign: 'center', marginTop: 0 }}>
              <button style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 44px', fontWeight: 900, fontSize: 20, cursor: 'pointer', boxShadow: '0 2px 8px #10b98122', letterSpacing: 1, marginRight: 16 }}
                onClick={() => navigate(-1)}
                disabled={loadingStripe}
              >Retour</button>
              <button
                style={{
                  background: '#232733',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px 44px',
                  fontWeight: 900,
                  fontSize: 20,
                  cursor: loadingStripe ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px #23273322',
                  letterSpacing: 1,
                  opacity: loadingStripe ? 0.7 : 1
                }}
                disabled={loadingStripe}
                onClick={handleStripe}
              >
                {loadingStripe ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 18,
                      height: 18,
                      border: '2px solid #fff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 1s linear infinite'
                    }}></span>
                    Redirection vers le paiement...
                  </span>
                ) : (
                  'Procéder au paiement'
                )}
              </button>
              <style>{`@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
