import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { styled, useTheme, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MuiLink from "@mui/material/Link";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AccountIcon from "@mui/icons-material/AccountCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Logout from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import RefreshIcon from "@mui/icons-material/Refresh";

import Logo from "../../assets/logo-only.png";
import DrawerHeader from "../../components/DrawerHeader";
import UserService from "../../services/UserService";
import { LightTooltip } from "../../components/Tooltip";
import { learningType, navLinks } from "../../constants";
import {
  fetchTrains,
  fetchImages,
  fetchContainers,
  setLearningType,
} from "../../redux/reducers/stationSlice";
import { fetchFederatedJobs } from "../../redux/reducers/federatedSlice";
import { fetchStationInfo } from "../../redux/reducers/stationSlice";

const drawerWidth = 210;
const muiBadgeStyles = {
  ".MuiBadge-badge": {
    right: "-25px",
    fontWeight: "bold",
    borderRadius: "4px",
    px: "4px",
  },
};

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

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginLeft: theme.spacing(8),
  "& .MuiInputBase-input, .MuiSelect-icon": {
    color: theme.palette.common.white,
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: alpha(theme.palette.common.white, 0.23),
    },
    "&:hover fieldset, &.Mui-focused fieldset": {
      borderColor: alpha(theme.palette.common.white, 0.7),
    },
  },
}));

export default function Navbar() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { learning, stationID, stationName, stationVersion } = useSelector(
    (state) => state.station
  );

  const releaseHref = `https://git.rwth-aachen.de/padme-development/padme-station-software/-/releases/v${stationVersion}`;

  useEffect(() => {
    dispatch(fetchStationInfo());
  }, [dispatch]);

  const isMenuOpen = Boolean(anchorEl);

  const handleChangeLearning = (event) => {
    dispatch(setLearningType(event.target.value));
    navigate("/");
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = () => {
    dispatch(fetchTrains());
    if (learning === learningType.INCREMENTAL) {
      dispatch(fetchImages());
      dispatch(fetchContainers());
      return;
    }

    dispatch(fetchFederatedJobs());
  };

  const menuId = "account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleProfileMenuClose}
    >
      <MenuItem onClick={() => UserService.doLogout()}>
        <ListItemIcon>
          <Logout color="error" fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar elevation={0} position="fixed" open={open}>
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 2,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <img
            src={Logo}
            style={{ maxWidth: "60px" }}
            alt="PHT STATION SOFTWARE"
          />
          <Badge
            badgeContent={
              <MuiLink
                href={releaseHref}
                color="inherit"
                underline="none"
                target="_blank"
                rel="noreferer"
              >
                v{stationVersion}
              </MuiLink>
            }
            color="error"
            sx={muiBadgeStyles}
          >
            <Typography variant="h6" ml={2} fontWeight="bold">
              {stationName || stationID || "Station Software"}
            </Typography>
          </Badge>
          <StyledFormControl size="small">
            <Select
              id="select-learning-type"
              value={learning}
              onChange={handleChangeLearning}
            >
              <MenuItem value={learningType.INCREMENTAL}>
                Incremental Learning
              </MenuItem>
              <MenuItem value={learningType.FEDERATED}>
                Federated Learning
              </MenuItem>
            </Select>
          </StyledFormControl>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <LightTooltip title="Refresh">
              <IconButton size="large" color="inherit" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </LightTooltip>
            <Button
              aria-label="user account"
              aria-controls={menuId}
              aria-haspopup="true"
              size="large"
              startIcon={<AccountIcon />}
              onClick={handleProfileMenuOpen}
              sx={{ color: "white" }}
            >
              {UserService.getUsername()}
            </Button>
            {renderMenu}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List
          sx={{
            paddingTop: "19px",
            a: { textDecoration: "none", color: "inherit" },
          }}
        >
          {navLinks(learning).map((link) => (
            <Link key={link.title} to={link.to}>
              <ListItem disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  selected={pathname === link.to}
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
                    {link.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={link.title}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
        </List>
      </Drawer>
    </>
  );
}
