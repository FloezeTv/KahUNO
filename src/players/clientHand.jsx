import React from "react";
import Client from "../connection/client";
import Hand from "../players/hand";
import style from "./clientHand.module.css";
import ColorChooser from "./colorChooser";
import draw from "../rsc/draw_icon.svg";
import one_card from "../rsc/one_card.svg";
import next_turn from "../rsc/next_turn.svg";

class ClientHand extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            cards: [],
            connected: false,
            name: '',
            enteredName: false,
            chooseColor: false,
            buttons: {},
        };
    }

    componentDidMount() {
        this.client = new Client(this.props.id, {
            onConnect: () => this.setState({ connected: true }),
            onHandUpdate: c => this.setState({ cards: c }),
            onChooseColor: () => this.setState({ chooseColor: true }),
            onButtonsDisplay: b => this.setState({buttons: b}),
        });
    }

    connect() {
        this.setState({ enteredName: true });
        this.client.connect(this.state.name);
    }

    render() {
        if (!this.state.enteredName) {
            return (
                <div className={style.nameForm}>
                    <div>Enter name:</div>
                    <input type="text" onKeyDown={e => e.key === "Enter" && this.connect()} value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
                    <button onClick={() => this.connect()}>Join</button>
                </div>
            )
        } else if (!this.state.connected) {
            return <div>Loading...</div>
        } else {
            return (
                <>
                    <Hand cards={this.state.cards} sort onClick={c => this.client.tryPlayCard(c)} />
                    {this.state.chooseColor && <ColorChooser onClick={color => { this.setState({ chooseColor: false }); this.client.chooseColor(color) }} />}
                    <div className={style.buttonPanel}>
                        {this.state.buttons.nextTurn && <img src={next_turn} alt="Next turn" onClick={() => this.client.nextTurn()} />}
                        {this.state.buttons.drawCard && <img src={draw} alt="Draw card" onClick={() => this.client.drawCard()} />}
                        {this.state.buttons.oneCard && <img src={one_card} alt="One card left" onClick={() => this.client.announceOneCardLeft()} />}
                    </div>
                </>
            );
        }
    }

}

export default ClientHand;