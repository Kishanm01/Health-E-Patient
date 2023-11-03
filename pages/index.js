import { initFirebase } from "../firebase/firebaseApp";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { doc, getDoc, getFirestore } from "firebase/firestore";

export default function Home() {
	const app = initFirebase();
	const auth = getAuth(app);
	const [user, loading] = useAuthState(auth);
	const router = useRouter();
	const firestore = getFirestore(app);

	async function userType() {
		const userRef = doc(firestore, "Users", user.uid);
		const userdocSnap = await getDoc(userRef);

		if (userdocSnap.exists()) {
      if (userdocSnap.get("perms")) {
        const providerRef = doc(
          firestore,
          "Providers",
          userdocSnap.get("perms")
        );
        const providerDoc = await getDoc(providerRef);

        if (providerDoc.get("Admins").includes(user.uid)) {
          router.push("/provider/company");

        } else {
          router.push("/staff/dashboard");
        }
      } else {
        router.push("/patient/dashboard");
      }
    } else {
      error("User Data Not Found");
    }
	}

	if (loading) {
		return <div>Loading...</div>;
	}

	if (user) {
		userType();
		return <div>Loading...</div>;
	} else {
		router.push("/login");
		return <div>Loading...</div>;
	}
}
