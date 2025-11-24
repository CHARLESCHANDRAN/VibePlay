import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { colors } from "../theme/colors";

const { width } = Dimensions.get("window");

export const SkeletonMovieCard = ({ style }) => {
	const shimmerAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(shimmerAnim, {
					toValue: 1,
					duration: 1000,
					useNativeDriver: true,
				}),
				Animated.timing(shimmerAnim, {
					toValue: 0,
					duration: 1000,
					useNativeDriver: true,
				}),
			])
		).start();
	}, []);

	const opacity = shimmerAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0.3, 0.6],
	});

	return (
		<Animated.View style={[styles.movieCard, style, { opacity }]}>
			<View style={styles.moviePoster} />
			<View style={styles.movieTitle} />
		</Animated.View>
	);
};

export const SkeletonTrackCard = ({ style }) => {
	const shimmerAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(shimmerAnim, {
					toValue: 1,
					duration: 1000,
					useNativeDriver: true,
				}),
				Animated.timing(shimmerAnim, {
					toValue: 0,
					duration: 1000,
					useNativeDriver: true,
				}),
			])
		).start();
	}, []);

	const opacity = shimmerAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0.3, 0.6],
	});

	return (
		<Animated.View style={[styles.trackCard, style, { opacity }]}>
			<View style={styles.trackAlbum} />
			<View style={styles.trackInfo}>
				<View style={styles.trackName} />
				<View style={styles.trackArtist} />
			</View>
		</Animated.View>
	);
};

export const SkeletonHero = () => {
	const shimmerAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(shimmerAnim, {
					toValue: 1,
					duration: 1500,
					useNativeDriver: true,
				}),
				Animated.timing(shimmerAnim, {
					toValue: 0,
					duration: 1500,
					useNativeDriver: true,
				}),
			])
		).start();
	}, []);

	const opacity = shimmerAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0.2, 0.4],
	});

	return (
		<Animated.View style={[styles.hero, { opacity }]}>
			<View style={styles.heroContent}>
				<View style={styles.heroTitle} />
				<View style={styles.heroSubtitle} />
				<View style={styles.heroButtons}>
					<View style={styles.heroButton} />
					<View style={styles.heroButton} />
				</View>
			</View>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	// Movie Card Skeleton
	movieCard: {
		width: 140,
		marginRight: 12,
	},
	moviePoster: {
		width: 140,
		height: 210,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: 8,
		marginBottom: 8,
	},
	movieTitle: {
		width: "80%",
		height: 14,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: 4,
	},

	// Track Card Skeleton
	trackCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		backgroundColor: "rgba(255, 255, 255, 0.05)",
		borderRadius: 12,
		marginBottom: 12,
	},
	trackAlbum: {
		width: 60,
		height: 60,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: 8,
		marginRight: 12,
	},
	trackInfo: {
		flex: 1,
	},
	trackName: {
		width: "70%",
		height: 16,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: 4,
		marginBottom: 8,
	},
	trackArtist: {
		width: "50%",
		height: 12,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: 4,
	},

	// Hero Skeleton
	hero: {
		width: width,
		height: 500,
		backgroundColor: "rgba(255, 255, 255, 0.05)",
		justifyContent: "flex-end",
		padding: 20,
	},
	heroContent: {
		marginBottom: 40,
	},
	heroTitle: {
		width: "60%",
		height: 32,
		backgroundColor: "rgba(255, 255, 255, 0.15)",
		borderRadius: 8,
		marginBottom: 12,
	},
	heroSubtitle: {
		width: "80%",
		height: 16,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: 4,
		marginBottom: 24,
	},
	heroButtons: {
		flexDirection: "row",
	},
	heroButton: {
		width: 120,
		height: 44,
		backgroundColor: "rgba(255, 255, 255, 0.15)",
		borderRadius: 8,
		marginRight: 12,
	},
});
