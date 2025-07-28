import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { MapPin, CalendarDays, Filter, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./LocationSearch.css";
import fr from "date-fns/locale/fr"; // Import de la locale française

export default function LocationSearch() {
  const [villes, setVilles] = useState([]);
  const [selectedVille, setSelectedVille] = useState("");
  const [dateDepart, setDateDepart] = useState(null);
  const [heureDepart, setHeureDepart] = useState(null);
  const [dateRetour, setDateRetour] = useState(null);
  const [heureRetour, setHeureRetour] = useState(null);
  const [disponibilites, setDisponibilites] = useState([]);
  const [datesDepart, setDatesDepart] = useState([]); // Dates de début (start)
  const [datesRetour, setDatesRetour] = useState([]); // Dates de fin (end)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVilles = async () => {
      try {
        const villeCollection = collection(db, "villes");
        const villeSnapshot = await getDocs(villeCollection);
        const villeList = villeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVilles(villeList);
      } catch (error) {
        console.error("Erreur lors du chargement des villes :", error);
      }
    };
    fetchVilles();
  }, []);

  useEffect(() => {
    const fetchDisponibilites = async () => {
      if (!selectedVille) return;

      try {
        const bateauxRef = collection(db, "bateaux");
        const q = query(bateauxRef, where("Ville", "==", selectedVille));
        const snapshot = await getDocs(q);

        const allDisponibilites = [];
        const startDates = []; // Dates de start
        const endDates = [];   // Dates de end

        console.log(`=== CALENDRIER: Chargement des disponibilités pour ${selectedVille} ===`);
        console.log(`Nombre de bateaux trouvés: ${snapshot.docs.length}`);

        // Parcourir chaque document bateau
        snapshot.docs.forEach((doc) => {
          const bateauData = doc.data();
          const bateauId = doc.id;
          
          console.log(`\n🚤 Bateau: ${bateauData.nom || 'Sans nom'} (ID: ${bateauId})`);
          
          // Vérifier si le bateau a un champ disponibilites
          if (!bateauData.disponibilites) {
            console.log(`  ❌ Aucun champ 'disponibilites' pour ce bateau`);
            return;
          }
          
          // Vérifier si disponibilites est un tableau
          if (!Array.isArray(bateauData.disponibilites)) {
            console.log(`  ❌ Le champ 'disponibilites' n'est pas un tableau:`, typeof bateauData.disponibilites);
            return;
          }
          
          // Vérifier si le tableau est vide
          if (bateauData.disponibilites.length === 0) {
            console.log(`  ⚠️ Tableau des disponibilités vide`);
            return;
          }
          
          console.log(`  ✅ ${bateauData.disponibilites.length} disponibilité(s) trouvée(s)`);
          
          // Parcourir chaque disponibilité du bateau
          bateauData.disponibilites.forEach((dispo, index) => {
            console.log(`\n    📅 Disponibilité ${index + 1}:`);
            
            // Vérifier la structure de la disponibilité
            if (!dispo.start || !dispo.end) {
              console.log(`      ❌ Disponibilité incomplète - start: ${dispo.start}, end: ${dispo.end}`);
              return;
            }
            
            try {
              const start = new Date(dispo.start);
              const end = new Date(dispo.end);
              
              // Vérifier si les dates sont valides
              if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                console.log(`      ❌ Dates invalides - start: ${dispo.start}, end: ${dispo.end}`);
                return;
              }
              
              // Vérifier la logique des dates
              if (start >= end) {
                console.log(`      ❌ Date de début >= date de fin`);
                return;
              }
              
              console.log(`      ✅ ${start.toLocaleString()} à ${end.toLocaleString()}`);
              
              // Ajouter à la liste des disponibilités
              allDisponibilites.push({ 
                start, 
                end, 
                bateauId,
                bateauNom: bateauData.nom || 'Sans nom',
                bateauPrix: bateauData.prix || 0
              });

              // Extraire les dates de début et de fin
              const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
              const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
              
              // Ajouter la date de START pour le calendrier de départ
              startDates.push(new Date(startDate));
              console.log(`        → Date DÉPART ajoutée: ${startDate.toDateString()}`);
              
              // Ajouter la date de END pour le calendrier de retour
              endDates.push(new Date(endDate));
              console.log(`        → Date RETOUR ajoutée: ${endDate.toDateString()}`);
              
            } catch (error) {
              console.log(`      ❌ Erreur lors du traitement de la disponibilité:`, error.message);
            }
          });
        });

        // Créer les listes uniques des dates
        const uniqueStartDates = Array.from(
          new Set(startDates.map((d) => d.toDateString()))
        ).map((dateStr) => new Date(dateStr));

        const uniqueEndDates = Array.from(
          new Set(endDates.map((d) => d.toDateString()))
        ).map((dateStr) => new Date(dateStr));

        console.log(`\n=== CALENDRIER RÉSUMÉ ===`);
        console.log(`${allDisponibilites.length} disponibilités totales trouvées`);
        console.log(`${uniqueStartDates.length} dates de DÉPART disponibles`);
        console.log(`${uniqueEndDates.length} dates de RETOUR disponibles`);

        setDisponibilites(allDisponibilites);
        setDatesDepart(uniqueStartDates);
        setDatesRetour(uniqueEndDates);
        
      } catch (error) {
        console.error("❌ Erreur lors du chargement des disponibilités :", error);
      }
    };

    fetchDisponibilites();
  }, [selectedVille]);

  const getHeuresDisponibles = (selectedDate) => {
    const heures = [];

    disponibilites.forEach(({ start, end }) => {
      const sameDay =
        selectedDate &&
        start.toDateString() === selectedDate.toDateString();

      if (sameDay) {
        let current = new Date(start);
        while (current <= end) {
          heures.push(new Date(current));
          current.setMinutes(current.getMinutes() + 30);
        }
      }
    });

    return heures;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedVille || !dateDepart || !heureDepart || !dateRetour || !heureRetour) {
      alert("Merci de remplir tous les champs.");
      return;
    }

    // Fonction pour formater la date sans problème de fuseau horaire
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const formatHeure = (d) => d.toTimeString().slice(0, 5);

    const queryString = new URLSearchParams({
      ville: selectedVille,
      dateDebut: formatDate(dateDepart),
      heureDebut: formatHeure(heureDepart),
      dateFin: formatDate(dateRetour),
      heureFin: formatHeure(heureRetour),
    }).toString();

    navigate(`/search-results?${queryString}`);
  };

  return (
    <form
      className="search-bar-modern search-bar-responsive"
      onSubmit={handleSubmit}
      style={{ marginTop: 48, padding: 16, borderRadius: 16, background: '#fff', boxShadow: '0 2px 12px #0001', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}
    >
      <div className="search-item" style={{ minWidth: 160, flex: 1, margin: 0 }}>
        <MapPin className="search-icon" />
        <div className="search-labels" style={{ gap: 2 }}>
          <label style={{ marginBottom: 2 }}>Destination</label>
          <select
            value={selectedVille}
            onChange={(e) => {
              setSelectedVille(e.target.value);
              setDateDepart(null);
              setDateRetour(null);
              setHeureDepart(null);
              setHeureRetour(null);
            }}
            className="styled-input"
            style={{ minHeight: 36, fontSize: 15 }}
          >
            <option value="">Choisissez une ville</option>
            {villes.map((ville) => (
              <option key={ville.id} value={ville.nom}>
                {ville.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="search-item" style={{ minWidth: 160, flex: 1, margin: 0 }}>
        <CalendarDays className="search-icon" />
        <div className="search-labels" style={{ gap: 2 }}>
          <label style={{ marginBottom: 2 }}>Départ</label>
          <div style={{ position: "relative", zIndex: 3 }}>
            <DatePicker
              selected={dateDepart}
              onChange={(date) => {
                setDateDepart(date);
                setHeureDepart(null);
              }}
              placeholderText="Date de départ"
              includeDates={datesDepart}
              locale={fr}
              dateFormat="dd/MM/yyyy"
              dayClassName={(date) =>
                datesDepart.some(
                  (d) => d.toDateString() === date.toDateString()
                )
                  ? "available-day"
                  : undefined
              }
              className="styled-input"
              popperPlacement="bottom"
              popperClassName="datepicker-popper"
              style={{ minHeight: 36, fontSize: 15 }}
            />
          </div>
          {dateDepart && (
            <div style={{ position: "relative", zIndex: 2, marginTop: 2 }}>
              <DatePicker
                selected={heureDepart}
                onChange={(time) => setHeureDepart(time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                timeCaption="Heure"
                dateFormat="HH:mm"
                locale={fr}
                includeTimes={getHeuresDisponibles(dateDepart)}
                placeholderText="Heure de départ"
                className="styled-input"
                popperPlacement="bottom"
                popperClassName="datepicker-popper"
                style={{ minHeight: 36, fontSize: 15 }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="search-item" style={{ minWidth: 160, flex: 1, margin: 0 }}>
        <CalendarDays className="search-icon" />
        <div className="search-labels" style={{ gap: 2 }}>
          <label style={{ marginBottom: 2 }}>Retour</label>
          <div style={{ position: "relative", zIndex: 2 }}>
            <DatePicker
              selected={dateRetour}
              onChange={(date) => {
                setDateRetour(date);
                setHeureRetour(null);
              }}
              placeholderText="Date de retour"
              includeDates={datesRetour}
              locale={fr}
              dateFormat="dd/MM/yyyy"
              dayClassName={(date) =>
                datesRetour.some(
                  (d) => d.toDateString() === date.toDateString()
                )
                  ? "available-day"
                  : undefined
              }
              className="styled-input"
              popperPlacement="bottom"
              popperClassName="datepicker-popper"
              style={{ minHeight: 36, fontSize: 15 }}
            />
          </div>
          {dateRetour && (
            <div style={{ position: "relative", zIndex: 1, marginTop: 2 }}>
              <DatePicker
                selected={heureRetour}
                onChange={(time) => setHeureRetour(time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                timeCaption="Heure"
                dateFormat="HH:mm"
                locale={fr}
                includeTimes={getHeuresDisponibles(dateRetour)}
                placeholderText="Heure de retour"
                className="styled-input"
                popperPlacement="bottom"
                popperClassName="datepicker-popper"
                style={{ minHeight: 36, fontSize: 15 }}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
        <button
          type="submit"
          className="search-btn-icon"
          title="Rechercher"
          style={{
            minWidth: 120,
            height: 36,
            borderRadius: 7,
            fontWeight: 700,
            fontSize: 15,
            background: "linear-gradient(135deg, #1976d2 0%, #0056b3 100%)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 2px 8px #1976d222",
            border: "none",
            margin: 0,
            padding: "0 12px"
          }}
        >
          <Search size={18} style={{ marginRight: 6 }} />
          Rechercher
        </button>
      </div>
    </form>
  );
}
