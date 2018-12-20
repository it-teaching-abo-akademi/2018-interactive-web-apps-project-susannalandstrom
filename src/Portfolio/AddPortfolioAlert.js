import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class AddPortfolioAlert extends Component {
    constructor(props) {
        super(props);
        this.state = {
            portfolioName: "",

        };
        this.handleChange = this.handleChange.bind(this);
    };

    handleChange(evt) {
        this.setState({ [evt.target.name]: evt.target.value });
    }

    render() {
        const portfolioName = this.state.portfolioName
        return (
            <Dialog
                open={this.props.showPortfolio}
                onClose={this.handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Create new portfolio</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To subscribe to this website, please enter your email address here. We will send
                        updates occasionally.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="portfolioName"
                        label="Enter the portfolio name"
                        type="text"
                        value={portfolioName}
                        fullWidth
                        onChange={this.handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => this.props.addNewPortfolio(portfolioName)} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}
export default AddPortfolioAlert;