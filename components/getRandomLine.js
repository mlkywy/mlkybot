const fs = require("fs");

const getRandomLine = (filename) => {
  let data = fs.readFileSync(filename, "utf-8");
  let lines = data.split(/\r?\n/);
  return lines[Math.floor(Math.random() * lines.length)];
};

module.exports = getRandomLine;
