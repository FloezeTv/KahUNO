import Peer from "peerjs";
import { CardDrawEvent, CardPlayEvent, ColorChosenEvent, ConnectEvent, EventHandler, NextTurnEvent, OneCardLeftEvent, PingHandler } from "./events";
import Game from "./game";

class Server {

    // Callbacks:
    // - onId: Server id has been issued
    // - onJoin: A player has joined the game
    // - onLeave: A player has left the game

    constructor(callbacks) {
        this.server = new Peer();

        this.game = new Game();

        this.playerData = {};

        this.eventHandler = new EventHandler();
        this.eventHandler.on(ConnectEvent, (event, conn) => {
            const id = conn.peer;
            this.game.addPlayer(conn, id);
            this.playerData[id] = { 'name': event.name };
            callbacks.onJoin(id, this.playerData[id]);
        });
        this.eventHandler.on(CardPlayEvent, (event, conn) => this.game.playCard(conn.peer, event));
        this.eventHandler.on(ColorChosenEvent, (event, conn) => {console.log("Received ColorChosenEvent"); this.game.chooseColor(conn.peer, event.color);});
        this.eventHandler.on(CardDrawEvent, (event, conn) => this.game.drawCard(conn.peer));
        this.eventHandler.on(OneCardLeftEvent, (event, conn) => this.game.announceOneCardLeft(conn.peer));
        this.eventHandler.on(NextTurnEvent, (event, conn) => this.game.nextTurn(conn.peer));

        this.pingHandler = PingHandler(this.eventHandler, (id, connection) => {
            this.game.removePlayer(id);
            callbacks.onLeave(id, this.playerData[id]);
        });

        console.log(this.game);

        this.server.on('connection', conn => {
            conn.on('open', () => {
                conn.on('data', this.eventHandler.handler(conn));
            });
        });

        this.server.on('open', callbacks.onId);
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

