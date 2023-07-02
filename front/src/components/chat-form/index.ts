import { state } from '../../state';

class ChatForm extends HTMLElement {
	shadow = this.attachShadow({ mode: 'open' });

	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
		this.addStyles();
		this.sendForm();
	}

	addStyles() {
		const style = document.createElement('style');

		style.innerHTML = `
			@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700;900&display=swap');

			* {
				box-sizing: border-box;
				margin: 0;
				padding: 0;
				font-family: 'Poppins', sans-serif;
			}

			.form {
				display: flex;
				justify-content: space-between;
				padding: 18px 0 0 0;
				width: 100%;
				height: 100%;
			}

			.chat-field {
				padding: 0 12.6px;
				flex-grow: 1;
				border: none;
				border-radius: 27px;
			}

			.chat-field:focus {
				outline: none;
				border: none;
			}

			.button {
				display: flex;
				justify-content: center;
				align-items: center;
				margin: 0 0 0 7.2px;
				background-color: rgba(255, 255, 255, 0);
				font-size: 3.4em;
				color: #3df7bc;
				border: none;
			}
        `;

		this.shadow.appendChild(style);
	}

	render() {
		this.shadow.innerHTML = `
            <form class="form" autocomplete="off">
                <input type="text" name="text" class="chat-field">
                <button type="submit" class="button">➤</button>
            </form>
        `;
	}

	sendForm() {
		const form = this.shadow.querySelector('.form') as HTMLFormElement;
		form.addEventListener('submit', async (e) => {
			e.preventDefault();

			const message = form.text.value as string;

			const res = await state.pushMessage(message);
			const msg = await res.response;

			console.log(msg);

			form.text.value = '';
		});
	}
}

customElements.define('chat-form', ChatForm);
