import Peer from "peerjs";
import { ConnectEvent, EventHandler } from "./events";

class Client {

    constructor(id, onConnect, onCardsUpdate, myTurnCallback) {
        this.client = new Peer();
        this.eventHandler = new EventHandler();

        this.eventHandler.on('connect', event => console.log('connect: ', event));

        this.client.on('open', () => {
            this.connection = this.client.connect(id);
            this.connection.on('open', () => {
                onConnect();
                this.connection.on('data', this.eventHandler.handler);
                this.connection.send(new ConnectEvent(this.client.id));
            });
        });
    }

    tryPlayCard(card) {
        this.connection.send({ type: 'play', value: card });
    }

}

export default Client;