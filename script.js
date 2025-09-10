/* Plumeo prototype demo behaviors:
   - Render sample stories
   - Search filter
   - Like & Save to reading-list (localStorage)
   - Simple Nav routing (show/hide sections)
   - Simple Login modal UI
*/

document.addEventListener('DOMContentLoaded', () => {
  // sample dataset
  const STORIES = [
    { id: 's1', title: "Moonlight Sonata", author: "A. Faiza", genre: "Romance", excerpt: "A soft summer night, a secret letter...", likes: 48 },
    { id: 's2', title: "Paper Wings", author: "Z. Noor", genre: "Fantasy", excerpt: "When paper birds learn to carry wishes...", likes: 120 },
    { id: 's3', title: "Cafe at Dawn", author: "S. Karim", genre: "Slice of Life", excerpt: "Steam rising, a pen scratching ideas...", likes: 32 },
    { id: 's4', title: "Starlit Promises", author: "L. Rahman", genre: "Romance", excerpt: "Two promises beneath a starlit sky...", likes: 76 },
    { id: 's5', title: "Glass Orchard", author: "R. Iqbal", genre: "Magical Realism", excerpt: "Orchards that reflect memories...", likes: 55 },
    { id: 's6', title: "The Second Chapter", author: "F. Yousaf", genre: "Drama", excerpt: "Chapters that begin where others end...", likes: 18 }
  ];

  // DOM refs
  const storiesGrid = document.getElementById('storiesGrid');
  const readingListGrid = document.getElementById('readingListGrid');
  const readingListSection = document.getElementById('readingListSection');
  const genresSection = document.getElementById('genresSection');
  const genreChips = document.getElementById('genreChips');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const yearEl = document.getElementById('year');

  yearEl.textContent = new Date().getFullYear();

  // Utilities for localStorage reading list & likes
  function getReadingList(){
    try { return JSON.parse(localStorage.getItem('plumeo_reading_list') || '[]'); }
    catch(e){ return [];}
  }
  function saveReadingList(list){
    localStorage.setItem('plumeo_reading_list', JSON.stringify(list));
  }
  function toggleSaveStory(id){
    const list = getReadingList();
    const idx = list.indexOf(id);
    if(idx === -1) list.push(id); else list.splice(idx,1);
    saveReadingList(list);
    renderReadingList();
    renderStories(currentStories);
  }

  // Like counter simulation (not persisted across reloads)
  const likes = {};
  STORIES.forEach(s => likes[s.id] = s.likes);

  function toggleLike(id, btn){
    likes[id] = (likes[id] || 0) + 1;
    // small animation
    btn.textContent = `♥ ${likes[id]}`;
    btn.classList.add('liked');
    setTimeout(()=> btn.classList.remove('liked'),500);
  }

  // render helpers
  function createStoryCard(story){
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <div class="thumb">${story.title.split(" ").slice(0,2).map(w=>w[0]).join('')}</div>
      <div class="meta">
        <h4>${escapeHTML(story.title)}</h4>
        <span class="by">by ${escapeHTML(story.author)} • ${escapeHTML(story.genre)}</span>
        <p>${escapeHTML(story.excerpt)}</p>
        <div class="actions">
          <button class="btn likeBtn" data-id="${story.id}">♥ ${likes[story.id]}</button>
          <button class="btn saveBtn" data-id="${story.id}">Save</button>
        </div>
      </div>
    `;
    // attach events
    el.querySelector('.likeBtn').addEventListener('click', (e)=>{
      toggleLike(story.id, e.currentTarget);
    });
    el.querySelector('.saveBtn').addEventListener('click', (e)=>{
      toggleSaveStory(story.id);
    });
    return el;
  }

  function renderStories(list){
    currentStories = list.slice();
    storiesGrid.innerHTML = '';
    const saved = getReadingList();
    list.forEach(s => {
      const card = createStoryCard(s);
      // update save btn state
      const saveBtn = card.querySelector('.saveBtn');
      if(saved.includes(s.id)) saveBtn.textContent = 'Saved';
      storiesGrid.appendChild(card);
    });
  }

  function renderReadingList(){
    const saved = getReadingList();
    readingListGrid && (readingListGrid.innerHTML = '');
    if(!saved || saved.length === 0){
      if(readingListGrid) readingListGrid.innerHTML = `<div class="empty-note">Your reading list is empty. Save stories to see them here.</div>`;
      return;
    }
    const listItems = STORIES.filter(s => saved.includes(s.id));
    listItems.forEach(s => {
      const card = createStoryCard(s);
      readingListGrid.appendChild(card);
    });
  }

  function renderGenres(){
    const genres = Array.from(new Set(STORIES.map(s=>s.genre)));
    genreChips.innerHTML = '';
    genres.forEach(g=>{
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.textContent = g;
      chip.addEventListener('click', ()=> {
        renderStories(STORIES.filter(s=>s.genre===g));
        // show featured section
        document.querySelectorAll('.section').forEach(s => s.hidden = false);
      });
      genreChips.appendChild(chip);
    });
  }

  // simple escape
  function escapeHTML(s = ''){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }

  // search
  function performSearch(q){
    if(!q){ renderStories(STORIES); return; }
    q = q.toLowerCase().trim();
    const res = STORIES.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.author.toLowerCase().includes(q) ||
      s.genre.toLowerCase().includes(q)
    );
    renderStories(res);
  }

  // nav routing (client-side simple)
  document.querySelectorAll('.main-nav a').forEach(a=>{
    a.addEventListener('click', (ev)=>{
      ev.preventDefault();
      document.querySelectorAll('.main-nav a').forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
      const route = a.dataset.route;
      // simple show/hide
      document.querySelectorAll('.section, .hero').forEach(el => el.hidden = true);
      document.querySelector('.hero').hidden = (route !== 'home');
      document.querySelector('.featured').hidden = (route !== 'home');
      document.getElementById('genresSection').hidden = (route !== 'genres');
      document.getElementById('readingListSection').hidden = (route !== 'reading-list');
      if(route === 'home') { document.querySelectorAll('.section').forEach(el=>el.hidden=false); }
      if(route === 'genres'){ document.getElementById('genresSection').hidden = false; }
      if(route === 'reading-list'){ document.getElementById('readingListSection').hidden = false; renderReadingList(); }
      if(route === 'library'){ /* placeholder - future */ document.querySelector('.featured').hidden=false; }
    });
  });

  // initial render
  let currentStories = STORIES.slice();
  renderStories(STORIES);
  renderGenres();

  // search events
  searchBtn.addEventListener('click', ()=> performSearch(searchInput.value));
  searchInput.addEventListener('keydown', (e)=> { if(e.key === 'Enter') performSearch(searchInput.value); });
  document.getElementById('exploreBtn').addEventListener('click', ()=> { window.scrollTo({top:document.querySelector('.featured').offsetTop - 60, behavior:'smooth'}); });

  // Modal interactions
  const authModal = document.getElementById('authModal');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const closeModal = document.getElementById('closeModal');
  const switchAuth = document.getElementById('switchAuth');

  loginBtn.addEventListener('click', ()=> openAuth('login'));
  signupBtn.addEventListener('click', ()=> openAuth('signup'));
  closeModal.addEventListener('click', closeAuth);
  switchAuth && switchAuth.addEventListener('click', ()=> {
    const title = document.getElementById('authTitle');
    if(title.textContent.toLowerCase().includes('log')){
      title.textContent = 'Sign up for Plumeo';
      switchAuth.textContent = 'Switch to Log in';
    } else {
      title.textContent = 'Log in to Plumeo';
      switchAuth.textContent = 'Switch to Sign up';
    }
  });

  function openAuth(mode='login'){
    const title = document.getElementById('authTitle');
    title.textContent = (mode === 'signup') ? 'Sign up for Plumeo' : 'Log in to Plumeo';
    authModal.setAttribute('aria-hidden','false');
    authModal.style.display = 'flex';
  }
  function closeAuth(){
    authModal.setAttribute('aria-hidden','true');
    authModal.style.display = 'none';
  }

  // simple accessibility: close modal with escape
  document.addEventListener('keyup', (e)=> { if(e.key === 'Escape') closeAuth(); });

});
