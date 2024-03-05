import { useSelector, useDispatch } from "react-redux";
import { grey } from "@mui/material/colors";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import DownloadIcon from "@mui/icons-material/DownloadForOfflineRounded";

import ListTab from "./ListTab";
import ViewTab from "./ViewTab";
import CompareTab from "./CompareTab";
import StyledButton from "../Button";
import StyledDialogTitle from "../DialogTitle";
import { resultTab } from "../../constants";
import {
  setOpenTab,
  setDownloadFiles,
  showContainerDiff,
  downloadJobResult,
} from "../../redux/reducers/stationSlice";
import { showAlert } from "../../redux/reducers/alertSlice";

function a11yProps(index) {
  return {
    id: `container-tab-${index}`,
    "aria-controls": `container-tabpanel-${index}`,
  };
}

const ContainerChangesModal = ({ open, handleClose, selectedContainer }) => {
  const dispatch = useDispatch();
  const {
    openTab,
    openTabId,
    downloadFiles,
    selectedContainer: payload, // renaming due to prop conflict in 'handleChangeTab'
    selectedFileToView,
    loadingContainerDiff,
    loadingContainerChanges,
    containerResultsFetchedId,
  } = useSelector((state) => state.station);

  const totalFiles = downloadFiles.length;
  const isListTab = openTabId === resultTab.LIST;
  const isCompareTab = openTabId === resultTab.COMPARE;

  const handleChangeTab = ({ target }, newValue) => {
    // Dispatch Container Diff API when compare tab clicked
    if (target.id === resultTab.COMPARE) {
      dispatch(showContainerDiff(payload));
    }

    dispatch(setDownloadFiles([]));
    dispatch(
      setOpenTab({
        tab: newValue,
        tabId: target.id,
      })
    );
  };

  const downloadSelected = () => {
    const downloadSingle = openTab === 1 && selectedFileToView.kindCode === 0;
    const downloadMultiple =
      openTab === 0 && downloadFiles.some((file) => file.kindCode === 0);

    if (downloadSingle || downloadMultiple) {
      const message = `You are only allowed to download Added Files${
        downloadFiles.length > 0 ? ". Please uncheck any Modified Files" : ""
      }`;

      dispatch(
        showAlert({
          message,
          options: {
            key: `ERROR_DOWNLOADING_FILES_${selectedFileToView}`,
            variant: "warning",
          },
        })
      );

      return;
    } else {
      const download = (files) => {
        const payload = {
          container: containerResultsFetchedId,
          path: files.pop(),
        };
        dispatch(downloadJobResult(payload));

        if (files.length === 0) clearInterval(interval);
      };

      /**
       * Check to either download multiple files on
       * List Tab or a single file on the View Tab.
       */
      const interval = setInterval(download, 1000, [
        ...(isListTab
          ? downloadFiles.map((file) => file.name)
          : [selectedFileToView.name]),
      ]);
    }
  };

  const handleCloseDialog = () => {
    handleClose();
    dispatch(setDownloadFiles([]));
  };

  const labelViewTab = Boolean(selectedFileToView.name) ? (
    <>
      View (<b>{selectedFileToView.name.split("/").pop()}</b>)
    </>
  ) : (
    "View"
  );

  return (
    <Dialog fullWidth maxWidth="md" open={open}>
      <StyledDialogTitle
        disable={loadingContainerChanges}
        onClose={handleCloseDialog}
      >
        Container Changes
      </StyledDialogTitle>
      <DialogContent dividers>
        <Stack
          spacing={1}
          sx={{ p: 1, px: 2, bgcolor: grey[100], borderRadius: 2, mb: 2 }}
        >
          <Typography>
            <b>Train ID: </b>
            {selectedContainer?.trainID}
          </Typography>
          <Typography>
            <b>Container ID: </b>
            {selectedContainer?.id}
          </Typography>
        </Stack>
        {loadingContainerChanges ? (
          <Stack alignItems="center" padding={2}>
            <CircularProgress />
          </Stack>
        ) : (
          <>
            <Tabs
              value={openTab}
              onChange={handleChangeTab}
              aria-label="container results tab"
              sx={{ "& .MuiTab-root": { display: "block" } }}
            >
              <Tab
                label="List"
                disabled={loadingContainerDiff}
                {...a11yProps(0)}
              />
              <Tab
                label={labelViewTab}
                disabled={
                  !Boolean(selectedFileToView.name) || loadingContainerDiff
                }
                {...a11yProps(1)}
              />
              <Tab label="Compare" {...a11yProps(2)} />
            </Tabs>
            <Stack
              spacing={1}
              direction="row"
              justifyContent="flex-end"
              sx={{ mb: 1, ".MuiChip-root": { fontWeight: "bold" } }}
            >
              <Chip label="Modified" color="warning" />
              <Chip label="Added" color="success" />
              <Chip label="Deleted" color="error" />
            </Stack>
            <ListTab id="container-list-tab" />
            <ViewTab id="container-view-tab" />
            <CompareTab id="container-compare-tab" />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <StyledButton
          /**
           * - Always disable on Compare Tab.
           * - Disable on List Tab if no file is selected.
           */
          disabled={
            isListTab
              ? totalFiles === 0
              : !selectedFileToView.name || isCompareTab
          }
          variant="contained"
          onClick={downloadSelected}
          startIcon={<DownloadIcon />}
        >
          Download {totalFiles > 0 && `(${totalFiles})`}
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default ContainerChangesModal;
