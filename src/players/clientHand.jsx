import React from "react";
import Hand from "../players/hand";
import Client from "../connection/client";

class ClientHand extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            cards: [],
            connected: false,
            myTurn: false,
        };

        this.client = new Client(this.props.id, {
            onConnect: () => this.setState({ connected: true }),
            onCardDraw: c => this.setState({ cards: this.state.cards.concat(c) }),
            onHandUpdate: c => this.setState({ cards: c }),
            onMyTurn: m => this.setState({ myTurn: m })
        });
    }

    render() {
        return (
            <>
                {this.state.connected ?
                    <Hand cards={this.state.cards} sort onClick={c => this.client.tryPlayCard(c)} />
                    : <div>Loading...</div>
                }
            </>
        );
    }

}

export default ClientHand;