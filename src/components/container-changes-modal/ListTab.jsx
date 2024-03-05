import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TreeView from "@mui/lab/TreeView";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ErrorIcon from "@mui/icons-material/ErrorOutline";
import FolderIcon from "@mui/icons-material/Folder";
import FileIcon from "@mui/icons-material/InsertDriveFile";

import TabPanel from "../TabPanel";
import StyledTreeItemRoot from "../StyledTreeItemRoot";
import { contentChangeKind } from "../../constants";
import {
  setDownloadFiles,
  showContainerFileChanges,
} from "../../redux/reducers/stationSlice";

const StyledTreeItem = (props) => {
  const {
    bgColor,
    color,
    jobId,
    labelIcon: LabelIcon,
    labelInfo,
    labelText,
    kindCode,
    ...other
  } = props;

  const dispatch = useDispatch();
  const { downloadFiles, selectedContainer } = useSelector(
    (state) => state.station
  );
  const [checked, setChecked] = useState(false);

  const handleChange =
    (filepath) =>
    ({ target }) => {
      setChecked(target.checked);

      if (target.checked) {
        dispatch(
          setDownloadFiles([...downloadFiles, { name: filepath, kindCode }])
        );
      } else {
        dispatch(
          setDownloadFiles(
            downloadFiles.filter((file) => file.name !== filepath)
          )
        );
      }
    };

  const handleViewFile = () => {
    const payload = {
      ...selectedContainer,
      filepath: props.nodeId.substr(1),
      kindCode,
    };

    dispatch(showContainerFileChanges(payload));
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
            <Box component={LabelIcon} color={contentChangeKind[kindCode]} />
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
          kindCode={res.kindCode}
        >
          {renderResultTree(res.children)}
        </StyledTreeItem>
      ) : (
        <StyledTreeItem
          key={`${res.name}_${idx}`}
          nodeId={res.path}
          labelText={res.name}
          labelIcon={FileIcon}
          kindCode={res.kindCode}
        />
      )
    )}
  </>
);

const ListTab = () => {
  const { containerResults, openTab } = useSelector((state) => state.station);
  const [expanded, setExpanded] = useState([]);
  const handleToggle = (_, nodeIds) => {
    setExpanded(nodeIds);
  };

  return (
    <TabPanel value={openTab} index={0}>
      <TreeView
        aria-label="container-results-tree"
        expanded={expanded}
        onNodeToggle={handleToggle}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        sx={{ flexGrow: 1, overflowY: "auto" }}
      >
        {containerResults.length > 0 ? (
          renderResultTree(containerResults)
        ) : (
          <Stack
            spacing={1}
            padding={2}
            direction="row"
            justifyContent="center"
          >
            <ErrorIcon />
            <Typography>No results available for this job</Typography>
          </Stack>
        )}
      </TreeView>
    </TabPanel>
  );
};

export default ListTab;
