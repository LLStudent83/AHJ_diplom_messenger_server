class WebsocketApi {
  constructor(wsServer, sign, WS) {
    this.wsServer = wsServer;
    this.sign = sign;
    this.WS = WS;
    this.messages = [];
    this.clients = {};
    // подписываемся на событе 'connection', сработает когда произошло соединение
    this.wsServer.on('connection', (ws) => { this.handlesEventConnection(ws); });
  }

  handlesEventConnection(ws) {
    this.ws = ws;
    this.ws.on('message', (e) => { this.handlesEventMessage(e); });
    this.ws.on('close', () => { this.handlesEventClose(); });

    console.log('обработчики message и close установлены');
  }

  handlesEventMessage(e) {
    console.log('сработало событие message', e);

    const { action } = JSON.parse(e);
    if (action === 'signIn') {
      this.signIn(e);
    }
    if (action === 'postMessage') {
      this.postMessage(e);
    }
  }

  signIn(e) {
    const { login } = JSON.parse(e);
    if (!this.sign.contains(login)) {
      const activeUsers = this.sign.add(login);
      Array.from(this.wsServer.clients)
        .filter((client) => client.readyState === this.WS.OPEN)
        .forEach((client) => client.send(JSON.stringify({
          action: 'signIn',
          response: {
            status: 'ok',
            activeUsers,
            login,
            allMessages: this.messages,
          },
        })));
      // формируем объект подключеных пользователей для
      // формирования дальнейшей логики выхода пользователя из чата
      this.clients[login] = this.ws;
    } else {
      this.ws.send(JSON.stringify({
        action: 'signIn',
        response: {
          status: 'error',
        },
      }));
    }
  }

  postMessage(e) {
    const {
      login, message, dateMessage, coordinates, typeMes, filesName,
    } = JSON.parse(e);
    // console.log('message', message);
    this.messages.push(JSON.parse(e)); // сохраняем поступившее сообщение в массив сообщений
    Array.from(this.wsServer.clients)
      .filter((client) => client.readyState === this.WS.OPEN)
      .forEach((client) => client.send(JSON.stringify({
        action: 'postMessage',
        response: {
          status: 'ok',
          message,
          dateMessage,
          login,
          coordinates,
          typeMes,
          filesName,
        },
      })));
  }

  handlesEventClose() {
    for (const us in this.clients) {
      if (this.clients[us] === this.ws) {
        const login = us;
        const activeUsers = this.sign.remove(us);
        Array.from(this.wsServer.clients)
          .filter((client) => client.readyState === this.WS.OPEN)
          .forEach((client) => client.send(JSON.stringify({
            action: 'signIn',
            response: {
              status: 'ok',
              activeUsers,
              login,
              allMessages: this.messages,
            },
          })));
        console.log('close__________', us);
      }
    }
  }
}

module.exports = WebsocketApi;
