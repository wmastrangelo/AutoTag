// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	let handler = async (/** @type {vscode.TextDocument} */ doc) => {
		if(!doc.fileName.endsWith('.go')){
			return;
		}

		buildTag(doc);
	}
	
	const didOpen = vscode.workspace.onDidOpenTextDocument(doc => handler(doc));
	const didChange = vscode.workspace.onDidChangeTextDocument(e => handler(e.document));
	
	if (vscode.window.activeTextEditor){
		await handler(vscode.window.activeTextEditor.document);
	}
	let disposable = vscode.commands.registerCommand('AutoTag.GOAutoTag', function () {
		vscode.window.activeTextEditor.document

		
		vscode.window.showInformationMessage('Hello World from AutoTag!');
	});

	context.subscriptions.push(disposable);
}

function buildTag(doc){
	const text = doc.getText();
	getStructs(text)

}

function getStructs(text) {
	let lines = text.split(/\n/)
	
	let structLines = []
	for( let i = 0; i< lines.length; i++){
		if(lines[i].includes("struct") && !lines[i].includes("//")){
			structLines.push(i+1)
		}
	}
	console.log(structLines)
	return structLines
}



function deactivate() {}

module.exports = {
	activate,
	deactivate
}
