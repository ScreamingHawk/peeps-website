/* global ethers */

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

	document.getElementById("connect-wallet").addEventListener("click", () => {
		alert('Coming soon!\nPlay with MilkyTaste while you wait.')
	})

	document.getElementById("download-png").addEventListener("click", () => {
		alert('Coming soon!\nTake a screenshot while you wait.')
	})

})
