const GAME_INDEX = "https://cdn.jsdelivr.net/gh/gmshelf/seraph/seraph.json";
const GAME_CDN = "https://cdn.jsdelivr.net/gh/gmshelf/seraph/";
const CONFIG_KEY = "c3-service-config-v2";
const views = {
  home: "Home",
  games: "Games",
  movies: "Movies & TV",
  manga: "Manga",
  music: "Music",
  cloud: "Cloud games",
  extensions: "Extensions",
  settings: "Settings",
};

const viewRoot = document.querySelector("#view-root");
const globalSearch = document.querySelector("#global-search");
const audio = document.querySelector("#audio-player");
const toast = document.querySelector("#toast");
const playerDialog = document.querySelector("#player-dialog");
const detailDialog = document.querySelector("#detail-dialog");
const state = {
  view: "home",
  games: [],
  gameError: "",
  mangaSource: "mangadex",
  mangaItems: [],
  mangaQuery: "",
  movieItems: [],
  movieQuery: "",
  musicItems: [],
  musicQuery: "",
  musicTrack: null,
  config: loadConfig(),
  hlsPromise: null,
};

function loadConfig() {
  try {
    const stored = JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}");
    return {
      manga: normalizeBase(stored.manga || ""),
      movies: normalizeBase(stored.movies || ""),
      music: normalizeBase(stored.music || ""),
    };
  } catch (error) {
    console.error("Unable to read saved C3 settings.", error);
    return { manga: "", movies: "", music: "" };
  }
}

function normalizeBase(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("visible"), 3400);
}

function setView(name, { focus = false } = {}) {
  if (!views[name]) return;
  state.view = name;
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === name);
  });
  document.querySelector("#current-section").textContent = views[name];
  globalSearch.value = "";
  globalSearch.placeholder = name === "home" || name === "settings" || name === "extensions" || name === "cloud"
    ? "Search this section"
    : `Search ${views[name].toLowerCase()}`;
  history.replaceState(null, "", `#${name}`);
  renderView();
  if (focus) viewRoot.focus();
}

function sectionHeader(label, title, description, action = "") {
  return `<div class="content-heading"><div><span class="eyebrow">${label}</span><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
}

function renderHome() {
  viewRoot.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <span class="eyebrow">YOUR SPACE · YOUR PACE</span>
        <h1>Welcome to C<span>3</span>.</h1>
        <p>A quieter corner for your games, stories, films, and favorite sounds. Built by canc3r, with a little help from the open web.</p>
        <button class="button primary" data-go="games">Explore games <span aria-hidden="true">↗</span></button>
      </div>
    </section>
    <div class="section-heading"><div><h2>Pick a lane</h2><p>Jump into something good.</p></div></div>
    <section class="feature-grid">
      <button class="feature-card" data-go="games"><span class="feature-arrow">↗</span><span class="feature-icon">✣</span><h3>Play something</h3><p>Browse the Seraph collection, powered by GMShelf.</p></button>
      <button class="feature-card" data-go="movies"><span class="feature-arrow">↗</span><span class="feature-icon">▣</span><h3>Watch a story</h3><p>Search movies and TV with your self-hosted x8rr/movies service.</p></button>
      <button class="feature-card" data-go="manga"><span class="feature-arrow">↗</span><span class="feature-icon">▤</span><h3>Read a chapter</h3><p>Find manga through MangaDex or MangaPill.</p></button>
      <button class="feature-card" data-go="music"><span class="feature-arrow">↗</span><span class="feature-icon">♫</span><h3>Set the mood</h3><p>Search and play tracks through your x8rr/music backend.</p></button>
      <button class="feature-card" data-go="cloud"><span class="feature-arrow">↗</span><span class="feature-icon">⌁</span><h3>Cloud play</h3><p>Learn how to connect a self-hosted Stratus-compatible service.</p></button>
      <button class="feature-card" data-go="extensions"><span class="feature-arrow">↗</span><span class="feature-icon">⊞</span><h3>Make it yours</h3><p>Extension support is being built. See how Sapphire fits in.</p></button>
    </section>
    <div class="section-heading"><div><h2>Good to know</h2><p>Some services need your own backend.</p></div></div>
    <div class="notice"><span class="notice-mark">✳</span><div><strong>Connect your services once.</strong> Manga, movie, and music servers are self-hosted APIs, not public endpoints. Add their base URLs in <button class="text-button" data-go="settings">Settings</button>; your values stay in this browser.</div></div>`;
}

function renderGames() {
  viewRoot.innerHTML = `
    ${sectionHeader("THE ARCADE", "Games", "A hand-picked index from Seraph. Game covers are placeholders in the upstream collection, so the cards keep it clean and simple.")}
    <div class="toolbar"><form id="games-search" class="search-form"><input id="games-query" type="search" placeholder="Find a game..." aria-label="Find a game"><button class="button" type="submit">Search</button></form><span class="pill">GMShelf · Seraph</span></div>
    <div id="games-results" class="loading-state">Loading the Seraph collection…</div>`;
  loadGames();
}

async function loadGames() {
  const target = document.querySelector("#games-results");
  if (!target) return;
  if (!state.games.length && !state.gameError) {
    try {
      const response = await fetch(GAME_INDEX);
      if (!response.ok) throw new Error(`Game index returned ${response.status}.`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("The game index did not return a list.");
      state.games = data.filter((game) => game && typeof game.name === "string" && typeof game.url === "string");
      if (!state.games.length) throw new Error("The game index was empty or had an unsupported format.");
    } catch (error) {
      state.gameError = error.message || "Could not load the game index.";
      console.error("Unable to load Seraph games.", error);
    }
  }
  if (state.gameError) {
    target.innerHTML = emptyState("Games could not load", `${escapeHTML(state.gameError)} Check your connection and try again.`, '<button class="button small" data-retry-games>Retry</button>');
    return;
  }
  filterGameCards();
}

function filterGameCards() {
  const target = document.querySelector("#games-results");
  if (!target) return;
  const query = (document.querySelector("#games-query")?.value || "").trim().toLowerCase();
  const games = state.games.filter((game) => game.name.toLowerCase().includes(query));
  if (!games.length) {
    target.innerHTML = emptyState("No games found", "Try a different search.");
    return;
  }
  target.innerHTML = `<div class="card-grid">${games.map((game, index) => `
    <article class="media-card">
      <div class="media-art">${game.img ? `<img src="${escapeHTML(resolveGamePath(game.img))}" alt="" loading="lazy" onerror="this.remove();this.nextElementSibling.hidden=false">` : ""}<span class="art-fallback" ${game.img ? "hidden" : ""}>✣</span></div>
      <div class="media-card-body"><h3 title="${escapeHTML(game.name)}">${escapeHTML(game.name)}</h3><p>Seraph collection</p><div class="card-actions"><button class="button small primary" data-play-game="${index}" data-game-name="${escapeHTML(game.name)}" data-game-url="${escapeHTML(resolveGamePath(game.url))}">Play</button></div></div>
    </article>`).join("")}</div>`;
}

function resolveGamePath(path) {
  const cleanPath = String(path).replace(/^\/+/, "");
  return new URL(cleanPath, GAME_CDN).href;
}

function launchGame(url, name) {
  const safeUrl = new URL(url);
  if (safeUrl.origin !== new URL(GAME_CDN).origin) {
    showToast("That game link is outside the Seraph collection.");
    return;
  }
  const dialog = document.createElement("dialog");
  dialog.className = "player-dialog game-dialog";
  dialog.innerHTML = `<div class="dialog-top"><div><span class="eyebrow">SERAPH · GMSHELF</span><h2>${escapeHTML(name)}</h2></div><button class="icon-button dialog-close" aria-label="Close game">×</button></div><iframe title="${escapeHTML(name)}" src="${escapeHTML(safeUrl.href)}" allow="fullscreen; autoplay; gamepad; clipboard-read; clipboard-write" allowfullscreen style="display:block;width:100%;height:min(70vh,720px);border:0;border-radius:10px;background:#08070a"></iframe>`;
  document.body.append(dialog);
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.showModal();
}

function renderMovies() {
  viewRoot.innerHTML = `
    ${sectionHeader("THE SCREENING ROOM", "Movies & TV", "Search titles and play them using the x8rr/movies API. This frontend needs a self-hosted API URL and a configured TMDB key on that server.")}
    ${serviceNotice("movies", "x8rr/movies", "Your movies API base URL is not set.")}
    <div class="toolbar"><form id="movies-search" class="search-form"><input id="movies-query" type="search" placeholder="Search movies or TV..." aria-label="Search movies or TV"><button class="button" type="submit">Search</button></form><div class="pill-tabs"><button class="pill-tab active" data-movie-type="movie">Movies</button><button class="pill-tab" data-movie-type="tv">TV</button></div></div>
    <div id="movies-results" class="loading-state">${state.config.movies ? "Loading trending titles…" : "Connect your movies service to get started."}</div>`;
  if (state.config.movies) loadMovies();
}

async function loadMovies(query = "") {
  state.movieQuery = query;
  const target = document.querySelector("#movies-results");
  if (!target) return;
  target.innerHTML = `<div class="loading-state">${query ? "Searching…" : "Loading trending titles…"}</div>`;
  try {
    const type = document.querySelector("[data-movie-type].active")?.dataset.movieType || "movie";
    const path = query
      ? `/api/search/${type}?query=${encodeURIComponent(query)}`
      : `/api/trending/${type}/week`;
    const data = await apiJSON("movies", path);
    state.movieItems = listFrom(data);
    renderMovieCards();
  } catch (error) {
    renderServiceError(target, error, "Check the API URL, server status, and CORS configuration.");
  }
}

function renderMovieCards() {
  const target = document.querySelector("#movies-results");
  if (!target) return;
  if (!state.movieItems.length) {
    target.innerHTML = emptyState("Nothing found", "Try another title or switch between Movies and TV.");
    return;
  }
  const type = document.querySelector("[data-movie-type].active")?.dataset.movieType || "movie";
  target.innerHTML = `<div class="card-grid">${state.movieItems.map((item) => {
    const id = item.id ?? item.tmdbId;
    const title = item.title || item.name || "Untitled";
    const poster = imageURL(item.poster_path || item.poster || item.cover);
    const year = (item.release_date || item.first_air_date || "").slice(0, 4);
    return `<article class="media-card">
      <div class="media-art">${poster ? `<img src="${escapeHTML(poster)}" alt="" loading="lazy" onerror="this.remove()">` : '<span class="art-fallback">▣</span>'}</div>
      <div class="media-card-body"><h3 title="${escapeHTML(title)}">${escapeHTML(title)}</h3><p>${escapeHTML(year || (type === "tv" ? "TV series" : "Movie"))}</p><div class="card-actions">${type === "tv"
        ? `<button class="button small primary" data-movie-details="${escapeHTML(id)}" data-movie-title="${escapeHTML(title)}">Seasons</button>`
        : `<button class="button small primary" data-movie-id="${escapeHTML(id)}" data-movie-title="${escapeHTML(title)}" data-movie-type="${type}">Play</button>`}</div></div>
    </article>`;
  }).join("")}</div>`;
}

async function playMovie(id, title, type, season = 1, episode = 1) {
  if (!id) return showToast("This result does not include a movie ID.");
  const dialog = playerDialog;
  const video = document.querySelector("#video-player");
  const message = document.querySelector("#player-message");
  document.querySelector("#player-title").textContent = title;
  message.textContent = "Finding a stream…";
  video.pause();
  video.removeAttribute("src");
  video.load();
  dialog.showModal();
  try {
    const path = type === "tv"
      ? `/api/stream/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`
      : `/api/stream/movie/${encodeURIComponent(id)}`;
    const response = await apiJSON("movies", path);
    const data = response?.data || response;
    const sources = listFrom(data, ["sources"]);
    const source = typeof data === "string" ? data : (sources[0]?.url || sources[0]?.file || data.url || data.stream || data.m3u8 || data.source);
    if (typeof source !== "string" || !source) throw new Error("The stream endpoint returned no playable URL.");
    const sourceURL = new URL(source, `${state.config.movies}/`);
    if (!["http:", "https:"].includes(sourceURL.protocol)) throw new Error("The movies API returned an unsupported stream URL.");
    const isHls = /\.m3u8(?:$|\?)/i.test(sourceURL.href);
    const isAlreadyProxied = sourceURL.pathname.endsWith("/api/proxy");
    const streamUrl = isHls && !isAlreadyProxied
      ? `${state.config.movies}/api/proxy?url=${encodeURIComponent(sourceURL.href)}`
      : sourceURL.href;
    if (isHls) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else {
        await loadHls();
        if (!window.Hls.isSupported()) throw new Error("This browser cannot play HLS streams.");
        const hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        dialog.addEventListener("close", () => hls.destroy(), { once: true });
      }
    } else {
      video.src = streamUrl;
    }
    message.textContent = "Stream supplied by your configured movies server.";
    await video.play().catch(() => {});
  } catch (error) {
    message.textContent = error.message || "Unable to play this title.";
    console.error("Movie playback failed.", error);
  }
}

async function openTvDetails(id, title) {
  if (!id) return showToast("This result does not include a TV ID.");
  document.querySelector("#detail-title").textContent = title;
  const content = document.querySelector("#detail-content");
  content.innerHTML = '<div class="loading-state">Loading seasons…</div>';
  detailDialog.showModal();
  try {
    const data = await apiJSON("movies", `/api/tv/${encodeURIComponent(id)}`);
    const series = data.tv || data.item || data.data || data;
    const seasons = (series.seasons || []).filter((season) => Number(season.season_number ?? season.number) > 0);
    if (!seasons.length) throw new Error("The TV details response contains no seasons.");
    content.dataset.tvId = String(id);
    content.dataset.tvTitle = title;
    content.innerHTML = `<div class="toolbar"><label class="field" style="min-width:180px;margin:0"><span class="small-note">Season</span><select id="tv-season">${seasons.map((season) => `<option value="${escapeHTML(season.season_number ?? season.number)}">${escapeHTML(season.name || `Season ${season.season_number ?? season.number}`)}</option>`).join("")}</select></label></div><div id="tv-episodes" class="loading-state">Loading episodes…</div>`;
    await loadTvEpisodes(id, seasons[0].season_number ?? seasons[0].number);
  } catch (error) {
    renderServiceError(content, error, "Check the TV details endpoint and server.");
  }
}

async function loadTvEpisodes(id, season) {
  const target = document.querySelector("#tv-episodes");
  if (!target) return;
  target.innerHTML = '<div class="loading-state">Loading episodes…</div>';
  try {
    const data = await apiJSON("movies", `/api/tv/${encodeURIComponent(id)}/season/${encodeURIComponent(season)}`);
    const episodes = listFrom(data, ["episodes"]);
    if (!episodes.length) {
      target.innerHTML = emptyState("No episodes found", "This season did not return any episodes.");
      return;
    }
    target.innerHTML = `<div class="chapter-list">${episodes.map((episode, index) => {
      const number = episode.episode_number ?? episode.episode ?? index + 1;
      return `<button class="chapter-button" data-tv-episode="${escapeHTML(number)}" data-tv-season="${escapeHTML(season)}"><span>Episode ${escapeHTML(number)}${episode.name ? ` — ${escapeHTML(episode.name)}` : ""}</span><span>Play ↗</span></button>`;
    }).join("")}</div>`;
  } catch (error) {
    renderServiceError(target, error, "Check the season endpoint and server.");
  }
}

function loadHls() {
  if (window.Hls) return Promise.resolve();
  if (state.hlsPromise) return state.hlsPromise;
  state.hlsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load the HLS playback library."));
    document.head.append(script);
  });
  return state.hlsPromise;
}

function renderManga() {
  const sourceName = state.mangaSource === "pill" ? "MangaPill" : "MangaDex";
  viewRoot.innerHTML = `
    ${sectionHeader("THE READING NOOK", "Manga", `Search English-language manga with the x8rr/manga backend. Choose between MangaDex and MangaPill.`)}
    ${serviceNotice("manga", "x8rr/manga", "Your manga API base URL is not set.")}
    <div class="toolbar"><form id="manga-search" class="search-form"><input id="manga-query" type="search" value="${escapeHTML(state.mangaQuery)}" placeholder="Search manga..." aria-label="Search manga"><button class="button" type="submit">Search</button></form><div class="pill-tabs"><button class="pill-tab ${state.mangaSource === "mangadex" ? "active" : ""}" data-manga-source="mangadex">MangaDex</button><button class="pill-tab ${state.mangaSource === "pill" ? "active" : ""}" data-manga-source="pill">MangaPill</button></div></div>
    <div id="manga-results" class="loading-state">${state.config.manga ? `Loading ${sourceName}…` : "Connect your manga service to get started."}</div>`;
  if (state.config.manga) loadManga(state.mangaQuery);
}

async function loadManga(query = "") {
  state.mangaQuery = query;
  const target = document.querySelector("#manga-results");
  if (!target) return;
  const offset = state.mangaSource === "mangadex" ? "0" : "1";
  const path = state.mangaSource === "mangadex"
    ? `/mangadex/search?title=${encodeURIComponent(query)}&offset=${offset}`
    : `/pill/search?title=${encodeURIComponent(query)}&page=${offset}`;
  target.innerHTML = `<div class="loading-state">${query ? "Searching…" : "Loading manga…"}</div>`;
  try {
    const data = await apiJSON("manga", path);
    state.mangaItems = listFrom(data);
    renderMangaCards();
  } catch (error) {
    renderServiceError(target, error, "Check the API URL, server status, and CORS configuration.");
  }
}

function renderMangaCards() {
  const target = document.querySelector("#manga-results");
  if (!target) return;
  if (!state.mangaItems.length) {
    target.innerHTML = emptyState("No manga found", "Try another search or source.");
    return;
  }
  target.innerHTML = `<div class="card-grid">${state.mangaItems.map((item, index) => {
    const title = item.title || item.name || "Untitled";
    const cover = imageURL(item.cover || item.img);
    return `<article class="media-card">
      <div class="media-art">${cover ? `<img src="${escapeHTML(cover)}" alt="" loading="lazy" onerror="this.remove()">` : '<span class="art-fallback">▤</span>'}</div>
      <div class="media-card-body"><h3 title="${escapeHTML(title)}">${escapeHTML(title)}</h3><p>${escapeHTML(item.status || item.year || "Manga")}</p><div class="card-actions"><button class="button small primary" data-manga-index="${index}">Details</button></div></div>
    </article>`;
  }).join("")}</div>`;
}

async function openMangaDetails(item) {
  const source = state.mangaSource;
  const title = item.title || item.name || "Manga";
  document.querySelector("#detail-title").textContent = title;
  const content = document.querySelector("#detail-content");
  content.innerHTML = '<div class="loading-state">Loading series…</div>';
  detailDialog.showModal();
  try {
    const identifier = String(item.id || item.uuid || "");
    if (!identifier) throw new Error("This result does not include an ID.");
    let detailPath;
    if (source === "pill") {
      const slug = item.slug || slugify(title);
      detailPath = `/pill/title/${encodeURIComponent(identifier)}/${encodeURIComponent(slug)}`;
    } else {
      detailPath = `/mangadex/${encodeURIComponent(identifier)}`;
    }
    const detail = await apiJSON("manga", detailPath);
    const series = detail?.item || detail?.data || detail;
    const chaptersResponse = source === "pill"
      ? await apiJSON("manga", `${detailPath}/chapters`)
      : await apiJSON("manga", `${detailPath}/chapters?offset=0`);
    const chapters = listFrom(chaptersResponse, ["chapters", "items"]);
    const cover = mangaImageURL(series.cover || item.cover);
    content.innerHTML = `
      <div class="detail-meta">${cover ? `<img src="${escapeHTML(cover)}" alt="">` : "<div class=\"media-art\">▤</div>"}<div><span class="pill">${escapeHTML(series.status || "Series")}</span><p>${escapeHTML(series.description || "No description provided.")}</p><p>${escapeHTML([...(series.authors || []), ...(series.tags || [])].join(" · "))}</p></div></div>
      <h3>Chapters <span class="pill">${chapters.length}</span></h3>
      <div class="chapter-list">${chapters.map((chapter, index) => `<button class="chapter-button" data-chapter-index="${index}"><span>Chapter ${escapeHTML(chapter.chapter || chapter.number || index + 1)}${chapter.title ? ` — ${escapeHTML(chapter.title)}` : ""}</span><span>Read ↗</span></button>`).join("") || '<p class="muted">No chapters were returned.</p>'}</div>`;
    content.dataset.chapters = JSON.stringify(chapters);
    content.dataset.seriesId = identifier;
    content.dataset.seriesSlug = item.slug || slugify(title);
    content.dataset.source = source;
  } catch (error) {
    renderServiceError(content, error, "Check the manga API response and server status.");
  }
}

async function readChapter(chapter) {
  const content = document.querySelector("#detail-content");
  const source = content.dataset.source;
  const chapterId = String(chapter.id || chapter.uuid || "");
  if (!chapterId) return showToast("This chapter does not include an ID.");
  content.innerHTML = '<div class="loading-state">Opening chapter…</div>';
  try {
    const path = source === "pill"
      ? `/pill/chapter/${encodeURIComponent(chapterId)}/${encodeURIComponent(chapter.slug || slugify(chapter.title || ""))}/pages`
      : `/mangadex/chapter/${encodeURIComponent(chapterId)}/pages`;
    const data = await apiJSON("manga", path);
    const pages = Array.isArray(data.pages) ? data.pages : [];
    if (!pages.length) throw new Error("The chapter response contains no pages.");
    content.innerHTML = `<button class="button small" data-return-details>← Back to chapters</button><div class="reader-pages">${pages.map((page) => {
      const url = typeof page === "string" ? page : page.url || page.src;
      return url ? `<img src="${escapeHTML(url)}" alt="Manga page" loading="lazy">` : "";
    }).join("")}</div>`;
  } catch (error) {
    renderServiceError(content, error, "Check the chapter ID and manga server.");
  }
}

function renderMusic() {
  viewRoot.innerHTML = `
    ${sectionHeader("THE LISTENING ROOM", "Music", "Find music through your x8rr/music service. Streaming requires that backend to be configured with its own YouTube Music source.")}
    ${serviceNotice("music", "x8rr/music", "Your music API base URL is not set.")}
    <div class="toolbar"><form id="music-search" class="search-form"><input id="music-query" type="search" value="${escapeHTML(state.musicQuery)}" placeholder="Search tracks, artists, albums..." aria-label="Search music"><button class="button" type="submit">Search</button></form></div>
    <div id="music-results" class="loading-state">${state.config.music ? "Search for a track to begin." : "Connect your music service to get started."}</div>`;
  if (state.config.music && state.musicQuery) loadMusic(state.musicQuery);
}

async function loadMusic(query) {
  state.musicQuery = query;
  const target = document.querySelector("#music-results");
  if (!target) return;
  if (!query.trim()) {
    target.innerHTML = emptyState("Search for a track", "Enter a track, artist, or album above.");
    return;
  }
  target.innerHTML = '<div class="loading-state">Searching…</div>';
  try {
    const data = await apiJSON("music", `/api/music/search?q=${encodeURIComponent(query)}&limit=30`);
    state.musicItems = listFrom(data);
    renderMusicCards();
  } catch (error) {
    renderServiceError(target, error, "Check the API URL, server status, and CORS configuration.");
  }
}

function renderMusicCards() {
  const target = document.querySelector("#music-results");
  if (!target) return;
  if (!state.musicItems.length) {
    target.innerHTML = emptyState("No tracks found", "Try another search.");
    return;
  }
  target.innerHTML = `<div class="card-grid">${state.musicItems.map((item, index) => {
    const title = item.title || item.name || "Untitled";
    const artist = item.artist || item.artists?.map?.((entry) => entry.name || entry).join(", ") || "Unknown artist";
    const art = imageURL(item.artwork || item.cover || item.thumbnail || item.image);
    return `<article class="media-card">
      <div class="media-art">${art ? `<img src="${escapeHTML(art)}" alt="" loading="lazy" onerror="this.remove()">` : '<span class="art-fallback">♫</span>'}</div>
      <div class="media-card-body"><h3 title="${escapeHTML(title)}">${escapeHTML(title)}</h3><p title="${escapeHTML(artist)}">${escapeHTML(artist)}</p><div class="card-actions"><button class="button small primary" data-track-index="${index}">Play</button></div></div>
    </article>`;
  }).join("")}</div>`;
}

async function playTrack(item) {
  const id = item.id || item.videoId || item.trackId;
  if (!id) return showToast("This result does not include a track ID.");
  const source = item.source || "tidal";
  const params = new URLSearchParams({
    id: String(id),
    source: String(source),
    title: String(item.title || item.name || ""),
    artist: String(item.artist || item.artists?.map?.((entry) => entry.name || entry).join(", ") || ""),
    duration: String(item.duration || ""),
  });
  try {
    const response = await apiJSON("music", `/api/music/stream?${params}`);
    const result = response?.data || response;
    const stream = typeof result === "string" ? result : result.url || result.stream || result.audio || result.src;
    if (!stream) throw new Error("The stream endpoint returned no playable audio URL.");
    const url = new URL(stream, `${state.config.music}/`);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("The music API returned an unsupported audio URL.");
    audio.src = url.href;
    await audio.play();
    state.musicTrack = item;
    updateAudioDock(item);
  } catch (error) {
    showToast(error.message || "Unable to play this track.");
    console.error("Music playback failed.", error);
  }
}

function updateAudioDock(item) {
  let dock = document.querySelector(".audio-dock");
  if (!dock) {
    dock = document.createElement("div");
    dock.className = "audio-dock";
    dock.innerHTML = '<div class="audio-cover">♫</div><div class="audio-meta"><strong></strong><span></span></div>';
    dock.append(audio);
    document.body.append(dock);
  }
  dock.querySelector(".audio-meta strong").textContent = item.title || item.name || "Now playing";
  dock.querySelector(".audio-meta span").textContent = item.artist || item.artists?.map?.((entry) => entry.name || entry).join(", ") || "Unknown artist";
  const artwork = imageURL(item.artwork || item.cover || item.thumbnail || item.image);
  const cover = dock.querySelector(".audio-cover");
  cover.innerHTML = artwork ? `<img src="${escapeHTML(artwork)}" alt="">` : "♫";
}

function renderCloud() {
  viewRoot.innerHTML = `
    ${sectionHeader("LOW-LATENCY PLAY", "Cloud games", "Stratus is a backend building block for RaccoonGame sessions and WebRTC signaling, not a browser-ready game catalogue API.")}
    <div class="notice"><span class="notice-mark">!</span><div><strong>This needs a server-side host.</strong> Stratus creates and manages sessions; its repository does not define a stable public REST endpoint for a standalone frontend. Do not expose session tokens, account setup, or server secrets in browser code.</div></div>
    <section class="cloud-panel">
      <article class="settings-card"><span class="eyebrow">STRATUS API</span><h2>Connect a compatible host</h2><p>Use the upstream project as the server-side session layer, then connect C3 to a trusted host application that implements its own client API and WebRTC signaling.</p><a class="button primary" href="https://github.com/x8rr/stratus-api" target="_blank" rel="noreferrer">View Stratus API ↗</a><p class="small-note" style="margin-top:13px">Stratus setup requires its documented dependencies and an operator-managed backend. Self-host only services you are authorized to use.</p></article>
      <article class="settings-card"><span class="eyebrow">WHY IT IS NOT A URL FIELD</span><h2>No generic browser endpoint</h2><ol class="step-list"><li><b>1</b><span>Deploy and secure your own Stratus-compatible server.</span></li><li><b>2</b><span>Provide a frontend adapter for game discovery, session creation, and signaling.</span></li><li><b>3</b><span>Add that documented adapter when its interface is available.</span></li></ol></article>
    </section>`;
}

function renderExtensions() {
  viewRoot.innerHTML = `
    ${sectionHeader("MAKE IT YOURS", "Extensions", "A landing spot for future C3 extensions and installation help.")}
    <section class="extension-banner"><div><span class="eyebrow">EXTENSION SUPPORT · IN PROGRESS</span><h2>Sapphire is a Scramjet plugin</h2><p>x8rr/sapphire emulates selected Chrome extension APIs inside Scramjet-proxied frames. It is not a standalone extension manager: it requires a Scramjet host, tab/window integration, and a host-owned installation flow. This rebuild intentionally does not include Scramjet.</p></div><a class="button primary" href="https://github.com/x8rr/sapphire" target="_blank" rel="noreferrer">Read Sapphire docs ↗</a></section>
    <div class="section-heading"><div><h2>What a future integration needs</h2><p>Building extensions into C3 means adding the host APIs safely, not just adding an upload button.</p></div></div>
    <ul class="step-list"><li><b>1</b><span>A supported browsing runtime and an explicit extension permission model.</span></li><li><b>2</b><span>Tab identity, navigation, and live-window hooks required by Sapphire.</span></li><li><b>3</b><span>Local extension install, storage, and removal UX controlled by the user.</span></li></ul>`;
}

function renderSettings() {
  viewRoot.innerHTML = `
    ${sectionHeader("PREFERENCES", "Settings", "Connect self-hosted APIs. Service URLs are stored in this browser only; no API secrets are stored here.")}
    <form id="settings-form" class="settings-grid">
      <section class="settings-card"><h2>API connections</h2><p>Enter the origin for each self-hosted backend. Use a URL reachable from this browser; the backend must allow requests from this site.</p>
        ${settingField("manga", "Manga API", "x8rr/manga · e.g. http://localhost:3000")}
        ${settingField("movies", "Movies API", "x8rr/movies · e.g. http://localhost:3000")}
        ${settingField("music", "Music API", "x8rr/music · e.g. http://localhost:2010")}
        <div class="settings-actions"><button class="button primary" type="submit">Save connections</button><button class="button" type="button" data-clear-config>Clear</button></div>
      </section>
      <section class="settings-card"><h2>Local setup notes</h2><p>These projects are backends you run and administer; the GitHub links are source code, not API origins.</p>
        <p><a href="https://github.com/x8rr/manga" target="_blank" rel="noreferrer">Manga backend docs ↗</a><br><span class="small-note">Bun service; defaults to port 3000.</span></p>
        <p><a href="https://github.com/x8rr/movies" target="_blank" rel="noreferrer">Movies backend docs ↗</a><br><span class="small-note">Self-hosted service; needs your own TMDB API key.</span></p>
        <p><a href="https://github.com/x8rr/music" target="_blank" rel="noreferrer">Music backend docs ↗</a><br><span class="small-note">Bun, yt-dlp, and a configured YouTube Music base are needed for playback.</span></p>
        <p class="small-note">Keep private keys and backend credentials on the server. A browser URL is not a secret.</p>
      </section>
    </form>
    <div class="notice"><span class="notice-mark">✳</span><div>Game listings load directly from <a href="https://github.com/gmshelf/seraph" target="_blank" rel="noreferrer">GMShelf's Seraph index</a>. Cloud games and extensions need their own server/runtime integration; see their sections for details.</div></div>`;
  document.querySelectorAll("#settings-form input").forEach((input) => {
    input.value = state.config[input.name] || "";
  });
}

function settingField(name, label, hint) {
  return `<div class="field"><label for="setting-${name}">${label}</label><input id="setting-${name}" name="${name}" type="url" inputmode="url" placeholder="${escapeHTML(hint)}" value="${escapeHTML(state.config[name] || "")}"></div>`;
}

function serviceNotice(service, repo, message) {
  if (state.config[service]) return "";
  return `<div class="notice"><span class="notice-mark">!</span><div><strong>${escapeHTML(message)}</strong> Configure it in <button class="text-button" data-go="settings">Settings</button>. Source and setup: <a href="https://github.com/x8rr/${repo.replace("x8rr/", "")}" target="_blank" rel="noreferrer">${escapeHTML(repo)} ↗</a></div></div>`;
}

function renderView() {
  switch (state.view) {
    case "games": renderGames(); break;
    case "movies": renderMovies(); break;
    case "manga": renderManga(); break;
    case "music": renderMusic(); break;
    case "cloud": renderCloud(); break;
    case "extensions": renderExtensions(); break;
    case "settings": renderSettings(); break;
    default: renderHome();
  }
}

function emptyState(title, description, action = "") {
  return `<div class="empty-state"><strong>${escapeHTML(title)}</strong><p>${escapeHTML(description)}</p>${action ? `<div style="margin-top:12px">${action}</div>` : ""}</div>`;
}

function listFrom(data, preferred = []) {
  if (Array.isArray(data)) return data;
  for (const key of [...preferred, "items", "results", "tracks", "data"]) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  if (data?.data && typeof data.data === "object") return listFrom(data.data, preferred);
  return [];
}

function imageURL(value) {
  if (!value || typeof value !== "string") return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `https://image.tmdb.org/t/p/w500${value}`;
  return value;
}

function mangaImageURL(value) {
  if (!value || typeof value !== "string") return "";
  if (state.mangaSource !== "pill") return imageURL(value);
  const image = /^https?:\/\//i.test(value) ? value : new URL(value, `${state.config.manga}/`).href;
  return `${state.config.manga}/img?u=${encodeURIComponent(image)}`;
}

function slugify(value) {
  return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function renderServiceError(target, error, advice) {
  console.error("Service request failed.", error);
  target.innerHTML = emptyState("Service request failed", `${error.message || "Unknown error"} ${advice}`);
}

async function apiJSON(service, path) {
  const base = state.config[service];
  if (!base) throw new Error(`Set the ${service} API URL in Settings first.`);
  const url = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`);
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("API URLs must use HTTP or HTTPS.");
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`API returned ${response.status} ${response.statusText}.`);
  return response.json();
}

document.addEventListener("click", async (event) => {
  const go = event.target.closest("[data-go]");
  if (go) return setView(go.dataset.go);
  const nav = event.target.closest(".nav-item");
  if (nav) return setView(nav.dataset.view);
  if (event.target.closest("#settings-shortcut")) return setView("settings");
  if (event.target.closest("[data-close-dialog]")) {
    event.target.closest("dialog").close();
    return;
  }
  if (event.target.closest("[data-retry-games]")) {
    state.gameError = "";
    state.games = [];
    return loadGames();
  }
  const game = event.target.closest("[data-game-url]");
  if (game) return launchGame(game.dataset.gameUrl, game.dataset.gameName);
  const movieType = event.target.closest("[data-movie-type]");
  if (movieType) {
    document.querySelectorAll("[data-movie-type]").forEach((button) => button.classList.toggle("active", button === movieType));
    return loadMovies(state.movieQuery);
  }
  const movie = event.target.closest("[data-movie-id]");
  if (movie) return playMovie(movie.dataset.movieId, movie.dataset.movieTitle, movie.dataset.movieType);
  const tv = event.target.closest("[data-movie-details]");
  if (tv) return openTvDetails(tv.dataset.movieDetails, tv.dataset.movieTitle);
  const episode = event.target.closest("[data-tv-episode]");
  if (episode) {
    const content = document.querySelector("#detail-content");
    return playMovie(content.dataset.tvId, `${content.dataset.tvTitle} · S${episode.dataset.tvSeason}E${episode.dataset.tvEpisode}`, "tv", episode.dataset.tvSeason, episode.dataset.tvEpisode);
  }
  const mangaSource = event.target.closest("[data-manga-source]");
  if (mangaSource) {
    state.mangaSource = mangaSource.dataset.mangaSource;
    return renderManga();
  }
  const manga = event.target.closest("[data-manga-index]");
  if (manga) return openMangaDetails(state.mangaItems[Number(manga.dataset.mangaIndex)]);
  const chapter = event.target.closest("[data-chapter-index]");
  if (chapter) {
    const chapters = JSON.parse(document.querySelector("#detail-content").dataset.chapters || "[]");
    return readChapter(chapters[Number(chapter.dataset.chapterIndex)]);
  }
  if (event.target.closest("[data-return-details]")) return openMangaDetails({
    id: document.querySelector("#detail-content").dataset.seriesId,
    title: document.querySelector("#detail-title").textContent,
    slug: document.querySelector("#detail-content").dataset.seriesSlug,
  });
  const track = event.target.closest("[data-track-index]");
  if (track) return playTrack(state.musicItems[Number(track.dataset.trackIndex)]);
  if (event.target.closest("[data-clear-config]")) {
    try {
      localStorage.removeItem(CONFIG_KEY);
      state.config = { manga: "", movies: "", music: "" };
      renderSettings();
      showToast("Saved API connections cleared.");
    } catch (error) {
      console.error("Unable to clear C3 API settings.", error);
      showToast("Could not clear settings. Check browser storage permissions.");
    }
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "tv-season") {
    const id = document.querySelector("#detail-content").dataset.tvId;
    loadTvEpisodes(id, event.target.value);
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "games-search") {
    event.preventDefault();
    filterGameCards();
  } else if (event.target.id === "movies-search") {
    event.preventDefault();
    loadMovies(document.querySelector("#movies-query").value.trim());
  } else if (event.target.id === "manga-search") {
    event.preventDefault();
    loadManga(document.querySelector("#manga-query").value.trim());
  } else if (event.target.id === "music-search") {
    event.preventDefault();
    loadMusic(document.querySelector("#music-query").value.trim());
  } else if (event.target.id === "settings-form") {
    event.preventDefault();
    const formData = new FormData(event.target);
    const next = Object.fromEntries(["manga", "movies", "music"].map((key) => [key, normalizeBase(formData.get(key))]));
    for (const [key, value] of Object.entries(next)) {
      if (value && !/^https?:\/\//i.test(value)) {
        showToast(`${key} API URL must start with http:// or https://.`);
        return;
      }
    }
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
      state.config = next;
      showToast("API connections saved in this browser.");
    } catch (error) {
      console.error("Unable to save C3 API settings.", error);
      showToast("Could not save settings. Check browser storage permissions.");
    }
  }
});

globalSearch.addEventListener("input", () => {
  const input = globalSearch.value.trim();
  if (state.view === "games" && state.games.length) {
    const queryInput = document.querySelector("#games-query");
    if (queryInput) queryInput.value = input;
    filterGameCards();
  } else if (state.view === "movies" && state.config.movies) {
    clearTimeout(globalSearch.timer);
    globalSearch.timer = setTimeout(() => loadMovies(input), 280);
  } else if (state.view === "manga" && state.config.manga) {
    clearTimeout(globalSearch.timer);
    globalSearch.timer = setTimeout(() => loadManga(input), 280);
  } else if (state.view === "music" && state.config.music) {
    clearTimeout(globalSearch.timer);
    globalSearch.timer = setTimeout(() => loadMusic(input), 280);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    globalSearch.focus();
  }
  if (event.key === "Escape" && playerDialog.open) {
    document.querySelector("#video-player").pause();
  }
});

playerDialog.addEventListener("close", () => {
  const video = document.querySelector("#video-player");
  video.pause();
  video.removeAttribute("src");
  video.load();
});

document.querySelector("#audio-player").addEventListener("error", () => {
  if (audio.currentSrc) showToast("The music server returned an audio stream this browser could not play.");
});

const initialView = location.hash.slice(1);
setView(views[initialView] ? initialView : "home");
