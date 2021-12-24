const { statuses } = require("../config/config.json");

const presence = ["online", "idle", "dnd"];
const types = ["WATCHING", "LISTENING", "COMPETING"];
let currentStatusIndex, currentPresenceIndex;

const statusRotator = async (Bot) => {
  (currentPresenceIndex = 0), (currentStatusIndex = 0);
  await setRandomStatus(Bot).then((res) => {
    return statusRotator(Bot);
  });
};

const setRandomStatus = async (Bot) => {
  await Bot.user.setPresence(randomizeStatus());
  return new Promise((res) => {
    setTimeout(res, 1000);
  });
};

const randomizeStatus = () => {
  currentStatusIndex = Math.floor(Math.random() * statuses.length);
  currentPresenceIndex = Math.floor(Math.random() * presence.length);
  currentTypeIndex = Math.floor(Math.random() * types.length);

  const newPresence = {
    activities: [
      { name: statuses[currentStatusIndex], type: types[currentTypeIndex] },
    ],
    status: presence[currentPresenceIndex],
  };

  return newPresence;
};

module.exports = statusRotator;
