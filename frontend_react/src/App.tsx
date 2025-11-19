import React, { useEffect, useState } from 'react';

type Task = {
  id: number;
  name: string;
  description: string | null;
  dueDate: string | null;
  isArchived: boolean;
};

const App: React.FC = () => {
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
        <div>No tasks found.</div>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} style={{ marginBottom: '1rem' }}>
              <strong>{task.name}</strong>
              <div>Description: {task.description || <em>No description</em>}</div>
              <div>
                Due Date:{' '}
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleString()
                  : <em>None</em>}
              </div>
              <div>Archived: {task.isArchived ? 'Yes' : 'No'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default App;
