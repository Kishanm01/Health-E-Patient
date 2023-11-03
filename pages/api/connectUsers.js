import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const credentials = {
	projectId: process.env.FIREBASE_PROJECT_ID,
	privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
	clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

const options = {
	credential: cert(credentials),
	databaseURL: process.env.FIREBASE_DATABASE_URL,
};

function createFirebaseAdminApp(config) {
	if (getApps().length === 0) {
		return initializeApp(config);
	} else {
		return getApp();
	}
}

const firebaseAdmin = createFirebaseAdminApp(options);
export const adminAuth = getAuth(firebaseAdmin);
const firestore = getFirestore(firebaseAdmin);

export default async function handler(req, res) {
	if (process.env?.FIREBASE_PRIVATE_KEY == null) {
		res.status(500).send("No firebase api key");
	}

	if (req.method === "DELETE") {
		const documentRef = firestore.collection("Medical").doc(req.body.patientID);
		const userInfo = await documentRef.get();

		await firestore.collection("Users").doc(userInfo.get("user")).update({
			medical: FieldValue.delete(),
		});

		await firestore.recursiveDelete(documentRef);

		return res.status(200).json("Deleted");
	} else if (req.method === "PUT") {
		const user = await adminAuth.getUserByEmail(req.body.newUserEmail);

		await firestore.collection("Users").doc(user.uid).update({
			medical: req.body.currentID,
		});

		await firestore.collection("Medical").doc(req.body.currentID).update({
			user: user.uid,
		});

		return res.status(200).json("Admin");
	} else {
		return res.status(405).json({ error: "Method not allowed" });
	}
}
