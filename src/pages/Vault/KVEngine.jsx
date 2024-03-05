import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CreateIcon from "@mui/icons-material/AddCircleOutline";
import DisableIcon from "@mui/icons-material/Block";
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";

import { HtmlTooltip } from "../../components/Tooltip";
import VaultKVEngineConfigModal from "../../components/vault-engine-config-modal";
import VaultSecretDataModal from "../../components/vault-secret-data-modal";
import VaultEnableEngineModal from "../../components/vault-enable-engine-modal";
import {
  fetchKVEngines,
  disableKVEngine,
  deleteVaultSecret,
  resetVaultSecretData,
  fetchVaultSecretData,
  fetchKVEngineConfiguration,
} from "../../redux/reducers/stationSlice";

const KVEngine = () => {
  const dispatch = useDispatch();
  const [selectedEngine, setSelectedEngine] = useState("");
  const [openConfig, setOpenConfig] = useState(false);
  const [openSecretData, setOpenSecretData] = useState(false);
  const [openNewEngine, setOpenNewEngine] = useState(false);
  const [editSecret, setEditSecret] = useState(true);
  const { vault } = useSelector((state) => state.station);

  useEffect(() => {
    dispatch(fetchKVEngines());
  }, [dispatch]);

  const handleFetchEngineConfig = (engine) => (_) => {
    dispatch(fetchKVEngineConfiguration(engine)).then(() => {
      setOpenConfig(true);
    });
  };

  const handleEditSecretData = (vaultPath) => (_) => {
    setEditSecret(true);
    dispatch(fetchVaultSecretData(vaultPath)).then(() => {
      setOpenSecretData(true);
    });
  };

  const handleCreateVaultSecret = (engine) => (_) => {
    dispatch(resetVaultSecretData());
    setSelectedEngine(engine);
    setEditSecret(false);
    setOpenSecretData(true);
  };

  const handleDisableEngine = (engine) => (_) => {
    if (
      window.confirm(
        `Disable (${engine}) engine? Any data in this engine will be permanently deleted.`
      )
    ) {
      dispatch(disableKVEngine(engine));
    }
  };

  const handleDeleteVaultSecret = (vaultPath) => (_) => {
    if (
      window.confirm(
        `Delete (${vaultPath}) secret? This will permanently delete the secret and all its versions.`
      )
    ) {
      dispatch(deleteVaultSecret(vaultPath));
    }
  };

  const Row = ({ engine }) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <TableRow>
          <TableCell sx={{ overflowWrap: "anywhere", width: 50 }}>
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>
            <b>{engine?.name}</b>
          </TableCell>
          <TableCell align="center">
            <Stack direction="row" justifyContent="center" spacing={1}>
              <HtmlTooltip title="Create Secret">
                <IconButton
                  color="success"
                  size="small"
                  onClick={handleCreateVaultSecret(engine?.name)}
                >
                  <CreateIcon />
                </IconButton>
              </HtmlTooltip>
              <HtmlTooltip title="View Configuration">
                <IconButton
                  size="small"
                  onClick={handleFetchEngineConfig(engine?.name)}
                >
                  <SettingsIcon />
                </IconButton>
              </HtmlTooltip>
              <HtmlTooltip title="Disable">
                <IconButton
                  color="error"
                  size="small"
                  onClick={handleDisableEngine(engine?.name)}
                >
                  <DisableIcon />
                </IconButton>
              </HtmlTooltip>
            </Stack>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box m={2}>
                <Typography gutterBottom fontWeight="bold">
                  Secrets
                </Typography>
                <Table size="small">
                  <TableBody>
                    {engine?.paths.map((secret) => (
                      <TableRow key={`engine-${engine?.name}-secret-${secret}`}>
                        <TableCell align="center" width="50%">
                          <b>{secret}</b>
                        </TableCell>
                        <TableCell width="50%">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            <HtmlTooltip title="Edit" placement="top">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={handleEditSecretData(
                                  `${engine?.name}${secret}`
                                )}
                              >
                                <EditIcon />
                              </IconButton>
                            </HtmlTooltip>
                            <HtmlTooltip title="Delete" placement="top">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={handleDeleteVaultSecret(
                                  `${engine?.name}${secret}`
                                )}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </HtmlTooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3 }}>
        <Stack
          position="relative"
          direction="row"
          justifyContent="center"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6" fontWeight="bold">
            Key-Value Engines
          </Typography>
          <HtmlTooltip title="Enable New KV Engine" placement="top">
            <span style={{ position: "absolute", right: 0 }}>
              <IconButton
                color="success"
                onClick={() => setOpenNewEngine(true)}
              >
                <CreateIcon />
              </IconButton>
            </span>
          </HtmlTooltip>
        </Stack>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid gainsboro" }}
        >
          <Table stickyHeader sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <b>Path</b>
                </TableCell>
                <TableCell align="center">
                  <b>Operation</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vault.kvEngines.map((eng) => (
                <Row key={`KVEngine-${eng?.name}`} engine={eng} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <VaultKVEngineConfigModal
        open={openConfig}
        handleClose={() => setOpenConfig(false)}
      />
      <VaultSecretDataModal
        open={openSecretData}
        handleClose={() => setOpenSecretData(false)}
        selectedEngine={selectedEngine}
        editSecret={editSecret}
      />
      <VaultEnableEngineModal
        open={openNewEngine}
        handleClose={() => setOpenNewEngine(false)}
      />
    </Container>
  );
};

export default KVEngine;
