import React, { useEffect, useState } from 'react';

type Categorie = {
  id: number;
  name: string;
  description: string | null;
  dueDate: string | null;
  isArchived: boolean;
};

const Categorie: React.FC = () => {
  const [categorie, setCategorie] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState<Categorie | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', dueDate: '', isArchived: false });

  const fetchCategorie = () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setError('Non authentifié. Veuillez vous connecter.');
      setLoading(false);
      return;
    }

    fetch('http://127.0.0.1:8000/api/categorie/all', {
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
            throw new Error(errorData?.message || errorData?.error || `HTTP ${res.status}: Failed to fetch categorie`);
          } catch (e) {
            throw new Error(`HTTP ${res.status}: ${text || 'Failed to fetch categorie'}`);
          }
        }
        return res.json();
      })
      .then((data) => {
        console.log('Categorie loaded:', data);
        setCategorie(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError(err.message || 'Unknown error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategorie();
  }, []);

  const openEditModal = (categorie: Categorie) => {
    setEditingCategorie(categorie);
    setFormData({
      name: categorie.name,
      description: categorie.description || '',
      dueDate: categorie.dueDate ? categorie.dueDate.substring(0, 16) : '',
      isArchived: categorie.isArchived
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategorie(null);
    setFormData({ name: '', description: '', dueDate: '', isArchived: false });
  };

  const handleUpdateCategorie = async () => {
    if (!editingCategorie) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Non authentifié');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/categorie/${editingCategorie.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          dueDate: formData.dueDate || null,
          isArchived: formData.isArchived
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      const result = await response.json();
      console.log('Categorie updated:', result);
      
      closeModal();
      fetchCategorie(); // Recharger la liste des tâches
    } catch (err: any) {
      console.error('Update error:', err);
      alert(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteCategorie = async (categorieId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Non authentifié');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/apiS/categorie/${categorieId}`, {
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

      console.log('Categorie deleted');
      fetchCategorie(); // Recharger la liste des tâches
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
        <a href="/admin/tasks"> Tasks</a>
        <a href="/admin/users">Users</a>
        <a href="/admin/categorie">Categories</a>
      </nav>
      <div className="container">
        <h1>Categorie</h1>
        {categorie.length === 0 ? (
          <div>Pas de taches trouvées.</div>
        ) : (
          <table>
            {categorie.map((categorie) => (
              <tr key={categorie.id} style={{ marginBottom: '1rem' }}>
                <td><strong>{categorie.name}</strong></td>
                <td>{categorie.description || <em>No description</em>}</td>
                <td>
                  Due Date:{' '}
                  {categorie.dueDate
                    ? new Date(categorie.dueDate).toLocaleString()
                    : <em>None</em>}
                </td>
                <td>Archived: {categorie.isArchived ? 'Yes' : 'No'}</td>
                <td>
                  <button 
                    onClick={() => openEditModal(categorie)}
                    style={{ cursor: 'pointer' }}
                  >
                    Update
                  </button>
                </td>
                <td>
                  <button 
                    onClick={() => handleDeleteCategorie(categorie.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </table>

        )}
      </div>

      {/* Modal pour éditer une tâche */}
      {showModal && editingCategorie && (
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
            <h2 style={{ color: 'black' }}>Modifier la tâche</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'black' }}>
                Nom de la tâche *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
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
                Date d'échéance
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isArchived}
                  onChange={(e) => setFormData({ ...formData, isArchived: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ color: 'black' }}>Archiver cette tâche</span>
              </label>
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
                Cancel
              </button>
              <button
                onClick={handleUpdateCategorie}
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

export default Categorie;
