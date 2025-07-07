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
  const [bateauInfo, setBateauInfo] = useState(null);
  const [agenceInfo, setAgenceInfo] = useState(null);
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
        
        // Récupération des informations du bateau et de l'agence
        let bateauNom = null;
        let bateauData = null;
        let agenceData = null;
        
        let bateauId = session.metadata?.bateauId || (userData && userData.bateauId);
        if (bateauId) {
          try {
            const bateauRef = doc(db, "bateaux", bateauId);
            const bateauSnap = await getDoc(bateauRef);
            if (bateauSnap.exists()) {
              bateauData = bateauSnap.data();
              bateauNom = bateauData.nom || null;
              setBateauInfo({
                nom: bateauData.nom || '',
                ville: bateauData.Ville || '',
                agenceId: bateauData.agenceId || '',
                agenceNom: bateauData.agenceNom || ''
              });
              
              // Récupération des infos de l'agence
              if (bateauData.agenceId) {
                try {
                  // Essayer d'abord dans la collection agences
                  const agenceRef = doc(db, "agences", bateauData.agenceId);
                  const agenceSnap = await getDoc(agenceRef);
                  if (agenceSnap.exists()) {
                    agenceData = agenceSnap.data();
                  } else {
                    // Fallback : chercher dans users
                    const userAgenceRef = doc(db, "users", bateauData.agenceId);
                    const userAgenceSnap = await getDoc(userAgenceRef);
                    if (userAgenceSnap.exists()) {
                      const userData = userAgenceSnap.data();
                      agenceData = {
                        nom: userData.agence || userData.displayName || bateauData.agenceNom || 'Agence',
                        adresse: userData.adresse || '',
                        telephone: userData.telephone || userData.phone || '',
                        email: userData.email || '',
                        ville: userData.ville || ''
                      };
                    }
                  }
                  
                  if (agenceData) {
                    setAgenceInfo({
                      nom: agenceData.nom || bateauData.agenceNom || 'Agence',
                      adresse: agenceData.adresse || '',
                      ville: agenceData.ville || bateauData.Ville || '',
                      telephone: agenceData.telephone || agenceData.phone || '',
                      email: agenceData.email || ''
                    });
                  }
                } catch (e) {
                  console.error('Erreur récupération agence:', e);
                }
              }
            }
          } catch (e) {
            console.error('Erreur récupération bateau:', e);
          }
        }
        
        const docToAdd = {
          userId: user.uid,
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          genre: userData.genre || null,
          phone: userData.phone || null,
          bateauId: bateauId || null,
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
          statusComplet: false,
          createdAt: new Date(),
          stripeRaw: session
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
      <div style={{ 
        paddingTop: 80, 
        minHeight: '100vh', 
        backgroundColor: '#f8f9fa',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <div className="container" style={{ maxWidth: 900 }}>
          {/* Header avec animation de succès */}
          <div style={{ 
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: '40px',
            marginBottom: 30,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e9ecef',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animation de fond */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, #e8f5e8 0%, #f8f9fa 100%)',
              opacity: 0.3,
              zIndex: 0
            }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 40,
                animation: 'bounce 2s ease-in-out infinite'
              }}>
                🎉
              </div>
              
              <h1 style={{ 
                fontSize: 32, 
                fontWeight: 800, 
                color: '#059669',
                margin: 0,
                marginBottom: 16
              }}>
                Félicitations !
              </h1>
              
              <p style={{ 
                fontSize: 18, 
                color: '#4b5563',
                margin: 0,
                lineHeight: 1.6,
                maxWidth: 600,
                margin: '0 auto'
              }}>
                Votre réservation est confirmée ! Nous vous donnons rendez-vous à l'agence pour finaliser votre location et embarquer à bord de votre bateau.
              </p>
            </div>
          </div>

          {/* Informations de réservation */}
          {stripeSession && (
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '30px',
              marginBottom: 30,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              border: '1px solid #e9ecef'
            }}>
              <h2 style={{ 
                fontSize: 22, 
                fontWeight: 700, 
                color: '#1f2937',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <span style={{ color: '#3b82f6' }}>📋</span>
                Détails de votre réservation
              </h2>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 20,
                marginBottom: 20
              }}>
                <div style={{ 
                  padding: 20, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 8,
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: '#64748b',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                    letterSpacing: '0.5px'
                  }}>
                    Bateau
                  </h4>
                  <p style={{ 
                    fontSize: 16, 
                    fontWeight: 600, 
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {bateauInfo?.nom || 'Chargement...'}
                  </p>
                  <p style={{ 
                    fontSize: 14, 
                    color: '#64748b',
                    margin: '4px 0 0 0'
                  }}>
                    📍 {bateauInfo?.ville || 'Ville'}
                  </p>
                </div>
                
                <div style={{ 
                  padding: 20, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 8,
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: '#64748b',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                    letterSpacing: '0.5px'
                  }}>
                    Dates
                  </h4>
                  <p style={{ 
                    fontSize: 16, 
                    fontWeight: 600, 
                    color: '#1f2937',
                    margin: 0
                  }}>
                    Du {stripeSession.metadata?.dateDebut || 'N/A'}
                  </p>
                  <p style={{ 
                    fontSize: 14, 
                    color: '#64748b',
                    margin: '4px 0 0 0'
                  }}>
                    Au {stripeSession.metadata?.dateFin || 'N/A'}
                  </p>
                </div>
                
                <div style={{ 
                  padding: 20, 
                  backgroundColor: '#f0f9ff', 
                  borderRadius: 8,
                  border: '1px solid #0ea5e9'
                }}>
                  <h4 style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: '#0369a1',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                    letterSpacing: '0.5px'
                  }}>
                    Montant payé
                  </h4>
                  <p style={{ 
                    fontSize: 20, 
                    fontWeight: 700, 
                    color: '#0369a1',
                    margin: 0
                  }}>
                    {stripeSession.amount_total ? (stripeSession.amount_total / 100).toFixed(2) : '0'} €
                  </p>
                  <p style={{ 
                    fontSize: 12, 
                    color: '#0369a1',
                    margin: '4px 0 0 0'
                  }}>
                    Acompte (20% du total)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Informations de l'agence */}
          {agenceInfo && (
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '30px',
              marginBottom: 30,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              border: '1px solid #e9ecef'
            }}>
              <h2 style={{ 
                fontSize: 22, 
                fontWeight: 700, 
                color: '#1f2937',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <span style={{ color: '#10b981' }}>🏢</span>
                Informations de l'agence
              </h2>
              
              <div style={{ 
                padding: 25, 
                backgroundColor: '#f0fdf4', 
                borderRadius: 10,
                border: '1px solid #bbf7d0'
              }}>
                <h3 style={{ 
                  fontSize: 20, 
                  fontWeight: 700, 
                  color: '#15803d',
                  marginBottom: 15
                }}>
                  {agenceInfo.nom}
                </h3>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 15,
                  fontSize: 15,
                  color: '#166534'
                }}>
                  {agenceInfo.adresse && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#10b981' }}>📍</span>
                      <span><strong>Adresse :</strong> {agenceInfo.adresse}</span>
                    </div>
                  )}
                  
                  {agenceInfo.ville && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#10b981' }}>🏙️</span>
                      <span><strong>Ville :</strong> {agenceInfo.ville}</span>
                    </div>
                  )}
                  
                  {agenceInfo.telephone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#10b981' }}>📞</span>
                      <span><strong>Téléphone :</strong> {agenceInfo.telephone}</span>
                    </div>
                  )}
                  
                  {agenceInfo.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#10b981' }}>📧</span>
                      <span><strong>Email :</strong> {agenceInfo.email}</span>
                    </div>
                  )}
                </div>
                
                <div style={{ 
                  marginTop: 20,
                  padding: 15,
                  backgroundColor: '#dcfce7',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#15803d',
                  fontWeight: 500
                }}>
                  💡 <strong>Rendez-vous :</strong> Présentez-vous à l'agence le jour de votre réservation avec une pièce d'identité et votre permis bateau (si requis).
                </div>
              </div>
            </div>
          )}

          {/* Informations utilisateur */}
          {user && userData && (
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '30px',
              marginBottom: 30,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              border: '1px solid #e9ecef'
            }}>
              <h2 style={{ 
                fontSize: 22, 
                fontWeight: 700, 
                color: '#1f2937',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <span style={{ color: '#6366f1' }}>👤</span>
                Vos informations
              </h2>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 15,
                padding: 20,
                backgroundColor: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#6366f1' }}>👨</span>
                  <span><strong>Nom :</strong> {userData.nom} {userData.prenom}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#6366f1' }}>📧</span>
                  <span><strong>Email :</strong> {userData.email}</span>
                </div>
                
                {userData.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#6366f1' }}>📱</span>
                    <span><strong>Téléphone :</strong> {userData.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informations de contact et actions */}
          <div style={{ 
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: '30px',
            marginBottom: 40,
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: 22, 
              fontWeight: 700, 
              color: '#1f2937',
              marginBottom: 20
            }}>
              Besoin d'aide ?
            </h2>
            
            <div style={{ 
              padding: 20,
              backgroundColor: '#eff6ff',
              borderRadius: 8,
              border: '1px solid #bfdbfe',
              marginBottom: 30
            }}>
              <p style={{ 
                fontSize: 16,
                color: '#1e40af',
                margin: 0,
                lineHeight: 1.6
              }}>
                Un email de confirmation vous a été envoyé.<br />
                Pour toute question, contactez-nous au <strong>01 23 45 67 89</strong> ou par email à <strong>contact@bbyatch.com</strong>.
              </p>
            </div>
            
            <div style={{ 
              display: 'flex',
              gap: 15,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <a 
                href="/espace" 
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'
              }>
                📊 Gérer mes réservations
              </a>
              
              <a 
                href="/" 
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'transparent',
                  color: '#3b82f6',
                  textDecoration: 'none',
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  border: '2px solid #3b82f6',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#3b82f6';
                }}
              >
                🏠 Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
}
