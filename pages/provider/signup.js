import Head from "next/head";
import Box from "@mui/material/Box";
import { Button, TextField, Typography } from "@mui/material";
import { initFirebase } from "../../firebase/firebaseApp";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore";

export default function signup() {
  const app = initFirebase();
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const router = useRouter();

  const [providerName, setProviderName] = useState("");
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  //error control
  const [formSubmit, setFormSubmit] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [repasswordErr, setRePasswordErr] = useState("");

  const handleSignup = async (form) => {
    form.preventDefault();

    setFormSubmit(true);
    setEmailErr("");
    setPasswordErr("");
    setRePasswordErr("");

    if (
      !firstName ||
      !lastName ||
      !email ||
      !providerName ||
      !password ||
      !rePassword
    ) {
      if (!email) setEmailErr("Enter email");
      if (!password) setPasswordErr("Enter password");
      if (!rePassword) setRePasswordErr("Retype password");

      return;
    }

    if (password != rePassword) {
      setPasswordErr("Passwords must match");
      setRePasswordErr("Passwords must match");

      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        sendEmailVerification(user);

        const providerRef = collection(firestore, "Providers");
        const docRef = await addDoc(providerRef, {
          Name: providerName,
          Admins: [user.uid],
          Staff: [],
          MedicalData: [],
        });

        const userRef = doc(firestore, "Users", user.uid);
        await setDoc(userRef, {
          email: email,
          firstName: firstName,
          lastName: lastName,
          perms: docRef.id
        });

        router.push("/provider/company");
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        switch (errorCode) {
          case "auth/email-already-in-use":
            setEmailErr("Email aldrady in use");
            break;
          case "auth/invalid-email":
            setEmailErr("Please enter valid email");
            break;
          case "auth/weak-password":
            setPasswordErr("Password should be at least 6 characters");
            setRePasswordErr("Password should be at least 6 characters");
            break;
          default:
            setEmailErr(errorMessage);
            break;
        }
        // ..
      });
  };

  return (
    <>
      <Head>
        <title>Signup</title>
        <meta name="description" content="Signup" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box
        sx={{
          m: 0,
          width: "100%",
          height: "90vh",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSignup}
          noValidate
          autoComplete="off"
          sx={{
            borderRadius: "10px",
            border: "1px solid gray",
            padding: "1rem",
            backgroundColor: "#ffffff",
            height: "750px",
            width: "750px",
            display: "grid",
            gridTemplateColumns: "350px 350px",
            gridTemplateRows: "30px 10px 50px 50px 50px 50px 50px 50px 10px",
            gridTemplateAreas:
              '"header header" "Switch Switch" "ProviderName ProviderName" "First Last" "Email Email" "Password Password" "Confrim Confrim" "Submit Submit" "Terms Terms"',
            columnGap: "10px",
            rowGap: "20px",
            alignContent: "center",
          }}
        >
          <Typography
            gridArea={"header"}
            justifySelf={"Center"}
            className="header"
            variant="h4"
            component={"h4"}
            sx={{ paddingBottom: "0px" }}
          >
            Create a New Provider Account
          </Typography>

          <Typography
            variant="subtitle1"
            gridArea={"Switch"}
            justifySelf={"Center"}
          >
            Back to login?{" "}
            <Link style={{ color: "#1976d2" }} href="/login">
              Login
            </Link>
          </Typography>

          <TextField
            required
            sx={{ gridArea: "ProviderName" }}
            variant="outlined"
            label="Provider Name"
            type={"text"}
            error={!providerName && formSubmit ? true : false}
            helperText={
              !providerName && formSubmit ? "Enter your company's name" : ""
            }
            onChange={(e) => setProviderName(e.target.value)}
          />

          <TextField
            required
            sx={{ gridArea: "First" }}
            variant="outlined"
            label="First Name"
            type={"text"}
            error={!firstName && formSubmit ? true : false}
            helperText={!firstName && formSubmit ? "Enter first name" : ""}
            onChange={(e) => setFirst(e.target.value)}
          />

          <TextField
            required
            sx={{ gridArea: "Last" }}
            variant="outlined"
            label="Last Name"
            type={"text"}
            error={!lastName && formSubmit ? true : false}
            helperText={!lastName && formSubmit ? "Enter last name" : ""}
            onChange={(e) => setLast(e.target.value)}
          />

          <TextField
            required
            sx={{ gridArea: "Email" }}
            variant="outlined"
            label="Email"
            type={"email"}
            error={emailErr && formSubmit ? true : false}
            helperText={emailErr && formSubmit ? emailErr : ""}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            required
            sx={{ gridArea: "Password" }}
            variant="outlined"
            label="Password"
            type={"password"}
            error={passwordErr && formSubmit ? true : false}
            helperText={passwordErr && formSubmit ? passwordErr : ""}
            onChange={(e) => setPassword(e.target.value)}
          />

          <TextField
            required
            sx={{ gridArea: "Confrim" }}
            variant="outlined"
            label="Retype Password"
            type={"password"}
            error={repasswordErr && formSubmit ? true : false}
            helperText={repasswordErr && formSubmit ? repasswordErr : ""}
            onChange={(e) => setRePassword(e.target.value)}
          />

          <Button type="submit" variant="contained" sx={{ gridArea: "Submit" }}>
            Create an Admin Account
          </Button>

          <Typography
            variant="subtitle2"
            gridArea={"Terms"}
            justifySelf={"Center"}
          >
            By clicking the "Create an Account" button, you are creating an
            account, and you agree to the{" "}
            <Link style={{ color: "#1976d2" }} href="/terms">
              Terms of Use
            </Link>
            .
          </Typography>
        </Box>
      </Box>
    </>
  );
}
