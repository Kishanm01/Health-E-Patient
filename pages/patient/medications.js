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
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
} from "firebase/firestore";
import { DataGrid } from "@mui/x-data-grid";

import {
	AccountCircleRounded,
	BusinessRounded,
	GroupsRounded,
	MenuOpenRounded,
	MenuRounded,
	PeopleRounded,
	RoundaboutLeftRounded,
} from "@mui/icons-material";
import { initFirebase } from "../../firebase/firebaseApp";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { Button } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MedicationIcon from "@mui/icons-material/Medication";
import BiotechIcon from "@mui/icons-material/Biotech";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { lightBlue } from "@mui/material/colors";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
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

export default function PatientDashboard() {
	const theme = useTheme();
	const app = initFirebase();
	const auth = getAuth(app);
	const firestore = getFirestore(app);
	const [user, loading] = useAuthState(auth);
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const [rows, setRows] = useState([]);

	const columns = [
		{ field: "name", headerName: "Name", width: 150 },
		{ field: "prescription", headerName: "Results", width: 150 },
		{ field: "instructions", headerName: "Status", width: 150 },
	];

	if (loading) {
		return <div>Loading...</div>; //add skeleton
	}

	if (!user) {
		router.push("/login");
		return <div>Loading...</div>;
	}

	async function updateUserTable(startup) {
		if (startup && startupRender) {
			return;
		}
		startupRender = true;
		const userRef = doc(firestore, "Users", user.uid);
		const userSnapshot = await getDoc(userRef);

		const testRef = collection(
			firestore,
			"Medical",
			userSnapshot.get("medical"),
			"Medications"
		);
		const testSnapshot = await getDocs(testRef);

		console.log(testSnapshot);

		setRows([]);
		testSnapshot.forEach((doc) => {
			setRows((arr) => [
				...arr,
				{
					id: doc.id,
					name: doc.get("name"),
					prescription: doc.get("prescription"),
					instructions: doc.get("instructions"),
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
				<title>Medications</title>
				<meta name="description" content="Medications" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

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
						{["Dashboard"].map((text, index) => (
							<ListItem key={text} disablePadding sx={{ display: "block" }}>
								<ListItemButton
									sx={{
										minHeight: 48,
										justifyContent: open ? "initial" : "center",
										px: 2.5,
									}}
									onClick={() => {
										router.push("/patient/dashboard");
									}}
								>
									<ListItemIcon
										sx={{
											minWidth: 0,
											mr: open ? 3 : "auto",
											justifyContent: "center",
										}}
									>
										{<DashboardIcon />}
									</ListItemIcon>
									<ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
								</ListItemButton>
							</ListItem>
						))}
					</List>
					<Divider />
					<List>
						{["Appointments"].map((text, index) => (
							<ListItem key={text} disablePadding sx={{ display: "block" }}>
								<ListItemButton
									sx={{
										minHeight: 48,
										justifyContent: open ? "initial" : "center",
										px: 2.5,
									}}
									onClick={() => {
										router.push("/patient/appointments");
									}}
								>
									<ListItemIcon
										sx={{
											minWidth: 0,
											mr: open ? 3 : "auto",
											justifyContent: "center",
										}}
									>
										{<CalendarMonthIcon />}
									</ListItemIcon>
									<ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
								</ListItemButton>
							</ListItem>
						))}
					</List>
					<Divider />
					<List>
						{["Medication", "Test Results"].map((text, index) => (
							<ListItem key={text} disablePadding sx={{ display: "block" }}>
								<ListItemButton
									onClick={() => {
										if (index % 2 === 0) {
											router.push("/patient/medications");
										} else {
											router.push("/patient/testResults");
										}
									}}
									sx={{
										minHeight: 48,
										justifyContent: open ? "initial" : "center",
										px: 2.5,
									}}
								>
									<ListItemIcon
										sx={{
											minWidth: 0,
											mr: open ? 3 : "auto",
											justifyContent: "center",
										}}
									>
										{index % 2 === 0 ? <MedicationIcon /> : <BiotechIcon />}
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
										router.push("/patient/account");
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
					<DataGrid rows={rows} columns={columns} autoHeight={true} />
				</Box>
			</Box>
		</>
	);
}
