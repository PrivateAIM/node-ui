import "diff2html/bundles/css/diff2html.min.css";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import TabPanel from "../TabPanel";

const CompareTab = () => {
  const { openTab, containerCompareDiff, loadingContainerDiff } = useSelector(
    (state) => state.station
  );

  return (
    <TabPanel value={openTab} index={2}>
      {loadingContainerDiff ? (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h5" fontWeight="bold">
            Analyzing
          </Typography>
          <CircularProgress />
        </Stack>
      ) : (
        <Box
          sx={{ position: "relative" }}
          dangerouslySetInnerHTML={{ __html: containerCompareDiff }}
        />
      )}
    </TabPanel>
  );
};

export default CompareTab;
