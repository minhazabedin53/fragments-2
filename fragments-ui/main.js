// fragments-ui/src/main.js
const apiUrl = import.meta.env.VITE_API_URL;
const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
const clientId = import.meta.env.VITE_CLIENT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;
const logoutUri = import.meta.env.VITE_LOGOUT_URI;
const scopes =
  import.meta.env.VITE_SCOPES || "openid email profile";

const tokenKey = "fragments_access_token";

// ---------- Helpers ----------

function getAccessToken() {
  return window.localStorage.getItem(tokenKey) || "";
}

function setAccessToken(token) {
  if (token) window.localStorage.setItem(tokenKey, token);
}

function clearAccessToken() {
  window.localStorage.removeItem(tokenKey);
}

function parseHashTokens() {
  if (!window.location.hash.startsWith("#")) return null;

  const hash = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = hash.get("access_token");
  const idToken = hash.get("id_token");

  if (!accessToken) return null;

  // Clean URL (no hash) after saving
  window.history.replaceState({}, document.title, window.location.pathname);
  return { accessToken, idToken };
}

function requireTokenOrShowMessage() {
  const token = getAccessToken();
  const status = document.getElementById("status");
  if (!token) {
    status.textContent =
      "Not authenticated. Click 'Login with Cognito' to begin.";
  } else {
    status.textContent = "Authenticated with Cognito.";
  }
}

// ---------- Auth Actions ----------

function loginWithCognito() {
  const url = new URL(`${cognitoDomain}/oauth2/authorize`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "token");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes);
  window.location.href = url.toString();
}

function logoutFromCognito() {
  clearAccessToken();
  const url = new URL(`${cognitoDomain}/logout`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("logout_uri", logoutUri);
  window.location.href = url.toString();
}

// ---------- API Calls ----------

async function createFragment() {
  const token = getAccessToken();
  const status = document.getElementById("status");
  if (!token) {
    status.textContent = "Please login with Cognito first.";
    return;
  }

  const typeSelect = document.getElementById("fragment-type");
  const bodyInput = document.getElementById("fragment-body");

  const contentType = typeSelect.value;
  const body = bodyInput.value || "";

  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": contentType,
      },
      body,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      status.textContent = `Create failed: ${res.status} ${data.error?.message || ""
        }`;
      console.error("Create fragment error", data);
      return;
    }

    status.textContent = "Fragment created successfully.";
    const output = document.getElementById("output");
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error(err);
    status.textContent = "Network error creating fragment.";
  }
}

async function loadFragments() {
  const token = getAccessToken();
  const status = document.getElementById("status");
  if (!token) {
    status.textContent = "Please login with Cognito first.";
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    const output = document.getElementById("output");

    if (!res.ok) {
      status.textContent = `Load failed: ${res.status} ${data.error?.message || ""
        }`;
      console.error("Load fragments error", data);
      return;
    }

    status.textContent = "Loaded fragments successfully.";
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error(err);
    status.textContent = "Network error loading fragments.";
  }
}

// ---------- Init UI ----------

function init() {
  // Basic HTML skeleton
  document.body.innerHTML = `
    <main style="font-family: system-ui; max-width: 900px; margin: 2rem auto; padding: 1rem; border-radius: 12px; border: 1px solid #ddd;">
      <h1>Fragments UI (Assignment 2)</h1>
      <p id="status"></p>

      <section style="margin-bottom: 1.5rem;">
        <button id="login-btn">Login with Cognito</button>
        <button id="logout-btn">Logout</button>
      </section>

      <section style="margin-bottom: 1.5rem;">
        <h2>Create Fragment</h2>
        <label>
          Type:
          <select id="fragment-type">
            <option value="text/plain">text/plain</option>
            <option value="text/markdown">text/markdown</option>
            <option value="application/json">application/json</option>
          </select>
        </label>
        <br/><br/>
        <textarea id="fragment-body" rows="5" style="width: 100%;" placeholder="Enter fragment content here"></textarea>
        <br/>
        <button id="create-btn">Create Fragment</button>
      </section>

      <section style="margin-bottom: 1.5rem;">
        <h2>List Fragments</h2>
        <button id="load-btn">Load My Fragments</button>
      </section>

      <section>
        <h2>Response / Data</h2>
        <pre id="output" style="background:#f5f5f5; padding:1rem; border-radius:8px; overflow-x:auto;"></pre>
      </section>
    </main>
  `;

  // Wire buttons
  document.getElementById("login-btn").onclick = loginWithCognito;
  document.getElementById("logout-btn").onclick = logoutFromCognito;
  document.getElementById("create-btn").onclick = createFragment;
  document.getElementById("load-btn").onclick = loadFragments;

  // Handle Hosted UI redirect tokens
  const tokens = parseHashTokens();
  if (tokens?.accessToken) {
    setAccessToken(tokens.accessToken);
  }

  requireTokenOrShowMessage();
}

init();