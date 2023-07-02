import * as admin from "firebase-admin";
import * as serviceAccount from "../auth/auth-key.json";

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as any),
	databaseURL: "https://hermes-chat-fd760-default-rtdb.firebaseio.com",
});

const firestore = admin.firestore();
const rtdb = admin.database();

export { firestore, rtdb };
