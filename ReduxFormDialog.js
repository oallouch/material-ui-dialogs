import React from 'react';
import { Provider } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';

import { makeDialogAndWait } from './index-source';

/**
 * we need to make it a Component to get the context
 */
class ReduxFormDialog extends React.Component {
	constructor(props, context) {
		super(props);
		this.store = context.store;
	}

	/**
	 * @return {Promise}
	 */
  show() {
		let dialogDeferred;
    //----------------- okCancelActions ---------------------//
    const okCancelActions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        action={ (resolve, contentComponent) => resolve(null) }
      />,
      <FlatButton
        label="Ok"
        primary={true}
        action={(resolve, contentComponentArg) => { // contentComponentArg is the Provider
          //---- submit call on the form component ----//
          this.formComponent.submit();
        }}
      />,
    ];

    //---- formElement cloning ----//
    // we don't use the contentComponent provided by the action callback, because it's only the <Provider>
    let formElement = React.Children.only(this.props.children); // there's only 1 child (fixed in PropTypes)
    formElement = React.cloneElement(formElement, {
      onSubmit: values => { // can be called on keyboard (like the 'enter' key)
        dialogDeferred.resolve(values);
      },
      ref: formComponentArg => {
        if (!formComponentArg) {
          this.formComponent = null;
        } else if (formComponentArg.refs.wrappedInstance) {
          //-- 'connect' was used (hopefully with the {withRef: true} option )--//
          this.formComponent = formComponentArg.refs.wrappedInstance;
        } else {
          //-- it's the form --//
          this.formComponent = formComponentArg;
        }
      }
    });

    return makeDialogAndWait({
			deferredRef: deferred => { dialogDeferred = deferred; },
      actions: okCancelActions,
      title: this.props.title,
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

ReduxFormDialog.propTypes = {
  title: React.PropTypes.string,
  onCancel: React.PropTypes.func,
  children: React.PropTypes.element.isRequired
}

ReduxFormDialog.defaultProps = {
  title: 'Form',
  onCancel: () => {}
}

ReduxFormDialog.contextTypes = {
  store: React.PropTypes.shape({
    subscribe: React.PropTypes.func.isRequired,
    dispatch: React.PropTypes.func.isRequired,
    getState: React.PropTypes.func.isRequired
  })
}

export default ReduxFormDialog;
