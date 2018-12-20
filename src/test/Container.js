import React, {Component} from 'react';
import Displayer from "./Displayer";

class Container extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    };

    render() {
        const isOverFive = this.props.displayThis.length > 5;
        let puupi = "";
        if (isOverFive){
            puupi = this.props.displayThis;
        }
        else {
            puupi = "Liian lyhyt";
        }

        return (
            <div>
                <p>Tämä on container</p>

                <Displayer displayerDisplayThis={puupi}/>
            </div>
        );
    }
}

export default Container;