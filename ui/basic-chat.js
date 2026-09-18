const $ = (id) => document.getElementById(id);
let sending = false;
let state = { ready: false, history: [], jobs: [], status: 'Loading…' };
let viewMode = 'essentials';

const VIEW_MODES = new Set(['simple', 'essentials', 'tech']);

const STATUS_LABELS = Object.freeze({
  READY: 'Ready',
  WORKING: 'Working',
  VERIFYING: 'Checking the result',
  COMPLETE: 'Finished — completion check passed',
  BLOCKED: 'Needs attention — work was not marked complete',
  PAUSED: 'Paused — no new actions will start',
  NEEDS_ATTENTION: 'Needs attention',
});

const JOB_STATUS_LABELS = Object.freeze({
  queued: 'Queued', claimed: 'Claimed', working: 'Working',
  verification: 'Checking result', completed: 'Execution completed', escalated: 'Escalated — needs attention',
  verifying: 'Checking result', complete: 'Execution completed', failed: 'Failed', blocked: 'Needs attention', cancelled: 'Cancelled', unknown: 'Unable to confirm',
});

const ERROR_PRESENTATION = Object.freeze([
  ['CHAT_PAUSED', 'AgentOS is paused. Resume before sending new work.'],
  ['CHAT_STOPPED', 'AgentOS is not accepting new work because Stop was requested. Restart the local host before sending another job.'],
  ['LOCAL_WAKE_REQUIRES_SCHEDULER_DISABLED', 'Turn off scheduled checks before using this local chat.'],
  ['Basic Chat needs scheduled checks turned off before starting.', 'Turn off scheduled checks before using this local chat.'],
  ['MESSAGE_TOO_LONG', 'That message is too long for this local chat. Shorten it and try again.'],
  ['REQUEST_TOO_LARGE', 'That request is too large for this local chat. Shorten it and try again.'],
]);

function applyViewMode(nextMode) {
  viewMode = VIEW_MODES.has(nextMode) ? nextMode : 'essentials';
  document.documentElement.dataset.viewMode = viewMode;
  for (const input of document.querySelectorAll('input[name="view-mode"]')) input.checked = input.value === viewMode;
}

function statusLabel() {
  if (sending) return 'Working';
  if (state.stopped) return 'Stop requested — no new actions will start; the current action may still finish';
  if (state.paused) return 'Paused — no new actions will start';
  return STATUS_LABELS[state.status] ?? 'Unable to confirm status';
}

function evidencePresentation() {
  const task = state.lastTaskId || null;
  if (!task) return { result: 'No completed job to summarize yet.', completion: state.status === 'VERIFYING' ? 'Checking the result' : 'Not checked', task: 'Task: none' };
  const evidence = state.evidence;
  if (!evidence || evidence.taskId !== task || evidence.evidenceAvailable !== true) return { result: 'AgentOS cannot confirm matching evidence for this job from the canonical local record.', completion: 'Unable to confirm', task: `Task: ${task}` };
  if (evidence.completionStatus === 'COMPLETED' && evidence.greenDisposition === 'pass') return { result: 'The bounded local job finished and its required completion check passed.', completion: 'Passed for this job', task: `Task: ${task}` };
  if (evidence.completionStatus === 'AWAITING_GREEN') return { result: 'The bounded local job finished execution and its completion check is still pending.', completion: 'Checking the result', task: `Task: ${task}` };
  if (evidence.completionStatus === 'INCOMPLETE' || evidence.completionStatus === 'GREEN_BLOCKED' || evidence.greenDisposition === 'fail' || evidence.greenDisposition === 'blocked') return { result: 'This job needs attention and was not presented as complete.', completion: 'Did not establish completion', task: `Task: ${task}` };
  return { result: 'AgentOS cannot confirm the completion evidence for this job from the current canonical record.', completion: 'Unable to confirm', task: `Task: ${task}` };
}

function presentError(error) {
  const technical = error?.message ?? String(error ?? 'Unknown error');
  const matched = ERROR_PRESENTATION.find(([needle]) => technical.includes(needle));
  return { message: matched?.[1] ?? 'AgentOS could not confirm what happened. Review the technical details before retrying.', technical };
}
function clearError() { $('error').textContent = ''; const details = $('error-details'); const technical = $('error-technical'); if (technical) technical.textContent = ''; if (details) { details.hidden = true; details.open = false; } }
function showError(error) { const presented = presentError(error); $('error').textContent = presented.message; const details = $('error-details'); const technical = $('error-technical'); if (technical) technical.textContent = presented.technical; if (details) details.hidden = false; }
async function api(path, body) { const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || res.statusText || 'Request failed'); return data; }

function renderJobs() {
  const list = $('jobs-list');
  if (!list) return;
  list.textContent = '';
  const jobs = Array.isArray(state.jobs) ? state.jobs : [];
  if (!jobs.length) { const empty = document.createElement('p'); empty.textContent = 'No canonical jobs to show yet.'; list.append(empty); return; }
  const ul = document.createElement('ul');
  ul.className = 'jobs-list';
  for (const job of jobs) {
    const li = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = JOB_STATUS_LABELS[job.status] ?? 'Unable to confirm';
    const meta = document.createElement('span');
    meta.className = 'job-meta';
    meta.textContent = viewMode === 'tech' ? `Project ${job.projectId} · Task ${job.taskId} · Mission ${job.missionId}` : `Task ${job.taskId}`;
    li.append(title, meta);
    ul.append(li);
  }
  list.append(ul);
}

function render() {
  const hist = $('history'); hist.textContent = '';
  if (!state.history?.length) hist.textContent = 'Your conversation will appear here and survive a restart.';
  else { for (const message of state.history) { const item = document.createElement('article'); const who = document.createElement('strong'); who.textContent = message.role === 'user' ? 'You' : 'AgentOS'; const text = document.createElement('p'); text.textContent = message.text; item.append(who, text); hist.append(item); } hist.scrollTop = hist.scrollHeight; }
  $('status').textContent = `Status: ${statusLabel()}`;
  renderJobs();
  const evidence = evidencePresentation(); $('evidence-result').textContent = evidence.result; $('completion-check').textContent = evidence.completion; $('independent-assurance').setAttribute('aria-label', 'Independent assurance'); $('independent-assurance').textContent = 'Not shown in Basic Chat'; $('evidence-task').textContent = evidence.task;
  const composer = document.querySelector('.composer-area'); const form = $('chat'); const message = $('message'); const send = $('send');
  if (!composer || !form || !message || !send) { showError(new Error('Composer missing from page — layout defect')); return; }
  composer.hidden = false; form.hidden = false; message.hidden = false;
  composer.setAttribute('aria-busy', sending ? 'true' : 'false');
  form.setAttribute('aria-busy', sending ? 'true' : 'false');
  const blocked = sending || state.paused || state.stopped || !state.ready; send.disabled = blocked; message.disabled = blocked;
  if (blocked && !sending) message.placeholder = state.stopped ? 'Stop requested — restart the local host before sending new work' : state.paused ? 'Paused — Resume to send again' : 'AgentOS is not ready for new work'; else if (!sending) message.placeholder = 'Describe what you want AgentOS to do…';
  const pause = document.querySelector('[data-action="pause"]');
  const resume = document.querySelector('[data-action="resume"]');
  const stop = document.querySelector('[data-action="stop"]');
  const controlsAvailable = Boolean(state.ready || state.paused || state.stopped || sending);
  if (pause) pause.disabled = !controlsAvailable || Boolean(state.paused) || Boolean(state.stopped);
  if (resume) resume.disabled = !controlsAvailable || !Boolean(state.paused) || Boolean(state.stopped);
  if (stop) stop.disabled = !controlsAvailable || Boolean(state.stopped);
}

async function refresh() { const res = await fetch('/api/state'); state = await res.json(); render(); }
for (const input of document.querySelectorAll('input[name="view-mode"]')) input.addEventListener('change', () => { if (input.checked) { applyViewMode(input.value); render(); } });
applyViewMode('essentials');
$('chat').addEventListener('submit', async (event) => { event.preventDefault(); if (sending || state.paused || state.stopped) return; sending = true; clearError(); render(); try { state = await api('/api/send', { text: $('message').value }); $('message').value = ''; } catch (error) { showError(error); await refresh().catch(() => {}); } finally { sending = false; render(); } });
for (const button of document.querySelectorAll('[data-action]')) button.addEventListener('click', async () => { button.disabled = true; clearError(); try { state = await api('/api/control', { action: button.dataset.action }); render(); } catch (error) { showError(error); await refresh().catch(() => {}); } finally { render(); } });
refresh().catch((error) => { showError(error); });
