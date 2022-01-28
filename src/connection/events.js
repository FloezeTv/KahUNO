class Event {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

class ConnectEvent extends Event {

    static type = 'connect';

    constructor(name) {
        super(ConnectEvent.type, { 'name': name });
    }
}

class PingEvent extends Event {

    static type = 'ping';

    constructor() {
        super(PingEvent.type, {});
    }
}

class CardHandSendEvent extends Event {

    static type = 'cardHand';

    constructor(cards) {
        super(CardHandSendEvent.type, cards);
    }

}

class CardPlayEvent extends Event {

    static type = 'cardPlay';

    constructor(color, value) {
        super(CardPlayEvent.type, { 'color': color, 'value': value });
    }

}

class CardDrawEvent extends Event {

    static type = 'cardDraw';

    constructor() {
        super(CardDrawEvent.type, {});
    }
}

class ChooseColorEvent extends Event {

    static type = 'chooseColor';

    constructor() {
        super(ChooseColorEvent.type, {})
    }

}

class ColorChosenEvent extends Event {

    static type = 'colorChosen';

    constructor(color) {
        super(ColorChosenEvent.type, { 'color': color });
    }

}

function EventHandler() {
    this.handlers = {};
    this.handler = (conn) => (msg) => {
        if (!msg.type || !msg.value)
            return;
        const h = this.handlers[msg.type];
        if (h)
            h.forEach(callback => callback(msg.value, conn));
    };
    this.on = (type, callback) => {
        type = type.type || type;
        if (!this.handlers[type])
            this.handlers[type] = [];
        this.handlers[type].push(callback);
    };
};

const PingHandler = (eventHandler, deadCallback, WAIT_TIME = 10000) => {
    const lastPings = [];
    const updateLastPing = (event, connection) => {
        const index = lastPings.findIndex(ping => ping.id === connection.peer);
        if (index >= 0) {
            lastPings[index].lastSeen = Date.now();
        } else {
            lastPings.push({
                id: connection.peer,
                lastSeen: Date.now() + WAIT_TIME, /* Longer time allowed until first ping */
                'connection': connection
            });
        }
    };
    eventHandler.on(ConnectEvent, updateLastPing);
    eventHandler.on(PingEvent, updateLastPing);
    const pingInterval = setInterval(() => {
        const now = Date.now();
        for (const ping of lastPings) {
            if (now - ping.lastSeen >= WAIT_TIME) {
                lastPings.splice(ping, 1);
                deadCallback(ping.id, ping.connection);
            } else {
                ping.connection.send(new PingEvent());
            }
        }
    }, WAIT_TIME / 3);

    return {
        stop: () => clearInterval(pingInterval)
    }
};

export { EventHandler, PingHandler, ConnectEvent, PingEvent, CardHandSendEvent, CardPlayEvent, CardDrawEvent, ChooseColorEvent, ColorChosenEvent };
