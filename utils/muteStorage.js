const fs = require("fs");
const path = require("path");

const muteFile = path.join(__dirname, "../cache/mutes.json");

function ensureFile() {
  if (!fs.existsSync(path.dirname(muteFile))) {
    fs.mkdirSync(path.dirname(muteFile), { recursive: true });
  }
  if (!fs.existsSync(muteFile)) {
    fs.writeFileSync(muteFile, "{}");
  }
}

function loadMutes() {
  ensureFile();
  return JSON.parse(fs.readFileSync(muteFile, "utf8"));
}

function saveMutes(data) {
  ensureFile();
  fs.writeFileSync(muteFile, JSON.stringify(data, null, 2));
}

function deleteMute(userId) {
  const mutes = loadMutes();
  delete mutes[userId];
  saveMutes(mutes);
}

module.exports = { loadMutes, saveMutes, deleteMute };
