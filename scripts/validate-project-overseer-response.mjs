import fs from 'node:fs';

const schema = JSON.parse(fs.readFileSync(new URL('../schemas/project-overseer-response-v1.json', import.meta.url), 'utf8'));

export function validateProjectOverseerResponse(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { valid: false, errors: ['response must be an object'] };
  const errors = [];
  for (const key of schema.required) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) errors.push(`missing required field: ${key}`);
  }
  if (typeof value.status === 'string' && !schema.properties.status.enum.includes(value.status)) {
    errors.push(`invalid status: ${value.status}`);
  }
  if (typeof value.mission_id !== 'string' || !value.mission_id) errors.push('mission_id must be a non-empty string');
  if (typeof value.repository_commit !== 'string' || value.repository_commit.length < 7) errors.push('repository_commit must be at least 7 characters');
  return { valid: errors.length === 0, errors };
}

if (process.argv[1] && process.argv[1].endsWith('validate-project-overseer-response.mjs')) {
  const input = process.argv[2];
  if (!input) {
    console.error('usage: node scripts/validate-project-overseer-response.mjs <response.json>');
    process.exit(2);
  }
  const result = validateProjectOverseerResponse(JSON.parse(fs.readFileSync(input, 'utf8')));
  console.log(JSON.stringify(result));
  process.exit(result.valid ? 0 : 1);
}
