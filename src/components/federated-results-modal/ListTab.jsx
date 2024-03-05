import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TreeView from "@mui/lab/TreeView";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import FolderIcon from "@mui/icons-material/Folder";
import FileIcon from "@mui/icons-material/InsertDriveFile";

import TabPanel from "../TabPanel";
import StyledTreeItemRoot from "../StyledTreeItemRoot";
import {
  setDownloadFiles,
  downloadResultItem,
} from "../../redux/reducers/federatedSlice";

const StyledTreeItem = (props) => {
  const {
    bgColor,
    color,
    labelIcon: LabelIcon,
    iconColor = "orange",
    labelInfo,
    labelText,
    kindCode,
    ...other
  } = props;

  const dispatch = useDispatch();
  const [checked, setChecked] = useState(false);
  const { downloadFiles, selectedFLJob } = useSelector(
    (state) => state.federated
  );

  const handleChange =
    (filepath) =>
    ({ target }) => {
      setChecked(target.checked);

      if (target.checked) {
        dispatch(setDownloadFiles([...downloadFiles, filepath]));
      } else {
        dispatch(
          setDownloadFiles(downloadFiles.filter((path) => path !== filepath))
        );
      }
    };

  const handleViewFile = () => {
    const payload = {
      jobId: selectedFLJob.jobID,
      params: { path: props.nodeId },
    };

    dispatch(downloadResultItem(payload));
  };

  return (
    <StyledTreeItemRoot
      label={
        <Box sx={{ display: "flex", alignItems: "center", p: 0.5, pr: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexGrow: 1 }}
            onClick={!props.children ? handleViewFile : null}
          >
            <Box component={LabelIcon} color={iconColor} />
            <Typography
              variant="body2"
              color="text.primary"
              sx={{ fontWeight: 600 }}
            >
              {labelText}
            </Typography>
          </Stack>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
          {!props.children && (
            <Checkbox
              checked={checked}
              size="small"
              onChange={handleChange(props.nodeId)}
              inputProps={{ "aria-label": "controlled" }}
            />
          )}
        </Box>
      }
      style={{
        "--tree-view-color": color,
        "--tree-view-bg-color": bgColor,
      }}
      {...other}
    />
  );
};

const renderResultTree = (treeItems) => (
  <>
    {treeItems.map((res, idx) =>
      res.children.length ? (
        <StyledTreeItem
          key={`${res.name}_${idx}`}
          nodeId={res.path}
          labelText={res.name}
          labelIcon={FolderIcon}
        >
          {renderResultTree(res.children)}
        </StyledTreeItem>
      ) : (
        <StyledTreeItem
          key={`${res.name}_${idx}`}
          nodeId={res.path}
          labelText={res.name}
          labelIcon={FileIcon}
          iconColor="#28a745"
        />
      )
    )}
  </>
);

const ListTab = () => {
  const { openTab, federatedResults } = useSelector((state) => state.federated);
  const [expanded, setExpanded] = useState([]);
  const handleToggle = (_, nodeIds) => {
    setExpanded(nodeIds);
  };

  return (
    <TabPanel value={openTab} index={0}>
      <TreeView
        aria-label="federated-job-results-tree"
        expanded={expanded}
        onNodeToggle={handleToggle}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        sx={{ flexGrow: 1, overflowY: "auto" }}
      >
        {renderResultTree(federatedResults)}
      </TreeView>
    </TabPanel>
  );
};

export default ListTab;
