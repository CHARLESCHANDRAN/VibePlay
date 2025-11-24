import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	SafeAreaView,
	Pressable,
	ScrollView,
	Animated,
	Dimensions,
} from "react-native";
import { styles } from "../theme/styles";
import { colors } from "../theme/colors";
import NeonButton from "../components/NeonButton";
import CameraEmotionDetector from "../components/CameraEmotionDetector";
import { useEmotionDetector } from "../hooks/useEmotionDetector";
import { useStore } from "../state/store";

const { width, height } = Dimensions.get("window");

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
	const { onMoodDetected } = useEmotionDetector(false); // Always use camera capture mode

	// Animation values
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.95)).current;

	// Entrance animation
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

	const currentMoodData = MOOD_DATA[mood] || MOOD_DATA.neutral;
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

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
				{/* Hero Section - Netflix Style */}
				<Animated.View
					style={{
						opacity: fadeAnim,
						transform: [{ scale: scaleAnim }],
					}}
				>
					{/* Top Navigation */}
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

					{/* Hero - Emoji Grid as Primary */}
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

						{/* Current Mood Display - Show if selected */}
						{mood && (
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
										fontSize: 32,
										fontWeight: "700",
										marginBottom: 8,
									}}
								>
									{currentMoodData.label}
								</Text>
							</View>
						)}

						{/* Mood Selection Grid */}
						<View style={{ width: "100%", marginBottom: 24 }}>
							<Text
								style={{
									color: colors.text,
									fontSize: 18,
									fontWeight: "700",
									marginBottom: 16,
									textAlign: "center",
								}}
							>
								{mood ? "Change Your Mood" : "Select Your Mood"}
							</Text>
							<View
								style={{
									flexDirection: "row",
									flexWrap: "wrap",
									justifyContent: "center",
									gap: 10,
								}}
							>
								{moods.map((m) => {
									const moodData = MOOD_DATA[m];
									const isSelected = m === mood;
									return (
										<Pressable
											key={m}
											onPress={() => setMood(m, 0.95)}
											style={{
												width: (width - 80) / 3,
												height: 110,
												borderRadius: 16,
												backgroundColor: isSelected
													? moodData.bg
													: "rgba(255, 255, 255, 0.05)",
												borderWidth: 2,
												borderColor: isSelected
													? moodData.color
													: "rgba(255, 255, 255, 0.1)",
												alignItems: "center",
												justifyContent: "center",
												shadowColor: isSelected
													? moodData.color
													: "transparent",
												shadowOffset: { width: 0, height: 4 },
												shadowOpacity: 0.5,
												shadowRadius: 12,
											}}
										>
											<Text style={{ fontSize: 40, marginBottom: 6 }}>
												{moodData.emoji}
											</Text>
											<Text
												style={{
													color: isSelected ? moodData.color : colors.textDim,
													fontSize: 12,
													fontWeight: "700",
													textAlign: "center",
												}}
											>
												{moodData.label}
											</Text>
										</Pressable>
									);
								})}
							</View>
						</View>

						{/* Optional: Try Camera Detection */}
						{!mood && (
							<View
								style={{
									width: "100%",
									paddingTop: 16,
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
									Or try camera detection (experimental)
								</Text>
								<CameraEmotionDetector
									isActive={true}
									onMoodDetected={(detectedMood, confidence) => {
										setMood(detectedMood, confidence);
									}}
								/>
							</View>
						)}
					</View>

					{/* Energy Slider */}
					<View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
								marginBottom: 12,
							}}
						>
							<Text
								style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}
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
								style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}
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
									width: `${(valence + 100) / 2}%`,
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

					{/* CTA Button - Fixed Netflix Style */}
					<View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
						<Pressable
							onPress={() => navigation.navigate("Intent")}
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
				</Animated.View>
			</ScrollView>
		</SafeAreaView>
	);
}
