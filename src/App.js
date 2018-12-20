import React, {Component} from 'react';
import './App.css';
import Portfolio from "./Portfolio/Portfolio";
import AddPortfolioAlert from "./Portfolio/AddPortfolioAlert";
import axios from 'axios';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            portfolios: [],
            showPortfolio: false,
            EurToUSD: 0.0,
        };
        this.addNewPortfolio = this.addNewPortfolio.bind(this);
        this.removePortfolio = this.removePortfolio.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    componentDidMount() {
        const url = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=OHK5U5NEHY5FSE6A";
        axios.get(url).then (response => this.setState({EurToUSD: response.data}))
        const portfolioNames = Object.keys(localStorage);
        this.setState({
            portfolios: portfolioNames
        })
    }

    addNewPortfolio(name) {
        const portfolios = this.state.portfolios;
        if (name.length > 0) {
            portfolios.push(name);
            this.setState({
                portfolios: portfolios
            });
            this.handleClose()
            localStorage.setItem(name, JSON.stringify([]))
        }

    }

    removePortfolio(name) {
        const portfolios = this.state.portfolios;
        portfolios.splice(portfolios.indexOf(name), 1)
        this.setState({
            portfolios: portfolios
        });
        localStorage.removeItem(name)
    }

    handleClose = () => {
        this.setState({showPortfolio: false});
    };

    render() {
        return (
            <div className="App">
                <button onClick={() => this.setState({showPortfolio: true})} className="portfolioBtn">Add new portfolio</button>
                <AddPortfolioAlert
                    showPortfolio={this.state.showPortfolio}
                    addNewPortfolio={(name) => this.addNewPortfolio(name)}
                    handleClose={this.handleClose}
                />
                <div>
                {this.state.portfolios.map(portfolioName =>
                    <Portfolio
                        key={portfolioName}
                        name={portfolioName}
                        removePortfolio={(name) => this.removePortfolio(name)}
                        EurToUSD={this.state.EurToUSD}
                    />
                )}
                </div>


            </div>
        )
    }
}

export default App;
