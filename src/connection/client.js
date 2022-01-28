import Peer from "peerjs";
import { CardHandSendEvent, CardPlayEvent, ChooseColorEvent, ColorChosenEvent, ConnectEvent, EventHandler, PingHandler, CardDrawEvent } from "./events";

class Client {

    // Callbacks:
    // - onConnect: Client connected to table
    // - onHandUpdate: A hand of cards has been sent to the client
    // - onChooseColor: Player has to choose a color

    constructor(id, callbacks) {
        this.callbacks = callbacks;

        this.client = new Peer();
        this.eventHandler = new EventHandler();

        this.eventHandler.on(CardHandSendEvent, this.callbacks.onHandUpdate);
        this.eventHandler.on(ChooseColorEvent, this.callbacks.onChooseColor);

        this.pingHandler = PingHandler(this.eventHandler, () => console.warn("Disconnected!"));

        this.messageQueue = []; // messages to send right after connecting

        this.client.on('open', () => {
            this.connection = this.client.connect(id);
            this.connection.on('open', () => {
                this.callbacks.onConnect();
                this.connection.on('data', this.eventHandler.handler(this.connection));
                this.messageQueue.forEach(message => this.connection.send(message));
                delete this.messageQueue;
            });
        });
    }

    send(message) {
        if (this.connection)
            this.connection.send(message);
        else
            this.messageQueue.push(message);
    }

    connect(name) {
        this.send(new ConnectEvent(name));
    }

    tryPlayCard(card) {
        this.send(new CardPlayEvent(card.color, card.value));
    }

    chooseColor(color) {
        console.log("Sent colorChosenEvent");
        this.send(new ColorChosenEvent(color));
    }

    drawCard() {
        this.send(new CardDrawEvent());
    }

}

export default Client;