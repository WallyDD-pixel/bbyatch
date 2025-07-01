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


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search-results" element={<SearchResults />} />
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
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          <Route path="/espace" element={<MonEspace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;