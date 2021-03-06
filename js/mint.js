/* global ethers */

CONTRACTS = {
	4: {
		PEEPTOKEN: '0xF33691484898f9A79ca490B5E46e4596e6795401',
		PEEPTOKENFACTORY: '0x6383c81D43fE4f0C32c33C4B597585ef9Fae4d05',
	}
}

document.addEventListener('DOMContentLoaded', () => {
	// Unpkg imports
	const Web3Modal = window.Web3Modal.default
	const WalletConnectProvider = window.WalletConnectProvider.default

	// Chosen wallet provider given by the dialog window
	let provider
	// Contracts
	let peepToken, peepTokenFactory

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
	function renderMessage(message, el = 'message') {
		let messageEl = document.getElementById(el)
		messageEl.innerHTML = message
	}
	// Remove message
	function clearMessage() {
		return renderMessage('')
	}
	// Update message with error
	function renderError(err, el) {
		console.log(err)
		let message = err
		if (err.code && err.reason) {
			message = `${err.code}: ${err.reason}`
		} else if (err.code && err.message) {
			message = `${err.code}: ${err.message}`
		}
		message = `<code class="error">${message}</code>`
		return renderMessage(message, el)
	}

	if (!window.PEEPTOKEN_ABI) {
		return renderError('Could not find Peep Token ABI')
	}

	// Show first section
	clearMessage()
	
	// Manage wallet connection
	const connectBtn = document.getElementById('connectBtn')

	const updateReserved = async signer => {
		const reservedAmount = await peepTokenFactory.reservedAmount(await signer.getAddress())
		if (reservedAmount > 0) {
			document.getElementById('reservedCount').textContent = reservedAmount
			const cappedAmount = reservedAmount > 100 ? 100 : reservedAmount // Cap to 100
			const qtyBox = document.getElementById('reserveMintQty')
			qtyBox.value = cappedAmount
			qtyBox.max = cappedAmount

			document.getElementById('hasReservations').removeAttribute('hidden')
			return true
		}
		document.getElementById('hasReservations').setAttribute('hidden', true)
		return false
	}

	const updateNetwork = async network => {
		connectBtn.setAttribute('hidden', true)
		if (CONTRACTS[network.chainId]) {
			const { PEEPTOKEN, PEEPTOKENFACTORY } = CONTRACTS[network.chainId]
			const signer = provider.getSigner()
			peepToken = new ethers.Contract(PEEPTOKEN, PEEPTOKEN_ABI, signer)
			peepTokenFactory = new ethers.Contract(PEEPTOKENFACTORY, PEEPTOKENFACTORY_ABI, signer)

			renderMessage('Loading...')

			// Check sale
			const active = await peepTokenFactory.SALE_ACTIVE()
			const hasRes = await updateReserved(signer)
			if (hasRes) {
				document.getElementById('mintin1Section').setAttribute('hidden', true)
			} else {
				if (active) {
					// No Reservations and active
					document.getElementById('mintin1Section').removeAttribute('hidden')
				} else {
					// No reservations not active
					document.getElementById('mintin1Section').setAttribute('hidden', true)
				}
			}
			if (active) {
				// Active
				document.getElementById('reserveSection').removeAttribute('hidden')
			} else {
				document.getElementById('reserveSection').setAttribute('hidden', true)
			}
			clearMessage()
			if (active) {
				document.getElementById('mintSection').removeAttribute('hidden')
				document.getElementById('notYet').setAttribute('hidden', true)
			}
			if (active || hasRes) {
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

	// Reserve button
	const reserveButton = document.getElementById('reserveBtn')
	reserveButton.addEventListener('click', async () => {
		await updateNetwork(provider._network)

		qty = parseFloat(document.getElementById('reserveQty').value, 10)

		renderMessage('Reserving! Please wait...', 'reserveMessage')

		try {
			const tx = await peepTokenFactory.reserve(qty, {
				value: (await peepTokenFactory.TOKEN_PRICE()).mul(qty)
			});

			renderMessage('Waiting for confirmation...', 'reserveMessage')
			await tx.wait()

			renderMessage(`<h3>You reserved ${qty > 1 ? qty + ' Peeps' : 'a Peep'}!</h3>`, 'reserveMessage')

			await updateReserved(provider.getSigner())
		} catch (err) {
			if (err.code === 4001) {
				renderError('Transaction declined', 'reserveMessage')
			} else {
				renderError(err, 'reserveMessage')
			}
		}
	})

	// Reserved mint button
	const reserveMintButton = document.getElementById('reserveMintBtn')
	reserveMintButton.addEventListener('click', async () => {
		qty = parseFloat(document.getElementById('reserveMintQty').value, 10)

		renderMessage('Minting! Please wait...', 'reserveMessage')

		try {
			const tx = await peepTokenFactory.reservedMint(qty);

			renderMessage('Waiting for confirmation...', 'reserveMessage')
			await tx.wait()

			renderMessage(`<h3>You got ${qty > 1 ? qty + ' Peeps' : 'a Peep'}!</h3>`, 'reserveMessage')

			await updateReserved(provider.getSigner())
		} catch (err) {
			if (err.code === 4001) {
				renderError('Transaction declined', 'reserveMessage')
			} else {
				renderError(err, 'reserveMessage')
			}
		}
	})

	// Mint button
	const mintButton = document.getElementById('mintBtn')
	mintButton.addEventListener('click', async () => {
		await updateNetwork(provider._network)

		qty = parseFloat(document.getElementById('qty').value, 10)

		renderMessage('Minting! Please wait...')

		try {
			const tx = await peepTokenFactory.mint(qty, {
				value: (await peepTokenFactory.TOKEN_PRICE()).mul(qty)
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
