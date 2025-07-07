import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fr } from 'date-fns/locale';
import { format, parse, startOfWeek, getDay } from 'date-fns';

const locales = { fr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function EditerDisponibilitesBateau() {
  const { id } = useParams();
  const [bateau, setBateau] = useState(null);
  const [dispos, setDispos] = useState([]);
  const [heureDebut, setHeureDebut] = useState('09:00');
  const [heureFin, setHeureFin] = useState('18:00');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBateau() {
      setLoading(true);
      const docRef = doc(db, 'bateaux', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBateau({ id: docSnap.id, ...docSnap.data() });
        setDispos(Array.isArray(docSnap.data().disponibilites)
          ? docSnap.data().disponibilites.map(d => ({
              start: new Date(d.start),
              end: new Date(d.end)
            }))
          : []);
      }
      setLoading(false);
    }
    fetchBateau();
  }, [id]);

  // Ajout d'un ou plusieurs créneaux sur sélection de jours
  const handleSelectSlot = ({ start, end, action }) => {
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

  const handleSave = async () => {
    setError(''); setSuccess('');
    try {
      const disponibilites = dispos.map(d => ({
        start: d.start instanceof Date ? d.start.toISOString() : d.start,
        end: d.end instanceof Date ? d.end.toISOString() : d.end
      }));
      await updateDoc(doc(db, 'bateaux', id), { disponibilites });
      setSuccess('Disponibilités enregistrées !');
      setTimeout(() => navigate('/agence/dashboard/reservations'), 1200);
    } catch (err) {
      setError('Erreur : ' + err.message);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!bateau) return <div>Bateau introuvable</div>;

  const events = dispos.map((d, i) => ({
    id: i,
    title: `${('0'+new Date(d.start).getHours()).slice(-2)}:${('0'+new Date(d.start).getMinutes()).slice(-2)} - ${('0'+new Date(d.end).getHours()).slice(-2)}:${('0'+new Date(d.end).getMinutes()).slice(-2)}`,
    start: new Date(d.start),
    end: new Date(d.end),
    allDay: false,
  }));

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #1e90ff22' }}>
      <h2 style={{ color: '#1e90ff', marginBottom: 24 }}>Modifier les disponibilités de {bateau.nom}</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div>
          <span style={{ fontWeight: 500, marginRight: 6 }}>Heure début</span>
          <input type="time" value={heureDebut} onChange={e => setHeureDebut(e.target.value)} />
        </div>
        <div>
          <span style={{ fontWeight: 500, marginRight: 6 }}>Heure fin</span>
          <input type="time" value={heureFin} onChange={e => setHeureFin(e.target.value)} />
        </div>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700, marginBottom: 24 }}
        className="calendar-large-cells"
        messages={{
          next: 'Suivant', previous: 'Précédent', today: "Aujourd'hui", month: 'Mois', week: 'Semaine', day: 'Jour', agenda: 'Agenda', date: 'Date', time: 'Heure', event: 'Créneau', noEventsInRange: 'Aucune disponibilité',
        }}
        culture="fr"
        views={['month', 'week', 'day']}
        min={new Date(2025, 0, 1, 6, 0)}
        max={new Date(2025, 0, 1, 22, 0)}
        step={30}
        timeslots={2}
        defaultView="month"
      />
      <style>{`
        .calendar-large-cells .rbc-month-view .rbc-date-cell {
          min-width: 90px;
          font-size: 16px;
        }
        .calendar-large-cells .rbc-month-row {
          min-height: 90px;
        }
        .calendar-large-cells .rbc-event-content {
          font-size: 15px;
        }
      `}</style>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 18 }}>
        1. Choisissez une tranche horaire.<br />
        2. Cliquez ou glissez sur les jours du calendrier pour ajouter des créneaux.<br />
        3. Cliquez sur un créneau pour le supprimer.<br />
        4. Pour définir une heure différente sur un autre jour, changez la tranche horaire puis cliquez sur le(s) jour(s) souhaité(s).
      </div>
      <button className="btn btn-success" onClick={handleSave}>Enregistrer</button>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 12 }}>{success}</div>}
    </div>
  );
}
