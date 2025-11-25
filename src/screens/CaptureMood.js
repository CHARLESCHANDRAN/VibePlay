import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	SafeAreaView,
	Pressable,
	ScrollView,
	Animated,
	ActivityIndicator,
	Modal,
	Alert,
} from "react-native";
import { styles } from "../theme/styles";
import { colors } from "../theme/colors";
import NeonButton from "../components/NeonButton";
import CameraCapture from "../components/CameraCapture";
import { detectEmotionFromImage } from "../services/visionApi";
import { useStore } from "../state/store";
import { Camera } from "react-native-vision-camera";

// Mood emoji mapping with colors
const MOOD_DATA = {
	happy: {
		emoji: "😄",
		label: "Happy",
		color: colors.lime,
		bg: "rgba(192, 255, 0, 0.15)",
	},
	sad: {
		emoji: "😔",
		label: "Sad",
		color: "#4A9FFF",
		bg: "rgba(74, 159, 255, 0.15)",
	},
	angry: {
		emoji: "😤",
		label: "Angry",
		color: "#FF4757",
		bg: "rgba(255, 71, 87, 0.15)",
	},
	surprised: {
		emoji: "😮",
		label: "Surprised",
		color: colors.amber,
		bg: "rgba(255, 184, 0, 0.15)",
	},
	neutral: {
		emoji: "😐",
		label: "Neutral",
		color: "#8E8E93",
		bg: "rgba(142, 142, 147, 0.15)",
	},
	tired: {
		emoji: "🥱",
		label: "Tired",
		color: colors.purple,
		bg: "rgba(156, 91, 255, 0.15)",
	},
	anxious: {
		emoji: "😰",
		label: "Anxious",
		color: "#FF9500",
		bg: "rgba(255, 149, 0, 0.15)",
	},
	calm: {
		emoji: "😌",
		label: "Calm",
		color: "#5AC8FA",
		bg: "rgba(90, 200, 250, 0.15)",
	},
	excited: {
		emoji: "🤩",
		label: "Excited",
		color: "#FF2D55",
		bg: "rgba(255, 45, 85, 0.15)",
	},
};

export default function CaptureMood({ navigation }) {
	const { mood, setMood, energy, setEnergy, valence, setValence } = useStore();
	const [selectedMood, setSelectedMood] = useState(mood || null);
	const [showCamera, setShowCamera] = useState(false);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [detectedEmotion, setDetectedEmotion] = useState(null);
	const [cameraPermission, setCameraPermission] = useState(null);

	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.95)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 800,
				useNativeDriver: true,
			}),
			Animated.spring(scaleAnim, {
				toValue: 1,
				tension: 50,
				friction: 7,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	const moods = [
		"happy",
		"sad",
		"angry",
		"surprised",
		"neutral",
		"tired",
		"anxious",
		"calm",
		"excited",
	];

	const handleMoodSelect = (moodKey) => {
		setSelectedMood(moodKey);
		setDetectedEmotion(null); // Clear any auto-detected emotion
	};

	const handleCapturePress = async () => {
		// Check camera permission
		const permission = await Camera.getCameraPermissionStatus();

		if (permission === "denied") {
			Alert.alert(
				"Camera Permission",
				"We need camera access to detect your mood. Please grant permission in settings.",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Open Settings",
						onPress: () => Camera.requestCameraPermission(),
					},
				]
			);
			return;
		}

		if (permission === "not-determined") {
			const newPermission = await Camera.requestCameraPermission();
			if (newPermission === "denied") {
				return;
			}
		}

		setShowCamera(true);
	};

	const handleCameraCapture = async (imageBase64) => {
		setShowCamera(false);
		setIsAnalyzing(true);

		try {
			console.log("[CaptureMood] Analyzing captured image...");
			const result = await detectEmotionFromImage(imageBase64);

			console.log("[CaptureMood] Detection result:", result);

			setDetectedEmotion(result);
			setSelectedMood(result.emotion);
		} catch (error) {
			console.error("[CaptureMood] Error analyzing emotion:", error);

			if (error.message === "NO_FACE_DETECTED") {
				Alert.alert(
					"No Face Detected",
					"We couldn't detect a face in the image. Would you like to try again?",
					[
						{ text: "Select Manually", style: "cancel" },
						{ text: "Try Again", onPress: () => setShowCamera(true) },
					]
				);
			} else {
				Alert.alert(
					"Detection Failed",
					"Something went wrong while reading your vibe. Would you like to try again?",
					[
						{
							text: "I'll Choose Myself",
							style: "cancel",
							onPress: () => setDetectedEmotion(null),
						},
						{ text: "Try Again", onPress: () => setShowCamera(true) },
					]
				);
			}
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleCameraCancel = () => {
		setShowCamera(false);
	};

	const handleContinue = () => {
		if (selectedMood) {
			setMood(selectedMood);
			navigation.navigate("Intent");
		}
	};

	const currentMoodData = selectedMood
		? MOOD_DATA[selectedMood]
		: MOOD_DATA.neutral;

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
				<Animated.View
					style={{
						opacity: fadeAnim,
						transform: [{ scale: scaleAnim }],
					}}
				>
					{/* Header */}
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
							paddingHorizontal: 20,
							paddingTop: 16,
							paddingBottom: 12,
						}}
					>
						<Pressable onPress={() => navigation.goBack()}>
							<Text
								style={{ color: colors.text, fontSize: 28, fontWeight: "300" }}
							>
								✕
							</Text>
						</Pressable>
						<Text
							style={{
								color: colors.neon,
								fontSize: 18,
								fontWeight: "700",
								letterSpacing: 1,
							}}
						>
							CAPTURE MOOD
						</Text>
						<View style={{ width: 28 }} />
					</View>

					{/* Hero Section */}
					<View
						style={{
							alignItems: "center",
							paddingVertical: 40,
							paddingHorizontal: 20,
						}}
					>
						<Text
							style={{
								color: colors.textDim,
								fontSize: 14,
								fontWeight: "600",
								letterSpacing: 2,
								textTransform: "uppercase",
								marginBottom: 24,
							}}
						>
							How are you feeling?
						</Text>

						{/* Detected Emotion Display */}
						{detectedEmotion && (
							<View style={{ alignItems: "center", marginBottom: 32 }}>
								<View
									style={{
										width: 140,
										height: 140,
										borderRadius: 70,
										backgroundColor: currentMoodData.bg,
										borderWidth: 4,
										borderColor: currentMoodData.color,
										alignItems: "center",
										justifyContent: "center",
										shadowColor: currentMoodData.color,
										shadowOffset: { width: 0, height: 8 },
										shadowOpacity: 0.6,
										shadowRadius: 20,
										marginBottom: 16,
									}}
								>
									<Text style={{ fontSize: 72 }}>{currentMoodData.emoji}</Text>
								</View>
								<Text
									style={{
										color: colors.text,
										fontSize: 22,
										fontWeight: "700",
										marginBottom: 4,
									}}
								>
									We think you're feeling:
								</Text>
								<Text
									style={{
										color: currentMoodData.color,
										fontSize: 28,
										fontWeight: "bold",
									}}
								>
									{currentMoodData.label} {detectedEmotion.emoji}
								</Text>
								<Text
									style={{
										color: colors.textDim,
										fontSize: 14,
										marginTop: 8,
									}}
								>
									Confidence: {Math.round(detectedEmotion.confidence * 100)}%
								</Text>
								<Text
									style={{
										color: colors.textDim,
										fontSize: 12,
										marginTop: 16,
										textAlign: "center",
									}}
								>
									Not quite right? Select a different mood below
								</Text>
							</View>
						)}

						{/* Current Mood Display (manual selection) */}
						{!detectedEmotion && selectedMood && (
							<View style={{ alignItems: "center", marginBottom: 32 }}>
								<View
									style={{
										width: 140,
										height: 140,
										borderRadius: 70,
										backgroundColor: currentMoodData.bg,
										borderWidth: 4,
										borderColor: currentMoodData.color,
										alignItems: "center",
										justifyContent: "center",
										shadowColor: currentMoodData.color,
										shadowOffset: { width: 0, height: 8 },
										shadowOpacity: 0.6,
										shadowRadius: 20,
										marginBottom: 16,
									}}
								>
									<Text style={{ fontSize: 72 }}>{currentMoodData.emoji}</Text>
								</View>
								<Text
									style={{
										color: currentMoodData.color,
										fontSize: 32,
										fontWeight: "bold",
									}}
								>
									{currentMoodData.label}
								</Text>
							</View>
						)}

						{/* Analyzing State */}
						{isAnalyzing && (
							<View style={{ alignItems: "center", marginBottom: 32 }}>
								<ActivityIndicator size="large" color={colors.neon} />
								<Text
									style={{
										color: colors.textDim,
										fontSize: 16,
										marginTop: 16,
									}}
								>
									Reading your vibe...
								</Text>
							</View>
						)}
					</View>

					{/* Mood Grid */}
					<View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
						<Text
							style={{
								color: colors.textDim,
								fontSize: 14,
								fontWeight: "600",
								letterSpacing: 1,
								textTransform: "uppercase",
								marginBottom: 16,
								textAlign: "center",
							}}
						>
							{detectedEmotion ? "Or choose manually:" : "Choose your mood:"}
						</Text>

						<View
							style={{
								flexDirection: "row",
								flexWrap: "wrap",
								justifyContent: "center",
								gap: 12,
							}}
						>
							{moods.map((moodKey) => {
								const moodData = MOOD_DATA[moodKey];
								const isSelected = selectedMood === moodKey;

								return (
									<Pressable
										key={moodKey}
										onPress={() => handleMoodSelect(moodKey)}
										style={{
											width: 100,
											alignItems: "center",
											paddingVertical: 16,
											paddingHorizontal: 8,
											borderRadius: 12,
											borderWidth: 2,
											borderColor: isSelected ? moodData.color : "transparent",
											backgroundColor: isSelected
												? moodData.bg
												: "rgba(255,255,255,0.05)",
											shadowColor: isSelected ? moodData.color : "transparent",
											shadowOffset: { width: 0, height: 4 },
											shadowOpacity: isSelected ? 0.5 : 0,
											shadowRadius: 8,
										}}
									>
										<Text style={{ fontSize: 40, marginBottom: 8 }}>
											{moodData.emoji}
										</Text>
										<Text
											style={{
												color: isSelected ? moodData.color : colors.textDim,
												fontSize: 12,
												fontWeight: isSelected ? "700" : "500",
												textAlign: "center",
											}}
										>
											{moodData.label}
										</Text>
									</Pressable>
								);
							})}
						</View>

						{/* Camera Detection Option */}
						{!detectedEmotion && (
							<View
								style={{
									width: "100%",
									paddingTop: 24,
									marginTop: 16,
									borderTopWidth: 1,
									borderTopColor: "rgba(255, 255, 255, 0.1)",
								}}
							>
								<Text
									style={{
										color: colors.textDim,
										fontSize: 13,
										textAlign: "center",
										marginBottom: 12,
									}}
								>
									Or try camera detection
								</Text>
								<Pressable
									style={{
										paddingHorizontal: 24,
										paddingVertical: 14,
										borderRadius: 10,
										backgroundColor: "rgba(192, 255, 0, 0.1)",
										borderWidth: 2,
										borderColor: colors.neon,
										alignItems: "center",
									}}
									onPress={handleCapturePress}
								>
									<Text
										style={{
											color: colors.neon,
											fontSize: 16,
											fontWeight: "bold",
										}}
									>
										📸 Capture My Vibe
									</Text>
								</Pressable>
							</View>
						)}
					</View>

					{/* Energy & Valence Sliders */}
					{selectedMood && (
						<>
							{/* Energy Slider */}
							<View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										justifyContent: "space-between",
										marginBottom: 12,
									}}
								>
									<Text
										style={{
											color: colors.text,
											fontSize: 18,
											fontWeight: "700",
										}}
									>
										Energy Level
									</Text>
									<Text
										style={{
											color: colors.neon,
											fontSize: 18,
											fontWeight: "700",
										}}
									>
										{energy}%
									</Text>
								</View>

								{/* Progress Bar */}
								<View
									style={{
										height: 8,
										backgroundColor: "rgba(255, 255, 255, 0.1)",
										borderRadius: 4,
										marginBottom: 12,
										overflow: "hidden",
									}}
								>
									<View
										style={{
											width: `${energy}%`,
											height: 8,
											backgroundColor: colors.neon,
											borderRadius: 4,
											shadowColor: colors.neon,
											shadowOffset: { width: 0, height: 0 },
											shadowOpacity: 0.6,
											shadowRadius: 8,
										}}
									/>
								</View>

								{/* Quick Adjust Buttons */}
								<View style={{ flexDirection: "row", gap: 8 }}>
									<Pressable
										onPress={() => setEnergy(Math.max(0, energy - 10))}
										style={{
											flex: 1,
											paddingVertical: 12,
											borderRadius: 8,
											backgroundColor: "rgba(255, 255, 255, 0.05)",
											borderWidth: 1,
											borderColor: "rgba(255, 255, 255, 0.1)",
											alignItems: "center",
										}}
									>
										<Text
											style={{
												color: colors.text,
												fontSize: 16,
												fontWeight: "600",
											}}
										>
											-10
										</Text>
									</Pressable>
									<Pressable
										onPress={() => setEnergy(Math.min(100, energy + 10))}
										style={{
											flex: 1,
											paddingVertical: 12,
											borderRadius: 8,
											backgroundColor: "rgba(255, 255, 255, 0.05)",
											borderWidth: 1,
											borderColor: "rgba(255, 255, 255, 0.1)",
											alignItems: "center",
										}}
									>
										<Text
											style={{
												color: colors.text,
												fontSize: 16,
												fontWeight: "600",
											}}
										>
											+10
										</Text>
									</Pressable>
								</View>
							</View>

							{/* Valence Slider */}
							<View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										justifyContent: "space-between",
										marginBottom: 12,
									}}
								>
									<Text
										style={{
											color: colors.text,
											fontSize: 18,
											fontWeight: "700",
										}}
									>
										Emotional Tone
									</Text>
									<Text
										style={{
											color: colors.purple,
											fontSize: 18,
											fontWeight: "700",
										}}
									>
										{valence > 0 ? "+" : ""}
										{valence}
									</Text>
								</View>

								{/* Progress Bar */}
								<View
									style={{
										height: 8,
										backgroundColor: "rgba(255, 255, 255, 0.1)",
										borderRadius: 4,
										marginBottom: 12,
										overflow: "hidden",
									}}
								>
									<View
										style={{
											width: `${((valence + 100) / 200) * 100}%`,
											height: 8,
											backgroundColor: colors.purple,
											borderRadius: 4,
											shadowColor: colors.purple,
											shadowOffset: { width: 0, height: 0 },
											shadowOpacity: 0.6,
											shadowRadius: 8,
										}}
									/>
								</View>

								{/* Quick Adjust Buttons */}
								<View style={{ flexDirection: "row", gap: 8 }}>
									<Pressable
										onPress={() => setValence(Math.max(-100, valence - 20))}
										style={{
											flex: 1,
											paddingVertical: 12,
											borderRadius: 8,
											backgroundColor: "rgba(255, 255, 255, 0.05)",
											borderWidth: 1,
											borderColor: "rgba(255, 255, 255, 0.1)",
											alignItems: "center",
										}}
									>
										<Text
											style={{
												color: colors.text,
												fontSize: 16,
												fontWeight: "600",
											}}
										>
											-20
										</Text>
									</Pressable>
									<Pressable
										onPress={() => setValence(Math.min(100, valence + 20))}
										style={{
											flex: 1,
											paddingVertical: 12,
											borderRadius: 8,
											backgroundColor: "rgba(255, 255, 255, 0.05)",
											borderWidth: 1,
											borderColor: "rgba(255, 255, 255, 0.1)",
											alignItems: "center",
										}}
									>
										<Text
											style={{
												color: colors.text,
												fontSize: 16,
												fontWeight: "600",
											}}
										>
											+20
										</Text>
									</Pressable>
								</View>
							</View>

							{/* Continue Button */}
							<View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
								<Pressable
									onPress={handleContinue}
									style={{
										backgroundColor: colors.neon,
										paddingVertical: 16,
										borderRadius: 8,
										alignItems: "center",
										shadowColor: colors.neon,
										shadowOffset: { width: 0, height: 8 },
										shadowOpacity: 0.4,
										shadowRadius: 16,
									}}
								>
									<Text
										style={{
											color: colors.bg,
											fontSize: 18,
											fontWeight: "700",
											letterSpacing: 1,
										}}
									>
										Continue
									</Text>
								</Pressable>
							</View>
						</>
					)}
				</Animated.View>
			</ScrollView>

			{/* Camera Modal */}
			<Modal
				visible={showCamera}
				animationType="slide"
				presentationStyle="fullScreen"
			>
				<CameraCapture
					onCapture={handleCameraCapture}
					onCancel={handleCameraCancel}
				/>
			</Modal>
		</SafeAreaView>
	);
}
