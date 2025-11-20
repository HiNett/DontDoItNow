import React, { useEffect, useState } from 'react';

type Task = {
  id: number;
  name: string;
  description: string | null;
  dueDate: string | null;
  isArchived: boolean;
};

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    console.log("Token from localStorage:", token ? token.substring(0, 50) + "..." : "NO TOKEN");
    
    if (!token) {
      setError('Non authentifié. Veuillez vous connecter.');
      setLoading(false);
      return;
    }

    fetch('http://127.0.0.1:8000/api/tasks', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(async (res) => {
        console.log('Response status:', res.status);
        console.log('Response ok:', res.ok);
        console.log('Response headers:', res.headers);
        
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('authToken');
            throw new Error('Session expirée. Veuillez vous reconnecter.');
          }
          // En cas d'erreur, j'ai rajouté ces lignes, au moins on a la réponse complète du serveur (bon en HTML, mais c'est déjà mieux que rien)
          const text = await res.text();
          console.error('Error response (text):', text);
          try {
            const errorData = JSON.parse(text);
            throw new Error(errorData?.message || errorData?.error || `HTTP ${res.status}: Failed to fetch tasks`);
          } catch (e) {
            throw new Error(`HTTP ${res.status}: ${text || 'Failed to fetch tasks'}`);
          }
        }
        return res.json();
      })
      .then((data) => {
        console.log('Tasks loaded:', data);
        setTasks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError(err.message || 'Unknown error');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
<<<<<<< Updated upstream
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Tasks</h1>
      {tasks.length === 0 ? (
        <div>Pas de taches trouvées.</div>
      ) : (
        <table>
          <tbody>
=======
    
    <div>
      <nav className="nav">nav</nav>
      <div className="container">
        <h1>Tasks</h1>
        {tasks.length === 0 ? (
          <div>Pas de taches trouvées.</div>
        ) : (
          <table>
>>>>>>> Stashed changes
            {tasks.map((task) => (
              <tr key={task.id} style={{ marginBottom: '1rem' }}>
                <td><strong>{task.name}</strong></td>
                <td>{task.description || <em>No description</em>}</td>
                <td>
                  Due Date:{' '}
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleString()
                    : <em>None</em>}
                </td>
                <td>Archived: {task.isArchived ? 'Yes' : 'No'}</td>
<<<<<<< Updated upstream
              </tr>
            ))}
          </tbody>
        </table>
=======
                <td><a href={`update/${task.id}`}>Update</a></td>
                <td><a href={`delete/${task.id}`}>Delete</a></td>
              </tr>
            ))}
          </table>
>>>>>>> Stashed changes

        )}
      </div>
    </div>
  );
};

export default Tasks;
