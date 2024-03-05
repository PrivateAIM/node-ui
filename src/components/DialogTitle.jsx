import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const StyledDialogTitle = (props) => {
  const { children, disable = false, onClose, ...other } = props;
  return (
    <DialogTitle
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: "bold",
      }}
      {...other}
    >
      {children}
      {onClose ? (
        <IconButton disabled={disable} aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export default StyledDialogTitle;
