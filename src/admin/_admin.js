/* G2G Internal OS · Shared admin JS · v0.2
 * Handles: session, API helpers, sidebar render, top-bar render
 * Backend: Apps Script chat-memory endpoint pattern
 */

window.G2G = (function () {
  // === Config ===
  // Memory v3 / ERP endpoint — Memory v3 Dreaming Worker (deployed 2026-05-18)
  // ครอบคลุม load_chat_v3, listFacts, listThemes, erpList*, erpDashboard
  const APPS_SCRIPT =
    'https://script.google.com/macros/s/AKfycbxL1z6_xVzAaJIY5alYypWU6xDQMaNychyX-bPlf4T8H2SjJ1QJ0omz4XW9zlnk024k/exec';

  // LINE Login channel — existing channel "เพื่อนเกษตร MOAC" (2009931192)
  // Will need login channel set up; falling back to PIN flow for now.
  const LINE_LOGIN_CHANNEL = '2009931192';
  const LINE_LOGIN_REDIRECT = window.location.origin + '/admin/login.html';

  // === Storage keys ===
  const K_USER = 'g2g_admin_user';
  const K_TOKEN = 'g2g_admin_token';

  // === Session ===
  function getUser() {
    try { return JSON.parse(localStorage.getItem(K_USER) || 'null'); } catch (e) { return null; }
  }
  function setUser(u) {
    if (u) localStorage.setItem(K_USER, JSON.stringify(u));
    else localStorage.removeItem(K_USER);
  }
  function getToken() { return localStorage.getItem(K_TOKEN); }
  function setToken(t) {
    if (t) localStorage.setItem(K_TOKEN, t); else localStorage.removeItem(K_TOKEN);
  }
  function logout() {
    setUser(null); setToken(null);
    window.location.href = '/admin/login.html';
  }
  function requireAuth() {
    const u = getUser();
    if (!u) {
      window.location.href = '/admin/login.html';
      return null;
    }
    return u;
  }

  // === API ===
  // Apps Script CORS is JSONP-style — we use fetch with no-cors only for POSTs
  // For GET we use fetch with parsed JSON; for POST use text/plain payload
  async function api(action, params) {
    const url = new URL(APPS_SCRIPT);
    url.searchParams.set('action', action);
    if (params && typeof params === 'object') {
      for (const k of Object.keys(params)) {
        url.searchParams.set(k, typeof params[k] === 'string' ? params[k] : JSON.stringify(params[k]));
      }
    }
    const tok = getToken();
    if (tok) url.searchParams.set('t', tok);
    try {
      const r = await fetch(url.toString(), { method: 'GET' });
      const j = await r.json();
      return j;
    } catch (e) {
      console.warn('api err', action, e);
      return { ok: false, error: String(e) };
    }
  }

  async function apiPost(action, body) {
    const url = new URL(APPS_SCRIPT);
    url.searchParams.set('action', action);
    const tok = getToken();
    if (tok) url.searchParams.set('t', tok);
    try {
      const r = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(body || {})
      });
      const j = await r.json();
      return j;
    } catch (e) {
      console.warn('apiPost err', action, e);
      return { ok: false, error: String(e) };
    }
  }

  // === Login flows ===
  function startLineLogin() {
    // Use LINE Login OAuth (PKCE-less form for simplicity, backend verifies)
    const state = Math.random().toString(36).slice(2);
    sessionStorage.setItem('g2g_login_state', state);
    const url =
      'https://access.line.me/oauth2/v2.1/authorize?response_type=code' +
      '&client_id=' + LINE_LOGIN_CHANNEL +
      '&redirect_uri=' + encodeURIComponent(LINE_LOGIN_REDIRECT) +
      '&state=' + state +
      '&scope=openid%20profile';
    window.location.href = url;
  }

  async function handleLineCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (!code) return null;
    const expected = sessionStorage.getItem('g2g_login_state');
    if (state !== expected) { console.warn('state mismatch'); return null; }
    const r = await apiPost('lineExchange', {
      code,
      redirectUri: LINE_LOGIN_REDIRECT,
      channel: LINE_LOGIN_CHANNEL
    });
    if (r && r.ok && r.user) {
      setUser(r.user); setToken(r.token);
      window.location.href = '/admin/';
      return r.user;
    }
    return null;
  }

  async function loginWithPin(name, pin) {
    const r = await apiPost('staffLogin', { name, pin });
    if (r && r.ok && r.user) {
      setUser(r.user); setToken(r.token);
      return r.user;
    }
    return null;
  }

  // === Demo / offline mode ===
  // If backend not reachable, allow CEO to enter with master code (v0.2 transitional)
  function loginDemo(name) {
    const u = {
      id: 'S001', name: name || 'CEO',
      role: 'ceo', dept: 'Executive',
      avatar: (name || 'CEO').substr(0, 2).toUpperCase(),
      session: 'demo'
    };
    setUser(u); setToken('demo-' + Date.now());
    return u;
  }

  // === UI helpers ===
  function $(s, root) { return (root || document).querySelector(s); }
  function $$(s, root) { return Array.from((root || document).querySelectorAll(s)); }

  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) for (const k of Object.keys(attrs)) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k.startsWith('on')) e.addEventListener(k.substr(2).toLowerCase(), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(c => {
        if (c == null) return;
        if (typeof c === 'string') e.appendChild(document.createTextNode(c));
        else e.appendChild(c);
      });
    }
    return e;
  }

  // === Sidebar nav config ===
  const NAV = [
    { group: 'หน้าหลัก', items: [
      { id: 'dashboard', label: 'Dashboard', href: 'index.html', ico: 'home' },
      { id: 'board', label: 'Workboard · งานรวม', href: 'board.html', ico: 'check' },
      { id: 'showcase', label: 'Showcase · ผลงาน', href: 'showcase.html', ico: 'briefcase' },
      { id: 'studio', label: '🎨 Studio Hub · AI Tools', href: 'studio.html', ico: 'megaphone' },
      { id: 'analytics', label: '📊 Analytics · Token + Cron', href: 'analytics.html', ico: 'gear' },
      { id: 'comms', label: '📨 Comms · Email + Calendar', href: 'comms.html', ico: 'megaphone' },
      { id: 'citizen', label: '🆔 Citizen ID · ประจำตัวประชาชน', href: 'citizen.html', ico: 'users' },
      { id: 'invite', label: '📩 Invite · ส่งลิงก์ส่วนตัว', href: 'invite.html', ico: 'megaphone' },
      { id: 'discovery', label: '🔍 R-DISCOVERY · ทดสอบ 6-tier', href: 'discovery.html', ico: 'gear' },
      { id: 'academic', label: 'Academic · อ.ต้อย', href: 'academic.html', ico: 'book' },
      { id: 'app-status', label: 'App Status · Live', href: 'app-status.html', ico: 'gear' },
    ]},
    { group: 'การเงิน · บัญชี', items: [
      { id: 'accounting', label: 'บัญชี · การเงิน', href: 'accounting.html', ico: 'book' },
      { id: 'tax', label: 'ภาษี', href: 'tax.html', ico: 'tax' },
      { id: 'social-security', label: 'ประกันสังคม', href: 'social-security.html', ico: 'ss' },
    ]},
    { group: 'การผลิต · ขาย', items: [
      { id: 'production', label: 'การผลิต', href: 'production.html', ico: 'factory' },
      { id: 'sales', label: 'ขายสินค้า', href: 'sales.html', ico: 'cart' },
      { id: 'marketing', label: 'การตลาด', href: 'marketing.html', ico: 'megaphone' },
    ]},
    { group: 'คน · งาน', items: [
      { id: 'staff', label: 'พนักงาน · HR', href: 'staff.html', ico: 'users' },
      { id: 'tasks', label: 'งาน · Tasks (live)', href: 'tasks.html', ico: 'check' },
    ]},
    { group: 'ทั่วไป', items: [
      { id: 'general', label: 'เอกสาร · ทรัพย์สิน', href: 'general.html', ico: 'file' },
      { id: 'settings', label: 'ตั้งค่า · Settings', href: 'settings.html', ico: 'gear' },
    ]},
    { group: 'ลูกค้า (วางท้าย)', items: [
      { id: 'clients', label: 'CRM · ลูกค้าทั้งหมด', href: 'clients.html', ico: 'briefcase' },
      { id: 'client-aim', label: 'AIM Clinic · Service', href: 'clients/aim.html', ico: 'briefcase' },
      { id: 'client-nklaw', label: 'NK Law · Service', href: 'clients/nklaw.html', ico: 'briefcase' },
    ]},
  ];

  const ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
    tax: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
    ss: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-3-3.87M4 21v-2a4 4 0 013-3.87"/><circle cx="12" cy="7" r="4"/></svg>',
    factory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20V8l7 4V8l7 4V4l6 16z"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6"/></svg>',
    megaphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l18-8v18l-18-8z"/><path d="M11 11v8"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
  };

  function renderSidebar(activeId) {
    const side = document.querySelector('.adm-side');
    if (!side) return;
    const u = getUser() || { name: 'Guest', role: 'guest', dept: '-', avatar: 'G?' };
    const nav = NAV.map(g => `
      <div class="adm-nav-group">
        <div class="lbl">${g.group}</div>
        ${g.items.map(it => `
          <a href="${it.href}" class="adm-nav-item ${it.id === activeId ? 'active' : ''}">
            <span class="ico">${ICONS[it.ico] || ''}</span>
            <span>${it.label}</span>
          </a>
        `).join('')}
      </div>
    `).join('');
    side.innerHTML = `
      <div class="adm-brand">
        <div class="logo"><span class="bar"></span>G2G<em>·</em>OS</div>
        <div class="tagline">Internal Management System</div>
      </div>
      <div class="adm-nav">${nav}</div>
      <div class="adm-bottom">
        <div class="adm-user">
          <div class="av">${u.avatar || u.name.substr(0,2).toUpperCase()}</div>
          <div class="who">
            <div class="name">${u.name}</div>
            <div class="role">${u.role} · ${u.dept || ''}</div>
          </div>
          <a href="#" class="logout" onclick="G2G.logout();return false;">ออก</a>
        </div>
      </div>
    `;
  }

  function renderTopbar(title, crumbs) {
    const top = document.querySelector('.adm-top');
    if (!top) return;
    top.innerHTML = `
      <div>
        <button class="adm-burger btn btn-outline btn-sm" onclick="document.querySelector('.adm-side').classList.toggle('open')">☰</button>
        <h1 style="display:inline-block;margin-left:8px">${title || 'Dashboard'}</h1>
        <div class="crumbs">${(crumbs || []).map(c => c.href ? `<a href="${c.href}">${c.label}</a>` : c.label).join(' › ')}</div>
      </div>
      <div class="adm-top-actions">
        <div class="adm-top-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input placeholder="ค้นหา...">
        </div>
        <button id="g2g-lang-toggle" class="btn btn-outline btn-sm" onclick="G2G.toggleLang()" style="margin-right:6px" title="Toggle TH/EN">${(localStorage.getItem('g2g_lang')||'TH')}</button>
        <a href="../index.html" class="btn btn-outline btn-sm">← เว็บไซต์</a>
      </div>
    `;
  }

  // === Multi-language support · simple TH/EN dictionary swap ===
  const L10N = {
    EN: {
      'Dashboard': 'Dashboard',
      'Workboard · งานรวม': 'Workboard · All Tasks',
      'Showcase · ผลงาน': 'Showcase · Portfolio',
      '🎨 Studio Hub · AI Tools': '🎨 Studio Hub · AI Tools',
      '📊 Analytics · Token + Cron': '📊 Analytics · Token + Cron',
      '📨 Comms · Email + Calendar': '📨 Comms · Email + Calendar',
      'Academic · อ.ต้อย': 'Academic · Dr. Toi',
      'App Status · Live': 'App Status · Live',
      'บัญชี · การเงิน': 'Accounting · Finance',
      'ภาษี': 'Tax',
      'ประกันสังคม': 'Social Security',
      'การผลิต': 'Production',
      'ขายสินค้า': 'Sales',
      'การตลาด': 'Marketing',
      'พนักงาน · HR': 'Staff · HR',
      'งาน · Tasks (live)': 'Tasks (live)',
      'เอกสาร · ทรัพย์สิน': 'Documents · Assets',
      'ตั้งค่า · Settings': 'Settings',
      'CRM · ลูกค้าทั้งหมด': 'CRM · All Clients',
      'AIM Clinic · Service': 'AIM Clinic · Service',
      'NK Law · Service': 'NK Law · Service',
      '← เว็บไซต์': '← Website',
      'ค้นหา...': 'Search...'
    }
  };

  function toggleLang() {
    const cur = localStorage.getItem('g2g_lang') || 'TH';
    const next = cur === 'TH' ? 'EN' : 'TH';
    localStorage.setItem('g2g_lang', next);
    applyLang(next);
    const btn = document.getElementById('g2g-lang-toggle');
    if (btn) btn.textContent = next;
  }

  function applyLang(lang) {
    if (lang !== 'EN') {
      // Reload to restore TH (it's the source language)
      if (lang === 'TH') return location.reload();
    }
    const dict = L10N.EN;
    document.querySelectorAll('a, button, span, div, h1, h2, h3, p, label').forEach(el => {
      if (el.children.length > 0) return;  // only leaf text nodes
      const t = el.textContent.trim();
      if (dict[t]) el.textContent = dict[t];
    });
  }
  // Apply on boot if EN saved
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => { if (localStorage.getItem('g2g_lang') === 'EN') setTimeout(() => applyLang('EN'), 200); });
  }

  // === ERP data helpers · auto-render tables from sheet data ===
  async function loadTab(tabName, limit) {
    const params = { tab: tabName };
    if (limit) params.limit = limit;
    const r = await api('erpTab', params);
    return r && r.ok ? r : { ok: false, rows: [], columns: [] };
  }

  async function loadDashboard() {
    const r = await api('erpDashboard');
    return r && r.ok ? r : { counts: {}, memory: {} };
  }

  // Render a table from rows + columns into target element
  function renderTable(targetEl, columns, rows, opts) {
    opts = opts || {};
    if (!targetEl) return;
    if (!rows || rows.length === 0) {
      targetEl.innerHTML = `<div class="adm-empty"><h4>ยังไม่มีข้อมูล</h4><p>${opts.emptyMsg || 'tab นี้ยังไม่มี data'}</p></div>`;
      return;
    }
    const cols = opts.showCols || columns.slice(0, 7);  // limit visible cols
    const formatCell = (v) => {
      if (v == null || v === '') return '<span style="color:#bbb">—</span>';
      const s = String(v);
      if (s.length > 80) return escapeHtml(s.substr(0, 80)) + '…';
      return escapeHtml(s);
    };
    const html = `
      <div style="overflow-x:auto">
        <table class="adm-tbl">
          <thead><tr>${cols.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead>
          <tbody>
            ${rows.slice(0, opts.maxRows || 100).map(r =>
              `<tr>${cols.map(c => `<td>${formatCell(r[c])}</td>`).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>
      </div>
      ${rows.length > (opts.maxRows || 100) ? `<div style="padding:8px 16px;color:var(--ink-4);font-size:12px">แสดง ${opts.maxRows || 100} จาก ${rows.length} rows</div>` : ''}
    `;
    targetEl.innerHTML = html;
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;' })[c]);
  }

  // Auto-init pages — call from each module page like: G2G.boot('staff', { title: 'พนักงาน' })
  function boot(activeId, opts) {
    opts = opts || {};
    if (!opts.skipAuth) {
      const u = requireAuth();
      if (!u) return null;
    }
    renderSidebar(activeId);
    renderTopbar(opts.title || activeId, opts.crumbs);
    return getUser();
  }

  // ====== Font-size widget + Voice player + Workboard helpers ======
  const FS_LEVELS = ['fs-xs','fs-sm','fs-md','fs-lg','fs-xl','fs-xxl'];
  const FS_KEY = 'g2g_fs';
  const VOICE_SPEED_KEY = 'g2g_voice_speed';
  const VOICE_DEFAULT_SPEED = 0.78;  // Iron Rule: 22% slower than normal

  function applyFontSize(level) {
    const cur = (FS_LEVELS.find(c => document.documentElement.classList.contains(c))) || 'fs-md';
    document.documentElement.classList.remove(cur);
    document.documentElement.classList.add(level);
    localStorage.setItem(FS_KEY, level);
  }
  function bumpFontSize(delta) {
    const cur = (FS_LEVELS.find(c => document.documentElement.classList.contains(c))) || 'fs-md';
    const idx = Math.min(FS_LEVELS.length - 1, Math.max(0, FS_LEVELS.indexOf(cur) + delta));
    applyFontSize(FS_LEVELS[idx]);
  }
  function getVoiceSpeed() {
    return parseFloat(localStorage.getItem(VOICE_SPEED_KEY) || VOICE_DEFAULT_SPEED);
  }
  function setVoiceSpeed(s) { localStorage.setItem(VOICE_SPEED_KEY, String(s)); }

  // Voice over via Web Speech API (Thai voices · fallback browser default)
  // Iron Rule: default 0.78 rate (22% slower) · adjustable
  let currentUtter = null;
  function speak(text, narrator) {
    if (!('speechSynthesis' in window)) {
      alert('Browser ไม่รองรับ TTS · ใช้ Chrome/Safari ล่าสุด');
      return;
    }
    if (currentUtter) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'th-TH';
    u.rate = getVoiceSpeed();
    u.pitch = (narrator === 'premwadee') ? 1.05 : 0.95;  // Premwadee higher, Niwat lower
    // Find best Thai voice
    const voices = speechSynthesis.getVoices();
    const th = voices.find(v => v.lang === 'th-TH' || v.lang.startsWith('th'));
    if (th) u.voice = th;
    currentUtter = u;
    u.onend = () => { document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('playing')); };
    speechSynthesis.speak(u);
    document.querySelectorAll('.voice-btn').forEach(b => b.classList.add('playing'));
  }
  function stopSpeak() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('playing'));
  }

  function installTools(explainer, narrator) {
    // explainer: text to read · narrator: 'niwat'|'premwadee'
    let tools = document.querySelector('.adm-tools');
    if (!tools) {
      tools = document.createElement('div');
      tools.className = 'adm-tools';
      tools.innerHTML = `
        <button title="ลดขนาดตัวอักษร" onclick="G2G.bumpFontSize(-1)">A-</button>
        <button title="เพิ่มขนาดตัวอักษร" onclick="G2G.bumpFontSize(1)">A+</button>
        <select class="speed-select" title="ความเร็วเสียง" onchange="G2G.setVoiceSpeed(this.value)">
          <option value="0.5">0.5x</option>
          <option value="0.75">0.75x</option>
          <option value="0.78" selected>0.78x</option>
          <option value="1.0">1.0x</option>
          <option value="1.25">1.25x</option>
        </select>
        <button class="voice-btn" title="ฟังคำอธิบาย (Niwat/Premwadee)" onclick="G2G.playExplainer()">🔊</button>
        <button title="หยุดเสียง" onclick="G2G.stopSpeak()">✕</button>
      `;
      document.body.appendChild(tools);
      // Restore saved speed
      const saved = getVoiceSpeed();
      tools.querySelector('.speed-select').value = String(saved);
    }
    window._g2gExplainer = { text: explainer || '', narrator: narrator || 'niwat' };
    let tx = document.querySelector('.voice-transcript');
    if (!tx) {
      tx = document.createElement('div');
      tx.className = 'voice-transcript';
      tx.innerHTML = `<div class="voice-narrator">เสียง <span id="narr-name">Niwat</span></div><div id="narr-text"></div>`;
      document.body.appendChild(tx);
    }
  }
  function playExplainer() {
    const e = window._g2gExplainer || {};
    if (!e.text) return;
    document.getElementById('narr-name').textContent = e.narrator === 'premwadee' ? 'Premwadee (พริมวดี)' : 'Niwat (นิวัตน์)';
    document.getElementById('narr-text').textContent = e.text;
    document.querySelector('.voice-transcript').classList.add('show');
    speak(e.text, e.narrator);
  }

  // ====== Workboard API helpers ======
  async function wbAuth(slug, pin) { return await apiPost('wbAuth', { slug, pin }); }
  async function wbStaffList() { return (await api('wbStaffList')).staff || []; }
  async function wbListPool(filters) { return (await api('wbListPool', filters || {})).tasks || []; }
  async function wbListMine(slug) { return await api('wbListMine', { slug }); }
  async function wbListShowcase() { return (await api('wbListShowcase')).tasks || []; }
  async function wbClaim(taskId, slug, pin) { return await apiPost('wbClaimTask', { taskId, slug, pin }); }
  async function wbRelease(taskId, slug, pin) { return await apiPost('wbReleaseTask', { taskId, slug, pin }); }
  async function wbComplete(taskId, slug, pin, msg) { return await apiPost('wbCompleteTask', { taskId, slug, pin, message: msg }); }
  async function wbUpdate(taskId, slug, pin, msg, status) { return await apiPost('wbUpdateProgress', { taskId, slug, pin, message: msg, status }); }
  async function wbCreate(t) { return await apiPost('wbCreateTask', t); }
  async function wbChangePin(slug, oldPin, newPin, masterKey) { return await apiPost('wbChangePin', { slug, oldPin, newPin, masterKey }); }
  async function wbSetColor(slug, pin, color, masterKey) { return await apiPost('wbSetColor', { slug, pin, color, masterKey }); }
  async function wbCustomerSend(clientId, from, message) { return await apiPost('wbCustomerMessage', { clientId, from, message }); }
  async function wbCustomerList(clientId) { return (await api('wbListCustomerMessages', clientId ? { clientId } : {})).messages || []; }
  async function wbTutorAsk(slug, question) { return await apiPost('wbTutorAsk', { slug, question }); }
  // Phase B
  async function tokenBalance(slug) { return (await api('tokenBalance', { slug })).balance ?? 0; }
  async function tokenLedger(slug) { return (await api('tokenLedger', { slug })).txns || []; }
  async function horoscopeDaily(slug) { return await api('horoscopeDaily', { slug }); }
  async function mobileCommand(o) { return await apiPost('mobileCommand', o); }
  // Academic Library
  async function academicAdd(item) { return await apiPost('academicAddItem', item); }
  async function academicList(filter) { return (await api('academicList', filter || {})).items || []; }
  async function academicSearch(q) { return await api('academicSearch', { q }); }
  async function academicSynthesis(topic) { return await apiPost('academicSynthesis', { topic }); }
  // LIFF data
  async function liffPersonalGet(slug, userId) { return (await api('liffPersonalGet', { slug, userId })).data || {}; }
  async function liffPersonalSet(o) { return await apiPost('liffPersonalSet', o); }
  async function liffGroupGet(slug, groupId) { return (await api('liffGroupGet', { slug, groupId })).data || {}; }
  async function liffGroupSet(o) { return await apiPost('liffGroupSet', o); }

  // Proactive checkin prompts per staff (asked automatically when page loads)
  const PROACTIVE_CHECKINS = {
    'game':    'งาน IT/Graphics สัปดาห์นี้ขั้นไหนแล้ว? มี deploy bug ค้างไหม? อะไรที่ blocking?',
    'baipare': 'แคมเปญการตลาดเดือนนี้คืออะไร? Imperial Fruitia/Le Phaya มี promotion อะไรบ้าง?',
    'som':     'สต็อกอัญมณีเดือนนี้เป็นยังไง? มี order Le Phaya ใหม่ไหม? พลอยที่เด่นชัยมา restock ใหม่ยัง?',
    'wan':     'มี service request จากลูกค้า AIM/NK ค้างไหม? ใช้เวลาเฉลี่ยตอบเท่าไร?',
    'aui':     'ภาษีเดือนหน้าครบกำหนดอะไรบ้าง? ภงด.1/3/53/ภพ.30 จัดเรียบร้อยไหม? ยอดรายรับ-รายจ่ายเดือนนี้?',
    'bank':    'production output โรงงานสัปดาห์นี้? มี QC defect rate เท่าไร? พร้อมส่งกี่ batch?',
    'sombat':  'distillery batch ล่าสุดผลิตเสร็จไหม? rotation cask + aging? Diamond Drop stock?',
    'ainam':   'มีข่าวสารที่ต้องเผยแพร่สัปดาห์นี้ไหม? media coverage ของ G2G เป็นยังไง?',
    'cat':     'งานสื่อสารกับ stakeholder ภายในเป็นยังไง? มี press contact ใหม่ไหม?',
    'phim':    '9 AI Agents ทำงานครบไหม? Memory v3 มี error ไหม? prompt ที่ต้องปรับมีไหม?',
    'yui':     'มี client/ministry meeting สำคัญสัปดาห์นี้ไหม? pipeline ที่ใกล้ปิดดีล?',
    'toy':     'อาจารย์อยากเริ่มที่เรื่องอะไรครับ? มีปัญหาเกษตรกรถามเข้ามาบ่อยอะไรไหม?',
    // Phrae team
    'punee':    'พี่พรรณีครับ ทีมแพร่สัปดาห์นี้มีงานอะไรค้างไหม? เรื่อง operations ที่ต้องเร่ง?',
    'om':       'พี่ออม เอกสารที่ค้างส่งสำนักงานใหญ่มีอะไรไหม? มีเรื่องด่วนหรือเปล่า?',
    'paew':     'พี่แป๋ว วันนี้มีงานประสานอะไรค้างไหม? นัดประชุมที่ต้องจัด?',
    'sukha':    'พี่สุขญา งานประสานทั่วไปมีอะไรเข้ามาบ่อยช่วงนี้?',
    'pornchai': 'พี่พรชัย สถานที่มีปัญหาอะไรต้องซ่อมไหม? maintenance รอบนี้?',
    'keng':     'พี่เก่ง field งานวันนี้เป็นยังไง?',
    'mayuree':  'พี่แก้วโมรา ชุมชนสัมพันธ์มีเรื่องอะไรที่ต้องเข้าไปดูไหม?',
    'savanee':  'พี่สวนีย์ วังชิ้นวันนี้มีอะไรต้องประสานไหม? สวน R2D2 หรือเหมือง?',
    'pairat':   'พี่ไพรัตน์ field ที่วังชิ้นวันนี้เป็นยังไง? สวรหรือเหมือง?',
    'supakorn': 'พี่เอ็ม security report วันนี้มีเหตุอะไรหรือเปล่า?',
    'son':      'พี่สน มวลชนวันนี้มีเรื่องอะไรเข้ามาไหม? กิจกรรมท้องถิ่นที่กำลังมา?',
    'ari':      'พี่อริศรา 7-11 แพร่วันนี้เป็นยังไง? มีสาขาไหนต้องไปเยี่ยมไหม? สินค้า G2G ตัวไหนที่ขายดี/ขายช้า?',
    'principal':'เรียนท่านประธาน · สรุปสถานะบริษัทล่าสุด: 24 พนักงาน active · 5 BUs ดำเนินงาน · Memory v3 dreaming worker รัน 03:00 BKK · มีคำถามด้านใดเป็นพิเศษไหมครับ? (financial · operations · strategy · governance)'
  };

  function getProactiveCheckin(slug) {
    return PROACTIVE_CHECKINS[slug] || 'งานวันนี้เป็นยังไง? มีอะไรให้ผมช่วยไหม?';
  }

  // Initialize font size from localStorage
  (function initFontSize() {
    const saved = localStorage.getItem(FS_KEY) || 'fs-md';
    if (FS_LEVELS.includes(saved)) document.documentElement.classList.add(saved);
  })();

  return {
    api, apiPost,
    getUser, setUser, getToken, setToken, logout, requireAuth,
    startLineLogin, handleLineCallback, loginWithPin, loginDemo,
    renderSidebar, renderTopbar, boot,
    loadTab, loadDashboard, renderTable, escapeHtml,
    // Font + Voice
    applyFontSize, bumpFontSize, getVoiceSpeed, setVoiceSpeed,
    speak, stopSpeak, installTools, playExplainer,
    // Workboard
    wbAuth, wbStaffList, wbListPool, wbListMine, wbListShowcase,
    wbClaim, wbRelease, wbComplete, wbUpdate, wbCreate, wbChangePin,
    wbSetColor, wbCustomerSend, wbCustomerList, wbTutorAsk, getProactiveCheckin,
    tokenBalance, tokenLedger, horoscopeDaily, mobileCommand,
    academicAdd, academicList, academicSearch, academicSynthesis,
    liffPersonalGet, liffPersonalSet, liffGroupGet, liffGroupSet,
    $, $$, el, NAV, ICONS,
    // Multi-language
    toggleLang, applyLang,
    // Apps Script helpers (also aliased for convenience)
    apiGet: api,
    APPS_SCRIPT, LINE_LOGIN_CHANNEL
  };
})();
