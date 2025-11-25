// src/components/CameraCapture.js
import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import { colors } from "../theme/colors";

/**
 * Camera component with countdown - only mounts when needed
 * Shows 3-2-1 countdown before capturing
 */
export default function CameraCapture({ onCapture, onCancel }) {
	const [countdown, setCountdown] = useState(null);
	const [isCapturing, setIsCapturing] = useState(false);
	const camera = useRef(null);
	const countdownOpacity = useRef(new Animated.Value(0)).current;

	const device = useCameraDevice("front");

	const startCountdown = async () => {
		if (isCapturing) return;
		setIsCapturing(true);

		// Show countdown: 3, 2, 1
		for (let i = 3; i > 0; i--) {
			setCountdown(i);

			// Animate in
			Animated.sequence([
				Animated.timing(countdownOpacity, {
					toValue: 1,
					duration: 100,
					useNativeDriver: true,
				}),
				Animated.timing(countdownOpacity, {
					toValue: 0,
					duration: 800,
					useNativeDriver: true,
				}),
			]).start();

			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		// Capture the photo
		await capturePhoto();
	};

	const capturePhoto = async () => {
		try {
			if (!camera.current) {
				throw new Error("Camera not ready");
			}

			console.log("[CameraCapture] Taking photo...");

			const photo = await camera.current.takePhoto({
				qualityPrioritization: "balanced",
				flash: "off",
			});

			console.log("[CameraCapture] Photo captured:", photo.path);

			// Read photo and compress it
			const RNFS = require("react-native-fs");
			const ImageResizer =
				require("@bam.tech/react-native-image-resizer").default;

			// Resize to max 800px width/height and compress to 70% quality
			const resizedImage = await ImageResizer.createResizedImage(
				photo.path,
				800, // maxWidth
				800, // maxHeight
				"JPEG",
				70, // quality (0-100)
				0 // rotation
			);

			console.log(
				"[CameraCapture] Image resized from",
				photo.path,
				"to",
				resizedImage.uri
			);

			// Read resized image as base64
			const base64 = await RNFS.readFile(resizedImage.uri, "base64");
			const imageBase64 = `data:image/jpeg;base64,${base64}`;

			console.log(
				"[CameraCapture] Base64 size:",
				(base64.length / 1024).toFixed(2),
				"KB"
			);

			// Clean up and return
			setCountdown(null);
			onCapture(imageBase64);
		} catch (error) {
			console.error("[CameraCapture] Error capturing photo:", error);
			setCountdown(null);
			setIsCapturing(false);
			alert("Failed to capture photo. Please try again.");
		}
	};

	if (!device) {
		return (
			<View style={styles.container}>
				<Text style={styles.errorText}>No camera device found</Text>
				<Pressable style={styles.cancelButton} onPress={onCancel}>
					<Text style={styles.cancelButtonText}>Go Back</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Camera
				ref={camera}
				style={styles.camera}
				device={device}
				isActive={true}
				photo={true}
			/>

			{/* Countdown Overlay */}
			{countdown && (
				<View style={styles.countdownOverlay}>
					<Animated.Text
						style={[styles.countdownText, { opacity: countdownOpacity }]}
					>
						{countdown}
					</Animated.Text>
				</View>
			)}

			{/* Controls */}
			<View style={styles.controls}>
				<Pressable
					style={styles.cancelButton}
					onPress={onCancel}
					disabled={isCapturing}
				>
					<Text style={styles.cancelButtonText}>Cancel</Text>
				</Pressable>

				<Pressable
					style={[
						styles.captureButton,
						isCapturing && styles.captureButtonDisabled,
					]}
					onPress={startCountdown}
					disabled={isCapturing}
				>
					<Text style={styles.captureButtonText}>
						{isCapturing ? "Capturing..." : "Start Countdown"}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bg,
	},
	camera: {
		flex: 1,
	},
	errorText: {
		color: colors.neon,
		fontSize: 16,
		textAlign: "center",
		marginTop: 100,
	},
	countdownOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.7)",
	},
	countdownText: {
		fontSize: 120,
		fontWeight: "bold",
		color: colors.neon,
	},
	controls: {
		position: "absolute",
		bottom: 40,
		left: 0,
		right: 0,
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	cancelButton: {
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.neon,
	},
	cancelButtonText: {
		color: colors.neon,
		fontSize: 16,
		fontWeight: "600",
	},
	captureButton: {
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 12,
		backgroundColor: colors.neon,
	},
	captureButtonDisabled: {
		backgroundColor: colors.purple,
		opacity: 0.5,
	},
	captureButtonText: {
		color: colors.bg,
		fontSize: 18,
		fontWeight: "bold",
	},
});
