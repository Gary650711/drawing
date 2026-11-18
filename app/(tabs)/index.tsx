import { Fragment, useRef, useState } from "react";
import {
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
  type NativeTouchEvent,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const TOUCH_COLORS = [
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#34C759",
  "#00C7BE",
  "#32ADE6",
  "#007AFF",
  "#5856D6",
  "#AF52DE",
  "#FF2D55",
] as const;

// The smallest stable logical-pixel stroke that remains visible on Android and Web.
const MINIMUM_MARK_SIZE = 2;
const MINIMUM_MOVE_DISTANCE = 0.25;

type Point = {
  x: number;
  y: number;
};

type Stroke = {
  id: string;
  color: (typeof TOUCH_COLORS)[number];
  points: Point[];
};

type TouchPoint = {
  identifier: number;
  locationX?: number;
  locationY?: number;
  pageX?: number;
  pageY?: number;
};

type ActiveTouch = {
  strokeId: string;
  color: (typeof TOUCH_COLORS)[number];
};

function asTouches(value: unknown) {
  return value as TouchPoint[];
}

function readPoint(touch: TouchPoint): Point {
  return {
    x: touch.locationX ?? touch.pageX ?? 0,
    y: touch.locationY ?? touch.pageY ?? 0,
  };
}

function pathFor(points: Point[]) {
  if (points.length === 0) return "";
  return points.reduce(
    (path, point, index) => `${path}${index === 0 ? "M" : "L"}${point.x} ${point.y} `,
    "",
  );
}

function nextTouchColor(activeTouches: Map<number, ActiveTouch>) {
  const usedColors = new Set([...activeTouches.values()].map((touch) => touch.color));
  return TOUCH_COLORS.find((color) => !usedColors.has(color)) ?? TOUCH_COLORS[0];
}

export default function HomeScreen() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const activeTouches = useRef(new Map<number, ActiveTouch>());
  const nextStrokeId = useRef(0);

  const startTouches = (event: NativeSyntheticEvent<NativeTouchEvent>) => {
    const changedTouches = asTouches(event.nativeEvent.changedTouches);
    if (changedTouches.length === 0) return;

    setStrokes((currentStrokes) => {
      const nextStrokes = [...currentStrokes];
      changedTouches.forEach((touch) => {
        if (activeTouches.current.has(touch.identifier)) return;
        const color = nextTouchColor(activeTouches.current);
        const strokeId = `stroke-${nextStrokeId.current++}`;
        activeTouches.current.set(touch.identifier, { strokeId, color });
        nextStrokes.push({
          id: strokeId,
          color,
          points: [readPoint(touch)],
        });
      });
      return nextStrokes;
    });
  };

  const moveTouches = (event: NativeSyntheticEvent<NativeTouchEvent>) => {
    const touches = asTouches(event.nativeEvent.touches);
    if (touches.length === 0 || activeTouches.current.size === 0) return;

    const touchByIdentifier = new Map(
      touches.map((touch) => [touch.identifier, touch] as const),
    );
    const pointByStrokeId = new Map<string, Point>();
    activeTouches.current.forEach((activeTouch, identifier) => {
      const touch = touchByIdentifier.get(identifier);
      if (touch) pointByStrokeId.set(activeTouch.strokeId, readPoint(touch));
    });
    if (pointByStrokeId.size === 0) return;

    setStrokes((currentStrokes) => {
      let didMove = false;
      const nextStrokes = currentStrokes.map((stroke) => {
        const nextPoint = pointByStrokeId.get(stroke.id);
        const lastPoint = stroke.points[stroke.points.length - 1];
        if (
          !nextPoint ||
          (lastPoint &&
            Math.abs(lastPoint.x - nextPoint.x) < MINIMUM_MOVE_DISTANCE &&
            Math.abs(lastPoint.y - nextPoint.y) < MINIMUM_MOVE_DISTANCE)
        ) {
          return stroke;
        }
        didMove = true;
        return { ...stroke, points: [...stroke.points, nextPoint] };
      });
      return didMove ? nextStrokes : currentStrokes;
    });
  };

  const endTouches = (event: NativeSyntheticEvent<NativeTouchEvent>) => {
    const changedTouches = asTouches(event.nativeEvent.changedTouches);
    changedTouches.forEach((touch) => activeTouches.current.delete(touch.identifier));
  };

  const clearCanvas = () => {
    activeTouches.current.clear();
    setStrokes([]);
  };

  const exitApp = () => {
    if (Platform.OS === "android") {
      BackHandler.exitApp();
      return;
    }
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.close();
    }
  };

  return (
    <View style={styles.screen}>
      <View
        style={styles.canvas}
        collapsable={false}
        onTouchStart={startTouches}
        onTouchMove={moveTouches}
        onTouchEnd={endTouches}
        onTouchCancel={endTouches}
      >
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
          {strokes.map((stroke) => {
            const firstPoint = stroke.points[0];
            return (
              <Fragment key={stroke.id}>
                <Path
                  d={pathFor(stroke.points)}
                  fill="none"
                  stroke={stroke.color}
                  strokeWidth={MINIMUM_MARK_SIZE}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {firstPoint ? (
                  <Circle
                    cx={firstPoint.x}
                    cy={firstPoint.y}
                    r={MINIMUM_MARK_SIZE}
                    fill={stroke.color}
                  />
                ) : null}
              </Fragment>
            );
          })}
        </Svg>
      </View>

      <Pressable
        accessibilityLabel="清除所有畫線與點擊軌跡"
        accessibilityRole="button"
        onPress={clearCanvas}
        style={({ pressed }) => [styles.sideButton, styles.clearButton, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>清除</Text>
      </Pressable>

      <Pressable
        accessibilityLabel="離開 drawing"
        accessibilityRole="button"
        onPress={exitApp}
        style={({ pressed }) => [styles.sideButton, styles.exitButton, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>離開</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#05070A",
  },
  canvas: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#05070A",
  },
  sideButton: {
    position: "absolute",
    top: "50%",
    width: 58,
    height: 48,
    marginTop: -24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  clearButton: {
    left: 12,
    backgroundColor: "#202832",
    borderColor: "#536273",
  },
  exitButton: {
    right: 12,
    backgroundColor: "#8F2631",
    borderColor: "#E15B66",
  },
  pressed: {
    opacity: 0.62,
    transform: [{ scale: 0.96 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
