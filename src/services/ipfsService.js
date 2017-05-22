const ipfs = require('../helpers/ipfs');
const concat = require('concat-stream')
const through = require('through2');

function add(string) {
  return ipfs.files.addAsync(string);
}

async function get(hash) {
  const stream = await ipfs.getAsync(hash);
  let files = []
  return new Promise((resolve, _reject) => {
    stream.pipe(through.obj((file, enc, next) => {
      file.content.pipe(concat((content) => {
        files.push({
          path: file.path,
          content: content
        });
        next();
      }))
    }, () => {
      resolve(files.map( f => {
        return {
          path: f.path,
          content: f.content.toString()
        }
      }));
    }))
  });
}

function ls(hash) {
  return ipfs.lsAsync(hash);
}

module.exports.add = add;
module.exports.get = get;
module.exports.ls = ls;
