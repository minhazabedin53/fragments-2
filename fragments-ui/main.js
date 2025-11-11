const cfg = {
  API_URL: import.meta.env.VITE_API_URL,
  DOMAIN: import.meta.env.VITE_COGNITO_DOMAIN,
  CLIENT_ID: import.meta.env.VITE_CLIENT_ID,
  REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI,
  LOGOUT_URI: import.meta.env.VITE_LOGOUT_URI,
  SCOPES: (import.meta.env.VITE_SCOPES || 'openid email profile').replace(/\s+/g, ' '),
};

document.getElementById('api').textContent = cfg.API_URL;
document.getElementById('domain').textContent = cfg.DOMAIN;

const out = (msg) => (document.getElementById('out').textContent = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2));

// Parse tokens from URL hash for implicit flow (#access_token=...)
function parseHash() {
  const h = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  const params = new URLSearchParams(h);
  const access_token = params.get('access_token');
  const id_token = params.get('id_token');
  const token_type = params.get('token_type');
  const expires_in = params.get('expires_in');
  if (access_token) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  return { access_token, id_token, token_type, expires_in };
}

let tokens = parseHash();
const loggedIn = !!tokens.access_token;

const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const createBtn = document.getElementById('create');

function login() {
  const url =
    `${cfg.DOMAIN}/oauth2/authorize?` +
    new URLSearchParams({
      client_id: cfg.CLIENT_ID,
      response_type: 'token', // implicit → get access_token quickly
      scope: cfg.SCOPES,
      redirect_uri: cfg.REDIRECT_URI,
    }).toString();
  window.location.replace(url);
}

function logout() {
  const url =
    `${cfg.DOMAIN}/logout?` +
    new URLSearchParams({
      client_id: cfg.CLIENT_ID,
      logout_uri: cfg.LOGOUT_URI,
      redirect_uri: cfg.REDIRECT_URI,
    }).toString();
  window.location.replace(url);
}

async function createFragment() {
  const text = document.getElementById('text').value || '';
  if (!text) return out('Type something first.');
  try {
    const res = await fetch(`${cfg.API_URL}/v1/fragments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'text/plain',
      },
      body: text,
    });
    const json = await res.json().catch(() => ({}));
    out({ status: res.status, headers: Object.fromEntries(res.headers), body: json });
  } catch (err) {
    out(String(err));
  }
}

// Wire UI state
document.getElementById('auth').innerHTML = loggedIn
  ? `<b>Logged in.</b> <div class="small">Access Token:</div><div class="token small">${tokens.access_token}</div>`
  : `<b>Logged out.</b>`;

loginBtn.onclick = login;
logoutBtn.onclick = logout;
createBtn.onclick = createFragment;

logoutBtn.disabled = !loggedIn;
createBtn.disabled = !loggedIn;