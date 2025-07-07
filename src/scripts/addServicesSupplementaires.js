import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, arrayUnion, getDocs, query, where } from 'firebase/firestore';

// Services supplémentaires par défaut proposés par les agences
const servicesParDefaut = [
  {
    id: 'skipper',
    nom: 'Skipper professionnel',
    description: 'Skipper expérimenté pour vous accompagner et vous faire découvrir les plus beaux spots',
    prix: 150,
    categorie: 'Personnel'
  },
  {
    id: 'equipement-plongee',
    nom: 'Équipement de plongée',
    description: 'Masques, tubas, palmes et gilets de sauvetage pour toute la famille',
    prix: 25,
    categorie: 'Équipement'
  },
  {
    id: 'pack-pique-nique',
    nom: 'Pack pique-nique',
    description: 'Panier repas complet avec boissons, sandwichs et fruits frais',
    prix: 35,
    categorie: 'Restauration'
  },
  {
    id: 'glaciere',
    nom: 'Glacière équipée',
    description: 'Grande glacière avec glaçons et rafraîchissements',
    prix: 15,
    categorie: 'Équipement'
  },
  {
    id: 'equipement-peche',
    nom: 'Matériel de pêche',
    description: 'Cannes à pêche, appâts et équipement complet pour la pêche en mer',
    prix: 30,
    categorie: 'Équipement'
  },
  {
    id: 'tapis-flottant',
    nom: 'Tapis flottant géant',
    description: 'Tapis flottant gonflable pour se détendre sur l\'eau',
    prix: 20,
    categorie: 'Détente'
  },
  {
    id: 'enceinte-waterproof',
    nom: 'Enceinte waterproof',
    description: 'Enceinte Bluetooth étanche pour votre ambiance musicale',
    prix: 12,
    categorie: 'Divertissement'
  },
  {
    id: 'carburant-extra',
    nom: 'Carburant supplémentaire',
    description: 'Réservoir de carburant additionnel pour des sorties prolongées',
    prix: 45,
    categorie: 'Carburant'
  },
  {
    id: 'parasol-marin',
    nom: 'Parasol marin',
    description: 'Protection solaire amovible pour plus de confort à bord',
    prix: 18,
    categorie: 'Confort'
  },
  {
    id: 'guide-local',
    nom: 'Guide local',
    description: 'Guide connaissant parfaitement la région pour découvrir les spots secrets',
    prix: 80,
    categorie: 'Personnel'
  }
];

// Fonction pour ajouter les services à tous les bateaux existants
async function ajouterServicesAuxBateaux() {
  try {
    console.log('Début de l\'ajout des services supplémentaires...');
    
    // Récupérer tous les bateaux
    const bateauxQuery = query(collection(db, 'bateaux'));
    const bateauxSnapshot = await getDocs(bateauxQuery);
    
    console.log(`${bateauxSnapshot.docs.length} bateaux trouvés`);
    
    // Pour chaque bateau, ajouter une sélection aléatoire de services
    for (const bateauDoc of bateauxSnapshot.docs) {
      const bateauId = bateauDoc.id;
      const bateauData = bateauDoc.data();
      
      // Sélectionner 3-6 services aléatoires pour chaque bateau
      const nombreServices = Math.floor(Math.random() * 4) + 3; // Entre 3 et 6
      const servicesSelectionnes = [];
      const servicesDisponibles = [...servicesParDefaut];
      
      for (let i = 0; i < nombreServices; i++) {
        const indexAleatoire = Math.floor(Math.random() * servicesDisponibles.length);
        servicesSelectionnes.push(servicesDisponibles[indexAleatoire]);
        servicesDisponibles.splice(indexAleatoire, 1);
      }
      
      // Mettre à jour le bateau avec les services
      await updateDoc(doc(db, 'bateaux', bateauId), {
        services: servicesSelectionnes
      });
      
      console.log(`Services ajoutés au bateau ${bateauData.nom} (${bateauId}):`, servicesSelectionnes.map(s => s.nom));
    }
    
    console.log('Tous les services ont été ajoutés avec succès !');
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout des services:', error);
  }
}

// Fonction pour ajouter un nouveau service personnalisé
async function ajouterServicePersonnalise(bateauId, nouveauService) {
  try {
    const bateauRef = doc(db, 'bateaux', bateauId);
    
    // Ajouter le service à la liste des services du bateau
    await updateDoc(bateauRef, {
      services: arrayUnion({
        id: nouveauService.id || Date.now().toString(),
        nom: nouveauService.nom,
        description: nouveauService.description,
        prix: nouveauService.prix,
        categorie: nouveauService.categorie || 'Personnalisé'
      })
    });
    
    console.log('Service personnalisé ajouté avec succès !');
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout du service personnalisé:', error);
  }
}

// Fonction pour créer une collection de services globaux (pour l'admin)
async function creerCollectionServicesGlobaux() {
  try {
    console.log('Création de la collection des services globaux...');
    
    for (const service of servicesParDefaut) {
      await addDoc(collection(db, 'services_globaux'), {
        ...service,
        dateCreation: new Date(),
        actif: true
      });
    }
    
    console.log('Collection des services globaux créée avec succès !');
    
  } catch (error) {
    console.error('Erreur lors de la création de la collection:', error);
  }
}

// Exporter les fonctions
export {
  ajouterServicesAuxBateaux,
  ajouterServicePersonnalise,
  creerCollectionServicesGlobaux,
  servicesParDefaut
};

// Exécuter le script si appelé directement
if (require.main === module) {
  ajouterServicesAuxBateaux();
}