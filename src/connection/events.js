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

function EventHandler() {
    this.handlers = {};
    this.handler = (msg) => {
        if (!msg.type || !msg.value)
            return;
        const h = this.handlers[msg.type];
        if (h)
            h.forEach(callback => callback(msg.value));
    };
    this.on = (type, callback) => {
        type = type.type || type;
        if (!this.handlers[type])
            this.handlers[type] = [];
        this.handlers[type].push(callback);
    };
};

export { EventHandler, ConnectEvent };