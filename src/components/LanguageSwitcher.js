import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div style={{ position: 'fixed', right: 24, top: 24, zIndex: 3000, display: 'flex', gap: 8, background: '#fff', borderRadius: 24, boxShadow: '0 2px 12px #0002', padding: '8px 16px' }}>
      <button
        className={`btn btn-sm ${i18n.language === 'fr' ? 'btn-primary' : 'btn-outline-primary'}`}
        style={{ minWidth: 40, fontWeight: 700, padding: '2px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}
        onClick={() => i18n.changeLanguage('fr')}
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg" alt="FR" style={{ width: 22, height: 16, borderRadius: 3, marginRight: 6 }} />
        FR
      </button>
      <button
        className={`btn btn-sm ${i18n.language === 'en' ? 'btn-primary' : 'btn-outline-primary'}`}
        style={{ minWidth: 40, fontWeight: 700, padding: '2px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}
        onClick={() => i18n.changeLanguage('en')}
      >
        <img src="https://flagcdn.com/w320/gb.png" alt="EN" style={{ width: 22, height: 16, borderRadius: 3, marginRight: 6 }} />
        EN
      </button>
    </div>
  );
}
