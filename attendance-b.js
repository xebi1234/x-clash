  function renderReadiness() {
    const main = players.filter(p => p.assignment === "main");
    const subs = players.filter(p => p.assignment === "sub");
    const host = byId("readinessList");
    host.textContent = "";

    const items = [
      ["Confirmed starters", main.filter(p => p.status === "confirmed").length],
      ["Waiting starters", main.filter(p => p.status === "waiting").length],
      ["Starters unavailable", main.filter(p => p.status === "no").length],
      ["Confirmed subs", subs.filter(p => p.status === "confirmed").length],
      ["Bench players", players.filter(p => p.assignment === "unselected").length],
      ["Empty main slots", Math.max(0, 20 - main.length)]
    ];

    items.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.className = "mini-item";
      row.innerHTML = `<div class="mini-name">${label}</div><div>${value}</div>`;
      host.appendChild(row);
    });
  }

  function getConfirmedStandby() {
    return sortPlayers(
      players
        .map((p, index) => ({ ...p, _index: index }))
        .filter(p => p.assignment !== "main" && p.status === "confirmed")
    );
  }

  function doSuggestedSwap(outIndex, inIndex) {
    const out = players[outIndex];
    const inc = players[inIndex];
    if (!out || !inc) return;
    const oldIncomingAssignment = inc.assignment;
    inc.assignment = "main";
    if (oldIncomingAssignment === "sub") {
      out.assignment = "sub";
    } else {
      out.assignment = "unselected";
    }
    save();
    render();
  }

  function promotePlayer(index) {
    const p = players[index];
    if (!p) return;
    if (countAssignment("main") >= 20) {
      alert("Main squad is full. Use a swap instead.");
      return;
    }
    p.assignment = "main";
    save();
    render();
  }

  function renderSuggestions() {
    const host = byId("suggestions");
    host.textContent = "";

    const unavailableMains = sortPlayers(
      players
        .map((p, index) => ({ ...p, _index: index }))
        .filter(p => p.assignment === "main" && p.status === "no")
    );

    const standby = getConfirmedStandby();
    const openMainSlots = Math.max(0, 20 - countAssignment("main"));

    if (openMainSlots > 0) {
      const fillCard = document.createElement("div");
      fillCard.className = "swap-card";
      const topChoices = standby.slice(0, openMainSlots);
      if (topChoices.length) {
        fillCard.innerHTML = `
          <div class="swap-title">Open main slots</div>
          <div class="swap-name">${openMainSlots} main slot${openMainSlots > 1 ? "s" : ""} still free</div>
          <div class="swap-meta">Best confirmed standby options are shown below.</div>
        `;
        topChoices.forEach(choice => {
          const row = document.createElement("div");
          row.className = "mini-item";
          row.style.marginTop = "10px";
          row.innerHTML = `
            <div>
              <div class="mini-name">${choice.name}</div>
              <div class="swap-meta">${assignmentLabel(choice.assignment)} · ${fmtPower(choice.power)}</div>
            </div>
          `;
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "primary";
          btn.textContent = "Promote to main";
          btn.addEventListener("click", () => promotePlayer(choice._index));
          row.appendChild(btn);
          fillCard.appendChild(row);
        });
      } else {
        fillCard.innerHTML = `
          <div class="swap-title">Open main slots</div>
          <div class="swap-name">${openMainSlots} main slot${openMainSlots > 1 ? "s" : ""} still free</div>
          <div class="swap-meta">No confirmed standby player is available yet.</div>
        `;
      }
      host.appendChild(fillCard);
    }

    if (unavailableMains.length) {
      unavailableMains.forEach((out, i) => {
        const replacement = standby[i];
        const card = document.createElement("div");
        card.className = "swap-card";
        if (replacement) {
          card.innerHTML = `
            <div class="swap-grid">
              <div>
                <div class="swap-title">Main unavailable</div>
                <div class="swap-name">${out.name}</div>
                <div class="swap-meta">${out.rank || "No rank"} · ${fmtPower(out.power)}</div>
              </div>
              <div class="swap-arrow">→</div>
              <div>
                <div class="swap-title">Suggested replacement</div>
                <div class="swap-name">${replacement.name}</div>
                <div class="swap-meta">${assignmentLabel(replacement.assignment)} · ${fmtPower(replacement.power)}</div>
              </div>
            </div>
          `;
          const actions = document.createElement("div");
          actions.className = "swap-actions";
          const swapBtn = document.createElement("button");
          swapBtn.type = "button";
          swapBtn.className = "primary";
          swapBtn.textContent = "Swap now";
          swapBtn.addEventListener("click", () => doSuggestedSwap(out._index, replacement._index));
          actions.appendChild(swapBtn);

          const moveOutBtn = document.createElement("button");
          moveOutBtn.type = "button";
          moveOutBtn.className = "secondary";
          moveOutBtn.textContent = "Bench unavailable main";
          moveOutBtn.addEventListener("click", () => {
            players[out._index].assignment = "unselected";
            save();
            render();
          });
          actions.appendChild(moveOutBtn);
          card.appendChild(actions);
        } else {
          card.innerHTML = `
            <div class="swap-title">Main unavailable</div>
            <div class="swap-name">${out.name}</div>
            <div class="swap-meta">${fmtPower(out.power)}</div>
            <div class="footnote">No confirmed standby player is available right now.</div>
          `;
        }
        host.appendChild(card);
      });
    }

    if (!openMainSlots && !unavailableMains.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "No urgent actions right now. Mark attendance and suggestions will appear here.";
      host.appendChild(empty);
    }
  }

  function renderStandbyPool() {
    const host = byId("standbyPool");
    host.textContent = "";
    const standby = getConfirmedStandby();

    if (!standby.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "No confirmed non-main players yet.";
      host.appendChild(empty);
      return;
    }

    standby.slice(0, 10).forEach(p => {
      const row = document.createElement("div");
      row.className = "mini-item";
      row.innerHTML = `
        <div>
          <div class="mini-name">${p.name}</div>
          <div class="swap-meta">${assignmentLabel(p.assignment)} · ${fmtPower(p.power)}</div>
        </div>
      `;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "primary";
      btn.textContent = countAssignment("main") < 20 ? "Promote" : "Promote ↔";
      btn.addEventListener("click", () => movePlayer(p._index, "main"));
      row.appendChild(btn);
      host.appendChild(row);
    });
  }

  function fillEmptyMainSlots() {
    let mainCount = countAssignment("main");
    if (mainCount >= 20) {
      alert("Main squad is already full.");
      return;
    }
    const standby = getConfirmedStandby();
    if (!standby.length) {
      alert("No confirmed standby players are available to promote.");
      return;
    }
    for (const p of standby) {
      if (mainCount >= 20) break;
      players[p._index].assignment = "main";
      mainCount += 1;
    }
    save();
    render();
  }

  function autoMoveConfirmedSubsIfShort() {
    const mainCount = countAssignment("main");
    const open = 20 - mainCount;
    if (open <= 0) {
      alert("Main squad is not short right now.");
      return;
    }
    const confirmedSubs = sortPlayers(
      players
        .map((p, index) => ({ ...p, _index: index }))
        .filter(p => p.assignment === "sub" && p.status === "confirmed")
    );
    if (!confirmedSubs.length) {
      alert("No confirmed substitutes are available to move.");
      return;
    }
    confirmedSubs.slice(0, open).forEach(p => {
      players[p._index].assignment = "main";
    });
    save();
    render();
  }

  function lineupText() {
    const sections = [
      ["main", "MAIN SQUAD"],
      ["sub", "SUBSTITUTES"],
      ["unselected", "NOT SELECTED"]
    ];
    const parts = ["X-CLASH · RUINS BATTLEFIELD · 11 Sep 2026 · 21:00 to 21:30", ""];
    sections.forEach(([assignment, title]) => {
      parts.push(title);
      const list = sortPlayers(players.filter(p => p.assignment === assignment).map(p => ({ ...p })));
      list.forEach(p => {
        const icon = p.status === "confirmed" ? "✅" : p.status === "no" ? "❌" : "❓";
        parts.push(icon + " " + p.name + " · " + statusLabel(p.status));
      });
      parts.push("");
    });
    return parts.join("\n");
  }

  function exportCsv() {
    const rows = [["Name","Power","Rank","Assignment","Attendance"]];
    const assignmentOrder = { main: 0, sub: 1, unselected: 2 };
    players
      .slice()
      .sort((a, b) => {
        const ao = (assignmentOrder[a.assignment] ?? 99) - (assignmentOrder[b.assignment] ?? 99);
        if (ao !== 0) return ao;
        const so = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
        if (so !== 0) return so;
        const po = powerValue(b) - powerValue(a);
        if (po !== 0) return po;
        return a.name.localeCompare(b.name);
      })
      .forEach(p => rows.push([p.name, p.power ?? "", p.rank, assignmentLabel(p.assignment), statusLabel(p.status)]));
    const csv = rows.map(r => r.map(v => {
      const s = String(v ?? "");
      return '"' + s.replace(/"/g, '""') + '"';
    }).join(",")).join("\n");
    downloadBlob("x-clash-attendance.csv", csv, "text/csv;charset=utf-8");
  }

  function backupJson() {
    downloadBlob("x-clash-attendance-backup.json", JSON.stringify(players, null, 2), "application/json");
  }

  function restoreJson(file) {
    file.text().then(text => {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("Invalid format");
      players = data.map(normalizePlayer);
      save();
      render();
    }).catch(() => {
      alert("That backup file could not be loaded.");
    });
  }

  function downloadBlob(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function renderHeaderStats() {
    const mainCount = countAssignment("main");
    const subCount = countAssignment("sub");
    const confirmedCount = countStatus("confirmed");
    const waitingCount = countStatus("waiting");
    const cannotCount = countStatus("no");
    const readyMainCount = players.filter(p => p.assignment === "main" && p.status === "confirmed").length;

    byId("mainCount").textContent = mainCount + "/20";
    byId("subCount").textContent = subCount + "/10";
    byId("confirmedCount").textContent = confirmedCount;
    byId("waitingCount").textContent = waitingCount;
    byId("cannotCount").textContent = cannotCount;
    byId("readyMainCount").textContent = readyMainCount;
    byId("mainProgress").style.width = Math.min(100, (mainCount / 20) * 100) + "%";
    byId("subProgress").style.width = Math.min(100, (subCount / 10) * 100) + "%";

    const mainConfirmed = players.filter(p => p.assignment === "main" && p.status === "confirmed").length;
    const mainWaiting = players.filter(p => p.assignment === "main" && p.status === "waiting").length;
    const mainNo = players.filter(p => p.assignment === "main" && p.status === "no").length;
    const subConfirmed = players.filter(p => p.assignment === "sub" && p.status === "confirmed").length;
    const subWaiting = players.filter(p => p.assignment === "sub" && p.status === "waiting").length;
    const benchCount = countAssignment("unselected");

    byId("mainMeta").textContent = mainConfirmed + " confirmed · " + mainWaiting + " waiting · " + mainNo + " no";
    byId("subMeta").textContent = subConfirmed + " confirmed · " + subWaiting + " waiting";
    byId("benchMeta").textContent = benchCount + " players";
  }

  function render() {
    renderHeaderStats();
    renderList("main", "mainList");
    renderList("sub", "subList");
    renderList("unselected", "benchList");
    renderReadiness();
    renderSuggestions();
    renderStandbyPool();
  }

  byId("search").addEventListener("input", render);
  byId("addBtn").addEventListener("click", openAdd);
  byId("fillBtn").addEventListener("click", fillEmptyMainSlots);
  byId("confirmTopBtn").addEventListener("click", autoMoveConfirmedSubsIfShort);
  byId("copyBtn").addEventListener("click", async () => {
    const text = lineupText();
    try {
      await navigator.clipboard.writeText(text);
      const old = byId("copyBtn").textContent;
      byId("copyBtn").textContent = "Copied";
      setTimeout(() => byId("copyBtn").textContent = old, 1200);
    } catch (e) {
      alert("Could not copy automatically on this device. Use Export CSV instead.");
    }
  });
  byId("csvBtn").addEventListener("click", exportCsv);
  byId("backupBtn").addEventListener("click", backupJson);
  byId("restoreBtn").addEventListener("click", () => byId("restoreFile").click());
  byId("restoreFile").addEventListener("change", e => {
    const file = e.target.files && e.target.files[0];
    if (file) restoreJson(file);
    e.target.value = "";
  });
  byId("printBtn").addEventListener("click", () => window.print());
  byId("resetBtn").addEventListener("click", () => {
    if (confirm("Reset back to the screenshot roster?")) {
      players = clone(SEED);
      save();
      render();
    }
  });
  byId("cancelDialog").addEventListener("click", () => byId("playerDialog").close());
  byId("cancelSwap").addEventListener("click", () => {
    pendingSwap = null;
    byId("swapDialog").close();
  });
  byId("swapForm").addEventListener("submit", e => {
    e.preventDefault();
    completeCapacitySwap();
  });

  byId("playerForm").addEventListener("submit", e => {
    e.preventDefault();
    const idx = byId("editIndex").value;
    const record = normalizePlayer({
      name: byId("playerName").value.trim(),
      power: byId("playerPower").value.trim() === "" ? null : Number(byId("playerPower").value),
      rank: byId("playerRank").value.trim(),
      assignment: byId("playerAssignment").value,
      status: byId("playerStatus").value
    });
    if (!record.name) return;

    if (idx === "") players.push(record);
    else players[Number(idx)] = record;

    save();
    byId("playerDialog").close();
    render();
  });

  render();
