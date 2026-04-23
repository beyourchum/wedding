const FORM = {
  url: 'https://docs.google.com/forms/d/e/1FAIpQLSdlxZuThkPHJhaAO8ZQf0bejq_VZd6GTiw_jdKNKGyl0HPM4g/formResponse',
  fields: {
    name:   'entry.1357166799',
    attend: 'entry.1167612043',
    msg:    'entry.1741352301',
  },
  values: { yes: '我會到！', no: '線上祝福' },
};
const ERROR_RESET_MS = 1500;

let rsvpSubmitted = false;

function openEnv() {
  const flap = document.getElementById('topFlap');
  let swapped = false;

  function swapScenes() {
    if (swapped) return;
    swapped = true;
    document.getElementById('envelopeScene').style.display = 'none';
    document.getElementById('cardScene').style.display = 'flex';
    window.scrollTo(0, 0);
  }

  flap.addEventListener('transitionend', swapScenes, {once: true});
  flap.style.transform = 'rotateX(180deg)';
  setTimeout(swapScenes, 700);
}

function validateForm() {
  const nameEl = document.getElementById('guestName');
  const name = nameEl.value.trim().slice(0, 40);
  if (!name) {
    nameEl.classList.add('inp--error');
    nameEl.setAttribute('aria-invalid', 'true');
    nameEl.focus();
    setTimeout(() => {
      nameEl.classList.remove('inp--error');
      nameEl.removeAttribute('aria-invalid');
    }, ERROR_RESET_MS);
    return null;
  }

  const sel = document.querySelector('input[name="attend"]:checked');
  if (!sel) {
    const ag = document.querySelector('.attend-grid');
    ag.classList.add('attend-grid--error');
    setTimeout(() => ag.classList.remove('attend-grid--error'), ERROR_RESET_MS);
    return null;
  }

  const msg = document.getElementById('guestMsg').value.trim().slice(0, 500);
  const yes = sel.value === 'yes';
  return { name, yes, attendVal: yes ? FORM.values.yes : FORM.values.no, msg };
}

function showSuccess({ name, yes, msg }) {
  document.getElementById('rsvpForm').style.display = 'none';
  document.getElementById('successBox').style.display = 'block';
  document.getElementById('sTitle').textContent = yes
    ? `${name}，我們等你！`
    : `${name} 的回覆收到了`;
  document.getElementById('sText').textContent = yes
    ? `太好了！期待 5/20 與你相見，一起見證這個時刻。${msg ? '\n\n「' + msg + '」' : ''}`
    : `謝謝你的回覆！雖然這次無法到場，心意我們都收到了。${msg ? '\n\n「' + msg + '」' : ''}`;
  setTimeout(() => { document.getElementById('expFill').style.width = '100%'; }, 300);
}

// ── CATCH THE BOUQUET MINI GAME ─────────────────────────────

let _gRaf = null;
let _gKeys = null;   // live key state
let _gCleanup = null; // fn to remove event listeners

function startGame() {
  document.getElementById('gameOverlay').classList.add('active');
  _runGame();
}

function skipGame() {
  _endGame();
}

function _endGame() {
  document.getElementById('gameOverlay').classList.remove('active');
  if (_gRaf) { cancelAnimationFrame(_gRaf); _gRaf = null; }
  if (_gCleanup) { _gCleanup(); _gCleanup = null; }
}

function _runGame() {
  const canvas = document.getElementById('gameCanvas');
  const W = Math.min(400, window.innerWidth - 32);
  const H = 300;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const T = 16; // tile size px
  const GAME_FRAMES = 30 * 60; // 30-second game

  // ── player: pixel bride
  const player = { x: W / 2 - T * 2, y: H - T * 6, w: T * 4, h: T * 5, spd: 4 };

  // ── bouquet factory — speed ramps up with score and time
  function newBouquet(score, frame) {
    return {
      x: T + Math.random() * (W - T * 5),
      y: -T * 3,
      w: T * 3, h: T * 3,
      vy: 2 + score * 0.35 + (frame / GAME_FRAMES) * 4
    };
  }

  // ── game state
  const keys = { l: false, r: false };
  _gKeys = keys;
  let catchCount = 0, lastCatchFrame = -100, frame = 0;
  let gameOver = false, gameOverFrames = 0;
  let bouquet = newBouquet(0, 0);
  let particles = [];

  // ── input: keyboard
  function onKD(e) {
    if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') keys.l = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.r = true;
  }
  function onKU(e) {
    if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') keys.l = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.r = false;
  }

  // ── input: touch (tap/drag left-half = left, right-half = right)
  function getCanvasX(touch) {
    return touch.clientX - canvas.getBoundingClientRect().left;
  }
  function onTS(e) {
    const tx = getCanvasX(e.touches[0]);
    keys.l = tx < W / 2; keys.r = !keys.l;
  }
  function onTM(e) {
    const tx = getCanvasX(e.touches[0]);
    keys.l = tx < W / 2; keys.r = !keys.l;
  }
  function onTE() { keys.l = false; keys.r = false; }

  document.addEventListener('keydown', onKD);
  document.addEventListener('keyup',   onKU);
  canvas.addEventListener('touchstart', onTS, { passive: true });
  canvas.addEventListener('touchmove',  onTM, { passive: true });
  canvas.addEventListener('touchend',   onTE);

  _gCleanup = () => {
    document.removeEventListener('keydown', onKD);
    document.removeEventListener('keyup',   onKU);
    canvas.removeEventListener('touchstart', onTS);
    canvas.removeEventListener('touchmove',  onTM);
    canvas.removeEventListener('touchend',   onTE);
  };

  // ── particle burst on catch
  function burst(cx, cy) {
    const palette = ['#f9a8c9','#a8d8f0','#7dd87d','#fff9f0','#e8659a','white'];
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd   = 2 + Math.random() * 6;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 4,
        life: 1,
        color: palette[i % palette.length],
        sz: (Math.floor(Math.random() * 3) + 1) * 4
      });
    }
  }

  // ── pixel rect shorthand
  const px = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };

  // ── draw pixel bride
  function drawPlayer(p) {
    const justCaught = frame - lastCatchFrame < 40;
    const bob = justCaught ? 0 : (Math.floor(frame / 8) % 2) * 2;
    const x = Math.round(p.x), y = Math.round(p.y) + bob;

    // veil / hair
    px(x + T,     y - T * .5, T * 2,  T * .5,  'white');
    px(x + T * .5, y,          T * 3,  T * .5,  'white');
    px(x + T,     y,           T * 2,  T * .5,  '#e8659a');
    // head
    px(x + T,     y + T * .5,  T * 2,  T * 1.5, '#FFCBA4');
    // eyes
    px(x + T * 1.3, y + T,      4, 4, '#1a0d1a');
    px(x + T * 2,   y + T,      4, 4, '#1a0d1a');
    // smile when recently caught
    if (justCaught) {
      px(x + T * 1.3, y + T * 1.6, 4, 3, '#c94080');
      px(x + T * 1.7, y + T * 1.6, 4, 3, '#c94080');
    }
    // dress body
    px(x + T * .75, y + T * 2,   T * 2.5, T * 1.5, '#f9a8c9');
    // dress detail stripe
    px(x + T * 1.1, y + T * 2.3, T * 1.8, T * .5,  '#fff9f0');
    // dress skirt (wider)
    px(x,           y + T * 3.5, T * 4,   T * 1.5, '#f9a8c9');
    // arms: raised briefly after catch, hanging otherwise
    if (justCaught) {
      px(x - T * .25, y + T,      T * .75, T * 2,   '#FFCBA4');
      px(x + T * 3.5, y + T,      T * .75, T * 2,   '#FFCBA4');
    } else {
      px(x,           y + T * 2.25, T * .75, T,      '#FFCBA4');
      px(x + T * 3.25, y + T * 2.25, T * .75, T,    '#FFCBA4');
    }
    // shoes
    px(x + T * .75, y + T * 5,   T,       T * .5,  '#1a0d1a');
    px(x + T * 2.25, y + T * 5,  T,       T * .5,  '#1a0d1a');
  }

  // ── draw pixel bouquet
  function drawBouquet(b) {
    const wobble = Math.sin(frame * 0.12) * 3;
    const x = Math.round(b.x + wobble), y = Math.round(b.y);
    // stems
    px(x + T * .75, y + T * 1.5, T * .5, T * 1.5, '#4a8c4a');
    px(x + T * 1.5, y + T * 1.25, T * .5, T * 1.75, '#4a8c4a');
    // ribbon
    px(x + T * .5, y + T * 1.5, T * 2, T * .5, '#a8d8f0');
    // 3 blooms
    const blooms = [[x, y + T * .5], [x + T, y], [x + T * 1.75, y + T * .5]];
    const petals = ['#f9a8c9', 'white', '#f9a8c9'];
    blooms.forEach(([bx, by], i) => {
      px(bx,     by,     T,     T,     petals[i]);
      px(bx + 4, by + 4, T - 8, T - 8, '#f5e6c8'); // center
    });
    // leaves
    px(x - T * .5,  y + T, T,     T * .75, '#7dd87d');
    px(x + T * 2.5, y + T, T,     T * .75, '#7dd87d');
  }

  // ── draw checkered ground strip
  function drawGround() {
    for (let gx = 0; gx < W; gx += T) {
      ctx.fillStyle = Math.floor(gx / T) % 2 === 0 ? '#3aaa3a' : '#7dd87d';
      ctx.fillRect(gx, H - T, T, T);
    }
  }

  // ── score/rank helper
  function scoreRank(n) {
    if (n >= 30) return { rank: 'S', title: '新人御用接球手', color: '#ffe566', msg: '花球全數接住！幸福滿分！' };
    if (n >= 25) return { rank: 'A', title: '首席伴娘認可',   color: '#a8f0a8', msg: '婚禮達人！新人超感謝！' };
    if (n >= 20)  return { rank: 'B', title: '婚禮嘉賓等級',   color: '#f9a8c9', msg: '接得不錯！幸福有接到！' };
    if (n >= 15)  return { rank: 'C', title: '花童加油',       color: '#a8d8f0', msg: '再練練，下次接給新人看！' };
    return             { rank: 'D', title: '遲到賓客',        color: '#888',    msg: '花球跑掉了，趕快追！' };
  }

  // ── main loop
  function loop() {
    frame++;
    const remaining = Math.max(0, GAME_FRAMES - frame);

    // ── game-over screen
    if (gameOver) {
      gameOverFrames++;
      ctx.fillStyle = '#1a0d1a';
      ctx.fillRect(0, 0, W, H);

      const { rank, title, color, msg } = scoreRank(catchCount);
      ctx.textAlign = 'center';

      ctx.font = `9px 'Press Start 2P', monospace`;
      ctx.fillStyle = '#f9a8c9';
      ctx.fillText('── RESULT ──', W / 2, H * 0.14);

      ctx.font = `56px 'Press Start 2P', monospace`;
      ctx.fillStyle = color;
      ctx.fillText(rank, W / 2, H * 0.47);

      ctx.font = `16px 'DotGothic16', monospace`;
      ctx.fillStyle = color;
      ctx.fillText(title, W / 2, H * 0.60);

      ctx.font = `9px 'Press Start 2P', monospace`;
      ctx.fillStyle = 'white';
      ctx.fillText(`CAUGHT  ${catchCount}`, W / 2, H * 0.74);

      ctx.font = `16px 'DotGothic16', monospace`;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(msg, W / 2, H * 0.88);

      // auto-close after ~5s
      if (gameOverFrames >= 300) { _endGame(); return; }
      _gRaf = requestAnimationFrame(loop);
      return;
    }

    // ── normal play
    // clear
    ctx.fillStyle = '#1a0d1a';
    ctx.fillRect(0, 0, W, H);
    // bg grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += T) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for (let gy = 0; gy < H; gy += T) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
    drawGround();

    // move player
    if (keys.l) player.x = Math.max(0, player.x - player.spd);
    if (keys.r) player.x = Math.min(W - player.w, player.x + player.spd);

    // drop bouquet
    bouquet.y += bouquet.vy;

    // collision — generous hitbox (top half of player)
    const hx = player.x + T * 0.5, hw = player.w - T;
    const hy = player.y, hh = player.h * 0.55;
    if (bouquet.x < hx + hw && bouquet.x + bouquet.w > hx &&
        bouquet.y + bouquet.h > hy && bouquet.y < hy + hh) {
      catchCount++;
      lastCatchFrame = frame;
      burst(bouquet.x + bouquet.w / 2, bouquet.y + bouquet.h / 2);
      bouquet = newBouquet(catchCount, frame);
    }

    // missed — respawn
    if (bouquet.y > H) {
      bouquet = newBouquet(catchCount, frame);
    }

    // particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.life -= 0.022;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.sz, p.sz);
    });
    ctx.globalAlpha = 1;

    drawBouquet(bouquet);
    drawPlayer(player);

    // mobile tap-side arrows (first 2 s)
    if (frame < 120) {
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.font = `${T}px 'Press Start 2P', monospace`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('◀', 8, H / 2);
      ctx.textAlign = 'right';
      ctx.fillText('▶', W - 8, H / 2);
    }

    // HUD — score top-left, timer bar top-right
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `6px 'Press Start 2P', monospace`;
    ctx.fillStyle = '#f9a8c9';
    ctx.fillText(`★ ${catchCount}`, 6, 6);

    // timer bar
    const barW = 80, barH = 6, barX = W - barW - 6, barY = 6;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(barX, barY, barW, barH);
    const pct = remaining / GAME_FRAMES;
    ctx.fillStyle = pct > 0.4 ? '#7dd87d' : pct > 0.15 ? '#ffe566' : '#e8659a';
    ctx.fillRect(barX, barY, Math.round(barW * pct), barH);

    // brief "CAUGHT!" flash
    if (frame - lastCatchFrame < 30) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `7px 'Press Start 2P', monospace`;
      ctx.fillStyle = 'white';
      ctx.fillText('✦ CAUGHT! ✦', W / 2, H / 3);
    }

    ctx.textBaseline = 'alphabetic';

    if (remaining === 0) { gameOver = true; }

    _gRaf = requestAnimationFrame(loop);
  }

  _gRaf = requestAnimationFrame(loop);
}

// ── RSVP ──────────────────────────────────────────────────

function doRSVP() {
  if (rsvpSubmitted) return;
  const data = validateForm();
  if (!data) return;
  rsvpSubmitted = true;

  const body = new URLSearchParams();
  body.set(FORM.fields.name, data.name);
  body.set(FORM.fields.attend, data.attendVal);
  if (data.msg) body.set(FORM.fields.msg, data.msg);

  fetch(FORM.url, {method: 'POST', mode: 'no-cors', body})
    .then(() => showSuccess(data))
    .catch(() => {
      rsvpSubmitted = false;
      alert('網路連線有問題，請再試一次');
    });
}
