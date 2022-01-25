import Peer from "peerjs";
import { CardPlayEvent, ConnectEvent, EventHandler, PingHandler } from "./events";
import Game from "./game";

class Server {

    constructor(idCallback) {
        this.server = new Peer();

        this.game = new Game();

        this.eventHandler = new EventHandler();
        this.eventHandler.on(ConnectEvent, (event, conn) => this.game.addPlayer(conn, conn.peer));
        this.eventHandler.on(CardPlayEvent, (event, conn) => this.game.playCard(conn.peer, event));

        this.pingHandler = PingHandler(this.eventHandler, (id, connection) => this.game.removePlayer(id));

        console.log(this.game);

        this.server.on('connection', conn => {
            conn.on('open', () => {
                conn.on('data', this.eventHandler.handler(conn));
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

