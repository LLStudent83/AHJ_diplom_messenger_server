const combineRouters = require('koa-combine-routers');

const signIn = require('./signIn');

const router = combineRouters(
  signIn,
);
module.exports = router;
