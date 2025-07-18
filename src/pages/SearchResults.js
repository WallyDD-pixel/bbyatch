import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { FaUserFriends, FaTachometerAlt, FaGasPump, FaCogs, FaFilter, FaSort } from "react-icons/fa";
import logo from "../logo.svg";
import 'bootstrap/dist/css/bootstrap.min.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const queryParams = useQuery();
  const ville = queryParams.get("ville") || "";
  const dateDebut = queryParams.get("dateDebut") || "";
  const heureDebut = queryParams.get("heureDebut") || "";
  const dateFin = queryParams.get("dateFin") || "";
  const heureFin = queryParams.get("heureFin") || "";
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [cardsLoaded, setCardsLoaded] = useState({});
  const [sortBy, setSortBy] = useState('prix');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({
    maxPrice: '',
    minPlaces: '',
    maxPlaces: ''
  });
  const navigate = useNavigate();

  // Animation d'entrée progressive pour le contenu
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Calcul du nombre de jours entre deux dates
  function getDaysDiff(date1, date2) {
    if (!date1 || !date2) return 1;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = d2 - d1;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
  const nbJours = getDaysDiff(dateDebut, dateFin);
  
  // Calcul du prix minimum pour l'estimation
  const prixMin = filteredResults.length > 0 ? Math.min(...filteredResults.map(b => b.prix)) : 0;
  const totalEstime = prixMin * nbJours;

  // Formatage de la date en JJ/MMM (ex: 28/Juin)
  function formatShortDate(dateStr) {
    if (!dateStr) return '';
    const mois = ['Janv', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const d = new Date(dateStr);
    return d.getDate() + ' ' + mois[d.getMonth()];
  }
  const dateDebutShort = formatShortDate(dateDebut);
  const dateFinShort = formatShortDate(dateFin);

  // Fonction de tri
  const sortResults = (data) => {
    return [...data].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'prix') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortBy === 'places') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (sortBy === 'nom') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Fonction de filtrage
  const filterResults = (data) => {
    return data.filter(bateau => {
      const prixTotal = bateau.prix * nbJours;
      const places = parseInt(bateau.places) || 0;
      
      if (filters.maxPrice && prixTotal > parseFloat(filters.maxPrice)) return false;
      if (filters.minPlaces && places < parseInt(filters.minPlaces)) return false;
      if (filters.maxPlaces && places > parseInt(filters.maxPlaces)) return false;
      
      return true;
    });
  };

  // Fonction pour vérifier si un bateau est disponible aux dates demandées (ignore l'heure)
  const isBateauAvailable = (bateau, dateDebut, heureDebut, dateFin, heureFin) => {
    // On ignore heureDebut et heureFin
    if (!bateau.disponibilites || !Array.isArray(bateau.disponibilites)) {
      return false;
    }
    if (bateau.disponibilites.length === 0) {
      return false;
    }
    // Convertir les dates demandées en jours uniquement (ignorer l'heure)
    const requestedStartDate = new Date(dateDebut);
    requestedStartDate.setHours(0, 0, 0, 0);
    const requestedEndDate = new Date(dateFin);
    requestedEndDate.setHours(23, 59, 59, 999);
    // Vérifier si le bateau a des disponibilités qui couvrent les jours demandés
    return bateau.disponibilites.some((dispo) => {
      if (!dispo.start || !dispo.end) return false;
      try {
        const availableStart = new Date(dispo.start);
        const availableEnd = new Date(dispo.end);
        if (isNaN(availableStart.getTime()) || isNaN(availableEnd.getTime())) return false;
        // Extraire seulement les jours des disponibilités
        const availableStartDay = new Date(availableStart.getFullYear(), availableStart.getMonth(), availableStart.getDate());
        const availableEndDay = new Date(availableEnd.getFullYear(), availableEnd.getMonth(), availableEnd.getDate());
        availableEndDay.setHours(23, 59, 59, 999);
        // Vérifier si les jours demandés sont couverts par les jours disponibles
        return requestedStartDate >= availableStartDay && requestedEndDate <= availableEndDay;
      } catch {
        return false;
      }
    });
  };

  // Fonction pour obtenir les créneaux horaires disponibles d'un bateau pour les dates sélectionnées
  const getBateauAvailableSlots = (bateau, dateDebut, dateFin) => {
    if (!bateau.disponibilites || !Array.isArray(bateau.disponibilites)) {
      return [];
    }

    const requestedStartDate = new Date(dateDebut);
    const requestedEndDate = new Date(dateFin);
    const slots = [];

    bateau.disponibilites.forEach((dispo) => {
      if (!dispo.start || !dispo.end) return;

      try {
        const availableStart = new Date(dispo.start);
        const availableEnd = new Date(dispo.end);
        
        if (isNaN(availableStart.getTime()) || isNaN(availableEnd.getTime())) return;

        // Vérifier si cette disponibilité couvre les dates demandées
        const availableStartDay = new Date(availableStart.getFullYear(), availableStart.getMonth(), availableStart.getDate());
        const availableEndDay = new Date(availableEnd.getFullYear(), availableEnd.getMonth(), availableEnd.getDate());
        
        const requestedStartDay = new Date(requestedStartDate.getFullYear(), requestedStartDate.getMonth(), requestedStartDate.getDate());
        const requestedEndDay = new Date(requestedEndDate.getFullYear(), requestedEndDate.getMonth(), requestedEndDate.getDate());

        // Si cette disponibilité couvre les dates demandées
        if (requestedStartDay >= availableStartDay && requestedEndDay <= availableEndDay) {
          slots.push({
            date: availableStartDay.toDateString(),
            startTime: availableStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            endTime: availableEnd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            fullStart: availableStart,
            fullEnd: availableEnd
          });
        }
      } catch (error) {
        console.error('Erreur lors du traitement du créneau:', error);
      }
    });

    // Trier par date puis par heure de début
    return slots.sort((a, b) => {
      if (a.fullStart < b.fullStart) return -1;
      if (a.fullStart > b.fullStart) return 1;
      return 0;
    });
  };

  useEffect(() => {
    async function fetchResults() {
      if (!ville) return;
      setLoading(true);
      const q = query(collection(db, "bateaux"), where("Ville", "==", ville));
      const snap = await getDocs(q);
      const allBateaux = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Afficher tous les bateaux de la ville, sans filtrer par disponibilité
      setResults(allBateaux);
      setLoading(false);
    }
    fetchResults();
  }, [ville, dateDebut, heureDebut, dateFin, heureFin]);

  useEffect(() => {
    const filtered = filterResults(results);
    const sorted = sortResults(filtered);
    setFilteredResults(sorted);
  }, [results, filters, sortBy, sortOrder]);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm" style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <div className="container">
          <img 
            src={logo} 
            alt="BBYATCH logo" 
            style={{ height: 40, cursor: 'pointer' }} 
            className="me-2" 
            onClick={() => navigate('/')}
          />
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <span className="nav-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                  Accueil
                </span>
              </li>
              <li className="nav-item"><span className="nav-link">Bateaux</span></li>
              <li className="nav-item"><span className="nav-link">Contact</span></li>
              <li className="nav-item">
                <span className="btn btn-outline-primary ms-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/connexion')}>
                  Connexion
                </span>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div style={{ paddingTop: 56, background: '#fafbfc', minHeight: '100vh' }}>
        <div className="container py-4">
          {/* Barre récapitulative sobre et professionnelle - Responsive */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            padding: window.innerWidth < 768 ? '24px 16px' : '32px 24px',
            marginBottom: 32,
            border: '1px solid #e1e5e9',
            position: 'relative'
          }}>
            {/* Ligne décorative */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: window.innerWidth < 768 ? 16 : 24,
              right: window.innerWidth < 768 ? 16 : 24,
              height: 3,
              background: 'linear-gradient(90deg, #2c3e50 0%, #34495e 100%)',
              borderRadius: '0 0 2px 2px'
            }}></div>

            {/* Titre principal */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: window.innerWidth < 768 ? 12 : 16,
              marginBottom: window.innerWidth < 768 ? 20 : 24,
              paddingTop: 8
            }}>
              <div style={{
                background: '#f8f9fa',
                borderRadius: 8,
                padding: window.innerWidth < 768 ? 8 : 12,
                border: '1px solid #e9ecef'
              }}>
                <i className="fa fa-search" style={{ color: '#495057', fontSize: window.innerWidth < 768 ? 16 : 18 }}></i>
              </div>
              <div>
                <h2 style={{
                  color: '#2c3e50',
                  fontWeight: 600,
                  margin: 0,
                  fontSize: window.innerWidth < 768 ? 20 : 24,
                  letterSpacing: -0.5
                }}>
                  Résultats de recherche
                </h2>
                <p style={{
                  color: '#6c757d',
                  margin: 0,
                  fontSize: window.innerWidth < 768 ? 12 : 14,
                  marginTop: 4
                }}>
                  {!loading && `${filteredResults.length} bateau${filteredResults.length > 1 ? 'x' : ''} correspondant à vos critères`}
                </p>
              </div>
            </div>

            {/* Informations organisées en ligne - Responsive */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : window.innerWidth < 1200 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: window.innerWidth < 768 ? 12 : 20,
              alignItems: 'center'
            }}>
              {/* Destination */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: window.innerWidth < 768 ? '12px 16px' : '16px 20px',
                background: '#f8f9fa',
                borderRadius: 8,
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  background: '#ffffff',
                  borderRadius: 6,
                  padding: window.innerWidth < 768 ? 6 : 8,
                  border: '1px solid #dee2e6'
                }}>
                  <i className="fa fa-map-marker-alt" style={{ color: '#495057', fontSize: 14 }}></i>
                </div>
                <div>
                  <div style={{
                    color: '#6c757d',
                    fontSize: window.innerWidth < 768 ? 10 : 12,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 2
                  }}>
                    Destination
                  </div>
                  <div style={{
                    color: '#2c3e50',
                    fontSize: window.innerWidth < 768 ? 14 : 16,
                    fontWeight: 600
                  }}>
                    {ville}
                  </div>
                </div>
              </div>

              {/* Période */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: window.innerWidth < 768 ? '12px 16px' : '16px 20px',
                background: '#f8f9fa',
                borderRadius: 8,
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  background: '#ffffff',
                  borderRadius: 6,
                  padding: window.innerWidth < 768 ? 6 : 8,
                  border: '1px solid #dee2e6'
                }}>
                  <i className="fa fa-calendar-alt" style={{ color: '#495057', fontSize: 14 }}></i>
                </div>
                <div>
                  <div style={{
                    color: '#6c757d',
                    fontSize: window.innerWidth < 768 ? 10 : 12,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 2
                  }}>
                    Période
                  </div>
                  <div style={{
                    color: '#2c3e50',
                    fontSize: window.innerWidth < 768 ? 12 : 14,
                    fontWeight: 500,
                    lineHeight: 1.3
                  }}>
                    <div>{dateDebutShort} {heureDebut && `${heureDebut}`}</div>
                    <div style={{ fontSize: window.innerWidth < 768 ? 10 : 12, color: '#6c757d' }}>au {dateFinShort} {heureFin && `${heureFin}`}</div>
                  </div>
                </div>
              </div>

              {/* Durée */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: window.innerWidth < 768 ? '12px 16px' : '16px 20px',
                background: '#f8f9fa',
                borderRadius: 8,
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  background: '#ffffff',
                  borderRadius: 6,
                  padding: window.innerWidth < 768 ? 6 : 8,
                  border: '1px solid #dee2e6'
                }}>
                  <i className="fa fa-clock" style={{ color: '#495057', fontSize: 14 }}></i>
                </div>
                <div>
                  <div style={{
                    color: '#6c757d',
                    fontSize: window.innerWidth < 768 ? 10 : 12,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 2
                  }}>
                    Durée
                  </div>
                  <div style={{
                    color: '#2c3e50',
                    fontSize: window.innerWidth < 768 ? 14 : 16,
                    fontWeight: 600
                  }}>
                    {nbJours} jour{nbJours > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Prix estimé */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: window.innerWidth < 768 ? '12px 16px' : '16px 20px',
                background: '#e8f4fd',
                borderRadius: 8,
                border: '1px solid #b8daff'
              }}>
                <div style={{
                  background: '#ffffff',
                  borderRadius: 6,
                  padding: window.innerWidth < 768 ? 6 : 8,
                  border: '1px solid #0066cc'
                }}>
                  <i className="fa fa-euro-sign" style={{ color: '#0066cc', fontSize: 14 }}></i>
                </div>
                <div>
                  <div style={{
                    color: '#0066cc',
                    fontSize: window.innerWidth < 768 ? 10 : 12,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 2
                  }}>
                    À partir de
                  </div>
                  <div style={{
                    color: '#003d7a',
                    fontSize: window.innerWidth < 768 ? 18 : 20,
                    fontWeight: 700
                  }}>
                    {totalEstime} €
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres et tri rédesignés - Responsive */}
          <div className="row mb-4">
            <div className={window.innerWidth < 768 ? "col-12" : "col-md-8"}>
              <div style={{
                background: '#ffffff',
                padding: window.innerWidth < 768 ? '16px 20px' : '20px 24px',
                borderRadius: 8,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e1e5e9',
                marginBottom: window.innerWidth < 768 ? 16 : 0
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 16
                }}>
                  <FaFilter color="#495057" size={16} />
                  <span style={{ fontWeight: 600, color: '#2c3e50', fontSize: window.innerWidth < 768 ? 14 : 16 }}>Filtrer les résultats</span>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                  flexWrap: 'wrap',
                  gap: window.innerWidth < 768 ? 12 : 16
                }}>
                  <input
                    type="number"
                    placeholder="Prix maximum (€)"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 6,
                      border: '1px solid #ced4da',
                      fontSize: 14,
                      fontWeight: 500,
                      width: window.innerWidth < 768 ? '100%' : '140px',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0066cc';
                      e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 102, 204, 0.25)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ced4da';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Places min"
                    value={filters.minPlaces}
                    onChange={(e) => setFilters({...filters, minPlaces: e.target.value})}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 6,
                      border: '1px solid #ced4da',
                      fontSize: 14,
                      fontWeight: 500,
                      width: window.innerWidth < 768 ? '100%' : '110px',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0066cc';
                      e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 102, 204, 0.25)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ced4da';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Places max"
                    value={filters.maxPlaces}
                    onChange={(e) => setFilters({...filters, maxPlaces: e.target.value})}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 6,
                      border: '1px solid #ced4da',
                      fontSize: 14,
                      fontWeight: 500,
                      width: window.innerWidth < 768 ? '100%' : '110px',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0066cc';
                      e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 102, 204, 0.25)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#ced4da';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    onClick={() => setFilters({ maxPrice: '', minPlaces: '', maxPlaces: '' })}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 6,
                      border: '1px solid #dc3545',
                      background: '#ffffff',
                      color: '#dc3545',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      width: window.innerWidth < 768 ? '100%' : 'auto'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#dc3545';
                      e.target.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#ffffff';
                      e.target.style.color = '#dc3545';
                    }}
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
            <div className={window.innerWidth < 768 ? "col-12" : "col-md-4"}>
              <div style={{
                background: '#ffffff',
                padding: window.innerWidth < 768 ? '16px 20px' : '20px 24px',
                borderRadius: 8,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e1e5e9',
                height: 'fit-content'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 16
                }}>
                  <FaSort color="#495057" size={16} />
                  <span style={{ fontWeight: 600, color: '#2c3e50', fontSize: window.innerWidth < 768 ? 14 : 16 }}>Trier par</span>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                  gap: window.innerWidth < 768 ? 12 : 8
                }}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 6,
                      border: '1px solid #ced4da',
                      fontSize: 14,
                      fontWeight: 500,
                      flex: 1,
                      background: '#ffffff',
                      width: window.innerWidth < 768 ? '100%' : 'auto'
                    }}
                  >
                    <option value="prix">Prix</option>
                    <option value="nom">Nom</option>
                    <option value="places">Places</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 6,
                      border: '1px solid #ced4da',
                      fontSize: 14,
                      fontWeight: 500,
                      flex: 1,
                      background: '#ffffff',
                      width: window.innerWidth < 768 ? '100%' : 'auto'
                    }}
                  >
                    <option value="asc">Croissant</option>
                    <option value="desc">Décroissant</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 style={{ color: '#0a2342', fontWeight: 700, margin: 0 }}>
              {filteredResults.length} bateau{filteredResults.length > 1 ? 'x' : ''} trouvé{filteredResults.length > 1 ? 's' : ''}
            </h2>
          </div>

          {/* Chargement avec animations */}
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              gap: 30,
              padding: '60px 20px'
            }}>
              {/* Spinner personnalisé */}
              <div style={{
                position: 'relative',
                width: 80,
                height: 80
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  border: '6px solid #e6f0fa',
                  borderTop: '6px solid #1e90ff',
                  borderRadius: '50%',
                  animation: 'spin 1.2s linear infinite'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 24
                }}>
                  🚤
                </div>
              </div>

              {/* Message de chargement avec animation de typing */}
              <div style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#1e90ff',
                textAlign: 'center',
                animation: 'fadeInUp 0.8s ease-out'
              }}>
                🔍 Recherche de bateaux disponibles
                <span style={{ animation: 'dots 1.5s infinite' }}>...</span>
              </div>

              {/* Détails de la recherche */}
              <div style={{
                fontSize: 15,
                color: '#666',
                textAlign: 'center',
                maxWidth: 400,
                lineHeight: 1.6,
                animation: 'fadeInUp 0.8s ease-out 0.3s both'
              }}>
                📍 Ville : <strong>{ville}</strong><br />
                📅 Du {dateDebutShort} au {dateFinShort}<br />
                ⏱️ Analyse des créneaux disponibles...
              </div>

              {/* Barre de progression simulée */}
              <div style={{
                width: '300px',
                height: '4px',
                background: '#e6f0fa',
                borderRadius: '2px',
                overflow: 'hidden',
                animation: 'fadeInUp 0.8s ease-out 0.6s both'
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #1e90ff, #00bcd4)',
                  borderRadius: '2px',
                  animation: 'progress 2s ease-in-out infinite'
                }}></div>
              </div>

              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                @keyframes dots {
                  0%, 20% { opacity: 0; }
                  40% { opacity: 1; }
                  60% { opacity: 1; }
                  80%, 100% { opacity: 0; }
                }
                @keyframes fadeInUp {
                  from {
                    opacity: 0;
                    transform: translateY(30px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                @keyframes progress {
                  0% { transform: translateX(-100%); }
                  50% { transform: translateX(0%); }
                  100% { transform: translateX(100%); }
                }
                @keyframes cardAppear {
                  from {
                    opacity: 0;
                    transform: translateY(50px) scale(0.9);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                  }
                }
                @keyframes shimmer {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }
                @keyframes slideInFromLeft {
                  from {
                    opacity: 0;
                    transform: translateX(-50px);
                  }
                  to {
                    opacity: 1;
                    transform: translateX(0);
                  }
                }
                .card-animate {
                  animation: cardAppear 0.6s ease-out forwards;
                }
                .summary-animate {
                  animation: slideInFromLeft 0.8s ease-out forwards;
                }
                .filters-animate {
                  animation: fadeInUp 0.8s ease-out 0.2s both;
                }
              `}</style>
            </div>
          ) : (
            <>
              {/* Résultats avec animations d'entrée */}
              {!loading && filteredResults.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  animation: 'fadeInUp 0.8s ease-out'
                }}>
                  <div style={{ fontSize: 60, marginBottom: 20 }}>🔍</div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: '#0a2342', marginBottom: 10 }}>
                    Aucun bateau trouvé
                  </div>
                  <div style={{ fontSize: 16, color: '#666', maxWidth: 400, margin: '0 auto', lineHeight: 1.5 }}>
                    Aucun bateau n'est disponible pour vos critères de recherche. 
                    Essayez de modifier vos dates ou votre destination.
                  </div>
                </div>
              ) : (
                <div className="row" style={{gap: '24px 0'}}>
                  {filteredResults.map((bateau, index) => (
                    <div 
                      key={bateau.id} 
                      className="col-12 col-md-6 col-lg-4 mb-4 d-flex"
                      style={{
                        animation: `cardAppear 0.6s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <button
                        type="button"
                        className="card h-100 p-0 border-0 text-start w-100"
                        style={{
                          borderRadius: 16,
                          border: "1px solid #e1e5e9",
                          background: "#ffffff",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                          minHeight: 480,
                          height: 480,
                          cursor: "pointer",
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          overflow: "hidden",
                          position: "relative",
                          transform: 'translateY(0)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                          e.currentTarget.style.borderColor = '#6c757d';
                          const img = e.currentTarget.querySelector('.img-bateau');
                          if (img) img.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                          e.currentTarget.style.borderColor = '#e1e5e9';
                          const img = e.currentTarget.querySelector('.img-bateau');
                          if (img) img.style.transform = 'scale(1)';
                        }}
                        onClick={() => navigate(`/bateau/${bateau.id}?dateDebut=${dateDebut}&heureDebut=${heureDebut}&dateFin=${dateFin}&heureFin=${heureFin}&prix=${bateau.prix}`)}
                      >
                        {/* Image du bateau */}
                        <div style={{ position: "relative", width: "100%", height: 260, overflow: "hidden", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                          {bateau.photo && bateau.photo[0] && bateau.photo[0] !== "" && (
                            <img
                              src={bateau.photo[0]}
                              className="w-100 img-bateau"
                              alt={bateau.nom}
                              style={{
                                height: "100%",
                                width: "100%",
                                objectFit: "cover",
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                transition: "transform 0.3s ease"
                              }}
                            />
                          )}
                          
                          {/* Badge prix sobre */}
                          <div style={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            background: "rgba(255, 255, 255, 0.95)",
                            color: "#2c3e50",
                            padding: "8px 16px",
                            borderRadius: 8,
                            fontSize: 16,
                            fontWeight: 600,
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                            backdropFilter: "blur(10px)"
                          }}>
                            {bateau.prix * nbJours} €
                          </div>
                        </div>

                        {/* Contenu de la carte */}
                        <div className="p-4" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          {/* Nom du bateau */}
                          <div className="text-center mb-3" style={{ 
                            fontSize: 20, 
                            fontWeight: 600, 
                            color: "#2c3e50",
                            letterSpacing: -0.5
                          }}>
                            {bateau.nom}
                          </div>

                          {/* Caractéristiques techniques */}
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 12,
                            marginBottom: 16,
                            padding: "16px",
                            background: "#f8f9fa",
                            borderRadius: 8,
                            border: "1px solid #e9ecef"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                background: "#ffffff",
                                borderRadius: 6,
                                padding: 6,
                                border: "1px solid #dee2e6"
                              }}>
                                <FaUserFriends size={14} color="#495057" />
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: "#6c757d", textTransform: "uppercase", fontWeight: 500 }}>
                                  Places
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#2c3e50" }}>
                                  {bateau.places || 'N/A'}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                background: "#ffffff",
                                borderRadius: 6,
                                padding: 6,
                                border: "1px solid #dee2e6"
                              }}>
                                <FaTachometerAlt size={14} color="#495057" />
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: "#6c757d", textTransform: "uppercase", fontWeight: 500 }}>
                                  Vitesse
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#2c3e50" }}>
                                  {bateau.vitesse || 'N/A'} kn
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                background: "#ffffff",
                                borderRadius: 6,
                                padding: 6,
                                border: "1px solid #dee2e6"
                              }}>
                                <FaGasPump size={14} color="#495057" />
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: "#6c757d", textTransform: "uppercase", fontWeight: 500 }}>
                                  Carburant
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#2c3e50" }}>
                                  {bateau.carburant || 'N/A'}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                background: "#ffffff",
                                borderRadius: 6,
                                padding: 6,
                                border: "1px solid #dee2e6"
                              }}>
                                <FaCogs size={14} color="#495057" />
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: "#6c757d", textTransform: "uppercase", fontWeight: 500 }}>
                                  Moteur
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#2c3e50" }}>
                                  {bateau.moteur || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Créneaux horaires disponibles redesignés */}
                          {(() => {
                            const availableSlots = getBateauAvailableSlots(bateau, dateDebut, dateFin);
                            return availableSlots.length > 0 && (
                              <div 
                                className="mb-3" 
                                style={{ 
                                  background: "#f1f8ff", 
                                  borderRadius: 8, 
                                  padding: "12px", 
                                  border: "1px solid #d1ecf1",
                                  animation: 'fadeInUp 0.6s ease-out 0.3s both'
                                }}
                              >
                                <div style={{ 
                                  fontSize: 12, 
                                  fontWeight: 600, 
                                  color: "#0066cc", 
                                  marginBottom: 8, 
                                  textAlign: "center",
                                  textTransform: "uppercase",
                                  letterSpacing: 0.5
                                }}>
                                  <i className="fa fa-clock" style={{ marginRight: 6 }}></i>
                                  Horaires disponibles
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                                  {availableSlots.map((slot, slotIndex) => (
                                    <div
                                      key={slotIndex}
                                      style={{
                                        background: "#ffffff",
                                        border: "1px solid #0066cc",
                                        borderRadius: 4,
                                        padding: "4px 8px",
                                        fontSize: 10,
                                        fontWeight: 500,
                                        color: "#0066cc",
                                        textAlign: "center",
                                        minWidth: "65px",
                                        animation: `fadeInUp 0.4s ease-out ${slotIndex * 0.05}s both`,
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseEnter={e => {
                                        e.target.style.background = '#0066cc';
                                        e.target.style.color = '#ffffff';
                                      }}
                                      onMouseLeave={e => {
                                        e.target.style.background = '#ffffff';
                                        e.target.style.color = '#0066cc';
                                      }}
                                    >
                                      {slot.startTime}-{slot.endTime}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Description */}
                          {bateau.description && (
                            <div style={{ 
                              fontSize: 13, 
                              color: '#6c757d', 
                              textAlign: 'center', 
                              lineHeight: 1.4,
                              fontStyle: 'italic',
                              marginTop: 'auto'
                            }}>
                              {bateau.description.length > 85 ? bateau.description.substring(0, 85) + '...' : bateau.description}
                            </div>
                          )}

                          {/* Bouton d'action discret */}
                          <div style={{
                            marginTop: 16,
                            padding: "8px 0",
                            textAlign: "center",
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#6c757d",
                            borderTop: "1px solid #e9ecef"
                          }}>
                            Cliquer pour voir les détails →
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Composant de chargement amélioré */}
      {loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 20
        }}>
          <div style={{
            width: 60,
            height: 60,
            border: '4px solid #e6f0fa',
            borderTop: '4px solid #1e90ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#1e90ff',
            animation: 'pulse 2s infinite'
          }}>
            🔍 Recherche de bateaux disponibles...
          </div>
          <div style={{
            fontSize: 14,
            color: '#666',
            textAlign: 'center',
            maxWidth: 300,
            lineHeight: 1.5
          }}>
            Nous analysons les disponibilités pour {ville} du {formatShortDate(dateDebut)} au {formatShortDate(dateFin)}
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes slideInLeft {
              from {
                opacity: 0;
                transform: translateX(-30px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            .card-enter {
              animation: fadeInUp 0.6s ease-out forwards;
            }
            .summary-enter {
              animation: slideInLeft 0.8s ease-out forwards;
            }
            .filters-enter {
              animation: fadeInUp 0.8s ease-out forwards;
              animation-delay: 0.2s;
              opacity: 0;
            }
            .slot-enter {
              animation: fadeInUp 0.4s ease-out forwards;
            }
          `}</style>
        </div>
      )}

      {/* Skeleton loader pour les cartes */}
      {loading && (
        <div className="row" style={{gap: '24px 0'}}>
          {[...Array(6)].map((_, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-4 mb-4 d-flex">
              <div style={{
                borderRadius: 22,
                background: "#fff",
                boxShadow: "0 8px 32px rgba(30,60,60,0.13)",
                minHeight: 480,
                width: "100%",
                animation: 'pulse 1.5s ease-in-out infinite alternate'
              }}>
                <div style={{
                  height: 280,
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  borderTopLeftRadius: 22,
                  borderTopRightRadius: 22,
                  animation: 'shimmer 2s infinite'
                }}></div>
                <div className="p-3">
                  <div style={{
                    height: 20,
                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                    borderRadius: 10,
                    marginBottom: 15,
                    animation: 'shimmer 2s infinite'
                  }}></div>
                  <div style={{
                    height: 60,
                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                    borderRadius: 10,
                    animation: 'shimmer 2s infinite'
                  }}></div>
                </div>
              </div>
              <style>{`
                @keyframes shimmer {
                  0% { background-position: -200px 0; }
                  100% { background-position: calc(200px + 100%) 0; }
                }
              `}</style>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

