import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { FaUserFriends, FaTachometerAlt, FaGasPump, FaCogs, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import logo from "../logo.svg";
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from "../components/NavBar";

export default function BateauDetails() {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dateDebut = queryParams.get("dateDebut") || "";
  const heureDebut = queryParams.get("heureDebut") || "";
  const dateFin = queryParams.get("dateFin") || "";
  const heureFin = queryParams.get("heureFin") || "";
  const [bateau, setBateau] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [servicesSelectionnes, setServicesSelectionnes] = useState([]);
  const [servicesDisponibles, setServicesDisponibles] = useState([]);
  const [tousLesServices, setTousLesServices] = useState([]);

  useEffect(() => {
    async function fetchBateau() {
      const docRef = doc(db, "bateaux", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBateau(docSnap.data());
        
        // Charger les services supplémentaires pour ce bateau
        if (docSnap.data().services) {
          setServicesDisponibles(docSnap.data().services);
        }
      }
      setLoading(false);
    }
    fetchBateau();
  }, [id]);

  // Charger tous les services depuis Firebase
  useEffect(() => {
    async function fetchTousLesServices() {
      try {
        const servicesQuery = query(collection(db, 'services'));
        const snap = await getDocs(servicesQuery);
        const services = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTousLesServices(services);
      } catch (error) {
        console.error("Erreur lors du chargement des services:", error);
      }
    }
    fetchTousLesServices();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calcul du nombre de jours entre dateDebut et dateFin
  function getDaysDiff(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = d2 - d1;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
  
  const prix = parseFloat(queryParams.get("prix")) || (bateau ? bateau.prix : 0);
  const nbJours = (dateDebut && dateFin) ? getDaysDiff(dateDebut, dateFin) : 1;
  
  // Calcul du total avec services
  const prixServices = servicesSelectionnes.reduce((total, service) => {
    return total + (service.prix * nbJours);
  }, 0);
  const total = (prix * nbJours) + prixServices;

  function handleReservation() {
    const params = new URLSearchParams({
      dateDebut,
      heureDebut,
      dateFin,
      heureFin,
      prix: bateau.prix,
      bateauId: id,
      bateauNom: bateau.nom,
      bateauVille: bateau.Ville,
      services: JSON.stringify(servicesSelectionnes.map(s => ({
        id: s.id,
        nom: s.nom,
        prix: s.prix,
        description: s.description
      }))),
      totalServices: prixServices,
      totalGeneral: total
    });
    window.location.href = `/confirmation?${params.toString()}`;
  }

  // Gestion des services supplémentaires
  const handleServiceToggle = (service) => {
    setServicesSelectionnes(prev => {
      const existe = prev.find(s => s.id === service.id);
      if (existe) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  // Définir les images avant les fonctions du slider
  const images = (bateau && bateau.photo && Array.isArray(bateau.photo)) ? bateau.photo.filter(img => img && img !== "") : [];

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (loading) return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ textAlign: 'center', color: '#6c757d' }}>
        <div className="spinner-border text-muted" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p style={{ marginTop: 20, fontSize: 16 }}>Chargement du bateau...</p>
      </div>
    </div>
  );

  if (!bateau) return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ 
        background: '#fff', 
        padding: '40px', 
        borderRadius: 8, 
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: 400,
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ color: '#495057', marginBottom: 16, fontWeight: 600 }}>Bateau introuvable</h3>
        <p style={{ color: '#6c757d', margin: 0 }}>Le bateau que vous recherchez n'existe pas ou n'est plus disponible.</p>
      </div>
    </div>
  );

  return (
    <>
      <NavBar />
      <div style={{ 
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        paddingTop: 80,
        paddingBottom: 40
      }}>
        <div className="container">
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            border: '1px solid #e9ecef',
            maxWidth: 1000,
            margin: '0 auto'
          }}>
            
            {/* Header sobre */}
            <div style={{ 
              padding: '40px 40px 30px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h1 style={{ 
                    fontSize: isMobile ? 24 : 32, 
                    fontWeight: 600, 
                    color: '#343a40',
                    margin: 0,
                    marginBottom: 8
                  }}>
                    {bateau.nom}
                  </h1>
                  <p style={{ 
                    fontSize: 16, 
                    color: '#6c757d',
                    margin: 0,
                    fontWeight: 500
                  }}>
                    <FaMapMarkerAlt style={{ marginRight: 8, color: '#495057' }} />
                    {bateau.Ville}
                  </p>
                </div>
                <div className="col-md-4 text-md-end">
                  <div style={{ 
                    fontSize: 28, 
                    fontWeight: 700, 
                    color: '#343a40'
                  }}>
                    {bateau.prix}€
                    <span style={{ 
                      fontSize: 16, 
                      color: '#6c757d', 
                      fontWeight: 500 
                    }}>
                      /jour
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider d'images sobre */}
            {images.length > 0 && (
              <div style={{ 
                position: 'relative',
                height: isMobile ? 300 : 400,
                backgroundColor: '#f8f9fa',
                overflow: 'hidden'
              }}>
                <img 
                  src={images[currentImageIndex]} 
                  alt={bateau.nom} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'opacity 0.3s ease'
                  }} 
                />
                
                {/* Contrôles de navigation */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      style={{
                        position: 'absolute',
                        left: 20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: '1px solid #dee2e6',
                        borderRadius: '50%',
                        width: 50,
                        height: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        zIndex: 10
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#fff';
                        e.target.style.transform = 'translateY(-50%) scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(255,255,255,0.9)';
                        e.target.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      <FaChevronLeft style={{ color: '#495057' }} />
                    </button>
                    
                    <button 
                      onClick={nextImage}
                      style={{
                        position: 'absolute',
                        right: 20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: '1px solid #dee2e6',
                        borderRadius: '50%',
                        width: 50,
                        height: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        zIndex: 10
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#fff';
                        e.target.style.transform = 'translateY(-50%) scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(255,255,255,0.9)';
                        e.target.style.transform = 'translateY(-50%) scale(1)';
                      }}
                    >
                      <FaChevronRight style={{ color: '#495057' }} />
                    </button>
                  </>
                )}

                {/* Indicateurs */}
                {images.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 8,
                    zIndex: 10
                  }}>
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          border: '2px solid #fff',
                          backgroundColor: index === currentImageIndex ? '#495057' : 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Logo discret */}
                <img 
                  src={logo} 
                  alt="BB YACHTS" 
                  style={{ 
                    position: 'absolute', 
                    top: 20, 
                    right: 20, 
                    height: 40,
                    opacity: 0.8,
                    zIndex: 10
                  }} 
                />
              </div>
            )}

            {/* Caractéristiques sobres */}
            <div style={{ 
              padding: '40px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <h3 style={{ 
                fontSize: 20, 
                fontWeight: 600, 
                color: '#343a40', 
                marginBottom: 30,
                textAlign: 'center'
              }}>
                Caractéristiques
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', 
                gap: 20
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: 8,
                  border: '1px solid #e9ecef'
                }}>
                  <FaUserFriends size={24} style={{ color: '#6c757d', marginBottom: 12 }} />
                  <div style={{ fontSize: 12, color: '#6c757d', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
                    Passagers
                  </div>
                  <div style={{ fontSize: 16, color: '#343a40', fontWeight: 600 }}>
                    {bateau.places}
                  </div>
                </div>
                
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: 8,
                  border: '1px solid #e9ecef'
                }}>
                  <FaCogs size={24} style={{ color: '#6c757d', marginBottom: 12 }} />
                  <div style={{ fontSize: 12, color: '#6c757d', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
                    Puissance
                  </div>
                  <div style={{ fontSize: 16, color: '#343a40', fontWeight: 600 }}>
                    {bateau.moteur} cv
                  </div>
                </div>
                
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: 8,
                  border: '1px solid #e9ecef'
                }}>
                  <FaGasPump size={24} style={{ color: '#6c757d', marginBottom: 12 }} />
                  <div style={{ fontSize: 12, color: '#6c757d', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
                    Carburant
                  </div>
                  <div style={{ fontSize: 16, color: '#343a40', fontWeight: 600 }}>
                    {bateau.carburant}L
                  </div>
                </div>
                
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: 8,
                  border: '1px solid #e9ecef'
                }}>
                  <FaTachometerAlt size={24} style={{ color: '#6c757d', marginBottom: 12 }} />
                  <div style={{ fontSize: 12, color: '#6c757d', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
                    Vitesse
                  </div>
                  <div style={{ fontSize: 16, color: '#343a40', fontWeight: 600 }}>
                    {bateau.vitesse} kn
                  </div>
                </div>
              </div>
            </div>

            {/* Section Services Supplémentaires */}
            {servicesDisponibles.length > 0 && (
              <div style={{ 
                padding: '40px',
                borderBottom: '1px solid #e9ecef',
                backgroundColor: '#ffffff'
              }}>
                <h3 style={{ 
                  fontSize: 20, 
                  fontWeight: 600, 
                  color: '#343a40', 
                  marginBottom: 30,
                  textAlign: 'center'
                }}>
                  Services Supplémentaires
                </h3>
                <p style={{ 
                  textAlign: 'center',
                  color: '#6c757d',
                  marginBottom: 30,
                  fontSize: 14
                }}>
                  Sélectionnez les services additionnels pour enrichir votre expérience
                </p>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: 16,
                  maxWidth: 800,
                  margin: '0 auto'
                }}>
                  {servicesDisponibles.map((service, index) => {
                    const isSelected = servicesSelectionnes.find(s => s.id === service.id);
                    return (
                      <div 
                        key={index} 
                        onClick={() => handleServiceToggle(service)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '20px',
                          backgroundColor: isSelected ? '#e8f4fd' : '#f8f9fa',
                          borderRadius: 8,
                          border: `2px solid ${isSelected ? '#1976d2' : '#e9ecef'}`,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#f0f0f0';
                            e.currentTarget.style.borderColor = '#d0d0d0';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                            e.currentTarget.style.borderColor = '#e9ecef';
                          }
                        }}
                      >
                        {/* Checkbox personnalisée */}
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          border: `2px solid ${isSelected ? '#1976d2' : '#6c757d'}`,
                          backgroundColor: isSelected ? '#1976d2' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 16,
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}>
                          {isSelected && (
                            <span style={{
                              color: '#fff',
                              fontSize: 14,
                              fontWeight: 'bold'
                            }}>
                              ✓
                            </span>
                          )}
                        </div>

                        {/* Contenu du service */}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: '#343a40',
                            marginBottom: 4
                          }}>
                            {service.nom}
                          </div>
                          <div style={{
                            fontSize: 14,
                            color: '#6c757d',
                            marginBottom: 8
                          }}>
                            {service.description}
                          </div>
                          <div style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: '#1976d2'
                          }}>
                            {service.prix}€ / jour
                          </div>
                        </div>

                        {/* Badge catégorie */}
                        {service.categorie && (
                          <div style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: isSelected ? '#1976d2' : '#6c757d',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: 12,
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {service.categorie}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Récapitulatif des services sélectionnés */}
                {servicesSelectionnes.length > 0 && (
                  <div style={{
                    marginTop: 30,
                    padding: '20px',
                    backgroundColor: '#e8f4fd',
                    borderRadius: 8,
                    border: '1px solid #1976d2',
                    maxWidth: 600,
                    margin: '30px auto 0'
                  }}>
                    <h4 style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#1976d2',
                      marginBottom: 15,
                      textAlign: 'center'
                    }}>
                      Services sélectionnés
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {servicesSelectionnes.map((service, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 14,
                          color: '#343a40'
                        }}>
                          <span>{service.nom}</span>
                          <span style={{ fontWeight: 600 }}>
                            {service.prix}€/jour
                          </span>
                        </div>
                      ))}
                    </div>
                    <hr style={{ 
                      margin: '15px 0', 
                      borderColor: '#1976d2',
                      opacity: 0.3
                    }} />
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#1976d2'
                    }}>
                      <span>Total services:</span>
                      <span>{prixServices}€/jour</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section Nos Services */}
            {tousLesServices.length > 0 && (
              <div style={{ 
                padding: '40px',
                borderBottom: '1px solid #e9ecef',
                backgroundColor: '#ffffff'
              }}>
                <h3 style={{ 
                  fontSize: 20, 
                  fontWeight: 600, 
                  color: '#343a40', 
                  marginBottom: 30,
                  textAlign: 'center'
                }}>
                  Nos Services
                </h3>
                <p style={{ 
                  textAlign: 'center',
                  color: '#6c757d',
                  marginBottom: 30,
                  fontSize: 14
                }}>
                  Découvrez tous les services additionnels que nous proposons
                </p>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: 16,
                  maxWidth: 1000,
                  margin: '0 auto'
                }}>
                  {tousLesServices.map((service, index) => {
                    const isSelected = servicesSelectionnes.find(s => s.id === service.id);
                    return (
                      <div 
                        key={index} 
                        onClick={() => handleServiceToggle(service)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '20px',
                          backgroundColor: isSelected ? '#e8f4fd' : '#f8f9fa',
                          borderRadius: 8,
                          border: `2px solid ${isSelected ? '#1976d2' : '#e9ecef'}`,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#f0f0f0';
                            e.currentTarget.style.borderColor = '#d0d0d0';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                            e.currentTarget.style.borderColor = '#e9ecef';
                          }
                        }}
                      >
                        {/* Checkbox personnalisée */}
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          border: `2px solid ${isSelected ? '#1976d2' : '#6c757d'}`,
                          backgroundColor: isSelected ? '#1976d2' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 16,
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}>
                          {isSelected && (
                            <span style={{
                              color: '#fff',
                              fontSize: 14,
                              fontWeight: 'bold'
                            }}>
                              ✓
                            </span>
                          )}
                        </div>

                        {/* Contenu du service */}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: '#343a40',
                            marginBottom: 4
                          }}>
                            {service.nom}
                          </div>
                          <div style={{
                            fontSize: 14,
                            color: '#6c757d',
                            marginBottom: 8
                          }}>
                            {service.description}
                          </div>
                          <div style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: '#1976d2'
                          }}>
                            {service.prix}€ / jour
                          </div>
                        </div>

                        {/* Badge catégorie */}
                        {service.categorie && (
                          <div style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: isSelected ? '#1976d2' : '#6c757d',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: 12,
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {service.categorie}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Récapitulatif des services sélectionnés depuis "Nos Services" */}
                {servicesSelectionnes.length > 0 && (
                  <div style={{
                    marginTop: 30,
                    padding: '20px',
                    backgroundColor: '#e8f4fd',
                    borderRadius: 8,
                    border: '1px solid #1976d2',
                    maxWidth: 600,
                    margin: '30px auto 0'
                  }}>
                    <h4 style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#1976d2',
                      marginBottom: 15,
                      textAlign: 'center'
                    }}>
                      Services sélectionnés
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {servicesSelectionnes.map((service, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 14,
                          color: '#343a40'
                        }}>
                          <span>{service.nom}</span>
                          <span style={{ fontWeight: 600 }}>
                            {service.prix}€/jour
                          </span>
                        </div>
                      ))}
                    </div>
                    <hr style={{ 
                      margin: '15px 0', 
                      borderColor: '#1976d2',
                      opacity: 0.3
                    }} />
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#1976d2'
                    }}>
                      <span>Total services:</span>
                      <span>{prixServices}€/jour</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Formulaire de réservation sobre */}
            <div style={{ 
              padding: '40px',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <h3 style={{ 
                  fontSize: 24, 
                  fontWeight: 600, 
                  marginBottom: 30,
                  textAlign: 'center',
                  color: '#343a40'
                }}>
                  Réserver ce bateau
                </h3>

                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 8,
                  padding: '25px',
                  border: '1px solid #e9ecef'
                }}>
                  {/* Récapitulatif des prix */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: 6,
                    padding: '20px',
                    marginBottom: 20
                  }}>
                    <h5 style={{ 
                      fontSize: 16, 
                      fontWeight: 600, 
                      marginBottom: 15,
                      color: '#343a40'
                    }}>
                      Récapitulatif
                    </h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: '#6c757d' }}>Location ({nbJours} jour{nbJours > 1 ? 's' : ''})</span>
                      <span style={{ fontWeight: 600, color: '#343a40' }}>{prix * nbJours}€</span>
                    </div>
                    {servicesSelectionnes.length > 0 && (
                      <>
                        {servicesSelectionnes.map((service, index) => (
                          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ color: '#6c757d' }}>{service.nom} ({nbJours} jour{nbJours > 1 ? 's' : ''})</span>
                            <span style={{ fontWeight: 600, color: '#343a40' }}>{service.prix * nbJours}€</span>
                          </div>
                        ))}
                      </>
                    )}
                    <hr style={{ margin: '15px 0', borderColor: '#e9ecef' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
                      <span style={{ color: '#343a40' }}>Total</span>
                      <span style={{ color: '#1976d2' }}>{total}€</span>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleReservation}
                    style={{ 
                      width: '100%',
                      padding: '16px',
                      backgroundColor: '#343a40',
                      border: 'none',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#23272b';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#343a40';
                    }}
                  >
                    Confirmer la réservation
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section autres bateaux sobre */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: '40px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            border: '1px solid #e9ecef',
            marginTop: 30,
            maxWidth: 1000,
            margin: '30px auto 0'
          }}>
            <h3 style={{ 
              fontSize: 24, 
              fontWeight: 600, 
              color: '#343a40',
              textAlign: 'center',
              marginBottom: 40
            }}>
              Autres bateaux disponibles
            </h3>
            {bateau && bateau.Ville && (
              <AutresBateaux currentId={id} ville={bateau.Ville} isMobile={isMobile} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Composant AutresBateaux sobre
function AutresBateaux({ currentId, ville, isMobile }) {
  const [bateaux, setBateaux] = React.useState([]);
  
  React.useEffect(() => {
    async function fetchBateaux() {
      const q = query(collection(db, "bateaux"), where("Ville", "==", ville));
      const snap = await getDocs(q);
      setBateaux(snap.docs.filter(doc => doc.id !== currentId).map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchBateaux();
  }, [ville, currentId]);

  const handleBateauClick = (bateauId) => {
    // Redirection vers la page de détails du bateau sélectionné
    window.location.href = `/bateau/${bateauId}`;
  };
  
  if (bateaux.length === 0) return (
    <div style={{ 
      textAlign: 'center',
      padding: '40px 20px',
      color: '#6c757d'
    }}>
      <p style={{ fontSize: 16, margin: 0 }}>Aucun autre bateau disponible dans cette ville.</p>
    </div>
  );
  
  return (
    <div className="row g-4">
      {bateaux.slice(0, 3).map(bateau => (
        <div key={bateau.id} className="col-md-4">
          <div 
            onClick={() => handleBateauClick(bateau.id)}
            style={{
              backgroundColor: '#f8f9fa',
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid #e9ecef',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
              height: '100%'
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}>
            <div style={{ position: 'relative', height: 200 }}>
              {bateau.photo && bateau.photo[0] && (
                <img 
                  src={bateau.photo[0]} 
                  alt={bateau.nom} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }} 
                />
              )}
              <div style={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: '#343a40',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 4,
                fontSize: 14,
                fontWeight: 600
              }}>
                {bateau.prix}€/jour
              </div>
            </div>
            
            <div style={{ padding: '20px' }}>
              <h5 style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                color: '#343a40',
                marginBottom: 16,
                textAlign: 'center'
              }}>
                {bateau.nom}
              </h5>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-around',
                fontSize: 12,
                color: '#6c757d',
                marginBottom: 16
              }}>
                <div style={{ textAlign: 'center' }}>
                  <FaUserFriends style={{ marginBottom: 4 }} />
                  <div>{bateau.places}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <FaCogs style={{ marginBottom: 4 }} />
                  <div>{bateau.moteur}cv</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <FaTachometerAlt style={{ marginBottom: 4 }} />
                  <div>{bateau.vitesse}kn</div>
                </div>
              </div>
              
              {/* Bouton pour clarifier l'action */}
              <div style={{
                textAlign: 'center',
                padding: '8px 16px',
                backgroundColor: '#343a40',
                color: '#fff',
                borderRadius: 4,
                fontSize: 14,
                fontWeight: 500,
                transition: 'background-color 0.2s ease'
              }}>
                Voir les détails
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}