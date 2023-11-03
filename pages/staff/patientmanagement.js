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
	FieldValue,
	addDoc,
	arrayUnion,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

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
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import BiotechIcon from "@mui/icons-material/Biotech";
import MedicationIcon from "@mui/icons-material/Medication";
import DeleteIcon from "@mui/icons-material/Delete";

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

export default function DoctorDashboard() {
	const theme = useTheme();
	const app = initFirebase();
	const auth = getAuth(app);
	const firestore = getFirestore(app);
	const [user, loading] = useAuthState(auth);
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const [rows, setRows] = useState([]);
	const [labRows, setLabRows] = useState([]);
	const [medicineRows, setMedicineRows] = useState([]);

	// New User Popup
	const [addUserPopup, setaddUserPopup] = useState(false);
	const [newUserFirst, setNewUserFirst] = useState("");
	const [newUserLast, setNewUserLast] = useState("");
	const [newUserFirstERR, setNewUserFirstERR] = useState("");
	const [newUserLastERR, setNewUserLastERR] = useState("");

	const [viewTests, setviewTests] = useState(false);
	const [patientID, setpatientID] = useState("");
	const [viewMedications, setviewMedications] = useState(false);

	if (loading) {
		return <div>Loading...</div>; //add skeleton
	}

	if (!user) {
		router.push("/login");
		return <div>Loading...</div>;
	}

	const handleClickOpenUserPopup = () => {
		setNewUserFirstERR("");
		setNewUserLastERR("");

		setaddUserPopup(true);
	};

	// LabTest Functions
	const addPatient = async () => {
		setNewUserFirstERR("");
		setNewUserLastERR("");
		let err = false;

		if (newUserFirst === "") {
			err = true;
			setNewUserFirstERR("Add First Name");
		}

		if (newUserLast === "") {
			err = true;
			setNewUserLastERR("Add Last Name");
		}

		if (err) {
			return;
		}

		const userRef = doc(firestore, "Users", user.uid);
		const userDocSnap = await getDoc(userRef);
		let companyID = userDocSnap.get("perms");

		const mediRef = collection(firestore, "Medical");

		const docRef = await addDoc(mediRef, {
			firstName: newUserFirst,
			lastName: newUserLast,
		});

		const providerRef = doc(firestore, "Providers", companyID);

		await updateDoc(providerRef, {
			MedicalData: arrayUnion(docRef.id),
		});

		await getDoc(providerRef);

		setaddUserPopup(false);
		updatePatientTable();
	};

	const addTest = async () => {
		const testRef = collection(firestore, "Medical", patientID, "Tests");

		addDoc(testRef, {
			name: "",
			results: "",
			status: "Not Started",
		});
		updateLabTable(patientID);
	};

	const handleRemoveLab = async (row) => {
		const testRef = doc(firestore, "Medical", patientID, "Tests", row.id);

		deleteDoc(testRef);
		updateLabTable(patientID);
	};

	const editTests = async (params) => {
		setpatientID(params.id);
		updateLabTable(params.id);
		setviewTests(true);
	};

	async function updateLabTable(id) {
		const testRef = collection(firestore, "Medical", id, "Tests");
		const testSnapshot = await getDocs(testRef);

		setLabRows([]);
		testSnapshot.forEach((doc) => {
			setLabRows((arr) => [
				...arr,
				{
					id: doc.id,
					name: doc.get("name"),
					results: doc.get("results"),
					status: doc.get("status"),
				},
			]);
		});
	}

	async function updateTest(row) {
		if (!row) {
			return;
		}

		const testRef = doc(firestore, "Medical", patientID, "Tests", row.id);

		await updateDoc(testRef, {
			name: row.name ? row.name : "",
			results: row.results ? row.results : "",
			status: row.status ? row.status : "",
		});
	}

	//Medication Functions
	const editMedications = async (params) => {
		setpatientID(params.id);
		updateMedicineTable(params.id);
		setviewMedications(true);
	};

	const addMedicine = async () => {
		const medRef = collection(firestore, "Medical", patientID, "Medications");

		addDoc(medRef, {
			name: "Name",
			prescription: "",
			instructions: "",
		});
		updateMedicineTable(patientID);
	};

	const handleRemoveMedication = async (row) => {
		const medRef = doc(firestore, "Medical", patientID, "Medications", row.id);

		deleteDoc(medRef);
		updateMedicineTable(patientID);
	};

  async function updateMeds(row) {
		if (!row) {
			return;
		}

		const medRef = doc(firestore, "Medical", patientID, "Medications", row.id);

		await updateDoc(medRef, {
			name: row.name ? row.name : "",
			prescription: row.prescription ? row.prescription : "",
			instructions: row.instructions ? row.instructions : "",
		});
	}


	async function updateMedicineTable(id) {
		const medRef = collection(firestore, "Medical", id, "Medications");
		const medSnapshot = await getDocs(medRef);

		setMedicineRows([]);
		medSnapshot.forEach((doc) => {
			setMedicineRows((arr) => [
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

	//Main Table Update
	async function updatePatientTable(startup) {
		if (startup && startupRender) {
			return;
		}
		startupRender = true;

		const userRef = doc(firestore, "Users", user.uid);
		const userDocSnap = await getDoc(userRef);
		let companyID = userDocSnap.get("perms");

		const companyRef = doc(firestore, "Providers", companyID);
		const companyDocSnap = await getDoc(companyRef);
		let medical = companyDocSnap.get("MedicalData");

		setRows([]);

		medical.forEach(async (v) => {
			//console.log(v);

			const mediRef = doc(firestore, "Medical", v);
			const mediDocSnap = await getDoc(mediRef);

			setRows((arr) => [
				...arr,
				{
					id: v,
					first: mediDocSnap.get("firstName"),
					last: mediDocSnap.get("lastName"),
				},
			]);
		});
	}
	updatePatientTable(true);

	const toggleDrawer = () => {
		setOpen(!open);
	};

	const columns = [
		{ field: "first", headerName: "First Name", width: 150 },
		{ field: "last", headerName: "Last Name", width: 150 },
		{
			field: "Results",
			headerName: "Test Results",
			width: 150,
			renderCell: (params) => {
				return (
					<>
						<IconButton onClick={() => editTests(params)}>
							<BiotechIcon />
						</IconButton>
					</>
				);
			},
		},
		{
			field: "Medication",
			headerName: "Medication",
			width: 150,
			renderCell: (params) => {
				return (
					<>
						<IconButton onClick={() => editMedications(params)}>
							<MedicationIcon />
						</IconButton>
					</>
				);
			},
		},
	];

	const labColumns = [
		{ field: "name", headerName: "Test Name", width: 150, editable: true },
		{ field: "results", headerName: "Results", width: 500, editable: true },
		{
			field: "status",
			headerName: "Status",
			width: 150,
			editable: true,
			type: "singleSelect",
			valueOptions: ["Not Started", "In Process", "Complete"],
		},
		{
			field: "delete",
			headerName: "Delete",
			width: 150,
			renderCell: (params) => {
				return (
					<>
						<IconButton onClick={() => handleRemoveLab(params)}>
							<DeleteIcon />
						</IconButton>
					</>
				);
			},
		},
	];

	const medicineColumns = [
		{
			field: "name",
			headerName: "Medication Name",
			width: 150,
			editable: true,
		},
		{
			field: "prescription",
			headerName: "Prescription",
			width: 500,
			editable: true,
		},
		{
			field: "instructions",
			headerName: "Instructions",
			width: 500,
			editable: true,
		},
		{
			field: "delete",
			headerName: "Delete",
			width: 150,
			renderCell: (params) => {
				return (
					<>
						<IconButton onClick={() => handleRemoveMedication(params)}>
							<DeleteIcon />
						</IconButton>
					</>
				);
			},
		},
	];

	return (
		<>
			<Head>
				<title>Patient Managment</title>
				<meta name="description" content="Patient Management" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			{/* Add User Popup */}
			<Dialog
				open={addUserPopup}
				onClose={() => {
					setaddUserPopup(false);
				}}
			>
				<DialogTitle>Add Patient</DialogTitle>
				<DialogContent>
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
					<Button
						onClick={() => {
							setaddUserPopup(false);
						}}
					>
						Cancel
					</Button>
					<Button onClick={addPatient}>Add Patient</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Test Data */}
			<Dialog
				open={viewTests}
				onClose={() => {
					setviewTests(false);
				}}
				fullWidth="true"
				maxWidth="xl"
			>
				<DialogTitle>Tests</DialogTitle>

				<DialogContent>
					<DataGrid
						rows={labRows}
						columns={labColumns}
						//isRowSelectable={() => false}
						autoHeight={true}
						processRowUpdate={(newRow, oldRow) => {
							updateTest(newRow);
							return newRow;
						}}
					/>

					<br />

					<Button
						size="small"
						variant="contained"
						color="success"
						onClick={() => {
							addTest();
						}}
					>
						Add Test
					</Button>
				</DialogContent>

				<DialogActions>
					<Button
						onClick={() => {
							setviewTests(false);
						}}
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Medication Data */}
			<Dialog
				open={viewMedications}
				onClose={() => {
					setviewMedications(false);
				}}
				fullWidth="true"
				maxWidth="xl"
			>
				<DialogTitle>Medications</DialogTitle>

				<DialogContent>
					<DataGrid
						rows={medicineRows}
						columns={medicineColumns}
						//isRowSelectable={() => false}
						autoHeight={true}
						processRowUpdate={(newRow, oldRow) => {
							updateMeds(newRow);
							return newRow;
						}}
					/>

					<br />

					<Button
						size="small"
						variant="contained"
						color="success"
						onClick={() => {
							addMedicine();
						}}
					>
						Add Medicine
					</Button>
				</DialogContent>

				<DialogActions>
					<Button
						onClick={() => {
							setviewMedications(false);
						}}
					>
						Close
					</Button>
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
						{["Dashboard"].map((text, index) => (
							<ListItem key={text} disablePadding sx={{ display: "block" }}>
								<ListItemButton
									sx={{
										minHeight: 48,
										justifyContent: open ? "initial" : "center",
										px: 2.5,
									}}
									onClick={() => {
										router.push("/staff/dashboard");
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
						{["Patient Management", "Appointments"].map((text, index) => (
							<ListItem key={text} disablePadding sx={{ display: "block" }}>
								<ListItemButton
									sx={{
										minHeight: 48,
										justifyContent: open ? "initial" : "center",
										px: 2.5,
									}}
									onClick={() => {
										if (index % 2 === 0) {
											router.push("/staff/patientmanagement");
										} else {
											router.push("/staff/appointment");
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
										{index % 2 === 0 ? (
											<GroupsRounded />
										) : (
											<CalendarMonthIcon />
										)}
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
										router.push("/staff/account");
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
					<h1>Patients</h1>
					<div style={{ height: 300, width: "100%" }}>
						<DataGrid
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
						Add Patient
					</Button>
				</Box>
			</Box>
		</>
	);
}