import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";

const LightTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 11,
    fontWeight: "bold",
  },
}));

const HtmlTooltip = styled(({ className, title, ...props }) => (
  <Tooltip
    {...props}
    arrow
    disableInteractive
    classes={{ popper: className }}
    title={
      <Typography variant="body2" align="center" fontWeight="600">
        {title}
      </Typography>
    }
  />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.primary.main,
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9",
  },
}));

export { HtmlTooltip, LightTooltip };
