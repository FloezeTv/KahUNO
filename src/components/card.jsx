import React from "react";
import resources from "../rsc/resources";
import style from "./card.module.css";

class Card extends React.Component {

    // props:
    // - color: the color of the card (red, green, yellow, blue, black)
    // - value: the value of the card (normal: 0-9, reverse, skip, draw; black: wild, wild+4)

    constructor(props) {
        super(props);

        this.markRef = React.createRef();

        this.state = {
            markHeight: 10
        };

        this.updateSize = this.updateSize.bind(this);

        this.filteredStyle = {};
        if (props.style)
            Object.keys(props.style).filter(k => k.startsWith('--')).forEach(k => this.filteredStyle[k] = props.style[k]);

    }

    render() {
        return (
            <div className={style.outer} style={this.filteredStyle} >
                <div className={style.inner} style={{ background: `var(--${this.props.color}` }}>
                    <div className={style.mark} ref={this.markRef} style={{ fontSize: this.state.markHeight * 0.7 }}>
                        <svg width="100%" height="100%" style={{ filter: `drop-shadow(${this.state.markHeight * 0.02}px ${this.state.markHeight * 0.02}px black)` }}>
                            {typeof this.props.value === "number" ?
                                // number
                                (<text x="50%" y="50%" fill="white" textAnchor="middle" dominantBaseline="central" stroke="black" strokeWidth={`1.5%`}>{this.props.value}</text>)
                                // special card (svg)
                                : resources.vector.specialCards[this.props.value] &&
                                React.createElement(resources.vector.specialCards[this.props.value].ReactComponent, { width: '80%', height: '80%', x: '10%', y: '10%', stroke: 'black', strokeWidth: `3%` })
                            }
                        </svg>
                    </div>
                </div>
            </div >
        );
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateSize);
        this.updateSize();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateSize);
    }

    updateSize() {
        this.setState({ markHeight: this.markRef.current?.clientHeight });
    }
}

export default Card;


const getDrawPile = () => {
    return [
        ...[...new Array(2).keys()].flatMap(() => ['red', 'green', 'blue', 'yellow'].flatMap(c => [...Array(10).keys(), 'reverse', 'skip', 'draw'].flatMap(v => ({ color: c, value: v })))),
        ...[...new Array(4).keys()].flatMap(() => ['wild', 'wild+4'].flatMap(v => ({ color: 'black', value: v })))
    ];
}

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * i);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export { getDrawPile, shuffle };