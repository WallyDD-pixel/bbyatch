import React from "react";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";

export default function CGL() {
  return (
    
    <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: 120, paddingBottom: 40 }}>
      <NavBar />
      <div className="container" style={{ maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 6px 32px #0001', padding: 36, border: '1.5px solid #e5e7eb' }}>
        <h1 style={{ fontWeight: 800, color: '#1976d2', fontSize: 32, marginBottom: 24, textAlign: 'center' }}>Conditions Générales de Location</h1>
        <ol style={{ color: '#232323', fontSize: 17, lineHeight: 1.7, paddingLeft: 20 }}>
          <li style={{ marginBottom: 18 }}>
            <b>Prestataire</b><br />
            BBServicesCharter – Location de bateaux à la journée<br />
            Port Camille Rayon, Golfe-Juan, 06220, France<br />
            Contact : <a href="mailto:contact@bb-yachts.com">contact@bb-yachts.com</a>
          </li>
          <li style={{ marginBottom: 18 }}>
            <b>Horaires de location</b><br />
            La location s’effectue généralement de 9h à 18h, sauf accord spécifique.<br />
            Tout dépassement d’horaire peut entraîner un supplément facturé à l’heure.
          </li>
          <li style={{ marginBottom: 18 }}>
            <b>Skipper</b><br />
            La présence d’un skipper professionnel est obligatoire.<br />
            Le skipper est fourni par BBServicesCharter et inclus dans le tarif (sauf mention contraire).
          </li>
          <li style={{ marginBottom: 18 }}>
            <b>Carburant</b><br />
            Le carburant n’est pas inclus dans le tarif de base, sauf si spécifié à la réservation.<br />
            Le carburant consommé est facturé en fin de journée selon la consommation réelle.
          </li>
          <li style={{ marginBottom: 18 }}>
            <b>Conditions météorologiques</b><br />
            En cas de mauvaises conditions météo (vents forts, orage, mer agitée), la sortie pourra être&nbsp;:<br />
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 24 }}>
              <li>Reportée à une autre date</li>
              <li>Remboursée intégralement si aucun report n’est possible</li>
            </ul>
          </li>
          <li style={{ marginBottom: 18 }}>
            <b>Politique d'annulation</b><br />
            Annulation gratuite jusqu’à 48h avant le départ.<br />
            Moins de 48h avant : 50% du montant de la réservation est conservé.<br />
            En cas de non-présentation, aucun remboursement ne sera effectué.
          </li>
          <li style={{ marginBottom: 18 }}>
            <b>Réservations et paiements</b><br />
            Les réservations sont confirmées après versement d’un acompte ou paiement complet.<br />
            Les paiements se font par carte, virement ou espèces (selon les accords).
          </li>
          <li style={{ marginBottom: 18 }}>
            <b>Responsabilité</b><br />
            BBServicesCharter ne pourra être tenu responsable des objets perdus ou endommagés à bord.<br />
            Les clients doivent respecter les consignes du skipper à tout moment.
          </li>
          <li style={{ marginBottom: 18 }}>
            <b>Contact</b><br />
            Pour toute question ou demande spécifique&nbsp;:<br />
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 24 }}>
              <li><a href="mailto:contact@bb-yachts.com">contact@bb-yachts.com</a></li>
              <li><a href="tel:+33609176282">0609176282</a></li>
              <li><a href="https://bbservicescharter.com" target="_blank" rel="noopener noreferrer">bbservicescharter.com</a></li>
            </ul>
          </li>
        </ol>
      </div>
      <Footer />
    </div>
  );
}
