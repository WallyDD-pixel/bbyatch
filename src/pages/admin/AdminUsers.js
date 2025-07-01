import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError("Erreur lors du chargement : " + err.message);
    }
    setLoading(false);
  }

  async function handleRoleChange(id, newRole) {
    setError(''); setSuccess('');
    try {
      await updateDoc(doc(db, 'users', id), { role: newRole });
      setSuccess('Rôle mis à jour !');
      fetchUsers();
    } catch (err) {
      setError("Erreur lors de la mise à jour : " + err.message);
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    setError(''); setSuccess('');
    try {
      await deleteDoc(doc(db, 'users', id));
      setSuccess('Utilisateur supprimé !');
      fetchUsers();
    } catch (err) {
      setError("Erreur lors de la suppression : " + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(30,60,60,0.08)' }}>
      <h2 style={{ textAlign: 'center', color: '#1e90ff', marginBottom: 32 }}>Gestion des utilisateurs</h2>
      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: 10 }}>{success}</div>}
      {loading ? (
        <div style={{ textAlign: 'center', margin: 30 }}>Chargement...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, background: '#fff' }}>
          <thead>
            <tr style={{ background: '#e6f0fa' }}>
              <th style={{ padding: 10 }}>Email</th>
              <th style={{ padding: 10 }}>Rôle</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: 8 }}>{user.email}</td>
                <td style={{ padding: 8 }}>
                  <select value={user.role || ''} onChange={e => handleRoleChange(user.id, e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #c0d0e0' }}>
                    <option value="">Utilisateur</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => handleDeleteUser(user.id)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
