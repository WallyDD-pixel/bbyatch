// Script pour ajouter des services supplémentaires aux bateaux existants
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

// Configuration Firebase (remplacez par vos vraies clés)
const firebaseConfig = {
  // Vos clés de configuration Firebase
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Services supplémentaires types que les agences peuvent proposer
const servicesSupplementaires = [
  {
    id: "capitaine",
    nom: "Capitaine professionnel",
    description: "Service de capitaine expérimenté pour votre navigation",
    prix: 150,
    categorie: "equipage"
  },
  {
    id: "equipement_peche",
    nom: "Équipement de pêche",
    description: "Cannes, moulinets, appâts et matériel de pêche complet",
    prix: 40,
    categorie: "equipement"
  },
  {
    id: "equipement_plongee",
    nom: "Équipement de plongée",
    description: "Masques, tubas, palmes et équipement de plongée",
    prix: 25,
    categorie: "equipement"
  },
  {
    id: "barbecue",
    nom: "Barbecue à bord",
    description: "Barbecue portable avec charbon et ustensiles",
    prix: 30,
    categorie: "confort"
  },
  {
    id: "wifi",
    nom: "Wi-Fi à bord",
    description: "Connexion internet haut débit pendant la navigation",
    prix: 20,
    categorie: "technologie"
  },
  {
    id: "systeme_audio",
    nom: "Système audio premium",
    description: "Haut-parleurs Bluetooth et système audio de qualité",
    prix: 35,
    categorie: "technologie"
  },
  {
    id: "glaciere",
    nom: "Glacière premium",
    description: "Grande glacière avec glaçons et boissons fraîches",
    prix: 15,
    categorie: "confort"
  },
  {
    id: "parasol",
    nom: "Parasol et bâche",
    description: "Protection solaire et bâche pour plus de confort",
    prix: 20,
    categorie: "confort"
  },
  {
    id: "materiel_nautique",
    nom: "Matériel nautique",
    description: "Bouées, gilets de sauvetage supplémentaires, matériel de sécurité",
    prix: 25,
    categorie: "securite"
  },
  {
    id: "service_nettoyage",
    nom: "Service de nettoyage",
    description: "Nettoyage complet du bateau après utilisation",
    prix: 50,
    categorie: "service"
  },
  {
    id: "carburant_supplementaire",
    nom: "Carburant supplémentaire",
    description: "Réservoir de carburant d'appoint pour les longues sorties",
    prix: 60,
    categorie: "carburant"
  },
  {
    id: "service_traiteur",
    nom: "Service traiteur",
    description: "Repas et boissons préparés pour votre sortie en mer",
    prix: 80,
    categorie: "restauration"
  }
];

// Fonction pour attribuer des services aléatoires à chaque bateau
function getRandomServices() {
  const shuffled = [...servicesSupplementaires].sort(() => 0.5 - Math.random());
  const numberOfServices = Math.floor(Math.random() * 6) + 2; // Entre 2 et 7 services
  return shuffled.slice(0, numberOfServices);
}

// Fonction principale pour mettre à jour les bateaux
async function ajouterServicesAuxBateaux() {
  try {
    console.log("Récupération des bateaux...");
    const bateaux = await getDocs(collection(db, "bateaux"));
    
    console.log(`${bateaux.docs.length} bateaux trouvés`);
    
    for (const bateauDoc of bateaux.docs) {
      const bateauData = bateauDoc.data();
      
      // Vérifier si le bateau a déjà des services
      if (!bateauData.services) {
        const servicesAleatoires = getRandomServices();
        
        console.log(`Ajout de ${servicesAleatoires.length} services au bateau ${bateauData.nom}`);
        
        // Mettre à jour le document du bateau
        await updateDoc(doc(db, "bateaux", bateauDoc.id), {
          services: servicesAleatoires
        });
        
        console.log(`✓ Services ajoutés au bateau ${bateauData.nom}`);
      } else {
        console.log(`Le bateau ${bateauData.nom} a déjà des services`);
      }
    }
    
    console.log("Tous les bateaux ont été mis à jour avec succès!");
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
  }
}

// Exécuter le script
ajouterServicesAuxBateaux();

export { servicesSupplementaires };