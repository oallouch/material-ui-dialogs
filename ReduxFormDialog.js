import React, {PureComponent} from 'react';
import { Provider } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';

import { showDialog } from './material-ui-dialogs';

class ReduxFormDialog extends PureComponent {
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
		return showForm({
			form: React.Children.only(this.props.children),
			store: this.store,
			initialValues,
			title: this.props.title,
			contentStyle: this.props.contentStyle,
			autoScrollBodyContent: this.props.autoScrollBodyContent,
		});
	}

	render() {
		return null;
	}
}

/**
 * @param store
 * @param form
 * @param title optional
 * @param initialValues optional
 * @param cancelLabel default value: "Cancel"
 * @param okLabel default value: "Ok"
 * @param contentStyle optional
 * @param autoScrollBodyContent optional
 * @returns {Promise}
 */
export function showForm({title = "Form", form, initialValues, cancelLabel = "cancel", okLabel = "ok", store, contentStyle, autoScrollBodyContent}) {
	let dialogResolve;
	let formComponent;

	//----------------- okCancelActions ---------------------//
	const cancelAction = (resolve, contentComponent) => resolve(null);
	const okAction = async (resolve, contentComponentArg) => { // contentComponentArg is the Provider
		//---- submit call on the form component ----//
		await formComponent.submit();
	};
	const okCancelActions = [
		<FlatButton
			label={cancelLabel}
			secondary={true}
			action={cancelAction}
		/>,
		<FlatButton
			label={okLabel}
			primary={true}
			action={okAction}
		/>,
	];

	//----------------- formElement cloning ------------------//
	// we don't use the contentComponent provided by the action callback, because it's only the <Provider>
	let formElement = React.cloneElement(form, {
		onSubmit: values => { // can be called on keyboard (like the 'enter' key)
			dialogResolve(values);
		},
		ref: formComponentArg => {
			formComponent = fromComponentToForm(formComponentArg);
		},
		initialValues
	});

	return showDialog({
		resolveRef: resolve => { dialogResolve = resolve; },
		actions: okCancelActions,
		title: title,
		contentStyle: contentStyle,
		autoScrollBodyContent: autoScrollBodyContent,
		content:
			<Provider store={store}>
				{formElement}
			</Provider>
	});

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
