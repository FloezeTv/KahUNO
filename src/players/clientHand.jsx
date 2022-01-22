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

        this.client = new Client(this.props.id, () => this.setState({ connected: true }), c => this.setState({ cards: c }), m => this.setState({ myTurn: m }));
    }

    render() {
        return (
            <>
                {this.state.connected ?
                    <Hand cards={this.state.cards} />
                    : <div>Loading...</div>
                }
            </>
        );
    }

}

export default ClientHand;