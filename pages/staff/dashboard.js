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
import { doc, getDoc, getFirestore } from "firebase/firestore";

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
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Unstable_Grid2";
import BiotechIcon from "@mui/icons-material/Biotech";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
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

export default function DoctorDashboard() {
  const theme = useTheme();
  const app = initFirebase();
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const colWidth = { xs: 12, sm: 6, md: 4, lg: 3 };
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

  return (
    <>
      <Head>
        <title>Doctor Dashboard</title>
        <meta name="description" content="Doctor Dashboard" />
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
          <Box
            sx={{
              padding: "1rem",
              height: "500px",
              width: "1000px",
              display: "grid",
              gridTemplateColumns: "350px 350px 350px",
              gridTemplateRows: "50% 50%",
              gridTemplateAreas:
                '"Appointments Appointments User" "Patients Patients User"',
              columnGap: "10px",
              rowGap: "10px",
              alignContent: "center",
            }}
          >
            <Card
              sx={{ gridArea: "User", backgroundColor: "lightblue" }}
              justifySelf={"Center"}
              className="User"
              variant="outlined"
              component={"h4"}
            >
              <CardContent>
                <AccountCircleIcon sx={{ fontSize: 100 }}></AccountCircleIcon>
                <Typography gutterBottom variant="h5" component="div">
                  Dr.User
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Welcome to Health-E-Patient
                </Typography>
              </CardContent>
            </Card>
            <Card
              sx={{
                gridArea: "Appointments",
                backgroundColor: "lightgreen",
                height: "100%",
                width: "100%",
              }}
              justifySelf={"Center"}
              className="Appointments"
              variant="outlined"
              component={"h4"}
            >
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Appointments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Appointments:
                </Typography>
              </CardContent>
            </Card>
            <Card
              sx={{ gridArea: "Patients", backgroundColor: "lightcoral" }}
              justifySelf={"Center"}
              className="Medication"
              variant="outlined"
              component={"h4"}
            >
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  View Patients
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  List of Patients:
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </>
  );
}
