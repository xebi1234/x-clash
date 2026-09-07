  const SEED = [{"name": "Lady.Gem", "power": 15706409, "rank": "R1", "assignment": "main", "status": "waiting"}, {"name": "ChatahSwift", "power": 13883505, "rank": "R1", "assignment": "main", "status": "waiting"}, {"name": "Ryder_333", "power": 13506859, "rank": "R1", "assignment": "main", "status": "waiting"}, {"name": "Gødfat’her", "power": 109620311, "rank": "R1", "assignment": "sub", "status": "waiting"}, {"name": "Scoopy-Doo", "power": 181078382, "rank": "R3", "assignment": "main", "status": "waiting"}, {"name": "ghost_inside", "power": 161402876, "rank": "R3", "assignment": "unselected", "status": "waiting"}, {"name": "Rumis", "power": 161212192, "rank": "R3", "assignment": "main", "status": "waiting"}, {"name": "Pen___", "power": null, "rank": "R3", "assignment": "main", "status": "waiting"}, {"name": "toogoodtobetrue", "power": 156419069, "rank": "R3", "assignment": "main", "status": "waiting"}, {"name": "Marilyn23", "power": 14578478, "rank": "R3", "assignment": "main", "status": "waiting"}, {"name": "Duronron", "power": 13292794, "rank": "R3", "assignment": "main", "status": "waiting"}, {"name": "lazyville", "power": 129017572, "rank": "R3", "assignment": "sub", "status": "waiting"}, {"name": "Me-shell", "power": 127739513, "rank": "R3", "assignment": "sub", "status": "waiting"}, {"name": "elsa78", "power": 12735626, "rank": "R3", "assignment": "sub", "status": "waiting"}, {"name": "Marsh-mallow", "power": 12396672, "rank": "R3", "assignment": "unselected", "status": "waiting"}, {"name": "Goblue", "power": 12374200, "rank": "R3", "assignment": "sub", "status": "waiting"}, {"name": "Papi_Nocth", "power": 122066751, "rank": "R3", "assignment": "sub", "status": "waiting"}, {"name": "9er907", "power": 12064502, "rank": "R3", "assignment": "sub", "status": "waiting"}, {"name": "BusinessTurret", "power": 115932110, "rank": "R3", "assignment": "sub", "status": "waiting"}, {"name": "DriverDan", "power": 114254587, "rank": "R3", "assignment": "sub", "status": "waiting"}, {"name": "Agnir", "power": 110290421, "rank": "R3", "assignment": "sub", "status": "waiting"}, {"name": "Gaabis", "power": 10599936, "rank": "R3", "assignment": "unselected", "status": "waiting"}, {"name": "Traveler27558088", "power": 104713926, "rank": "R3", "assignment": "unselected", "status": "waiting"}, {"name": "SmokinMoney", "power": 24075739, "rank": "R4", "assignment": "main", "status": "waiting"}, {"name": "QCat", "power": 221738981, "rank": "R4", "assignment": "main", "status": "waiting"}, {"name": "Niner907", "power": 211046579, "rank": "R4", "assignment": "main", "status": "waiting"}, {"name": "Oopsididitagain", "power": 18422322, "rank": "R4", "assignment": "main", "status": "waiting"}, {"name": "Midir", "power": 17458624, "rank": "R4", "assignment": "main", "status": "waiting"}, {"name": "chico161612345", "power": 14865400, "rank": "R4", "assignment": "main", "status": "waiting"}, {"name": "Kendo9", "power": 140710470, "rank": "R4", "assignment": "main", "status": "waiting"}, {"name": "Xebi", "power": 131375683, "rank": "R4", "assignment": "main", "status": "waiting"}, {"name": "Papadonski", "power": 121482880, "rank": "R4", "assignment": "main", "status": "waiting"}, {"name": "The_JDak", "power": 18907989, "rank": "R5", "assignment": "main", "status": "waiting"}];
  const STORAGE_KEY = "ruinsBattlefieldAttendance_v1";
  const ASSIGNMENTS = ["main", "sub", "unselected"];
  const STATUSES = ["confirmed", "waiting", "no"];
  const STATUS_ORDER = { confirmed: 0, waiting: 1, no: 2 };
  let players = load();
  let pendingSwap = null;

  const byId = id => document.getElementById(id);

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function normalizePlayer(p) {
    const assignment = ASSIGNMENTS.includes(p.assignment) ? p.assignment : "unselected";
    const status = STATUSES.includes(p.status) ? p.status : "waiting";
    let power = p.power;
    if (power === "" || power === undefined) power = null;
    if (power !== null) {
      const n = Number(power);
      power = Number.isFinite(n) ? Math.max(0, Math.round(n)) : null;
    }
    return {
      name: String(p.name || "Unnamed"),
      power,
      rank: String(p.rank || ""),
      assignment,
      status
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const saved = parsed.map(normalizePlayer);
          const map = new Map();
          saved.forEach(p => map.set(p.name.toLowerCase(), p));
          SEED.forEach(seedPlayer => {
            const key = seedPlayer.name.toLowerCase();
            if (!map.has(key)) map.set(key, normalizePlayer(seedPlayer));
          });
          return Array.from(map.values());
        }
      }
    } catch (e) {}
    return clone(SEED);
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  }

  function fmtPower(n) {
    if (n === null || n === undefined || n === "") return "Power not captured";
    const num = Number(n);
    return Number.isFinite(num) ? num.toLocaleString() : "Power not captured";
  }

  function powerValue(p) {
    const n = Number(p.power);
    return Number.isFinite(n) ? n : -1;
  }

  function statusLabel(status) {
    return status === "confirmed" ? "Definitely attending" :
           status === "no" ? "Cannot attend" :
           "Awaiting reply";
  }

  function assignmentLabel(assignment) {
    return assignment === "main" ? "Main squad" :
           assignment === "sub" ? "Substitute" :
           "Not selected";
  }

  function countAssignment(assignment) {
    return players.filter(p => p.assignment === assignment).length;
  }

  function countStatus(status) {
    return players.filter(p => p.status === status).length;
  }

  function sortPlayers(list) {
    return list.sort((a, b) => {
      const s = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      if (s !== 0) return s;
      const p = powerValue(b) - powerValue(a);
      if (p !== 0) return p;
      return a.name.localeCompare(b.name);
    });
  }

  function filteredByAssignment(assignment) {
    const q = byId("search").value.trim().toLowerCase();
    const list = players
      .map((p, index) => ({ ...p, _index: index }))
      .filter(p => p.assignment === assignment)
      .filter(p => !q || p.name.toLowerCase().includes(q));
    return sortPlayers(list);
  }

  function movePlayer(index, target) {
    const p = players[index];
    if (!p || p.assignment === target) return;

    const mainCount = countAssignment("main");
    const subCount = countAssignment("sub");

    if (target === "main" && mainCount < 20) {
      p.assignment = "main";
      save();
      render();
      return;
    }

    if (target === "sub" && subCount < 10) {
      p.assignment = "sub";
      save();
      render();
      return;
    }

    if (target === "unselected") {
      p.assignment = "unselected";
      save();
      render();
      return;
    }

    if (target === "main" && mainCount >= 20) {
      openCapacitySwap(index, "main");
      return;
    }

    if (target === "sub" && subCount >= 10) {
      openCapacitySwap(index, "sub");
      return;
    }
  }

  function openCapacitySwap(movingIndex, target) {
    const moving = players[movingIndex];
    if (!moving) return;

    pendingSwap = { movingIndex, target };

    const select = byId("swapSelect");
    select.textContent = "";

    let candidates = [];

    if (target === "main") {
      candidates = players
        .map((p, index) => ({ ...p, _index: index }))
        .filter(p => p.assignment === "main" && p._index !== movingIndex);

      byId("swapTitle").textContent = "Main squad is full";
      byId("swapLabel").textContent = "Choose a current main to move out";
      byId("swapHelp").textContent =
        moving.assignment === "sub"
          ? moving.name + " will become a main and the selected main will move to substitutes."
          : moving.name + " will become a main and the selected main will move to the bench.";
    } else {
      candidates = players
        .map((p, index) => ({ ...p, _index: index }))
        .filter(p => p.assignment === "sub" && p._index !== movingIndex);

      byId("swapTitle").textContent = "Substitute list is full";
      byId("swapLabel").textContent = "Choose a current substitute to move out";
      byId("swapHelp").textContent =
        moving.assignment === "main"
          ? moving.name + " will become a substitute and the selected substitute will move to the bench."
          : moving.name + " will become a substitute and the selected substitute will move to the bench.";
    }

    sortPlayers(candidates).forEach(candidate => {
      const option = document.createElement("option");
      option.value = String(candidate._index);
      option.textContent =
        candidate.name + " · " +
        statusLabel(candidate.status) + " · " +
        fmtPower(candidate.power);
      select.appendChild(option);
    });

    if (!candidates.length) {
      alert("No player is available to swap.");
      pendingSwap = null;
      return;
    }

    byId("swapDialog").showModal();
  }

  function completeCapacitySwap() {
    if (!pendingSwap) return;

    const moving = players[pendingSwap.movingIndex];
    const displacedIndex = Number(byId("swapSelect").value);
    const displaced = players[displacedIndex];

    if (!moving || !displaced) {
      byId("swapDialog").close();
      pendingSwap = null;
      return;
    }

    if (pendingSwap.target === "main") {
      const movingWasSub = moving.assignment === "sub";
      moving.assignment = "main";
      displaced.assignment = movingWasSub ? "sub" : "unselected";
    } else if (pendingSwap.target === "sub") {
      moving.assignment = "sub";
      displaced.assignment = "unselected";
    }

    save();
    byId("swapDialog").close();
    pendingSwap = null;
    render();
  }

  function setStatus(index, status) {
    const p = players[index];
    if (!p) return;
    p.status = status;
    save();
    render();
  }

  function deletePlayer(index) {
    const p = players[index];
    if (!p) return;
    if (confirm("Delete " + p.name + "?")) {
      players.splice(index, 1);
      save();
      render();
    }
  }

  function openAdd() {
    byId("dialogTitle").textContent = "Add player";
    byId("editIndex").value = "";
    byId("playerName").value = "";
    byId("playerPower").value = "";
    byId("playerRank").value = "";
    byId("playerAssignment").value = "unselected";
    byId("playerStatus").value = "waiting";
    byId("playerDialog").showModal();
    setTimeout(() => byId("playerName").focus(), 0);
  }

  function openEdit(index) {
    const p = players[index];
    if (!p) return;
    byId("dialogTitle").textContent = "Edit player";
    byId("editIndex").value = String(index);
    byId("playerName").value = p.name;
    byId("playerPower").value = p.power ?? "";
    byId("playerRank").value = p.rank;
    byId("playerAssignment").value = p.assignment;
    byId("playerStatus").value = p.status;
    byId("playerDialog").showModal();
  }

  function renderCard(p) {
    const mainFull = countAssignment("main") >= 20 && p.assignment !== "main";
    const subFull = countAssignment("sub") >= 10 && p.assignment !== "sub";

    const card = document.createElement("article");
    card.className = "person" + (p.status === "confirmed" ? " confirmed" : p.status === "no" ? " no" : "");

    const statusClass = p.status === "confirmed" ? "confirmed" : p.status === "no" ? "no" : "waiting";

    card.innerHTML = `
      <div class="card-top">
        <div>
          <div class="name"></div>
          <div class="submeta">
            <span class="pill rank">${p.rank || "No rank"}</span>
            <span class="pill power">${fmtPower(p.power)}</span>
          </div>
        </div>
        <div class="status-chip ${statusClass}">${statusLabel(p.status)}</div>
      </div>
      <div>
        <div class="section-label">Attendance</div>
        <div class="btn-row status-row"></div>
      </div>
      <div>
        <div class="section-label">Move player</div>
        <div class="btn-row move-row"></div>
      </div>
      <div class="card-footer">
        <button type="button" class="secondary edit-btn">Edit</button>
        <button type="button" class="danger delete-btn">Delete</button>
      </div>
    `;

    card.querySelector(".name").textContent = p.name;

    const statusRow = card.querySelector(".status-row");
    [
      ["confirmed", "Yes", "confirmed"],
      ["waiting", "Waiting", "waiting"],
      ["no", "No", "no"]
    ].forEach(([value, label, cls]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-status " + cls + (p.status === value ? " active" : "");
      btn.textContent = label;
      btn.addEventListener("click", () => setStatus(p._index, value));
      statusRow.appendChild(btn);
    });

    const moveRow = card.querySelector(".move-row");
    [
      ["main", "Main", "active-main", mainFull],
      ["sub", "Sub", "active-sub", subFull],
      ["unselected", "Bench", "active-bench", false]
    ].forEach(([value, label, activeClass, full]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-move " + (p.assignment === value ? activeClass : "");
      btn.textContent = label + (full ? " ↔" : "");
      btn.title = full ? (value === "main"
        ? "Main squad is full. Tap to choose a main player to swap out."
        : "Sub list is full. Tap to choose a substitute to move to bench.") : "";
      btn.addEventListener("click", () => movePlayer(p._index, value));
      moveRow.appendChild(btn);
    });

    card.querySelector(".edit-btn").addEventListener("click", () => openEdit(p._index));
    card.querySelector(".delete-btn").addEventListener("click", () => deletePlayer(p._index));

    return card;
  }

  function renderList(assignment, targetId) {
    const host = byId(targetId);
    host.textContent = "";
    const list = filteredByAssignment(assignment);
    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = byId("search").value ? "No matching players found." : "No players in this section.";
      host.appendChild(empty);
      return;
    }
    list.forEach(p => host.appendChild(renderCard(p)));
  }
