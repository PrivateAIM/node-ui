const StyledLinearProgress = ({
  value,
  total = null,
  usePercentage = true,
  placeholder = null,
}) => (
  <div className="progressBar">
    <div
      style={{
        height: "100%",
        width: `${usePercentage ? value : (value / total) * 100}%`,
        backgroundColor: "#1C1B22",
        transition: "width 0.5s",
        borderRadius: 10,
      }}
    ></div>
    <span className="progressPercent" style={{ fontSize: "small" }}>
      {usePercentage ? `${value}%` : `${value} / ${total} ${placeholder}`}
    </span>
  </div>
);

export default StyledLinearProgress;
