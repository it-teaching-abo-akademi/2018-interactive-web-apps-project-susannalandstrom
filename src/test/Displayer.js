import React, {Component} from 'react';

class Displayer extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    };

    render() {
        return (
            <div>
                <p>Tämä on Displayer, ja tässä on kirjoittamasi teksti:</p>
                {this.props.displayerDisplayThis}
            </div>
        );
    }
}

export default Displayer;