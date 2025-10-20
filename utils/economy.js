// utils/economy.js
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../cache/economy.json");

function loadData() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getUser(id) {
  const data = loadData();
  if (!data[id]) {
    data[id] = { wallet: 0, bank: 0, lastDaily: 0 };
    saveData(data);
  }
  return data[id];
}

function updateUser(id, userData) {
  const data = loadData();
  data[id] = userData;
  saveData(data);
}

module.exports = { getUser, updateUser };
