const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {



	let disposable = vscode.commands.registerCommand('AutoTag.GOAutoTag', function () {

		let doc = vscode.window.activeTextEditor.document
		if (!doc.fileName.endsWith('.go')) {
			return;
		}

		const jsonTags = buildObjects(doc);
		console.log(jsonTags)


		vscode.window.showInformationMessage('Hello World from AutoTag!');
	});

	context.subscriptions.push(disposable);
}



function JSONTag(tag, lineNum, charPos) {
	this.tag = tag;
	this.lineNum = lineNum;
	this.charPos = charPos
}

function buildObjects(doc) {
	const text = doc.getText();
	let lines = text.split(/\n/)
	let jsonTags = []
	for (let i = 0; i < lines.length; i++) {

		if (lines[i].includes("struct")) {
			i++;
			while (!lines[i].includes("}") && !lines[i].includes("\`")) {
				let jsonTag = createJSONTag(lines[i], i)
				jsonTags.push(jsonTag)
				i++
			}
		}
	}
	placeJSONTags(jsonTags)

}



function createJSONTag(tagLine, i) {
	let endOfLine = tagLine.length + 4
	tagLine = tagLine.trim()
	let json = "\`json:\""
	if (!(tagLine === "")) {
		let word = tagLine.split(/\s/)[0]

		if (isUpperCase(word)) {
			json += word.toLowerCase()
		} else {
			json += word.charAt(0).toLowerCase();
			let index = 1;
			if (isUpperCase(word.charAt(index))) {
				while (isUpperCase(word.charAt(index + 1)) && !isNumeric(word.charAt(index))) {
					json += word.charAt(index).toLowerCase();
					index++;

				}
			}

			for (let j = index; j < word.length; j++) {
				json += word.charAt(j)
			}

		}
	}
	json += "\"\`"
	let jsonTag = new JSONTag(json, i, endOfLine)
	return jsonTag;

}





async function placeJSONTags(jsonTags) {
	for (const jsonTag of jsonTags) {
		console.log(jsonTag)
		await vscode.window.activeTextEditor.edit((editBuilder) => {
			editBuilder.insert(new vscode.Position(jsonTag.lineNum, jsonTag.charPos), "\t" + jsonTag.tag);
		})
	}
}


function isLowerCase(str) {
	return str == str.toLowerCase() && str != str.toUpperCase();
}
function isUpperCase(str) {
	return str != str.toLowerCase() && str == str.toUpperCase();
}

function isNumeric(str) {
	return !isUpperCase(str) && !isLowerCase(str)
}


function deactivate() { }

module.exports = {
	activate,
	deactivate
}
