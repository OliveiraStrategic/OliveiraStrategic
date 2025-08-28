const https = require('https');
const fs = require('fs');

const GITHUB_USERNAME = 'OliveiraStrategic';
const GITHUB_TOKEN = process.env.PROFILE_PAT; // Pega o token dos Secrets
const README_PATH = './README.md';

// Função para fazer chamadas à API do GitHub (GraphQL e REST)
async function fetchFromGitHub(queryOrPath) {
  const isGraphQL = queryOrPath.trim().startsWith('query');
  const host = 'api.github.com';
  const path = isGraphQL ? '/graphql' : queryOrPath;
  const method = isGraphQL ? 'POST' : 'GET';
  const body = isGraphQL ? JSON.stringify({ query: queryOrPath }) : null;

  const options = {
    hostname: host,
    path: path,
    method: method,
    headers: {
      'User-Agent': 'GitHub-Action',
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`API falhou com status ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', (e) => reject(e));
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

// Função para buscar os repositórios pinados
async function getPinnedRepos() {
  const query = `
    query {
      user(login: "${GITHUB_USERNAME}") {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              stargazerCount
              forkCount
              primaryLanguage {
                name
                color
              }
            }
          }
        }
      }
    }
  `;
  const response = await fetchFromGitHub(query);
  return response.data.user.pinnedItems.nodes;
}

// Função para buscar a atividade recente
async function getActivity() {
    const events = await fetchFromGitHub(`/users/${GITHUB_USERNAME}/events`);
    const activity = events.slice(0, 7).map(e => {
        if (e.type === 'PushEvent') {
            const commitCount = e.payload.size === 1 ? '1 commit' : `${e.payload.size} commits`;
            return `⬆️ Fez push de ${commitCount} para [**${e.repo.name}**](https://github.com/${e.repo.name})`;
        } else if (e.type === 'CreateEvent' && e.payload.ref_type === 'repository') {
            return `✨ Criou o novo repositório [**${e.repo.name}**](https://github.com/${e.repo.name})`;
        }
        return null;
    }).filter(Boolean);
    return activity.length ? activity.join('\n- ') : 'Nenhuma atividade pública recente encontrada.';
}

// Função principal que atualiza o README
async function updateReadme() {
  try {
    let readme = fs.readFileSync(README_PATH, 'utf-8');

    // Atualizar Projetos
    const pinnedRepos = await getPinnedRepos();
    let projectsMarkdown = pinnedRepos.map(repo => 
      `### [${repo.name}](${repo.url})\n*${repo.description}*\n` +
      `⭐ **${repo.stargazerCount}** | 🍴 **${repo.forkCount}** | 🔵 **${repo.primaryLanguage?.name || 'N/A'}**\n---`
    ).join('\n');
    readme = readme.replace(/()[\s\S]*()/, `$1\n${projectsMarkdown}\n$2`);

    // Atualizar Atividade
    const activityMarkdown = `- ${await getActivity()}`;
    readme = readme.replace(/()[\s\S]*()/, `$1\n${activityMarkdown}\n$2`);

    // Atualizar Timestamp
    const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'long', timeStyle: 'short' });
    readme = readme.replace(/()[\s\S]*()/, `$1\n*Última sincronização: ${timestamp} (BRT)*\n$2`);

    fs.writeFileSync(README_PATH, readme);
    console.log('README atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar o README:', error);
    process.exit(1); // Falha o workflow se o script der erro
  }
}

updateReadme();
