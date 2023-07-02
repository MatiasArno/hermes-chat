import firebase from "firebase";

firebase.initializeApp({
	apiKey: "35DvFu4ePDV9gbJxyDvLHaiiMw10xrcRGIicTAaN",
	databaseURL: "https://hermes-chat-fd760-default-rtdb.firebaseio.com/",
	authDomain: "hermes-chat-fd760.firebaseapp.com",
});

const rtdb = firebase.database();

export { rtdb };
