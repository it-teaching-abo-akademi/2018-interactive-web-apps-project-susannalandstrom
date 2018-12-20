import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class AddStockAlert extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stockSymbol: "",
            stockQuantity: 0,

        };
        this.handleChange = this.handleChange.bind(this);
    };

    handleChange(evt) {
        this.setState({ [evt.target.name]: evt.target.value });
    }

    render() {
        const stockSymbol = this.state.stockSymbol
        const stockQuantity = this.state.stockQuantity
        return (
            <Dialog
        open={this.props.show}
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
            >
            <DialogTitle id="form-dialog-title">Add new stock</DialogTitle>
        <DialogContent>
            <DialogContentText>
                To subscribe to this website, please enter your email address here. We will send
                updates occasionally.
            </DialogContentText>
            <TextField
                autoFocus
                margin="dense"
                name="stockSymbol"
                label="Enter the stock symbol"
                type="text"
                value={stockSymbol}
                fullWidth
                onChange={this.handleChange}
            />
            <TextField
                margin="dense"
                name="stockQuantity"
                label="Number of shares"
                type="number"
                value={stockQuantity}
                fullWidth
                onChange={this.handleChange}
            />
        </DialogContent>
        <DialogActions>
        <Button onClick={this.props.handleClose} color="primary">
            Cancel
            </Button>
        <Button onClick={() => this.props.addStock(stockSymbol, stockQuantity)} color="primary">
            OK
        </Button>
        </DialogActions>
    </Dialog>
        )
    }
}
export default AddStockAlert;