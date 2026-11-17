/**
 * STRIKE 2026: 2D ROBOT SHOOTER GAME ENGINE
 * Full-featured Canvas 2D engine with player mech, directional aiming,
 * multi-tiered enemy robots, Titan Boss battle, weapon powerups,
 * particle explosions, screen shake, and collision detection.
 */

class RobotShooterEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;

    // Arena dimensions
    this.width = canvas.width;
    this.height = canvas.height;

    // Game state
    this.running = false;
    this.paused = false;
    this.gameOver = false;
    this.victory = false;

    // Session configuration
    this.timeRemaining = options.durationSeconds || 300; // in seconds
    this.totalDuration = options.durationSeconds || 300;
    this.score = 0;
    this.currentLevel = 1;
    this.maxLevels = 4;
    this.levelKills = 0;
    this.totalKills = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;

    // Config multipliers
    this.config = Object.assign({
      baseKillScore: 100,
      levelBonusScore: 500,
      bossBonusScore: 2500,
      accuracyBonusMultiplier: 10
    }, options.config || {});

    // Target kills per level before progressing (Balanced so everyone reaches and fights the Boss!)
    this.levelGoals = [6, 10, 12, 1]; // Level 4 goal is 1 (Defeating the Boss)

    // Player
    this.player = {
      x: this.width / 2,
      y: this.height / 2 + 100,
      radius: 24,
      chassisAngle: 0,
      turretAngle: -Math.PI / 2, // Aiming up initially
      speed: 3.8,
      vx: 0,
      vy: 0,
      hp: 100,
      maxHp: 100,
      shield: 50,
      maxShield: 100,
      lives: options.lives !== undefined ? options.lives : 3,
      maxLives: 3,
      invulnerable: false,
      invulnerableTimer: 0,
      fireCooldown: 0,
      fireRate: 160, // ms between shots
      powerup: null, // 'spread', 'shield'
      powerupTimer: 0
    };

    // Auto-fire toggle (makes gameplay effortless for all players)
    this.autoFire = options.autoFire || false;

    // Entities
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.particles = [];
    this.floatingTexts = [];
    this.powerups = [];
    this.crates = [];
    this.boss = null;

    // Level announcement
    this.bannerText = '';
    this.bannerSubtext = '';
    this.bannerTimer = 0;

    // Screen Shake
    this.shakeAmount = 0;

    // Input States
    this.keys = {};
    this.aimDirection = { x: 0, y: -1 }; // Initial aim vector
    this.mouse = { x: this.width / 2, y: this.height / 2 - 100, isDown: false, useMouseAim: true };
    this.isShooting = false;

    // Starfield & Grid background
    this.stars = [];
    this.initBackground();

    // Callbacks
    this.onHudUpdate = options.onHudUpdate || (() => {});
    this.onGameOver = options.onGameOver || (() => {});
    this.onLevelComplete = options.onLevelComplete || (() => {});

    // Timing
    this.lastTime = performance.now();
    this.timerInterval = null;
    this.spawnTimer = 0;

    this.setupListeners();
    this.initCrates();
    this.showBanner('LEVEL 1: TRAINING ZONE', 'ELIMINATE 10 HOSTILE RECON DRONES');
  }

  initBackground() {
    this.stars = [];
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.4 + 0.1,
        alpha: Math.random() * 0.8 + 0.2
      });
    }
  }

  initCrates() {
    this.crates = [];
    // Place a few destructible crates in symmetric arena locations
    const cratePositions = [
      { x: this.width * 0.2, y: this.height * 0.3 },
      { x: this.width * 0.8, y: this.height * 0.3 },
      { x: this.width * 0.2, y: this.height * 0.7 },
      { x: this.width * 0.8, y: this.height * 0.7 }
    ];
    cratePositions.forEach((pos, idx) => {
      this.crates.push({
        id: idx,
        x: pos.x,
        y: pos.y,
        size: 36,
        hp: 30,
        maxHp: 30
      });
    });
  }

  updateMousePos(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (clientX === undefined && e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    if (clientX === undefined) return;

    this.mouse.x = (clientX - rect.left) * scaleX;
    this.mouse.y = (clientY - rect.top) * scaleY;
    this.mouse.useMouseAim = true;

    // Immediately calculate turret aiming angle
    const dx = this.mouse.x - this.player.x;
    const dy = this.mouse.y - this.player.y;
    const mag = Math.hypot(dx, dy);
    if (mag > 4) {
      this.aimDirection.x = dx / mag;
      this.aimDirection.y = dy / mag;
      this.player.turretAngle = Math.atan2(dy, dx);
    }
  }

  setupListeners() {
    this._keyDownHandler = (e) => {
      this.keys[e.code] = true;
      // Prevent browser scrolling for arrows & space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
      }

      // Spacebar or Enter immediate fire
      if (e.code === 'Space' || e.code === 'Enter') {
        if (this.player.fireCooldown <= 0) {
          this.firePlayerWeapon();
        }
      }
    };

    this._keyUpHandler = (e) => {
      this.keys[e.code] = false;
    };

    this._pointerMoveHandler = (e) => {
      this.updateMousePos(e);
    };

    this._pointerDownHandler = (e) => {
      if (e.button === undefined || e.button === 0) {
        this.mouse.isDown = true;
        this.updateMousePos(e);
        // Instant fire on click!
        this.firePlayerWeapon();
      }
    };

    this._pointerUpHandler = (e) => {
      this.mouse.isDown = false;
    };

    // Keyboard
    window.addEventListener('keydown', this._keyDownHandler);
    window.addEventListener('keyup', this._keyUpHandler);

    // Modern pointer events (covers mouse, touch, and stylus smoothly)
    this.canvas.addEventListener('pointermove', this._pointerMoveHandler);
    this.canvas.addEventListener('pointerdown', this._pointerDownHandler);
    window.addEventListener('pointerup', this._pointerUpHandler);

    // Touch fallbacks
    this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.updateMousePos(e); }, { passive: false });
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.mouse.isDown = true;
      this.updateMousePos(e);
      this.firePlayerWeapon();
    }, { passive: false });
    window.addEventListener('touchend', () => { this.mouse.isDown = false; });

    // Also support classic click on canvas
    this.canvas.addEventListener('click', (e) => {
      this.updateMousePos(e);
      this.firePlayerWeapon();
    });
  }

  destroy() {
    this.running = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    window.removeEventListener('keydown', this._keyDownHandler);
    window.removeEventListener('keyup', this._keyUpHandler);
    this.canvas.removeEventListener('pointermove', this._pointerMoveHandler);
    this.canvas.removeEventListener('pointerdown', this._pointerDownHandler);
    window.removeEventListener('pointerup', this._pointerUpHandler);
  }

  toggleAutoFire() {
    this.autoFire = !this.autoFire;
    this.triggerHudUpdate();
    return this.autoFire;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    if (window.cyberAudio) window.cyberAudio.startBgm();

    // 1-second countdown interval
    this.timerInterval = setInterval(() => {
      if (!this.running || this.paused) return;
      this.timeRemaining--;

      if (this.timeRemaining <= 30 && this.timeRemaining > 0) {
        if (window.cyberAudio) window.cyberAudio.playTimerBeep();
      }

      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.endSession('TIME EXPIRED');
      }

      this.triggerHudUpdate();
    }, 1000);

    requestAnimationFrame((ts) => this.loop(ts));
  }

  togglePause() {
    if (this.gameOver) return;
    this.paused = !this.paused;
    this.triggerHudUpdate();
  }

  triggerHudUpdate() {
    const accuracy = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;
    this.onHudUpdate({
      timeRemaining: this.timeRemaining,
      score: this.score,
      level: this.currentLevel,
      levelKills: this.levelKills,
      levelGoal: this.levelGoals[this.currentLevel - 1],
      totalKills: this.totalKills,
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      shield: this.player.shield,
      maxShield: this.player.maxShield,
      lives: this.player.lives,
      maxLives: this.player.maxLives,
      autoFire: this.autoFire,
      powerup: this.player.powerup,
      powerupTimer: Math.ceil(this.player.powerupTimer / 1000),
      accuracy: accuracy,
      shotsFired: this.shotsFired,
      shotsHit: this.shotsHit,
      paused: this.paused,
      bossHp: this.boss ? this.boss.hp : null,
      bossMaxHp: this.boss ? this.boss.maxHp : null
    });
  }

  showBanner(title, subtext) {
    this.bannerText = title;
    this.bannerSubtext = subtext;
    this.bannerTimer = 180; // ~3 seconds at 60fps
  }

  // Handle Level Progression
  checkLevelProgression() {
    const goal = this.levelGoals[this.currentLevel - 1];
    if (this.currentLevel < this.maxLevels && this.levelKills >= goal) {
      this.currentLevel++;
      this.levelKills = 0;

      // Add Level Completion Bonus
      const bonus = this.config.levelBonusScore;
      this.score += bonus;
      this.addFloatingText(this.player.x, this.player.y - 40, `LEVEL BONUS +${bonus}`, '#00f7ff');

      if (window.cyberAudio) window.cyberAudio.playLevelUp();
      this.screenShake(10);

      if (this.currentLevel === 2) {
        this.showBanner('LEVEL 2: ROBOT INVASION', 'HEAVY COMBAT UNITS & SWARM RUNNERS INCOMING');
      } else if (this.currentLevel === 3) {
        this.showBanner('LEVEL 3: ADVANCED COMBAT', 'STEALTH PHANTOMS & HIGH-ENERGY LASER TURRETS DETECTED');
      } else if (this.currentLevel === 4) {
        this.showBanner('FINAL LEVEL: BOSS BATTLE', 'TITAN "OMEGA-ZERO" HAS ENTERED THE ARENA!');
        if (window.cyberAudio) window.cyberAudio.playBossAlarm();
        this.spawnBoss();
      }

      this.onLevelComplete(this.currentLevel);
      this.triggerHudUpdate();
    }
  }

  spawnBoss() {
    this.boss = {
      x: this.width / 2,
      y: 120,
      width: 140,
      height: 90,
      radius: 65,
      hp: 750,
      maxHp: 750,
      speed: 1.6,
      direction: 1,
      attackTimer: 0,
      attackPhase: 1,
      phaseTimer: 0,
      shield: 150,
      maxShield: 150
    };
  }

  // Core Game Loop
  loop(timestamp) {
    if (!this.running) return;

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    if (!this.paused && !this.gameOver) {
      this.update(dt);
    }

    this.render();
    requestAnimationFrame((ts) => this.loop(ts));
  }

  // --- UPDATE LOGIC ---
  update(dt) {
    this.updatePlayer(dt);
    this.updateAiming();
    this.updateShooting(dt);
    this.updateBullets(dt);
    this.updateEnemies(dt);
    this.updateBoss(dt);
    this.updateEnemyBullets(dt);
    this.updatePowerups(dt);
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);
    this.checkCollisions();
    this.checkLevelProgression();

    if (this.bannerTimer > 0) this.bannerTimer--;
    if (this.shakeAmount > 0) this.shakeAmount *= 0.9;
  }

  // Directional Aiming as specified in Prompt Section 5
  updateAiming() {
    let arrowX = 0;
    let arrowY = 0;
    let arrowActive = false;

    // Arrow Keys Aiming (Section 5 requirements)
    if (this.keys['ArrowLeft']) { arrowX -= 1; arrowActive = true; }
    if (this.keys['ArrowRight']) { arrowX += 1; arrowActive = true; }
    if (this.keys['ArrowUp']) { arrowY -= 1; arrowActive = true; }
    if (this.keys['ArrowDown']) { arrowY += 1; arrowActive = true; }

    if (arrowActive) {
      this.mouse.useMouseAim = false;
      // Normalize vector
      const mag = Math.hypot(arrowX, arrowY);
      if (mag > 0) {
        this.aimDirection.x = arrowX / mag;
        this.aimDirection.y = arrowY / mag;
        this.player.turretAngle = Math.atan2(this.aimDirection.y, this.aimDirection.x);
      }
    } else if (this.mouse.useMouseAim) {
      // Mouse cursor aim option
      const dx = this.mouse.x - this.player.x;
      const dy = this.mouse.y - this.player.y;
      const mag = Math.hypot(dx, dy);
      if (mag > 10) {
        this.aimDirection.x = dx / mag;
        this.aimDirection.y = dy / mag;
        this.player.turretAngle = Math.atan2(dy, dx);
      }
    }
  }

  updatePlayer(dt) {
    const p = this.player;

    // Movement: WASD keys
    let mx = 0;
    let my = 0;
    if (this.keys['KeyW']) my -= 1;
    if (this.keys['KeyS']) my += 1;
    if (this.keys['KeyA']) mx -= 1;
    if (this.keys['KeyD']) mx += 1;

    // If arrows are not being used for aiming and no WASD is pressed, arrows can move
    const isArrowAiming = this.keys['ArrowUp'] || this.keys['ArrowDown'] || this.keys['ArrowLeft'] || this.keys['ArrowRight'];
    if (!isArrowAiming && mx === 0 && my === 0) {
      // If user is using mouse aim, arrows can move
      if (this.mouse.useMouseAim) {
        if (this.keys['ArrowUp']) my -= 1;
        if (this.keys['ArrowDown']) my += 1;
        if (this.keys['ArrowLeft']) mx -= 1;
        if (this.keys['ArrowRight']) mx += 1;
      }
    }

    // Apply movement
    const moveMag = Math.hypot(mx, my);
    if (moveMag > 0) {
      p.vx = (mx / moveMag) * p.speed;
      p.vy = (my / moveMag) * p.speed;
      p.chassisAngle = Math.atan2(p.vy, p.vx);

      // Thruster flame particles
      if (Math.random() < 0.4) {
        this.createParticle(
          p.x - Math.cos(p.chassisAngle) * 20,
          p.y - Math.sin(p.chassisAngle) * 20,
          (Math.random() - 0.5) * 1.5 - Math.cos(p.chassisAngle) * 2,
          (Math.random() - 0.5) * 1.5 - Math.sin(p.chassisAngle) * 2,
          '#00f7ff',
          Math.random() * 3 + 2,
          20
        );
      }
    } else {
      p.vx *= 0.8;
      p.vy *= 0.8;
    }

    p.x += p.vx;
    p.y += p.vy;

    // Arena boundary clamp
    p.x = Math.max(p.radius + 15, Math.min(this.width - p.radius - 15, p.x));
    p.y = Math.max(p.radius + 15, Math.min(this.height - p.radius - 15, p.y));

    // Powerup timer
    if (p.powerup) {
      p.powerupTimer -= dt * 1000;
      if (p.powerupTimer <= 0) {
        p.powerup = null;
        this.triggerHudUpdate();
      }
    }

    // Invulnerability timer
    if (p.invulnerable) {
      p.invulnerableTimer -= dt * 1000;
      if (p.invulnerableTimer <= 0) {
        p.invulnerable = false;
      }
    }

    // Fire cooldown
    if (p.fireCooldown > 0) {
      p.fireCooldown -= dt * 1000;
    }
  }

  // Shooting triggers: Spacebar, Enter, On-screen button, Mouse click/drag, or Auto-Fire
  updateShooting(dt) {
    const spaceDown = this.keys['Space'];
    const enterDown = this.keys['Enter'];
    const mouseDown = this.mouse.isDown;
    const shootRequested = this.autoFire || spaceDown || enterDown || mouseDown || this.isShooting;

    if (shootRequested && this.player.fireCooldown <= 0) {
      this.firePlayerWeapon();
    }
  }

  // External trigger for on-screen shoot button
  setScreenShoot(active) {
    this.isShooting = active;
    if (active && this.player.fireCooldown <= 0) {
      this.firePlayerWeapon();
    }
  }

  firePlayerWeapon() {
    const p = this.player;
    if (p.fireCooldown > 0) return;
    p.fireCooldown = p.powerup === 'spread' ? p.fireRate * 0.75 : p.fireRate;

    const barrelDist = 28;
    const startX = p.x + Math.cos(p.turretAngle) * barrelDist;
    const startY = p.y + Math.sin(p.turretAngle) * barrelDist;
    const baseSpeed = 12;

    if (p.powerup === 'spread') {
      // 3-way spread shot
      const angles = [p.turretAngle - 0.2, p.turretAngle, p.turretAngle + 0.2];
      angles.forEach((ang) => {
        this.bullets.push({
          x: startX,
          y: startY,
          vx: Math.cos(ang) * baseSpeed,
          vy: Math.sin(ang) * baseSpeed,
          radius: 5,
          color: '#bc13fe',
          damage: 32,
          life: 70
        });
      });
      this.shotsFired += 3;
      if (window.cyberAudio) window.cyberAudio.playHeavyShot();
    } else {
      // Single laser bolt
      this.bullets.push({
        x: startX,
        y: startY,
        vx: Math.cos(p.turretAngle) * baseSpeed,
        vy: Math.sin(p.turretAngle) * baseSpeed,
        radius: 4,
        color: '#00f7ff',
        damage: 40,
        life: 70
      });
      this.shotsFired += 1;
      if (window.cyberAudio) window.cyberAudio.playLaser();
    }

    // Muzzle flash particle
    this.createParticle(startX, startY, p.aimDirection.x * 2, p.aimDirection.y * 2, '#fff', 6, 8);
    this.triggerHudUpdate();
  }

  updateBullets(dt) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      if (b.life <= 0 || b.x < -30 || b.x > this.width + 30 || b.y < -30 || b.y > this.height + 30) {
        this.bullets.splice(i, 1);
      }
    }
  }

  updateEnemyBullets(dt) {
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const eb = this.enemyBullets[i];
      eb.x += eb.vx;
      eb.y += eb.vy;
      eb.life--;

      if (eb.life <= 0 || eb.x < -30 || eb.x > this.width + 30 || eb.y < -30 || eb.y > this.height + 30) {
        this.enemyBullets.splice(i, 1);
      }
    }
  }

  // Spawn Enemy Robots based on level
  updateEnemies(dt) {
    this.spawnTimer += dt;
    // Spawn rate adapts to level
    const spawnInterval = Math.max(0.9, 2.2 - this.currentLevel * 0.35);

    // Max active enemies on screen
    const maxActive = 4 + this.currentLevel * 3;

    if (this.currentLevel < 4 && this.enemies.length < maxActive && this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }

    // Update active enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      this.updateSingleEnemy(e, dt, i);
    }
  }

  spawnEnemy() {
    // Choose spawn edge inside the safe active combat perimeter
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = Math.random() * (this.width - 80) + 40; y = 25; }
    else if (edge === 1) { x = this.width - 25; y = Math.random() * (this.height - 80) + 40; }
    else if (edge === 2) { x = Math.random() * (this.width - 80) + 40; y = this.height - 25; }
    else { x = 25; y = Math.random() * (this.height - 80) + 40; }

    let type = 'scout';
    if (this.currentLevel === 1) {
      type = Math.random() < 0.6 ? 'scout' : 'patrol';
    } else if (this.currentLevel === 2) {
      const rand = Math.random();
      if (rand < 0.4) type = 'runner';
      else if (rand < 0.75) type = 'bruiser';
      else type = 'scout';
    } else if (this.currentLevel === 3) {
      const rand = Math.random();
      if (rand < 0.35) type = 'phantom';
      else if (rand < 0.7) type = 'turret';
      else type = 'runner';
    }

    const enemyData = this.getEnemyStats(type);
    this.enemies.push({
      type,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: enemyData.radius,
      hp: enemyData.hp,
      maxHp: enemyData.hp,
      speed: enemyData.speed,
      scoreValue: enemyData.score,
      color: enemyData.color,
      shootCooldown: Math.random() * 1.5 + 1.0,
      angle: 0,
      cloakTimer: 0,
      isCloaked: false
    });
  }

  getEnemyStats(type) {
    switch (type) {
      case 'scout':
        return { hp: 40, speed: 1.8, score: 100, radius: 18, color: '#fcee0a' };
      case 'patrol':
        return { hp: 60, speed: 1.2, score: 150, radius: 20, color: '#00ff88' };
      case 'runner':
        return { hp: 50, speed: 2.8, score: 200, radius: 16, color: '#ff7700' };
      case 'bruiser':
        return { hp: 140, speed: 0.9, score: 350, radius: 28, color: '#ff2255' };
      case 'phantom':
        return { hp: 90, speed: 2.0, score: 450, radius: 20, color: '#b537f2' };
      case 'turret':
        return { hp: 120, speed: 1.1, score: 500, radius: 24, color: '#ff00aa' };
      default:
        return { hp: 40, speed: 1.5, score: 100, radius: 18, color: '#fcee0a' };
    }
  }

  updateSingleEnemy(e, dt, index) {
    const p = this.player;
    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const dist = Math.hypot(dx, dy);

    e.angle = Math.atan2(dy, dx);

    // AI movement behavior
    if (e.type === 'runner') {
      // Rapid charge directly at player
      e.vx = (dx / dist) * e.speed;
      e.vy = (dy / dist) * e.speed;
    } else if (e.type === 'bruiser') {
      // Slow tank advance, stops at range to fire
      if (dist > 180) {
        e.vx = (dx / dist) * e.speed;
        e.vy = (dy / dist) * e.speed;
      } else {
        e.vx *= 0.9;
        e.vy *= 0.9;
      }
    } else if (e.type === 'phantom') {
      // Stealth cloaking & flanking
      e.cloakTimer += dt;
      if (e.cloakTimer > 4) {
        e.isCloaked = !e.isCloaked;
        e.cloakTimer = 0;
      }
      // Flanking motion
      const flankAngle = e.angle + Math.PI / 2;
      e.vx = (dx / dist) * e.speed * 0.7 + Math.cos(flankAngle) * e.speed * 0.6;
      e.vy = (dy / dist) * e.speed * 0.7 + Math.sin(flankAngle) * e.speed * 0.6;
    } else {
      // Standard pursuit with wandering
      if (dist > 120) {
        e.vx = (dx / dist) * e.speed;
        e.vy = (dy / dist) * e.speed;
      } else {
        e.vx *= 0.8;
        e.vy *= 0.8;
      }
    }

    e.x += e.vx;
    e.y += e.vy;

    // Active bounds safety: keep enemies inside the arena so they NEVER get stuck off-screen
    e.x = Math.max(e.radius + 8, Math.min(this.width - e.radius - 8, e.x));
    e.y = Math.max(e.radius + 8, Math.min(this.height - e.radius - 8, e.y));

    // Enemy shooting
    e.shootCooldown -= dt;
    if (e.shootCooldown <= 0 && dist < 450) {
      this.enemyShoot(e);
      e.shootCooldown = Math.random() * 1.6 + 1.2;
    }
  }

  enemyShoot(e) {
    if (e.isCloaked) return;
    const p = this.player;
    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const dist = Math.hypot(dx, dy);
    const speed = 6;

    if (e.type === 'bruiser') {
      // Dual heavy shots
      const perpX = -dy / dist * 10;
      const perpY = dx / dist * 10;
      this.enemyBullets.push({
        x: e.x + perpX,
        y: e.y + perpY,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        radius: 6,
        color: '#ff2255',
        damage: 20,
        life: 80
      });
      this.enemyBullets.push({
        x: e.x - perpX,
        y: e.y - perpY,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        radius: 6,
        color: '#ff2255',
        damage: 20,
        life: 80
      });
    } else {
      // Standard projectile
      this.enemyBullets.push({
        x: e.x,
        y: e.y,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        radius: 4,
        color: e.color,
        damage: 12,
        life: 80
      });
    }
  }

  // --- TITAN BOSS LOGIC (Final Level) ---
  updateBoss(dt) {
    if (!this.boss) return;
    const b = this.boss;

    // Boss horizontal hover motion
    b.x += b.direction * b.speed;
    if (b.x < b.width / 2 + 50) {
      b.x = b.width / 2 + 50;
      b.direction = 1;
    } else if (b.x > this.width - b.width / 2 - 50) {
      b.x = this.width - b.width / 2 - 50;
      b.direction = -1;
    }

    b.attackTimer += dt;
    b.phaseTimer += dt;

    // Cycle attacks every 4 seconds
    if (b.phaseTimer > 5) {
      b.attackPhase = (b.attackPhase % 3) + 1;
      b.phaseTimer = 0;
    }

    if (b.attackTimer >= 0.35) {
      b.attackTimer = 0;
      this.bossAttack(b);
    }
  }

  bossAttack(b) {
    const p = this.player;
    const dx = p.x - b.x;
    const dy = p.y - b.y;
    const angleToPlayer = Math.atan2(dy, dx);

    if (b.attackPhase === 1) {
      // Spiral bullet storm
      const t = performance.now() * 0.003;
      for (let i = 0; i < 4; i++) {
        const ang = t + (i * Math.PI / 2);
        this.enemyBullets.push({
          x: b.x,
          y: b.y + 30,
          vx: Math.cos(ang) * 5,
          vy: Math.sin(ang) * 5,
          radius: 6,
          color: '#ff0055',
          damage: 15,
          life: 90
        });
      }
    } else if (b.attackPhase === 2) {
      // Triple concentrated laser blast aimed at player
      const spread = [-0.25, 0, 0.25];
      spread.forEach(offset => {
        this.enemyBullets.push({
          x: b.x,
          y: b.y + 40,
          vx: Math.cos(angleToPlayer + offset) * 8,
          vy: Math.sin(angleToPlayer + offset) * 8,
          radius: 7,
          color: '#ff00aa',
          damage: 22,
          life: 80
        });
      });
      if (window.cyberAudio) window.cyberAudio.playHeavyShot();
    } else if (b.attackPhase === 3) {
      // Missile volley
      this.enemyBullets.push({
        x: b.x + (Math.random() - 0.5) * 80,
        y: b.y + 20,
        vx: (Math.random() - 0.5) * 3,
        vy: 6,
        radius: 8,
        color: '#ffaa00',
        damage: 25,
        life: 85
      });
    }
  }

  // --- POWERUPS & CRATES ---
  updatePowerups(dt) {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.life -= dt;
      p.bob += dt * 4;
      if (p.life <= 0) {
        this.powerups.splice(i, 1);
      }
    }
  }

  spawnPowerup(x, y) {
    const types = ['repair', 'spread', 'shield', 'emp'];
    const type = types[Math.floor(Math.random() * types.length)];
    this.powerups.push({
      type,
      x,
      y,
      radius: 18,
      life: 18, // 18 seconds before despawn
      bob: 0
    });
  }

  applyPowerup(type) {
    const p = this.player;
    if (window.cyberAudio) window.cyberAudio.playPowerup();

    if (type === 'repair') {
      p.hp = Math.min(p.maxHp, p.hp + 40);
      this.addFloatingText(p.x, p.y - 30, '+40 HP REPAIR', '#00ff88');
    } else if (type === 'spread') {
      p.powerup = 'spread';
      p.powerupTimer = 12000; // 12 seconds
      this.addFloatingText(p.x, p.y - 30, 'OVERCHARGE SPREAD!', '#bc13fe');
    } else if (type === 'shield') {
      p.powerup = 'shield';
      p.shield = p.maxShield;
      p.powerupTimer = 10000; // 10 seconds
      this.addFloatingText(p.x, p.y - 30, 'AEGIS SHIELD ACTIVATED!', '#00f7ff');
    } else if (type === 'emp') {
      // Screen wipe of enemy projectiles + 80 damage to all enemies
      this.enemyBullets = [];
      this.screenShake(15);
      if (window.cyberAudio) window.cyberAudio.playEMP();
      this.addFloatingText(p.x, p.y - 30, 'EMP DETONATED!', '#ffff00');

      this.enemies.forEach(e => {
        e.hp -= 80;
        this.createExplosion(e.x, e.y, e.color, 15);
      });
      if (this.boss) {
        this.boss.hp -= 150;
        this.createExplosion(this.boss.x, this.boss.y, '#ff0055', 30);
      }
    }

    this.triggerHudUpdate();
  }

  // --- COLLISION DETECTION ---
  checkCollisions() {
    const p = this.player;

    // 1. Player Bullets vs Crates
    for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
      const b = this.bullets[bIdx];
      let bulletRemoved = false;

      for (let cIdx = this.crates.length - 1; cIdx >= 0; cIdx--) {
        const c = this.crates[cIdx];
        if (Math.abs(b.x - c.x) < c.size / 2 && Math.abs(b.y - c.y) < c.size / 2) {
          c.hp -= b.damage;
          this.shotsHit++;
          this.bullets.splice(bIdx, 1);
          bulletRemoved = true;
          this.createParticle(b.x, b.y, 0, 0, '#00f7ff', 4, 8);

          if (c.hp <= 0) {
            this.spawnPowerup(c.x, c.y);
            this.createExplosion(c.x, c.y, '#00f7ff', 20);
            if (window.cyberAudio) window.cyberAudio.playExplosion(false);
            this.crates.splice(cIdx, 1);
          }
          break;
        }
      }
      if (bulletRemoved) continue;

      // 2. Player Bullets vs Enemies
      for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
        const e = this.enemies[eIdx];
        const dist = Math.hypot(b.x - e.x, b.y - e.y);
        if (dist < b.radius + e.radius) {
          this.shotsHit++;
          e.hp -= b.damage;
          this.bullets.splice(bIdx, 1);
          bulletRemoved = true;

          this.createParticle(b.x, b.y, b.vx * 0.2, b.vy * 0.2, e.color, 4, 10);

          if (e.hp <= 0) {
            this.destroyEnemy(e, eIdx);
          }
          break;
        }
      }
      if (bulletRemoved) continue;

      // 3. Player Bullets vs Boss
      if (this.boss) {
        const bBoss = this.boss;
        const dist = Math.hypot(b.x - bBoss.x, b.y - bBoss.y);
        if (dist < b.radius + bBoss.radius) {
          this.shotsHit++;
          bBoss.hp -= b.damage;
          this.bullets.splice(bIdx, 1);
          bulletRemoved = true;

          this.createParticle(b.x, b.y, 0, 0, '#ff0055', 6, 12);
          this.triggerHudUpdate();

          if (bBoss.hp <= 0) {
            this.defeatBoss();
          }
        }
      }
    }

    // 4. Enemy Bullets vs Player
    for (let ebIdx = this.enemyBullets.length - 1; ebIdx >= 0; ebIdx--) {
      const eb = this.enemyBullets[ebIdx];
      const dist = Math.hypot(eb.x - p.x, eb.y - p.y);
      if (dist < eb.radius + p.radius) {
        this.enemyBullets.splice(ebIdx, 1);
        this.damagePlayer(eb.damage);
      }
    }

    // 5. Enemy Ramming Player
    for (const e of this.enemies) {
      const dist = Math.hypot(e.x - p.x, e.y - p.y);
      if (dist < e.radius + p.radius) {
        this.damagePlayer(15);
      }
    }

    // 6. Player picking up Powerups
    for (let puIdx = this.powerups.length - 1; puIdx >= 0; puIdx--) {
      const pu = this.powerups[puIdx];
      const dist = Math.hypot(pu.x - p.x, pu.y - p.y);
      if (dist < pu.radius + p.radius) {
        this.applyPowerup(pu.type);
        this.powerups.splice(puIdx, 1);
      }
    }
  }

  damagePlayer(damage) {
    const p = this.player;
    if (p.invulnerable || p.powerup === 'shield') {
      if (window.cyberAudio) window.cyberAudio.playShieldDeflect();
      return;
    }

    this.screenShake(8);
    if (p.shield > 0) {
      if (window.cyberAudio) window.cyberAudio.playShieldDeflect();
      p.shield = Math.max(0, p.shield - damage);
    } else {
      if (window.cyberAudio) window.cyberAudio.playPlayerHit();
      p.hp -= damage;
    }

    p.invulnerable = true;
    p.invulnerableTimer = 600; // brief i-frames

    this.triggerHudUpdate();

    if (p.hp <= 0) {
      if (p.lives > 1) {
        p.lives--;
        p.hp = p.maxHp;
        p.shield = p.maxShield;
        p.invulnerable = true;
        p.invulnerableTimer = 2500;
        this.addFloatingText(p.x, p.y - 40, `⚠️ RESPAWN! (${p.lives} LIVES LEFT)`, '#ffe600');
        this.createExplosion(p.x, p.y, '#00f7ff', 30);
        if (window.cyberAudio) window.cyberAudio.playShieldDeflect();
        this.triggerHudUpdate();
        return;
      }
      p.hp = 0;
      this.createExplosion(p.x, p.y, '#00f7ff', 40);
      this.endSession('HULL INTEGRITY COMPROMISED');
    }
  }

  destroyEnemy(e, index) {
    this.enemies.splice(index, 1);
    this.levelKills++;
    this.totalKills++;

    const pts = e.scoreValue;
    this.score += pts;
    this.addFloatingText(e.x, e.y, `+${pts}`, e.color);

    this.createExplosion(e.x, e.y, e.color, 25);
    if (window.cyberAudio) window.cyberAudio.playExplosion(false);

    // 25% chance of spawning powerup
    if (Math.random() < 0.25) {
      this.spawnPowerup(e.x, e.y);
    }

    this.triggerHudUpdate();
  }

  defeatBoss() {
    this.boss = null;
    const pts = this.config.bossBonusScore;
    this.score += pts;
    this.addFloatingText(this.width / 2, 120, `TITAN DESTROYED! +${pts}`, '#ffff00');

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.createExplosion(
          this.width / 2 + (Math.random() - 0.5) * 150,
          120 + (Math.random() - 0.5) * 80,
          '#ff0055',
          40
        );
        if (window.cyberAudio) window.cyberAudio.playExplosion(true);
      }, i * 200);
    }

    this.screenShake(25);
    this.victory = true;
    setTimeout(() => {
      this.endSession('VICTORY! ALL THREATS NEUTRALIZED');
    }, 1500);
  }

  endSession(reason) {
    if (this.gameOver) return;
    this.gameOver = true;
    this.running = false;
    if (this.timerInterval) clearInterval(this.timerInterval);

    if (window.cyberAudio) {
      window.cyberAudio.stopBgm();
      if (this.victory) window.cyberAudio.playVictory();
    }

    // Final accuracy calculation
    const accuracy = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 1000) / 10 : 0;
    const accuracyBonus = Math.round(accuracy * this.config.accuracyBonusMultiplier);
    this.score += accuracyBonus;

    this.onGameOver({
      reason,
      finalScore: this.score,
      levelsCompleted: this.victory ? 4 : this.currentLevel - 1,
      enemiesDefeated: this.totalKills,
      shotsFired: this.shotsFired,
      shotsHit: this.shotsHit,
      accuracy,
      accuracyBonus,
      playTimeSeconds: this.totalDuration - this.timeRemaining
    });
  }

  // --- PARTICLES & COMBAT TEXT ---
  createParticle(x, y, vx, vy, color, size, life) {
    this.particles.push({ x, y, vx, vy, color, size, life, maxLife: life });
  }

  createExplosion(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1;
      this.createParticle(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        Math.random() * 4 + 2,
        Math.random() * 30 + 15
      );
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  addFloatingText(x, y, text, color) {
    this.floatingTexts.push({ x, y, text, color, life: 60, maxLife: 60 });
  }

  updateFloatingTexts(dt) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.8;
      ft.life--;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  screenShake(amount) {
    this.shakeAmount = Math.max(this.shakeAmount, amount);
  }

  // ==========================================
  // --- RENDERING PIPELINE ---
  // ==========================================
  render() {
    const ctx = this.ctx;
    ctx.save();

    // Screen Shake
    if (this.shakeAmount > 0.5) {
      const sx = (Math.random() - 0.5) * this.shakeAmount;
      const sy = (Math.random() - 0.5) * this.shakeAmount;
      ctx.translate(sx, sy);
    }

    // 1. Futuristic Arena Grid & Background
    this.renderBackground(ctx);

    // 2. Destructible Supply Crates
    this.renderCrates(ctx);

    // 3. Powerups
    this.renderPowerups(ctx);

    // 4. Enemy Robots
    this.renderEnemies(ctx);

    // 5. Titan Boss (if active)
    this.renderBoss(ctx);

    // 6. Projectiles
    this.renderProjectiles(ctx);

    // 7. Player Mech & Aiming Indicator
    this.renderPlayer(ctx);

    // 8. Particles & Combat FX
    this.renderParticles(ctx);

    // 9. Floating Combat Text
    this.renderFloatingTexts(ctx);

    // 10. Wave Announcement Banner
    this.renderBanner(ctx);

    ctx.restore();
  }

  renderBackground(ctx) {
    // Clear arena
    ctx.fillStyle = '#060814';
    ctx.fillRect(0, 0, this.width, this.height);

    // Cosmic Stars
    this.stars.forEach(s => {
      ctx.fillStyle = `rgba(180, 220, 255, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Futuristic Battlefield Grid Lines
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.06)';
    ctx.lineWidth = 1;
    const gridSize = 48;
    for (let x = 0; x < this.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Glowing Arena Border
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, this.width - 16, this.height - 16);

    // Corner Accents
    const cLen = 24;
    ctx.strokeStyle = '#00f7ff';
    ctx.lineWidth = 3;
    // Top-Left
    ctx.beginPath(); ctx.moveTo(8, 8 + cLen); ctx.lineTo(8, 8); ctx.lineTo(8 + cLen, 8); ctx.stroke();
    // Top-Right
    ctx.beginPath(); ctx.moveTo(this.width - 8 - cLen, 8); ctx.lineTo(this.width - 8, 8); ctx.lineTo(this.width - 8, 8 + cLen); ctx.stroke();
    // Bottom-Left
    ctx.beginPath(); ctx.moveTo(8, this.height - 8 - cLen); ctx.lineTo(8, this.height - 8); ctx.lineTo(8 + cLen, this.height - 8); ctx.stroke();
    // Bottom-Right
    ctx.beginPath(); ctx.moveTo(this.width - 8 - cLen, this.height - 8); ctx.lineTo(this.width - 8, this.height - 8); ctx.lineTo(this.width - 8, this.height - 8 - cLen); ctx.stroke();
  }

  renderCrates(ctx) {
    this.crates.forEach(c => {
      ctx.save();
      ctx.translate(c.x, c.y);

      // Crate body
      ctx.fillStyle = '#112233';
      ctx.strokeStyle = '#00f7ff';
      ctx.lineWidth = 2;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
      ctx.strokeRect(-c.size / 2, -c.size / 2, c.size, c.size);

      // Neon cross logo
      ctx.strokeStyle = 'rgba(0, 247, 255, 0.8)';
      ctx.beginPath();
      ctx.moveTo(-c.size / 4, 0); ctx.lineTo(c.size / 4, 0);
      ctx.moveTo(0, -c.size / 4); ctx.lineTo(0, c.size / 4);
      ctx.stroke();

      // Crate health bar
      const hpPct = c.hp / c.maxHp;
      ctx.fillStyle = 'rgba(0, 247, 255, 0.6)';
      ctx.fillRect(-c.size / 2, c.size / 2 + 4, c.size * hpPct, 3);

      ctx.restore();
    });
  }

  renderPowerups(ctx) {
    this.powerups.forEach(pu => {
      ctx.save();
      const bobY = Math.sin(pu.bob) * 4;
      ctx.translate(pu.x, pu.y + bobY);

      // Pulsing glow aura
      const pulse = (Math.sin(pu.bob * 2) + 1) * 0.5;
      const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, pu.radius * (1.2 + pulse * 0.3));
      grad.addColorStop(0, 'rgba(0, 247, 255, 0.8)');
      grad.addColorStop(1, 'rgba(0, 247, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, pu.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Badge Container
      ctx.fillStyle = '#0a1020';
      ctx.strokeStyle = '#00f7ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, pu.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Icon
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (pu.type === 'repair') {
        ctx.fillStyle = '#00ff88';
        ctx.fillText('✚', 0, 0);
      } else if (pu.type === 'spread') {
        ctx.fillStyle = '#bc13fe';
        ctx.fillText('⚡', 0, 0);
      } else if (pu.type === 'shield') {
        ctx.fillStyle = '#00f7ff';
        ctx.fillText('🛡️', 0, 0);
      } else if (pu.type === 'emp') {
        ctx.fillStyle = '#ffff00';
        ctx.fillText('💥', 0, 0);
      }

      ctx.restore();
    });
  }

  renderPlayer(ctx) {
    const p = this.player;
    ctx.save();
    ctx.translate(p.x, p.y);

    // Invulnerability flashing
    if (p.invulnerable && Math.floor(performance.now() / 80) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // 1. Tank Chassis (Rotates towards movement direction)
    ctx.save();
    ctx.rotate(p.chassisAngle);

    // Dual Treads
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    // Left tread
    ctx.fillRect(-22, -18, 44, 9);
    ctx.strokeRect(-22, -18, 44, 9);
    // Right tread
    ctx.fillRect(-22, 9, 44, 9);
    ctx.strokeRect(-22, 9, 44, 9);

    // Tread lines
    ctx.strokeStyle = '#334155';
    for (let tx = -18; tx <= 18; tx += 6) {
      ctx.beginPath(); ctx.moveTo(tx, -18); ctx.lineTo(tx, -9); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx, 9); ctx.lineTo(tx, 18); ctx.stroke();
    }

    // Main Chassis Body
    ctx.fillStyle = '#0ea5e9';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-16, -11, 32, 22, 4);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // 2. Rotating Weapon Turret (Aimed precisely via Arrow Keys / Aim Vector)
    ctx.save();
    ctx.rotate(p.turretAngle);

    // Turret Gun Barrel
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#00f7ff';
    ctx.lineWidth = 2;
    ctx.fillRect(0, -4, 28, 8);
    ctx.strokeRect(0, -4, 28, 8);

    // Turret Core Dome
    const turretGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, 14);
    turretGrad.addColorStop(0, '#38bdf8');
    turretGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = turretGrad;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Central Energy Light
    ctx.fillStyle = p.powerup === 'spread' ? '#bc13fe' : '#00f7ff';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 3. Aiming Laser Indicator & Reticle (Section 5 requirement)
    this.renderAimingIndicator(ctx, p);

    // 4. Energy Aegis Shield Bubble (if active or shield > 0)
    if (p.powerup === 'shield' || p.shield > 20) {
      const shieldAlpha = p.powerup === 'shield' ? 0.7 : 0.35;
      ctx.strokeStyle = `rgba(0, 247, 255, ${shieldAlpha})`;
      ctx.fillStyle = `rgba(0, 247, 255, ${shieldAlpha * 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // Aiming Guide / Sight Line
  renderAimingIndicator(ctx, p) {
    const sightDist = 320;
    const targetX = Math.cos(p.turretAngle) * sightDist;
    const targetY = Math.sin(p.turretAngle) * sightDist;

    // Glowing laser trajectory line
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(Math.cos(p.turretAngle) * 28, Math.sin(p.turretAngle) * 28);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    // Futuristic Crosshair at endpoint
    ctx.setLineDash([]);
    ctx.strokeStyle = '#00f7ff';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(targetX - 12, targetY); ctx.lineTo(targetX + 12, targetY);
    ctx.moveTo(targetX, targetY - 12); ctx.lineTo(targetX, targetY + 12);
    ctx.stroke();

    ctx.restore();
  }

  renderEnemies(ctx) {
    this.enemies.forEach(e => {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);

      if (e.isCloaked) {
        ctx.globalAlpha = 0.2;
      }

      // Robot Chassis
      ctx.fillStyle = e.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;

      if (e.type === 'runner') {
        // Spider Mech with angular body
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(-12, -14);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-12, 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (e.type === 'bruiser') {
        // Heavy Tank Robot
        ctx.fillRect(-22, -16, 44, 32);
        ctx.strokeRect(-22, -16, 44, 32);
        // Dual Gun barrels
        ctx.fillStyle = '#333';
        ctx.fillRect(8, -12, 16, 6);
        ctx.fillRect(8, 6, 16, 6);
      } else if (e.type === 'phantom') {
        // Sleek Stealth Jet
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-14, -16);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-14, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Standard Scout / Sentry Bot
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Eye sensor
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(4, -3, 8, 6);
      }

      ctx.restore();

      // Enemy Health Bar
      if (e.hp < e.maxHp) {
        const barW = e.radius * 2;
        const hpPct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(e.x - barW / 2, e.y - e.radius - 10, barW, 4);
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x - barW / 2, e.y - e.radius - 10, barW * hpPct, 4);
      }
    });
  }

  renderBoss(ctx) {
    if (!this.boss) return;
    const b = this.boss;
    ctx.save();
    ctx.translate(b.x, b.y);

    // Titan Mech Body
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 3;

    // Outer Heavy Armor Wings
    ctx.beginPath();
    ctx.moveTo(0, 45);
    ctx.lineTo(70, -25);
    ctx.lineTo(50, -45);
    ctx.lineTo(-50, -45);
    ctx.lineTo(-70, -25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center Core Reactor (Pulsing Red)
    const pulse = (Math.sin(performance.now() * 0.006) + 1) * 0.5;
    const coreGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 26 + pulse * 6);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, '#ff0055');
    coreGrad.addColorStop(1, 'rgba(255, 0, 85, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();

    // Dual Gatling Pods
    ctx.fillStyle = '#312e81';
    ctx.fillRect(-55, 10, 14, 28);
    ctx.fillRect(41, 10, 14, 28);

    ctx.restore();

    // Massive Boss Health Bar at top
    const barW = this.width * 0.7;
    const barX = (this.width - barW) / 2;
    const barY = 32;
    const hpPct = Math.max(0, b.hp / b.maxHp);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2;
    ctx.fillRect(barX, barY, barW, 16);
    ctx.strokeRect(barX, barY, barW, 16);

    // Gradient HP fill
    const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    hpGrad.addColorStop(0, '#ff0055');
    hpGrad.addColorStop(1, '#ffaa00');
    ctx.fillStyle = hpGrad;
    ctx.fillRect(barX + 2, barY + 2, (barW - 4) * hpPct, 12);

    // Boss Name Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`TITAN BOSS: OMEGA-ZERO  [${Math.round(hpPct * 100)}%]`, this.width / 2, barY - 6);
  }

  renderProjectiles(ctx) {
    // Player Bullets
    this.bullets.forEach(b => {
      ctx.save();
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Enemy Bullets
    this.enemyBullets.forEach(eb => {
      ctx.save();
      ctx.fillStyle = eb.color;
      ctx.shadowColor = eb.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  renderParticles(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  renderFloatingTexts(ctx) {
    this.floatingTexts.forEach(ft => {
      ctx.save();
      const alpha = ft.life / ft.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 15px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  renderBanner(ctx) {
    if (this.bannerTimer <= 0) return;
    ctx.save();
    const alpha = Math.min(1, this.bannerTimer / 30);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(6, 12, 28, 0.85)';
    ctx.strokeStyle = '#00f7ff';
    ctx.lineWidth = 2;

    const bannerH = 80;
    const bannerY = this.height / 2 - bannerH / 2;
    ctx.fillRect(0, bannerY, this.width, bannerH);
    ctx.strokeRect(0, bannerY, this.width, bannerH);

    ctx.fillStyle = '#00f7ff';
    ctx.font = 'bold 22px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.bannerText, this.width / 2, bannerY + 34);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px Segoe UI, sans-serif';
    ctx.fillText(this.bannerSubtext, this.width / 2, bannerY + 58);

    ctx.restore();
  }
}

window.RobotShooterEngine = RobotShooterEngine;
