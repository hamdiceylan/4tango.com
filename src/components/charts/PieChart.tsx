"use client";

interface PieChartData {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  showLegend?: boolean;
  maxItems?: number;
}

// Color palette
const COLORS = [
  "#4472C4", // blue
  "#ED7D31", // orange
  "#A5A5A5", // gray
  "#FFC000", // yellow
  "#5B9BD5", // light blue
  "#70AD47", // green
  "#9E480E", // brown
  "#997300", // dark yellow
  "#264478", // dark blue
  "#43682B", // dark green
];

export default function PieChart({
  data,
  size = 180,
  showLegend = true,
  maxItems = 8,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No data
      </div>
    );
  }

  // Take top items and group rest as "Other"
  let chartData = [...data];
  if (chartData.length > maxItems) {
    const topItems = chartData.slice(0, maxItems - 1);
    const otherItems = chartData.slice(maxItems - 1);
    const otherTotal = otherItems.reduce((sum, item) => sum + item.value, 0);
    chartData = [...topItems, { label: "Other", value: otherTotal }];
  }

  // Calculate pie segments
  const width = size;
  const height = size * 0.7; // Ellipse for 3D effect
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2 - 10;
  const ry = height / 2 - 10;
  const depth = 15; // 3D depth

  let currentAngle = -90;

  const segments = chartData.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    const midAngle = startAngle + angle / 2;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const midRad = (midAngle * Math.PI) / 180;

    // Top face points
    const x1 = cx + rx * Math.cos(startRad);
    const y1 = cy + ry * Math.sin(startRad);
    const x2 = cx + rx * Math.cos(endRad);
    const y2 = cy + ry * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    // Top face path
    const topPath = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${rx} ${ry} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    // Side face (only for segments visible from the front: bottom half)
    let sidePath = "";
    if (startAngle < 90 || endAngle > -90) {
      const sideStart = Math.max(startAngle, -90);
      const sideEnd = Math.min(endAngle, 90);

      if (sideEnd > sideStart && (sideStart >= -90 && sideEnd <= 90)) {
        const sideStartRad = (sideStart * Math.PI) / 180;
        const sideEndRad = (sideEnd * Math.PI) / 180;

        const sx1 = cx + rx * Math.cos(sideStartRad);
        const sy1 = cy + ry * Math.sin(sideStartRad);
        const sx2 = cx + rx * Math.cos(sideEndRad);
        const sy2 = cy + ry * Math.sin(sideEndRad);

        const sideLargeArc = (sideEnd - sideStart) > 180 ? 1 : 0;

        sidePath = [
          `M ${sx1} ${sy1}`,
          `A ${rx} ${ry} 0 ${sideLargeArc} 1 ${sx2} ${sy2}`,
          `L ${sx2} ${sy2 + depth}`,
          `A ${rx} ${ry} 0 ${sideLargeArc} 0 ${sx1} ${sy1 + depth}`,
          "Z",
        ].join(" ");
      }
    }

    // Label position (on the slice)
    const labelRadius = rx * 0.65;
    const labelX = cx + labelRadius * Math.cos(midRad);
    const labelY = cy + (ry * 0.65) * Math.sin(midRad);

    const color = item.color || COLORS[index % COLORS.length];
    // Darker shade for 3D side
    const darkerColor = darkenColor(color, 30);

    return {
      ...item,
      color,
      darkerColor,
      percentage,
      topPath,
      sidePath,
      labelX,
      labelY,
      showLabel: percentage >= 5, // Only show label if >= 5%
    };
  });

  return (
    <div className="flex items-center gap-4">
      {/* Pie Chart */}
      <div className="flex-shrink-0">
        <svg width={width} height={height + depth + 10} viewBox={`0 0 ${width} ${height + depth + 10}`}>
          {/* Draw 3D sides first (back to front for proper overlap) */}
          {segments
            .filter((s) => s.sidePath)
            .map((segment, index) => (
              <path
                key={`side-${index}`}
                d={segment.sidePath}
                fill={segment.darkerColor}
              />
            ))}

          {/* Draw top faces */}
          {segments.map((segment, index) => (
            <path
              key={`top-${index}`}
              d={segment.topPath}
              fill={segment.color}
              stroke="#fff"
              strokeWidth={1}
            />
          ))}

          {/* Labels on slices */}
          {segments.map((segment, index) =>
            segment.showLabel ? (
              <text
                key={`label-${index}`}
                x={segment.labelX}
                y={segment.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-semibold fill-white"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
              >
                {Math.round(segment.percentage)}%
              </text>
            ) : null
          )}
        </svg>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex-1 min-w-0">
          <div className="space-y-1.5">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 flex-shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-gray-700 truncate">{segment.label}</span>
                <span className="text-gray-400 ml-auto">{segment.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to darken a hex color
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * (percent / 100)));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * (percent / 100)));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * (percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
