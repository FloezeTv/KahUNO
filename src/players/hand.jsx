import React from 'react';
import Card from '../components/card';
import style from './hand.module.css';

class Hand extends React.Component {

    render() {
        return (
            <div className={style.hand}>
                {this.props.cards.map((card, index) => (<Card color={card.color} value={card.value} key={index} />))}
            </div>
        );
    }

}

export default Hand;