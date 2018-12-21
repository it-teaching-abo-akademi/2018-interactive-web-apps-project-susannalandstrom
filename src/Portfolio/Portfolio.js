import React, {Component} from 'react';
import PortfolioTable from "./PortfolioTable";
import AddStockAlert from "./AddStockAlert";
import axios from 'axios';
import AddPerfGraphAlert from "./AddPerfGraphAlert";

class Portfolio extends Component {
    constructor(props) {
        super(props);

        this.state = {
            newStockSymbol: "",
            newStockQuantity: 0,
            selectedStock: [],
            stocks: [],
            totalValue: 0,
            show: false,
            showGraph: false,
            currencyEur: false,
        };
        this.changeCurrency = this.changeCurrency.bind(this);
        this.countNewValues = this.countNewValues.bind(this);
        this.getExchangeRate = this.getExchangeRate.bind(this);
        this.addStock = this.addStock.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.checkboxClick = this.checkboxClick.bind(this);
        this.countTotalValue = this.countTotalValue.bind(this);
        this.removeSelectedStocks = this.removeSelectedStocks.bind(this);
        this.setRealTimeValueAndTotal = this.setRealTimeValueAndTotal.bind(this);
        this.updateRealTimeValueAndTotal = this.updateRealTimeValueAndTotal.bind(this);
    }

    componentDidMount() {
        this.setState({
            stocks: JSON.parse(localStorage.getItem(this.props.name))
        }, () => {
            this.state.stocks.forEach(stock => {
                const newStock = {name: stock.name, quantity: stock.quantity}
                this.updateRealTimeValueAndTotal(newStock)
            })
        })
    }

    changeCurrency(currency) {
        const currencyEur = this.state.currencyEur;
        const selectedCurrency = currency;
        if (selectedCurrency === "euro" && !currencyEur)
            this.setState({currencyEur: true}, () => {
                this.countNewValues();
            });
        else if (selectedCurrency === "USD" && currencyEur) {
            this.setState({currencyEur: false}, () => {
                this.countNewValues();
            });
        }
    }

    countNewValues() {
        const stocks = this.state.stocks;
        const multiplier = this.state.currencyEur ? 1.0 / this.getExchangeRate() : this.getExchangeRate();
        stocks.forEach(stock => {
            stock.unitValue = (stock.unitValue * multiplier).toFixed(2);
            stock.totalValue = (stock.unitValue * stock.quantity).toFixed(2);
        })
        this.forceUpdate();
    }

    getExchangeRate() {
        const dataObject = this.props.EurToUSD;
        return (
            parseFloat(dataObject["Realtime Currency Exchange Rate"]["5. Exchange Rate"])
        )

    }

    getStockValue(metaData) {
        console.log(Object.keys(metaData["Time Series (5min)"])[0])
        const latestTime = Object.keys(metaData["Time Series (5min)"])[0];
        return (parseFloat(metaData["Time Series (5min)"][latestTime]["1. open"]) +
            parseFloat(metaData["Time Series (5min)"][latestTime]["2. high"]) +
            parseFloat(metaData["Time Series (5min)"][latestTime]["3. low"]) +
            parseFloat(metaData["Time Series (5min)"][latestTime]["4. close"])
        ) / 4.0

    }

    setRealTimeValueAndTotal(stock) {
        const stocks = this.state.stocks;
        const url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + stock.name + "&interval=5min&apikey=OHK5U5NEHY5FSE6A"
        axios.get(url).then(response => {
            console.log(response)
            if (response.data["Note"]) {
                alert("Price for given stock name not found or reached API-call-limit! Unit value is set to 10USD.");
                stock.unitValue = 10;
                stock.totalValue = (stock.unitValue * stock.quantity).toFixed(2);
            } else {
                stock.unitValue = this.getStockValue(response.data).toFixed(2);
                stock.totalValue = (stock.unitValue * stock.quantity).toFixed(2);
                stocks.push(stock);
                this.setState({
                    stocks: stocks
                });
                localStorage.setItem(this.props.name, JSON.stringify(stocks));
            }
        });

    }

    updateRealTimeValueAndTotal(stock) {
        const stocks = this.state.stocks;
        const url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + stock.name + "&interval=5min&apikey=OHK5U5NEHY5FSE6A"
        axios.get(url).then(response => {
            if(response.data["Note"]){
                alert("Already fetched 5 times within a minute from Alphavantage. Cannot fetch more.")
                return;
            }
            const unitValue = this.getStockValue(response.data).toFixed(2);
            const totalValue = (unitValue * stock.quantity).toFixed(2);
            const index = stocks.map(stock => stock.name).indexOf(stock.name);
            stocks[index] = {name: stock.name, quantity: stock.quantity, unitValue: unitValue, totalValue: totalValue}
            this.setState({
                stocks: stocks
            })
        })

    }

    addStock(stockSymbol, stockQuantity) {
        const stocks = this.state.stocks;
        if (stocks.length < 50) {
            if (!stocks.map(stock => stock.name).includes(stockSymbol.toUpperCase())) {
                if (0 < stockSymbol.length && stockSymbol.length < 5 && stockQuantity > 0) {
                    const stock = {name: stockSymbol.toUpperCase(), quantity: stockQuantity};
                    this.setRealTimeValueAndTotal(stock);
                    this.handleClose()
                    this.setState({
                        newStockSymbol: "",
                        newStockQuantity: 0,
                    });
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
                this.setState({
                    newStockSymbol: "",
                    newStockQuantity: 0,
                });
            }
        }
        else {
            alert("Portfolio can only contain 50 different stocks. You need to first remove one to add a new stock");
            this.setState({
                newStockSymbol: "",
                newStockQuantity: 0,
            });
        }
    }

    handleChange(evt) {
        this.setState({[evt.target.name]: evt.target.value});
    }

    handleClose = () => {
        this.setState({show: false});
        this.setState({showGraph: false})
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
                    currency={this.state.currencyEur ? " €" : " $"}
                />
                <div className="portfolioBottom">
                    <p className="totalValue">
                        Total value of {this.props.name}: {this.countTotalValue()}{this.state.currencyEur ? " €" : " $"}
                    </p>
                    <button className="row" onClick={() => this.setState({show: true})}>Add stock</button>
                    <AddStockAlert
                        show={this.state.show}
                        addStock={(symbol, quantity) => this.addStock(symbol, quantity)}
                        stockSymbol={this.state.newStockSymbol}
                        stockQuantity={this.state.newStockQuantity}
                        handleChange={this.handleChange}
                        handleClose={this.handleClose}
                    />
                    <button className="row" onClick={() => this.setState({showGraph: true})}>Perf graph</button>
                    <AddPerfGraphAlert
                        showGraph={this.state.showGraph}
                        portfolioName={this.props.name}
                        handleChange={this.handleChange}
                        handleClose={this.handleClose}
                    />
                    <button className="row lastBtn" onClick={() => this.removeSelectedStocks()}>Remove selected</button>
                </div>
            </div>
        );
    }
}

export default Portfolio;