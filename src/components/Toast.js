import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, Dimensions } from "react-native";
import { colors } from "../theme/colors";

const { width } = Dimensions.get("window");

const Toast = ({
	visible,
	message,
	type = "error",
	duration = 3000,
	onHide,
}) => {
	const slideAnim = useRef(new Animated.Value(-100)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (visible) {
			// Slide in and fade in
			Animated.parallel([
				Animated.spring(slideAnim, {
					toValue: 60,
					tension: 80,
					friction: 8,
					useNativeDriver: true,
				}),
				Animated.timing(opacityAnim, {
					toValue: 1,
					duration: 200,
					useNativeDriver: true,
				}),
			]).start();

			// Auto-hide after duration
			const timer = setTimeout(() => {
				hideToast();
			}, duration);

			return () => clearTimeout(timer);
		} else {
			hideToast();
		}
	}, [visible]);

	const hideToast = () => {
		Animated.parallel([
			Animated.timing(slideAnim, {
				toValue: -100,
				duration: 200,
				useNativeDriver: true,
			}),
			Animated.timing(opacityAnim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}),
		]).start(() => {
			if (onHide) onHide();
		});
	};

	if (!visible && slideAnim._value <= 0) return null;

	const getTypeStyles = () => {
		switch (type) {
			case "error":
				return {
					backgroundColor: "rgba(255, 59, 48, 0.95)",
					icon: "⚠️",
				};
			case "success":
				return {
					backgroundColor: "rgba(52, 199, 89, 0.95)",
					icon: "✓",
				};
			case "info":
				return {
					backgroundColor: "rgba(41, 242, 255, 0.95)",
					icon: "ℹ️",
				};
			default:
				return {
					backgroundColor: "rgba(255, 204, 0, 0.95)",
					icon: "⚡",
				};
		}
	};

	const typeStyle = getTypeStyles();

	return (
		<Animated.View
			style={[
				styles.container,
				{
					backgroundColor: typeStyle.backgroundColor,
					transform: [{ translateY: slideAnim }],
					opacity: opacityAnim,
				},
			]}
		>
			<Text style={styles.icon}>{typeStyle.icon}</Text>
			<Text style={styles.message} numberOfLines={2}>
				{message}
			</Text>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		left: 20,
		right: 20,
		maxWidth: width - 40,
		borderRadius: 12,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		zIndex: 9999,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
	},
	icon: {
		fontSize: 20,
		marginRight: 12,
	},
	message: {
		flex: 1,
		color: "#FFFFFF",
		fontSize: 15,
		fontWeight: "600",
		lineHeight: 20,
	},
});

export default Toast;
