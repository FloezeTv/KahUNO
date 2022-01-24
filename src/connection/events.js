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

class CardDrawEvent extends Event {

    static type = 'cardDraw';

    constructor(color, value) {
        super(CardDrawEvent.type, { 'color': color, 'value': value });
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

export { EventHandler, ConnectEvent, CardDrawEvent, CardHandSendEvent, CardPlayEvent };