// Default leaderboard entries shown when this browser has no saved standings.
// Edit the names and wins here if you want to change the built-in starting data.

const DEFAULT_DRIVERS = [
  {name:"otke44",wins:3,country:"barbados",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"DannyMacF1",wins:13,country:"wales",platform:"PC",favouriteF1Team:"Red Bull",favouriteF1Driver:"Max Verstappen",favouriteFootballTeam:"Cardiff City",driverNumber:"92"},
  {name:"evthelegend46",wins:6,country:"ireland",platform:"XBOX",favouriteF1Team:"Ferrari",favouriteF1Driver:"Charles Leclerc",favouriteFootballTeam:"Manchester City",driverNumber:"19"},
  {name:"Rhysvoaden1",wins:9,country:"britain",platform:"XBOX",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"Manchester United",driverNumber:"67"},
  {name:"FraserG",wins:1,country:"britain",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"Parv09",wins:2,platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"Manchester United",driverNumber:""},
  {name:"Roca F1",wins:5,country:"scotland",platform:"XBOX",favouriteF1Team:"Ferrari",favouriteF1Driver:"Charles Leclerc",favouriteFootballTeam:"Liverpool",driverNumber:""},
  {name:"zchxq",wins:6,country:"britain",platform:"PlayStation",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"PRENClipz",wins:1,country:"britain",platform:"XBOX",favouriteF1Team:"McLaren",favouriteF1Driver:"Lando Norris",favouriteFootballTeam:"Liverpool",driverNumber:""},
  {name:"JoshsSzn",wins:1,country:"britain",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"pekima",wins:2,country:"netherlands",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:"2"},
  {name:"[FSR] DuneNY",wins:1,country:"britain",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"FormulaKyle2311",wins:1,country:"britain",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"oliverbroadford",wins:1,country:"wales",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"TurboJG123",wins:16,country:"britain",platform:"PlayStation",favouriteF1Team:"Ferrari",favouriteF1Driver:"Lewis Hamilton",favouriteFootballTeam:"",driverNumber:"21"},
  {name:"RogueMarshal",wins:2,country:"britain",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"[AERT] Max Lorrai",wins:3,country:"netherlands",platform:"PC",favouriteF1Team:"Red Bull",favouriteF1Driver:"Max Verstappen",favouriteFootballTeam:"",driverNumber:""},
  {name:"Alexgaitor",wins:1,country:"britain",platform:"PC",favouriteF1Team:"Ferrari",favouriteF1Driver:"Charles Leclerc",favouriteFootballTeam:"",driverNumber:""},
  {name:"Jouzam",wins:1,country:"britain",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"Stoobler",wins:1,country:"britain",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""},
  {name:"chronic-teziq",wins:2,country:"ireland",platform:"",favouriteF1Team:"",favouriteF1Driver:"",favouriteFootballTeam:"",driverNumber:""}
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

  const countryRows = document.getElementById("countryStandingsRows");
  const expandWrap = document.getElementById("leaderboardExpandWrap");
  const expandButton = document.getElementById("leaderboardExpandToggle");
  const flagCodes = {
    barbados: "bb",
    britain: "gb",
    england: "gb-eng",
    wales: "gb-wls",
    scotland: "gb-sct",
    ireland: "ie",
    netherlands: "nl"
  };
  const countryLabels = {
    barbados: "Barbados",
    britain: "Britain",
    england: "England",
    wales: "Wales",
    scotland: "Scotland",
    ireland: "Ireland",
    netherlands: "Netherlands"
  };

  // In nation standings, British drivers are represented as England.
  // The main driver table keeps its original Britain label and flag.
  const standingsFlagCodes = {...flagCodes, britain: "gb-eng"};
  const standingsCountryLabels = {...countryLabels, britain: "England"};

  const drivers = getDrivers()
    .slice()
    .sort((a, b) => Number(b.wins) - Number(a.wins));

  tbody.replaceChildren();
  if (!drivers.length) {
    tbody.innerHTML = '<tr><td colspan="3">No results yet — check back after the next championship.</td></tr>';
  } else {
    let expanded = false;
    const updateExpandedRows = () => {
      const extraRows = tbody.querySelectorAll(".leaderboard-extra-row");
      extraRows.forEach(row => { row.hidden = !expanded; });
      if (expandButton) {
        expandButton.textContent = expanded ? "Show top 10 only" : "Show all drivers";
        expandButton.setAttribute("aria-expanded", String(expanded));
      }
    };

    drivers.forEach((driver, index) => {
      const tr = document.createElement("tr");
      const pos = index + 1;
      if (index >= 10) {
        tr.className = "leaderboard-extra-row";
        tr.hidden = true;
      }

      const positionCell = document.createElement("td");
      const position = document.createElement("span");
      position.className = "position-number";
      position.textContent = String(pos).padStart(2, "0");
      positionCell.appendChild(position);

      const driverCell = document.createElement("td");
      const driverContainer = document.createElement("div");
      driverContainer.className = "driver";

      const country = String(driver.country || "").trim().toLowerCase();
      const flagCode = flagCodes[country];
      if (flagCode) {
        const flag = document.createElement("img");
        flag.className = "driver-flag";
        flag.src = `https://flagcdn.com/${flagCode}.svg`;
        flag.alt = `${countryLabels[country] || country} flag`;
        flag.title = countryLabels[country] || country;
        flag.width = 36;
        flag.height = 24;
        flag.loading = "lazy";
        flag.draggable = false;
        driverContainer.appendChild(flag);
      } else {
        const badge = document.createElement("span");
        badge.className = "driver-badge";
        badge.textContent = String(driver.name || "?").trim().slice(0, 1).toUpperCase() || "?";
        driverContainer.appendChild(badge);
      }

      const name = document.createElement("button");
      name.className = "driver-name driver-profile-trigger";
      name.type = "button";
      name.textContent = driver.name || "Unknown driver";
      name.setAttribute("aria-haspopup", "dialog");
      name.addEventListener("click", () => openDriverProfile(driver));
      driverContainer.appendChild(name);
      driverCell.appendChild(driverContainer);

      const winsCell = document.createElement("td");
      const wins = Math.max(0, Number(driver.wins) || 0);
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

    if (expandWrap && expandButton) {
      expandWrap.hidden = drivers.length <= 10;
      expandButton.onclick = () => {
        expanded = !expanded;
        updateExpandedRows();
      };
      updateExpandedRows();
    }
  }

  if (countryRows) {
    countryRows.replaceChildren();
    const countryTotals = new Map();
    drivers.forEach(driver => {
      const rawCountry = String(driver.country || "").trim().toLowerCase();
      // Drivers with no nationality supplied are excluded from the country table.
      if (!rawCountry) return;
      // British entries are grouped under England in the nation standings.
      const key = rawCountry === "britain" ? "england" : rawCountry;
      const current = countryTotals.get(key) || {country:key, drivers:0, wins:0};
      current.drivers += 1;
      current.wins += Math.max(0, Number(driver.wins) || 0);
      countryTotals.set(key, current);
    });

    const standings = [...countryTotals.values()].sort((a,b) =>
      b.wins - a.wins ||
      (b.wins / b.drivers) - (a.wins / a.drivers) ||
      b.drivers - a.drivers ||
      String(standingsCountryLabels[a.country] || a.country).localeCompare(
        String(standingsCountryLabels[b.country] || b.country)
      )
    );

    if (!standings.length) {
      countryRows.innerHTML = '<tr><td colspan="4">Country standings will appear once championship data is available.</td></tr>';
    } else {
      standings.forEach((entry,index) => {
        const tr=document.createElement("tr");
        const posCell=document.createElement("td");
        const pos=document.createElement("span");
        pos.className="position-number";
        pos.textContent=String(index+1).padStart(2,"0");
        posCell.appendChild(pos);

        const nameCell=document.createElement("td");
        const displayCountryLabel=standingsCountryLabels[entry.country] || entry.country.charAt(0).toUpperCase()+entry.country.slice(1);
        const flagCode=standingsFlagCodes[entry.country];
        const countryContainer=document.createElement("button");
        countryContainer.type="button";
        countryContainer.className="country-standings-name country-profile-trigger";
        countryContainer.setAttribute("aria-haspopup","dialog");
        countryContainer.setAttribute("aria-label","View "+displayCountryLabel+" country profile");
        if(flagCode){
          const flag=document.createElement("img");
          flag.className="driver-flag";
          flag.src=`https://flagcdn.com/${flagCode}.svg`;
          flag.alt="";
          flag.width=36;
          flag.height=24;
          flag.loading="lazy";
          flag.draggable=false;
          countryContainer.appendChild(flag);
        }
        const label=document.createElement("strong");
        label.textContent=displayCountryLabel;
        countryContainer.appendChild(label);
        const registeredDrivers=drivers
          .filter(driver => {
            const rawCountry=String(driver.country || "").trim().toLowerCase();
            return rawCountry && (rawCountry === "britain" ? "england" : rawCountry) === entry.country;
          })
          .slice()
          .sort((a,b) => Number(b.wins)-Number(a.wins) || String(a.name || "").localeCompare(String(b.name || "")));
        countryContainer.addEventListener("click",() => openCountryProfile(entry,registeredDrivers,displayCountryLabel,flagCode));
        nameCell.appendChild(countryContainer);

        const driversCell=document.createElement("td");
        driversCell.className="country-count-cell";
        driversCell.textContent=String(entry.drivers);
        const winsCell=document.createElement("td");
        winsCell.className="country-wins-cell";
        winsCell.textContent=String(entry.wins);
        tr.append(posCell,nameCell,driversCell,winsCell);
        countryRows.appendChild(tr);
      });
    }
  }

}


const COUNTRY_PROFILE_CHART_COLOURS = [
  "#7db8ff", "#d9e9ff", "#4f8fe0", "#b5d2f4", "#315f9f",
  "#eff5ff", "#679bd9", "#91b7e8", "#426eae", "#c2d9f6"
];

function openCountryProfile(entry, registeredDrivers, countryLabel, flagCode) {
  const modal=document.getElementById("countryProfileModal");
  if(!modal) return;

  const flag=document.getElementById("countryProfileFlag");
  flag.replaceChildren();
  if(flagCode){
    const image=document.createElement("img");
    image.src=`https://flagcdn.com/${flagCode}.svg`;
    image.alt=countryLabel+" flag";
    image.width=48;
    image.height=32;
    image.draggable=false;
    flag.appendChild(image);
  }else{
    const initials=document.createElement("span");
    initials.className="profile-initials";
    initials.textContent=countryLabel.trim().slice(0,2).toUpperCase();
    initials.setAttribute("aria-hidden","true");
    flag.appendChild(initials);
  }

  document.getElementById("countryProfileName").textContent=countryLabel;
  document.getElementById("countryProfileMeta").textContent=
    registeredDrivers.length+" REGISTERED DRIVER"+(registeredDrivers.length===1?"":"S");

  const totalWins=Math.max(0,Number(entry.wins)||0);
  document.getElementById("countryProfileWinCount").textContent=String(totalWins);
  document.getElementById("countryProfileWinLabel").textContent=
    totalWins===1?"CHAMPIONSHIP WIN":"CHAMPIONSHIP WINS";

  const list=document.getElementById("countryProfileDriverList");
  list.replaceChildren();
  if(!registeredDrivers.length){
    const empty=document.createElement("p");
    empty.className="country-profile-empty";
    empty.textContent="No registered drivers are listed for this country yet.";
    list.appendChild(empty);
  }else{
    registeredDrivers.forEach(driver=>{
      const wins=Math.max(0,Number(driver.wins)||0);
      const row=document.createElement("div");
      row.className="country-profile-driver-row";
      const name=document.createElement("strong");
      name.className="country-profile-driver-name";
      name.textContent=driver.name||"Unknown driver";
      const score=document.createElement("span");
      score.className="country-profile-driver-score";
      const count=document.createElement("strong");
      count.textContent=String(wins);
      const caption=document.createElement("small");
      caption.textContent=wins===1?"WIN":"WINS";
      score.append(count,caption);
      row.append(name,score);
      list.appendChild(row);
    });
  }

  const pie=document.getElementById("countryProfilePie");
  const legend=document.getElementById("countryProfileChartLegend");
  const chartNote=document.getElementById("countryProfileChartNote");
  pie.replaceChildren();
  legend.replaceChildren();
  const chartDrivers=registeredDrivers.map((driver,index)=>({
    name:String(driver.name||"Unknown driver"),
    wins:Math.max(0,Number(driver.wins)||0),
    colour:COUNTRY_PROFILE_CHART_COLOURS[index%COUNTRY_PROFILE_CHART_COLOURS.length]
  }));
  const chartTotal=chartDrivers.reduce((sum,driver)=>sum+driver.wins,0);
  pie.setAttribute("role","img");
  pie.setAttribute("aria-label","Championship wins by driver for "+countryLabel);
  if(chartTotal>0){
    let current=0;
    const positiveDrivers=chartDrivers.filter(driver=>driver.wins>0);
    const segments=positiveDrivers.map((driver,index)=>{
      const start=current;
      const end=index===positiveDrivers.length-1?100:current+(driver.wins/chartTotal)*100;
      current=end;
      return `${driver.colour} ${start}% ${end}%`;
    });
    pie.style.background=`conic-gradient(${segments.join(",")})`;
    chartNote.textContent="Each slice represents a driver's share of the country's championship wins.";
  }else{
    pie.style.background="conic-gradient(#355071 0% 100%)";
    chartNote.textContent="No championship wins have been recorded for this country yet.";
  }

  chartDrivers.forEach(driver=>{
    const item=document.createElement("div");
    item.className="country-profile-legend-item";
    const swatch=document.createElement("span");
    swatch.className="country-profile-swatch";
    swatch.style.background=driver.colour;
    swatch.setAttribute("aria-hidden","true");
    const copy=document.createElement("div");
    copy.className="country-profile-legend-copy";
    const name=document.createElement("strong");
    name.textContent=driver.name;
    const detail=document.createElement("span");
    detail.textContent=driver.wins+" "+(driver.wins===1?"win":"wins");
    copy.append(name,detail);
    item.append(swatch,copy);
    legend.appendChild(item);
  });

  const listView=document.getElementById("countryProfileListView");
  const chartView=document.getElementById("countryProfileChartView");
  const listButton=document.getElementById("countryProfileListToggle");
  const chartButton=document.getElementById("countryProfileChartToggle");
  const setView=view=>{
    const isList=view==="list";
    listView.hidden=!isList;
    chartView.hidden=isList;
    listButton.classList.toggle("is-active",isList);
    chartButton.classList.toggle("is-active",!isList);
    listButton.setAttribute("aria-pressed",String(isList));
    chartButton.setAttribute("aria-pressed",String(!isList));
  };
  listButton.onclick=()=>setView("list");
  chartButton.onclick=()=>setView("chart");
  setView("list");

  modal.hidden=false;
  document.body.classList.add("profile-modal-open");
  document.getElementById("countryProfileClose").focus();
}

function closeCountryProfile(){
  const modal=document.getElementById("countryProfileModal");
  if(!modal||modal.hidden) return;
  modal.hidden=true;
  document.body.classList.remove("profile-modal-open");
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

function getDriverProfileRole(name) {
  const normalized = String(name || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  if (normalized === "evthelegend" || normalized === "evthelegend46") {
    return "TIKTOK HEAD MODERATOR";
  }
  if (["turbojg123", "rocaf1", "alexgaitor"].includes(normalized)) {
    return "TIKTOK MODERATOR";
  }
  return "";
}

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

  const roleBadge = document.getElementById("profileRoleBadge");
  const driverRole = getDriverProfileRole(driver.name);
  if (roleBadge) {
    roleBadge.textContent = driverRole;
    roleBadge.hidden = !driverRole;
    roleBadge.classList.toggle("is-head-moderator", driverRole === "TIKTOK HEAD MODERATOR");
  }

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

document.addEventListener("click",event=>{
  if(event.target.closest("#countryProfileClose")||event.target.id==="countryProfileModal") closeCountryProfile();
});
document.addEventListener("keydown",event=>{
  if(event.key==="Escape") closeCountryProfile();
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
    button.dataset.hostedEventIndex = String(index);

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
  const isQualifyingSession = sessionType.key === "qualifying" || sessionType.key === "sprintQualifying";
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
  const isRaceSession = sessionType.key === "race";
  const isSprintSession = sessionType.key === "sprint";
  const keys = [
    {key:"position", aliases:["pos","place"], label:"POSITION", show:true},
    {key:"driver", aliases:["name","driverName"], label:"NAME", show:true},
    {key:"team", aliases:["constructor"], label:"TEAM", show:true},
    {key:"points", aliases:["pts"], label:"POINTS", show:!isQualifyingSession && (isRaceSession || isSprintSession)},
    {key:"status", aliases:[], label:"STATUS", show:isRaceSession}
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

// Delegate event-card clicks from the archive container because cards are rendered asynchronously.
function setupHostedEventCardClicks() {
  const grid = document.getElementById("hostedEventsGrid");
  if (!grid || grid.dataset.clickHandlerReady === "true") return;
  grid.dataset.clickHandlerReady = "true";
  grid.addEventListener("click", event => {
    const card = event.target instanceof Element ? event.target.closest("button.hosted-event-card") : null;
    if (!card || !grid.contains(card)) return;
    event.preventDefault();
    const index = Number(card.dataset.hostedEventIndex);
    const selectedEvent = hostedRaceEvents[index];
    if (selectedEvent) openHostedEvent(selectedEvent);
  });
}

async function refreshHostedEvents() {
  const grid = document.getElementById("hostedEventsGrid");
  if (!grid) return;
  try {
    const response = await fetch("./hosted-events.json?ts=" + Date.now(), {cache:"no-store"});
    if (!response.ok) throw new Error("Hosted events unavailable");
    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      // Recover common manual-edit mistakes in this pretty-printed JSON file.
      const lines = raw.split("\n");
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < lines.length - 1; i++) {
          if (/,\s*$/.test(lines[i]) && /^\s*[}\]]/.test(lines[i + 1])) {
            lines[i] = lines[i].replace(/,\s*$/, "");
          }
        }
        for (let i = 0; i < lines.length - 1; i++) {
          const current = lines[i].trim();
          const next = lines[i + 1].trim();
          if (!current || !next || current.endsWith(",") || current.endsWith("{") || current.endsWith("[")) continue;
          if (/^"[^"]+"\s*:/.test(next) || (next.startsWith("{") && current.endsWith("}"))) {
            lines[i] = lines[i].replace(/\s*$/, "") + ",";
          }
        }
      }
      data = JSON.parse(lines.join("\n"));
    }
    // Parse the displayed UK-style dates explicitly, then keep event cards and their click indexes in chronological order.
    const monthIndex = {january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11};
    const eventDateValue = event => {
      const match = String(event.date || "").trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
      if (!match || monthIndex[match[2].toLowerCase()] === undefined) return Number.MAX_SAFE_INTEGER;
      return Date.UTC(Number(match[3]), monthIndex[match[2].toLowerCase()], Number(match[1]));
    };
    hostedRaceEvents = Array.isArray(data.events) ? data.events.slice() : [];
    hostedRaceEvents.sort((a,b) => eventDateValue(a) - eventDateValue(b) || String(a.title || "").localeCompare(String(b.title || "")));
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
setupHostedEventCardClicks();
refreshHostedEvents();

function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
document.getElementById("year").textContent=new Date().getFullYear();

const siteNav = document.getElementById("nav");
const mobileNavToggle = document.getElementById("menuToggle");
const f126Dropdown = document.getElementById("f126Dropdown");
const f126Toggle = document.getElementById("f126Toggle");
const f126Menu = document.getElementById("f126Menu");

function closeF126Dropdown() {
  if (!f126Dropdown || !f126Toggle || !f126Menu) return;
  f126Dropdown.classList.remove("open");
  f126Toggle.setAttribute("aria-expanded", "false");
  f126Menu.hidden = true;
}

mobileNavToggle.addEventListener("click", () => {
  siteNav.classList.toggle("open");
  closeF126Dropdown();
});

f126Toggle.addEventListener("click", () => {
  const isOpen = f126Toggle.getAttribute("aria-expanded") === "true";
  f126Dropdown.classList.toggle("open", !isOpen);
  f126Toggle.setAttribute("aria-expanded", String(!isOpen));
  f126Menu.hidden = isOpen;
});

document.querySelectorAll("#nav a").forEach(a => a.addEventListener("click", () => {
  siteNav.classList.remove("open");
  closeF126Dropdown();
}));

document.addEventListener("click", event => {
  if (f126Dropdown && !f126Dropdown.contains(event.target)) closeF126Dropdown();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeF126Dropdown();
});

renderLeaderboard();

// Penrose Cup: six weekly event nights, starting 1 November 2026 at 20:00 UK time.
function updatePenroseCountdown() {
  const firstEvent = new Date("2026-11-01T20:00:00+00:00").getTime();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const eventCount = 6;
  const now = Date.now();
  const status = document.getElementById("penroseCountdownStatus");
  const clock = document.getElementById("penroseCountdownClock");
  if (!status || !clock) return;

  let eventNumber;
  let target;

  if (now < firstEvent) {
    eventNumber = 1;
    target = firstEvent;
  } else {
    // Once an event time is reached, move on to the next weekly event.
    eventNumber = Math.floor((now - firstEvent) / weekMs) + 1;
    if (eventNumber >= eventCount) {
      status.textContent = "PENROSE CUP FINALE";
      clock.textContent = "The countdown to all six event nights is complete";
      return;
    }
    eventNumber += 1;
    target = firstEvent + (eventNumber - 1) * weekMs;
  }

  const remaining = Math.max(0, target - now);
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  status.textContent = "COUNTDOWN TO EVENT " + eventNumber + " OF " + eventCount;
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
