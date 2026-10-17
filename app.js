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
  {name:"TurboJG123",wins:14,country:"britain",platform:"PlayStation",favouriteF1Team:"Ferrari",favouriteF1Driver:"Lewis Hamilton",favouriteFootballTeam:"",driverNumber:"21"},
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

  const penroseDrivers = new Set(["dannymacf1", "evthelegend46", "roca f1", "chronic-teziq", "zchxq"]);
  const penroseCard = document.getElementById("profilePenroseCup");
  if (penroseCard) {
    penroseCard.hidden = !penroseDrivers.has(String(driver.name || "").trim().toLowerCase());
  }

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


/* Hosted race events archive and results modal. */
const HOSTED_SESSION_TYPES = [
  {key:"sprintQualifying", aliases:["sprint_qualifying","sprint-qualifying"], label:"Sprint Qualifying"},
  {key:"sprint", aliases:[], label:"Sprint"},
  {key:"qualifying", aliases:["quali"], label:"Qualifying"},
  {key:"race", aliases:["grandPrix"], label:"Race"}
];
let hostedRaceEvents = [];
let activeHostedEvent = null;

function getHostedSession(event, sessionType) {
  const sessions = event && event.sessions && typeof event.sessions === "object" ? event.sessions : {};
  for (const key of [sessionType.key, ...sessionType.aliases]) {
    if (Object.prototype.hasOwnProperty.call(sessions, key)) return sessions[key];
  }
  return null;
}

function renderHostedEvents(events) {
  const grid = document.getElementById("hostedEventsGrid");
  const count = document.getElementById("hostedEventsCount");
  if (!grid || !count) return;
  grid.replaceChildren();

  if (!Array.isArray(events) || events.length === 0) {
    count.textContent = "0 EVENTS";
    const empty = document.createElement("div");
    empty.className = "hosted-events-empty";
    const heading = document.createElement("strong");
    heading.textContent = "The archive is ready";
    const detail = document.createElement("span");
    detail.textContent = "Hosted events will appear here once their event details and results have been added.";
    empty.append(heading, detail);
    grid.appendChild(empty);
    return;
  }

  count.textContent = events.length + (events.length === 1 ? " EVENT" : " EVENTS");
  events.forEach((event, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hosted-event-card";
    button.addEventListener("click", () => openHostedEvent(event));

    const top = document.createElement("div");
    top.className = "hosted-event-card-top";
    const date = document.createElement("span");
    date.className = "hosted-event-date";
    date.textContent = event.date || "Date not added";
    const number = document.createElement("span");
    number.className = "hosted-event-index";
    number.textContent = String(index + 1).padStart(2, "0");
    top.append(date, number);

    const title = document.createElement("strong");
    title.className = "hosted-event-title";
    title.textContent = event.title || "Hosted race event";
    const track = document.createElement("span");
    track.className = "hosted-event-track";
    track.textContent = event.track || "Circuit not added";

    const pills = document.createElement("span");
    pills.className = "hosted-event-session-pills";
    const sessions = HOSTED_SESSION_TYPES.filter(type => getHostedSession(event, type));
    sessions.forEach(type => {
      const pill = document.createElement("span");
      pill.textContent = type.label;
      pills.appendChild(pill);
    });
    if (!sessions.length) {
      const pill = document.createElement("span");
      pill.textContent = "Results pending";
      pills.appendChild(pill);
    }

    const footer = document.createElement("span");
    footer.className = "hosted-event-card-footer";
    footer.append(document.createTextNode("VIEW EVENT RESULTS"));
    const arrow = document.createElement("span");
    arrow.textContent = "↗";
    arrow.setAttribute("aria-hidden", "true");
    footer.appendChild(arrow);

    button.append(top, title, track, pills, footer);
    grid.appendChild(button);
  });
}

function openHostedEvent(event) {
  const modal = document.getElementById("hostedEventModal");
  if (!modal) return;
  activeHostedEvent = event;
  document.getElementById("hostedEventModalTitle").textContent = event.title || "Hosted race event";
  const meta = [event.track, event.date, event.game].filter(Boolean);
  document.getElementById("hostedEventModalMeta").textContent = meta.join(" · ") || "Event details not added yet";
  renderHostedEventTabs(event);
  modal.hidden = false;
  document.body.classList.add("profile-modal-open");
  document.getElementById("hostedEventClose").focus();
}

function closeHostedEvent() {
  const modal = document.getElementById("hostedEventModal");
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("profile-modal-open");
  activeHostedEvent = null;
}

function renderHostedEventTabs(event, preferredKey) {
  const tabs = document.getElementById("hostedEventTabs");
  const content = document.getElementById("hostedEventResults");
  if (!tabs || !content) return;
  tabs.replaceChildren();
  content.replaceChildren();

  const available = HOSTED_SESSION_TYPES.filter(type => getHostedSession(event, type) !== null);
  if (!available.length) {
    const empty = document.createElement("div");
    empty.className = "hosted-event-results-empty";
    empty.textContent = "Qualifying and race results have not been added for this event yet.";
    content.appendChild(empty);
    return;
  }

  const active = available.find(type => type.key === preferredKey)
    || available.find(type => type.key === "race")
    || available.find(type => type.key === "qualifying")
    || available[0];

  available.forEach(type => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hosted-event-tab" + (type.key === active.key ? " is-active" : "");
    button.role = "tab";
    button.setAttribute("aria-selected", type.key === active.key ? "true" : "false");
    button.textContent = type.label;
    button.addEventListener("click", () => renderHostedEventTabs(event, type.key));
    tabs.appendChild(button);
  });

  renderHostedSessionResults(event, active);
}

function renderHostedSessionResults(event, sessionType) {
  const container = document.getElementById("hostedEventResults");
  if (!container) return;
  container.replaceChildren();

  const session = getHostedSession(event, sessionType) || {};
  const results = Array.isArray(session.results) ? session.results : [];
  if (!results.length) {
    const empty = document.createElement("div");
    empty.className = "hosted-event-results-empty";
    empty.textContent = "No " + sessionType.label.toLowerCase() + " results have been added yet.";
    container.appendChild(empty);
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = "hosted-event-table-wrap";
  const table = document.createElement("table");
  table.className = "hosted-event-results-table";
  const isQualifyingSession = sessionType.key === "qualifying" || sessionType.key === "sprintQualifying";
  const keys = [
    {key:"position", aliases:["pos","place"], label:"POS.", show:true},
    {key:"driver", aliases:["name","driverName"], label:"DRIVER", show:true},
    {key:"team", aliases:["constructor"], label:"TEAM", show:results.some(r => r.team || r.constructor)},
    {key:"time", aliases:["bestLap","fastestLap","timeOrGap"], label:"TIME / LAP", show:!isQualifyingSession && results.some(r => r.time || r.bestLap || r.fastestLap || r.timeOrGap)},
    {key:"gap", aliases:["interval"], label:"GAP", show:!isQualifyingSession && results.some(r => r.gap || r.interval)},
    {key:"points", aliases:["pts"], label:"PTS", show:results.some(r => r.points !== undefined && r.points !== null && r.points !== "")},
    {key:"laps", aliases:["lapsCompleted"], label:"LAPS", show:results.some(r => r.laps !== undefined && r.laps !== null && r.laps !== "")},
    {key:"status", aliases:[], label:"STATUS", show:!isQualifyingSession && results.some(r => r.status)}
  ].filter(column => column.show);

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  keys.forEach(column => {
    const th = document.createElement("th");
    th.textContent = column.label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  results.slice().sort((left, right) =>
    Number(left.position ?? left.pos ?? left.place ?? 999) - Number(right.position ?? right.pos ?? right.place ?? 999)
  ).forEach(result => {
    const row = document.createElement("tr");
    keys.forEach(column => {
      const td = document.createElement("td");
      let value = result[column.key];
      if (value === undefined || value === null || value === "") {
        for (const alias of column.aliases) {
          if (result[alias] !== undefined && result[alias] !== null && result[alias] !== "") {
            value = result[alias];
            break;
          }
        }
      }
      td.textContent = value === undefined || value === null || value === "" ? "—" : String(value);
      if (column.key === "position") td.className = "hosted-event-position";
      if (column.key === "driver") td.className = "hosted-event-driver-cell";
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  container.appendChild(wrap);

  if (session.note) {
    const note = document.createElement("p");
    note.className = "hosted-event-session-note";
    note.textContent = String(session.note);
    container.appendChild(note);
  }
}

async function refreshHostedEvents() {
  const grid = document.getElementById("hostedEventsGrid");
  if (!grid) return;
  try {
    const response = await fetch("./hosted-events.json?ts=" + Date.now(), {cache:"no-store"});
    if (!response.ok) throw new Error("Hosted events unavailable");
    const data = await response.json();
    hostedRaceEvents = Array.isArray(data.events) ? data.events : [];
    renderHostedEvents(hostedRaceEvents);
  } catch {
    renderHostedEvents([]);
    const grid = document.getElementById("hostedEventsGrid");
    const empty = grid && grid.querySelector(".hosted-events-empty");
    if (empty) empty.lastChild.textContent = "The hosted-race archive could not be loaded. Please try again later.";
  }
}

document.addEventListener("click", event => {
  if (event.target.closest("#hostedEventClose") || event.target.id === "hostedEventModal") closeHostedEvent();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeHostedEvent();
});
refreshHostedEvents();

function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
document.getElementById("year").textContent=new Date().getFullYear();
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("nav").classList.toggle("open"));
document.querySelectorAll("#nav a").forEach(a=>a.addEventListener("click",()=>document.getElementById("nav").classList.remove("open")));
renderLeaderboard();

// Penrose Cup countdown. First race: 2 November 2026, 20:00 UK time (GMT).
function updatePenroseCountdown() {
  const target = new Date("2026-11-02T20:00:00+00:00").getTime();
  const remaining = target - Date.now();
  const status = document.getElementById("penroseCountdownStatus");
  const clock = document.getElementById("penroseCountdownClock");
  if (!status || !clock) return;

  if (remaining <= 0) {
    status.textContent = "RACE NIGHT";
    clock.textContent = "The first race is here";
    return;
  }

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  status.textContent = "COUNTDOWN TO LIGHTS OUT";
  clock.replaceChildren();
  [
    [days, "DAYS"],
    [hours, "HRS"],
    [minutes, "MINS"],
    [seconds, "SECS"]
  ].forEach(([value, label]) => {
    const unit = document.createElement("div");
    unit.className = "penrose-time-unit";
    const number = document.createElement("strong");
    number.textContent = String(value).padStart(2, "0");
    const caption = document.createElement("span");
    caption.textContent = label;
    unit.append(number, caption);
    clock.appendChild(unit);
  });
}
updatePenroseCountdown();
setInterval(updatePenroseCountdown, 1000);

// Open the shared driver profile from any Penrose Cup roster button.
document.querySelectorAll(".penrose-driver[data-driver]").forEach(button => {
  button.addEventListener("click", () => {
    const requestedName = String(button.dataset.driver || "").trim().toLowerCase();
    const driver = getDrivers().find(entry =>
      String(entry.name || "").trim().toLowerCase() === requestedName
    );
    if (driver) openDriverProfile(driver);
  });
});

// Penrose Cup results: public snapshot is stored separately so each round can be updated without changing the layout.
async function refreshPenroseResults() {
  const list = document.getElementById("penroseResultsRounds");
  const group = document.getElementById("penroseGroupStatus");
  const summary = document.getElementById("penroseResultsSummary");
  if (!list || !group || !summary) return;

  try {
    const response = await fetch("./penrose-results.json?ts=" + Date.now(), {cache: "no-store"});
    if (!response.ok) throw new Error("Penrose results unavailable");
    const data = await response.json();
    group.textContent = data.group || data.groupStatus || "To be confirmed after placement";

    const rounds = Array.isArray(data.rounds) ? data.rounds : [];
    list.replaceChildren();
    const recorded = rounds.filter(round =>
      round.status === "complete" ||
      round.finish !== null && round.finish !== undefined ||
      round.points !== null && round.points !== undefined ||
      Boolean(round.result)
    ).length;

    summary.textContent = recorded
      ? recorded + " of " + rounds.length + " round" + (rounds.length === 1 ? "" : "s") + " with results recorded"
      : "No race results recorded yet.";

    rounds.forEach(round => {
      const item = document.createElement("li");
      const status = String(round.status || "pending").toLowerCase().replace(/[^a-z0-9-]/g, "");
      item.className = "penrose-result-row penrose-result-" + status;

      const week = document.createElement("span");
      week.className = "penrose-result-week";
      week.textContent = "WEEK " + String(round.week ?? "—");

      const info = document.createElement("div");
      info.className = "penrose-result-round";
      const title = document.createElement("strong");
      title.textContent = round.name || "Race round";
      const state = document.createElement("span");
      state.className = "penrose-result-state";
      state.textContent = round.statusLabel || (status === "complete" ? "Result recorded" : "Awaiting update");
      info.append(title, state);
      if (round.result) {
        const outcome = document.createElement("span");
        outcome.className = "penrose-result-outcome";
        outcome.textContent = String(round.result);
        info.appendChild(outcome);
      }
      if (round.notes) {
        const note = document.createElement("small");
        note.className = "penrose-result-note";
        note.textContent = String(round.notes);
        info.appendChild(note);
      }

      const stats = document.createElement("div");
      stats.className = "penrose-result-stats";
      [
        ["FINISH", round.finish === null || round.finish === undefined || round.finish === "" ? "—" : "P" + round.finish],
        ["POINTS", round.points === null || round.points === undefined || round.points === "" ? "—" : String(round.points)]
      ].forEach(([label, value]) => {
        const metric = document.createElement("span");
        metric.append(document.createTextNode(label + " "));
        const number = document.createElement("b");
        number.textContent = value;
        metric.appendChild(number);
        stats.appendChild(metric);
      });

      item.append(week, info, stats);
      list.appendChild(item);
    });

    if (!rounds.length) {
      const empty = document.createElement("li");
      empty.className = "penrose-results-empty";
      empty.textContent = "Race rounds will appear here when the schedule is confirmed.";
      list.appendChild(empty);
    }
  } catch {
    summary.textContent = "Results tracker temporarily unavailable.";
  }
}
refreshPenroseResults();

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
