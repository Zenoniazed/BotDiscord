// const { Client, GatewayIntentBits, Collection } = require('discord.js');
// const fs = require('fs');
// const path = require('path');
// require('dotenv').config();

// const client = new Client({
//   intents: [
//     GatewayIntentBits.Guilds,
//     GatewayIntentBits.GuildMessages,
//     GatewayIntentBits.MessageContent,
//     GatewayIntentBits.GuildMembers,
//     GatewayIntentBits.GuildMessageReactions
//   ],
// });

// // === Hàm duyệt tất cả file .js trong folder (đệ quy) ===
// function getAllCommandFiles(dir, ext = ".js") {
//   let results = [];

//   fs.readdirSync(dir).forEach(file => {
//     const filePath = path.join(dir, file);
//     const stat = fs.statSync(filePath);

//     if (stat.isDirectory()) {
//       results = results.concat(getAllCommandFiles(filePath, ext));
//     } else if (file.endsWith(ext)) {
//       results.push(filePath);
//     }
//   });

//   return results;
// }

// // === Prefix Commands ===
// client.prefixCommands = new Collection();
// const prefixPath = path.join(__dirname, 'commands/prefix');
// if (fs.existsSync(prefixPath)) {
//   const prefixFiles = getAllCommandFiles(prefixPath);
//   for (const file of prefixFiles) {
//     const command = require(file);
//     client.prefixCommands.set(command.name, command);
//   }
// }

// // === Slash Commands ===
// client.slashCommands = new Collection();
// const slashPath = path.join(__dirname, 'commands/slash');
// if (fs.existsSync(slashPath)) {
//   const slashFiles = getAllCommandFiles(slashPath);
//   for (const file of slashFiles) {
//     const command = require(file);
//     client.slashCommands.set(command.data.name, command);
//   }
// }

// // === Events ===
// const eventsPath = path.join(__dirname, 'events');
// if (fs.existsSync(eventsPath)) {
//   const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
//   for (const file of eventFiles) {
//     const event = require(`${eventsPath}/${file}`);
//     if (event.once) {
//       client.once(event.name, (...args) => event.execute(...args, client));
//     } else {
//       client.on(event.name, (...args) => event.execute(...args, client));
//     }
//   }
// }

// client.login(process.env.TOKEN);

// // Load config
// const config = require("./config");
// client.config = config;



// === Import core modules ===
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// === Xác định đường dẫn gốc ===
// Khi chạy bằng pkg (.exe) -> dùng process.execPath
// Khi chạy bằng Node.js -> dùng __dirname
const basePath = process.pkg ? path.dirname(process.execPath) : __dirname;

// === Khởi tạo Discord Client ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
});

// === Hàm duyệt đệ quy lấy tất cả file .js trong thư mục ===
function getAllCommandFiles(dir, ext = ".js") {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(getAllCommandFiles(filePath, ext));
    } else if (file.endsWith(ext)) {
      results.push(filePath);
    }
  });

  return results;
}

// === Load Prefix Commands ===
client.prefixCommands = new Collection();
const prefixPath = path.join(basePath, 'commands/prefix');
if (fs.existsSync(prefixPath)) {
  const prefixFiles = getAllCommandFiles(prefixPath);
  for (const file of prefixFiles) {
    const command = require(file);
    client.prefixCommands.set(command.name, command);
  }
  console.log(`✅ Loaded ${client.prefixCommands.size} prefix commands`);
}

// === Load Slash Commands ===
client.slashCommands = new Collection();
const slashPath = path.join(basePath, 'commands/slash');
if (fs.existsSync(slashPath)) {
  const slashFiles = getAllCommandFiles(slashPath);
  for (const file of slashFiles) {
    const command = require(file);
    client.slashCommands.set(command.data.name, command);
  }
  console.log(`✅ Loaded ${client.slashCommands.size} slash commands`);
}

// === Load Events ===
const eventsPath = path.join(basePath, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
  console.log(`✅ Loaded ${eventFiles.length} events`);
}

// === Load Config ===
try {
  const config = require(path.join(basePath, 'config.js'));
  client.config = config;
  console.log("✅ Config loaded");
} catch {
  console.warn("⚠️ Không tìm thấy file config.js");
}

// === Login Discord Bot ===
const token = process.env.TOKEN;
if (!token) {
  console.error("❌ Lỗi: Không tìm thấy biến TOKEN trong .env");
  process.exit(1);
}

client.login(token)
  .then(() => console.log("🤖 Bot đang khởi động..."))
  .catch(err => console.error("❌ Lỗi khi đăng nhập bot:", err));
