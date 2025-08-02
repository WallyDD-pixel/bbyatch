import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      title: "BB SERVICE CHARTER - Location de yachts sur la Riviera française et Italienne par BB YACHTS",
      experience: "Vivez une expérience inoubliable",
      boats: "Bateaux disponibles",
      gallery: "Notre galerie photo",
      details: "Cliquer pour voir les détails →",
      subtitle_experience: "Nos expériences à vivre",
      experience_desc: "Profitez d'une expérience croisière soit le matin, soit l'après-midi soit à la journée complète",
      loading: "Chargement...",
      no_boat: "Aucun bateau disponible.",
      places: "places",
      speed: "vitesse",
      fuel: "carburant",
      engine: "moteur",
      destination: "Destination",
      choose_city: "Choisissez une ville",
      start_date: "Date de départ",
      start_time: "Heure de départ",
      end_date: "Date de retour",
      end_time: "Heure de retour",
      search: "Rechercher",
      navbar: {
        experiences: "Nos expériences",
        boats: "Bateaux disponibles",
        sale: "Vente d'occasion",
        profile: "Profil",
        reservations: "Mes réservations",
        personalData: "Données personnelles",
        mySpace: "Mon espace",
        help: "Aide",
        logout: "Déconnexion",
        login: "Se connecter"
      }
    }
  },
  en: {
    translation: {
      title: "BB SERVICE CHARTER - Yacht rental on the French and Italian Riviera by BB YACHTS",
      experience: "Live an unforgettable experience",
      boats: "Available boats",
      gallery: "Our photo gallery",
      details: "Click to see details →",
      subtitle_experience: "Our experiences",
      experience_desc: "Enjoy a cruise experience in the morning, afternoon or for a full day",
      loading: "Loading...",
      no_boat: "No boat available.",
      places: "places",
      speed: "speed",
      fuel: "fuel",
      engine: "engine",
      destination: "Destination",
      choose_city: "Choose a city",
      start_date: "Start date",
      start_time: "Start time",
      end_date: "End date",
      end_time: "End time",
      search: "Search",
      navbar: {
        experiences: "Experiences",
        boats: "Available boats",
        sale: "For sale",
        profile: "Profile",
        reservations: "My bookings",
        personalData: "Personal data",
        mySpace: "My space",
        help: "Help",
        logout: "Logout",
        login: "Login"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;
