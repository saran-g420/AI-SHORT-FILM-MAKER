/**
 * FRAME AI - Learning Center
 * Comprehensive filmmaking masterclass: 13 camera angles, 180-degree rule,
 * 3-point lighting setups, lens focal lengths, and screenplay formatting.
 */

window.LearningCenter = (function() {
  function renderLearning() {
    const container = document.getElementById('learning-container');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-8">
        <!-- 1. The 13 Cinematic Camera Angles -->
        <div class="film-card p-6">
          <div class="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <span class="text-amber-400 text-xl">🎥</span>
            <h3 class="text-base font-bold text-white font-cinematic uppercase tracking-wider">The 13 Essential Camera Angles in Cinema</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span class="text-amber-400 font-bold block mb-1">1. Extreme Wide Shot (EWS)</span>
              <p class="text-slate-300 leading-relaxed">Subjects appear microscopic against a vast landscape. Used for epic scope, isolation, or monumental environment reveals.</p>
            </div>
            <div class="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span class="text-amber-400 font-bold block mb-1">2. Wide Shot (WS) / Master</span>
              <p class="text-slate-300 leading-relaxed">Full actor head-to-toe with surrounding geography. Establishes the scene's spatial relationships and character entrances.</p>
            </div>
            <div class="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span class="text-amber-400 font-bold block mb-1">3. Medium Shot (MS)</span>
              <p class="text-slate-300 leading-relaxed">Framed from the waist up. Balances human emotion with hand gestures and immediate environmental interaction.</p>
            </div>
            <div class="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span class="text-amber-400 font-bold block mb-1">4. Medium Close-Up (MCU)</span>
              <p class="text-slate-300 leading-relaxed">Chest to head. The workhorse shot for dramatic dialogue. Keeps the actor's eyes prominent without feeling invasive.</p>
            </div>
            <div class="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span class="text-amber-400 font-bold block mb-1">5. Close-Up (CU)</span>
              <p class="text-slate-300 leading-relaxed">Fills the screen with the actor's face. The ultimate tool for intimacy, betrayal, emotional confessions, and subtext.</p>
            </div>
            <div class="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span class="text-amber-400 font-bold block mb-1">6. Extreme Close-Up (ECU)</span>
              <p class="text-slate-300 leading-relaxed">Tight focus on eyes, lips, trembling hands, or ticking clocks. Elevates microscopic tension and physiological panic.</p>
            </div>
            <div class="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span class="text-amber-400 font-bold block mb-1">7. Low Angle</span>
              <p class="text-slate-300 leading-relaxed">Camera shoots up from below. Makes the character appear dominant, heroic, authoritative, or intimidating.</p>
            </div>
            <div class="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span class="text-amber-400 font-bold block mb-1">8. High Angle</span>
              <p class="text-slate-300 leading-relaxed">Camera looks down from above. Renders the subject vulnerable, powerless, defeated, or entrapped.</p>
            </div>
            <div class="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span class="text-amber-400 font-bold block mb-1">9. Eye-Level Angle</span>
              <p class="text-slate-300 leading-relaxed">Neutral perspective matching standard human eyesight. Establishes objective empathy and honest conversational connection.</p>
            </div>
            <div class="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span class="text-amber-400 font-bold block mb-1">10. Over-The-Shoulder (OTS)</span>
              <p class="text-slate-300 leading-relaxed">Looking past one character's neck/shoulder at another. Creates reciprocal conversational intimacy and spatial continuity.</p>
            </div>
            <div class="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span class="text-amber-400 font-bold block mb-1">11. Point-of-View (POV)</span>
              <p class="text-slate-300 leading-relaxed">Camera becomes the eyes of the character. Puts the audience directly into their shoes, experiencing their exact gaze.</p>
            </div>
            <div class="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <span class="text-amber-400 font-bold block mb-1">12. Dutch Angle (Tilted Horizon)</span>
              <p class="text-slate-300 leading-relaxed">Camera tilted off its horizontal axis. Visually signals psychological disorientation, danger, madness, or moral decay.</p>
            </div>
            <div class="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 col-span-full md:col-span-1">
              <span class="text-amber-400 font-bold block mb-1">13. Bird's-Eye View (God's Eye)</span>
              <p class="text-slate-300 leading-relaxed">Direct 90-degree overhead top-down perspective. Highlights geometric patterns, fate, insignificance, or crime scenes.</p>
            </div>
          </div>
        </div>

        <!-- 2. Masterclass: The 180-Degree Rule & Reverse Shots -->
        <div class="film-card p-6 border-l-4 border-l-red-500">
          <div class="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <span class="text-red-400 text-xl">⚠️</span>
            <h3 class="text-base font-bold text-white uppercase tracking-wider">The 180-Degree Rule: How Not to Disorient Your Audience</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
            <div>
              <h4 class="text-amber-400 font-bold mb-1.5 uppercase">The Golden Rule of Dialogue Coverage</h4>
              <p class="mb-3">
                Whenever two characters interact, an invisible straight line is established between them—the <strong>Axis of Action</strong>.
              </p>
              <p class="mb-3">
                All camera setups (Shot 1, Shot 2 reverse, close-ups) must remain on <strong>ONE SIDE of this 180-degree axis</strong>.
              </p>
              <p>
                As long as you stay on that side, Character 1 will always gaze screen-right, and Character 2 will gaze screen-left. In editing, their eye-lines cross naturally!
              </p>
            </div>
            <div class="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <h4 class="text-red-400 font-bold mb-1.5 uppercase">What Happens When You Break It?</h4>
              <p class="mb-2">
                If the camera jumps across the line, suddenly both characters appear to be looking in the same direction—as if talking to someone behind them!
              </p>
              <span class="text-[11px] text-emerald-400 font-semibold block mt-3">
                ✓ FRAME AI automatically calculates and locks your camera setups strictly onto the safe side of the axis of action.
              </span>
            </div>
          </div>
        </div>

        <!-- 3. Cinematic 3-Point Lighting Guide -->
        <div class="film-card p-6">
          <div class="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
            <span class="text-yellow-400 text-xl">💡</span>
            <h3 class="text-base font-bold text-white font-cinematic uppercase tracking-wider">Cinematic Three-Point Lighting Architecture</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="bg-slate-900/80 p-3.5 rounded border border-slate-800">
              <span class="text-amber-400 font-bold block mb-1">Key Light (Main Source)</span>
              <p class="text-slate-300 leading-relaxed">Positioned 45 degrees to the side and 45 degrees above the actor's eye-line. Creates the primary shape, cheekbone shadows, and eye catchlights.</p>
            </div>
            <div class="bg-slate-900/80 p-3.5 rounded border border-slate-800">
              <span class="text-cyan-400 font-bold block mb-1">Fill Light (Shadow Control)</span>
              <p class="text-slate-300 leading-relaxed">Placed opposite the Key light. Softens the harsh shadows on the unlit cheek. Use a 2:1 ratio for bright comedy, or 8:1 for moody film noir.</p>
            </div>
            <div class="bg-slate-900/80 p-3.5 rounded border border-slate-800">
              <span class="text-slate-200 font-bold block mb-1">Back / Rim Light (Edge Separation)</span>
              <p class="text-slate-300 leading-relaxed">Placed behind the actor aimed at their shoulders and hair. Separates their silhouette cleanly from dark background walls.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return {
    renderLearning
  };
})();
