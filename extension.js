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

		const docData = buildObjects(doc);
		addJSONTags(docData)
	}
	
	const didOpen = vscode.workspace.onDidOpenTextDocument(doc => handler(doc));
	
	if (vscode.window.activeTextEditor){
		await handler(vscode.window.activeTextEditor.document);
	}
	let disposable = vscode.commands.registerCommand('AutoTag.GOAutoTag', function () {
		vscode.window.activeTextEditor.document

		
		vscode.window.showInformationMessage('Hello World from AutoTag!');
	});

	context.subscriptions.push(disposable);
}

function DocData(lines){
	this.lines = lines;
	this.structs = [];
}

function Struct(start, end, tagsExist){
	this.start = start;
	this.end = end;
	this.tagsExist = tagsExist;
}

function buildObjects(doc){
	const text = doc.getText();
	let lines = text.split(/\n/)
	const docData = new DocData(lines)
	const structLines = getStructs(docData.lines)
	
	for(let i = 0; i < structLines.length; i+=2){
		docData.structs.push(new Struct(structLines[i], structLines[i+1], tagsExist(docData.lines, structLines[i], structLines[i+1])))
	}

	return docData
}

function getStructs(lines) {
	let structLines = []
	for( let i = 0; i< lines.length; i++){
		if(lines[i].includes("struct") && !lines[i].includes("//")){
			structLines.push(i+1)
			while(!lines[i].includes("}")){
				i++
			}
			structLines.push(i+1)
		}
	}
	return structLines;
}

function tagsExist(lines, start, end){
		for(let j = start; j < end; j++){
			if (lines[j].includes("\`")){
				return true;
			}

		}
		return false
	

}

function addJSONTags(docData){
	docData.structs.forEach(function(struct){
		for(let i = struct.start; i < struct.end-1; i++){
			let line = docData.lines[i].trim()
			if(!(line === "")){
				let word = line.split(/\s/)[0]
				let jsonTag = "\`json:\""
				jsonTag += word.charAt(0).toLowerCase();
				for(let j = 1; j < word.length; j++){
					if(isLowerCase(word.charAt(j))){
						jsonTag +=word.charAt(j)
					} else {
						jsonTag+=word.charAt(j)
					}
				}
				jsonTag += "\"\`"
				console.log(jsonTag)
			}
		}
	})
	
}

function isLowerCase(str)
{
    return str == str.toLowerCase() && str != str.toUpperCase();
}


function deactivate() {}

module.exports = {
	activate,
	deactivate
}
