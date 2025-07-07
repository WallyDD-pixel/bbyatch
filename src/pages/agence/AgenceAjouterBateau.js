import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { addDoc, collection, getDoc, doc } from 'firebase/firestore';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fr } from 'date-fns/locale';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  FaArrowLeft, 
  FaShip, 
  FaMapMarkerAlt, 
  FaCog, 
  FaGasPump, 
  FaUsers, 
  FaEuroSign, 
  FaTachometerAlt,
  FaCalendarAlt,
  FaImage,
  FaPlus,
  FaTrash,
  FaSave
} from 'react-icons/fa';

const locales = { fr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

function DisponibilitesCalendar({ dispos, setDispos }) {
  const [heureDebut, setHeureDebut] = useState('09:00');
  const [heureFin, setHeureFin] = useState('18:00');

  // Transforme les dispos en events pour le calendrier
  const events = dispos.map((d, i) => ({
    id: i,
    title: 'Disponible',
    start: new Date(d.start),
    end: new Date(d.end),
    allDay: false,
  }));

  // Ajout d'un ou plusieurs créneaux sur sélection de jours
  const handleSelectSlot = ({ start, end, action }) => {
    // Correction stricte : si clic (action === 'click' ou start == end), ne prendre que le jour cliqué
    if (
      action === 'click' ||
      start.toDateString() === end.toDateString() ||
      (end.getTime() - start.getTime()) < 24 * 60 * 60 * 1000
    ) {
      const [hDeb, mDeb] = heureDebut.split(":").map(Number);
      const [hFin, mFin] = heureFin.split(":").map(Number);
      const dStart = new Date(start);
      dStart.setHours(hDeb, mDeb, 0, 0);
      const dEnd = new Date(start);
      dEnd.setHours(hFin, mFin, 0, 0);
      setDispos([...dispos, { start: dStart, end: dEnd }]);
    } else {
      // Plusieurs jours sélectionnés (glisser)
      // Correction : react-big-calendar inclut le dernier jour, donc on retire 1 jour à end
      const days = [];
      let d = new Date(start);
      const endDay = new Date(end);
      endDay.setDate(endDay.getDate() - 1);
      while (d <= endDay) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      const newDispos = days.map(day => {
        const dStart = new Date(day);
        dStart.setHours(...heureDebut.split(":").map(Number), 0, 0);
        const dEnd = new Date(day);
        dEnd.setHours(...heureFin.split(":").map(Number), 0, 0);
        return { start: dStart, end: dEnd };
      });
      setDispos([...dispos, ...newDispos]);
    }
  };
  
  // Suppression d'un créneau au clic
  const handleSelectEvent = event => {
    setDispos(dispos.filter((_, i) => i !== event.id));
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 600,
        color: '#e8eaed',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <FaCalendarAlt style={{ color: '#3b82f6' }} />
        Disponibilités
      </h3>
      
      {/* Sélection des heures */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ 
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: '#e8eaed',
            marginBottom: '4px'
          }}>
            Heure de début
          </label>
          <input 
            type="time" 
            value={heureDebut} 
            onChange={e => setHeureDebut(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #374151',
              borderRadius: '6px',
              fontSize: '14px',
              background: '#2a2d35',
              color: '#e8eaed'
            }}
          />
        </div>
        <div>
          <label style={{ 
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: '#e8eaed',
            marginBottom: '4px'
          }}>
            Heure de fin
          </label>
          <input 
            type="time" 
            value={heureFin} 
            onChange={e => setHeureFin(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #374151',
              borderRadius: '6px',
              fontSize: '14px',
              background: '#2a2d35',
              color: '#e8eaed'
            }}
          />
        </div>
      </div>

      {/* Calendrier */}
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid #374151'
      }}>
        <Calendar
          localizer={localizer}
          events={events}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 400 }}
          messages={{
            next: 'Suivant', 
            previous: 'Précédent', 
            today: "Aujourd'hui", 
            month: 'Mois', 
            week: 'Semaine', 
            day: 'Jour', 
            agenda: 'Agenda', 
            date: 'Date', 
            time: 'Heure', 
            event: 'Créneau', 
            noEventsInRange: 'Aucune disponibilité',
          }}
          culture="fr"
          views={['month', 'week', 'day']}
          min={new Date(2025, 0, 1, 6, 0)}
          max={new Date(2025, 0, 1, 22, 0)}
          step={30}
          timeslots={2}
          defaultView="month"
        />
      </div>
      
      {/* Instructions */}
      <div style={{ 
        fontSize: '13px', 
        color: '#9ca3af', 
        marginTop: '12px',
        padding: '12px',
        background: '#2a2d35',
        borderRadius: '6px',
        border: '1px solid #374151'
      }}>
        <strong>Instructions :</strong><br />
        1. Définissez la tranche horaire souhaitée<br />
        2. Cliquez ou glissez sur les jours du calendrier pour ajouter des créneaux<br />
        3. Cliquez sur un créneau existant pour le supprimer<br />
        4. Changez la tranche horaire pour définir différents créneaux
      </div>
    </div>
  );
}

export default function AgenceAjouterBateau() {
  const [form, setForm] = useState({
    nom: '',
    Ville: '',
    moteur: '',
    carburant: '',
    places: '',
    prix: '',
    vitesse: '',
    photo: [],
  });
  const [dispos, setDispos] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agenceInfo, setAgenceInfo] = useState({ nom: '', id: '' });
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAgenceInfo() {
      const user = auth.currentUser;
      if (!user) return;
      
      // Récupérer les infos de l'agence depuis la collection agences
      const agenceDoc = await getDoc(doc(db, 'agences', user.uid));
      if (agenceDoc.exists()) {
        const agenceData = agenceDoc.data();
        setAgenceInfo({
          nom: agenceData.nom || '',
          id: user.uid
        });
      } else {
        // Fallback : récupérer depuis users si pas dans agences
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAgenceInfo({
            nom: userData.agence || userData.displayName || '',
            id: user.uid
          });
        }
      }
    }
    fetchAgenceInfo();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const removePhotoField = i => {
    if (form.photo.length === 1) return;
    const newPhotos = form.photo.filter((_, idx) => idx !== i);
    setForm({ ...form, photo: newPhotos });
  };

  // Ajout d'une photo via upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `bateaux/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm(f => ({ ...f, photo: [...(f.photo || []), url] }));
    } catch (err) {
      setError("Erreur lors de l'upload : " + err.message);
    }
    setLoading(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); 
    setSuccess(''); 
    setLoading(true);
    
    const user = auth.currentUser;
    if (!user) { 
      setError('Non connecté'); 
      setLoading(false); 
      return; 
    }
    
    if (!form.nom || !form.Ville || !form.moteur || !form.carburant || !form.places || !form.prix || !form.vitesse) {
      setError('Tous les champs sont obligatoires.'); 
      setLoading(false); 
      return;
    }
    
    try {
      // Nettoyage des champs photo et disponibilites
      const photos = Array.isArray(form.photo) ? form.photo.filter(url => typeof url === 'string' && url.trim() !== '') : [];
      const disponibilites = Array.isArray(dispos)
        ? dispos.filter(d => d && d.start && d.end).map(d => ({
            start: d.start instanceof Date ? d.start.toISOString() : d.start,
            end: d.end instanceof Date ? d.end.toISOString() : d.end
          }))
        : [];
      
      // Création du bateau avec les infos de l'agence
      await addDoc(collection(db, 'bateaux'), {
        nom: form.nom,
        Ville: form.Ville,
        moteur: Number(form.moteur),
        carburant: Number(form.carburant),
        places: Number(form.places),
        prix: Number(form.prix),
        vitesse: Number(form.vitesse),
        photo: photos,
        disponibilites,
        // Informations de l'agence
        agenceId: user.uid,
        agenceNom: agenceInfo.nom,
        createdAt: new Date()
      });
      
      setSuccess('Bateau ajouté avec succès !');
      setTimeout(() => navigate('/agence/dashboard/bateaux'), 1500);
    } catch (err) {
      setError('Erreur lors de l\'ajout : ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      background: 'transparent',
      minHeight: '100%',
      color: '#e8eaed'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/agence/dashboard/bateaux')}
            style={{
              background: '#2a2d35',
              border: '1px solid #374151',
              color: '#e8eaed',
              padding: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#2a2d35';
            }}
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 style={{ 
              margin: 0,
              fontSize: '28px',
              fontWeight: 700,
              color: '#e8eaed',
              marginBottom: '8px'
            }}>
              Ajouter un bateau
            </h1>
            <p style={{ 
              margin: 0, 
              color: '#9ca3af', 
              fontSize: '16px' 
            }}>
              Agence : {agenceInfo.nom || 'Chargement...'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div style={{
          background: '#065f46',
          color: '#10b981',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: 500,
          border: '1px solid #10b981'
        }}>
          ✅ {success}
        </div>
      )}

      {error && (
        <div style={{
          background: '#7f1d1d',
          color: '#ef4444',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: 500,
          border: '1px solid #ef4444'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        <div style={{
          background: '#1a1d23',
          borderRadius: '12px',
          padding: '32px',
          border: '1px solid #2a2d35',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          marginBottom: '24px'
        }}>
          {/* Informations principales */}
          <div style={{
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '1px solid #2a2d35'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#e8eaed',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FaShip style={{ color: '#3b82f6' }} />
              Informations du bateau
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Nom du bateau *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  placeholder="Ex: Sea Dream"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#2a2d35',
                    color: '#e8eaed'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  <FaMapMarkerAlt style={{ marginRight: '4px' }} />
                  Ville *
                </label>
                <input
                  type="text"
                  name="Ville"
                  value={form.Ville}
                  onChange={handleChange}
                  placeholder="Ex: Cannes"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#2a2d35',
                    color: '#e8eaed'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  <FaUsers style={{ marginRight: '4px' }} />
                  Nombre de places *
                </label>
                <input
                  type="number"
                  name="places"
                  value={form.places}
                  onChange={handleChange}
                  placeholder="Ex: 8"
                  required
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#2a2d35',
                    color: '#e8eaed'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  <FaEuroSign style={{ marginRight: '4px' }} />
                  Prix par jour (€) *
                </label>
                <input
                  type="number"
                  name="prix"
                  value={form.prix}
                  onChange={handleChange}
                  placeholder="Ex: 450"
                  required
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#2a2d35',
                    color: '#e8eaed'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Caractéristiques techniques */}
          <div style={{
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '1px solid #2a2d35'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#e8eaed',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FaCog style={{ color: '#3b82f6' }} />
              Caractéristiques techniques
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Puissance moteur (CV) *
                </label>
                <input
                  type="number"
                  name="moteur"
                  value={form.moteur}
                  onChange={handleChange}
                  placeholder="Ex: 250"
                  required
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#2a2d35',
                    color: '#e8eaed'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  <FaGasPump style={{ marginRight: '4px' }} />
                  Carburant (litres) *
                </label>
                <input
                  type="number"
                  name="carburant"
                  value={form.carburant}
                  onChange={handleChange}
                  placeholder="Ex: 120"
                  required
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#2a2d35',
                    color: '#e8eaed'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  <FaTachometerAlt style={{ marginRight: '4px' }} />
                  Vitesse max (nœuds) *
                </label>
                <input
                  type="number"
                  name="vitesse"
                  value={form.vitesse}
                  onChange={handleChange}
                  placeholder="Ex: 25"
                  required
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#2a2d35',
                    color: '#e8eaed'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div style={{
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '1px solid #2a2d35'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#e8eaed',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FaImage style={{ color: '#3b82f6' }} />
              Photos du bateau
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: '#2a2d35',
                  color: '#e8eaed',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              />
            </div>

            {form.photo && form.photo.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {form.photo.map((url, i) => (
                  <div key={i} style={{
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #374151'
                  }}>
                    <img 
                      src={url} 
                      alt={`Photo ${i + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '150px', 
                        objectFit: 'cover'
                      }} 
                    />
                    <button 
                      type="button"
                      onClick={() => removePhotoField(i)}
                      disabled={form.photo.length === 1}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#ef4444',
                        border: 'none',
                        color: '#fff',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disponibilités */}
          <DisponibilitesCalendar dispos={dispos} setDispos={setDispos} />
        </div>

        {/* Bouton de soumission */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#6b7280' : '#10b981',
              border: 'none',
              color: '#fff',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto',
              transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Ajout en cours...
              </>
            ) : (
              <>
                <FaSave />
                Ajouter le bateau
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
