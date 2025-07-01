import React, { useState } from "react";
import { useLocation } from "react-router-dom";

export default function InfosClient() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // Ici, tu peux envoyer les infos à Firestore ou autre
    alert("Réservation enregistrée !");
  }

  return (
    <div className="container py-5">
      <h2>Informations client</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div className="mb-3">
          <label className="form-label">Nom</label>
          <input className="form-control" value={nom} onChange={e => setNom(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button className="btn btn-success" type="submit">Valider la réservation</button>
      </form>
    </div>
  );
}
