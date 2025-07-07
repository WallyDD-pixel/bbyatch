import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function AdminCalendrier() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Exemple de dates réservées (à remplacer par Firestore)
  const reservedDates = [
    new Date(2025, 6, 10),
    new Date(2025, 6, 15),
    new Date(2025, 6, 20)
  ];
  // Exemple de réservations (à remplacer par Firestore)
  const reservations = [
    { date: new Date(2025, 6, 10), bateau: 'Sunseeker 50' },
    { date: new Date(2025, 6, 15), bateau: 'Beneteau Flyer' },
    { date: new Date(2025, 6, 20), bateau: 'Zodiac Pro' }
  ];
  return (
    <div style={{
      maxWidth: 1300,
      margin: '40px auto',
      background: '#232733',
      borderRadius: 22,
      boxShadow: '0 8px 40px #1e90ff33',
      padding: 48,
      minHeight: 800,
      border: '1.5px solid #1e90ff22',
      position: 'relative',
    }}>
      <h2 style={{
        color: '#fff',
        fontWeight: 900,
        textAlign: 'center',
        marginBottom: 38,
        fontSize: 44,
        letterSpacing: 2,
        textShadow: '0 2px 12px #1e90ff44',
      }}>Calendrier des disponibilités</h2>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#232733', borderRadius: 18, boxShadow: '0 2px 16px #1e90ff22', padding: 24 }}>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileDisabled={({ date }) => reservations.some(r => r.date.toDateString() === date.toDateString())}
          tileClassName={({ date }) => reservations.some(r => r.date.toDateString() === date.toDateString()) ? 'reserved-date' : null}
          tileContent={({ date }) => {
            const res = reservations.find(r => r.date.toDateString() === date.toDateString());
            return res ? (
              <div style={{
                background: '#1e90ff',
                color: '#fff',
                borderRadius: 6,
                fontSize: 11,
                marginTop: 2,
                padding: '1px 2px',
                textAlign: 'center',
                fontWeight: 600,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                minHeight: 16
              }}>{res.bateau}</div>
            ) : null;
          }}
          showNeighboringMonth={false}
          minDetail="month"
          maxDetail="month"
          style={{ width: '100%', minWidth: 320, fontSize: 18, background: 'transparent', color: '#222', borderRadius: 12 }}
        />
      </div>
      <div style={{ marginTop: 32, fontSize: 22, textAlign: 'center', color: '#fff', fontWeight: 600, letterSpacing: 1 }}>
        Date sélectionnée : <b style={{ color: '#1e90ff' }}>{selectedDate.toLocaleDateString()}</b>
        {reservedDates.some(d => d.toDateString() === selectedDate.toDateString()) && (
          <span style={{ color: '#e74c3c', marginLeft: 14, fontWeight: 700 }}>(Indisponible)</span>
        )}
      </div>
      <style>{`
        .reserved-date {
          background: linear-gradient(90deg, #e74c3c 60%, #ffb3b3 100%) !important;
          color: #fff !important;
          border-radius: 14px !important;
          font-weight: bold;
          box-shadow: 0 2px 8px #e74c3c33;
        }
        .react-calendar {
          font-size: 1.6rem;
          width: 100% !important;
          max-width: 100% !important;
          background: transparent !important;
          color: #fff !important;
          border: none !important;
        }
        .react-calendar__navigation {
          background: none !important;
          margin-bottom: 18px;
          display: flex;
          flex-wrap: wrap;
        }
        .react-calendar__navigation button {
          color: #1e90ff !important;
          font-size: 2.1rem !important;
          font-weight: 700;
          background: none !important;
          border: none !important;
          border-radius: 8px;
          transition: background 0.2s;
          flex: 1 0 20%;
          min-width: 40px;
        }
        .react-calendar__navigation button:enabled:hover {
          background:rgba(145, 145, 145, 0.13) !important;
        }
        .react-calendar__month-view__weekdays {
          background: none !important;
        }
        .react-calendar__month-view__weekdays__weekday {
          color: #b3c6e0 !important;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 1px;
          background: none !important;
          text-align: center;
        }
        .react-calendar__tile {
          min-width: 110px !important;
          min-height: 90px !important;
          font-size: 1.4rem !important;
          flex: 1 0 14%;
          box-sizing: border-box;
          background: #232733 !important;
          color: #fff !important;
          border-radius: 14px !important;
          margin: 4px !important;
          transition: background 0.2s, color 0.2s;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
        }
        .react-calendar__tile--active {
          background: linear-gradient(90deg, #1e90ff 60%, #4fc3f7 100%) !important;
          color: #fff !important;
          border-radius: 14px !important;
        }
        .react-calendar__tile:enabled:hover {
          background: #1e90ff44 !important;
          color: #fff !important;
        }
        .react-calendar__month-view__days__day {
          min-width: 110px !important;
          min-height: 90px !important;
        }
        .react-calendar__tile > abbr {
          display: block;
          margin-bottom: 4px;
        }
        .react-calendar__month-view__days {
          width: 100% !important;
          max-width: 100% !important;
          display: flex;
          flex-wrap: wrap;
        }
        @media (max-width: 1100px) {
          .react-calendar__tile, .react-calendar__month-view__days__day {
            min-width: 60px !important;
            min-height: 50px !important;
            font-size: 1rem !important;
            margin: 2px !important;
          }
          .react-calendar {
            font-size: 1.1rem !important;
          }
          .react-calendar__navigation button {
            font-size: 1.1rem !important;
          }
        }
        @media (max-width: 700px) {
          .react-calendar__tile, .react-calendar__month-view__days__day {
            min-width: 32px !important;
            min-height: 22px !important;
            font-size: 0.7rem !important;
            margin: 1px !important;
          }
          .react-calendar {
            font-size: 0.7rem !important;
          }
          .react-calendar__navigation button {
            font-size: 0.8rem !important;
            min-width: 24px;
          }
          .react-calendar__month-view__weekdays__weekday {
            font-size: 0.7rem !important;
          }
        }
        @media (max-width: 500px) {
          .react-calendar__tile, .react-calendar__month-view__days__day {
            min-width: 18px !important;
            min-height: 14px !important;
            font-size: 0.55rem !important;
            margin: 0.5px !important;
          }
          .react-calendar {
            font-size: 0.6rem !important;
          }
          .react-calendar__navigation button {
            font-size: 0.7rem !important;
            min-width: 16px;
          }
        }
      `}</style>
    </div>
  );
}
