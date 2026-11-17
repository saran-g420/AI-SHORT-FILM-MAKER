/**
 * FRAME AI - 2D Top-Down Camera Blocking & Viewfinder Visualizer
 * Renders spatial actor positions, 180-degree axis of action, camera positions,
 * reverse shot frustums, and cinematic viewfinder simulation.
 */

window.Visualizer = (function() {
  let activeShot = null;
  let currentAspectRatio = '2.39:1'; // Default Anamorphic
  let showGrid = true;
  let showSafeAreas = true;

  function init() {
    renderBlockingStudio();
    renderViewfinder();
  }

  function setActiveShot(shot) {
    activeShot = shot;
    renderBlockingStudio();
    renderViewfinder();
  }

  function setAspectRatio(ratio) {
    currentAspectRatio = ratio;
    renderViewfinder();
  }

  function toggleGrid() {
    showGrid = !showGrid;
    renderViewfinder();
  }

  function toggleSafeAreas() {
    showSafeAreas = !showSafeAreas;
    renderViewfinder();
  }

  /**
   * Render 2D Top-Down Director Blocking Diagram
   */
  function renderBlockingStudio() {
    const container = document.getElementById('blocking-studio-canvas');
    if (!container) return;

    const shotNum = activeShot ? activeShot.shotNumber : 1;
    const isReverse = activeShot ? (activeShot.isReverseShot || activeShot.cameraAngle?.toLowerCase().includes('reverse') || activeShot.cameraAngle?.toLowerCase().includes('ots') && shotNum % 2 === 0) : false;
    const isCloseUp = activeShot ? activeShot.cameraAngle?.toLowerCase().includes('close-up') : false;
    const isWide = activeShot ? activeShot.cameraAngle?.toLowerCase().includes('wide') : false;

    // SVG Layout
    // Actor 1 at (200, 220), Actor 2 at (400, 220)
    // 180 Axis line along Y = 220 from X = 50 to X = 550
    // Safe Camera Zone: Y > 220 (Camera placed south of the axis)
    // Camera A (OTS / Medium on Actor 1): pos ~ (280, 360)
    // Camera B (Reverse Shot on Actor 2): pos ~ (320, 360)
    
    let camX = 280;
    let camY = 370;
    let targetX = 200;
    let targetY = 220;
    let camLabel = 'Camera A (Shot #1)';

    if (isReverse) {
      camX = 330;
      camY = 360;
      targetX = 400;
      targetY = 220;
      camLabel = `Camera B - Reverse Shot (Shot #${shotNum})`;
    } else if (isWide) {
      camX = 300;
      camY = 410;
      targetX = 300;
      targetY = 220;
      camLabel = `Camera Master Wide (Shot #${shotNum})`;
    } else if (isCloseUp) {
      camX = isReverse ? 360 : 240;
      camY = 290;
      targetX = isReverse ? 400 : 200;
      targetY = 220;
      camLabel = `Tight Punch-In (Shot #${shotNum})`;
    }

    const svg = `
      <svg viewBox="0 0 600 480" class="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="stageGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#1E293B" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#0B0E14" stop-opacity="0.95"/>
          </radialGradient>
          <linearGradient id="viewConeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#F59E0B" stop-opacity="0.02"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Floor Grid Background -->
        <rect width="600" height="480" fill="url(#stageGlow)"/>
        
        <!-- Floor Grid Lines -->
        <g stroke="#1E293B" stroke-width="1" opacity="0.4">
          ${Array.from({length: 12}).map((_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="480"/>`).join('')}
          ${Array.from({length: 10}).map((_, i) => `<line x1="0" y1="${i * 50}" x2="600" y2="${i * 50}"/>`).join('')}
        </g>

        <!-- Axis of Action (180° Rule Line) -->
        <line x1="60" y1="220" x2="540" y2="220" stroke="#EF4444" stroke-width="2" stroke-dasharray="6,6" class="axis-line" opacity="0.85"/>
        <text x="70" y="210" fill="#EF4444" font-size="11" font-weight="700" letter-spacing="0.05em">180° AXIS OF ACTION (DO NOT CROSS)</text>

        <!-- Safe Zone Indicator (Camera side) -->
        <rect x="60" y="222" width="480" height="230" fill="rgba(16, 185, 129, 0.04)" stroke="rgba(16, 185, 129, 0.2)" stroke-dasharray="4,4"/>
        <text x="430" y="440" fill="#10B981" font-size="10" font-weight="600">✓ SAFE CAMERA ZONE</text>

        <!-- Forbidden Axis Crossing Area -->
        <rect x="60" y="30" width="480" height="188" fill="rgba(239, 68, 68, 0.04)"/>
        <text x="430" y="50" fill="#EF4444" font-size="10" font-weight="600">✕ REVERSE AXIS (DISORIENTING)</text>

        <!-- 3-Point Lighting Rig -->
        <!-- Key Light (Window / Practical at 45°) -->
        <g transform="translate(100, 320)" opacity="0.85">
          <circle cx="0" cy="0" r="16" fill="#F59E0B" fill-opacity="0.2" stroke="#F59E0B" stroke-width="1.5"/>
          <path d="M-8,-8 L8,8 M8,-8 L-8,8" stroke="#F59E0B" stroke-width="1.5"/>
          <text x="22" y="4" fill="#FBBF24" font-size="10" font-weight="700">KEY LIGHT (Soft 3200K)</text>
          <!-- Beam to table -->
          <line x1="12" y1="-8" x2="160" y2="-90" stroke="#F59E0B" stroke-width="1" stroke-dasharray="3,3" opacity="0.4"/>
        </g>

        <!-- Fill Light / Reflector -->
        <g transform="translate(500, 330)" opacity="0.85">
          <circle cx="0" cy="0" r="14" fill="#06B6D4" fill-opacity="0.2" stroke="#06B6D4" stroke-width="1.5"/>
          <text x="-120" y="4" fill="#22D3EE" font-size="10" font-weight="600">FILL LIGHT (Bounce 4:1)</text>
          <line x1="-12" y1="-8" x2="-80" y2="-90" stroke="#06B6D4" stroke-width="1" stroke-dasharray="3,3" opacity="0.4"/>
        </g>

        <!-- Hair / Rim Backlight -->
        <g transform="translate(300, 90)" opacity="0.75">
          <circle cx="0" cy="0" r="12" fill="#E2E8F0" fill-opacity="0.1" stroke="#94A3B8" stroke-width="1.5"/>
          <text x="18" y="4" fill="#94A3B8" font-size="9">RIM / HAIR LIGHT</text>
        </g>

        <!-- Table / Coffee Shop Booth in center -->
        <ellipse cx="300" cy="220" rx="65" ry="32" fill="#1E293B" stroke="#334155" stroke-width="2"/>
        <text x="282" y="224" fill="#64748B" font-size="10" font-weight="600">TABLE</text>

        <!-- Actor 1 (Character A: e.g. Arun) -->
        <g transform="translate(200, 220)">
          <!-- Gaze Vector Cone -->
          <polygon points="0,0 90,-25 90,25" fill="#3B82F6" fill-opacity="0.15"/>
          <circle cx="0" cy="0" r="18" fill="#1D4ED8" stroke="#60A5FA" stroke-width="2" filter="url(#glow)"/>
          <text x="0" y="5" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">A1</text>
          <text x="0" y="-24" fill="#93C5FD" font-size="11" font-weight="700" text-anchor="middle">Actor 1 (Arun)</text>
          <text x="0" y="32" fill="#64748B" font-size="9" text-anchor="middle">Eye-line ➔</text>
        </g>

        <!-- Actor 2 (Character B: e.g. Kumar) -->
        <g transform="translate(400, 220)">
          <!-- Gaze Vector Cone -->
          <polygon points="0,0 -90,-25 -90,25" fill="#F59E0B" fill-opacity="0.15"/>
          <circle cx="0" cy="0" r="18" fill="#B45309" stroke="#FBBF24" stroke-width="2" filter="url(#glow)"/>
          <text x="0" y="5" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">A2</text>
          <text x="0" y="-24" fill="#FCD34D" font-size="11" font-weight="700" text-anchor="middle">Actor 2 (Kumar)</text>
          <text x="0" y="32" fill="#64748B" font-size="9" text-anchor="middle">⮜ Eye-line</text>
        </g>

        <!-- Active Camera Vision Cone (Frustum) -->
        <polygon points="${camX},${camY} ${targetX - 70},${targetY} ${targetX + 70},${targetY}" fill="url(#viewConeGrad)" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1.5"/>

        <!-- Sightline ray -->
        <line x1="${camX}" y1="${camY}" x2="${targetX}" y2="${targetY}" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="4,4"/>

        <!-- Active Camera Position Body -->
        <g transform="translate(${camX}, ${camY})">
          <circle cx="0" cy="0" r="16" fill="#0B0E14" stroke="#F59E0B" stroke-width="2.5" filter="url(#glow)"/>
          <!-- Camera lens icon -->
          <polygon points="0,-10 8,10 -8,10" fill="#F59E0B"/>
          <text x="0" y="28" fill="#F59E0B" font-size="11" font-weight="700" text-anchor="middle">${camLabel}</text>
          <text x="0" y="40" fill="#94A3B8" font-size="9" text-anchor="middle">${activeShot ? activeShot.lensRecommendation?.split(' ')[0] : '50mm'} • ${activeShot ? activeShot.cameraAngle : 'Medium Shot'}</text>
        </g>

        <!-- Inactive Reverse Camera Ghost Position for reference -->
        <g transform="translate(${isReverse ? 280 : 330}, 365)" opacity="0.35">
          <circle cx="0" cy="0" r="12" fill="#1E293B" stroke="#64748B" stroke-width="1.5"/>
          <text x="0" y="20" fill="#64748B" font-size="8" text-anchor="middle">${isReverse ? 'Cam A (Reverse Target)' : 'Cam B (Reverse Angle)'}</text>
        </g>
      </svg>
    `;

    container.innerHTML = svg;
  }

  /**
   * Render Viewfinder Simulation
   */
  function renderViewfinder() {
    const container = document.getElementById('viewfinder-simulation');
    if (!container) return;

    const shot = activeShot || {
      shotNumber: 1,
      cameraAngle: 'Medium Shot (MS)',
      lensRecommendation: '50mm Natural Human Vision Prime f/1.8',
      character: 'Arun',
      framingComposition: 'Rule of thirds: Arun framed left, doorway visible in background'
    };

    // Calculate aspect ratio container style
    let aspectClass = 'aspect-video'; // 16:9
    let aspectDisplay = '16:9';
    if (currentAspectRatio === '2.39:1') {
      aspectClass = 'aspect-[2.39/1]';
      aspectDisplay = '2.39:1 ANAMORPHIC';
    } else if (currentAspectRatio === '4:3') {
      aspectClass = 'aspect-[4/3]';
      aspectDisplay = '4:3 ACADEMY';
    } else if (currentAspectRatio === '9:16') {
      aspectClass = 'aspect-[9/16] max-w-[280px] mx-auto';
      aspectDisplay = '9:16 MOBILE / REEL';
    }

    // Determine actor silhouette size based on shot type
    const angleLower = (shot.cameraAngle || '').toLowerCase();
    let silhouetteHeight = '75%';
    let silhouetteScale = 'scale-100';
    let framingHint = 'Medium waist-up dialogue framing';

    if (angleLower.includes('extreme wide')) {
      silhouetteHeight = '25%';
      silhouetteScale = 'scale-50';
      framingHint = 'Vast environmental framing, subject small';
    } else if (angleLower.includes('wide')) {
      silhouetteHeight = '45%';
      silhouetteScale = 'scale-75';
      framingHint = 'Full body / two-shot environmental balance';
    } else if (angleLower.includes('close-up')) {
      silhouetteHeight = '110%';
      silhouetteScale = 'scale-125';
      framingHint = 'Intimate facial framing, chin to crown';
    } else if (angleLower.includes('extreme close-up')) {
      silhouetteHeight = '160%';
      silhouetteScale = 'scale-150';
      framingHint = 'Macro punch-in on eyes, hands, or props';
    } else if (angleLower.includes('over-the-shoulder') || angleLower.includes('ots')) {
      silhouetteHeight = '85%';
      silhouetteScale = 'scale-105';
      framingHint = 'Foreground shoulder anchor with speaker sharp';
    }

    const html = `
      <div class="relative w-full ${aspectClass} viewfinder-frame rounded-lg overflow-hidden border border-zinc-700 bg-black flex items-center justify-center transition-all duration-300">
        <!-- Live Bokeh / Cinematic Background Lighting Simulation -->
        <div class="absolute inset-0 opacity-40 bg-gradient-to-tr from-amber-950/40 via-slate-900/60 to-cyan-950/40"></div>
        <div class="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl"></div>
        <div class="absolute bottom-1/3 left-1/5 w-40 h-40 rounded-full bg-blue-600/10 blur-3xl"></div>

        <!-- Rule of Thirds Grid -->
        ${showGrid ? `
          <div class="absolute inset-0 pointer-events-none opacity-30">
            <div class="w-full h-full grid grid-cols-3 grid-rows-3 border border-white/20">
              <div class="border-r border-b border-white/20"></div>
              <div class="border-r border-b border-white/20"></div>
              <div class="border-b border-white/20"></div>
              <div class="border-r border-b border-white/20"></div>
              <div class="border-r border-b border-white/20"></div>
              <div class="border-b border-white/20"></div>
              <div class="border-r border-white/20"></div>
              <div class="border-r border-white/20"></div>
              <div></div>
            </div>
          </div>
        ` : ''}

        <!-- 90% and 80% Action / Title Safe Areas -->
        ${showSafeAreas ? `
          <div class="absolute inset-[5%] border border-dashed border-emerald-500/30 pointer-events-none flex items-start justify-end p-1">
            <span class="text-[9px] font-mono text-emerald-500/50">90% ACTION SAFE</span>
          </div>
          <div class="absolute inset-[10%] border border-dashed border-amber-500/30 pointer-events-none flex items-start justify-end p-1">
            <span class="text-[9px] font-mono text-amber-500/50">80% TITLE SAFE</span>
          </div>
        ` : ''}

        <!-- Center Crosshairs -->
        <div class="crosshair opacity-60">
          <div class="w-8 h-[1px] bg-red-500/80 -translate-x-4"></div>
          <div class="h-8 w-[1px] bg-red-500/80 -translate-y-4"></div>
          <div class="w-2 h-2 rounded-full border border-red-500/80 -translate-x-1 -translate-y-1"></div>
        </div>

        <!-- Actor Framing Simulation Silhouette -->
        <div class="relative z-10 flex flex-col items-center justify-end h-full w-full pb-4 pointer-events-none">
          <div class="transition-all duration-300 ${silhouetteScale} flex flex-col items-center opacity-85">
            <!-- Head -->
            <div class="w-16 h-20 rounded-[50%_50%_45%_45%] bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 shadow-xl border border-white/20 relative">
              <!-- Eye-line indicator -->
              <div class="absolute top-[40%] left-0 right-0 h-[1px] bg-amber-400/50"></div>
            </div>
            <!-- Shoulders & Torso -->
            <div class="w-36 h-28 -mt-2 rounded-t-[40px] bg-gradient-to-b from-slate-600 to-slate-800 border-t border-white/20 shadow-2xl"></div>
          </div>
          <div class="absolute bottom-2 text-center text-xs font-mono text-amber-300/80 bg-black/60 px-2 py-0.5 rounded">
            Subject: ${shot.character || 'Character'} • ${framingHint}
          </div>
        </div>

        <!-- Viewfinder HUD / Cinema Metadata Overlay -->
        <div class="absolute top-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/80 pointer-events-none">
          <div class="flex items-center gap-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span class="font-bold text-red-500 tracking-wider">REC</span>
            <span class="text-zinc-400">24.00 FPS</span>
            <span class="text-amber-400 font-semibold">${aspectDisplay}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-cyan-400">${shot.lensRecommendation?.split(' ')[0] || '50mm'}</span>
            <span class="text-zinc-300">T2.0</span>
            <span class="text-zinc-300">ISO 800</span>
            <span class="text-amber-400">3200K</span>
          </div>
        </div>

        <div class="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-zinc-400 pointer-events-none">
          <div>SHOT #${shot.shotNumber} • ${shot.cameraAngle}</div>
          <div>BATTERY 94% • 512GB CFexpress [2h 14m]</div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  return {
    init,
    setActiveShot,
    setAspectRatio,
    toggleGrid,
    toggleSafeAreas
  };
})();
