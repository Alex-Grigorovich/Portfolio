import { useState, useEffect } from 'react';
import { fetchProjects } from '../githubApi';
import { Link } from 'react-router-dom';

export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding: '20px'}}>Загрузка портфолио...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Мое Портфолио</h1>
        <Link to="/admin" style={{fontSize: '14px', color: '#666'}}>Админка →</Link>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {projects.length === 0 && <p>Проектов пока нет.</p>}
        
        {projects.map((p, i) => (
          <div key={i} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <img src={p.image} alt={p.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '15px' }}>
              <h3 style={{margin: '0 0 10px 0'}}>{p.title}</h3>
              <p style={{margin: '0 0 15px 0', color: '#555'}}>{p.description}</p>
              <a href={p.github} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
                GitHub ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}