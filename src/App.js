import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import BateauDetails from "./pages/BateauDetails";
import Confirmation from './pages/Confirmation';
import InfosClient from './pages/InfosClient';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import AdminVilles from './pages/admin/AdminVilles';
import AdminBateaux from './pages/admin/AdminBateaux';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';
import MonEspace from './pages/utilisateur/MonEspace';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaiementStripe from './pages/PaiementStripe';
import Felicitation from './pages/Felicitation';
import AdminReservations from './pages/admin/AdminReservations';
import Vente from './pages/Vente';
import AdminHomepage from './pages/admin/AdminHomepage';
import AdminGalerieHome from './pages/admin/AdminGalerieHome';
import AdminPresentationHome from './pages/admin/AdminPresentationHome';
import AdminServicesHome from './pages/admin/AdminServicesHome';
import AdminBateauxOccasion from './pages/admin/AdminBateauxoccasion';
import AdminCalendrier from './pages/admin/AdminCalendrier';
import AgenceDashboard from './pages/agence/agenceDashboard';
import EditerDisponibilitesBateau from './pages/agence/EditerDisponibilitesBateau';
import EditerBateau from './pages/agence/EditerBateau';
import DemandeParticulier from './pages/DemandeParticulier';
import DemandesParticuliers from './pages/admin/DemandesParticuliers';
import BateauOccasionDetail from './pages/BateauOccasionDetail';



function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/bateau/:id" element={<BateauOccasionDetail />} />
          <Route path="/bateau/:id" element={<BateauDetails />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/infos-client" element={<InfosClient />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/paiement-stripe" element={<PaiementStripe />} />
          <Route path="/felicitation" element={<Felicitation />} />
          <Route path="/admin/dashboard" element={<DashboardAdmin />}>
            <Route index element={<div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(30,60,60,0.08)', padding: 24 }}><h2 style={{ color: '#1e90ff', marginBottom: 32 }}>Dashboard Admin</h2><p>Bienvenue sur le dashboard d'administration. Utilisez le menu à gauche pour naviguer.</p></div>} />
            <Route path="villes" element={<AdminVilles />} />
            <Route path="bateaux" element={<AdminBateaux />} />
            <Route path="bateauxoccasion" element={<AdminBateauxOccasion />} />
            <Route path="calendrier" element={<AdminCalendrier />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="settings/galerie-home" element={<AdminGalerieHome />} />
            <Route path="settings/homepage" element={<AdminHomepage />} />
            <Route path="settings/presentation" element={<AdminPresentationHome />} />
            <Route path="settings/services" element={<AdminServicesHome />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="demandes-particuliers" element={<DemandesParticuliers />} />
          </Route>
          <Route path="/agence/dashboard/*" element={<AgenceDashboard />} />
          
          
          <Route path="/espace" element={<MonEspace />} />
          <Route path="/vente" element={<Vente />} />
          <Route path="/agence/dashboard/bateaux/:id/disponibilites" element={<EditerDisponibilitesBateau />} />
          <Route path="/agence/dashboard/bateaux/:id/edit" element={<EditerBateau />} />
          <Route path="/demande-particulier" element={<DemandeParticulier />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;