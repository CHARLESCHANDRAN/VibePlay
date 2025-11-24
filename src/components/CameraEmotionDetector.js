// CameraEmotionDetector.js
import React, { useEffect, useState, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	Alert,
	ActivityIndicator,
	Animated,
	Image,
} from "react-native";
import {
	Camera,
	useCameraDevice,
	useCameraPermission,
} from "react-native-vision-camera";
import { colors } from "../theme/colors";
import { analyzeEmotionFromImage } from "../ml/emotionModel";

export default function CameraEmotionDetector({ onMoodDetected, isActive }) {
	const { hasPermission, requestPermission } = useCameraPermission();
	const device = useCameraDevice("front");
	const camera = useRef(null);

	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [countdown, setCountdown] = useState(null);
	const [capturedImage, setCapturedImage] = useState(null);
	const [cameraKey, setCameraKey] = useState(0); // Force camera remount
	const isDetecting = useRef(false);
	const countdownAnim = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		checkPermissions();
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			console.log("[CameraDetector] Unmounting - cleaning up");
			isDetecting.current = false;
			setIsAnalyzing(false);
			setCapturedImage(null);
		};
	}, []);

	const checkPermissions = async () => {
		if (!hasPermission) {
			const granted = await requestPermission();
			if (!granted) {
				Alert.alert(
					"Camera Permission Required",
					"VibePlay needs camera access to detect your mood. Please enable camera permission in settings.",
					[{ text: "OK" }]
				);
			}
		}
	};

	const resetCamera = () => {
		console.log("[CameraDetector] Resetting camera");
		setCapturedImage(null);
		isDetecting.current = false;
		setIsAnalyzing(false);
		// Force camera remount by changing key
		setCameraKey((prev) => prev + 1);
	};

	const startCountdown = () => {
		if (isDetecting.current || isAnalyzing) {
			console.log(
				"[CameraDetector] Already processing, ignoring countdown start"
			);
			return;
		}

		setCapturedImage(null); // Clear previous capture
		let count = 3;
		setCountdown(count);

		const interval = setInterval(() => {
			// Animate countdown number
			Animated.sequence([
				Animated.timing(countdownAnim, {
					toValue: 1.5,
					duration: 150,
					useNativeDriver: true,
				}),
				Animated.timing(countdownAnim, {
					toValue: 1,
					duration: 150,
					useNativeDriver: true,
				}),
			]).start();

			count -= 1;
			if (count === 0) {
				clearInterval(interval);
				setCountdown(null);
				captureAndAnalyze();
			} else {
				setCountdown(count);
			}
		}, 1000);
	};

	const captureAndAnalyze = async () => {
		if (!camera.current || isDetecting.current || !isActive) {
			console.log(
				"[CameraDetector] Cannot capture - not ready. camera:",
				!!camera.current,
				"isDetecting:",
				isDetecting.current,
				"isActive:",
				isActive
			);
			return;
		}

		let timeoutId;
		try {
			isDetecting.current = true;
			setIsAnalyzing(true);

			console.log("[CameraDetector] Attempting to take photo...");

			// Create a promise that will reject after 8 seconds
			const photoPromise = camera.current.takePhoto({
				qualityPrioritization: "speed",
				flash: "off",
			});

			const timeoutPromise = new Promise((_, reject) => {
				timeoutId = setTimeout(() => {
					reject(new Error("Camera timeout - please use manual selection"));
				}, 8000);
			});

			const photo = await Promise.race([photoPromise, timeoutPromise]);
			clearTimeout(timeoutId);

			console.log("[CameraDetector] Photo captured successfully");
			console.log("[CameraDetector] Photo object:", photo);

			const filePath = photo.path || photo.uri;

			if (!filePath) {
				console.error(
					"[CameraDetector] No path found in photo:",
					JSON.stringify(photo)
				);
				throw new Error("Photo path is empty");
			}

			console.log("[CameraDetector] Using photo path:", filePath);

			// Show captured image
			const imageUri = filePath.startsWith("file://")
				? filePath
				: `file://${filePath}`;
			console.log("[CameraDetector] Setting captured image:", imageUri);
			setCapturedImage(imageUri);

			console.log("[CameraDetector] Starting analysis...");
			// Analyze emotion
			const result = await analyzeEmotionFromImage(filePath);
			console.log("[CameraDetector] Analysis complete:", result);

			if (result.error) {
				Alert.alert(
					"Detection Issue",
					"Could not analyze mood accurately. Please select manually from the grid below.",
					[{ text: "OK" }]
				);
			}

			if (onMoodDetected) {
				onMoodDetected(result.mood, result.confidence);
			}
		} catch (err) {
			if (timeoutId) clearTimeout(timeoutId);

			console.error("[CameraDetector] Full error:", err);
			console.error("[CameraDetector] Error name:", err.name);
			console.error("[CameraDetector] Error message:", err.message);

			// Show simpler error message
			Alert.alert(
				"Camera Not Available",
				"Photo capture isn't working on this device.\n\n👉 Please select your mood from the emoji grid below instead.",
				[
					{
						text: "Got it",
						onPress: () => {
							setCapturedImage(null);
							isDetecting.current = false;
							setIsAnalyzing(false);
						},
					},
				]
			);
		} finally {
			console.log("[CameraDetector] Cleaning up");
			setIsAnalyzing(false);
			isDetecting.current = false;
		}
	};

	if (!hasPermission) {
		return (
			<View style={styles.permissionContainer}>
				<Text style={styles.permissionText}>📷</Text>
				<Text style={styles.permissionTitle}>Camera Access Needed</Text>
				<Text style={styles.permissionMessage}>
					Allow camera access to detect your mood
				</Text>
				<Pressable style={styles.permissionButton} onPress={requestPermission}>
					<Text style={styles.permissionButtonText}>Grant Permission</Text>
				</Pressable>
			</View>
		);
	}

	if (!device) {
		return (
			<View style={styles.permissionContainer}>
				<Text style={styles.permissionText}>⚠️</Text>
				<Text style={styles.permissionTitle}>No Camera Found</Text>
				<Text style={styles.permissionMessage}>
					Your device's front camera couldn't be accessed
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.outerContainer}>
			{/* Camera/Image Preview Area */}
			<View style={styles.previewContainer}>
				{capturedImage ? (
					// Show captured image while analyzing
					<Image
						source={{ uri: capturedImage }}
						style={styles.capturedImage}
						resizeMode="cover"
					/>
				) : (
					// Show live camera preview
					<Camera
						key={cameraKey} // Force remount on key change
						ref={camera}
						style={styles.camera}
						device={device}
						isActive={isActive && !isAnalyzing}
						photo={true}
						video={false}
					/>
				)}

				{/* Overlay with frame corners */}
				<View style={styles.overlay}>
					<View style={styles.faceFrame}>
						<View style={[styles.corner, styles.topLeft]} />
						<View style={[styles.corner, styles.topRight]} />
						<View style={[styles.corner, styles.bottomLeft]} />
						<View style={[styles.corner, styles.bottomRight]} />
					</View>

					{/* Countdown Display */}
					{countdown !== null && (
						<Animated.View
							style={[
								styles.countdownContainer,
								{ transform: [{ scale: countdownAnim }] },
							]}
						>
							<Text style={styles.countdownText}>{countdown}</Text>
						</Animated.View>
					)}

					{/* Analyzing Status */}
					{isAnalyzing && (
						<View style={styles.statusBadge}>
							<ActivityIndicator size="small" color={colors.neon} />
							<Text style={styles.statusText}>Analyzing...</Text>
						</View>
					)}
				</View>
			</View>

			{/* Capture Button Below */}
			<Pressable
				style={[
					styles.captureButton,
					(countdown !== null || isAnalyzing) && styles.captureButtonDisabled,
				]}
				onPress={startCountdown}
				disabled={countdown !== null || isAnalyzing}
			>
				<View style={styles.captureButtonInner}>
					<Text style={styles.captureButtonText}>
						{isAnalyzing ? "Analyzing Mood..." : "Capture Mood"}
					</Text>
				</View>
			</Pressable>

			{/* Retake Button - Show if image is captured */}
			{capturedImage && !isAnalyzing && (
				<Pressable style={styles.retakeButton} onPress={resetCamera}>
					<Text style={styles.retakeButtonText}>↻ Retake Photo</Text>
				</Pressable>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	outerContainer: {
		alignItems: "center",
		gap: 20,
	},
	previewContainer: {
		width: 280,
		height: 280,
		borderRadius: 20,
		overflow: "hidden",
		position: "relative",
		borderWidth: 3,
		borderColor: colors.neon,
		shadowColor: colors.neon,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.5,
		shadowRadius: 24,
		backgroundColor: colors.surface,
	},
	camera: {
		width: "100%",
		height: "100%",
	},
	capturedImage: {
		width: "100%",
		height: "100%",
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		alignItems: "center",
		justifyContent: "center",
	},
	faceFrame: {
		width: 200,
		height: 200,
		position: "relative",
	},
	corner: {
		position: "absolute",
		width: 32,
		height: 32,
		borderColor: colors.neon,
		borderWidth: 3,
	},
	topLeft: {
		top: 0,
		left: 0,
		borderRightWidth: 0,
		borderBottomWidth: 0,
		borderTopLeftRadius: 8,
	},
	topRight: {
		top: 0,
		right: 0,
		borderLeftWidth: 0,
		borderBottomWidth: 0,
		borderTopRightRadius: 8,
	},
	bottomLeft: {
		bottom: 0,
		left: 0,
		borderRightWidth: 0,
		borderTopWidth: 0,
		borderBottomLeftRadius: 8,
	},
	bottomRight: {
		bottom: 0,
		right: 0,
		borderLeftWidth: 0,
		borderTopWidth: 0,
		borderBottomRightRadius: 8,
	},
	countdownContainer: {
		position: "absolute",
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "rgba(192, 255, 0, 0.95)",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 4,
		borderColor: colors.bg,
	},
	countdownText: {
		color: colors.bg,
		fontSize: 72,
		fontWeight: "900",
		textShadowColor: "rgba(0, 0, 0, 0.3)",
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 4,
	},
	statusBadge: {
		position: "absolute",
		top: 16,
		backgroundColor: "rgba(11, 15, 20, 0.9)",
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: colors.neon,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	statusText: {
		color: colors.text,
		fontSize: 14,
		fontWeight: "700",
	},
	captureButton: {
		backgroundColor: colors.neon,
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 30,
		shadowColor: colors.neon,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.4,
		shadowRadius: 12,
		minWidth: 200,
		alignItems: "center",
	},
	captureButtonDisabled: {
		backgroundColor: colors.surface,
		shadowOpacity: 0.1,
	},
	captureButtonInner: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	captureButtonText: {
		color: colors.bg,
		fontSize: 16,
		fontWeight: "800",
		letterSpacing: 0.5,
	},
	retakeButton: {
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 24,
		borderWidth: 1,
		borderColor: colors.textDim,
		minWidth: 160,
		alignItems: "center",
	},
	retakeButtonText: {
		color: colors.text,
		fontSize: 14,
		fontWeight: "700",
		letterSpacing: 0.5,
	},
	permissionContainer: {
		width: 280,
		height: 280,
		borderRadius: 20,
		backgroundColor: colors.surface,
		alignItems: "center",
		justifyContent: "center",
		padding: 24,
		borderWidth: 2,
		borderColor: colors.neon,
	},
	permissionText: {
		fontSize: 64,
		marginBottom: 16,
	},
	permissionTitle: {
		color: colors.text,
		fontSize: 18,
		fontWeight: "700",
		marginBottom: 12,
		textAlign: "center",
	},
	permissionMessage: {
		color: colors.textDim,
		fontSize: 14,
		textAlign: "center",
		marginBottom: 20,
		lineHeight: 20,
	},
	permissionButton: {
		backgroundColor: colors.neon,
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 12,
	},
	permissionButtonText: {
		color: colors.bg,
		fontSize: 16,
		fontWeight: "700",
	},
});
