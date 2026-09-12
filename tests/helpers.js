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

module.exports = { ROOT: ROOT, read: read, exists: exists, attrs: attrs };
