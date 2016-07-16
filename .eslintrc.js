module.exports = {
  root   : true,
  extends: "eslint:recommended",
  env    : {
    amd     : true,
    commonjs: true
  },
  rules  : {
    "no-unused-vars": 0,
    "quote-props"   : [2, "as-needed", {keywords: true}]
  },
  globals : {
    "casper" : true
  }
};
