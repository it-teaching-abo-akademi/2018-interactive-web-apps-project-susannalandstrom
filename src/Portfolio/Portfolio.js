import React, {Component} from 'react';
import PortfolioTable from "./PortfolioTable";
import AddStockAlert from "./AddStockAlert";
import axios from 'axios';

class Portfolio extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedStock: [],
            stocks: [],
            totalValue: 0,
            show: false,
            currencyUSD: true,
        };
        this.changeCurrency = this.changeCurrency.bind(this);
        this.countNewValues = this.countNewValues.bind(this);
        this.getExchangeRate = this.getExchangeRate.bind(this);
        this.addStock = this.addStock.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.checkboxClick = this.checkboxClick.bind(this);
        this.countTotalValue = this.countTotalValue.bind(this);
        this.removeSelectedStocks = this.removeSelectedStocks.bind(this);
        this.setRealTimeValueAndTotal = this.setRealTimeValueAndTotal.bind(this);
    }


    componentDidMount() {
        this.setState({
            stocks: JSON.parse(localStorage.getItem(this.props.name))
        })
    }

    changeCurrency(currency) {
        const currencyUSD = this.state.currencyUSD;
        console.log(currency)
        const selectedCurrency = currency;
        if (selectedCurrency === "euro" && currencyUSD)
            this.setState({currencyUSD: false}, () => {
                this.countNewValues();
            });
        else if (selectedCurrency === "USD" && !currencyUSD) {
            this.setState({currencyUSD: true}, () => {
                this.countNewValues();
            });
        }
    }

    countNewValues() {
        const stocks = this.state.stocks;
        const multiplier = this.state.currencyUSD ? this.getExchangeRate() : 1.0/this.getExchangeRate();
        stocks.forEach(stock => {
            stock.unitValue = (stock.unitValue * multiplier).toFixed(2);
            stock.totalValue = (stock.unitValue * stock.quantity).toFixed(2);
        })
    }

    getExchangeRate() {
        const dataObject = this.props.EurToUSD;
        return (
            parseFloat(dataObject["Realtime Currency Exchange Rate"]["5. Exchange Rate"])
        )

    }

    getStockValue(metaData) {
        const dataObject = metaData;
        const latestTime = Object.keys(dataObject["Time Series (5min)"])[0];
        return (parseFloat(dataObject["Time Series (5min)"][latestTime]["1. open"]) +
            parseFloat(dataObject["Time Series (5min)"][latestTime]["2. high"]) +
            parseFloat(dataObject["Time Series (5min)"][latestTime]["3. low"]) +
            parseFloat(dataObject["Time Series (5min)"][latestTime]["4. close"])
        ) / 4.0

    }

    setRealTimeValueAndTotal(stock) {
        const stocks = this.state.stocks;
        const url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + stock.name + "&interval=5min&apikey=OHK5U5NEHY5FSE6A"
        axios.get(url).then(response => {
            const resp = response;
            if (resp["Note"] || resp["Error Message"]) {
                alert("Price for given stock name not found or reached API-call-limit! Unit value is set to 10USD.");
                stock.unitValue = 10;
                stock.totalValue = (stock.unitValue * stock.quantity).toFixed(2);
            } else {
                stock.unitValue = this.getStockValue(response.data).toFixed(2);
                stock.totalValue = (stock.unitValue * stock.quantity).toFixed(2);
                stocks.push(stock);
                this.setState({
                    stocks: stocks
                })
                localStorage.setItem(this.props.name, JSON.stringify(stocks));
            }
        });

    }

    addStock(stockSymbol, stockQuantity) {
        const stocks = this.state.stocks;
        if (!stocks.map(stock => stock.name).includes(stockSymbol)) {
            if (0 < stockSymbol.length && stockSymbol.length < 5 && stockQuantity > 0) {
                const stock = {name: stockSymbol.toUpperCase(), quantity: stockQuantity};
                this.setRealTimeValueAndTotal(stock);
                this.handleClose()
            }
            else if (stockQuantity < 1) {
                alert("Number of shares must be bigger than 0")
            }
            else if (stockSymbol.length < 0 || stockSymbol.length > 4) {
                alert("Stock symbol can have 3 to 4 letters")
            }
            else {
                this.handleClose()
            }

        }
        else {
            alert("The stock name already exists");
        }
    }


    handleClose = () => {
        this.setState({show: false});
    };

    checkboxClick(stockName) {
        const selectedStock = this.state.selectedStock;
        if (selectedStock.includes(stockName)) {
            selectedStock.splice(selectedStock.indexOf(stockName), 1)
            this.setState({
                selectedStock: selectedStock
            });
        }
        else {
            selectedStock.push(stockName);
            this.setState({
                selectedStock: selectedStock
            });
        }
    }

    countTotalValue() {
        const stocks = this.state.stocks;
        let sum = 0.0;
        stocks.forEach(stock => sum += parseFloat(stock.totalValue))
        return sum.toFixed(2)
    }

    removeSelectedStocks() {
        let stocks = this.state.stocks;
        this.state.selectedStock.forEach(selectedStock => {
            stocks = stocks.filter(stock => {
                return stock.name !== selectedStock
            })
        });
        this.setState({stocks: stocks});
        localStorage.setItem(this.props.name, JSON.stringify(stocks))
    }

    render() {
        return (
            <div className="portfolio">
                <div className="portfolioTop">
                    <p className="row portfolioName">{this.props.name}</p>
                    <button
                        className="row"
                        value="euro"
                        onClick={() => this.changeCurrency("euro")}>
                        Show in €
                    </button>
                    <button
                        className="row"
                        value="USD"
                        onClick={() => this.changeCurrency("USD")}>
                        Show in $
                    </button>
                    <button className="row deletePortfolioBtn"
                            onClick={() => this.props.removePortfolio(this.props.name)}><i className="fa fa-close"></i>
                    </button>
                </div>

                <PortfolioTable
                    stockTable={this.state.stocks}
                    checkboxClick={(stockName) => this.checkboxClick(stockName)}
                    currency={this.state.currencyUSD ? " $" : " €"}
                />
                <div className="portfolioBottom">
                    <p className="totalValue">
                        Total value of {this.props.name}: {this.countTotalValue()}{this.state.currencyUSD ? " $" : " €"}
                    </p>
                    <button className="row" onClick={() => this.setState({show: true})}>Add stock</button>
                    <AddStockAlert
                        show={this.state.show}
                        addStock={(symbol, quantity) => this.addStock(symbol, quantity)}
                        handleClose={this.handleClose}
                    />
                    <button className="row">Perf graph</button>
                    <button className="row lastBtn" onClick={() => this.removeSelectedStocks()}>Remove selected</button>
                </div>
            </div>
        );
    }
}

export default Portfolio;