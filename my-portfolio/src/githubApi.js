// ⚠️ ВНИМАНИЕ: Замените на свои данные!
const GITHUB_USER = 'Alex-Grigorovich';
const GITHUB_REPO = 'Portfolio';
const GITHUB_TOKEN = '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'; // (лучше вынести в .env, но для туториала оставим так)

const API_BASE = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}`;
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main`;

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
};

// 1. Получить список проектов (читаем напрямую, без токена, это быстро)
export async function fetchProjects() {
  const res = await fetch(`${RAW_BASE}/public/projects.json?t=${Date.now()}`); // ?t= чтобы не было кэша
  if (!res.ok) throw new Error('Ошибка загрузки проектов');
  return res.json();
}

// 2. Загрузить картинку в репозиторий
export async function uploadImageToGitHub(file, fileName) {
  // Кодируем в Base64
  const base64 = await fileToBase64(file);
  
  const path = `public/images/${fileName}`;
  
  const res = await fetch(`${API_BASE}/contents/${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `Add image ${fileName}`,
      content: base64,
    }),
  });

  if (!res.ok) throw new Error('Ошибка загрузки картинки');
  
  // Возвращаем прямую ссылку на картинку
  const data = await res.json();
  return data.content.download_url; 
}

// 3. Обновить файл projects.json
export async function updateProjectsJson(projectsArray) {
  // Сначала нужно получить текущий SHA файла, чтобы обновить его
  const fileRes = await fetch(`${API_BASE}/contents/public/projects.json`, { headers });
  const fileData = await fileRes.json();
  const currentSha = fileData.sha;

  // Теперь обновляем
  const res = await fetch(`${API_BASE}/contents/public/projects.json`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: 'Update projects list',
      content: btoa(unescape(encodeURIComponent(JSON.stringify(projectsArray, null, 2)))),
      sha: currentSha,
    }),
  });

  if (!res.ok) throw new Error('Ошибка обновления JSON');
  return res.json();
}

// Вспомогательная функция
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]); // Убираем префикс data:image/...
    reader.onerror = (error) => reject(error);
  });
}