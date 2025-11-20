import React, { useEffect, useState } from 'react';

type Priorite = {
  id: number;
  label: string;
};

const Priorite: React.FC = () => {
  const [priorite, setPriorite] = useState<Priorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pour le modal d'édition
  const [showModal, setShowModal] = useState(false);
  const [editingPriorite, setEditingPriorite] = useState<Priorite | null>(null);
  const [formData, setFormData] = useState({ label: '' });
  
  // Pour le modal de création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({ label: '' });

  const fetchPriorite = () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setError('Non authentifié. Veuillez vous connecter.');
      setLoading(false);
      return;
    }

    fetch('http://127.0.0.1:8000/api/priorities', {
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
            throw new Error(errorData?.message || errorData?.error || `HTTP ${res.status}: Failed to fetch priorite`);
          } catch (e) {
            throw new Error(`HTTP ${res.status}: ${text || 'Failed to fetch priorite'}`);
          }
        }
        return res.json();
      })
      .then((data) => {
        console.log('Priorite loaded:', data);
        setPriorite(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError(err.message || 'Unknown error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPriorite();
  }, []);

  const openEditModal = (priorite: Priorite) => {
    setEditingPriorite(priorite);
    setFormData({
      label: priorite.label
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPriorite(null);
    setFormData({ label: '' });
  };

  // ---- MODAL CREATION LOGIC ----
  const openCreateModal = () => {
    setCreateFormData({ label: '' });
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData({ label: '' });
  };

  const handleCreatePriorite = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Non authentifié');
      return;
    }

    if (!createFormData.label.trim()) {
      alert('Le label de la priorité est requis');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/priorities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          label: createFormData.label
        }),
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {}
        throw new Error((errorData as any)?.error || 'Erreur lors de la création de la priorité');
      }

      await response.json();
      closeCreateModal();
      fetchPriorite();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de la priorité');
    }
  };

  // ---- FIN MODAL CREATION LOGIC ----

  const handleUpdatePriorite = async () => {
    if (!editingPriorite) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Non authentifié');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/priorities/${editingPriorite.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          label: formData.label
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      const result = await response.json();
      console.log('Priorite updated:', result);
      
      closeModal();
      fetchPriorite(); // Recharger la liste des priorités
    } catch (err: any) {
      console.error('Update error:', err);
      alert(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeletePriorite = async (prioriteId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette priorité ?')) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Non authentifié');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/priorities/${prioriteId}`, {
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

      console.log('Priorite deleted');
      fetchPriorite(); // Recharger la liste des priorités
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
        <h1>Priorités</h1>
        <button 
          style={{ cursor: 'pointer', marginBottom: '20px' }}
          onClick={openCreateModal}
        >
          Nouvelle Priorité
        </button>
        {priorite.length === 0 ? (
          <div>Pas de priorités trouvées.</div>
        ) : (
          <table>
            <tbody>
            {priorite.map((priorite) => (
              <tr key={priorite.id} style={{ marginBottom: '1rem' }}>
                <td><strong>{priorite.label}</strong></td>
                <td>
                  <button 
                    onClick={() => openEditModal(priorite)}
                    style={{ cursor: 'pointer' }}
                  >
                    Modifier
                  </button>
                </td>
                <td>
                  <button 
                    onClick={() => handleDeletePriorite(priorite.id)}
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

      {/* Modal pour créer une priorité */}
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
            <h2 style={{ color: 'black' }}>Créer une nouvelle priorité</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'black' }}>
                Label de la priorité *
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
                onClick={handleCreatePriorite}
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

      {/* Modal pour éditer une priorité */}
      {showModal && editingPriorite && (
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
            <h2 style={{ color: 'black' }}>Modifier la priorité</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'black' }}>
                Label de la priorité *
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
                onClick={handleUpdatePriorite}
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

export default Priorite;

