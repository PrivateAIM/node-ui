import { useSelector, useDispatch } from "react-redux";
import { grey } from "@mui/material/colors";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";

import ListTab from "./ListTab";
import ViewTab from "./ViewTab";
import StyledButton from "../Button";
import StyledDialogTitle from "../DialogTitle";
import { resultTab } from "../../constants";
import {
  setOpenTab,
  downloadJobResult,
} from "../../redux/reducers/federatedSlice";

function a11yProps(index) {
  return {
    id: `container-tab-${index}`,
    "aria-controls": `container-tabpanel-${index}`,
  };
}

const FederatedResultsModal = ({ open, handleClose, selectedJob }) => {
  const dispatch = useDispatch();
  const federatedJobID = selectedJob?.jobID;
  const {
    openTab,
    openTabId,
    selectedFileToView,
    loadingFLJobResults,
    downloadFiles,
  } = useSelector((state) => state.federated);
  const totalFiles = downloadFiles.length;
  const isListTab = openTabId === resultTab.LIST;

  const labelViewTab = Boolean(selectedFileToView) ? (
    <>
      View (<b>{selectedFileToView.split("/").pop()}</b>)
    </>
  ) : (
    "View"
  );

  const handleChangeTab = ({ target }, newValue) => {
    // dispatch(setDownloadFiles([]));
    dispatch(
      setOpenTab({
        tab: newValue,
        tabId: target.id,
      })
    );
  };

  const downloadSelected = () => {
    const download = (files) => {
      const payload = {
        jobId: federatedJobID,
        params: { path: files.pop() },
      };

      dispatch(downloadJobResult(payload));

      if (files.length === 0) clearInterval(interval);
    };

    /**
     * Check to either download multiple files on
     * List Tab or a single file on the View Tab.
     */
    const interval = setInterval(download, 1000, [
      ...(isListTab ? downloadFiles : [selectedFileToView]),
    ]);
  };

  const downloadAll = () => {
    const payload = { jobId: federatedJobID };
    dispatch(downloadJobResult(payload));
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open}>
      <StyledDialogTitle onClose={handleClose}>
        Last Job Results
      </StyledDialogTitle>
      <DialogContent dividers>
        <Stack
          spacing={1}
          sx={{ p: 1, px: 2, bgcolor: grey[100], borderRadius: 2, mb: 2 }}
        >
          <Typography>
            <b>Job ID: </b>
            {federatedJobID}
          </Typography>
          <Typography>
            <b>Learning Image: </b>
            {selectedJob?.learningImage}
          </Typography>
        </Stack>
        {loadingFLJobResults ? (
          <Stack alignItems="center" padding={2}>
            <CircularProgress />
          </Stack>
        ) : (
          <>
            <Tabs
              value={openTab}
              onChange={handleChangeTab}
              aria-label="container results tab"
              sx={{ "& .MuiTab-root": { display: "block" }, mb: 3 }}
            >
              <Tab label="List" {...a11yProps(0)} />
              <Tab
                label={labelViewTab}
                disabled={!Boolean(selectedFileToView)}
                {...a11yProps(1)}
              />
            </Tabs>
            <ListTab id="federated-list-tab" />
            <ViewTab id="federated-view-tab" />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <StyledButton
          disabled={isListTab ? totalFiles === 0 : !selectedFileToView} // Only disable on List Tab if no file is selected
          variant="outlined"
          onClick={downloadSelected}
        >
          Download Selected {totalFiles > 0 && `(${totalFiles})`}
        </StyledButton>
        <StyledButton variant="contained" onClick={downloadAll}>
          Download All
        </StyledButton>
      </DialogActions>
    </Dialog>
  );
};

export default FederatedResultsModal;
