/**
 * Live Leaderboard & Projector Controller
 * Powered by WebSockets with Auto-Polling Fallback
 */

document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('leaderboardBody');
  const podiumSection = document.getElementById('podiumSection');
  const leaderboardView = document.getElementById('leaderboardView');
  const hiddenNotice = document.getElementById('hiddenNotice');
  const refreshBtn = document.getElementById('refreshBtn');
  const liveStatusBadge = document.getElementById('liveStatusBadge');
  const projectorToggleBtn = document.getElementById('projectorToggleBtn');

  // Podium slots
  const p1Team = document.getElementById('p1Team');
  const p1Students = document.getElementById('p1Students');
  const p1Score = document.getElementById('p1Score');
  const p1Stats = document.getElementById('p1Stats');

  const p2Team = document.getElementById('p2Team');
  const p2Students = document.getElementById('p2Students');
  const p2Score = document.getElementById('p2Score');
  const p2Stats = document.getElementById('p2Stats');

  const p3Team = document.getElementById('p3Team');
  const p3Students = document.getElementById('p3Students');
  const p3Score = document.getElementById('p3Score');
  const p3Stats = document.getElementById('p3Stats');

  let ws = null;
  let isProjector = false;

  // Initial fetch
  fetchLeaderboard();

  // Connect WebSocket
  initWebSocket();

  // Fallback Polling every 5 seconds
  setInterval(fetchLeaderboard, 5000);

  if (refreshBtn) {
    refreshBtn.addEventListener('click', fetchLeaderboard);
  }

  // Projector Mode Toggle
  if (projectorToggleBtn) {
    projectorToggleBtn.addEventListener('click', () => {
      isProjector = !isProjector;
      document.body.classList.toggle('projector-mode', isProjector);
      projectorToggleBtn.textContent = isProjector ? '✖ Exit Projector' : '📽️ Projector Mode';

      // Attempt browser fullscreen request
      if (isProjector && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (!isProjector && document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  function initWebSocket() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        liveStatusBadge.textContent = '● LIVE SYNC ACTIVE';
        liveStatusBadge.className = 'badge badge-green';
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'LEADERBOARD_UPDATE') {
            if (msg.data.visible === false) {
              showHiddenState();
            } else {
              renderLeaderboard(msg.data.leaderboard || []);
            }
          }
        } catch (e) {
          console.warn('WS parse error:', e);
        }
      };

      ws.onclose = () => {
        liveStatusBadge.textContent = '○ POLLING (WS RECONNECTING)';
        liveStatusBadge.className = 'badge badge-gold';
        setTimeout(initWebSocket, 4000);
      };

      ws.onerror = () => {
        liveStatusBadge.textContent = '○ POLLING ACTIVE';
        liveStatusBadge.className = 'badge badge-gold';
      };
    } catch (err) {
      console.warn('WebSocket init exception:', err);
    }
  }

  async function fetchLeaderboard() {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();

      if (data.visible === false) {
        showHiddenState();
        return;
      }

      renderLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.warn('Failed to fetch leaderboard:', err);
    }
  }

  function showHiddenState() {
    leaderboardView.classList.add('hidden');
    hiddenNotice.classList.remove('hidden');
  }

  function renderLeaderboard(list) {
    hiddenNotice.classList.add('hidden');
    leaderboardView.classList.remove('hidden');

    if (!list || list.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center" style="padding: 3rem; color: var(--text-dim);">
            No tournament sessions recorded yet. Teams are preparing for engagement!
          </td>
        </tr>
      `;
      // Clear podium
      resetPodiumCard(p1Team, p1Students, p1Score, p1Stats);
      resetPodiumCard(p2Team, p2Students, p2Score, p2Stats);
      resetPodiumCard(p3Team, p3Students, p3Score, p3Stats);
      return;
    }

    // Populate Podium (Top 3)
    if (list[0]) {
      p1Team.textContent = list[0].team_name.toUpperCase();
      p1Students.textContent = `${list[0].student1_name} & ${list[0].student2_name} (${list[0].student1_college})`;
      p1Score.textContent = list[0].score.toLocaleString();
      p1Stats.textContent = `Accuracy: ${list[0].accuracy}% | Kills: ${list[0].enemies_defeated} | Lvl: ${list[0].levels_completed}`;
    } else {
      resetPodiumCard(p1Team, p1Students, p1Score, p1Stats);
    }

    if (list[1]) {
      p2Team.textContent = list[1].team_name.toUpperCase();
      p2Students.textContent = `${list[1].student1_name} & ${list[1].student2_name} (${list[1].student1_college})`;
      p2Score.textContent = list[1].score.toLocaleString();
      p2Stats.textContent = `Accuracy: ${list[1].accuracy}% | Kills: ${list[1].enemies_defeated}`;
    } else {
      resetPodiumCard(p2Team, p2Students, p2Score, p2Stats);
    }

    if (list[2]) {
      p3Team.textContent = list[2].team_name.toUpperCase();
      p3Students.textContent = `${list[2].student1_name} & ${list[2].student2_name} (${list[2].student1_college})`;
      p3Score.textContent = list[2].score.toLocaleString();
      p3Stats.textContent = `Accuracy: ${list[2].accuracy}% | Kills: ${list[2].enemies_defeated}`;
    } else {
      resetPodiumCard(p3Team, p3Students, p3Score, p3Stats);
    }

    // Populate Full Table
    let html = '';
    list.forEach((team, idx) => {
      const rank = idx + 1;
      let rankBadgeClass = 'rank-pill-other';
      if (rank === 1) rankBadgeClass = 'rank-pill-1';
      else if (rank === 2) rankBadgeClass = 'rank-pill-2';
      else if (rank === 3) rankBadgeClass = 'rank-pill-3';

      html += `
        <tr style="${rank <= 3 ? 'background: rgba(0, 247, 255, 0.03);' : ''}">
          <td style="text-align: center;">
            <span class="rank-pill ${rankBadgeClass}">${rank}</span>
          </td>
          <td>
            <div style="font-weight: 800; color: #fff; font-size: 1rem; letter-spacing: 0.5px;">
              ${escapeHtml(team.team_name)}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-dim); font-family: var(--font-mono);">
              ${escapeHtml(team.team_code)}
            </div>
          </td>
          <td>
            <div style="color: var(--text-primary); font-size: 0.88rem;">
              ${escapeHtml(team.student1_name)} &amp; ${escapeHtml(team.student2_name)}
            </div>
          </td>
          <td style="color: var(--text-secondary); font-size: 0.85rem;">
            ${escapeHtml(team.student1_college)}
          </td>
          <td style="text-align: right;">
            <span style="font-family: var(--font-mono); font-weight: 900; font-size: 1.15rem; color: ${rank === 1 ? 'var(--accent-yellow)' : 'var(--primary-cyan)'};">
              ${team.score.toLocaleString()}
            </span>
          </td>
          <td style="text-align: center; font-weight: 700; color: var(--text-secondary);">
            ${team.levels_completed} / 4
          </td>
          <td style="text-align: center; font-family: var(--font-mono); color: #fff;">
            ${team.enemies_defeated}
          </td>
          <td style="text-align: center;">
            <span class="badge ${team.accuracy >= 80 ? 'badge-green' : team.accuracy >= 50 ? 'badge-cyan' : 'badge-gold'}">
              ${team.accuracy}%
            </span>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  }

  function resetPodiumCard(teamEl, studentsEl, scoreEl, statsEl) {
    teamEl.textContent = 'STAND BY';
    studentsEl.textContent = '--';
    scoreEl.textContent = '0';
    statsEl.textContent = 'Accuracy: --% | Kills: --';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => {
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
      }
    });
  }
});
