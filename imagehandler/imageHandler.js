const axios = require("axios");
const { parse } = require("node-html-parser");
const sites = require("./sites");
const fs = require("fs-extra");
const path = require("path");
const Piscina = require("piscina");
const uuidv4 = require("uuid").v4;

class ImageHandler {
  #options;
  #site;
  #tags;
  #links;
  #siteName;
  #limit;
  #index = 0;
  #cached = [];

  count = 0;

  get currentIndex() {
    return this.#index + 1;
  }

  /**
   * @param {{site: ('Gelbooru'|'Danbooru'|'Safebooru'), limit?: number, save?: boolean}} options
   * @returns {ImageHandler} ImageHandler
   */
  constructor(options) {
    this.#options = { ...options };
    this.#options.nsfw = options.nsfw ?? false;
    this.#options.save = options.save ?? false;
    this.#siteName = options.site.toLowerCase();
    this.#site = sites[options.site];
    this.#limit = options.limit ?? 20;
  }

  /**
   *
   * @param {string} tags - Tags to search for.
   * @param {boolean} useWildCard - Use wildcard for this search.
   * @returns Image URL
   */
  async fetch(tags, useWildCard = false) {
    const wanted = tags.replace(`/\s/g`, "_");
    if (this.#tags === wanted && this.#cached.length >= this.#index)
      return this.#cached[this.#index];

    this.#tags = wanted;
    this.#cached = [];
    if (useWildCard) this.#tags += "_*";

    const tagParam = this.#site.url.endsWith("?") ? "tags=" : "&tags=";
    const url = this.#site.url + tagParam + this.#tags;
    const links = await this.#getAllPagesLinks(url);
    this.#links = links;
    this.count = links.length;

    await this.#cacheImage(this.#links[this.#index]);
    return this.#getImage();
  }

  #getImage() {
    const img = this.#cached[this.#index];
    return img;
  }

  async #cacheImage(url) {
    const { data } = await axios.get(url);
    const html = parse(data);
    const imageNode = html.querySelector(this.#site.imgSelector);
    const imageUrl = imageNode["_attrs"]?.src ?? imageNode.attributes.src;
    this.#cached.push(imageUrl);
    if (this.#options.save) await this.#saveImage(imageUrl);
  }

  async next() {
    this.#index += 1;
    if (this.#index < this.#cached.length) return this.#cached[this.#index];
    await this.#cacheImage(this.#links[this.#index]);
    return this.#getImage();
  }

  prev() {
    if (this.#index === 0) return;
    this.#index -= 1;
    return this.#getImage();
  }

  async #getLinksMultiThread(data) {
    const piscina = new Piscina({
      filename: path.resolve(__dirname, "worker.js"),
    });

    const url = this.#site.url;
    const thumbnailSelector = this.#site.thumbnailSelector;
    const numberOfChunks = Math.ceil(data.length / 8);

    const chunks = [...Array(numberOfChunks)].map((value, index) =>
      data.slice(index * 8, (index + 1) * 8)
    );

    const workers = [];
    for (let i = 0; i < chunks.length; i++) {
      workers.push(piscina.run({ data: chunks[i], url, thumbnailSelector }));
    }

    const links = await Promise.all([...workers]);

    return links.flat();
  }

  async #getPageCount(url) {
    try {
      const { data } = await axios.get(
        url + this.#site.pageEndpoint + this.#site.getPageNum(this.#limit)
      );
      const html = parse(data);
      let pageNum = 0;

      for (let e of html.querySelectorAll(this.#site.pageSelector)) {
        if (parseInt(e.firstChild.innerText)) {
          pageNum = parseInt(e.firstChild.innerText);
          return pageNum;
        }
      }
    } catch (e) {
      return Promise.reject("Unable to get page count!");
    }
  }

  async #getAllPagesLinks(url) {
    const pages = [];
    const pageCount = await this.#getPageCount(url);

    for (let i = 1; i < pageCount; i++) {
      const pageNum = this.#site.getPageNum(i);
      const pageUrl = url + this.#site.pageEndpoint + pageNum;

      pages.push(axios.get(pageUrl));
    }

    const resolvedRequests = await Promise.all(pages);
    const resolvedPages = resolvedRequests.map((p) => p.data);

    return this.#getLinksMultiThread(resolvedPages);
  }

  async #saveImage(url, dirname = "images") {
    const dir = path.resolve("./", dirname, this.#siteName);
    const pathName = path.join(dir, this.#tags, uuidv4() + ".png");
    fs.ensureDir(path.join(dir, this.#tags)).then(() => {
      axios({
        method: "get",
        url,
        responseType: "stream",
      })
        .then((res) => {
          res.data.pipe(fs.createWriteStream(pathName));
        })
        .catch((err) => Promise.reject(err));
    });
  }
}

module.exports = ImageHandler;
