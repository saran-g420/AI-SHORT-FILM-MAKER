const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'symposium_game.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys
db.exec('PRAGMA foreign_keys = ON;');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT UNIQUE COLLATE NOCASE NOT NULL,
      student1_name TEXT NOT NULL,
      student1_college TEXT NOT NULL,
      student2_name TEXT NOT NULL,
      student2_college TEXT NOT NULL,
      contact_email TEXT,
      contact_phone TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS game_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_token TEXT UNIQUE NOT NULL,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      status TEXT NOT NULL, -- 'IN_PROGRESS', 'COMPLETED', 'RESET'
      start_time TEXT NOT NULL,
      end_time TEXT,
      duration_seconds INTEGER NOT NULL,
      levels_completed INTEGER DEFAULT 0,
      enemies_defeated INTEGER DEFAULT 0,
      shots_fired INTEGER DEFAULT 0,
      shots_hit INTEGER DEFAULT 0,
      accuracy REAL DEFAULT 0.0,
      score INTEGER DEFAULT 0,
      score_breakdown TEXT,
      submitted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS event_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS score_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      team_id INTEGER NOT NULL,
      admin_username TEXT NOT NULL,
      old_score INTEGER NOT NULL,
      new_score INTEGER NOT NULL,
      reason TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  // Default event settings
  const defaultSettings = [
    ['registration_open', 'true'],
    ['game_open', 'true'],
    ['game_duration_seconds', '300'], // 5 minutes (300 sec), configurable up to 360 sec (6 min)
    ['leaderboard_visible', 'true'],
    ['base_kill_score', '100'],
    ['level_bonus_score', '500'],
    ['accuracy_bonus_multiplier', '10'],
    ['boss_bonus_score', '2500'],
    ['event_title', 'TECH-SYMPOSIUM 2026: ROBOTIC ARENA STRIKE'],
    ['college_name', 'College of Engineering & Technology']
  ];

  const checkStmt = db.prepare('SELECT value FROM event_settings WHERE key = ?');
  const insertStmt = db.prepare('INSERT INTO event_settings (key, value) VALUES (?, ?)');

  for (const [key, val] of defaultSettings) {
    const existing = checkStmt.get(key);
    if (!existing) {
      insertStmt.run(key, val);
    }
  }

  // Ensure default admin user exists
  const adminCheck = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');
  if (!adminCheck) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin@symposium2026';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(defaultPassword, salt);
    db.prepare('INSERT INTO admin_users (username, password_hash, created_at) VALUES (?, ?, ?)')
      .run('admin', hash, new Date().toISOString());
    console.log(`[Database] Initialized default admin: username=admin, password=${defaultPassword}`);
  }
}

// Helper methods
const dbHelpers = {
  // Settings
  getSetting(key) {
    const row = db.prepare('SELECT value FROM event_settings WHERE key = ?').get(key);
    return row ? row.value : null;
  },
  getAllSettings() {
    const rows = db.prepare('SELECT key, value FROM event_settings').all();
    const settings = {};
    for (const r of rows) settings[r.key] = r.value;
    return settings;
  },
  updateSetting(key, value) {
    const row = db.prepare('SELECT key FROM event_settings WHERE key = ?').get(key);
    if (row) {
      db.prepare('UPDATE event_settings SET value = ? WHERE key = ?').run(String(value), key);
    } else {
      db.prepare('INSERT INTO event_settings (key, value) VALUES (?, ?)').run(key, String(value));
    }
  },

  // Teams
  createTeam(teamData) {
    const stmt = db.prepare(`
      INSERT INTO teams (
        code, name, student1_name, student1_college, student2_name, student2_college,
        contact_email, contact_phone, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      teamData.code,
      teamData.name.trim(),
      teamData.student1_name.trim(),
      teamData.student1_college.trim(),
      teamData.student2_name.trim(),
      teamData.student2_college.trim(),
      (teamData.contact_email || '').trim(),
      (teamData.contact_phone || '').trim(),
      new Date().toISOString()
    );
    return result.lastInsertRowid;
  },

  getTeamByCode(code) {
    return db.prepare('SELECT * FROM teams WHERE UPPER(code) = UPPER(?)').get(code.trim());
  },

  getTeamById(id) {
    return db.prepare('SELECT * FROM teams WHERE id = ?').get(id);
  },

  getTeamByName(name) {
    return db.prepare('SELECT * FROM teams WHERE UPPER(name) = UPPER(?)').get(name.trim());
  },

  getAllTeams() {
    return db.prepare(`
      SELECT t.*, 
        s.id AS session_id,
        s.status AS session_status,
        s.score AS session_score,
        s.accuracy AS session_accuracy,
        s.levels_completed AS session_levels_completed,
        s.enemies_defeated AS session_enemies_defeated,
        s.submitted_at AS session_submitted_at
      FROM teams t
      LEFT JOIN (
        SELECT * FROM game_sessions 
        WHERE id IN (SELECT MAX(id) FROM game_sessions GROUP BY team_id)
      ) s ON t.id = s.team_id
      ORDER BY t.created_at DESC
    `).all();
  },

  updateTeam(id, data) {
    return db.prepare(`
      UPDATE teams SET
        name = ?,
        student1_name = ?,
        student1_college = ?,
        student2_name = ?,
        student2_college = ?,
        contact_email = ?,
        contact_phone = ?
      WHERE id = ?
    `).run(
      data.name.trim(),
      data.student1_name.trim(),
      data.student1_college.trim(),
      data.student2_name.trim(),
      data.student2_college.trim(),
      (data.contact_email || '').trim(),
      (data.contact_phone || '').trim(),
      id
    );
  },

  deleteTeam(id) {
    return db.prepare('DELETE FROM teams WHERE id = ?').run(id);
  },

  // Sessions
  createSession(teamId, sessionToken, durationSeconds) {
    const stmt = db.prepare(`
      INSERT INTO game_sessions (
        session_token, team_id, status, start_time, duration_seconds
      ) VALUES (?, ?, 'IN_PROGRESS', ?, ?)
    `);
    const result = stmt.run(
      sessionToken,
      teamId,
      new Date().toISOString(),
      durationSeconds
    );
    return result.lastInsertRowid;
  },

  getSessionByToken(token) {
    return db.prepare(`
      SELECT s.*, t.name AS team_name, t.code AS team_code
      FROM game_sessions s
      JOIN teams t ON s.team_id = t.id
      WHERE s.session_token = ?
    `).get(token);
  },

  getLatestSessionForTeam(teamId) {
    return db.prepare(`
      SELECT * FROM game_sessions
      WHERE team_id = ?
      ORDER BY id DESC
      LIMIT 1
    `).get(teamId);
  },

  submitSessionResult(sessionId, data) {
    const stmt = db.prepare(`
      UPDATE game_sessions SET
        status = 'COMPLETED',
        end_time = ?,
        levels_completed = ?,
        enemies_defeated = ?,
        shots_fired = ?,
        shots_hit = ?,
        accuracy = ?,
        score = ?,
        score_breakdown = ?,
        submitted_at = ?
      WHERE id = ?
    `);
    const now = new Date().toISOString();
    return stmt.run(
      now,
      data.levels_completed,
      data.enemies_defeated,
      data.shots_fired,
      data.shots_hit,
      data.accuracy,
      data.score,
      JSON.stringify(data.score_breakdown || {}),
      now,
      sessionId
    );
  },

  resetTeamSession(teamId) {
    return db.prepare(`
      UPDATE game_sessions SET status = 'RESET' WHERE team_id = ? AND status IN ('IN_PROGRESS', 'COMPLETED')
    `).run(teamId);
  },

  // Leaderboard
  getLeaderboard() {
    return db.prepare(`
      SELECT 
        s.id AS session_id,
        s.score,
        s.accuracy,
        s.levels_completed,
        s.enemies_defeated,
        s.shots_fired,
        s.shots_hit,
        s.submitted_at,
        s.duration_seconds,
        t.id AS team_id,
        t.name AS team_name,
        t.code AS team_code,
        t.student1_name,
        t.student1_college,
        t.student2_name,
        t.student2_college
      FROM game_sessions s
      JOIN teams t ON s.team_id = t.id
      WHERE s.status = 'COMPLETED'
        AND s.id IN (
          SELECT MAX(id) FROM game_sessions 
          WHERE status = 'COMPLETED' 
          GROUP BY team_id
        )
      ORDER BY 
        s.score DESC,
        s.accuracy DESC,
        s.levels_completed DESC,
        s.enemies_defeated DESC,
        s.submitted_at ASC
    `).all();
  },

  // Adjust score
  adjustScore(sessionId, newScore, reason, adminUsername) {
    const session = db.prepare('SELECT * FROM game_sessions WHERE id = ?').get(sessionId);
    if (!session) throw new Error('Session not found');

    const oldScore = session.score;
    db.prepare('UPDATE game_sessions SET score = ? WHERE id = ?').run(newScore, sessionId);

    db.prepare(`
      INSERT INTO score_audit_logs (session_id, team_id, admin_username, old_score, new_score, reason, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(sessionId, session.team_id, adminUsername, oldScore, newScore, reason, new Date().toISOString());

    return { oldScore, newScore };
  },

  getAuditLogs() {
    return db.prepare(`
      SELECT a.*, t.name AS team_name, t.code AS team_code
      FROM score_audit_logs a
      JOIN teams t ON a.team_id = t.id
      ORDER BY a.timestamp DESC
    `).all();
  },

  // Admin
  getAdminByUsername(username) {
    return db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  },

  updateAdminPassword(username, newHash) {
    return db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(newHash, username);
  },

  // Stats
  getDashboardStats() {
    const totalTeams = db.prepare('SELECT COUNT(*) AS count FROM teams').get().count;
    const completedSessions = db.prepare("SELECT COUNT(*) AS count FROM game_sessions WHERE status = 'COMPLETED'").get().count;
    const activeSessions = db.prepare("SELECT COUNT(*) AS count FROM game_sessions WHERE status = 'IN_PROGRESS'").get().count;
    const highestScoreRow = db.prepare("SELECT MAX(score) AS max_score FROM game_sessions WHERE status = 'COMPLETED'").get();
    const highestScore = highestScoreRow ? (highestScoreRow.max_score || 0) : 0;
    const avgAccuracyRow = db.prepare("SELECT AVG(accuracy) AS avg_acc FROM game_sessions WHERE status = 'COMPLETED'").get();
    const avgAccuracy = avgAccuracyRow && avgAccuracyRow.avg_acc ? Math.round(avgAccuracyRow.avg_acc * 10) / 10 : 0;

    const topTeams = db.prepare(`
      SELECT t.name, s.score, s.accuracy, s.levels_completed
      FROM game_sessions s
      JOIN teams t ON s.team_id = t.id
      WHERE s.status = 'COMPLETED'
      ORDER BY s.score DESC, s.accuracy DESC
      LIMIT 5
    `).all();

    return {
      totalTeams,
      totalParticipants: totalTeams * 2,
      completedSessions,
      activeSessions,
      highestScore,
      avgAccuracy,
      topTeams
    };
  }
};

// Initialize schema on load
initDatabase();

module.exports = {
  db,
  initDatabase,
  ...dbHelpers
};
