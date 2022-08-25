const axios = require('axios');
const { parse } = require('node-html-parser');
const sites = require('./sites');
const fs = require('fs-extra');
const path = require('path');
const uuidv4 = require('uuid').v4;

class ImageHandler {
  #options;
  #site;
  #tags;
  #links;
  #siteName;
  #index = 0;
  #cached = [];

  count = 0;
  current = `${this.#index}/${this.count}`;

  /**
   * @param {{site: ('Gelbooru'|'Danbooru'), wildcard?: boolean, save?: boolean}} options
   * @returns {ImageHandler} ImageHandler
   */
  constructor(options) {
    this.#options = { ...options };
    this.#options.nsfw = options.nsfw ?? false;
    this.#options.save = options.save ?? false;
    this.#siteName = options.site.toLowerCase();
    this.#site = sites[options.site];
  }

  async fetch(tags) {
    const wanted = tags.replace(`/\s/g`, '_');
    if (this.#tags === wanted && this.#cached.length >= this.#index)
      return this.#cached[this.#index];

    this.#tags = wanted;
    this.#cached = [];
    if (this.#options.wildcard) this.#tags += '_*';

    const tagParam = this.#site.url.endsWith('?') ? 'tags=' : '&tags=';
    const url = this.#site.url + tagParam + this.#tags;
    const links = await this.#getAllPagesLinks(url);
    this.#links = links;
    this.count = links.length;

    await this.#cacheImage(this.#links[this.#index]);
    return this.getImage();
  }

  getImage() {
    const img = this.#cached[this.#index];
    return img;
  }

  async #cacheImage(url) {
    const { data } = await axios.get(url);
    const html = parse(data);
    const imageNode = html.querySelector(this.#site.imgSelector);
    const imageUrl = imageNode['_attrs']?.src ?? imageNode.attributes.src;
    this.#cached.push(imageUrl);
    if (this.#options.save) await this.saveImage(imageUrl);
  }

  async next() {
    this.#index += 1;
    await this.#cacheImage(this.#links[this.#index]);
    return this.getImage();
  }

  prev() {
    if (this.#index === 0) return;
    this.#index -= 1;
    return this.getImage();
  }

  #getLinks(data) {
    const html = parse(data);
    const links = [];
    for (let e of html.querySelectorAll(this.#site.thumbnailSelector)) {
      const href =
        e.firstChild['_attrs']?.href ?? e.querySelector('a').attributes.href;
      const link = href.startsWith('https://')
        ? href
        : this.#site.url.slice(0, this.#site.url.lastIndexOf('/') + 1) + href;
      links.push(link);
    }
    return links;
  }

  async #getPageCount(url) {
    try {
      const { data } = await axios.get(url);
      const html = parse(data);
      let paginator = html.querySelectorAll(this.#site.pageSelector);
      return paginator?.length > 8 ? paginator.length - 2 : paginator.length;
    } catch (e) {
      return Promise.reject('Unable to get page count!');
    }
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

  async saveImage(url, dirname = 'images') {
    const dir = path.resolve('./', dirname, this.#siteName);
    const pathName = path.join(dir, this.#tags, uuidv4() + '.png');
    fs.ensureDir(path.join(dir, this.#tags)).then(() => {
      axios({
        method: 'get',
        url,
        responseType: 'stream',
      })
        .then((res) => {
          res.data.pipe(fs.createWriteStream(pathName));
        })
        .catch((err) => Promise.reject(err));
    });
  }
}

module.exports = ImageHandler;
