// Default leaderboard entries shown when this browser has no saved standings.
// Edit the names and wins here if you want to change the built-in starting data.

const DEFAULT_DRIVERS = [
  {name:"otke44",wins:3,country:"barbados",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"DannyMacF1",wins:13,country:"wales",platform:"PC",favouriteF1Team:"Red Bull",favouriteF1Driver:"Max Verstappen",favouriteFootballTeam:"Cardiff City",driverNumber:"92"},
  {name:"evthelegend46",wins:6,country:"ireland",platform:"XBOX",favouriteF1Team:"Ferrari",favouriteF1Driver:"Charles Leclerc",favouriteFootballTeam:"Manchester City",driverNumber:"19"},
  {name:"Rhysvoaden1",wins:9,country:"britain",platform:"XBOX",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"Manchester United",driverNumber:""},
  {name:"FraserG",wins:1,country:"britain",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"Parv09",wins:2,platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"Manchester United",driverNumber:""},
  {name:"Roca F1",wins:5,country:"scotland",platform:"",favouriteF1Team:"Ferrari",favouriteF1Driver:"Charles Leclerc",favouriteFootballTeam:"Liverpool",driverNumber:""},
  {name:"zchxq",wins:5,country:"britain",platform:"PlayStation",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"PRENClipz",wins:1,country:"britain",platform:"XBOX",favouriteF1Team:"McLaren",favouriteF1Driver:"Lando Norris",favouriteFootballTeam:"Liverpool",driverNumber:""},
  {name:"JoshsSzn",wins:1,country:"britain",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"pekima",wins:2,country:"netherlands",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"[FSR] DuneNY",wins:1,country:"britain",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"FormulaKyle2311",wins:1,country:"britain",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"oliverbroadford",wins:1,country:"wales",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"TurboJG123",wins:14,country:"britain",platform:"PlayStation",favouriteF1Team:"Ferrari",favouriteF1Driver:"Lewis Hamilton",favouriteFootballTeam:"",driverNumber:""},
  {name:"RogueMarshal",wins:2,country:"britain",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"[AERT] Max Lorrai",wins:3,country:"netherlands",platform:"PC",favouriteF1Team:"Red Bull",favouriteF1Driver:"Max Verstappen",favouriteFootballTeam:"",driverNumber:""},
  {name:"Alexgaitor",wins:1,country:"britain",platform:"PC",favouriteF1Team:"Ferrari",favouriteF1Driver:"Charles Leclerc",favouriteFootballTeam:"",driverNumber:""},
  {name:"Jouzam",wins:1,country:"britain",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"Stoobler",wins:1,country:"britain",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"chronic-teziq",wins:1,country:"ireland",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""}
];

// These are sample entries to demonstrate the layout. Replace them with real results in Admin mode.
const STORAGE_KEY = "dannymacf1-championship-v1";
function getDrivers(){
  const byName = new Map(DEFAULT_DRIVERS.map(driver => [driver.name.trim().toLowerCase(), driver]));
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_DRIVERS.map(driver => ({...driver}));
    const entries = JSON.parse(saved);
    if (!Array.isArray(entries)) return DEFAULT_DRIVERS.map(driver => ({...driver}));
    return entries.map(driver => ({
      ...(byName.get(String(driver.name || "").trim().toLowerCase()) || {}),
      ...driver
    }));
  } catch {
    return DEFAULT_DRIVERS.map(driver => ({...driver}));
  }
}
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

    const flagCode = flagCodes[driver.country];
    if (flagCode) {
      const flag = document.createElement("img");
      flag.className = "driver-flag";
      flag.src = `https://flagcdn.com/${flagCode}.svg`;
      flag.alt = `${driver.country} flag`;
      flag.title = driver.country;
      flag.width = 36;
      flag.height = 24;
      flag.loading = "lazy";
      flag.draggable = false;
      driverContainer.appendChild(flag);
    } else {
      const badge = document.createElement("span");
      badge.className = "driver-badge";
      badge.textContent =
        driver.name.trim().slice(0, 1).toUpperCase() || "?";
      driverContainer.appendChild(badge);
    }

    const name = document.createElement("button");
    name.className = "driver-name driver-profile-trigger";
    name.type = "button";
    name.textContent = driver.name;
    name.setAttribute("aria-haspopup", "dialog");
    name.addEventListener("click", () => openDriverProfile(driver));
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


const PROFILE_FLAG_CODES = {
  barbados: "bb",
  britain: "gb",
  wales: "gb-wls",
  england: "gb-eng",
  scotland: "gb-sct",
  ireland: "ie",
  netherlands: "nl"
};

function openDriverProfile(driver) {
  const modal = document.getElementById("driverProfileModal");
  if (!modal) return;

  const country = driver.country || "";
  const flagCode = PROFILE_FLAG_CODES[country];
  const flag = document.getElementById("profileFlag");
  flag.replaceChildren();
  if (flagCode) {
    const image = document.createElement("img");
    image.src = `https://flagcdn.com/${flagCode}.svg`;
    image.alt = country + " flag";
    image.width = 48;
    image.height = 32;
    image.draggable = false;
    flag.appendChild(image);
  } else {
    const initials = document.createElement("span");
    initials.className = "profile-initials";
    initials.textContent = String(driver.name || "?").trim().slice(0, 2).toUpperCase();
    initials.setAttribute("aria-hidden", "true");
    flag.appendChild(initials);
  }

  document.getElementById("profileName").textContent = driver.name || "Driver";
  const numberBadge = document.getElementById("profileDriverNumber");
  const driverNumber = String(driver.driverNumber ?? "").trim();
  if (numberBadge) {
    numberBadge.textContent = driverNumber
      ? (driverNumber.startsWith("#") ? driverNumber : "#" + driverNumber)
      : "";
    numberBadge.hidden = !driverNumber;
    numberBadge.setAttribute("aria-label", driverNumber ? "Driver number " + driverNumber.replace(/^#/, "") : "");
  }
  document.getElementById("profileCountry").textContent =
    country ? country.charAt(0).toUpperCase() + country.slice(1) : "Nationality not added";
  document.getElementById("profileChampionshipCount").textContent =
    String(Math.max(0, Number(driver.wins) || 0));
  document.getElementById("profileChampionshipLabel").textContent =
    Number(driver.wins) === 1 ? "CHAMPIONSHIP WIN" : "CHAMPIONSHIP WINS";

  const fields = [
    ["profilePlatform", driver.platform],
    ["profileF1Team", driver.favouriteF1Team],
    ["profileF1Driver", driver.favouriteF1Driver],
    ["profileFootballTeam", driver.favouriteFootballTeam]
  ];
  fields.forEach(([id, value]) => {
    document.getElementById(id).textContent =
      value && String(value).trim() ? String(value).trim() : "Not added yet";
  });

  modal.hidden = false;
  document.body.classList.add("profile-modal-open");
  document.getElementById("driverProfileClose").focus();
}

function closeDriverProfile() {
  const modal = document.getElementById("driverProfileModal");
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("profile-modal-open");
}

document.addEventListener("click", event => {
  if (event.target.closest("#driverProfileClose")) closeDriverProfile();
  if (event.target.id === "driverProfileModal") closeDriverProfile();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeDriverProfile();
});

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
