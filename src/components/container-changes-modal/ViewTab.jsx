import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import TabPanel from "../TabPanel";
import { ImageFile, TextFile, CsvFile } from "../Files";
import { resultItemSupportedTypes } from "../../constants";

const ViewTab = () => {
  const { openTab, resultItem, loadingContainerView } = useSelector(
    (state) => state.station
  );

  const UnsupportedFile = () => (
    <Box sx={{ wordWrap: "break-word", p: 2, mt: 2 }}>
      Visualization for this file type is not supported in the browser. Please
      download and view.
    </Box>
  );

  const renderFileContent = () => {
    switch (resultItem.type) {
      case resultItemSupportedTypes.IMAGE:
        return <ImageFile slice="station" />;

      case resultItemSupportedTypes.TEXT:
        return <TextFile slice="station" />;

      case resultItemSupportedTypes.CSV:
        return <CsvFile slice="station" />;
      default:
        return <UnsupportedFile />;
    }
  };

  return (
    <TabPanel value={openTab} index={1}>
      {loadingContainerView ? (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h5" fontWeight="bold">
            Loading
          </Typography>
          <CircularProgress />
        </Stack>
      ) : (
        renderFileContent()
      )}
    </TabPanel>
  );
};

export default ViewTab;
