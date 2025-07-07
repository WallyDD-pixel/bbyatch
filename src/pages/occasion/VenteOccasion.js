import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function VenteOccasion() {
  const [bateaux, setBateaux] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBateaux() {
      try {
        const querySnapshot = await getDocs(collection(db, 'bateauxOccasion'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBateaux(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des bateaux :', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBateaux();
  }, []);

  if (loading) return <div>Chargement des bateaux...</div>;

  return (
    <div style={{ padding: 32, marginTop: 70 }}>
      <h1>Vente d’occasion : Bateaux disponibles</h1>
      {bateaux.length === 0 ? (
        <p>Aucun bateau d’occasion disponible pour le moment.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {bateaux.map(bateau => (
            <div key={bateau.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 20, width: 320, background: '#fafbfc' }}>
              <h3>{bateau.nom || 'Nom non renseigné'}</h3>
              <p><b>Modèle :</b> {bateau.modele || 'Non renseigné'}</p>
              <p><b>Année :</b> {bateau.annee || 'Non renseignée'}</p>
              <p><b>Prix :</b> {bateau.prix ? bateau.prix + ' €' : 'Non renseigné'}</p>
              {bateau.imageUrl && <img src={bateau.imageUrl} alt={bateau.nom} style={{ width: '100%', borderRadius: 8, marginTop: 8 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
