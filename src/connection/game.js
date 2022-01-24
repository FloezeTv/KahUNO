import { getDrawPile, shuffle } from "../components/card";
import { CardDrawEvent, CardHandSendEvent } from "./events";

const START_CARDS = 7;

class Game {

    // Callbacks:
    // - onCurrentCardChange: when the current card changes

    constructor(callbacks) {
        this.callbacks = callbacks || {};

        this.players = {}; // id -> player (connection, ...)
        this.reset();

        console.log(this.drawPile);
    }

    addPlayer(connection, id) {
        console.log('joined', id);
        this.players[id] = { 'connection': connection };
    }

    reset() {
        this.drawPile = [];
        this.currentCard = {};
        this.currentPlayers = []; // ids
        this.currentPlayer = 0;
        this.playerData = {}; // id -> data (cards, ...)
    }

    start() {
        this.reset();

        this.addDrawPile();
        this.setCurrentCard(this.drawPile.pop());

        Object.entries(this.players).forEach(([id, player]) => {
            this.playerData[id] = {
                'cards': []
            }
            player.connection.send(new CardHandSendEvent([]));
            this.currentPlayers.push(id);
            for (let i = 0; i < START_CARDS; i++)
                this.sendCard(id);
        });
    }

    setCurrentCard(card) {
        this.currentCard = card;
        this.callback('onCurrentCardChange', card);
    }

    sendCard(playerId) {
        const card = this.drawPile.pop();
        this.playerData[playerId].cards.push(card);
        this.players[playerId].connection.send(new CardDrawEvent(card.color, card.value));
    }

    addDrawPile() {
        this.drawPile = this.drawPile.concat(shuffle(getDrawPile()));
    }

    assertDrawPile() {
        if (this.drawPile.length <= 0)
            this.addDrawPile();
    }

    callback(callbackName, ...args) {
        if (this.callbacks[callbackName])
            this.callbacks[callbackName](...args);
    }

}

export default Game;