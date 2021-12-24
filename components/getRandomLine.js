const fs = require("fs");

const getRandomLine = (filename) => {
  let data = fs.readFileSync(filename, "utf-8");
  let lines = data.split(/\r?\n/);
  return lines[Math.floor(Math.random() * lines.length)];
};

// const getRandomLinePromise = async (filename) => {
//   return new Promise((resolve, reject) => {
//     fs.readFile(filename, "utf-8", (error, data) => {
//       if (error) reject(error);
//       else resolve(data);
//     });
//   });
// };

// const mainFunction = async () => {
//   const lines = await getRandomLinePromise(process.cwd() + "/text/8ball.txt");
//   console.log(lines);
// };

// mainFunction();

module.exports = getRandomLine;
