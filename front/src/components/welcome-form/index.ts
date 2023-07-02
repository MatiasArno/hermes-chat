import { state } from '../../state';
import { Router } from '@vaadin/router';

async function getRoomID(userID: string) {
	const createdRoom = await state.createRoom(userID);
	const roomResponse = await createdRoom.response;
	return roomResponse.id;
}

async function getRoomLongID(userID: string, roomID: string) {
	const rtdbRoomLongID = await state.getRoomLongID(userID, roomID);
	return await rtdbRoomLongID.response;
}

async function signUp(userName: string, userEmail: string) {
	const signUpPromise = await state.signUp(userName, userEmail);
	return await signUpPromise.response;
}

async function createNewChatRoom(userName: string, userEmail: string) {
	const authPromise = await state.authenticate(userEmail);
	const jsonAuthRes = await authPromise.response;
	const responseStatus = authPromise.status;
	let rtdbRoomID;
	let roomID;

	console.log(jsonAuthRes);
	console.log(responseStatus);

	if (responseStatus == 201) {
		const userID = jsonAuthRes.user;
		console.log('USER ID -->', userID);

		roomID = await getRoomID(userID);
		console.log('ROOM ID -->', roomID);

		const roomLongIDObj = await getRoomLongID(userID, roomID);
		rtdbRoomID = roomLongIDObj.rtdbRoomID;
		console.log('RTDB ROOM ID -->', rtdbRoomID);
	} else if (responseStatus == 404) {
		const signUpRes = await signUp(userName, userEmail);
		const userID = signUpRes.userID as string;
		console.log(signUpRes.message);
		console.log('USER ID -->', userID);

		roomID = await getRoomID(userID);
		console.log('ROOM ID -->', roomID);

		const roomLongIDObj = await getRoomLongID(userID, roomID);
		rtdbRoomID = roomLongIDObj.rtdbRoomID;
		console.log('RTDB ROOM ID -->', rtdbRoomID);
	}

	const currentState = state.getState();
	state.setState({
		...currentState,
		userName,
		userEmail,
		rtdbRoomID,
		roomID,
	});

	Router.go('/chat');

	console.log(state.getState());
}

async function connectToChatroom(
	userName: string,
	userEmail: string,
	roomID: string
) {
	const authPromise = await state.authenticate(userEmail);
	const jsonAuthRes = await authPromise.response;
	const responseStatus = authPromise.status;
	let rtdbRoomID;

	console.log(jsonAuthRes);
	console.log(responseStatus);

	if (responseStatus == 201) {
		const userID = jsonAuthRes.user;
		console.log('USER ID -->', userID);

		const roomLongIDObj = await getRoomLongID(userID, roomID);
		rtdbRoomID = roomLongIDObj.rtdbRoomID;
		console.log('RTDB ROOM ID -->', rtdbRoomID);
	} else if (responseStatus == 404) {
		const signUpRes = await signUp(userName, userEmail);
		const userID = signUpRes.userID as string;
		console.log(signUpRes.message);
		console.log('USER ID -->', userID);

		const roomLongIDObj = await getRoomLongID(userID, roomID);
		rtdbRoomID = roomLongIDObj.rtdbRoomID;
		console.log('RTDB ROOM ID -->', rtdbRoomID);
	}

	const currentState = state.getState();
	state.setState({
		...currentState,
		userName,
		userEmail,
		rtdbRoomID,
		roomID,
	});

	Router.go('/chat');
}

class WelcomeForm extends HTMLElement {
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
				font-family: 'Poppins', sans-serif;
			}

            .form {
                // height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }

                .input-field {
					margin: 18px 0 0 0;
                    height: 39px;
                    border: 0.9px solid white;
					border-radius: 4.5px;
                    background-color: rgba(255, 255, 255, 0);
					color: white;
                    text-align: center;
                }

                .input-field:focus {
                    outline: none;
                    background-color: rgba(255, 255, 255, 0.108);
                }

					.selector-option {
						color: black;
					}

				.room-id {
					display: none;
				}

				.button {
					margin: 54px 0 0 0;
					height: 45px;

					border-radius: 9px;
					background-color: #2ebf91;
					color: white;
					font-weight: 700;
					font-size: 1.53em;
					border: none;
				}
        `;

		this.shadow.appendChild(style);
	}

	render() {
		this.shadow.innerHTML = `
            <form class="form" autocomplete="off">
                <input type="email" name="email" class="input-field" placeholder="Your email" required>

                <input type="name" name="user-name" class="input-field" placeholder="Your name" required>


                <select name="session" class="input-field" id="session">
                    <option class="selector-option" value="new-chat">New chat</option>
                    <option class="selector-option" value="chat">Existing chat</option>
                </select>

                <input type="text" name="chat-id" class="input-field room-id" placeholder="Room ID">

                <button type="submit" name="button" class="button">¡GO!</button>
            </form>
        `;

		const form = this.shadow.querySelector('.form') as HTMLFormElement;
		const roomIdInputField = form['chat-id'];

		form.session.addEventListener('click', () => {
			form.session.value == 'chat'
				? (roomIdInputField.style.display = 'block')
				: (roomIdInputField.style.display = 'none');
		});
	}

	sendForm() {
		const form = this.shadow.querySelector('.form') as HTMLFormElement;
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			form['button'].style.backgroundColor = '#3de0ad';

			const userEmail = form['email'].value;
			const userName = form['user-name'].value;
			const roomID = form['chat-id'].value;
			const formOption = form.session.value;

			switch (formOption) {
				case 'new-chat':
					return createNewChatRoom(userName, userEmail);
				case 'chat':
					return connectToChatroom(userName, userEmail, roomID);
			}

			form['email'].value = '';
			form['user-name'].value = '';
			form['chat-id'].value = '';
		});
	}
}

customElements.define('welcome-form', WelcomeForm);
