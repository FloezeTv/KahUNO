import React from "react";
import Card from "../components/card";
import style from "./table.module.css";

class Table extends React.Component {
    render() {
        return (
            <div className={style.table}>
                <Card color={this.props.card.color} value={this.props.card.value} />
            </div>
        );
    }
}

export default Table;