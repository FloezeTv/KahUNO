import { getDrawPile, shuffle } from "../components/card";
import { CardHandSendEvent, ChooseColorEvent } from "./events";

const START_CARDS = 7;

class Game {

    // Callbacks:
    // - onCurrentCardChange: when the current card changes
    // - onCurrentCardUpdate: when the current card needs to be updated (wildcard)

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
        if (this.isCurrentPlayer(id))
            this.makeBotMove();
    }

    reset() {
        this.drawPile = [];
        this.currentCard = {};
        this.currentPlayers = []; // ids
        this.currentPlayer = 0;
        this.playerData = {}; // id -> data (cards, ...)
        this.choosingColor = false;
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
        this.players[playerId].connection.send(new CardHandSendEvent(this.playerData[playerId].cards));
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
        if (!this.isCurrentPlayer(id) || !this.canPlayCard(card) || this.chooseColor)
            return;
        const playerData = this.playerData[id];
        if (!playerData)
            return;
        const cardIndex = playerData.cards.findIndex(c => c.color === card.color && c.value === card.value);
        if (cardIndex >= 0) {
            playerData.cards.splice(cardIndex, 1);
            this.players[id].connection.send(new CardHandSendEvent(playerData.cards));
            this.setCurrentCard(card);
            if (card.color === "black") {
                this.players[id].connection.send(new ChooseColorEvent());
                this.choosingColor = true;
            } else
                this.nextPlayer();
        }
    }

    chooseColor(id, color) {
        if (this.isCurrentPlayer(id) && this.chooseColor) {
            this.currentCard.color = color;
            this.callback('onCurrentCardUpdate', this.currentCard);
            this.nextPlayer();
        }

    }

    canPlayCard(card) {
        return this.currentCard.value === card.value || this.currentCard.color === card.color || card.color === 'black';
    }

    isCurrentPlayer(id) {
        return this.currentPlayers[this.currentPlayer] === id;
    }

    nextPlayer() {
        this.currentPlayer = (this.currentPlayer + 1) % this.currentPlayers.length;
        if (!this.players[this.currentPlayers[this.currentPlayer]])
            this.makeBotMove();
    }

    makeBotMove() {
        const cards = this.playerData[this.currentPlayers[this.currentPlayer]].cards;
        for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
            const card = cards[cardIndex];
            if (this.canPlayCard(card)) {
                cards.splice(cardIndex, 1);
                if (card.color === "black")
                    card.color = cards[0].color || "red";
                this.setCurrentCard(card);
                this.nextPlayer();
                return;
            }
        }
        // Could not play any cards
        // TODO: draw card
    }

}

export default Game;