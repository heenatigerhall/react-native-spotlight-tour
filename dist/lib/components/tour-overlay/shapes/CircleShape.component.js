import { useFloating } from "@floating-ui/react-native";
import { deepEqual } from "fast-equals";
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { Animated } from "react-native";
import { Circle } from "react-native-svg";
import { SpotlightTourContext } from "../../../SpotlightTour.context";
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
export const CircleShape = memo(({ motion, padding, useNativeDriver, tourStep }) => {
    const { current, floatingProps, spot, steps, next, previous, goTo, stop } = useContext(SpotlightTourContext);
    const center = useRef(new Animated.ValueXY({ x: 0, y: 0 }, { useNativeDriver }));
    const opacity = useRef(new Animated.Value(0, { useNativeDriver }));
    const radius = useRef(new Animated.Value(0, { useNativeDriver }));
    const isFirstStep = useMemo(() => {
        return current === 0;
    }, [current]);
    const isLastStep = useMemo(() => {
        return current === steps.length - 1;
    }, [current, steps]);
    const { refs, floatingStyles } = useFloating(floatingProps);
    useEffect(() => {
        const { height, width, x, y } = spot;
        const r = Math.max(width, height) / 2 + padding;
        const cx = x + width / 2;
        const cy = y + height / 2;
        refs.setReference({
            measure: (callback) => callback(cx - r, cy - r, r * 2, r * 2),
        });
        const transition = () => {
            switch (motion) {
                case "bounce":
                    opacity.current.setValue(1);
                    return Animated.parallel([
                        Animated.spring(center.current, {
                            damping: 45,
                            mass: 4,
                            stiffness: 350,
                            toValue: { x: cx, y: cy },
                            useNativeDriver,
                        }),
                        Animated.spring(radius.current, {
                            damping: 35,
                            mass: 4,
                            stiffness: 350,
                            toValue: r,
                            useNativeDriver,
                        }),
                    ]);
                case "fade":
                    return Animated.sequence([
                        Animated.timing(opacity.current, {
                            duration: 400,
                            toValue: 0,
                            useNativeDriver,
                        }),
                        Animated.parallel([
                            Animated.timing(center.current, {
                                duration: 0,
                                toValue: { x: cx, y: cy },
                                useNativeDriver,
                            }),
                            Animated.timing(radius.current, {
                                duration: 0,
                                toValue: r,
                                useNativeDriver,
                            }),
                        ]),
                        Animated.timing(opacity.current, {
                            duration: 400,
                            toValue: 1,
                            useNativeDriver,
                        }),
                    ]);
                case "slide":
                    opacity.current.setValue(1);
                    return Animated.parallel([
                        Animated.timing(center.current, {
                            duration: 400,
                            toValue: { x: cx, y: cy },
                            useNativeDriver,
                        }),
                        Animated.timing(radius.current, {
                            duration: 400,
                            toValue: r,
                            useNativeDriver,
                        }),
                    ]);
            }
        };
        transition().start();
    }, [spot, padding, motion, useNativeDriver]);
    const measureAnimatedCircle = useCallback(() => {
        refs.setReference({
            measure: (callback) => callback(spot.x, spot.y, spot.width, spot.height),
        });
    }, [spot]);
    if ([spot.height, spot.width].every(value => value <= 0)) {
        return null;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(AnimatedCircle, { ref: measureAnimatedCircle, r: radius.current, cx: center.current.x, cy: center.current.y, opacity: opacity.current, fill: "black" }),
        React.createElement(Animated.View, { ref: refs.setFloating, testID: "Tooltip View", style: floatingStyles }, current !== undefined && (React.createElement(React.Fragment, null,
            React.createElement(tourStep.render, { current: current, isFirst: isFirstStep, isLast: isLastStep, next: next, previous: previous, stop: stop, goTo: goTo }))))));
}, deepEqual);
//# sourceMappingURL=CircleShape.component.js.map