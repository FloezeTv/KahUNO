import { getDrawPile, shuffle } from "../components/card";
import { ButtonsDisplayEvent, CardHandSendEvent, ChooseColorEvent } from "./events";

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
        this.direction = true;
        this.skip = 0;
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
            player.connection.send(new ButtonsDisplayEvent(false, false, false));
            this.currentPlayers.push(id);
            for (let i = 0; i < START_CARDS; i++)
                this.sendCard(id);
        });

        this.getPlayerConnection(0).send(new ButtonsDisplayEvent(false, true, false));
    }

    setCurrentCard(card) {
        this.currentCard = card;
        this.callback('onCurrentCardChange', card);
    }

    sendCard(playerId, count = 1) {
        for(let i = 0; i < count; i++) {
            this.assertDrawPile();
            const card = this.drawPile.pop();
            this.playerData[playerId].cards.push(card);
            this.players[playerId].connection.send(new CardHandSendEvent(this.playerData[playerId].cards));
        }
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
        if (!this.isCurrentPlayer(id) || !this.canPlayCard(card) || this.choosingColor)
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

    drawCard(id) {
        if (this.isCurrentPlayer(id)) {
            this.sendCard(id);
            this.players[id].connection.send(new ButtonsDisplayEvent(true, false, false));
            this.playerData[id].drewCard = true;
        }
    }

    nextTurn(id) {
        if (this.isCurrentPlayer(id)) {
            if (this.getPlayerData().drewCard)
                this.nextPlayer();
            else
                this.getPlayerConnection().send(new ButtonsDisplayEvent(false, true, false));
        }
    }

    announceOneCardLeft(id) {
        const playerData = this.getPlayerData(id);
        if (playerData.cards.length === 1)
            playerData.announcedOneCardLeft = true;
        else; // player announced one card, when not necessary
    }

    chooseColor(id, color) {
        if (this.isCurrentPlayer(id) && this.choosingColor) {
            this.currentCard.color = color;
            this.callback('onCurrentCardUpdate', this.currentCard);
            this.choosingColor = false;
            this.nextPlayer();
        }

    }

    canPlayCard(card) {
        return this.currentCard.value === card.value || this.currentCard.color === card.color || card.color === 'black';
    }

    getNextPlayer() {
        let nextPlayer = (this.currentPlayer + (this.direction ? 1 : -1) * (this.skip + 1)) % this.currentPlayers.length;
        if (nextPlayer < 0)
            nextPlayer += this.currentPlayers.length;
        return nextPlayer;
    }

    checkPlayerAnnouncedLastCardLeft() {
        const playerData = this.getPlayerData();
        if (playerData.cards.length === 1 && !playerData.announcedOneCardLeft)
            this.sendCard(this.getPlayerId());
        playerData.announcedOneCardLeft = false;
    }

    nextPlayer() {
        this.checkWin();
        this.getPlayerConnection().send(new ButtonsDisplayEvent(false, false, true));
        this.handleSpecialCardsPre();
        this.currentPlayer = this.getNextPlayer();
        this.handleSpecialCardsPost();
        this.checkPlayerAnnouncedLastCardLeft();
        this.getPlayerConnection().send(new ButtonsDisplayEvent(false, true, false));
        this.getPlayerData().drewCard = false;
        if (!this.isPlayerOnline())
            this.makeBotMove();
    }

    handleSpecialCardsPre() {
        this.skip = this.currentCard.value === 'skip' ? 1 : 0;
        if (this.currentCard.value === 'reverse') {
            if(this.currentPlayers.length <= 2)
                this.skip = 1; // reverse with 2 players is skip (according to official rules)
            else
                this.direction = !this.direction;
        }
    }

    handleSpecialCardsPost() {
        switch (this.currentCard.value) {
            case 'draw':
                this.sendCard(this.getPlayerId(), 2);
                break;
            case 'wild+4':
                this.sendCard(this.getPlayerId(), 4);
                break;
        }
    }

    checkWin() {
        if(this.getPlayerData().cards.length === 0) {
            this.callback('onWin', this.getPlayerId());
        }
    }

    makeBotMove() {
        const cards = this.getPlayerData().cards;
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

    getPlayerId(playerIndex = this.currentPlayer) {
        return this.currentPlayers[playerIndex];
    }

    getPlayerData(playerIndex = this.currentPlayer) {
        return this.playerData[this.getPlayerId(playerIndex)];
    }

    getPlayerConnection(playerIndex = this.currentPlayer) {
        return this.players[this.getPlayerId(playerIndex)].connection;
    }

    isCurrentPlayer(id) {
        return this.getPlayerId() === id;
    }

    isPlayerOnline(playerIndex = this.currentPlayer) {
        return this.players[this.getPlayerId(playerIndex)];
    }
}

export default Game;