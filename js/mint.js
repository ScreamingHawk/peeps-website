/* global ethers */

CONTRACTS = {
	4: '0xcc4cdcd1e014ddde753e91912713b595f847dfbd',
}

document.addEventListener('DOMContentLoaded', () => {
	// Unpkg imports
	const Web3Modal = window.Web3Modal.default
	const WalletConnectProvider = window.WalletConnectProvider.default

	// Chosen wallet provider given by the dialog window
	let provider
	// Contract
	let contract

	const providerOptions = {
		walletconnect: {
			package: WalletConnectProvider,
			options: {
				infuraId: '240248d1c65143c082ae6b411905d45a',
			},
		},
	}

	let web3Modal = new Web3Modal({
		cacheProvider: false,
		providerOptions,
		disableInjectedProvider: false,
	})

	// Update message
	function renderMessage(message) {
		let messageEl = document.getElementById('message')
		messageEl.innerHTML = message
	}
	// Remove message
	function clearMessage() {
		return renderMessage('')
	}
	// Update message with error
	function renderError(err) {
		console.log(err)
		let message = err
		if (err.code && err.reason) {
			message = `${err.code}: ${err.reason}`
		} else if (err.code && err.message) {
			message = `${err.code}: ${err.message}`
		}
		message = `<code class="error">${message}</code>`
		return renderMessage(message)
	}

	if (!window.PEEPTOKEN_ABI) {
			return renderError('Could not find Peep Token ABI')
	}

	// Show first section
	clearMessage()
	
	// Manage wallet connection
	const connectBtn = document.getElementById('connectBtn')

	const updateNetwork = async network => {
		connectBtn.setAttribute('hidden', true)
		if (CONTRACTS[network.chainId]) {
			contract = new ethers.Contract(CONTRACTS[network.chainId], JSON.stringify(PEEPTOKEN_ABI), provider.getSigner())

			clearMessage()

			// Check sale
			if (await contract.SALE_ACTIVE()) {
				document.getElementById('mintSection').removeAttribute('hidden')
				document.getElementById('notYet').setAttribute('hidden', true)
				return true
			}
		} else {
			renderError('Contract not yet deployed on this network!')
		}

		// Fail out
		document.getElementById('notYet').removeAttribute('hidden')
		document.getElementById('mintSection').setAttribute('hidden', true)
		return false
	}

	connectBtn.addEventListener('click', async () => {
		await window.Web3Modal.removeLocal('walletconnect')
		try {
			provider = await web3Modal.connect()
			provider = new ethers.providers.Web3Provider(provider, "any")
			provider.on("network", updateNetwork);
		} catch (err) {
			const msg = 'Could not get a wallet connection'
			console.log(msg, err)
			return renderError(msg)
		}
	})

	// Mint button
	const mintButton = document.getElementById('mintBtn')
	mintButton.addEventListener('click', async () => {
		await updateNetwork(provider._network)

		qty = parseFloat(document.getElementById('qty').value, 10)

		renderMessage('Minting! Please wait...')

		try {
			const tx = await contract.mint(qty, {
				value: (await contract.TOKEN_PRICE()).mul(qty)
			});

			renderMessage('Waiting for confirmation...')
			await tx.wait()

			renderMessage(`<h3>You got ${qty > 1 ? qty + ' Peeps' : 'a Peep'}!</h3>`)
		} catch (err) {
			if (err.code === 4001) {
				renderError('Transaction declined')
			} else {
				renderError(err)
			}
		}
	})
})
