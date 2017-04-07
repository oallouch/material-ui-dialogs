import React, {PureComponent, PropTypes} from 'react';
import { Provider } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';

import { showDialog } from './material-ui-dialogs';

class ReduxFormDialog extends PureComponent {
	static propTypes = {
		title: PropTypes.string,
		onCancel: PropTypes.func,
		children: PropTypes.element.isRequired
	};

	static defaultProps = {
		title: 'Form',
		onCancel: () => {}
	};

	static contextTypes = {
		store: React.PropTypes.shape({
			subscribe: React.PropTypes.func.isRequired,
			dispatch: React.PropTypes.func.isRequired,
			getState: React.PropTypes.func.isRequired
		})
	};

	constructor(props, context) {
		super(props);
		this.store = context.store;
	}

	cancelAction = (resolve, contentComponent) => resolve(null);
	okAction = async (resolve, contentComponentArg) => { // contentComponentArg is the Provider
		//---- submit call on the form component ----//
		await this.formComponent.submit();
	};

	/**
	 * @return {Promise}
	 */
	show(initialValues) {
		let dialogResolve;
		//----------------- okCancelActions ---------------------//
		const okCancelActions = [
      <FlatButton
        label="Cancel"
        secondary={ true }
        action={ this.cancelAction }
      />,
      <FlatButton
        label="Ok"
        primary={ true }
        action={ this.okAction }
      />,
		];

		//---- formElement cloning ----//
		// we don't use the contentComponent provided by the action callback, because it's only the <Provider>
		let formElement = React.Children.only(this.props.children); // there's only 1 child (fixed in PropTypes)
		formElement = React.cloneElement(formElement, {
			onSubmit: values => { // can be called on keyboard (like the 'enter' key)
				dialogResolve(values);
			},
			ref: formComponentArg => {
				this.formComponent = fromComponentToForm(formComponentArg);
			},
			initialValues
		});

		return showDialog({
			resolveRef: resolve => { dialogResolve = resolve; },
			actions: okCancelActions,
			title: this.props.title,
			contentStyle: this.props.contentStyle,
			autoScrollBodyContent: this.props.autoScrollBodyContent,
			content:
        <Provider store={this.store}>
					{formElement}
        </Provider>
		});
	}

	render() {
		return null;
	}
}

export function fromComponentToForm(component) {
	if (!component) {
		return null;
	} else if (component.getWrappedInstance) {
		//-- 'connect' was used (hopefully with the {withRef: true} option )--//
		return component.getWrappedInstance();
	} else {
		//-- it's the form --//
		return component;
	}
}

export default ReduxFormDialog;
