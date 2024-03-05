import { useSelector } from "react-redux";
import Box from "@mui/material/Box";

const ImageFile = ({ slice, rounded = false }) => {
  const { resultItem, selectedFileToView } = useSelector(
    (state) => state[slice]
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "> img": rounded
          ? {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 2,
            }
          : {},
      }}
    >
      <img src={resultItem.content} alt={selectedFileToView} />
    </Box>
  );
};

export default ImageFile;
