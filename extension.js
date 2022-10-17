// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
 function activate(context) {

	
		
	let disposable = vscode.commands.registerCommand('AutoTag.GOAutoTag',   function () {
		
		let doc = vscode.window.activeTextEditor.document
		if(!doc.fileName.endsWith('.go')){
			return;
		}

		const docData = buildObjects(doc);
		console.log(docData.jsonTags)

	 placeJSONTags(docData);
		vscode.window.showInformationMessage('Hello World from AutoTag!');
	});

	context.subscriptions.push(disposable);
}

function DocData(lines){
	this.lines = lines;
	this.structs = [];
	this.jsonTags = [];
}

function Struct(start, end, fullTags){
	this.start = start;
	this.end = end;
	this.fullTags = fullTags;
	
}

function JSONTag(tag, lineNum, charPos){
	this.tag = tag;
	this.lineNum = lineNum;
	this.charPos = charPos
}

function buildObjects(doc){
	const text = doc.getText();
	let lines = text.split(/\n/)
	const docData = new DocData(lines)
	const structLines = getStructLines(docData.lines)
	
	
	for(let i = 0; i < structLines.length; i+=2){
		let struct = new Struct(structLines[i], structLines[i+1], fullTags(docData.lines, structLines[i], structLines[i+1]))
		
		docData.structs.push(struct)
	}
	const jsonTags = createJSONTags(docData)
	
	docData.jsonTags = jsonTags


	return docData
}

function getStructLines(lines) {
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

function fullTags(lines, start, end){
		for(let j = start; j < end; j++){
			if (lines[j].includes("\`")){
				return true;
			}

		}
		return false
	

}

function createJSONTags(docData){
	let jsonTags = []
	docData.structs.forEach(function(struct){
		for(let i = struct.start; i < struct.end-1; i++){
			if(!struct.fullTags){
			let line = docData.lines[i]
			let endOfLine = line.length + 4
			line = line.trim()
			let json = "\`json:\""
			if(!(line === "")){
				let word = line.split(/\s/)[0]
				
				
				if(isUpperCase(word)){
					json += word.toLowerCase()
				}else{
					json += word.charAt(0).toLowerCase();
				let index = 1;
				if(isUpperCase(word.charAt(index))){
				while(isUpperCase(word.charAt(index+1)) && !isNumeric(word.charAt(index))){
					json += word.charAt(index).toLowerCase();
					index++;
					
				}
			}

				for(let j = index; j < word.length; j++){
						json +=word.charAt(j)
				}}
				
				
			}
			json += "\"\`"
				let jsonTag = new JSONTag(json,i, endOfLine)
				jsonTags.push(jsonTag)
		}}
	})
			return jsonTags
}

async function placeJSONTags(docData){
	for(const jsonTag of docData.jsonTags) {
		console.log(jsonTag)
		await vscode.window.activeTextEditor.edit((editBuilder) =>  {
			 editBuilder.insert(new vscode.Position(jsonTag.lineNum,jsonTag.charPos),"\t"+ jsonTag.tag);
			
		})
}}


function isLowerCase(str)
{
    return str == str.toLowerCase() && str != str.toUpperCase();
}
function isUpperCase(str)
{
    return str != str.toLowerCase() && str == str.toUpperCase();
}

function isNumeric(str){
	return !isUpperCase(str) && !isLowerCase(str)
}


function deactivate() {}

module.exports = {
	activate,
	deactivate
}
