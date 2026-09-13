var fs = require('node:fs');
var path = require('node:path');

var ROOT = path.join(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

/* Returns one object per <tag ...> with its double-quoted attributes. */
function attrs(html, tag) {
  var out = [], re = new RegExp('<' + tag + '\\b([^>]*)>', 'gi'), m;
  while ((m = re.exec(html))) {
    var o = {}, a, ar = /([\w:-]+)="([^"]*)"/g;
    while ((a = ar.exec(m[1]))) o[a[1].toLowerCase()] = a[2];
    out.push(o);
  }
  return out;
}

/* Returns the full <article ...>…</article> markup (not just its attributes)
   for the article whose opening tag contains needle, e.g. 'data-plan="keep"'. */
function articleBlock(html, needle) {
  var re = /<article\b[^>]*>[\s\S]*?<\/article>/g, m;
  while ((m = re.exec(html))) {
    var open = m[0].slice(0, m[0].indexOf('>') + 1);
    if (open.indexOf(needle) !== -1) return m[0];
  }
  return null;
}

module.exports = { ROOT: ROOT, read: read, exists: exists, attrs: attrs, articleBlock: articleBlock };
