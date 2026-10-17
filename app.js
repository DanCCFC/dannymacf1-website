// Default leaderboard entries shown when this browser has no saved standings.
// Edit the names and wins here if you want to change the built-in starting data.

const DEFAULT_DRIVERS = [
  {name:'otke44',wins:3,country:'barbados'},
  {name:'DannyMacF1',wins:13,country:'wales'},
  {name:'evthelegend46',wins:6,country:'ireland'},
  {name:'Rhysvoaden1',wins:9,country:'britain'},
  {name:'FraserG',wins:1,country:'britain'},
  {name:'Parv09',wins:2},
  {name:'Roca F1',wins:5,country:'scotland'},
  {name:'zchxq',wins:5,country:'britain'},
  {name:'PRENClipz',wins:1,country:'britain'},
  {name:'JoshsSzn',wins:1,country:'britain'},
  {name:'pekima',wins:2,country:'netherlands'},
  {name:'[FSR] DuneNY',wins:1,country:'britain'},
  {name:'FormulaKyle2311',wins:1,country:'britain'},
  {name:'oliverbroadford',wins:1,country:'wales'},
  {name:'TurboJG123',wins:14,country:'britain'},
  {name:'RogueMarshal',wins:2,country:'britain'},
  {name:'[AERT] Max Lorrai',wins:3,country:'netherlands'},
  {name:'Alexgaitor',wins:1,country:'britain'},
  {name:'Jouzam',wins:1,country:'britain'},
  {name:'Stoobler',wins:1,country:'britain'},
  {name:'chronic-teziq',wins:1,country:'ireland'}
];

// These are sample entries to demonstrate the layout. Replace them with real results in Admin mode.
const STORAGE_KEY = "dannymacf1-championship-v1";
function getDrivers(){try{const saved=localStorage.getItem(STORAGE_KEY);return saved?JSON.parse(saved):DEFAULT_DRIVERS}catch{return DEFAULT_DRIVERS}}
// Build the visible leaderboard from the saved or default driver list.

function renderLeaderboard(){
  const tbody = document.getElementById("leaderboardRows");
  if (!tbody) return;

  const flagCodes = {
    barbados: "bb",
    britain: "gb",
    wales: "gb-wls",
    scotland: "gb-sct",
    ireland: "ie",
    netherlands: "nl"
  };

  const drivers = getDrivers()
    .slice()
    .sort((a, b) => Number(b.wins) - Number(a.wins));

  tbody.replaceChildren();

  if (!drivers.length) {
    tbody.innerHTML =
      '<tr><td colspan="3">No results yet — check back after the next championship.</td></tr>';
    return;
  }

  drivers.forEach((driver, index) => {
    const tr = document.createElement("tr");
    const pos = index + 1;

    const positionCell = document.createElement("td");
    const position = document.createElement("span");
    position.className = "position-number";
    position.textContent = String(pos).padStart(2, "0");
    positionCell.appendChild(position);

    const driverCell = document.createElement("td");
    const driverContainer = document.createElement("div");
    driverContainer.className = "driver";

    const badge = document.createElement("span");
    badge.className = "driver-badge";
    badge.textContent =
      driver.name.trim().slice(0, 1).toUpperCase() || "?";
    driverContainer.appendChild(badge);

    const flagCode = flagCodes[driver.country];
    if (flagCode) {
      const flag = document.createElement("img");
      flag.className = "driver-flag";
      flag.src = `https://flagcdn.com/${flagCode}.svg`;
      flag.alt = `${driver.country} flag`;
      flag.title = `${driver.country}`;
      flag.width = 22;
      flag.height = 15;
      flag.loading = "lazy";
      flag.draggable = false;
      driverContainer.appendChild(flag);
    }

    const name = document.createElement("span");
    name.className = "driver-name";
    name.textContent = driver.name;
    driverContainer.appendChild(name);

    driverCell.appendChild(driverContainer);

    const winsCell = document.createElement("td");
    const wins = Number(driver.wins) || 0;
    const winsElement = document.createElement("span");
    winsElement.className = "wins";
    winsElement.append(document.createTextNode(String(wins)));

    const winsLabel = document.createElement("small");
    winsLabel.textContent = wins === 1 ? "WIN" : "WINS";
    winsElement.appendChild(winsLabel);
    winsCell.appendChild(winsElement);

    tr.append(positionCell, driverCell, winsCell);
    tbody.appendChild(tr);
  });

  const updated = localStorage.getItem(STORAGE_KEY + "-updated");
  const lastUpdated = document.getElementById("lastUpdated");
  if (updated && lastUpdated) {
    lastUpdated.textContent =
      "Updated " +
      new Date(updated).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
  }
}

function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
document.getElementById("year").textContent=new Date().getFullYear();
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("nav").classList.toggle("open"));
document.querySelectorAll("#nav a").forEach(a=>a.addEventListener("click",()=>document.getElementById("nav").classList.remove("open")));
renderLeaderboard();
// Optional local demo admin: open admin.html. Changes are stored only in this browser.


// LIVE banner: reads status.json and only shows the banner when live is explicitly true.
// Poll the GitHub Pages status file. The banner remains hidden unless LIVE is explicitly confirmed.
async function refreshLiveBanner(){
  const banner=document.getElementById("liveBanner");
  if(!banner)return;
  try{
    const response=await fetch("./status.json?ts="+Date.now(),{cache:"no-store"});
    if(!response.ok)throw new Error("Status unavailable");
    const status=await response.json();
    banner.hidden=status.live!==true;
  }catch{
    banner.hidden=true;
  }
}
refreshLiveBanner();
setInterval(refreshLiveBanner,60000);

// Pro Clubs: display the latest data snapshot generated by the GitHub Actions workflow.
function safeText(value){return String(value ?? '—')}
function renderProClubs(data){
  const title=document.getElementById('clubStatusTitle');
  const message=document.getElementById('clubStatusMessage');
  const statsEl=document.getElementById('clubStats');
  const squadRows=document.getElementById('squadRows');
  const squadCount=document.getElementById('squadCount');
  const resultsEl=document.getElementById('recentResults');
  const updatedEl=document.getElementById('clubUpdated');
  if(!title||!message||!statsEl||!resultsEl)return;
  title.textContent=(data.clubName||'TTDM United')+' ';
  const dot=document.createElement('span');dot.className='club-status-dot';title.appendChild(dot);
  if(!data.configured){message.textContent=data.message||'Club data has not synced yet. Check the GitHub Actions workflow.';squadRows.innerHTML='<tr><td colspan="6">No squad data available yet.</td></tr>';squadCount.textContent='Awaiting data';resultsEl.innerHTML='<p class="club-empty">No match data available yet.</p>';return;}
  const s=data.stats||{};
  message.textContent=`Club ID ${data.clubId} · Division ${safeText(s.currentDivision)} · ${safeText(s.gamesPlayed)} league matches recorded`;
  const values=[['WINS',s.wins],['DRAWS',s.draws],['LOSSES',s.losses],['GOALS',s.goals],['SKILL RATING',s.skillRating]];
  statsEl.replaceChildren();
  values.forEach(([label,value])=>{const card=document.createElement('div');card.className='club-stat';const lab=document.createElement('span');lab.textContent=label;const val=document.createElement('strong');val.textContent=safeText(value);card.append(lab,val);statsEl.appendChild(card)});
  const matches=Array.isArray(data.matches)?data.matches.slice(0,5):[];resultsEl.replaceChildren();
  if(!matches.length){const empty=document.createElement('p');empty.className='club-empty';empty.textContent='EA has not returned recent league matches yet.';resultsEl.appendChild(empty)}
  matches.forEach(m=>{const card=document.createElement('article');card.className='result-card';const outcome=document.createElement('div');outcome.className='result-outcome';outcome.textContent=safeText(m.result);const score=document.createElement('div');score.className='result-score';score.textContent=`${safeText(m.goals)} – ${safeText(m.goalsAgainst)}`;const opp=document.createElement('div');opp.className='result-opponent';opp.textContent=safeText(m.opponent);const date=document.createElement('div');date.className='result-date';date.textContent=m.timestamp?new Date(Number(m.timestamp)*1000).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'Recent match';card.append(outcome,score,opp,date);resultsEl.appendChild(card)});
  if(updatedEl)updatedEl.textContent=data.updatedAt?'Last synced '+new Date(data.updatedAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}):'Last sync time unavailable';
}
async function refreshProClubs(){
  try{const response=await fetch('./proclubs.json?ts='+Date.now(),{cache:'no-store'});if(!response.ok)throw new Error('Pro Clubs data unavailable');renderProClubs(await response.json())}
  catch{const message=document.getElementById('clubStatusMessage');if(message)message.textContent='Could not load the latest Pro Clubs snapshot. Please try again later.'}
}
refreshProClubs();

// Followers: display the latest count saved in followers.json by the scheduled workflow.
async function refreshFollowerCount(){
  const numberEl=document.getElementById('followerCount');
  const updatedEl=document.getElementById('followerUpdated');
  if(!numberEl||!updatedEl)return;
  try{
    const response=await fetch('./followers.json?ts='+Date.now(),{cache:'no-store'});
    if(!response.ok)throw new Error('Follower data unavailable');
    const data=await response.json();
    if(typeof data.followers!=='number'||!Number.isFinite(data.followers))throw new Error('No count yet');
    numberEl.textContent=new Intl.NumberFormat('en-GB').format(data.followers);
    updatedEl.textContent=data.updatedAt?'Updated '+new Date(data.updatedAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}):'Latest available count';
  }catch{
    numberEl.textContent='—';
    updatedEl.textContent='Follower count temporarily unavailable';
  }
}
refreshFollowerCount();
