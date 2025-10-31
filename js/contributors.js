const { owner, name } = window.__REPO__ || {};
const API = `https://api.github.com/repos/${owner}/${name}/contributors?per_page=100`;
const grid = document.getElementById("contributors");
const tpl = document.getElementById("contributor-card");

/** Util: crea una card */
function renderCard(user) {
  const node = tpl.content.cloneNode(true);
  const a = node.querySelector(".contrib-card");
  const img = node.querySelector(".contrib-avatar");
  const nameEl = node.querySelector(".contrib-name");
  const commitsEl = node.querySelector(".contrib-commits");

  a.href = user.html_url;
  img.src = user.avatar_url;
  img.alt = `${user.login} avatar`;

  nameEl.textContent = user.login;
  commitsEl.textContent = `${user.contributions} commit${user.contributions !== 1 ? "s" : ""}`;

  // 🔽 Añade los títulos (tooltips) aquí
  nameEl.title = user.login;
  a.title = `${user.login} — ${user.contributions} commits`;

  grid.appendChild(node);
}

/** Loader + fallback */
function setStatus(msg, isError=false) {
  grid.innerHTML = `<div class="status ${isError ? "error" : ""}">${msg}</div>`;
}

(async function load() {
  try {
    setStatus("Loading contributors…");
    const res = await fetch(API, { headers: { "Accept": "application/vnd.github+json" }});
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return setStatus("No contributors found yet.");
    }
    grid.innerHTML = ""; // clear status
    data.forEach(renderCard);
  } catch (e) {
    setStatus("Failed to load contributors. Try again later.", true);
    // console.debug(e);
  }
})();
