import React from "react";
import Server from "../connection/server"
import Table from "./table";
import style from "./serverTable.module.css";
import qrcode from "qrcode";
import WinnerDisplay from "../components/winnerDisplay";

class ServerTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            id: 'loading',
            idQr: null,
            currentCard: { color: 'black', value: 'wild' },
            players: [],
            started: false,
            messages: [],
            winner: null,
        };
    }

    componentDidMount() {
        this.server = new Server({
            onId: id => {
                this.setState({ 'id': id });
                qrcode.toDataURL(this.props.playURL ? new URL(id, this.props.playURL).href : id, {
                    margin: 1,
                    scale: 1,
                }, (err, url) => {
                    if (!err)
                        this.setState({ idQr: url });
                });
            },
            onJoin: (id, player) => this.addMessage(`${id}-join`, `${player.name} joined`),
            onLeave: (id, player) => this.addMessage(`${id}-leave`, `${player.name} left`),
        });
        this.server.game.callbacks.onCurrentCardChange = card => this.setState({ currentCard: card });
        this.server.game.callbacks.onCurrentCardUpdate = card => this.setState({ currentCard: { ...card, update: true } });
        this.server.game.callbacks.onWin = id => this.setState({winner: id});
        this.server.game.callbacks.onPlayerAnnouncedLastCard = id => this.addMessage(`${id}-one`, `${this.server.getName(id)} has one card!`);
    }

    render() {
        return (
            <>
                <Table card={this.state.currentCard} />
                <div className={style.messages}>
                    {this.state.messages.map(message => <div key={message.key} >{message.text}</div>)}
                </div>
                {this.state.winner &&
                    <WinnerDisplay name={this.server.getName(this.state.winner)}>
                        <button className={style.button + ' ' + style.playAgain} onClick={() => this.setState({ started: false })}>Play again!</button>
                    </WinnerDisplay>
                }
                {!this.state.started &&
                    <div className={style.join}>
                        {this.state.idQr && <img src={this.state.idQr} className={style.qr} alt="QR-Code" />}
                        <div className={style.id}>ID: {this.state.id}</div>
                        <button className={style.button} onClick={() => { this.setState({ started: true, winner: null }); this.server.game.start(); }}>Start!</button>
                    </div>
                }
            </>
        );
    }

    addMessage(key, text) {
        const now = Date.now();
        this.setState({ messages: [...this.state.messages.filter(msg => now - msg.time <= 10000), { 'key': key, 'text': text, time: now }] });
    }

}

export default ServerTable;