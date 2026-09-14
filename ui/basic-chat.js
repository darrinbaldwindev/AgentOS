const $ = (id) => document.getElementById(id);
let sending = false;
let state = { ready: false, history: [], status: 'Loading…' };

const STATUS_LABELS = Object.freeze({
  READY: 'Ready',
  WORKING: 'Working',
  VERIFYING: 'Checking the result',
  COMPLETE: 'Finished — completion check passed',
  BLOCKED: 'Needs attention — work was not marked complete',
  PAUSED: 'Paused — no new actions will start',
  NEEDS_ATTENTION: 'Needs attention',
});

function statusLabel() {
  if (sending) return 'Working';
  if (state.stopped) return 'Stop requested — no new actions will start; the current action may still finish';
  if (state.paused) return 'Paused — no new actions will start';
  return STATUS_LABELS[state.status] ?? 'Unable to confirm status';
}

async function api(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText || 'Request failed');
  return data;
}

function render() {
  const hist = $('history');
  hist.textContent = '';
  if (!state.history?.length) {
    hist.textContent = 'Your conversation will appear here and survive a restart.';
  } else {
    for (const message of state.history) {
      const item = document.createElement('article');
      const who = document.createElement('strong');
      who.textContent = message.role === 'user' ? 'You' : 'AgentOS';
      const text = document.createElement('p');
      text.textContent = message.text;
      item.append(who, text);
      hist.append(item);
    }
    hist.scrollTop = hist.scrollHeight;
  }
  $('status').textContent = `Status: ${statusLabel()}`;
  const composer = document.querySelector('.composer-area');
  const form = $('chat');
  const message = $('message');
  const send = $('send');
  if (!composer || !form || !message || !send) {
    $('error').textContent = 'Composer missing from page — layout defect';
    return;
  }
  composer.hidden = false;
  form.hidden = false;
  message.hidden = false;
  const blocked = sending || state.paused || state.stopped || !state.ready;
  send.disabled = blocked;
  message.disabled = blocked;
  if (blocked && !sending) {
    message.placeholder = state.stopped
      ? 'Stop requested — restart the local host before sending new work'
      : state.paused
        ? 'Paused — Resume to send again'
        : 'AgentOS is not ready for new work';
  } else if (!sending) {
    message.placeholder = 'Describe what you want AgentOS to do…';
  }
}

async function refresh() {
  const res = await fetch('/api/state');
  state = await res.json();
  render();
}

$('chat').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (sending || state.paused || state.stopped) return;
  sending = true;
  $('error').textContent = '';
  render();
  try {
    state = await api('/api/send', { text: $('message').value });
    $('message').value = '';
  } catch (error) {
    $('error').textContent = error.message;
    await refresh().catch(() => {});
  } finally {
    sending = false;
    render();
  }
});

for (const button of document.querySelectorAll('[data-action]')) {
  button.addEventListener('click', async () => {
    button.disabled = true;
    $('error').textContent = '';
    try {
      state = await api('/api/control', { action: button.dataset.action });
      render();
    } catch (error) {
      $('error').textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
}

refresh().catch((error) => {
  $('error').textContent = error.message;
});
