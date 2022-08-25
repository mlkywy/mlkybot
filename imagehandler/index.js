const ImageHandler = require('./imageHandler');

let safebooru = new ImageHandler({
  site: 'Safebooru',
  nsfw: false,
  save: true,
  wildcard: false,
});

let gelbooru = new ImageHandler({
  site: 'Gelbooru',
  nsfw: false,
  save: false,
  wildcard: true,
});

(async () => {
  // await safebooru.fetch('princess_zelda');
  await gelbooru.fetch('princess_zelda');
})();
