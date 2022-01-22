import Peer from "peerjs";
import { ConnectEvent, EventHandler } from "./events";

class Server {

    constructor(idCallback) {
        this.server = new Peer();

        this.eventHandler = new EventHandler();
        this.eventHandler.on(ConnectEvent, event => console.log('Connected: ', event.name));

        this.server.on('connection', conn => {
            conn.on('open', () => {
                conn.on('data', this.eventHandler.handler);
            });
        });

        this.server.on('open', idCallback);
    }

    /**
     * This will only return the id after the server is connected to the PeerServer.
     * Pass a idCallback to the constructor to get notified.
     * 
     * @returns the servers id
     */
    getId() {
        return this.server.id;
    }

}

export default Server;

