const { LocalStorage } = require("node-localStorage");

const ss = new LocalStorage('./test')
ss.getItem('qwe')