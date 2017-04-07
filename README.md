# material-ui-dialogs

## Use

```js
//--------------------- Simple helper functions -------------------//
async function main() {
	await muiDialogs.alert({
		title: 'My title',
		content: 'My message',
		okLabel: 'Ok'
	})
}
main()


//------------------------ with Redux Form -------------------------//
class TestReduxFormDialog extends PureComponent {
	formDialogRef = formDialog => {
		this.formDialog = formDialog;
	}
	
	showForm = async() => {
		const values = await this.formDialog.show();
		// values is null if the dialog was cancelled
		console.log("values", values);
	}
	
	render() {
		return (
			<FlatButton onTouchTap={this.showForm} label="ShowForm"/>
			<ReduxFormDialog
				ref={this.formDialogRef}
				title="Form Title"
			>
				<AnyReduxForm />
			</ReduxFormDialog>
		)
	}
}
// you can use the showForm function directly, but you'll have to provide the Redux store as an argument.
```