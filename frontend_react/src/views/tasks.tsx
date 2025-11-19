import React, { useEffect, useState } from 'react';

type Task = {
  id: number;
  name: string;
  description: string | null;
  dueDate: string | null;
  isArchived: boolean;
};

const tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/tasks')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch tasks');
        }
        return res.json();
      })
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unknown error');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Tasks</h1>
      {tasks.length === 0 ? (
        <div>Pas de taches trouvées.</div>
      ) : (
        <table>
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
            </tr>
          ))}
        </table>

      )}
    </div>
  );
};

export default tasks;
