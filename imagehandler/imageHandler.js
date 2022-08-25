const { default: axios } = require('axios');
const { parse } = require('node-html-parser');
const sites = require('./sites');

class ImageHandler {
  #options;
  #site;
  #tags;
  #links;
  #index = 0;
  #cached = [];

  count = 0;

  /**
   * @param {{site: ('Gelbooru'|'Danbooru'), wildcard?: boolean, nsfw?: boolean, save?: boolean}} options
   * @returns {ImageHandler} ImageHandler
   */
  constructor(options) {
    this.#options = { ...options };
    this.#options.nsfw = options.nsfw ?? false;
    this.#options.save = options.save ?? false;
    this.#site = sites[options.site];
  }

  async fetch(tags) {
    const wanted = [...tags].join('').trim().replace('/s/g', '_');
    if (this.#tags === wanted && this.#cached.length >= this.#index)
      return this.#cached[this.#index];

    this.#cached = [];
    if (this.#options.wildcard) this.#tags += '_*';

    const tagParam = this.#site.url.endsWith('?') ? 'tags=' : '&tags=';
    const url = this.#site.url + tagParam + this.#tags;
    this.#links = await this.#getAllPagesLinks(url);
    this.count = this.#links.length;
  }

  async next() {}

  #getLinks(data) {
    const html = parse(data);
    const links = [];
    for (let e of html.querySelectorAll(this.#site.imgSelector)) {
      const href = e.firstChild['_attrs'].href;
      const link = href.startsWith('https://')
        ? href
        : this.#site.url.slice(0, this.#site.url.lastIndexOf('/') + 1) + href;
      links.push(link);
    }
    return links;
  }

  async #getPageCount(url) {
    const { data } = await axios.get(url);
    const html = parse(data);
    let paginator = html.querySelectorAll(this.#site.pageSelector);

    return paginator?.length - 2 ?? 1;
  }

  async #getAllPagesLinks(url) {
    const pages = [];
    const allLinks = [];
    const count = await this.#getPageCount(url);

    for (let i = 1; i < count; i++) {
      const pageNum = this.#site.getPageNum(i);
      const pageUrl = url + this.#site.pageEndpoint + pageNum;
      pages.push(axios.get(pageUrl));
    }

    for await (const page of pages) {
      const links = this.#getLinks(page.data);
      allLinks.push(...links);
    }

    return Promise.all(allLinks);
  }
}

module.exports = ImageHandler;
