import React, { useState, useEffect } from 'react';
import { Outlet, Link, Routes, Route, useNavigate } from 'react-router-dom';
import { 
  FaBars, 
  FaShip, 
  FaClipboardList, 
  FaSignOutAlt, 
  FaUserFriends, 
  FaCog,
  FaHome,
  FaTools,
  FaUsers,
  FaTimes
} from 'react-icons/fa';
import { auth, db } from '../../firebase';
import { doc, getDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fr } from 'date-fns/locale';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { collection, getDocs, query, where } from 'firebase/firestore';
import AgenceAjouterBateau from './AgenceAjouterBateau';
import EditerDisponibilitesBateau from './EditerDisponibilitesBateau';
import DashboardAgenceAccueil from './DashboardAgenceAccueil';
import AgenceServices from './AgenceServices';
import AgenceParametres from './AgenceParametres';

const locales = {
  'fr': fr,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function AgenceDashboard() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setUserRole(userDoc.exists() ? userDoc.data().role : null);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#0f1419',
        color: '#e8eaed'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #2a2d35',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '16px', fontWeight: 500, color: '#9ca3af' }}>Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'agence') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#0f1419',
        color: '#e8eaed',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: '#1a1d23',
          borderRadius: '12px',
          padding: '40px',
          border: '1px solid #2a2d35',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#ef4444' }}>Accès Restreint</h2>
          <p style={{ fontSize: '16px', color: '#9ca3af' }}>Cette section est réservée aux agences partenaires</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: '#0f1419', // fond sombre
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#e8eaed' // texte clair
    }}>
      {/* Overlay pour mobile */}
      {isMobile && menuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 999,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: menuOpen ? (isMobile ? '280px' : '260px') : '70px',
          background: '#181c24', // sidebar sombre
          color: '#e8eaed',
          transition: 'all 0.3s ease',
          minHeight: '100vh',
          position: isMobile ? 'fixed' : 'fixed',
          zIndex: 1000,
          top: 0,
          left: menuOpen || !isMobile ? 0 : '-280px',
          boxShadow: '4px 0 20px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #232a36'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #232a36',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#181c24'
        }}>
          {menuOpen && (
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: 700,
                color: '#e8eaed'
              }}>
                Espace Agence
              </h3>
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '12px', 
                color: '#6b7280',
                fontWeight: 500
              }}>
                Tableau de bord professionnel
              </p>
            </div>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: '#232a36',
              border: '1px solid #374151',
              color: '#e8eaed',
              fontSize: '16px',
              padding: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#232a36';
              e.target.style.borderColor = '#4b5563';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#232a36';
              e.target.style.borderColor = '#374151';
            }}
          >
            {isMobile && menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ 
          flex: 1, 
          padding: '20px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          background: '#181c24'
        }}>
          <SidebarLink 
            to="/agence/dashboard" 
            icon={<FaHome />} 
            open={menuOpen} 
            label="Accueil"
          />
          <SidebarLink 
            to="/agence/dashboard/reservations" 
            icon={<FaClipboardList />} 
            open={menuOpen} 
            label="Réservations"
          />
          <SidebarLink 
            to="/agence/dashboard/bateaux" 
            icon={<FaShip />} 
            open={menuOpen} 
            label="Mes bateaux"
          />
          <SidebarLink 
            to="/agence/dashboard/services" 
            icon={<FaTools />} 
            open={menuOpen} 
            label="Nos services"
          />
          <SidebarLink 
            to="/agence/dashboard/clients" 
            icon={<FaUsers />} 
            open={menuOpen} 
            label="Clients"
          />
          <SidebarLink 
            to="/agence/dashboard/parametres" 
            icon={<FaCog />} 
            open={menuOpen} 
            label="Paramètres"
          />
        </nav>

        {/* Logout Button */}
        <div style={{ padding: '20px', background: '#181c24' }}>
          <button
            onClick={async () => {
              await auth.signOut();
              window.location.href = '/';
            }}
            style={{
              width: '100%',
              padding: menuOpen ? '12px 16px' : '12px 8px',
              borderRadius: '8px',
              background: '#e74c3c',
              border: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: menuOpen ? 'flex-start' : 'center',
              gap: '10px',
              boxShadow: '0 2px 8px #e74c3c33'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#c0392b';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#e74c3c';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <FaSignOutAlt />
            {menuOpen && 'Se déconnecter'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        style={{
          marginLeft: isMobile ? 0 : (menuOpen ? '260px' : '70px'),
          width: isMobile ? '100%' : `calc(100% - ${menuOpen ? '260px' : '70px'})`,
          minHeight: '100vh',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          background: '#0f1419'
        }}
      >
        {/* Header */}
        <header style={{
          background: '#181c24',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          padding: isMobile ? '16px 20px' : '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #232a36',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isMobile && (
              <button
                onClick={() => setMenuOpen(true)}
                style={{
                  background: '#232a36',
                  border: '1px solid #374151',
                  color: '#e8eaed',
                  padding: '10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaBars />
              </button>
            )}
            <h1 style={{ 
              margin: 0,
              fontSize: isMobile ? '18px' : '22px',
              fontWeight: 700,
              color: '#e8eaed',
              letterSpacing: '-0.5px'
            }}>
              Dashboard Agence
            </h1>
          </div
          >
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              padding: '6px 14px',
              background: '#1e90ff',
              borderRadius: '16px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px #1e90ff33'
            }}>
              Pro
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: isMobile ? '20px' : '32px',
          background: '#0f1419'
        }}>
          <div style={{
            background: '#181c24',
            borderRadius: '12px',
            padding: isMobile ? '20px' : '32px',
            minHeight: '600px',
            border: '1px solid #232a36',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <Routes>
              <Route path="" element={<DashboardAgenceAccueil />} />
              <Route path="reservations" element={<AgenceReservationsCalendar />} />
              <Route path="bateaux" element={<AgenceBateaux />} />
              <Route path="bateaux/ajouter" element={<AgenceAjouterBateau />} />
              <Route path="bateaux/:id/disponibilites" element={<EditerDisponibilitesBateau />} />
              <Route path="services" element={<AgenceServices />} />
              <Route path="parametres" element={<AgenceParametres />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Animations CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Scrollbar sombre */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1a1d23;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
}

function SidebarLink({ to, icon, open, label }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: isHovered ? '#2a2d35' : 'transparent',
        color: '#e8eaed',
        padding: open ? '12px 20px' : '12px 16px',
        borderRadius: '8px',
        textAlign: 'left',
        fontWeight: 500,
        fontSize: '14px',
        textDecoration: 'none',
        margin: '0 16px',
        transition: 'all 0.2s ease',
        border: `1px solid ${isHovered ? '#374151' : 'transparent'}`,
        justifyContent: open ? 'flex-start' : 'center'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={{ 
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
        color: isHovered ? '#3b82f6' : '#9ca3af'
      }}>
        {icon}
      </span>
      {open && (
        <span style={{ 
          opacity: open ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out'
        }}>
          {label}
        </span>
      )}
    </Link>
  );
}

function AgenceReservationsCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bateaux, setBateaux] = useState([]);
  const [selectedBateau, setSelectedBateau] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchReservations() {
      const user = auth.currentUser;
      if (!user) return;
      // Récupère les bateaux de l'agence
      const bateauxSnap = await getDocs(query(collection(db, 'bateaux'), where('agenceId', '==', user.uid)));
      const bateaux = bateauxSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBateaux(bateaux);
      // Ajoute les disponibilités des bateaux comme events
      const dispoEvents = [];
      bateaux.forEach(bateau => {
        if (Array.isArray(bateau.disponibilites)) {
          bateau.disponibilites.forEach((d, idx) => {
            dispoEvents.push({
              title: `Disponible: ${bateau.nom}`,
              start: new Date(d.start),
              end: new Date(d.end),
              allDay: false,
              bateauId: bateau.id,
              color: '#27ae60',
              type: 'dispo',
            });
          });
        }
      });
      // Récupère les réservations pour ces bateaux
      const bateauxIds = bateaux.map(b => b.id);
      const reservationsSnap = await getDocs(collection(db, 'reservations'));
      const reservations = reservationsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(r => bateauxIds.includes(r.bateauId));
      // Transforme en événements pour le calendrier
      const resaEvents = reservations.map(r => ({
        title: r.nom ? `${r.nom} (${r.bateauNom || r.bateauId})` : (r.bateauNom || r.bateauId),
        start: new Date(r.dateDebut + 'T' + (r.heureDebut || '12:00')),
        end: new Date(r.dateFin + 'T' + (r.heureFin || '12:00')),
        allDay: false,
        bateauId: r.bateauId,
        color: '#e67e22',
        type: 'resa',
      }));
      setEvents([...dispoEvents, ...resaEvents]);
      setLoading(false);
    }
    fetchReservations();
  }, []);

  if (loading) return <div>Chargement du calendrier...</div>;

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #1e90ff22', padding: 24 }}>
      <h2 style={{ color: '#1e90ff', marginBottom: 24 }}>Calendrier des réservations</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={event => ({ style: { backgroundColor: event.type === 'dispo' ? '#27ae60' : '#e67e22', color: '#fff', borderRadius: 8 } })}
        onSelectEvent={event => {
          if (event.type === 'dispo') {
            const bateau = bateaux.find(b => b.id === event.bateauId);
            setSelectedBateau(bateau);
            setShowModal(true);
          }
        }}
        messages={{
          next: 'Suivant',
          previous: 'Précédent',
          today: "Aujourd'hui",
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour',
          agenda: 'Agenda',
          date: 'Date',
          time: 'Heure',
          event: 'Événement',
          noEventsInRange: 'Aucune réservation ou disponibilité',
        }}
        culture="fr"
      />
      {showModal && selectedBateau && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: '#0008',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 32,
                minWidth: 320,
                maxWidth: 400,
                boxShadow: '0 4px 32px #1e90ff33',
                position: 'relative'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 16,
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  color: '#e74c3c',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
              <h3 style={{ color: '#1e90ff', marginBottom: 16 }}>{selectedBateau.nom}</h3>
              <div><b>Ville :</b> {selectedBateau.Ville}</div>
              <div><b>Places :</b> {selectedBateau.places}</div>
              <div><b>Prix :</b> {selectedBateau.prix} €</div>
              <div><b>Moteur :</b> {selectedBateau.moteur}</div>
              <div><b>Carburant :</b> {selectedBateau.carburant}</div>
              <div><b>Vitesse :</b> {selectedBateau.vitesse} kn</div>
              {selectedBateau.photo && selectedBateau.photo.length > 0 && (
                <img src={selectedBateau.photo[0]} alt="Bateau" style={{ width: '100%', borderRadius: 10, marginTop: 16, objectFit: 'cover', maxHeight: 180 }} />
              )}
              <button
                className="btn btn-primary mt-3"
                style={{ marginTop: 18 }}
                onClick={() => {
                  setShowModal(false);
                  window.history.pushState({}, '', `/agence/dashboard/bateaux/${selectedBateau.id}/disponibilites`);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                Modifier les disponibilités
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AgenceBateaux() {
  const [bateaux, setBateaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', ville: '', places: '', prix: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBateaux() {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDocs(query(collection(db, 'bateaux'), where('agenceId', '==', user.uid)));
      setBateaux(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchBateaux();
  }, [success]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    const user = auth.currentUser;
    if (!user) { setError('Non connecté'); return; }
    if (!form.nom || !form.ville || !form.places || !form.prix) {
      setError('Tous les champs sont obligatoires.'); return;
    }
    try {
      await addDoc(collection(db, 'bateaux'), {
        nom: form.nom,
        Ville: form.ville,
        places: Number(form.places),
        prix: Number(form.prix),
        agenceId: user.uid,
        createdAt: new Date()
      });
      setSuccess('Bateau ajouté !');
      setShowForm(false);
      setForm({ nom: '', ville: '', places: '', prix: '' });
    } catch (err) {
      setError('Erreur : ' + err.message);
    }
  };

  async function deleteBateau(id) {
    try {
      await deleteDoc(doc(db, 'bateaux', id));
      setBateaux(bateaux => bateaux.filter(b => b.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression : ' + err.message);
    }
  }

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
          Chargement de vos bateaux...
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'transparent',
      minHeight: '100%',
      color: '#e8eaed'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            margin: 0,
            fontSize: '28px',
            fontWeight: 700,
            color: '#e8eaed',
            marginBottom: '8px'
          }}>
            Mes bateaux
          </h1>
          <p style={{ 
            margin: 0, 
            color: '#9ca3af', 
            fontSize: '16px' 
          }}>
            Gérez votre flotte de bateaux
          </p>
        </div>
        
        <button
          onClick={() => navigate('/agence/dashboard/bateaux/ajouter')}
          style={{
            background: '#3b82f6',
            border: 'none',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#2563eb';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#3b82f6';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <FaShip />
          Ajouter un bateau
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div style={{
          background: '#065f46',
          color: '#10b981',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: 500,
          border: '1px solid #10b981'
        }}>
          ✅ {success}
        </div>
      )}

      {error && (
        <div style={{
          background: '#7f1d1d',
          color: '#ef4444',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: 500,
          border: '1px solid #ef4444'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Table des bateaux */}
      <div style={{
        background: '#1a1d23',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #2a2d35',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        {bateaux.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#9ca3af'
          }}>
            <FaShip style={{ 
              fontSize: '48px', 
              color: '#374151', 
              marginBottom: '20px' 
            }} />
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 600, 
              color: '#e8eaed',
              marginBottom: '12px'
            }}>
              Aucun bateau
            </h3>
            <p style={{ 
              fontSize: '16px', 
              color: '#9ca3af',
              marginBottom: '24px'
            }}>
              Commencez par ajouter votre premier bateau
            </p>
            <button
              onClick={() => navigate('/agence/dashboard/bateaux/ajouter')}
              style={{
                background: '#3b82f6',
                border: 'none',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FaShip />
              Ajouter mon premier bateau
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: '#e8eaed'
            }}>
              <thead>
                <tr style={{
                  borderBottom: '2px solid #2a2d35'
                }}>
                  <th style={{
                    padding: '16px 12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Nom
                  </th>
                  <th style={{
                    padding: '16px 12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Ville
                  </th>
                  <th style={{
                    padding: '16px 12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Places
                  </th>
                  <th style={{
                    padding: '16px 12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Prix (€)
                  </th>
                  <th style={{
                    padding: '16px 12px',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bateaux.map((bateau, index) => (
                  <tr key={bateau.id} style={{
                    borderBottom: '1px solid #2a2d35',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2a2d35';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  >
                    <td style={{
                      padding: '16px 12px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#e8eaed'
                    }}>
                      {bateau.nom}
                    </td>
                    <td style={{
                      padding: '16px 12px',
                      fontSize: '14px',
                      color: '#9ca3af'
                    }}>
                      {bateau.Ville}
                    </td>
                    <td style={{
                      padding: '16px 12px',
                      fontSize: '14px',
                      color: '#9ca3af'
                    }}>
                      {bateau.places}
                    </td>
                    <td style={{
                      padding: '16px 12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#10b981'
                    }}>
                      {bateau.prix}€
                    </td>
                    <td style={{
                      padding: '16px 12px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <button
                          onClick={() => navigate(`/agence/dashboard/bateaux/${bateau.id}/edit`)}
                          style={{
                            background: '#3b82f6',
                            border: 'none',
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#2563eb';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#3b82f6';
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          onClick={async () => {
                            if(window.confirm('Êtes-vous sûr de vouloir supprimer ce bateau ?')) {
                              await deleteBateau(bateau.id);
                            }
                          }}
                          style={{
                            background: '#ef4444',
                            border: 'none',
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#dc2626';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#ef4444';
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
