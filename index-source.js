import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

class Deferred {
	constructor() {
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		})
	}
}

/**
 * Note: the end of material-ui's Dialog.positionDialog must be
 *
 if (dialogContent.offsetHeight > maxDialogContentHeight) {
					dialogContent.style.height = maxDialogContentHeight + 'px';
        }
 dialogContent.style.maxHeight = maxDialogContentHeight + 'px';
 */
class PromisifiedDialog extends PureComponent {
	constructor(props) {
		super(props);
		this.state = { open: true };
	}

	cleanup() {
		this.setState({ open: false });

		//---- cleanup after Dialog closing animation ----//
		setTimeout(() => {
			ReactDOM.unmountComponentAtNode(this.props.div)
			document.body.removeChild(this.props.div)
		}, 2000)
	}

	resolve(value) {
		this.props.deferred.resolve(value);
		this.cleanup();
	}

	render() {
		const actions = this.props.actions.map(action => React.cloneElement(action, {
			onClick: () => action.props.action(value => this.resolve(value) , this._contentComponent)
		}));

		return (
			<MuiThemeProvider muiTheme={getMuiTheme()}>
				<Dialog
					open={this.state.open}
					actions={actions}
					title={this.props.title}
					bodyStyle={this.props.contentStyle}
					autoScrollBodyContent={this.props.autoScrollBodyContent || false}
				>
					{React.cloneElement(this.props.content, { ref: content => this._contentComponent = content })}
				</Dialog>
			</MuiThemeProvider>
		)
	}
}

/**
 * @param {object} options :
 * 		{Array<ReactElement>} actions each action contains an 'action' event callback with the signature (resolve, contentComponent):void
 * 		{string} title,
 * 		{ReactElement} content
 *    {boolean} autoScrollBodyContent
 *    {object} contentStyle
 *   @return {Promise}
 */
export function showDialog(options) {
	const deferred = new Deferred();
	const div = document.createElement('div');
	document.body.appendChild(div);

	const ref = promisifiedDialog => {
		if (options.resolveRef) {
			options.resolveRef(value => {
				promisifiedDialog.resolve(value);
			});
		}
	}

	ReactDOM.render(<PromisifiedDialog ref={ref} deferred={deferred} div={div} {...options} />, div)

	return deferred.promise;
}

//------------------------ alert -------------------------//
export function alert({title = 'Alert', content}) {
	return showDialog({
		title,
		actions: [
			<FlatButton
				label="Ok"
				primary={true}
				action={ (resolve, contentComponent) => resolve() }
			/>
		],
		content: <div>{content}</div>
	});
}

//------------------------ confirm -------------------------//
export function confirm({title = 'Confirmation', message}) {
	return showDialog({
		title,
		actions: [
			<FlatButton
				label="Cancel"
				secondary={true}
				action={ (resolve, contentComponent) => resolve(false) } />,
			<FlatButton
				label="Confirm"
				primary={true}
				action={ (resolve, contentComponent) => resolve(true) } />
		],
		content: <div>{message}</div>
	});
}

//------------------------ prompt -------------------------//
class PromptComponent extends PureComponent {
	componentDidMount() {
		setTimeout(() => {
			this.refs.text.focus();
		}, 200);
	}

	getValue() {
		return this.refs.text.getValue();
	}

	render() {
		return <div>
			<div>{this.props.message}</div>
			<div>
				<TextField
					name="promptValue"
					fullWidth={true}
					defaultValue={this.props.defaultValue}
					ref="text"
				/>
			</div>
		</div>
	}
}

export function prompt({title = 'Prompt', message, defaultValue = ''}) {
	return showDialog({
		title,
		actions: [
			<FlatButton
				label="Cancel"
				secondary={true}
				action={ (resolve, contentComponent) => resolve(null) } />,
			<FlatButton
				label="Ok"
				primary={true}
				action={ (resolve, contentComponent) => resolve(contentComponent.getValue()) } />
		],
		content: <PromptComponent message={message} defaultValue={defaultValue} />
	});
}
