import React from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { FaInstagram, FaFacebook, FaLinkedin, FaHeart } from "react-icons/fa";

export default function Footer() {
  const [footerData, setFooterData] = React.useState({
    contact: "Site réalisé avec passion. Contact : contact@bbyatch.com",
    links: [
      { label: "Accueil", url: "/" },
      { label: "Vente", url: "/vente" },
      { label: "Location", url: "/location" },
      { label: "Contact", url: "/contact" }
    ],
    copyright: `© ${new Date().getFullYear()} BBYatch. Tous droits réservés.`
  });

  React.useEffect(() => {
    async function fetchFooter() {
      const docRef = doc(db, "settings", "footer");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setFooterData({ ...footerData, ...snap.data() });
      }
    }
    fetchFooter();
    // eslint-disable-next-line
  }, []);

  return (
    <footer style={{
      background: 'linear-gradient(180deg, #232323 80%, #232323 100%)',
      color: '#fff',
      padding: '32px 0 18px 0',
      textAlign: 'center',
      fontSize: 16,
      marginTop: 60,
      letterSpacing: 0.2,
      borderTop: '2px solid #e5e7eb',
      position: 'relative',
      minHeight: 120,
      boxShadow: '0 -2px 16px #0002',
      width: '100%'
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        alignItems: 'flex-start',
        gap: 32,
        position: 'relative',
      }}>
        {/* Colonne 1 : Contact & réseaux */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ fontSize: 15, color: '#bbb', marginBottom: 4, marginTop: 0, textAlign: 'left' }}>
            {footerData.contact.includes('@') ? (
              <>Site réalisé avec passion.<br />Contact : <a href={`mailto:${footerData.contact.split(':').pop().trim()}`} style={{ color: '#ffd700', textDecoration: 'underline', fontWeight: 600 }}>{footerData.contact.split(':').pop().trim()}</a></>
            ) : footerData.contact}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 2 }}>
            <a href="https://instagram.com/bbyatch" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: '#ffd700', fontSize: 20 }}><FaInstagram /></a>
            <a href="https://facebook.com/bbyatch" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: '#ffd700', fontSize: 20 }}><FaFacebook /></a>
            <a href="https://linkedin.com/company/bbyatch" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: '#ffd700', fontSize: 20 }}><FaLinkedin /></a>
          </div>
        </div>
        {/* Colonne 2 : Liens séparés gauche/droite */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 48 }}>
          {/* 3 premiers boutons à gauche */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
            {footerData.links && footerData.links.slice(0, 3).map((l, i) => (
              <a key={i} href={l.url} className="footer-link-btn" style={{ width: 170 }}>{l.label}</a>
            ))}
          </div>
          {/* Les autres à droite */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
            {footerData.links && footerData.links.slice(3).map((l, i) => (
              <a key={i+3} href={l.url} className="footer-link-btn" style={{ width: 170 }}>{l.label}</a>
            ))}
            <a href="/cgl" className="footer-link-btn" style={{ width: 170 }}>Conditions générales de location</a>
            <a href="/mentions-legales" className="footer-link-btn" style={{ width: 170 }}>Mentions légales</a>
          </div>
        </div>
        {/* Colonne 3 : Logo & branding */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, position: 'relative' }}>
          <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1, textTransform: 'uppercase', color: '#fff', textAlign: 'right' }}>BBYATCH</div>
          <div style={{ fontSize: 14, color: '#e0e0e0', textAlign: 'right' }}>{footerData.copyright}</div>
          <div style={{ fontSize: 13, color: '#bbb', display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
            Made with <FaHeart color="#ffd700" style={{ verticalAlign: 'middle' }} /> on the French Riviera
          </div>
          <img src={require('../logo.svg')} alt="BBYatch logo" className="footer-logo-bbyatch" style={{
            position: 'absolute',
            right: 0,
            bottom: -8,
            width: 32,
            height: 32,
            opacity: 0.92,
            zIndex: 10,
            filter: 'drop-shadow(0 2px 8px #0005)'
          }} />
        </div>
      </div>
      <style>{`
        .footer-link-btn {
          display: block;
          background: #292c2f;
          color: #fff;
          border-radius: 12px;
          padding: 10px 0;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          margin: 0 auto 0 0;
          text-align: center;
        }
        .footer-link-btn:hover {
          background: #333;
          color: #ffd700;
        }
        @media (max-width: 900px) {
          footer > div {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 18px !important;
          }
          .footer-logo-bbyatch {
            position: static !important;
            margin: 10px auto 0 auto !important;
            display: block !important;
          }
        }
      `}</style>
    </footer>
  );
}
