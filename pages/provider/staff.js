import { useEffect, useState } from "react";
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
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
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
import DeleteIcon from "@mui/icons-material/Delete";
import GppGoodIcon from '@mui/icons-material/GppGood';
import GppBadIcon from '@mui/icons-material/GppBad';
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

	const [addUserPopup, setaddUserPopup] = useState(false);
	const [newUserEmail, setNewUserEmail] = useState("");
	const [newUserFirst, setNewUserFirst] = useState("");
	const [newUserLast, setNewUserLast] = useState("");
	const [newUserEmailERR, setNewUserEmailERR] = useState("");
	const [newUserFirstERR, setNewUserFirstERR] = useState("");
	const [newUserLastERR, setNewUserLastERR] = useState("");

	const [rows, setRows] = useState([]);

	const columns = [
		{ field: "first", headerName: "First Name", width: 150 },
		{ field: "last", headerName: "Last Name", width: 150 },
		{ field: "email", headerName: "Email", width: 150 },
		{ field: "role", headerName: "Role", width: 150 },
		{
			field: "col5",
			headerName: "Edit",
			width: 150,
			renderCell: (params) => {
				const role = params.row.role;

				if (role == "Admin") {
					return (
						<>
							<IconButton onClick={() => toggleAdmin(params)}>
								<GppBadIcon />
							</IconButton>
							<IconButton onClick={() => handleRemove(params)}>
								<DeleteIcon />
							</IconButton>
						</>
					);
				} else {
					return (
						<>
							<IconButton onClick={() => toggleAdmin(params)}>
								<GppGoodIcon />
							</IconButton>
							<IconButton onClick={() => handleRemove(params)}>
								<DeleteIcon />
							</IconButton>
						</>
					);
				}
			},
		},
	];

	const toggleDrawer = () => {
		setOpen(!open);
	};

	if (loading) {
		return <div>Loading...</div>; //add skeleton
	}

	if (!user) {
		router.push("/login");
		return <div>Loading...</div>;
	}

	const toggleAdmin = async (params) => {
		const email = params.row.email;
		const role = params.row.role;

		const userRef = doc(firestore, "Users", user.uid);
		const docSnap = await getDoc(userRef);
		let companyID = docSnap.get("perms");

		const response = await fetch("/api/addStaff", {
			method: "PUT",
			body: JSON.stringify({
				email,
				role,
				companyID,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const data = await response.json();
		updateUserTable();
	};

	const handleRemove = async (params) => {
		const email = params.row.email;

		const userRef = doc(firestore, "Users", user.uid);
		const docSnap = await getDoc(userRef);
		let companyID = docSnap.get("perms");

		const response = await fetch("/api/addStaff", {
			method: "DELETE",
			body: JSON.stringify({
				email,
				companyID,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const data = await response.json();
		updateUserTable();
	};

	const handleClickOpenUserPopup = () => {
		setNewUserEmailERR("");
		setNewUserFirstERR("");
		setNewUserLastERR("");

		setaddUserPopup(true);
	};

	const handleCloseUserPopup = () => {
		setaddUserPopup(false);
	};

	function validateEmail(email) {
		var re = /\S+@\S+\.\S+/;
		return re.test(email);
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
		let admin = companyDocSnap.get("Admins");
		let staff = companyDocSnap.get("Staff");

		setRows([]);

		admin.forEach(async (v) => {
			//console.log(v);

			const staffRef = doc(firestore, "Users", v);
			const staffDocSnap = await getDoc(staffRef);

			setRows((arr) => [
				...arr,
				{
					id: v,
					first: staffDocSnap.get("firstName"),
					last: staffDocSnap.get("lastName"),
					email: staffDocSnap.get("email"),
					role: "Admin",
				},
			]);
		});

		staff.forEach(async (v) => {
			//console.log(v);

			const staffRef = doc(firestore, "Users", v);
			const staffDocSnap = await getDoc(staffRef);

			setRows((arr) => [
				...arr,
				{
					id: v,
					first: staffDocSnap.get("firstName"),
					last: staffDocSnap.get("lastName"),
					email: staffDocSnap.get("email"),
					role: "Staff",
				},
			]);
		});
	}
	updateUserTable(true);

	const handleCreateUser = async () => {
		setNewUserEmailERR("");
		setNewUserFirstERR("");
		setNewUserLastERR("");
		let err = false;

		const userRef = doc(firestore, "Users", user.uid);
		const docSnap = await getDoc(userRef);
		let companyID = docSnap.get("perms");

		if (newUserEmail === "") {
			err = true;
			setNewUserEmailERR("Add Email");
		} else if (!validateEmail(newUserEmail)) {
			err = true;
			setNewUserEmailERR("Invalid Email");
		}

		if (newUserFirst === "") {
			err = true;
			setNewUserFirstERR("Add First Name");
		}

		if (newUserLast === "") {
			err = true;
			setNewUserLastERR("Add Last Name");
		}

		if (!err) {
			const response = await fetch("/api/addStaff", {
				method: "POST",
				body: JSON.stringify({
					newUserEmail,
					newUserFirst,
					newUserLast,
					companyID,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();

			setaddUserPopup(false);
			updateUserTable();
		}
	};

	return (
		<>
			<Head>
				<title>Staff Management</title>
				<meta name="description" content="Staff Managment" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Box sx={{ display: "flex" }}>
				<CssBaseline />

				{/*Side Bar*/}
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

				{/* Add Staff Popup */}
				<Dialog open={addUserPopup} onClose={handleCloseUserPopup}>
					<DialogTitle>Add Staff</DialogTitle>
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
						<TextField
							margin="dense"
							id="name"
							label="First Name"
							type="text"
							error={newUserFirstERR != ""}
							helperText={newUserFirstERR}
							onChange={(e) => setNewUserFirst(e.target.value)}
							fullWidth
						/>
						<TextField
							margin="dense"
							id="name"
							label="Last Name"
							type="text"
							error={newUserLastERR != ""}
							helperText={newUserLastERR}
							onChange={(e) => setNewUserLast(e.target.value)}
							fullWidth
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCloseUserPopup}>Cancel</Button>
						<Button onClick={handleCreateUser}>Create Staff Account</Button>
					</DialogActions>
				</Dialog>

				<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
					<h1>Staff</h1>
					<div style={{ height: 300, width: "100%" }}>
						<DataGrid
							//getRowId={(row) => 1}
							rows={rows}
							columns={columns}
							isRowSelectable={() => false}
						/>
					</div>
					<br></br>
					<Button
						variant="contained"
						color="success"
						onClick={() => {
							handleClickOpenUserPopup();
						}}
					>
						Add User
					</Button>
				</Box>
			</Box>
		</>
	);
}
