const sites = require('./sites.json');

class Site {
  constructor(options) {
    this.url = options.url;
    this.imgSelector = options.imgSelector;
    this.pageSelector = options.pageSelector;
    this.pageEndpoint = options.pageEndpoint;
    this.getPageNum = (p) => (p === 1 ? 0 : p * options.pageMultiplier);
  }
}

module.exports['Gelbooru'] = new Site(sites['Gelbooru']);
module.exports['Danbooru'] = new Site(sites['Danbooru']);
module.exports['Safebooru'] = new Site(sites['Safebooru']);
