const { activities } = require("../config/config.json");

const statuses = ["online", "idle", "dnd"];
// const types = ["WATCHING", "LISTENING", "COMPETING"];
let currentActivityIndex, currentStatusIndex;

const statusRotator = async (Bot) => {
  (currentStatusIndex = 0), (currentActivityIndex = 0);
  await setRandomStatus(Bot).then((res) => {
    return statusRotator(Bot);
  });
};

const setRandomStatus = async (Bot) => {
  await Bot.user.setPresence(randomizeStatus());
  return new Promise((res) => {
    setTimeout(res, 20000);
  });
};

const randomizeStatus = () => {
  currentActivityIndex = Math.floor(Math.random() * activities.length);
  currentStatusIndex = Math.floor(Math.random() * statuses.length);
  // currentTypeIndex = Math.floor(Math.random() * types.length);

  const newPresence = {
    activities: [{ name: activities[currentActivityIndex] }],
    status: statuses[currentStatusIndex],
  };

  return newPresence;
};

module.exports = statusRotator;
