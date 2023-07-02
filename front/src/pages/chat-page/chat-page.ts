import { state } from '../../state';

class ChatPage extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const sessionRtdbRoomID = state.getState().rtdbRoomID;
		state.init(sessionRtdbRoomID).then(() => this.render()); // El componente se renderiza cuando estén disponibles los mensajes de la RTDB.
		state.subscribe(() => this.render());
	}

	render() {
		const messages = state.getState().messages;
		const currentUser = state.getState().userName;
		console.log(messages);

		this.innerHTML = `
			<div class="chat__header">
				<h1 class="chat__title"> ${state.getState().userName} </h1>
				<p class="chat__info"> • ROOM ${state.getState().roomID} • </p>
			</div>
			
			<div class="chat__messages">
				${messages
					.map(
						(message: any) =>
							`<div class="${
								message.sentBy != currentUser ? 'incoming-message' : ''
							}"><p>${message.message}</p></div>`
					)
					.join(' ')}
			</div>

			<div class="chat__form-container">
				<chat-form></chat-form>
			</div>

        `;
	}
}

customElements.define('chat-page', ChatPage);
