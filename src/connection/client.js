import Peer from "peerjs";
import { CardDrawEvent, CardHandSendEvent, CardPlayEvent, ConnectEvent, EventHandler } from "./events";

class Client {

    // Callbacks:
    // - onConnect: Client connected to table
    // - onCardDraw: A new card has been sent to the client
    // - onHandUpdate: A full hand has been sent to the client

    constructor(id, callbacks) {
        this.callbacks = callbacks;

        this.client = new Peer();
        this.eventHandler = new EventHandler();

        this.eventHandler.on(CardDrawEvent, this.callbacks.onCardDraw);
        this.eventHandler.on(CardHandSendEvent, this.callbacks.onHandUpdate);

        this.client.on('open', () => {
            this.connection = this.client.connect(id);
            this.connection.on('open', () => {
                this.callbacks.onConnect();
                this.connection.on('data', this.eventHandler.handler(this.connection));
                this.connection.send(new ConnectEvent(this.client.id));
            });
        });
    }

    tryPlayCard(card) {
        this.connection.send(new CardPlayEvent(card.color, card.value));
    }

}

export default Client;