import React, { useState } from 'react';
// Ajout import Firestore
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Chemin à adapter selon votre projet
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function DemandeParticulier() {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    message: "Bonjour, je suis intéressé par la location d'un yacht via BB SERVICE CHARTER. Merci de me recontacter afin de discuter des modalités."
  });
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // Enregistrement dans Firestore
      await addDoc(collection(db, 'demandesParticuliers'), {
        ...form,
        date: new Date().toISOString()
      });
      setConfirmation('Votre demande a bien été envoyée. Nous vous contacterons rapidement.');
      setForm({ nom: '', prenom: '', email: '', telephone: '', message: '' });
      setShowModal(true);
      // Attendre 1.5s puis rediriger vers la page d'accueil
      setTimeout(() => {
        setShowModal(false);
        navigate('/');
      }, 1500);
    } catch (error) {
      setConfirmation("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    }
    setLoading(false);
  };

  return (
    <>
      <NavBar />
      <div style={{ height: 60 }} />
      <div style={{ maxWidth: 500, margin: '60px auto', padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(30,60,60,0.08)', fontFamily: "'Inter', Arial, sans-serif" }}>
        {/* Message d'information modifié */}
        <div style={{ background: '#f0f6ff', color: '#222', padding: '14px 12px', borderRadius: 8, marginBottom: 24, fontSize: 15, textAlign: 'center', border: '1px solid #c0d0e0', fontFamily: "'Inter', Arial, sans-serif" }}>
          <strong>Information :</strong> Actuellement, la location est réservée aux professionnels.<br />
          Cependant, vous pouvez faire une demande de réservation en tant que particulier via le formulaire ci-dessous.
        </div>
        <h2 style={{ textAlign: 'center', color: '#1e90ff', marginBottom: 32 }}>Demande Particulier</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <input name="nom" type="text" placeholder="Nom" value={form.nom} onChange={handleChange} required style={inputStyle} />
          <input name="prenom" type="text" placeholder="Prénom" value={form.prenom} onChange={handleChange} required style={inputStyle} />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={inputStyle} />
          <input name="telephone" type="tel" placeholder="Numéro de téléphone" value={form.telephone} onChange={handleChange} required style={inputStyle} />
          <textarea
            name="message"
            placeholder="Votre demande..."
            value={form.message}
            onChange={handleChange}
            required
            style={{ ...inputStyle, minHeight: 100, fontSize: 15, fontWeight: 500, color: '#222' }}
          />
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
        {/* Modal de confirmation */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              background: '#fff',
              padding: '32px 28px',
              borderRadius: 12,
              boxShadow: '0 4px 24px rgba(30,60,60,0.15)',
              textAlign: 'center',
              fontSize: 18,
              color: '#222',
              fontFamily: "'Inter', Arial, sans-serif"
            }}>
              <strong>Demande envoyée !</strong>
              <div style={{ marginTop: 12 }}>{confirmation}</div>
            </div>
          </div>
        )}
        {/* {confirmation && <div style={{ color: 'green', textAlign: 'center', marginTop: 20 }}>{confirmation}</div>} */}
      </div>
      <Footer />
    </>
  );
}

const inputStyle = {
  padding: '12px 10px',
  borderRadius: 8,
  border: '1px solid #c0d0e0',
  fontSize: 16,
};

const buttonStyle = {
  background: '#1e90ff',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '12px 0',
  fontWeight: 600,
  fontSize: 17,
  cursor: 'pointer',
};
