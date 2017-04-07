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

	showDialog = async() => {
		const values = await this.formDialog.show();
		// values can be null if the dialog is cancelled
	}
	
	render() {
		return (
            <ReduxFormDialog
                ref={this.formDialogRef}
                title="Form Title"
            >
              <AnyReduxForm />
            </ReduxFormDialog>
        )
	}
}
```