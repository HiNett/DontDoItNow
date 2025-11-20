import React, { useEffect, useState } from 'react';

type Users = {
  id: number;
  label: string;
  color: string;
};

const Users: React.FC = () => {
  const [users, setUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pour le modal d'édition
  const [showModal, setShowModal] = useState(false);
  const [editingUsers, setEditingUsers] = useState<Users | null>(null);
  const [formData, setFormData] = useState({ label: '', color: '' });
  
  // Pour le modal de création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({ label: '', color: '#000000' });

  const fetchUsers = () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setError('Non authentifié. Veuillez vous connecter.');
      setLoading(false);
      return;
    }

    fetch('http://127.0.0.1:8000/api/userss', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('authToken');
            throw new Error('Session expirée. Veuillez vous reconnecter.');
          }
          const text = await res.text();
          try {
            const errorData = JSON.parse(text);
            throw new Error(errorData?.message || errorData?.error || `HTTP ${res.status}: Failed to fetch users`);
          } catch (e) {
            throw new Error(`HTTP ${res.status}: ${text || 'Failed to fetch users'}`);
          }
        }
        return res.json();
      })
      .then((data) => {
        console.log('Users loaded:', data);
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError(err.message || 'Unknown error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (users: Users) => {
    setEditingUsers(users);
    setFormData({
      label: users.label,
      color: users.color
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUsers(null);
    setFormData({ label: '', color: '' });
  };

  // ---- MODAL CREATION LOGIC ----
  const openCreateModal = () => {
    setCreateFormData({ label: '', color: '#000000' });
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData({ label: '', color: '#000000' });
  };

  const handleCreateUsers = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Non authentifié');
      return;
    }

    if (!createFormData.label.trim()) {
      alert('Le label de la catégorie est requis');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/userss', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          label: createFormData.label,
          color: createFormData.color
        }),
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {}
        throw new Error((errorData as any)?.error || 'Erreur lors de la création de la catégorie');
      }

      await response.json();
      closeCreateModal();
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de la catégorie');
    }
  };

  // ---- FIN MODAL CREATION LOGIC ----

  const handleUpdateUsers = async () => {
    if (!editingUsers) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Non authentifié');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/userss/${editingUsers.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          label: formData.label,
          color: formData.color
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      const result = await response.json();
      console.log('Users updated:', result);
      
      closeModal();
      fetchUsers(); // Recharger la liste des catégories
    } catch (err: any) {
      console.error('Update error:', err);
      alert(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteUsers = async (usersId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Non authentifié');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/userss/${usersId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      console.log('Users deleted');
      fetchUsers(); // Recharger la liste des catégories
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    
    <div>
      <nav className="nav">
        <a href="/admin/dashboard">Dashboard</a>
        <a href="/admin/tasks">Tasks</a>
        <a href="/admin/users">Users</a>
        <a href="/admin/categories">Categories</a>
        <a href="/admin/priorities">Priorities</a>
      </nav>

      <div className="container">
        <h1>Catégories</h1>
        <button 
          style={{ cursor: 'pointer', marginBottom: '20px' }}
          onClick={openCreateModal}
        >
          Nouvelle Catégorie
        </button>
        {users.length === 0 ? (
          <div>Pas de catégories trouvées.</div>
        ) : (
          <table>
            <tbody>
            {users.map((users) => (
              <tr key={users.id} style={{ marginBottom: '1rem' }}>
                <td><strong>{users.label}</strong></td>
                <td>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px' 
                  }}>
                    <div style={{ 
                      width: '30px', 
                      height: '30px', 
                      backgroundColor: users.color,
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}></div>
                    <span>{users.color}</span>
                  </div>
                </td>
                <td>
                  <button 
                    onClick={() => openEditModal(users)}
                    style={{ cursor: 'pointer' }}
                  >
                    Modifier
                  </button>
                </td>
                <td>
                  <button 
                    onClick={() => handleDeleteUsers(users.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>

        )}
      </div>

      {/* Modal pour créer une catégorie */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            minWidth: '400px',
            maxWidth: '600px'
          }}>
            <h2 style={{ color: 'black' }}>Créer une nouvelle catégorie</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'black' }}>
                Label de la catégorie *
              </label>
              <input
                type="text"
                value={createFormData.label}
                onChange={(e) => setCreateFormData({ ...createFormData, label: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'black' }}>
                Couleur *
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={createFormData.color}
                  onChange={(e) => setCreateFormData({ ...createFormData, color: e.target.value })}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="text"
                  value={createFormData.color}
                  onChange={(e) => setCreateFormData({ ...createFormData, color: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeCreateModal}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  color: 'black'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreateUsers}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour éditer une catégorie */}
      {showModal && editingUsers && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            minWidth: '400px',
            maxWidth: '600px'
          }}>
            <h2 style={{ color: 'black' }}>Modifier la catégorie</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'black' }}>
                Label de la catégorie *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'black' }}>
                Couleur *
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  color: 'black'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateUsers}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
