class Event {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

// The following is needed to allow PeerJS binarypack to pack Events after being compiled to webpack.
//
// Removing this will still work in dev server, as the information is stored of this being a class.
// After building however, this will throw an error (type function ... is not supported yet),
// as the information of this being a class is lost when compiling.
Event.prototype.constructor.toString = () => "class Event";

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

class OneCardLeftEvent extends Event {

    static type = 'oneCardLeft';

    constructor() {
        super(OneCardLeftEvent.type, {});
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

class ButtonsDisplayEvent extends Event {

    static type = 'displayButtons';

    constructor(nextTurn, drawCard, oneCard) {
        super(ButtonsDisplayEvent.type, { 'nextTurn': nextTurn, 'drawCard': drawCard, 'oneCard': oneCard });
    }

}

class NextTurnEvent extends Event {

    static type = 'nextTurn';

    constructor() {
        super(NextTurnEvent.type, {});
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

export { EventHandler, PingHandler, ConnectEvent, PingEvent, CardHandSendEvent, CardPlayEvent, CardDrawEvent, ChooseColorEvent, ColorChosenEvent, OneCardLeftEvent, ButtonsDisplayEvent, NextTurnEvent };
