import {
	AccountCircleRounded,
	BusinessRounded,
	GroupsRounded,
	MenuOpenRounded,
	MenuRounded,
	PeopleRounded,
} from "@mui/icons-material";
import { Button } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";
import { green } from "@mui/material/colors";
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import SupervisorAccountTwoToneIcon from "@mui/icons-material/SupervisorAccountTwoTone";
import IconButton from "@mui/material/IconButton";
import { deepPurple } from "@mui/material/colors";
import List from "@mui/material/List";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled, useTheme } from "@mui/material/styles";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { initFirebase } from "../../firebase/firebaseApp";

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

export default function AdminDashboard() {
	const theme = useTheme();
	const app = initFirebase();
	const auth = getAuth(app);
	const firestore = getFirestore(app);
	const [user, loading] = useAuthState(auth);
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const [companyName, setCompanyName] = useState();

	if (loading) {
		return <div>Loading...</div>; //add skeleton
	}

	if (!user) {
		router.push("/login");
		return <div>Loading...</div>;
	}

	const getCompanyData = async () => {
		if (user) {
			const userRef = doc(firestore, "Users", user.uid);
			const userSnap = await getDoc(userRef);
			const companyRef = doc(firestore, "Providers", userSnap.get("perms"));
			const companySnap = await getDoc(companyRef);
			setCompanyName(companySnap.get("Name"));
		}
	};
	getCompanyData();

	const toggleDrawer = () => {
		setOpen(!open);
	};

	return (
		<>
			<Head>
				<title>Company</title>
				<meta name="description" content="Company" />
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
					<Stack direction="row" spacing={2} alignItems="center" sx={{ m: 2 }}>
						<Avatar
							sx={{
								width: 70,
								height: 70,
								bgcolor: green[500],
								fontSize: 32,
							}}
							variant="square"
						>
							{companyName?.split(" ")[0][0] + companyName?.split(" ")[1][0]}
						</Avatar>
						<Typography variant="h3">{companyName}</Typography>
					</Stack>
					<Divider sx={{ p: 1 }} />
					<CssBaseline />
					<Box component="main" sx={{ flexGrow: 1, p: 1 }}>
						<Box
							sx={{
								padding: "1rem",
								height: "30vh",
								width: "80vw",
								display: "grid",
								gridTemplateColumns: "33% 33% 33%",
								gridTemplateRows: "100%",
								gridTemplateAreas: '"Admin Staff Patient"',
								columnGap: "10px",
							}}
						>
							<Card
								sx={{
									gridArea: "Admin",
									backgroundColor: "lightblue",
									height: "100%",
									width: "100%",
								}}
								justifySelf={"Center"}
								className="Admin"
								variant="outlined"
								component={"h4"}
							>
								<CardHeader
									avatar={
										<SupervisorAccountTwoToneIcon
											sx={{ fontSize: 50 }}
										></SupervisorAccountTwoToneIcon>
									}
									titleTypographyProps={{ variant: "h5" }}
									title="Administrators"
								/>
								<CardContent sx={{ flex: "1 0 auto" }}>
									<Typography variant="body2" color="text.secondary">
										Total Admin
									</Typography>
								</CardContent>
							</Card>
							<Card
								sx={{
									gridArea: "Staff",
									backgroundColor: "lightgreen",
									height: "100%",
									width: "100%",
								}}
								justifySelf={"Center"}
								className="Staff"
								variant="outlined"
								component={"h4"}
							>
								<CardHeader
									avatar={
										<SupervisorAccountTwoToneIcon
											sx={{ fontSize: 50 }}
										></SupervisorAccountTwoToneIcon>
									}
									titleTypographyProps={{ variant: "h5" }}
									title="Staff"
								/>
								<CardContent sx={{ flex: "1 0 auto" }}>
									<Typography variant="body2" color="text.secondary">
										Total Staff
									</Typography>
								</CardContent>
							</Card>
							<Card
								sx={{
									gridArea: "Patient",
									backgroundColor: "lightcoral",
									height: "100%",
									width: "100%",
								}}
								justifySelf={"Center"}
								className="Patient"
								variant="outlined"
								component={"h4"}
							>
								<CardHeader
									avatar={
										<SupervisorAccountTwoToneIcon
											sx={{ fontSize: 50 }}
										></SupervisorAccountTwoToneIcon>
									}
									titleTypographyProps={{ variant: "h5" }}
									title="Patient"
								/>
								<CardContent sx={{ flex: "1 0 auto" }}>
									<Typography variant="body2" color="text.secondary">
										Total Patient
									</Typography>
								</CardContent>
							</Card>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	);
}
