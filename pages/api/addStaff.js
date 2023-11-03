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

	if (req.method === "POST") {
		//let body = JSON.parse(req.body);

		adminAuth
			.createUser({
				email: req.body.newUserEmail,
			})
			.then(async (userRecord) => {
				console.log("Successfully created new user:", userRecord.email);

				await firestore
					.collection("Providers")
					.doc(req.body.companyID)
					.update({
						Staff: FieldValue.arrayUnion(userRecord.uid),
					});

				await firestore.collection("Users").doc(userRecord.uid).create({
					email: req.body.newUserEmail,
					firstName: req.body.newUserFirst,
					lastName: req.body.newUserLast,
					perms: req.body.companyID,
				});

				await fetch(
					"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyA7JWhu7KGLQDDGNk6raGed_XrZqalDAJk",
					{
						method: "POST",
						body: JSON.stringify({
							requestType: "PASSWORD_RESET",
							email: userRecord.email,
						}),
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				return res
					.status(200)
					.json(await adminAuth.getUserByEmail(userRecord.email));
			})
			.catch((error) => {
				console.log("Error creating new user:", error);
				res.status(599).send("Error creating new user" + error);
			});
	} else if (req.method === "DELETE") {
		const user = await adminAuth.getUserByEmail(req.body.email);
		await adminAuth.deleteUser(user.uid);
		await firestore.collection("Users").doc(user.uid).delete();

		await firestore
			.collection("Providers")
			.doc(req.body.companyID)
			.update({
				Staff: FieldValue.arrayRemove(user.uid),
			})
			.catch(async (error) => {});

		await firestore
			.collection("Providers")
			.doc(req.body.companyID)
			.update({
				Admins: FieldValue.arrayRemove(user.uid),
			})
			.catch(async (error) => {});

		return res.status(200).json("Deleted");
	} else if (req.method === "PUT") {
		const user = await adminAuth.getUserByEmail(req.body.email);

		if (req.body.role === "Staff") {
			await firestore
				.collection("Providers")
				.doc(req.body.companyID)
				.update({
					Staff: FieldValue.arrayRemove(user.uid),
					Admins: FieldValue.arrayUnion(user.uid),
				});

			return res.status(200).json("Admin");
		} else {
			await firestore
				.collection("Providers")
				.doc(req.body.companyID)
				.update({
					Admins: FieldValue.arrayRemove(user.uid),
					Staff: FieldValue.arrayUnion(user.uid),
				});

			return res.status(200).json("Staff");
		}
	} else {
		return res.status(405).json({ error: "Method not allowed" });
	}
}
