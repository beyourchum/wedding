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
