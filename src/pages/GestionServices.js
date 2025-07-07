import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function GestionServices() {
  const { currentUser } = useAuth();
  const [bateaux, setBateaux] = useState([]);
  const [selectedBateau, setSelectedBateau] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nouveauService, setNouveauService] = useState({
    nom: '',
    description: '',
    prix: '',
    categorie: ''
  });

  const categories = [
    { value: 'equipage', label: 'Équipage' },
    { value: 'equipement', label: 'Équipement' },
    { value: 'confort', label: 'Confort' },
    { value: 'technologie', label: 'Technologie' },
    { value: 'securite', label: 'Sécurité' },
    { value: 'service', label: 'Service' },
    { value: 'carburant', label: 'Carburant' },
    { value: 'restauration', label: 'Restauration' }
  ];

  useEffect(() => {
    fetchBateauxAgence();
  }, [currentUser]);

  const fetchBateauxAgence = async () => {
    if (!currentUser) return;
    
    try {
      const q = query(collection(db, "bateaux"), where("proprietaire", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const bateauxData = [];
      
      querySnapshot.forEach((doc) => {
        bateauxData.push({ id: doc.id, ...doc.data() });
      });
      
      setBateaux(bateauxData);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des bateaux:", error);
      setLoading(false);
    }
  };

  const ajouterService = async () => {
    if (!selectedBateau || !nouveauService.nom || !nouveauService.prix) return;

    try {
      const serviceId = Date.now().toString();
      const service = {
        id: serviceId,
        nom: nouveauService.nom,
        description: nouveauService.description,
        prix: parseFloat(nouveauService.prix),
        categorie: nouveauService.categorie
      };

      const servicesActuels = selectedBateau.services || [];
      const nouveauxServices = [...servicesActuels, service];

      await updateDoc(doc(db, "bateaux", selectedBateau.id), {
        services: nouveauxServices
      });

      // Mettre à jour l'état local
      const bateauxMisAJour = bateaux.map(bateau => 
        bateau.id === selectedBateau.id 
          ? { ...bateau, services: nouveauxServices }
          : bateau
      );
      setBateaux(bateauxMisAJour);
      setSelectedBateau({ ...selectedBateau, services: nouveauxServices });

      // Réinitialiser le formulaire
      setNouveauService({
        nom: '',
        description: '',
        prix: '',
        categorie: ''
      });

      alert('Service ajouté avec succès!');
    } catch (error) {
      console.error("Erreur lors de l'ajout du service:", error);
      alert('Erreur lors de l\'ajout du service');
    }
  };

  const supprimerService = async (serviceId) => {
    if (!selectedBateau) return;

    try {
      const servicesActuels = selectedBateau.services || [];
      const nouveauxServices = servicesActuels.filter(service => service.id !== serviceId);

      await updateDoc(doc(db, "bateaux", selectedBateau.id), {
        services: nouveauxServices
      });

      // Mettre à jour l'état local
      const bateauxMisAJour = bateaux.map(bateau => 
        bateau.id === selectedBateau.id 
          ? { ...bateau, services: nouveauxServices }
          : bateau
      );
      setBateaux(bateauxMisAJour);
      setSelectedBateau({ ...selectedBateau, services: nouveauxServices });

      alert('Service supprimé avec succès!');
    } catch (error) {
      console.error("Erreur lors de la suppression du service:", error);
      alert('Erreur lors de la suppression du service');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '30px', color: '#333' }}>Gestion des Services Supplémentaires</h2>

      {/* Sélection du bateau */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#555' }}>Sélectionnez un bateau</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {bateaux.map(bateau => (
            <div
              key={bateau.id}
              style={{
                border: selectedBateau?.id === bateau.id ? '2px solid #1976d2' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                cursor: 'pointer',
                backgroundColor: selectedBateau?.id === bateau.id ? '#f5f5f5' : '#fff',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedBateau(bateau)}
            >
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{bateau.nom}</h4>
              <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                {bateau.services?.length || 0} service(s) configuré(s)
              </p>
            </div>
          ))}
        </div>
      </div>

      {selectedBateau && (
        <>
          {/* Services actuels */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', color: '#555' }}>
              Services actuels - {selectedBateau.nom}
            </h3>
            {selectedBateau.services && selectedBateau.services.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '15px' }}>
                {selectedBateau.services.map(service => (
                  <div
                    key={service.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      backgroundColor: '#fff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{service.nom}</h4>
                        <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                          {service.description}
                        </p>
                        <div style={{ display: 'flex', gap: '15px', fontSize: '14px' }}>
                          <span style={{ color: '#1976d2', fontWeight: 'bold' }}>
                            {service.prix}€/jour
                          </span>
                          <span style={{ color: '#666' }}>
                            {categories.find(c => c.value === service.categorie)?.label || service.categorie}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => supprimerService(service.id)}
                        style={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                Aucun service configuré pour ce bateau.
              </p>
            )}
          </div>

          {/* Formulaire d'ajout de service */}
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            borderRadius: '8px', 
            padding: '20px',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Ajouter un nouveau service</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Nom du service"
                value={nouveauService.nom}
                onChange={(e) => setNouveauService({...nouveauService, nom: e.target.value})}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
              <input
                type="number"
                placeholder="Prix par jour (€)"
                value={nouveauService.prix}
                onChange={(e) => setNouveauService({...nouveauService, prix: e.target.value})}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <select
                value={nouveauService.categorie}
                onChange={(e) => setNouveauService({...nouveauService, categorie: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <textarea
                placeholder="Description du service"
                value={nouveauService.description}
                onChange={(e) => setNouveauService({...nouveauService, description: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              onClick={ajouterService}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Ajouter le service
            </button>
          </div>
        </>
      )}
    </div>
  );
}