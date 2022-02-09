import React from "react";
import Confetti from "react-confetti";
import style from "./winnerDisplay.module.css";

class WinnerDisplay extends React.Component {

    render() {
        return (
            <div className={style.container}>
                <Confetti className={style.confetti} />
                <div className={style.name}>{this.props.name || "Nobody"} won</div>
                {this.props.children}
            </div>
        )
    }

}

export default WinnerDisplay;