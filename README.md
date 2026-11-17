# FRAME AI – Advanced AI Filmmaking, Scriptwriting & Cinematography Platform

> **"Imagine It. Write It. Shoot It."**

**FRAME AI** is a professional, full-stack AI-powered filmmaking application designed for beginners, content creators, film students, independent filmmakers, scriptwriters, directors, and professional cinematographers.

It combines an **AI Screenwriter**, **AI Cinematographer**, and **AI Film Director** into a unified, responsive cinematic platform.

---

## 🎬 Key Highlights & Features

### 1. AI Scriptwriter – Character-Wise Screenplay Dialogues
- Automatically detects and identifies characters (e.g. Arun & Kumar).
- Formats conversations in Hollywood screenplay standard: Scene Slugline, Action lines, Character headings, Parenthetical delivery notes, and Spoken dialogue.
- Full Character Manager: Rename characters across the entire scene with one click, add new characters, remove characters, and edit individual lines.

### 2. Three Distinct Script Variations with Independent Controls
Every scene idea automatically generates **three distinct variations**:
1. **Variation 1 – Original / Natural Version**: Realistic conversational warmth, authentic speech cadence, and grounded character dynamics.
2. **Variation 2 – Cinematic Version**: Heightened dramatic stakes, subtext-driven confrontation, sharp one-liners, and intense physical actions.
3. **Variation 3 – Creative / Unexpected Version**: Psychological twist, unexpected secret reveal, or reality-shifting storytelling.

**Independent Controls on Each Variation:**
- **Copy Script** *(Strictly copies ONLY the selected variation, including characters, dialogues, parentheticals, actions, and scene context without mixing)*.
- **Edit Script** *(Interactive screenplay and character editor)*.
- **Regenerate** *(Recomputes dynamic lines for that specific variation)*.
- **Improve Script** *(Directs into the Script Improvement Center)*.
- **Expand Script** *(Adds 2 deeper narrative climax beats to the scene)*.

### 3. AI Cinematographer – Dialogue-Correlated Camera Angles & Reverse Shots
- **Key Industry Rule**: Maps camera angles directly to the spoken lines and character actions.
  - When **Character 1** speaks → Frames Character 1 in an Over-The-Shoulder or Medium Close-Up.
  - When **Character 2** replies → Immediately recommends the **reciprocal reverse shot** of Character 2 matching eye-line, height, and the 180° line!
- Supports all **13 Camera Angles**:
  - *Extreme wide shot, Wide shot, Medium shot, Medium close-up, Close-up, Extreme close-up, Low angle, High angle, Eye-level angle, Over-the-shoulder shot, Point-of-view shot, Dutch angle, Bird's-eye view*.
- Provides all **12 Industry Parameters for Every Shot**:
  1. Shot Number
  2. Corresponding Dialogue or Action
  3. Character being filmed
  4. Camera Angle
  5. Camera Position
  6. Camera Height
  7. Camera Movement (Dolly, Static, Handheld, Tracking, Crane)
  8. Lens Recommendation (18mm, 24mm, 35mm, 50mm, 85mm, Anamorphic)
  9. Framing & Composition (Rule of thirds, center punch, negative space)
  10. Lighting Suggestions (Key, fill, rim, color temperature)
  11. Shooting Instructions (180° axis preservation, cut cues)
  12. Reason for Shot Selection (Subtext, emotional motivation)

### 4. Interactive 2D Top-Down Camera Blocking Stage & Viewfinder
- **2D Top-Down Stage Canvas**: Shows Actor 1, Actor 2, their gaze directions, the **180° Axis of Action (Line of Action)**, and camera placement with real-time view cone frustum!
- **Viewfinder Simulator**: Real-time aspect ratio preview (**2.39:1 Anamorphic Cinemascope**, **16:9 Broadcast**, **4:3 Academy**, **9:16 Mobile Reel**), Rule-of-Thirds grid overlay, 90%/80% action & title safe boxes, center crosshairs, and cinema HUD (24 FPS, T1.8, 3200K).

### 5. AI Script Improvement Assistant (4-Part Breakdown)
- Dedicated **"AI Suggestions to Make Your Scene Better"** module.
- For every suggestion, provides the strict 4-part breakdown:
  1. **What can be improved?**
  2. **Why should it be improved?**
  3. **How can it be improved?**
  4. **Example of the improved version** (screenplay formatted).
- Includes **"Apply Suggestion"**, **"Apply All Selected Improvements"**, and **"Side-by-Side Comparison"** (Original vs Improved).

### 6. AI Creative Idea Generator
- Recommends optional narrative additions:
  - Add a new character (e.g. silent watching stranger).
  - Introduce unexpected events (e.g. unread dossier or ticking device).
  - Meaningful physical reactions and visual storytelling elements.
- Explains exactly how each element supports the story with a one-click **"Adopt Into Scene Concept"** button.

### 7. AI Director Mode
- Master director's binder covering:
  - Spatial blocking & actor entrances.
  - Vocal delivery and subtext coaching.
  - Camera pacing strategy (when to cut wide vs close-up).
  - 3-point lighting design & practical fixtures.
  - Foley sound effects & musical score cue sheet.
  - Scene climax and transition outro.

### 8. AI Doubt Clearing Assistant
- Context-aware chat assistant aware of the active scene and characters.
- Instant guidance for common questions:
  - *"How can I shoot this scene with a smartphone on a low budget?"*
  - *"Why is an over-the-shoulder reverse shot better?"*
  - *"How do I shoot this conversation with only one camera?"*
  - *"Which lens focal length is best?"*

### 9. Multi-Format Screenplay & Shotlist Export
- Export as Standard Screenplay (**`.txt`**)
- Export as Hollywood Fountain Format (**`.fountain`**)
- Export as Cinematography Shotlist (**`.csv`**)
- Export as Printable Director's Binder / PDF (**Print stylesheet included**)

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Node.js & Express 5.3 with persistent JSON database store (`data/frame_ai_db.json`).
- **AI Intelligence**: Dual-mode engine:
  - **Live Google Gemini API** (when configured in `.env` or UI Settings).
  - **Autonomous Filmmaking Expert Engine** (built-in deep narrative and cinematography rule engine operating locally with 0ms latency and 100% offline availability).
- **Frontend**: Responsive Single-Page Application with Tailwind CSS, SVG visualizer canvas, Web Speech API voice dictation, and dark charcoal/gold cinematic design system.

---

## 🚀 Quick Start Guide

### 1. Start the Server
```bash
node server.js
```
The server will start on:
```
http://localhost:3000
```

### 2. Run Verification Tests
```bash
node tests/test-frame-ai.js
```
*(33 comprehensive automated tests verifying all requirements)*.

---

## 📽️ Application Workflows

```
USER ENTERS SCENE IDEA (Text or Voice)
                 ↓
AI UNDERSTANDS AND ANALYZES THE SCENE
                 ↓
AI IMPROVES THE ORIGINAL CONCEPT
                 ↓
GENERATES 3 DIFFERENT SCRIPT VARIATIONS
 (Natural, Cinematic, Creative Twist)
                 ↓
WRITES CHARACTER-WISE CONVERSATIONS
                 ↓
RECOMMENDS CREATIVE IDEAS & 4-PART IMPROVEMENTS
                 ↓
RECOMMENDS CAMERA ANGLES FOR EACH DIALOGUE
 (Correlated Reverse Shots on Dialogue Replies)
                 ↓
GENERATES COMPLETE 12-PARAMETER SHOT-BY-SHOT PLAN
                 ↓
RENDERS 2D BLOCKING STAGE & VIEWFINDER SIMULATOR
                 ↓
PROVIDES AI DIRECTOR GUIDANCE & SOUND CUE SHEET
                 ↓
ALLOWS USERS TO EDIT, COPY, SAVE, AND EXPORT (.TXT, .FOUNTAIN, .CSV, PDF)
```
