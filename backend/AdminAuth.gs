/**
 * G2G Internal OS · Backend Apps Script add-on
 * v0.2 — paste/merge into existing Apps Script project
 *
 * Endpoint URL stays the same (the one used by chat-memory v2):
 * https://script.google.com/macros/s/AKfycbw-HOUJ1ZFcn-UvYqo9iafaWnzTwe8dUy4VxcDA22tt5VeJYPEvel0-VlBT6lq7XYd8WQ/exec
 *
 * Pattern: GET ?action=X or POST {action:X, ...body}
 *
 * Used by g2g-os.fly.dev /admin/ pages.
 *
 * SHEETS used (in AI Memory Sheet 1-lqcruGtJiMzKFS2MK5gqcxaerzt9PiOTxmdTLqe_eM):
 *  - StaffRegistry  : id, fullname, nickname, dept, role, pin_hash, status, line_uid
 *  - Clients        : id, name, type, project, status, value, owner_id, created
 *  - Tasks          : id, title, description, assignee_id, status, due, source, created
 *  - Sessions       : token, user_id, created, expires
 *  - LoginAudit     : timestamp, who, method, success, ip
 *
 * NOTE: This file is a starter — drop into Apps Script, run setupAdminSheets()
 * once, then deploy as Web App.
 */

const G2G_SHEET_ID = '1-lqcruGtJiMzKFS2MK5gqcxaerzt9PiOTxmdTLqe_eM';
const LINE_LOGIN_CHANNEL_ID = '2009931192';
// Bot Linking Messaging API channel secret for token exchange
const LINE_LOGIN_CHANNEL_SECRET = ''; // set in Script Properties: LINE_LOGIN_CHANNEL_SECRET

// === Admin actions router ===
// Hook into your existing doGet/doPost handler — call this when action starts with "staff", "client", "task", "line", "dashboard"
function g2gAdminHandle(action, params, body) {
  try {
    switch (action) {
      case 'staffLogin':       return staffLogin_(body || params);
      case 'lineExchange':     return lineExchange_(body || params);
      case 'listStaff':        return listStaff_();
      case 'addStaff':         return addStaff_(body);
      case 'listClients':      return listClients_();
      case 'addClient':        return addClient_(body);
      case 'listTasks':        return listTasks_();
      case 'addTask':          return addTask_(body);
      case 'updateTask':       return updateTask_(body);
      case 'dashboardSummary': return dashboardSummary_();
      default: return null; // not handled, fall through to other handlers
    }
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function setupAdminSheets() {
  const ss = SpreadsheetApp.openById(G2G_SHEET_ID);
  const sheets = {
    StaffRegistry: ['id','fullname','nickname','dept','role','pin_hash','status','line_uid','created'],
    Clients: ['id','name','type','project','status','value','owner_id','created'],
    Tasks: ['id','title','description','assignee_id','status','due','source','created'],
    Sessions: ['token','user_id','created','expires'],
    LoginAudit: ['timestamp','who','method','success','ip']
  };
  for (const name of Object.keys(sheets)) {
    let sh = ss.getSheetByName(name);
    if (!sh) { sh = ss.insertSheet(name); }
    if (sh.getLastRow() === 0) {
      sh.appendRow(sheets[name]);
    }
  }
  return 'ok';
}

// === Auth: PIN login ===
function staffLogin_(p) {
  const name = (p && (p.name || p.username) || '').toString().trim();
  const pin  = (p && p.pin || '').toString().trim();
  if (!name || !pin) return { ok: false, error: 'name+pin required' };
  const sh = SpreadsheetApp.openById(G2G_SHEET_ID).getSheetByName('StaffRegistry');
  if (!sh) return { ok: false, error: 'StaffRegistry not set up' };
  const data = sh.getDataRange().getValues();
  const head = data[0]; const iName = head.indexOf('fullname'); const iNick = head.indexOf('nickname');
  const iPin = head.indexOf('pin_hash'); const iId = head.indexOf('id'); const iDept = head.indexOf('dept'); const iRole = head.indexOf('role');
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[iName] === name || row[iNick] === name) {
      const pinHash = String(row[iPin] || '');
      if (pinHash && pinHash === hashPin_(pin)) {
        const token = mkToken_(row[iId]);
        audit_('login', name, 'pin', true);
        return {
          ok: true, token,
          user: { id: row[iId], name: row[iName], nickname: row[iNick],
                  dept: row[iDept], role: row[iRole],
                  avatar: nickAv_(row[iName], row[iNick]) }
        };
      }
    }
  }
  audit_('login', name, 'pin', false);
  return { ok: false, error: 'invalid credentials' };
}

// === Auth: LINE Login exchange ===
function lineExchange_(p) {
  const code = (p && p.code) || '';
  const redirectUri = (p && p.redirectUri) || '';
  const secret = PropertiesService.getScriptProperties().getProperty('LINE_LOGIN_CHANNEL_SECRET') || LINE_LOGIN_CHANNEL_SECRET;
  if (!code || !secret) return { ok: false, error: 'code+secret required' };
  // Token endpoint
  const r = UrlFetchApp.fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload: {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: LINE_LOGIN_CHANNEL_ID,
      client_secret: secret
    },
    muteHttpExceptions: true
  });
  const tokenRes = JSON.parse(r.getContentText() || '{}');
  if (!tokenRes.id_token) return { ok: false, error: 'no id_token', detail: tokenRes };
  // Parse id_token (decode JWT, no verify here — Apps Script lacks crypto)
  const parts = tokenRes.id_token.split('.');
  if (parts.length < 2) return { ok: false, error: 'bad id_token' };
  const payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[1])).getDataAsString());
  const lineUid = payload.sub;
  const displayName = payload.name || 'LINE user';
  // Find or create user
  const sh = SpreadsheetApp.openById(G2G_SHEET_ID).getSheetByName('StaffRegistry');
  const data = sh.getDataRange().getValues();
  const head = data[0]; const iUid = head.indexOf('line_uid');
  let user = null;
  for (let i = 1; i < data.length; i++) {
    if (data[i][iUid] === lineUid) {
      const r = data[i];
      user = {
        id: r[head.indexOf('id')], name: r[head.indexOf('fullname')], nickname: r[head.indexOf('nickname')],
        dept: r[head.indexOf('dept')], role: r[head.indexOf('role')],
        avatar: nickAv_(r[head.indexOf('fullname')], r[head.indexOf('nickname')])
      };
      break;
    }
  }
  if (!user) {
    // Auto-register as 'guest' tier — admin must promote later
    const newId = 'L' + Date.now();
    sh.appendRow([newId, displayName, '', 'Guest', 'guest', '', 'pending', lineUid, new Date()]);
    user = { id: newId, name: displayName, dept: 'Guest', role: 'guest', avatar: displayName.substr(0,2).toUpperCase() };
  }
  const token = mkToken_(user.id);
  audit_('login', user.name, 'line', true);
  return { ok: true, token, user };
}

// === Listings ===
function listStaff_() {
  const data = readSheet_('StaffRegistry');
  return { ok: true, staff: data.map(r => ({
    id: r.id, name: r.fullname, nickname: r.nickname,
    dept: r.dept, role: r.role, status: r.status
  })) };
}
function listClients_() {
  return { ok: true, clients: readSheet_('Clients') };
}
function listTasks_() {
  return { ok: true, tasks: readSheet_('Tasks') };
}

// === Writes ===
function addStaff_(p) {
  const sh = SpreadsheetApp.openById(G2G_SHEET_ID).getSheetByName('StaffRegistry');
  const id = 'S' + Date.now();
  sh.appendRow([id, p.fullname || '', p.nickname || '', p.dept || '', p.role || 'staff',
                p.pin ? hashPin_(p.pin) : '', p.status || 'active', p.line_uid || '', new Date()]);
  return { ok: true, id };
}
function addClient_(p) {
  const sh = SpreadsheetApp.openById(G2G_SHEET_ID).getSheetByName('Clients');
  const id = 'C' + Date.now();
  sh.appendRow([id, p.name || '', p.type || '', p.project || '', p.status || 'lead',
                p.value || '', p.owner_id || '', new Date()]);
  return { ok: true, id };
}
function addTask_(p) {
  const sh = SpreadsheetApp.openById(G2G_SHEET_ID).getSheetByName('Tasks');
  const id = 'T' + Date.now();
  sh.appendRow([id, p.title || '', p.description || '', p.assignee_id || '',
                p.status || 'pending', p.due || '', p.source || 'admin', new Date()]);
  return { ok: true, id };
}
function updateTask_(p) {
  const sh = SpreadsheetApp.openById(G2G_SHEET_ID).getSheetByName('Tasks');
  const data = sh.getDataRange().getValues();
  const head = data[0]; const iId = head.indexOf('id'); const iStatus = head.indexOf('status');
  for (let i = 1; i < data.length; i++) {
    if (data[i][iId] === p.id) {
      sh.getRange(i+1, iStatus+1).setValue(p.status || 'pending');
      return { ok: true };
    }
  }
  return { ok: false, error: 'not found' };
}

// === Dashboard ===
function dashboardSummary_() {
  const staff = readSheet_('StaffRegistry');
  const clients = readSheet_('Clients');
  const tasks = readSheet_('Tasks');
  return {
    ok: true,
    staff: staff.filter(r => r.status !== 'inactive').length,
    clients: clients.length,
    tasks: tasks.filter(r => r.status !== 'completed').length
  };
}

// === Helpers ===
function readSheet_(name) {
  const sh = SpreadsheetApp.openById(G2G_SHEET_ID).getSheetByName(name);
  if (!sh) return [];
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  const head = data[0];
  return data.slice(1).map(r => {
    const o = {};
    head.forEach((h, i) => o[h] = r[i]);
    return o;
  });
}
function hashPin_(pin) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'g2g-salt-2026:' + pin);
  return Utilities.base64Encode(bytes);
}
function mkToken_(uid) {
  const t = uid + '|' + Date.now() + '|' + Math.random().toString(36).slice(2);
  return Utilities.base64EncodeWebSafe(t);
}
function nickAv_(full, nick) {
  const s = (nick || full || 'G').toString();
  return s.substr(0,2).toUpperCase();
}
function audit_(kind, who, method, success) {
  try {
    const sh = SpreadsheetApp.openById(G2G_SHEET_ID).getSheetByName('LoginAudit');
    if (sh) sh.appendRow([new Date(), who, method, success ? 'ok' : 'fail', '']);
  } catch (e) {}
}
