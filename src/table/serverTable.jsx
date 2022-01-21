import React from "react";
import Server from "../connection/server"
import Table from "./table";
import style from "./serverTable.module.css";
import qrcode from "qrcode";

class ServerTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            id: 'loading',
            idQr: null,
            currentCard: { color: 'black', value: 'wild' },
            players: [],
            started: false,
        };

        this.server = new Server(id => {
            this.setState({ 'id': id });
            qrcode.toDataURL(this.props.playURL ? new URL(id, this.props.playURL).href : id, {
                margin: 1,
                scale: 1,
            }, (err, url) => {
                if (!err)
                    this.setState({ idQr: url });
            });
        });
    }

    render() {
        return (
            <>
                <Table card={this.state.currentCard} />
                {!this.state.started &&
                    <div className={style.join}>
                        {this.state.idQr && <img src={this.state.idQr} className={style.qr} />}
                        <div className={style.id}>ID: {this.state.id}</div>
                        <button className={style.button} onClick={() => this.setState({ started: true })}>Start!</button>
                    </div>
                }
            </>
        );
    }

}

export default ServerTable;