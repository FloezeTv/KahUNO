import React from "react";
import { useNavigate } from "react-router-dom";
import style from "./start.module.css";

class Start extends React.Component {

    render() {
        return (
            <>
                <div className={style.background} />
                <div className={style.body}>
                    <h1 className={style.heading}>KahUNO</h1>
                    <p className={style.box + ' ' + style.description}>
                        KahUNO is a UNO clone, that is played like Kahoot!<br />
                        The host of the game is the table and shares his screen,
                        either by sharing to a TV if the players are all in a room,
                        or by sharing their screen in an online meeting.
                        The players can join by scanning the QR-Code with their phones
                        (although playing on PC is theoretically supported if you go to the link manually).
                        Once the game starts, the players only see their cards on their phones and the currently played card on the shared table.
                    </p>
                    <button className={style.box + ' ' + style.button} onClick={() => this.props.navigate('/serve/')}>Host</button>
                </div>
            </>
        );
    }

}

export default (props) => {
    const navigate = useNavigate();
    return <Start navigate={navigate} {...props} />;
};