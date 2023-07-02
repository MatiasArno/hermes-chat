import { rtdb } from './rtdb/realtime-db';

const API_BASE_PATH = `http://localhost:7200`;

// HAcer una funcion para cada verbo HTTP.

const state = {
	data: {
		userName: '' as string,
		userEmail: '' as string,
		rtdbRoomID: '' as string,
		roomID: '' as string,
		messages: [] as string[],
	},

	listeners: [] as any[],

	async init(rtdbRoomID: string) {
		const chatroomsRef = rtdb.ref(`/rooms/${rtdbRoomID}`);

		chatroomsRef.on('value', (snapshot: any) => {
			const messagesFromServer = snapshot.val();
			const messages = Object.values(messagesFromServer);

			messages.pop(); // Elimino a OWNER de los mensajes.

			const currentState = this.getState();
			this.setState({
				...currentState,
				messages,
			});
		});
	},

	getState() {
		return this.data;
	},

	async signUp(name: string, email: string) {
		const res = await fetch(`${API_BASE_PATH}/signup`, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({ name, email }),
		});

		return { response: res.json(), status: res.status };
	},

	async authenticate(email: string) {
		const res = await fetch(`${API_BASE_PATH}/auth`, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({ email }),
		});

		return { response: res.json(), status: res.status };
	},

	async createRoom(userID: string) {
		const res = await fetch(`${API_BASE_PATH}/rooms`, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({ userID }),
		});

		return { response: res.json(), status: res.status };
	},

	async getRoomLongID(userID: string, roomID: string) {
		const res = await fetch(
			`${API_BASE_PATH}/rooms/${roomID}?userID=${userID}`
		);
		return { response: res.json(), status: res.status };
	},

	async pushMessage(message: string) {
		const res = await fetch(`${API_BASE_PATH}/messages`, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				message,
				sentBy: this.getState().userName,
				rtdbRoomID: this.getState().rtdbRoomID,
			}),
		});

		return { response: res.json(), status: res.status };
	},

	setState(newState: Object) {
		this.data = newState as any;
		for (const cb of this.listeners) {
			cb();
		}
	},

	subscribe(callback: (any: any) => any) {
		this.listeners.push(callback);
	},
};

export { state };
