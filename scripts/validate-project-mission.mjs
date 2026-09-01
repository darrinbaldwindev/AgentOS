import { readFile } from 'node:fs/promises';

const file = process.argv[2];
if (!file) throw new Error('mission file path is required');

const required = ['mission_id','issuer','target_repository','project_overseer','objective','scope','priority','created_at','authority_class','required_evidence','status'];
const raw = await readFile(file, 'utf8');
const mission = JSON.parse(raw);
const missing = required.filter((key) => mission[key] === undefined || mission[key] === null || mission[key] === '');
if (missing.length) {
  console.error(JSON.stringify({ ok: false, outcome: 'blocked', reason: 'missing_required_fields', missing }, null, 2));
  process.exit(1);
}
if (mission.status !== 'pending') {
  console.error(JSON.stringify({ ok: false, outcome: 'blocked', reason: 'mission_not_pending', status: mission.status }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, outcome: 'validated', mission_id: mission.mission_id, target_repository: mission.target_repository, authority_class: mission.authority_class }, null, 2));
