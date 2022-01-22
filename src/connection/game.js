import { getDrawPile, shuffle } from "../components/card";
import { CardDrawEvent, CardHandSendEvent } from "./events";

const START_CARDS = 7;

class Game {

    // Callbacks:
    // - onCurrentCardChange: when the current card changes

    constructor(callbacks) {
        this.callbacks = callbacks || {};

        this.players = [];
        this.reset();

        console.log(this.drawPile);
    }

    addPlayer(connection) {
        this.players.push({ 'connection': connection });
    }

    reset() {
        this.drawPile = [];
        this.currentCard = {};
        this.currentPlayers = [];
        this.currentPlayer = 0;
    }

    start() {
        this.reset();

        this.addDrawPile();
        this.setCurrentCard(this.drawPile.pop());

        this.players.forEach(p => {
            const player = {
                'connection': p.connection,
                'cards': []
            };
            player.connection.send(new CardHandSendEvent([]));
            this.currentPlayers.push(player);
            for (let i = 0; i < START_CARDS; i++)
                this.sendCard(player);
        });
    }

    setCurrentCard(card) {
        this.currentCard = card;
        this.callback('onCurrentCardChange', card);
    }

    sendCard(player) {
        const card = this.drawPile.pop();
        player.cards.push(card);
        player.connection.send(new CardDrawEvent(card.color, card.value));
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