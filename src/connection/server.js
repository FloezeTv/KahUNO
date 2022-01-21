import Peer from "peerjs";

class Server {

    constructor(idCallback) {
        this.server = new Peer();

        this.server.on('connection', conn => {
            conn.on('open', () => {
                conn.on('data', console.log);
                conn.send('Hello from server!');
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

