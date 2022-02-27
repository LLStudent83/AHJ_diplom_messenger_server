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

// // подписываемся на событе 'connection', сработает когда произошло соединение
// wsServer.on('connection', (ws) => {
//   // eslint-disable-next-line no-unused-vars
//   const errCallback = (e) => { console.log('errCallback', e); };
//   // подписываемся на событие message,
//   // сработает когда придет сообщение на сервер. Сообщение находится в 'e'
//   ws.on('message', (e) => {
//     // console.log('данные пришли', e);
//     const { action } = JSON.parse(e);
//     // console.log('данные пришли', JSON.parse(e));
//     if (action === 'signIn') { // ниже логика регистрации пользователя в чате
//       const { login } = JSON.parse(e);
//       if (!sign.contains(login)) {
//         const activeUsers = sign.add(login);
//         Array.from(wsServer.clients)
//           .filter((client) => client.readyState === WS.OPEN)
//           .forEach((client) => client.send(JSON.stringify({
//             action: 'signIn',
//             response: {
//               status: 'ok',
//               activeUsers,
//               login,
//               allMessages: messages,
//             },
//           })));
//         // формируем объект подключеных пользователей для
//         // формирования дальнейшей логики выхода пользователя из чата
//         clients[login] = ws;
//       } else {
//         ws.send(JSON.stringify({
//           action: 'signIn',
//           response: {
//             status: 'error',
//           },
//         }));
//       }
//     }

//     if (action === 'postMessage') { // Далее логика рассылки сообщения
//       // console.log('данные пришли', JSON.parse(e));

//       const {
//         login, message, dateMessage, coordinates, typeMes, filesName,
//       } = JSON.parse(e);
//       // console.log('message', message);
//       messages.push(JSON.parse(e)); // сохраняем поступившее сообщение в массив сообщений
//       Array.from(wsServer.clients)
//         .filter((client) => client.readyState === WS.OPEN)
//         .forEach((client) => client.send(JSON.stringify({
//           action: 'postMessage',
//           response: {
//             status: 'ok',
//             message,
//             dateMessage,
//             login,
//             coordinates,
//             typeMes,
//             filesName,
//           },
//         })));
//     }

//     // if (action === 'allMessage') {
//     //   ws.send(messages);
//     // }
//   });

//   ws.on('close', () => {
//     for (const us in clients) {
//       if (clients[us] === ws) {
//         const login = us;
//         const activeUsers = sign.remove(us);
//         Array.from(wsServer.clients)
//           .filter((client) => client.readyState === WS.OPEN)
//           .forEach((client) => client.send(JSON.stringify({
//             action: 'signIn',
//             response: {
//               status: 'ok',
//               activeUsers,
//               login,
//               allMessages: messages,
//             },
//           })));
//         console.log('close__________', us);
//       }
//     }
//   });
// });
