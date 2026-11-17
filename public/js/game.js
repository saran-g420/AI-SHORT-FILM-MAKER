/**
 * CyberStrike: Game Controller & Session Bridge
 * Links UI HUD, Controls, Engine, and Server APIs
 * Enhanced for Instant Play by Everyone + Tournament Code Support
 */

document.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('gameCanvas');
  const hudTeamName = document.getElementById('hudTeamName');
  const hudStudents = document.getElementById('hudStudents');
  const hudTimer = document.getElementById('hudTimer');
  const hudScore = document.getElementById('hudScore');
  const hudLevel = document.getElementById('hudLevel');
  const hudKills = document.getElementById('hudKills');
  const hudAccuracy = document.getElementById('hudAccuracy');
  const hudLives = document.getElementById('hudLives');
  const hpBar = document.getElementById('hpBar');
  const hpText = document.getElementById('hpText');
  const shieldBar = document.getElementById('shieldBar');
  const shieldText = document.getElementById('shieldText');
  const powerupBadge = document.getElementById('powerupBadge');
  const powerupTimer = document.getElementById('powerupTimer');

  // Modals & Overlays
  const preFlightModal = document.getElementById('preFlightModal');
  const startFlightBtn = document.getElementById('startFlightBtn');
  const pauseModal = document.getElementById('pauseModal');
  const resumeBtn = document.getElementById('resumeBtn');
  const resultsModal = document.getElementById('resultsModal');
  const btnPlayAgain = document.getElementById('btnPlayAgain');

  // Results Screen Elements
  const resTeamName = document.getElementById('resTeamName');
  const resFinalScore = document.getElementById('resFinalScore');
  const resRank = document.getElementById('resRank');
  const resLevels = document.getElementById('resLevels');
  const resEnemies = document.getElementById('resEnemies');
  const resAccuracy = document.getElementById('resAccuracy');
  const resReason = document.getElementById('resReason');

  // Controls
  const btnShoot = document.getElementById('btnShoot');
  const btnPause = document.getElementById('btnPause');
  const btnAudio = document.getElementById('btnAudio');
  const btnAutoFire = document.getElementById('btnAutoFire');

  // Retrieve or Auto-Generate Session (Permits Everyone to Play Immediately)
  let sessionToken = sessionStorage.getItem('cyber_session_token');
  let teamCode = sessionStorage.getItem('cyber_team_code');
  let teamDataStr = sessionStorage.getItem('cyber_team_data');
  let durationSeconds = parseInt(sessionStorage.getItem('cyber_duration') || '300', 10);
  let team = null;

  if (teamDataStr) {
    try {
      team = JSON.parse(teamDataStr);
    } catch (e) {
      team = null;
    }
  }

  // If no official tournament team code is in storage, start an Instant Quick-Play session!
  if (!sessionToken || !team) {
    try {
      const qRes = await fetch('/api/game/quick-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: 'Cyber Pilot' })
      });
      const qData = await qRes.json();
      if (qData.success) {
        sessionToken = qData.sessionToken;
        team = qData.team;
        teamCode = qData.team.code;
        durationSeconds = qData.durationSeconds;

        sessionStorage.setItem('cyber_session_token', sessionToken);
        sessionStorage.setItem('cyber_team_code', teamCode);
        sessionStorage.setItem('cyber_team_data', JSON.stringify(team));
        sessionStorage.setItem('cyber_duration', durationSeconds);
      }
    } catch (err) {
      console.warn('Offline mode fallback:', err);
      sessionToken = 'offline-token-' + Date.now();
      teamCode = 'ARCADE';
      team = {
        name: 'CYBER-PILOT',
        student1_name: 'Player 1',
        student2_name: 'Solo Mech',
        student1_college: 'Open Arcade'
      };
    }
  }

  // Populate HUD details
  hudTeamName.textContent = (team.name || 'CYBER PILOT').toUpperCase();
  hudStudents.textContent = team.student2_name 
    ? `${team.student1_name} & ${team.student2_name} (${team.student1_college})`
    : `${team.student1_name} (${team.student1_college})`;

  // Fit canvas to display resolution
  function resizeCanvas() {
    canvas.width = 960;
    canvas.height = 640;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let engine = null;

  // Audio Toggle
  let isMuted = false;
  btnAudio.addEventListener('click', () => {
    isMuted = !isMuted;
    if (window.cyberAudio) window.cyberAudio.setMuted(isMuted);
    btnAudio.innerHTML = isMuted ? '🔇 Audio: OFF' : '🔊 Audio: ON';
    btnAudio.classList.toggle('btn-muted', isMuted);
  });

  // Auto-Fire Toggle
  let autoFireEnabled = false;
  if (btnAutoFire) {
    btnAutoFire.addEventListener('click', () => {
      if (engine) {
        autoFireEnabled = engine.toggleAutoFire();
      } else {
        autoFireEnabled = !autoFireEnabled;
      }
      btnAutoFire.innerHTML = autoFireEnabled ? '⚡ Auto-Fire: ON' : '⚡ Auto-Fire: OFF';
      btnAutoFire.classList.toggle('btn-success', autoFireEnabled);
    });
  }

  // On-Screen Shoot Button (supports click, pointerdown, touch)
  if (btnShoot) {
    const startShoot = (e) => {
      e.preventDefault();
      if (engine) {
        engine.setScreenShoot(true);
        engine.firePlayerWeapon();
      }
      btnShoot.classList.add('active');
    };
    const stopShoot = (e) => {
      e.preventDefault();
      if (engine) engine.setScreenShoot(false);
      btnShoot.classList.remove('active');
    };

    btnShoot.addEventListener('pointerdown', startShoot);
    btnShoot.addEventListener('pointerup', stopShoot);
    btnShoot.addEventListener('pointercancel', stopShoot);
    btnShoot.addEventListener('click', (e) => {
      e.preventDefault();
      if (engine) engine.firePlayerWeapon();
    });
  }

  // Canvas click auto-focus
  canvas.addEventListener('click', () => {
    canvas.focus();
  });

  // Pause button
  if (btnPause) {
    btnPause.addEventListener('click', () => {
      if (engine) engine.togglePause();
    });
  }

  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      if (engine) engine.togglePause();
    });
  }

  // Pre-Flight Start Button (or clicking anywhere on pre-flight modal)
  startFlightBtn.addEventListener('click', () => {
    preFlightModal.classList.add('hidden');
    initAndStartGame();
  });

  // Also dismiss preflight on Space or Enter
  const keyDismissPreflight = (e) => {
    if (!preFlightModal.classList.contains('hidden')) {
      if (e.code === 'Space' || e.code === 'Enter') {
        preFlightModal.classList.add('hidden');
        initAndStartGame();
        window.removeEventListener('keydown', keyDismissPreflight);
      }
    }
  };
  window.addEventListener('keydown', keyDismissPreflight);

  // Play Again Button (Instant Replay for Everyone!)
  if (btnPlayAgain) {
    btnPlayAgain.addEventListener('click', async () => {
      resultsModal.classList.add('hidden');
      // Create fresh session
      try {
        const qRes = await fetch('/api/game/quick-start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerName: team.student1_name || 'Cyber Pilot' })
        });
        const qData = await qRes.json();
        if (qData.success) {
          sessionToken = qData.sessionToken;
          sessionStorage.setItem('cyber_session_token', sessionToken);
        }
      } catch (e) {
        sessionToken = 'offline-token-' + Date.now();
      }
      initAndStartGame();
    });
  }

  function initAndStartGame() {
    if (engine) {
      engine.destroy();
    }

    engine = new window.RobotShooterEngine(canvas, {
      durationSeconds: durationSeconds,
      autoFire: autoFireEnabled,
      onHudUpdate: handleHudUpdate,
      onGameOver: handleGameOver,
      onLevelComplete: handleLevelComplete
    });

    engine.start();
    canvas.focus();
  }

  function handleHudUpdate(hud) {
    // Timer formatting mm:ss
    const mins = Math.floor(hud.timeRemaining / 60);
    const secs = hud.timeRemaining % 60;
    hudTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (hud.timeRemaining <= 30) {
      hudTimer.classList.add('timer-warning');
    }

    // Score
    hudScore.textContent = hud.score.toLocaleString();

    // Level
    hudLevel.textContent = `LEVEL ${hud.level}`;

    // Kills
    hudKills.textContent = `${hud.totalKills}`;

    // Accuracy
    hudAccuracy.textContent = `${hud.accuracy}%`;

    // Lives
    if (hudLives && hud.lives !== undefined) {
      hudLives.textContent = '❤️'.repeat(Math.max(0, hud.lives));
    }

    // HP Bar
    const hpPct = Math.max(0, Math.min(100, Math.round((hud.hp / hud.maxHp) * 100)));
    hpBar.style.width = `${hpPct}%`;
    hpText.textContent = `${hud.hp}/${hud.maxHp}`;

    // Shield Bar
    const shieldPct = Math.max(0, Math.min(100, Math.round((hud.shield / hud.maxShield) * 100)));
    shieldBar.style.width = `${shieldPct}%`;
    shieldText.textContent = `${hud.shield}/${hud.maxShield}`;

    // Powerup badge
    if (hud.powerup) {
      powerupBadge.classList.remove('hidden');
      powerupTimer.textContent = `${hud.powerup.toUpperCase()} (${hud.powerupTimer}s)`;
    } else {
      powerupBadge.classList.add('hidden');
    }

    // Pause modal
    if (hud.paused) {
      pauseModal.classList.remove('hidden');
    } else {
      pauseModal.classList.add('hidden');
    }
  }

  function handleLevelComplete(level) {
    // Level complete trigger
  }

  async function handleGameOver(results) {
    console.log('Game session concluded:', results);

    // Display provisional results on screen
    resTeamName.textContent = team.name;
    resFinalScore.textContent = results.finalScore.toLocaleString();
    resLevels.textContent = results.levelsCompleted;
    resEnemies.textContent = results.enemiesDefeated;
    resAccuracy.textContent = `${results.accuracy}%`;
    resReason.textContent = results.reason;

    // Show modal immediately
    resultsModal.classList.remove('hidden');

    // Submit results to server
    try {
      const response = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: sessionToken,
          score: results.finalScore,
          levelsCompleted: results.levelsCompleted,
          enemiesDefeated: results.enemiesDefeated,
          shotsFired: results.shotsFired,
          shotsHit: results.shotsHit,
          scoreBreakdown: {
            accuracyBonus: results.accuracyBonus,
            playTime: results.playTimeSeconds
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        resRank.textContent = `#${data.rank}`;
        sessionStorage.setItem('cyber_has_played', 'true');
        sessionStorage.setItem('cyber_final_score', data.score);
      } else {
        resRank.textContent = 'Submitted';
      }
    } catch (err) {
      console.error('Network error submitting score:', err);
      resRank.textContent = 'Saved';
    }
  }
});
