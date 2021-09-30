/* global ethers */

// svg filenames
const expressions = ["Blush", "Erm", "Gentle Red", "Humph", "Joy", "Lick Lips", "Mad", "Meow", "Oh!", "Shock"]

document.addEventListener('DOMContentLoaded', () => {
	peepEl = document.getElementById("peep")
	peep = ""

	// Load the peep
	xhr = new XMLHttpRequest()
	xhr.open("GET", "https://peeps.club/metadata/MilkyTaste.svg", false)
	xhr.overrideMimeType("image/svg+xml")
	xhr.onload = () => {
		peep = xhr.responseXML.documentElement
		peepEl.innerHTML = ''
		peepEl.appendChild(peep)
	}
	xhr.send("")

	document.getElementById("background-toggle").addEventListener("click", () => {
		let el = document.getElementById("Background")
		if (el.style.display == 'none'){
			el.style.display = ''
		} else {
			el.style.display = 'none'
		}
	})

	setupExpressionSelect()

	document.getElementById("expression-select").addEventListener("change", () => {
		setExpression(document.getElementById("expression-select").selectedIndex)
	})

	document.getElementById("expression-forward").addEventListener("click", () => {
		setExpressionByOffset(1)
	})

	document.getElementById("expression-backward").addEventListener("click", () => {
		setExpressionByOffset(-1)
	})

	document.getElementById("connect-wallet").addEventListener("click", () => {
		alert('Coming soon!\nPlay with MilkyTaste while you wait.')
	})

	document.getElementById("download-png").addEventListener("click", () => {
		alert('Coming soon!\nTake a screenshot while you wait.')
	})

})


let setupExpressionSelect = () => {
	let el = document.getElementById("expression-select")
	expressions.forEach((expression, i) => {
		let option = document.createElement("option");
		option.text = expression;
		el.add(option)
	});
}

// for left and right selection of expressions
let setExpressionByOffset = offset => {
	let currentIndex = document.getElementById("expression-select").selectedIndex
	currentIndex = currentIndex + offset
	if (currentIndex == 0){
		currentIndex = expressions.length
	}
	if (currentIndex > expressions.length) {
		currentIndex = 1
	}
	setExpression(currentIndex)
}

let setExpression = index => {
	if (index == 0){
		return
	}
	let el = document.getElementById("Expression")
	// load the new expression
	xhr = new XMLHttpRequest()
	xhr.open("GET", `/assets/traits/expressions/${expressions[index - 1]}.svg`, false)
	xhr.overrideMimeType("image/svg+xml")
	xhr.onload = () => {
		expression = xhr.responseXML.documentElement
		el.innerHTML = ''
		el.appendChild(expression.getElementsByTagName("g")[0])
		document.getElementById("expression-select").getElementsByTagName('option')[index].selected = "selected"
		if(expression.getElementsByTagName("defs")[0]){
			// remove old defs
			if(document.getElementById("current-expression"))
				document.getElementById("current-expression").remove()

			// add new defs
			let defs = document.querySelectorAll("#peep svg")[0]
			let newDefs = expression.getElementsByTagName("defs")[0]
			newDefs.id = "current-expression"
			defs.appendChild(newDefs)
		}
	}
	xhr.send("")
}
