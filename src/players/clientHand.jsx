import React from "react";
import Client from "../connection/client";
import Hand from "../players/hand";
import style from "./clientHand.module.css";

class ClientHand extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            cards: [],
            connected: false,
            name: '',
            enteredName: false,
            myTurn: false,
        };
    }

    componentDidMount() {
        this.client = new Client(this.props.id, {
            onConnect: () => this.setState({ connected: true }),
            onCardDraw: c => this.setState({ cards: this.state.cards.concat(c) }),
            onHandUpdate: c => this.setState({ cards: c }),
            onMyTurn: m => this.setState({ myTurn: m })
        });
    }

    render() {
        if (!this.state.enteredName) {
            return (
                <div className={style.nameForm}>
                    <div>Enter name:</div>
                    <input type="text" value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
                    <button onClick={() => { this.setState({ enteredName: true }); this.client.connect(this.state.name) }}>Join</button>
                </div>
            )
        } else if (!this.state.connected) {
            return <div>Loading...</div>
        } else {
            return <Hand cards={this.state.cards} sort onClick={c => this.client.tryPlayCard(c)} />
        }
    }

}

export default ClientHand;