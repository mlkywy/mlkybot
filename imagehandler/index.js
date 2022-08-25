const ImageHandler = require('./imageHandler');

let handler = new ImageHandler({
  site: 'Safebooru',
  nsfw: false,
  save: false,
  wildcard: true,
});

console.log(handler);

handler.fetch('zelda');
