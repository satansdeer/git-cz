const {execSync} = require('child_process');
const path = require('path');
const fs = require('fs');

const isLerna = (state) =>
  fs.existsSync(path.join(state.root, 'lerna.json'));

const isDir = (root) => (name) => {
  const filepath = path.join(root, name);

  try {
    const stats = fs.statSync(filepath);

    return stats.isDirectory();
  } catch (error) {
    return false;
  }
};

const getAllPackages = (state) => {
  try {
    const packagesDir = path.join(state.root, 'packages');
    const appsDir = path.join(state.root, 'apps');

    return [
      ...fs.readdirSync(packagesDir).filter(isDir(packagesDir)),
      ...fs.readdirSync(appsDir).filter(isDir(appsDir))
    ];
  } catch (error) {
    return [];
  }
};

const getChangedFiles = () => {
  const devNull = process.platform === 'win32' ? ' nul' : '/dev/null'
  return execSync('git diff --cached --name-only 2>' + devNull)
    .toString()
    .trim()
    .split('\n');
}

const getChangedPackages = () => {
  const unique = {};
  const changedFiles = getChangedFiles();
  const regex = /^(packages|apps)\/([^/]+)\//;

  for (const filename of changedFiles) {
    const matches = filename.match(regex);

    if (matches) {
      unique[matches[2]] = 1;
    }
  }

  return Object.keys(unique);
};

module.exports = {
  getAllPackages,
  getChangedPackages,
  isLerna
};
