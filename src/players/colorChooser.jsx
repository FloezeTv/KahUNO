import React from "react";
import style from "./colorChooser.module.css";

class ColorChooser extends React.Component {

    render() {
        return (
            <div className={style.container}>
                <div className={style.title}>Choose color</div>
                <div className={style.list}>
                    {["red", "green", "blue", "yellow"].map(color => <div key={color} style={{ background: `var(--${color})` }} onClick={() => this.props.onClick(color)} />)}
                </div>
            </div>
        )
    }

}

export default ColorChooser;