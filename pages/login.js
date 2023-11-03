import Head from "next/head";
// import Box from "@mui/material/Box";
import { Button, TextField, Typography, Tooltip, Box } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { initFirebase } from "../firebase/firebaseApp";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import { doc, getDoc, getFirestore } from "firebase/firestore";

export default function login() {
	const app = initFirebase();
	const auth = getAuth(app);
	const firestore = getFirestore(app);
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [emailErr, setEmailErr] = useState("");
	const [passwordErr, setPasswordErr] = useState("");

	const handleLogin = async (form) => {
		form.preventDefault();

		setEmailErr("");
		setPasswordErr("");

		signInWithEmailAndPassword(auth, email, password)
			.then(async (userCredential) => {
				// Signed in
				const user = userCredential.user;

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

				// ...
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;

				switch (errorCode) {
					case "auth/invalid-email":
						setEmailErr("Please enter valid email");
						break;
					case "auth/wrong-password":
						setPasswordErr("Incorrect password");
						break;
					case "auth/user-disabled":
						setEmailErr("Account not enabled");
						break;
					case "auth/user-not-found":
						setEmailErr("Account not found");
						break;
					default:
						setEmailErr(errorMessage);
						setPasswordErr(errorCode);
						break;
				}
			});
	};

	return (
		<>
			<Head>
				<title>Login</title>
				<meta name="description" content="Login Page" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Box
				sx={{
					m: 0,
					width: "100%",
					height: "95vh",
					display: "flex",
					justifyContent: "space-around",
					alignItems: "center",
				}}
			>
				<Box
					component="form"
					onSubmit={handleLogin}
					noValidate
					autoComplete="off"
					sx={{
						borderRadius: "10px",
						border: "1px solid gray",
						padding: "1rem",
						backgroundColor: "#ffffff",
						height: "500px",
						width: "750px",
						display: "grid",
						gridTemplateColumns: "350px 350px",
						gridTemplateRows: "60px 10px 30px 50px 50px 20px 50px 30px",
						gridTemplateAreas:
							'"header header" "subtitle subtitle" "Switch Switch" "Email Email" "Password Password" "Forgot Forgot" "Submit Submit" "Create Create"',
						columnGap: "10px",
						rowGap: "30px",
						alignContent: "center",
					}}
				>
					<Typography
						gridArea={"header"}
						justifySelf={"Center"}
						className="header"
						variant="h4"
						component={"h4"}
						sx={{ paddingBottom: "50px", paddingTop: "25px" }}
					>
						Health E-Patient
					</Typography>

					<Typography
						gridArea={"subtitle"}
						justifySelf={"Center"}
						className="header"
						variant="subtitle1"
						component={"h1"}
						sx={{ paddingBottom: "50px" }}
					>
						Log in to manage your account
					</Typography>

					<Typography
						gridArea={"Switch"}
						justifySelf={"Center"}
						variant="subtitle1"
					>
						Don't have an account?{" "}
						<Link style={{ color: "#1976d2" }} href="/patient/signup">
							Sign up
						</Link>
					</Typography>

					<TextField
						sx={{ gridArea: "Email" }}
						variant="outlined"
						label="Email"
						type="email"
						error={emailErr != ""}
						helperText={emailErr}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<TextField
						sx={{ gridArea: "Password" }}
						variant="outlined"
						label="Password"
						type="password"
						error={passwordErr != ""}
						helperText={passwordErr}
						onChange={(e) => setPassword(e.target.value)}
					/>

					<Tooltip title="Not Available">
						<span>
							<Button
								disabled
								variant="text"
								sx={{ gridArea: "Forgot", justifySelf: "start" }}
								onClick={() => {
									router.push("/forgot-password");
								}}
							>
								Forgot your password?
							</Button>
						</span>
					</Tooltip>
					<Button type="submit" variant="contained" sx={{ gridArea: "Submit" }}>
						Login
					</Button>

					<Typography
						variant="subtitle2"
						paddingBottom="25px"
						sx={{ gridArea: "Create", justifySelf: "start" }}
						alignSelf={"flex-end"}
					>
						Are you a healthcare Provider?{" "}
						<Link style={{ color: "#1976d2" }} href="/provider/signup">
							Create Healthcare Account
						</Link>
					</Typography>
				</Box>
			</Box>
		</>
	);
}
