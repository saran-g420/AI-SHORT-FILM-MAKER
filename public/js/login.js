/**
 * Team Login & Pre-Flight Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const codeInput = document.getElementById('teamCodeInput');
  const errorAlert = document.getElementById('errorAlert');
  const infoAlert = document.getElementById('infoAlert');
  const verifyBtn = document.getElementById('verifyBtn');

  const teamPreviewCard = document.getElementById('teamPreviewCard');
  const prevTeamName = document.getElementById('prevTeamName');
  const prevStudents = document.getElementById('prevStudents');
  const sessionStatusPill = document.getElementById('sessionStatusPill');
  const launchGameBtn = document.getElementById('launchGameBtn');
  const viewLeaderboardBtn = document.getElementById('viewLeaderboardBtn');

  // Check URL query for auto-fill code (e.g. ?code=ROBO-ABC123)
  const urlParams = new URLSearchParams(window.location.search);
  const codeParam = urlParams.get('code') || sessionStorage.getItem('cyber_team_code');
  if (codeParam) {
    codeInput.value = codeParam;
    verifyCode(codeParam);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = codeInput.value.trim().toUpperCase();
    if (code) {
      verifyCode(code);
    }
  });

  async function verifyCode(code) {
    errorAlert.classList.add('hidden');
    infoAlert.classList.add('hidden');
    teamPreviewCard.classList.add('hidden');
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Verifying Authorization...';

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await res.json();
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify Code & Briefing 🔓';

      if (!res.ok || !data.success) {
        errorAlert.textContent = data.error || 'Invalid team code.';
        errorAlert.classList.remove('hidden');
        return;
      }

      // Populate preview
      const team = data.team;
      prevTeamName.textContent = team.name.toUpperCase();
      prevStudents.textContent = `${team.student1_name} (${team.student1_college}) & ${team.student2_name} (${team.student2_college})`;

      // Store in session
      sessionStorage.setItem('cyber_team_code', team.code);
      sessionStorage.setItem('cyber_team_data', JSON.stringify(team));
      sessionStorage.setItem('cyber_duration', data.durationSeconds);

      if (!data.gameOpen) {
        sessionStatusPill.textContent = 'STATUS: ARENA CURRENTLY LOCKED BY ADMIN';
        sessionStatusPill.className = 'status-pill badge-red';
        launchGameBtn.disabled = true;
        infoAlert.textContent = 'The game arena is temporarily closed by event organizers. Please stand by.';
        infoAlert.classList.remove('hidden');
      } else if (!data.canPlay && data.sessionStatus === 'COMPLETED') {
        sessionStatusPill.textContent = `STATUS: COMPLETED (SCORE: ${data.lastScore || 0})`;
        sessionStatusPill.className = 'status-pill badge-gold';
        launchGameBtn.classList.add('hidden');
        viewLeaderboardBtn.classList.remove('hidden');
        infoAlert.textContent = 'Your team has already finished your official tournament session! Check your rank on the leaderboard.';
        infoAlert.classList.remove('hidden');
      } else {
        sessionStatusPill.textContent = 'STATUS: READY TO COMMENCE RUN (5:00 MIN)';
        sessionStatusPill.className = 'status-pill badge-green';
        launchGameBtn.classList.remove('hidden');
        launchGameBtn.disabled = false;
        viewLeaderboardBtn.classList.add('hidden');
      }

      teamPreviewCard.classList.remove('hidden');
    } catch (err) {
      console.error('Login error:', err);
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify Code & Briefing 🔓';
      errorAlert.textContent = 'Server error or network failure. Please verify the server is running.';
      errorAlert.classList.remove('hidden');
    }
  }

  // Launch Game Session
  launchGameBtn.addEventListener('click', async () => {
    const code = codeInput.value.trim().toUpperCase();
    launchGameBtn.disabled = true;
    launchGameBtn.textContent = 'Connecting to Arena Server...';

    try {
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to start tournament session.');
        launchGameBtn.disabled = false;
        launchGameBtn.textContent = 'Start Game Session (5 Mins) 🚀';
        return;
      }

      // Store active session token
      sessionStorage.setItem('cyber_session_token', data.sessionToken);
      sessionStorage.setItem('cyber_duration', data.durationSeconds);

      // Launch Game View
      window.location.href = 'game.html';
    } catch (err) {
      console.error('Session start error:', err);
      alert('Network failure connecting to arena. Please try again.');
      launchGameBtn.disabled = false;
      launchGameBtn.textContent = 'Start Game Session (5 Mins) 🚀';
    }
  });
});
