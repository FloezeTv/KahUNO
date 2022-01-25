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

    removePlayer(id) {
        console.log('left', id);
        delete this.players[id];
        const index = this.currentPlayers.indexOf(id);
        if (index >= 0) {
            this.currentPlayers.splice(index, 1);
            if (index == this.currentPlayer)
                this.nextPlayer();
        }
        delete this.playerData[id];
        // maybe replace player by bot instead of remove?
        // makes it possible to rejoin
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

    playCard(id, card) {
        if (!this.isCurrentPlayer(id))
            return;
        const playerData = this.playerData[id];
        if (!playerData)
            return;
        const cardIndex = playerData.cards.findIndex(c => c.color === card.color && c.value === card.value);
        if (cardIndex >= 0) {
            playerData.cards.splice(cardIndex, 1);
            this.players[id].connection.send(new CardHandSendEvent(playerData.cards));
            this.setCurrentCard(card);
            this.nextPlayer();
        }
    }

    isCurrentPlayer(id) {
        return this.currentPlayers[this.currentPlayer] === id;
    }

    nextPlayer() {
        this.currentPlayer = (this.currentPlayer + 1) % this.currentPlayers.length;
    }

}

export default Game;