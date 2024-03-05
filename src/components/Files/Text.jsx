import { useSelector } from "react-redux";
import { grey } from "@mui/material/colors";
import TextField from "@mui/material/TextField";

const TextFile = ({ slice }) => {
  const { resultItem } = useSelector((state) => state[slice]);

  return (
    <TextField
      rows={15}
      multiline
      fullWidth
      value={resultItem.content}
      InputProps={{ readOnly: true }}
      sx={{
        ".MuiInputBase-root": {
          fontFamily: "monospace",
          fontSize: "14px",
          bgcolor: grey[100],
        },
      }}
    />
  );
};

export default TextFile;
