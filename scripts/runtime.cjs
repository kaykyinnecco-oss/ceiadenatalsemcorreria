const path = require('node:path');
const os = require('node:os');
function dependency(name) {
  try { return require(name); } catch {
    return require(path.join(process.env.CEIA_RUNTIME_MODULES || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'), name));
  }
}
module.exports = { dependency };
