import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { 
  FaShip, 
  FaCalendarCheck, 
  FaEuroSign, 
  FaChartLine,
  FaUsers,
  FaClock,
  FaArrowUp,
  FaAnchor
} from 'react-icons/fa';

export default function DashboardAgenceAccueil() {
  const [nbBateaux, setNbBateaux] = useState(0);
  const [nbReservations, setNbReservations] = useState(0);
  const [nbServices, setNbServices] = useState(0);
  const [revenus, setRevenus] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      
      try {
        // Nombre de bateaux
        const bateauxSnap = await getDocs(query(collection(db, 'bateaux'), where('agenceId', '==', user.uid)));
        setNbBateaux(bateauxSnap.size);
        
        // Nombre de services
        const servicesSnap = await getDocs(query(collection(db, 'services'), where('agenceId', '==', user.uid)));
        setNbServices(servicesSnap.size);
        
        // Nombre de réservations et calcul des revenus
        const bateauxIds = bateauxSnap.docs.map(doc => doc.id);
        let nbResaBateaux = 0;
        let totalRevenus = 0;
        
        const reservationsSnap = await getDocs(collection(db, 'reservations'));
        reservationsSnap.docs.forEach(doc => {
          const data = doc.data();
          if (bateauxIds.includes(data.bateauId)) {
            nbResaBateaux++;
            totalRevenus += data.total || 0;
          }
        });
        
        setNbReservations(nbResaBateaux);
        setRevenus(totalRevenus);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
      
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #2a2d35',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ 
          color: '#9ca3af', 
          fontSize: '16px', 
          fontWeight: 500 
        }}>
          Chargement de vos statistiques...
        </p>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Bateaux',
      value: nbBateaux,
      icon: <FaShip />,
      color: '#3b82f6',
      bg: '#1e40af20',
      description: 'Bateaux actifs'
    },
    {
      title: 'Réservations',
      value: nbReservations,
      icon: <FaCalendarCheck />,
      color: '#10b981',
      bg: '#05974620',
      description: 'Total des réservations'
    },
    {
      title: 'Services',
      value: nbServices,
      icon: <FaAnchor />,
      color: '#f59e0b',
      bg: '#d9720020',
      description: 'Services disponibles'
    },
    {
      title: 'Revenus',
      value: `${revenus.toLocaleString()}€`,
      icon: <FaEuroSign />,
      color: '#8b5cf6',
      bg: '#7c3aed20',
      description: 'Revenus totaux'
    }
  ];

  return (
    <div style={{ 
      background: 'transparent',
      minHeight: '100%',
      color: '#e8eaed'
    }}>
      {/* Header avec salutation */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          margin: 0,
          fontSize: '28px',
          fontWeight: 700,
          color: '#e8eaed',
          marginBottom: '8px'
        }}>
          Tableau de bord
        </h1>
        <p style={{ 
          margin: 0, 
          color: '#9ca3af', 
          fontSize: '16px' 
        }}>
          Bienvenue sur votre espace de gestion. Voici un aperçu de votre activité.
        </p>
      </div>

      {/* Cartes statistiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {statsCards.map((card, index) => (
          <div 
            key={index}
            style={{
              background: '#2a2d35',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #374151',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'all 0.2s',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
              e.currentTarget.style.borderColor = '#4b5563';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
              e.currentTarget.style.borderColor = '#374151';
            }}
          >
            {/* Icône de fond */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              fontSize: '48px',
              color: card.color,
              opacity: 0.1
            }}>
              {card.icon}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                background: card.bg,
                borderRadius: '8px',
                padding: '8px',
                color: card.color,
                fontSize: '16px',
                border: `1px solid ${card.color}40`
              }}>
                {card.icon}
              </div>
              <span style={{
                color: '#9ca3af',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {card.title}
              </span>
            </div>

            <div style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#e8eaed',
              marginBottom: '8px'
            }}>
              {card.value}
            </div>

            <div style={{
              color: '#6b7280',
              fontSize: '13px',
              fontWeight: 500
            }}>
              {card.description}
            </div>
          </div>
        ))}
      </div>

      {/* Section activité récente */}
      <div style={{
        background: '#2a2d35',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #374151',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        marginBottom: '32px'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          fontSize: '20px',
          fontWeight: 600,
          color: '#e8eaed',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaChartLine style={{ color: '#3b82f6' }} />
          Aperçu de l'activité
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: '#1a1d23',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #374151'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <FaArrowUp style={{ color: '#10b981', fontSize: '14px' }} />
              <span style={{ color: '#9ca3af', fontSize: '13px' }}>Taux d'occupation</span>
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#e8eaed'
            }}>
              {nbBateaux > 0 ? Math.round((nbReservations / nbBateaux) * 100) : 0}%
            </div>
          </div>

          <div style={{
            background: '#1a1d23',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #374151'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <FaUsers style={{ color: '#f59e0b', fontSize: '14px' }} />
              <span style={{ color: '#9ca3af', fontSize: '13px' }}>Revenus moyen</span>
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#e8eaed'
            }}>
              {nbReservations > 0 ? Math.round(revenus / nbReservations) : 0}€
            </div>
          </div>
        </div>

        <div style={{
          color: '#9ca3af',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <p style={{ margin: 0 }}>
            📊 Votre activité se développe bien ! Continuez à optimiser vos services et la gestion de votre flotte pour maximiser votre rentabilité.
          </p>
        </div>
      </div>

      {/* Section conseils */}
      <div style={{
        background: '#2a2d35',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #374151',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          fontSize: '20px',
          fontWeight: 600,
          color: '#e8eaed',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaClock style={{ color: '#3b82f6' }} />
          Conseils pour optimiser votre activité
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          color: '#9ca3af',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          <div style={{
            background: '#1a1d23',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #374151'
          }}>
            <strong style={{ color: '#e8eaed' }}>🚤 Optimisez votre flotte</strong>
            <br />
            Assurez-vous que vos bateaux sont bien entretenus et attractifs pour maximiser les réservations.
          </div>
          
          <div style={{
            background: '#1a1d23',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #374151'
          }}>
            <strong style={{ color: '#e8eaed' }}>💰 Diversifiez vos services</strong>
            <br />
            Ajoutez des services complémentaires pour augmenter le panier moyen de vos clients.
          </div>
          
          <div style={{
            background: '#1a1d23',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #374151'
          }}>
            <strong style={{ color: '#e8eaed' }}>📈 Analysez vos performances</strong>
            <br />
            Suivez régulièrement vos statistiques pour identifier les opportunités d'amélioration.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
