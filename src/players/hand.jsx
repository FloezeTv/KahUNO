import React from 'react';
import Card from '../components/card';
import style from './hand.module.css';

class Hand extends React.Component {

    render() {
        if (this.props.sort)
            sort(this.props.cards);

        return (
            <div className={style.hand}>
                {this.props.cards.map((card, index) => (<Card color={card.color} value={card.value} key={index} />))}
            </div>
        );
    }

}

export default Hand;

const colorOrder = ["red", "yellow", "green", "blue", "black"];
const valueOrder = [...Array(10).keys(), "reverse", "skip", "draw", "wild", "wild+4"];
const sortingFunction = (a, b) => {
    const colorDiff = colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
    if (colorDiff != 0)
        return colorDiff;
    return valueOrder.indexOf(a.value) - valueOrder.indexOf(b.value);
};

const sort = cards => {
    cards.sort(sortingFunction);
}

export { sort };