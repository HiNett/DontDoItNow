import React, { useEffect, useState } from 'react';

type Categorie = {
  id: number;
  label: string;
  color: string;
};

const Categorie: React.FC = () => {
  const [categorie, setCategorie] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pour le modal d'édition
  const [showModal, setShowModal] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState<Categorie | null>(null);
  const [formData, setFormData] = useState({ label: '', color: '' });
  
  // Pour le modal de création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({ label: '', color: '#000000' });

  const fetchCategorie = () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setError('Non authentifié. Veuillez vous connecter.');
      setLoading(false);
      return;
    }

    fetch('http://127.0.0.1:8000/api/categories', {
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
      label: categorie.label,
      color: categorie.color
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategorie(null);
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

  const handleCreateCategorie = async () => {
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
      const response = await fetch('http://127.0.0.1:8000/api/admin/categories', {
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
      fetchCategorie();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de la catégorie');
    }
  };

  // ---- FIN MODAL CREATION LOGIC ----

  const handleUpdateCategorie = async () => {
    if (!editingCategorie) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Non authentifié');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/categories/${editingCategorie.id}`, {
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
      console.log('Categorie updated:', result);
      
      closeModal();
      fetchCategorie(); // Recharger la liste des catégories
    } catch (err: any) {
      console.error('Update error:', err);
      alert(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteCategorie = async (categorieId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Non authentifié');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/categories/${categorieId}`, {
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
      fetchCategorie(); // Recharger la liste des catégories
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
        <a href="/admin/categorie">Categories</a>
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
        {categorie.length === 0 ? (
          <div>Pas de catégories trouvées.</div>
        ) : (
          <table>
            <tbody>
            {categorie.map((categorie) => (
              <tr key={categorie.id} style={{ marginBottom: '1rem' }}>
                <td><strong>{categorie.label}</strong></td>
                <td>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px' 
                  }}>
                    <div style={{ 
                      width: '30px', 
                      height: '30px', 
                      backgroundColor: categorie.color,
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}></div>
                    <span>{categorie.color}</span>
                  </div>
                </td>
                <td>
                  <button 
                    onClick={() => openEditModal(categorie)}
                    style={{ cursor: 'pointer' }}
                  >
                    Modifier
                  </button>
                </td>
                <td>
                  <button 
                    onClick={() => handleDeleteCategorie(categorie.id)}
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
                onClick={handleCreateCategorie}
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
