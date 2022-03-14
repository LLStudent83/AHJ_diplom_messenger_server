const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const WS = require('ws');
const cors = require('@koa/cors');
const sign = require('./sign/signApi');
const WebsocketApi = require('./websocket/WebsocketApi');

const app = new Koa();

app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

// eslint-disable-next-line consistent-return
app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    // eslint-disable-next-line no-return-await
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }

    ctx.response.status = 204;
  }
});
// further my code

app.use(cors());
// const messages = [];
// const clients = {};

const port = process.env.PORT || 8080;
const server = http.createServer(app.callback());
const wsServer = new WS.Server({ // создаем сервер ws на базе нашего сервера http
  server,
});
// eslint-disable-next-line no-unused-vars
const websocketApi = new WebsocketApi(wsServer, sign, WS);

server.listen(port);
