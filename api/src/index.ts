import express from "express";
import cors from "cors";
import { firestore, rtdb } from "./firebase/db/database";
import { nanoid } from "nanoid";

const port = 7200;
const app = express();
const usersCollection = firestore.collection("users");
const roomsCollection = firestore.collection("rooms");

app.use(express.json());
app.use(cors());

// ------------- ROUTES ------------- //

app.post("/auth", async (req, res) => {
	// Autenticación de usuarios mediante email en Firestore.
	// Retorna el ID creado por Firestore del usuario que intenta autenticarse.

	const { email } = req.body;

	const searchResponse = await usersCollection
		.where("email", "==", email)
		.get();

	if (searchResponse.empty) {
		res.status(404).json({ message: "User not found..." });
	} else {
		res.status(201).json({ user: searchResponse.docs[0].id });
	}
});

app.post("/signup", async (req, res) => {
	// Da de alta usuarios en Firestore mediante email.

	const { name, email } = req.body;

	const searchResponse = await usersCollection
		.where("email", "==", email)
		.get();

	if (searchResponse.empty) {
		const newUserRef = await usersCollection.add({ name, email });
		res.status(201).json({
			message: `User ${newUserRef.id} created successfully!`,
			userID: newUserRef.id,
		});
	} else {
		res
			.status(400)
			.json({ message: `User ${searchResponse.docs[0].id} already exists.` });
	}
});

app.post("/rooms", async (req, res) => {
	// Este endpoint es llamado cuando un usuario existente quiere crear una nueva room.
	// Crea una nueva room en la rtdb cuyo ID es roomLongID con el userID asociado.
	// Crea una nueva room en firestore cuyo ID es roomID con roomLongID asociado.

	const { userID } = req.body;

	const userDocument = await usersCollection.doc(userID).get();

	if (!userDocument.exists) {
		res.status(401).json({ message: "Nothing you can do here..." });
	} else {
		const roomRef = rtdb.ref("rooms/" + nanoid());
		const roomLongID = roomRef.key;
		const roomID = 1000 + Math.floor(Math.random() * 999);

		roomRef.set({ owner: userID }).then(() => {
			roomsCollection
				.doc(roomID.toString())
				.set({
					rtdbRoomID: roomLongID,
				})
				.then(() => {
					res.json({ id: roomID.toString() });
				});
		});
	}
});

app.get("/rooms/:roomID", async (req, res) => {
	// Accede a un room existente en firestore solicitando userID.
	// Retorna el id complejo asociado en firestore al userID solicitado.
	// IMPORTANTE --> Un usuario con userID válido puede ver el contenido de cualquier roomID.

	const { userID } = req.query as any;
	const { roomID } = req.params;

	if (!userID || !roomID) {
		res.status(400).json({ message: "User ID and Room ID are required..." });
		return;
	}

	const document = await usersCollection.doc(userID.toString()).get();

	if (!document.exists) {
		res.status(401).json({ message: "Nothing you can do here..." });
	} else {
		const snap = await roomsCollection.doc(roomID).get();
		const data = snap.data();
		res.json(data);
	}
});

app.post("/messages", async (req, res) => {
	const { rtdbRoomID, message, sentBy } = req.body;

	if (!rtdbRoomID || !message || !sentBy) {
		res.status(400).json({
			message: "Room ID, message and remitent are required... ¡CHECK AGAIN!",
		});
		return;
	}

	const chatroomsRef = rtdb.ref(`/rooms/${rtdbRoomID}`);
	const date = new Date();

	chatroomsRef.push(
		{
			message,
			sentBy,
			date: `${date.getHours()}:${date.getMinutes()}`,
		},
		(response) => {
			response == null
				? res.status(201).json("Message sent!")
				: res.status(500).json("Error");
		}
	);
});

// ------------- START SERVER ------------- //

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
