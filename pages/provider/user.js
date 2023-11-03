import { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Head from "next/head";
import {
	arrayRemove,
	deleteDoc,
	doc,
	getDoc,
	getFirestore,
	updateDoc,
} from "firebase/firestore";
import {
	AccountCircleRounded,
	BusinessRounded,
	GroupsRounded,
	MenuOpenRounded,
	MenuRounded,
	PeopleRounded,
} from "@mui/icons-material";
import { initFirebase } from "../../firebase/firebaseApp";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { Button } from "@mui/material";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
const drawerWidth = 240;

const openedMixin = (theme) => ({
	width: drawerWidth,
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
	overflowX: "hidden",
});

const closedMixin = (theme) => ({
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	overflowX: "hidden",
	width: `calc(${theme.spacing(7)} + 1px)`,
	[theme.breakpoints.up("sm")]: {
		width: `calc(${theme.spacing(8)} + 1px)`,
	},
});

const DrawerHeader = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "flex-end",
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
	zIndex: theme.zIndex.drawer + 1,
	transition: theme.transitions.create(["width", "margin"], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		marginLeft: drawerWidth,
		width: `calc(100% - ${drawerWidth}px)`,
		transition: theme.transitions.create(["width", "margin"], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));

const Drawer = styled(MuiDrawer, {
	shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
	width: drawerWidth,
	flexShrink: 0,
	whiteSpace: "nowrap",
	boxSizing: "border-box",
	...(open && {
		...openedMixin(theme),
		"& .MuiDrawer-paper": openedMixin(theme),
	}),
	...(!open && {
		...closedMixin(theme),
		"& .MuiDrawer-paper": closedMixin(theme),
	}),
}));

let startupRender = false;

export default function staffManagment() {
	const theme = useTheme();
	const app = initFirebase();
	const auth = getAuth(app);
	const firestore = getFirestore(app);
	const [user, loading] = useAuthState(auth);
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const [rows, setRows] = useState([]);

	const [currentID, setCurrentId] = useState("");

	const [addUserPopup, setaddUserPopup] = useState(false);
	const [newUserEmail, setNewUserEmail] = useState("");
	const [newUserEmailERR, setNewUserEmailERR] = useState("");

	const columns = [
		{ field: "first", headerName: "First Name", width: 150 },
		{ field: "last", headerName: "Last Name", width: 150 },
		{ field: "email", headerName: "Email", width: 150 },
		{
			field: "edit",
			headerName: "Edit",
			width: 150,
			renderCell: (params) => {
				return (
					<>
						<IconButton onClick={() => handleOpenConnect(params)}>
							<EditIcon />
						</IconButton>
						<IconButton onClick={() => handleDelete(params)}>
							<DeleteIcon />
						</IconButton>
					</>
				);
			},
		},
	];

	if (loading) {
		return <div>Loading...</div>; //add skeleton
	}

	if (!user) {
		router.push("/login");
		return <div>Loading...</div>;
	}

	async function handleDelete(params) {
		const userRef = doc(firestore, "Users", user.uid);
		const userDocSnap = await getDoc(userRef);
		let companyID = userDocSnap.get("perms");

		const companyRef = doc(firestore, "Providers", companyID);
		await updateDoc(companyRef, {
			MedicalData: arrayRemove(params.id),
		});

		let patientID = params.id;

		const response = await fetch("/api/connectUsers", {
			method: "DELETE",
			body: JSON.stringify({
				patientID,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});

		updateUserTable();
	}

	function validateEmail(email) {
		var re = /\S+@\S+\.\S+/;
		return re.test(email);
	}

	const handleCreateUser = async () => {
		setNewUserEmailERR("");
		let err = false;

		if (newUserEmail === "") {
			err = true;
			setNewUserEmailERR("Add Email");
		} else if (!validateEmail(newUserEmail)) {
			err = true;
			setNewUserEmailERR("Invalid Email");
		}

		if (err) {
			return;
		}

		const response = await fetch("/api/connectUsers", {
			method: "PUT",
			body: JSON.stringify({
        currentID,
				newUserEmail,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});
    
    setaddUserPopup(false);
    updateUserTable();
	};

	const handleCloseUserPopup = () => {
		setaddUserPopup(false);
	};

	async function handleOpenConnect(params) {
		setNewUserEmailERR("");
		setCurrentId(params.id);
		setaddUserPopup(true);
	}

	async function updateUserTable(startup) {
		if (startup && startupRender) {
			return;
		}
		startupRender = true;

		const userRef = doc(firestore, "Users", user.uid);
		const userDocSnap = await getDoc(userRef);
		let companyID = userDocSnap.get("perms");

		const companyRef = doc(firestore, "Providers", companyID);
		const companyDocSnap = await getDoc(companyRef);
		let medData = companyDocSnap.get("MedicalData");

		setRows([]);

		medData.forEach(async (v) => {
			//console.log(v);
			const medRef = doc(firestore, "Medical", v);
			const medDocSnap = await getDoc(medRef);

			let email = "nil";

			if (medDocSnap.get("user")) {
				const userRef = doc(firestore, "Users", medDocSnap.get("user"));
				const userDocSnap = await getDoc(userRef);
				email = userDocSnap.get("email");
			}

			setRows((arr) => [
				...arr,
				{
					id: v,
					first: medDocSnap.get("firstName"),
					last: medDocSnap.get("lastName"),
					email: email,
				},
			]);
		});
	}
	updateUserTable(true);

	const toggleDrawer = () => {
		setOpen(!open);
	};

	return (
		<>
			<Head>
				<title>Users Management</title>
				<meta name="description" content="User Managment" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Dialog open={addUserPopup} onClose={handleCloseUserPopup}>
				<DialogTitle>Connect User</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						id="name"
						label="Email Address"
						type="email"
						error={newUserEmailERR != ""}
						helperText={newUserEmailERR}
						onChange={(e) => setNewUserEmail(e.target.value)}
						fullWidth
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseUserPopup}>Cancel</Button>
					<Button onClick={handleCreateUser}>Connect User</Button>
				</DialogActions>
			</Dialog>

			<Box sx={{ display: "flex" }}>
				<CssBaseline />
				<Drawer variant="permanent" open={open}>
					<DrawerHeader>
						<IconButton onClick={toggleDrawer}>
							{open == false ? <MenuRounded /> : <MenuOpenRounded />}
						</IconButton>
					</DrawerHeader>
					<Divider />
					<List>
						{["Company"].map((text, index) => (
							<ListItem key={text} disablePadding sx={{ display: "block" }}>
								<ListItemButton
									sx={{
										minHeight: 48,
										justifyContent: open ? "initial" : "center",
										px: 2.5,
									}}
									onClick={() => {
										router.push("/provider/company");
									}}
								>
									<ListItemIcon
										sx={{
											minWidth: 0,
											mr: open ? 3 : "auto",
											justifyContent: "center",
										}}
									>
										{<BusinessRounded />}
									</ListItemIcon>
									<ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
								</ListItemButton>
							</ListItem>
						))}
					</List>
					<Divider />
					<List>
						{["Staff", "Users"].map((text, index) => (
							<ListItem key={text} disablePadding sx={{ display: "block" }}>
								<ListItemButton
									sx={{
										minHeight: 48,
										justifyContent: open ? "initial" : "center",
										px: 2.5,
									}}
									onClick={() => {
										{
											index % 2 === 0
												? router.push("/provider/staff")
												: router.push("/provider/user");
										}
									}}
								>
									<ListItemIcon
										sx={{
											minWidth: 0,
											mr: open ? 3 : "auto",
											justifyContent: "center",
										}}
									>
										{index % 2 === 0 ? <GroupsRounded /> : <PeopleRounded />}
									</ListItemIcon>
									<ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
								</ListItemButton>
							</ListItem>
						))}
					</List>
					<Divider />
					<List sx={{ marginTop: "auto" }}>
						{["Account"].map((text, index) => (
							<ListItem key={text} disablePadding sx={{ display: "block" }}>
								<ListItemButton
									sx={{
										minHeight: 48,
										justifyContent: open ? "initial" : "center",
										px: 2.5,
									}}
									onClick={() => {
										router.push("/provider/account");
									}}
								>
									<ListItemIcon
										sx={{
											minWidth: 0,
											mr: open ? 3 : "auto",
											justifyContent: "center",
										}}
									>
										{<AccountCircleRounded />}
									</ListItemIcon>
									<ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
								</ListItemButton>
							</ListItem>
						))}
					</List>
				</Drawer>
				<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
					<h1>Users</h1>
					<div style={{ height: 300, width: "100%" }}>
						<DataGrid rows={rows} columns={columns} />
					</div>
					<br></br>
				</Box>
			</Box>
		</>
	);
}
