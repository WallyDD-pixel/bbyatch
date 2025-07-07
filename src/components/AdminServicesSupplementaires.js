import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import './AdminServicesSupplementaires.css';

export default function AdminServicesSupplementaires() {
  const [services, setServices] = useState([]);
  const [bateaux, setBateaux] = useState([]);
  const [bateauSelectionne, setBateauSelectionne] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [nouveauService, setNouveauService] = useState({
    nom: '',
    description: '',
    prix: '',
    categorie: 'Équipement'
  });

  const categories = ['Équipement', 'Personnel', 'Restauration', 'Détente', 'Divertissement', 'Carburant', 'Confort', 'Personnalisé'];

  useEffect(() => {
    chargerBateaux();
  }, []);

  useEffect(() => {
    if (bateauSelectionne) {
      chargerServicesduBateau(bateauSelectionne);
    }
  }, [bateauSelectionne]);

  const chargerBateaux = async () => {
    try {
      const bateauxQuery = query(collection(db, 'bateaux'));
      const bateauxSnapshot = await getDocs(bateauxQuery);
      const bateauxData = bateauxSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBateaux(bateauxData);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des bateaux:', error);
      setLoading(false);
    }
  };

  const chargerServicesduBateau = async (bateauId) => {
    try {
      const bateauDoc = await getDocs(query(collection(db, 'bateaux'), where('__name__', '==', bateauId)));
      if (!bateauDoc.empty) {
        const bateauData = bateauDoc.docs[0].data();
        setServices(bateauData.services || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
    }
  };

  const ajouterService = async () => {
    if (!bateauSelectionne || !nouveauService.nom || !nouveauService.prix) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const serviceAvecId = {
        ...nouveauService,
        id: Date.now().toString(),
        prix: parseFloat(nouveauService.prix)
      };

      const bateauRef = doc(db, 'bateaux', bateauSelectionne);
      const nouveauxServices = [...services, serviceAvecId];
      
      await updateDoc(bateauRef, {
        services: nouveauxServices
      });

      setServices(nouveauxServices);
      setNouveauService({ nom: '', description: '', prix: '', categorie: 'Équipement' });
      setShowAddForm(false);
      
      alert('Service ajouté avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du service:', error);
      alert('Erreur lors de l\'ajout du service');
    }
  };

  const modifierService = async (serviceId, serviceModifie) => {
    try {
      const nouveauxServices = services.map(service => 
        service.id === serviceId ? { ...serviceModifie, prix: parseFloat(serviceModifie.prix) } : service
      );

      const bateauRef = doc(db, 'bateaux', bateauSelectionne);
      await updateDoc(bateauRef, {
        services: nouveauxServices
      });

      setServices(nouveauxServices);
      setEditingService(null);
      
      alert('Service modifié avec succès !');
    } catch (error) {
      console.error('Erreur lors de la modification du service:', error);
      alert('Erreur lors de la modification du service');
    }
  };

  const supprimerService = async (serviceId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    try {
      const nouveauxServices = services.filter(service => service.id !== serviceId);

      const bateauRef = doc(db, 'bateaux', bateauSelectionne);
      await updateDoc(bateauRef, {
        services: nouveauxServices
      });

      setServices(nouveauxServices);
      
      alert('Service supprimé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression du service:', error);
      alert('Erreur lors de la suppression du service');
    }
  };

  if (loading) {
    return (
      <div className="admin-services-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-services-container">
      <div className="admin-header">
        <h1>Gestion des Services Supplémentaires</h1>
        <p>Gérez les services proposés par votre agence pour chaque bateau</p>
      </div>

      {/* Sélection du bateau */}
      <div className="bateau-selector">
        <label htmlFor="bateau-select">Sélectionner un bateau :</label>
        <select 
          id="bateau-select"
          value={bateauSelectionne} 
          onChange={(e) => setBateauSelectionne(e.target.value)}
          className="form-select"
        >
          <option value="">-- Choisir un bateau --</option>
          {bateaux.map(bateau => (
            <option key={bateau.id} value={bateau.id}>
              {bateau.nom} - {bateau.Ville}
            </option>
          ))}
        </select>
      </div>

      {bateauSelectionne && (
        <div className="services-section">
          <div className="section-header">
            <h2>Services du bateau sélectionné</h2>
            <button 
              className="btn-add-service"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <FaPlus /> Ajouter un service
            </button>
          </div>

          {/* Formulaire d'ajout */}
          {showAddForm && (
            <div className="service-form">
              <h3>Nouveau service</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nom du service *</label>
                  <input
                    type="text"
                    value={nouveauService.nom}
                    onChange={(e) => setNouveauService({...nouveauService, nom: e.target.value})}
                    placeholder="Ex: Skipper professionnel"
                  />
                </div>
                <div className="form-group">
                  <label>Prix par jour (€) *</label>
                  <input
                    type="number"
                    value={nouveauService.prix}
                    onChange={(e) => setNouveauService({...nouveauService, prix: e.target.value})}
                    placeholder="Ex: 150"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Catégorie</label>
                  <select
                    value={nouveauService.categorie}
                    onChange={(e) => setNouveauService({...nouveauService, categorie: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={nouveauService.description}
                    onChange={(e) => setNouveauService({...nouveauService, description: e.target.value})}
                    placeholder="Description détaillée du service..."
                    rows="3"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button onClick={ajouterService} className="btn-save">
                  <FaSave /> Ajouter
                </button>
                <button onClick={() => setShowAddForm(false)} className="btn-cancel">
                  <FaTimes /> Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des services */}
          <div className="services-list">
            {services.length === 0 ? (
              <div className="no-services">
                <p>Aucun service configuré pour ce bateau</p>
              </div>
            ) : (
              services.map(service => (
                <div key={service.id} className="service-card">
                  {editingService === service.id ? (
                    <EditServiceForm
                      service={service}
                      categories={categories}
                      onSave={(serviceModifie) => modifierService(service.id, serviceModifie)}
                      onCancel={() => setEditingService(null)}
                    />
                  ) : (
                    <ServiceDisplay
                      service={service}
                      onEdit={() => setEditingService(service.id)}
                      onDelete={() => supprimerService(service.id)}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher un service
function ServiceDisplay({ service, onEdit, onDelete }) {
  return (
    <div className="service-display">
      <div className="service-header">
        <h4>{service.nom}</h4>
        <span className="service-category">{service.categorie}</span>
      </div>
      <p className="service-description">{service.description}</p>
      <div className="service-footer">
        <span className="service-price">{service.prix}€ / jour</span>
        <div className="service-actions">
          <button onClick={onEdit} className="btn-edit">
            <FaEdit />
          </button>
          <button onClick={onDelete} className="btn-delete">
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant pour éditer un service
function EditServiceForm({ service, categories, onSave, onCancel }) {
  const [serviceModifie, setServiceModifie] = useState({
    nom: service.nom,
    description: service.description,
    prix: service.prix.toString(),
    categorie: service.categorie
  });

  const handleSave = () => {
    if (!serviceModifie.nom || !serviceModifie.prix) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    onSave(serviceModifie);
  };

  return (
    <div className="edit-service-form">
      <div className="form-grid">
        <div className="form-group">
          <label>Nom du service *</label>
          <input
            type="text"
            value={serviceModifie.nom}
            onChange={(e) => setServiceModifie({...serviceModifie, nom: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label>Prix par jour (€) *</label>
          <input
            type="number"
            value={serviceModifie.prix}
            onChange={(e) => setServiceModifie({...serviceModifie, prix: e.target.value})}
            min="0"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label>Catégorie</label>
          <select
            value={serviceModifie.categorie}
            onChange={(e) => setServiceModifie({...serviceModifie, categorie: e.target.value})}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="form-group full-width">
          <label>Description</label>
          <textarea
            value={serviceModifie.description}
            onChange={(e) => setServiceModifie({...serviceModifie, description: e.target.value})}
            rows="3"
          />
        </div>
      </div>
      <div className="form-actions">
        <button onClick={handleSave} className="btn-save">
          <FaSave /> Sauvegarder
        </button>
        <button onClick={onCancel} className="btn-cancel">
          <FaTimes /> Annuler
        </button>
      </div>
    </div>
  );
}