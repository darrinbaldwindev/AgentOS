const $ = id => document.getElementById(id);
let sending = false;
let ready = false;
async function api(path, input) {
  const response = await fetch(path, input === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed');
  return result;
}
async function refresh() {
  const state = await api('/api/state');
  ready = state.control.status === 'ready';
  const run = state.runs.at(-1);
  $('status').textContent = `Chat ${state.control.status} · Mission ${run?.status || 'not started'}`;
  $('mission').textContent = run ? `${run.missionId} · ${run.id}` : 'No mission yet';
  $('history').replaceChildren();
  for (const message of state.history) {
    const item = document.createElement('article');
    const who = document.createElement('strong'); who.textContent = message.role === 'user' ? 'You' : 'AgentOS';
    const text = document.createElement('p'); text.textContent = message.text;
    item.append(who, text); $('history').append(item);
  }
  if (!state.history.length) $('history').textContent = 'Your conversation will appear here and survive a restart.';
  $('send').disabled = sending || !ready;
}
$('chat').addEventListener('submit', async event => {
  event.preventDefault(); if (sending || !ready) return;
  sending = true; $('send').disabled = true; $('error').textContent = ''; $('status').textContent = 'Working · one bounded local turn';
  try { await api('/api/send', { text: $('message').value }); $('message').value = ''; }
  catch (error) { $('error').textContent = error.message; }
  finally { sending = false; await refresh().catch(error => { $('error').textContent = error.message; }); }
});
for (const button of document.querySelectorAll('[data-action]')) button.addEventListener('click', async () => {
  button.disabled = true; $('error').textContent = '';
  try { await api('/api/control', { action: button.dataset.action }); await refresh(); }
  catch (error) { $('error').textContent = error.message; }
  finally { button.disabled = false; }
});
refresh().catch(error => { $('error').textContent = error.message; });
