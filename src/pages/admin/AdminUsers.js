import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaUserShield, FaUserTie, FaUser } from 'react-icons/fa';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newUser, setNewUser] = useState({ email: '', prenom: '', nom: '', agence: '', phone: '', countryCode: '', role: '', password: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

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
    setError(''); 
    setSuccess('');
    setActionLoading(id);
    try {
      await updateDoc(doc(db, 'users', id), { role: newRole });
      setSuccess('Rôle mis à jour avec succès !');
      fetchUsers();
    } catch (err) {
      setError("Erreur lors de la mise à jour : " + err.message);
    }
    setActionLoading(null);
  }

  async function handleDeleteUser(id) {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    setError(''); 
    setSuccess('');
    setActionLoading(id);
    try {
      await deleteDoc(doc(db, 'users', id));
      setSuccess('Utilisateur supprimé avec succès !');
      fetchUsers();
    } catch (err) {
      setError("Erreur lors de la suppression : " + err.message);
    }
    setActionLoading(null);
  }

  async function handleAddUser(e) {
    e.preventDefault();
    setError(''); 
    setSuccess('');
    setActionLoading('add');
    try {
      // Création dans Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      // Préparer l'objet sans le champ password
      const { password, ...userData } = newUser;
      await setDoc(doc(db, 'users', cred.user.uid), {
        ...userData,
        uid: cred.user.uid,
        createdAt: new Date().toISOString()
      });
      setSuccess('Utilisateur ajouté avec succès !');
      setNewUser({ email: '', prenom: '', nom: '', agence: '', phone: '', countryCode: '', role: '', password: '' });
      setShowAdd(false);
      fetchUsers();
    } catch (err) {
      setError("Erreur lors de l'ajout : " + err.message);
    }
    setActionLoading(null);
  }

  const getRoleIcon = (role) => {
    switch(role) {
      case 'Admin': return <FaUserShield style={{ color: '#ef4444' }} />;
      case 'agence': return <FaUserTie style={{ color: '#3b82f6' }} />;
      default: return <FaUser style={{ color: '#6b7280' }} />;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'Admin': return '#ef4444';
      case 'agence': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #2a2d35',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ 
          color: '#9ca3af', 
          fontSize: '16px', 
          fontWeight: 500 
        }}>
          Chargement des utilisateurs...
        </p>
      </div>
    );
  }

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
        marginBottom: '32px' 
      }}>
        <div>
          <h1 style={{ 
            margin: 0,
            fontSize: '28px',
            fontWeight: 700,
            color: '#e8eaed',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaUsers style={{ color: '#3b82f6' }} />
            Gestion des utilisateurs
          </h1>
          <p style={{ 
            margin: 0, 
            color: '#9ca3af', 
            fontSize: '16px' 
          }}>
            Gérez les utilisateurs, leurs rôles et permissions
          </p>
        </div>
        <button 
          onClick={() => setShowAdd(v => !v)} 
          style={{
            background: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontWeight: 600,
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <FaPlus />
          Ajouter un utilisateur
        </button>
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

      {/* Formulaire d'ajout */}
      {showAdd && (
        <div style={{
          background: '#1a1d23',
          borderRadius: '12px',
          padding: '32px',
          border: '1px solid #2a2d35',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          marginBottom: '24px'
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
            <FaPlus style={{ color: '#10b981' }} />
            Ajouter un nouvel utilisateur
          </h3>
          
      <form onSubmit={handleAddUser}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 600,
              color: '#e8eaed',
              fontSize: '14px'
            }}>
              Prénom *
            </label>
            <input 
              type="text" 
              placeholder="Prénom" 
              value={newUser.prenom} 
              onChange={e => setNewUser({ ...newUser, prenom: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#2a2d35',
                color: '#e8eaed'
              }}
              required 
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 600,
              color: '#e8eaed',
              fontSize: '14px'
            }}>
              Nom *
            </label>
            <input 
              type="text" 
              placeholder="Nom" 
              value={newUser.nom} 
              onChange={e => setNewUser({ ...newUser, nom: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#2a2d35',
                color: '#e8eaed'
              }}
              required 
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 600,
              color: '#e8eaed',
              fontSize: '14px'
            }}>
              Email *
            </label>
            <input 
              type="email" 
              placeholder="Email" 
              value={newUser.email} 
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#2a2d35',
                color: '#e8eaed'
              }}
              required 
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 600,
              color: '#e8eaed',
              fontSize: '14px'
            }}>
              Mot de passe *
            </label>
            <input 
              type="password" 
              placeholder="Mot de passe" 
              value={newUser.password} 
              onChange={e => setNewUser({ ...newUser, password: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#2a2d35',
                color: '#e8eaed'
              }}
              required 
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 600,
              color: '#e8eaed',
              fontSize: '14px'
            }}>
              Nom de l'agence *
            </label>
            <input 
              type="text" 
              placeholder="Nom de l'agence" 
              value={newUser.agence} 
              onChange={e => setNewUser({ ...newUser, agence: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#2a2d35',
                color: '#e8eaed'
              }}
              required 
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 600,
              color: '#e8eaed',
              fontSize: '14px'
            }}>
              Téléphone *
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="+33" 
                value={newUser.countryCode} 
                onChange={e => setNewUser({ ...newUser, countryCode: e.target.value })}
                style={{
                  width: '80px',
                  padding: '12px 16px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: '#2a2d35',
                  color: '#e8eaed'
                }}
                required 
              />
              <input 
                type="text" 
                placeholder="Téléphone" 
                value={newUser.phone} 
                onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: '#2a2d35',
                  color: '#e8eaed'
                }}
                required 
              />
            </div>
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 600,
              color: '#e8eaed',
              fontSize: '14px'
            }}>
              Rôle *
            </label>
            <select 
              value={newUser.role} 
              onChange={e => setNewUser({ ...newUser, role: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#2a2d35',
                color: '#e8eaed'
              }}
              required
            >
              <option value="">Sélectionner un rôle</option>
              <option value="Admin">Admin</option>
              <option value="agence">Agence</option>
              <option value="">Utilisateur</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={() => setShowAdd(false)}
            style={{
              background: '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Annuler
          </button>
          <button 
            type="submit"
            disabled={actionLoading === 'add'}
            style={{
              background: actionLoading === 'add' ? '#6b7280' : '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: actionLoading === 'add' ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {actionLoading === 'add' ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Ajout...
              </>
            ) : (
              <>
                <FaPlus />
                Ajouter
              </>
            )}
          </button>
        </div>
      </form>
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div style={{
        background: '#1a1d23',
        borderRadius: '12px',
        border: '1px solid #2a2d35',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        <div style={{
          overflowX: 'auto'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ 
                background: '#2a2d35',
                borderBottom: '1px solid #374151'
              }}>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Utilisateur
                </th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Email
                </th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Agence
                </th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Téléphone
                </th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Rôle
                </th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#e8eaed',
                  fontSize: '14px'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user.id} style={{ 
                  borderBottom: '1px solid #374151',
                  transition: 'background-color 0.2s'
                }}>
                  <td style={{
                    padding: '16px 12px',
                    color: '#e8eaed'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {getRoleIcon(user.role)}
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.prenom} {user.nom}</div>
                        <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                          {user.role || 'Utilisateur'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{
                    padding: '16px 12px',
                    color: '#9ca3af'
                  }}>
                    {user.email}
                  </td>
                  <td style={{
                    padding: '16px 12px',
                    color: '#9ca3af'
                  }}>
                    {user.agence}
                  </td>
                  <td style={{
                    padding: '16px 12px',
                    color: '#9ca3af'
                  }}>
                    {user.countryCode} {user.phone}
                  </td>
                  <td style={{
                    padding: '16px 12px'
                  }}>
                    <select 
                      value={user.role || ''} 
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      disabled={actionLoading === user.id}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        fontSize: '12px',
                        background: '#2a2d35',
                        color: getRoleColor(user.role),
                        fontWeight: 600,
                        cursor: actionLoading === user.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="">Utilisateur</option>
                      <option value="Admin">Admin</option>
                      <option value="agence">Agence</option>
                    </select>
                  </td>
                  <td style={{
                    padding: '16px 12px',
                    textAlign: 'center'
                  }}>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={actionLoading === user.id}
                      style={{
                        background: actionLoading === user.id ? '#6b7280' : '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: actionLoading === user.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {actionLoading === user.id ? (
                        <div style={{
                          width: '12px',
                          height: '12px',
                          border: '2px solid transparent',
                          borderTop: '2px solid #fff',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                      ) : (
                        <FaTrash />
                      )}
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#9ca3af'
          }}>
            <FaUsers style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>Aucun utilisateur trouvé</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>Ajoutez votre premier utilisateur pour commencer</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )}


