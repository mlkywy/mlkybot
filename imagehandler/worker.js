'use strict';
const { parse } = require('node-html-parser');

function resolveLinks({ data, url, thumbnailSelector }) {
  const links = [];
  for (const page of data) {
    const html = parse(page);
    for (let e of html.querySelectorAll(thumbnailSelector)) {
      const href =
        e.firstChild['_attrs']?.href ?? e.querySelector('a').attributes.href;
      const link = href.startsWith('https://')
        ? href
        : url.slice(0, url.lastIndexOf('/') + 1) + href;
      links.push(link);
    }
  }
  return links;
}

module.exports = resolveLinks;
