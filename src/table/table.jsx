import React from "react";
import Card from "../components/card";
import style from "./table.module.css";


const purgeOldCards = (cards) => {
    const now = Date.now();
    var curr;
    for (let i = cards.length - 1; i >= 0; i--) {
        if (now - cards[i].time > 2000) {
            curr = cards[i];
            break;
        }
    }
    const filtered = cards.filter(card => now - card.time <= 2000);
    if (curr)
        return [curr, ...filtered];
    return filtered;
}

class Table extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            cards: [{ ...props.card, time: Date.now(), dirX: 0, dirY: 0 }],
        };
    }

    render() {
        return (
            <div className={style.table}>
                {this.state.cards.map(card => <Card color={card.color} value={card.value} key={card.time} style={{ '--slide-direction-x': card.dirX, '--slide-direction-y': card.dirY }} />)}
            </div>
        );
    }

    componentDidUpdate(oldProps) {
        if (oldProps.card !== this.props.card) {
            const angle = Math.random() * 2 * Math.PI;

            if (this.props.card.update) {
                const oldCard = this.state.cards[this.state.cards.length - 1];
                this.setState({
                    cards: this.state.cards.slice(0, this.state.cards.length - 1).concat({
                        ...this.props.card,
                        time: oldCard.time,
                        dirX: oldCard.dirX,
                        dirY: oldCard.dirY,
                    })
                });
            } else {
                this.setState({
                    cards: purgeOldCards(this.state.cards).concat({
                        ...this.props.card,
                        time: Date.now(),
                        dirX: Math.sin(angle),
                        dirY: Math.cos(angle),
                    })
                });
            }
        }
    }
}

export default Table;