const { LocalStorage } = require('node-localstorage');

class UbtPlugin {
  apply(compiler) {
    compiler.hooks.shutdown.tap('UbtPlugin', (compilation) => {
       const localStorage = new LocalStorage('./scratch');
        localStorage.clear()
    });
  }
}

module.exports = UbtPlugin;

