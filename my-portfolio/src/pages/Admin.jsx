import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { fetchProjects, uploadImageToGitHub, updateProjectsJson } from '../githubApi';

const ADMIN_PASS = 'super_secret_123'; // Пароль для входа

export default function Admin() {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [github, setGithub] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (pass === ADMIN_PASS) setIsAuth(true);
    else alert('Неверный пароль!');
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!file) return alert('Выберите картинку!');
    
    setLoading(true);
    setStatus('Сжатие картинки...');

    try {
      // 1. Сжимаем картинку до 500 КБ, чтобы GitHub точно принял
      const options = { maxSizeMB: 0.5, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      
      setStatus('Загрузка картинки на GitHub...');
      const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const imageUrl = await uploadImageToGitHub(compressedFile, fileName);

      setStatus('Обновление списка проектов...');
      // 2. Качаем текущий JSON, добавляем новый проект, сохраняем
      const currentProjects = await fetchProjects();
      const newProject = { title, description: desc, github, image: imageUrl };
      await updateProjectsJson([...currentProjects, newProject]);

      setStatus('✅ Успешно! Перенаправление...');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error(error);
      setStatus('❌ Ошибка: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <div style={{ maxWidth: '300px', margin: '100px auto', textAlign: 'center' }}>
        <h2>Вход в админку</h2>
        <form onSubmit={handleLogin}>
          <input type="password" placeholder="Пароль" value={pass} onChange={e => setPass(e.target.value)} style={{padding: '10px', width: '100%', marginBottom: '10px', boxSizing: 'border-box'}} />
          <button type="submit" style={{padding: '10px', width: '100%'}}>Войти</button>
        </form>
        <Link to="/" style={{display: 'block', marginTop: '15px', fontSize: '14px'}}>← На главную</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
      <h2>Добавить проект</h2>
      <p style={{color: '#666', fontSize: '14px'}}>Данные будут сохранены прямо в ваш GitHub репозиторий.</p>
      
      <form onSubmit={handlePublish}>
        <input placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} required style={{width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box'}} />
        <textarea placeholder="Описание" value={desc} onChange={e => setDesc(e.target.value)} required style={{width: '100%', padding: '10px', marginBottom: '10px', minHeight: '80px', boxSizing: 'border-box'}} />
        <input placeholder="Ссылка на GitHub" value={github} onChange={e => setGithub(e.target.value)} required style={{width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box'}} />
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} required style={{marginBottom: '20px'}} />
        
        <button type="submit" disabled={loading} style={{width: '100%', padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px'}}>
          {loading ? 'Подождите...' : 'Опубликовать'}
        </button>
        
        {status && <p style={{marginTop: '15px', fontWeight: 'bold', color: status.includes('❌') ? 'red' : '#333'}}>{status}</p>}
      </form>
    </div>
  );
}