export function createGitHubTransport({ getFile, putFile, appendFile }) {
  if (typeof getFile !== 'function' || typeof putFile !== 'function' || typeof appendFile !== 'function') {
    throw new Error('getFile, putFile and appendFile are required');
  }

  return {
    async read(path) {
      return getFile(path);
    },

    async write(path, content, { expectedSha = null, fingerprint } = {}) {
      const current = await getFile(path);
      const currentSha = current?.sha ?? null;
      if (expectedSha !== null && currentSha !== expectedSha) {
        return { written: false, reason: 'version_conflict', current };
      }
      const result = await putFile(path, content, { sha: currentSha, fingerprint });
      return { written: true, result, sha: result?.sha ?? result?.content?.sha ?? null };
    },

    async append(path, content) {
      return appendFile(path, content);
    },
  };
}
