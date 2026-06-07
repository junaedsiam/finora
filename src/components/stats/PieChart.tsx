import { View, Text } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { formatCurrency } from "@/utils/currency";

export type PieSlice = {
  value: number;
  color: string;
};

type PieChartProps = {
  slices: PieSlice[];
  total: number;
  currency?: string;
  size?: number;
  innerRadiusRatio?: number;
};

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

function describeDonutSlice(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  // If it's a full circle, we need a slightly smaller angle to avoid SVG arc rendering issues
  const isFullCircle = endAngle - startAngle >= 360;
  const effectiveEndAngle = isFullCircle ? endAngle - 0.01 : endAngle;

  const outerStart = polarToCartesian(cx, cy, outerR, effectiveEndAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, effectiveEndAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);

  const largeArcFlag = effectiveEndAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", outerStart.x, outerStart.y,
    "A", outerR, outerR, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
    "L", innerEnd.x, innerEnd.y,
    "A", innerR, innerR, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
    "Z",
  ].join(" ");
}

export function PieChart({
  slices,
  total,
  currency = "USD",
  size = 260,
  innerRadiusRatio = 0.65,
}: PieChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * innerRadiusRatio;

  if (slices.length === 0 || total === 0) {
    return (
      <View className="items-center justify-center" style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Path
            d={describeDonutSlice(cx, cy, outerR, innerR, 0, 360)}
            fill="#E6E6EB"
          />
        </Svg>
        <View className="absolute items-center justify-center">
          <Text className="text-sm text-muted">No data</Text>
        </View>
      </View>
    );
  }

  let currentAngle = 0;
  const elements: React.ReactElement[] = [];

  slices.forEach((slice, index) => {
    const sliceAngle = (slice.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    // Skip tiny slices to avoid rendering glitches
    if (sliceAngle > 0.5) {
      elements.push(
        <Path
          key={index}
          d={describeDonutSlice(cx, cy, outerR, innerR, startAngle, endAngle)}
          fill={slice.color}
        />,
      );
    }

    currentAngle = endAngle;
  });

  return (
    <View className="items-center justify-center self-center">
      <Svg width={size} height={size}>
        <G>{elements}</G>
      </Svg>
      <View className="absolute items-center justify-center">
        <Text
          className="text-xs text-muted mb-0.5"
          style={{ fontFamily: "Inter_400Regular" }}
        >
          Total
        </Text>
        <Text
          className="text-xl text-foreground"
          style={{ fontFamily: "Inter_700Bold" }}
        >
          {formatCurrency(total, { currency, abbreviate: true })}
        </Text>
      </View>
    </View>
  );
}
