import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../logo.svg";
import 'bootstrap/dist/css/bootstrap.min.css';
import { auth, db } from "../firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import NavBar from "../components/NavBar";

const reservationApercu = [
  "Location de bateau en charter (avec ou sans skipper)",
  "Assurance responsabilité civile incluse",
  "Assistance en mer selon protection choisie",
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
  const bateauId = queryParams.get("bateauId") || "";
  const bateauNom = queryParams.get("bateauNom") || "";
  const bateauVille = queryParams.get("bateauVille") || "";
  const servicesParam = queryParams.get("services") || "[]";
  const totalServices = parseFloat(queryParams.get("totalServices")) || 0;
  const totalGeneral = parseFloat(queryParams.get("totalGeneral")) || 0;

  // Récupération des services sélectionnés
  let servicesSelectionnes = [];
  try {
    servicesSelectionnes = JSON.parse(servicesParam);
  } catch (error) {
    console.error("Erreur parsing services:", error);
    servicesSelectionnes = [];
  }

  // Calcul du nombre de jours
  function getDaysDiff(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = d2 - d1;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
  const nbJours = (dateDebut && dateFin) ? getDaysDiff(dateDebut, dateFin) : 1;
  const prixBase = totalGeneral || (prix ? parseFloat(prix) * nbJours : 0);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  
  // Total sans protection supplémentaire
  const total = prixBase.toFixed(2);

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
    // Récupérer les infos de l'URL avec les services
    const infosReservation = {
      dateDebut,
      heureDebut,
      dateFin,
      heureFin,
      prix: totalGeneral ? totalGeneral.toString() : prix,
      bateauId,
      bateauNom,
      bateauVille,
      services: servicesParam,
      totalServices: totalServices.toString(),
      totalGeneral: totalGeneral.toString(),
      protectionChoisie: "Assurance responsabilité civile incluse",
      protectionPrix: 0,
      montantTotal: total
    };
    
    fetch("https://bbyatch-2.onrender.com/create-checkout-session", {
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
      <div style={{ 
        paddingTop: 80, 
        minHeight: '100vh', 
        backgroundColor: '#f8f9fa',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <div className="container" style={{ maxWidth: 900 }}>
          {/* Header sobre et professionnel */}
          <div style={{ 
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: '40px',
            marginBottom: 30,
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              flexWrap: 'wrap',
              gap: 20
            }}>
              <div>
                <h1 style={{ 
                  fontSize: 28, 
                  fontWeight: 700, 
                  color: '#2c3e50',
                  margin: 0,
                  marginBottom: 8
                }}>
                  Confirmation de réservation
                </h1>
                <p style={{ 
                  fontSize: 16, 
                  color: '#6c757d',
                  margin: 0,
                  fontWeight: 500
                }}>
                  Vérifiez les détails de votre réservation avant de procéder au paiement
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 20,
                flexWrap: 'wrap'
              }}>
                <div style={{ 
                  fontSize: 18, 
                  color: '#495057',
                  fontWeight: 600
                }}>
                  Total : <span style={{ 
                    fontWeight: 700, 
                    color: '#1976d2',
                    fontSize: 24
                  }}>{total} €</span>
                </div>
                <button 
                  onClick={handleContinue}
                  style={{ 
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
                    color: '#fff', 
                    fontWeight: 600, 
                    fontSize: 16, 
                    borderRadius: 8, 
                    padding: '12px 32px', 
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)', 
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Procéder au paiement
                </button>
              </div>
            </div>

            {/* Info acompte */}
            <div style={{ 
              marginTop: 30,
              padding: 20, 
              backgroundColor: '#e3f2fd', 
              borderRadius: 8, 
              border: '1px solid #bbdefb',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{ 
                fontSize: 20, 
                color: '#1976d2'
              }}>💳</div>
              <div style={{ 
                fontSize: 15, 
                color: '#1565c0',
                lineHeight: 1.5
              }}>
                <strong>Paiement sécurisé :</strong> Vous ne payez que l'acompte de{' '}
                <span style={{ fontWeight: 700 }}>{acompte} €</span>{' '}
                (20% du total). Le solde sera réglé le jour de l'embarquement.
              </div>
            </div>
          </div>

          {/* Récapitulatif de la réservation */}
          <div style={{ 
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: '30px',
            marginBottom: 40,
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            border: '1px solid #e9ecef'
          }}>
            <h2 style={{ 
              fontSize: 22, 
              fontWeight: 700, 
              color: '#2c3e50',
              marginBottom: 25,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{ color: '#1976d2' }}>📋</span>
              Récapitulatif de votre réservation
            </h2>
            
            {/* Informations du bateau */}
            <div style={{ 
              marginBottom: 20, 
              padding: 20, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 8, 
              border: '1px solid #e9ecef' 
            }}>
              <h3 style={{ 
                fontWeight: 600, 
                color: '#1976d2', 
                fontSize: 18,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                🚤 {bateauNom || 'Bateau sélectionné'}
              </h3>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 15,
                fontSize: 14,
                color: '#495057'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#6c757d' }}>📍</span>
                  <span><strong>Lieu :</strong> {bateauVille}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#6c757d' }}>📅</span>
                  <span><strong>Du :</strong> {dateDebut} à {heureDebut}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#6c757d' }}>📅</span>
                  <span><strong>Au :</strong> {dateFin} à {heureFin}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#6c757d' }}>⏱️</span>
                  <span><strong>Durée :</strong> {nbJours} jour{nbJours > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Détail des coûts */}
            <div style={{ 
              marginBottom: 20, 
              padding: 20, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 8, 
              border: '1px solid #e9ecef' 
            }}>
              <h4 style={{ 
                fontWeight: 600, 
                color: '#495057',
                fontSize: 16,
                marginBottom: 15
              }}>
                💰 Détail des coûts
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: 14,
                  color: '#495057',
                  padding: '8px 0',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <span style={{ fontWeight: 500 }}>Location du bateau ({nbJours} jour{nbJours > 1 ? 's' : ''})</span>
                  <span style={{ fontWeight: 600, color: '#1976d2' }}>
                    {prix ? parseFloat(prix) : 0}€/jour × {nbJours} = {prix ? parseFloat(prix) * nbJours : 0}€
                  </span>
                </div>

                {/* Services sélectionnés dans le détail des coûts */}
                {servicesSelectionnes.length > 0 && servicesSelectionnes.map((service, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontSize: 14,
                    color: '#495057',
                    padding: '8px 0',
                    borderBottom: index < servicesSelectionnes.length - 1 || servicesSelectionnes.length > 0 ? '1px solid #e9ecef' : 'none'
                  }}>
                    <span style={{ fontWeight: 500 }}>{service.nom} ({nbJours} jour{nbJours > 1 ? 's' : ''})</span>
                    <span style={{ fontWeight: 600, color: '#1976d2' }}>
                      {service.prix}€/jour × {nbJours} = {service.prix * nbJours}€
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{ 
                marginTop: 15,
                paddingTop: 15,
                borderTop: '2px solid #1976d2',
                display: 'flex', 
                justifyContent: 'space-between', 
                fontWeight: 700,
                fontSize: 18,
                color: '#1976d2'
              }}>
                <span>Total :</span>
                <span>{total}€</span>
              </div>
            </div>

            {/* Services inclus */}
            <div style={{ 
              padding: 20,
              backgroundColor: '#e8f5e8',
              borderRadius: 8,
              border: '1px solid #c8e6c9'
            }}>
              <h4 style={{ 
                fontWeight: 600, 
                color: '#2e7d32',
                fontSize: 16,
                marginBottom: 15
              }}>
                ✅ Inclus dans votre réservation
              </h4>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 8
              }}>
                {reservationApercu.map((item, i) => (
                  <li key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    fontSize: 14,
                    color: '#2e7d32',
                    fontWeight: 500
                  }}>
                    <span style={{ 
                      color: '#4caf50', 
                      fontWeight: 700, 
                      fontSize: 14, 
                      marginRight: 10
                    }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Formulaire utilisateur non connecté */}
          {!user && (
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '30px',
              marginBottom: 40,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              border: '1px solid #e9ecef',
              maxWidth: 500,
              margin: '0 auto 40px'
            }}>
              <h3 style={{ 
                fontSize: 20, 
                fontWeight: 700, 
                color: '#2c3e50',
                marginBottom: 20,
                textAlign: 'center'
              }}>
                Vos informations
              </h3>
              <form onSubmit={e => { e.preventDefault(); handleContinue(); }}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#495057',
                    marginBottom: 8
                  }}>
                    Nom *
                  </label>
                  <input 
                    value={form.nom} 
                    onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} 
                    required 
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ced4da',
                      borderRadius: 6,
                      fontSize: 14,
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#495057',
                    marginBottom: 8
                  }}>
                    Prénom *
                  </label>
                  <input 
                    value={form.prenom} 
                    onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} 
                    required 
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ced4da',
                      borderRadius: 6,
                      fontSize: 14,
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#495057',
                    marginBottom: 8
                  }}>
                    Email *
                  </label>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                    required 
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #ced4da',
                      borderRadius: 6,
                      fontSize: 14,
                      transition: 'border-color 0.2s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                    onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                  />
                </div>
                {submitted && (
                  <div style={{ 
                    padding: '12px 16px',
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    borderRadius: 6,
                    fontSize: 14,
                    marginBottom: 20,
                    border: '1px solid #ffcdd2'
                  }}>
                    Merci de remplir tous les champs pour continuer.
                  </div>
                )}
                <button 
                  type="submit" 
                  style={{ 
                    width: '100%',
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '14px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Finaliser la réservation
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
