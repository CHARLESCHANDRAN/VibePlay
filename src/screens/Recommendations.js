// screens/Recommendations.js
import React from "react";
import {
	View,
	Text,
	ScrollView,
	Pressable,
	Linking,
	StatusBar,
	RefreshControl,
	Image,
	ImageBackground,
	Dimensions,
	Animated,
	TextInput,
	Modal,
	PanResponder,
} from "react-native";
import { colors } from "../theme/colors";
import { useStore } from "../state/store";
import { useToast } from "../hooks/useToast";
import { buildParams } from "../services/mapMood";
import { discoverMovies } from "../services/tmdb";
import { getRecommendations } from "../services/spotify";
import { SkeletonMovieCard, SkeletonTrackCard, SkeletonHero } from "../components/SkeletonLoaders";

const { width } = Dimensions.get("window");

const MOOD_EMOJI = {
	happy: "😄",
	sad: "😔",
	angry: "😤",
	surprised: "😮",
	neutral: "😐",
	tired: "🥱",
};

// Genre ID to name mapping (TMDb)
const GENRE_MAP = {
	28: "Action",
	12: "Adventure",
	16: "Animation",
	35: "Comedy",
	80: "Crime",
	99: "Documentary",
	18: "Drama",
	10751: "Family",
	14: "Fantasy",
	36: "History",
	27: "Horror",
	10402: "Music",
	9648: "Mystery",
	10749: "Romance",
	878: "Sci-Fi",
	10770: "TV",
	53: "Thriller",
	10752: "War",
	37: "Western",
};

export default function Recommendations({ navigation }) {
	const { mood, energy, valence, intent } = useStore();
	const { showToast } = useToast();
	const [movies, setMovies] = React.useState([]);
	const [tracks, setTracks] = React.useState([]);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState(null);
	const [heroItem, setHeroItem] = React.useState(null);
	const [continueWatching, setContinueWatching] = React.useState([]);
	const fadeAnim = React.useRef(new Animated.Value(0)).current;

	// Search & Filter states
	const [searchQuery, setSearchQuery] = React.useState("");
	const [showSearch, setShowSearch] = React.useState(false);

	// Preview states
	const [previewItem, setPreviewItem] = React.useState(null);
	const [previewTimer, setPreviewTimer] = React.useState(null);

	// Saved items (for swipe gesture)
	const [savedItems, setSavedItems] = React.useState([]);

	// Filtered results
	const filteredMovies = React.useMemo(() => {
		let result = movies;
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(m) =>
					m.title?.toLowerCase().includes(query) ||
					m.overview?.toLowerCase().includes(query)
			);
		}
		return result;
	}, [movies, searchQuery]);

	const filteredTracks = React.useMemo(() => {
		if (!searchQuery.trim()) return tracks;
		const query = searchQuery.toLowerCase();
		return tracks.filter(
			(t) =>
				t.name?.toLowerCase().includes(query) ||
				t.artists?.some((a) => a.name?.toLowerCase().includes(query))
		);
	}, [tracks, searchQuery]);

	async function load() {
		setLoading(true);
		setError(null);
		try {
			const p = buildParams(
				mood || "neutral",
				intent || "keep",
				energy || 0.5,
				valence || 0.5
			);

			// Randomize TMDB page on refresh (1–5)
			const randomPage = Math.floor(Math.random() * 5) + 1;
			p.tmdb.page = randomPage;

			// Add randomization to Spotify params to get different results
			const randomVariation = () => (Math.random() - 0.5) * 0.2;
			if (p.spotify.target_energy !== undefined) {
				p.spotify.target_energy = Math.max(
					0,
					Math.min(1, p.spotify.target_energy + randomVariation())
				);
			}
			if (p.spotify.target_valence !== undefined) {
				p.spotify.target_valence = Math.max(
					0,
					Math.min(1, p.spotify.target_valence + randomVariation())
				);
			}
			if (p.spotify.target_danceability !== undefined) {
				p.spotify.target_danceability = Math.max(
					0,
					Math.min(1, p.spotify.target_danceability + randomVariation())
				);
			}
			if (p.spotify.target_tempo !== undefined) {
				p.spotify.target_tempo = Math.max(
					60,
					Math.min(180, p.spotify.target_tempo + (Math.random() - 0.5) * 20)
				);
			}

			// Both in parallel
			const [moviesResult, tracksResult] = await Promise.all([
				discoverMovies(p.tmdb),
				getRecommendations(p.spotify),
			]);

			const safeMovies = Array.isArray(moviesResult) ? moviesResult : [];
			const safeTracks = Array.isArray(tracksResult) ? tracksResult : [];

			const shuffledTracks = [...safeTracks].sort(() => Math.random() - 0.5);

			setMovies(safeMovies);
			setTracks(shuffledTracks);

			// Set hero item (first movie with backdrop)
			const heroCandidate = safeMovies.find((m) => m.backdrop_path);
			setHeroItem(heroCandidate || safeMovies[0] || null);

			// Simulate "continue watching" with random progress
			const continueItems = safeMovies.slice(0, 6).map((movie) => ({
				...movie,
				progress: Math.floor(Math.random() * 80) + 10, // 10-90%
			}));
			setContinueWatching(continueItems);

			// Fade in animation
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 600,
				useNativeDriver: true,
			}).start();
		} catch (err) {
			console.error("Failed to load recommendations:", err);
			const errorMessage = err?.message || "Failed to load recommendations";
			setError(errorMessage);
			showToast(errorMessage, 'error');
		} finally {
			setLoading(false);
		}
	}

	React.useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Reset animation on refresh
	const handleRefresh = () => {
		fadeAnim.setValue(0);
		load();
	};

	// Auto-play preview handler (long-press-ish)
	const handlePreviewStart = (item, type) => {
		const timer = setTimeout(() => {
			setPreviewItem({ ...item, type });
		}, 800); // 800ms delay
		setPreviewTimer(timer);
	};

	const handlePreviewEnd = () => {
		if (previewTimer) {
			clearTimeout(previewTimer);
			setPreviewTimer(null);
		}
		setPreviewItem(null);
	};

	// Save/dismiss handlers
	const handleSave = (item) => {
		setSavedItems((prev) => [...prev, item]);
		console.log("Saved:", item?.title || item?.name);
		showToast(`Saved: ${item?.title || item?.name}`, 'success');
	};

	const handleDismiss = (item) => {
		console.log("Dismissed:", item?.title || item?.name);
		showToast('Dismissed', 'info');
	};

	// Clear filters
	const clearFilters = () => {
		setSearchQuery("");
	};

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<StatusBar barStyle="light-content" backgroundColor={colors.bg} />

			<ScrollView
				style={{ flex: 1 }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={handleRefresh}
						tintColor={colors.neon}
						colors={[colors.neon, colors.purple]}
					/>
				}
			>
				{/* Hero Banner Container */}
				<View style={{ position: 'relative' }}>
					{/* Hero Banner */}
					{heroItem && (
						<ImageBackground
							source={{
								uri: heroItem.backdrop_path
									? `https://image.tmdb.org/t/p/w780${heroItem.backdrop_path}`
									: heroItem.poster_path
									? `https://image.tmdb.org/t/p/w500${heroItem.poster_path}`
									: undefined,
							}}
							style={{
								width: "100%",
								height: 500,
								backgroundColor: colors.surface,
							}}
							resizeMode="cover"
						>
						{/* Main content overlay */}
						<View style={{ flex: 1 }}>
							{/* Top nav with enhanced visibility */}
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "space-between",
									paddingHorizontal: 16,
									paddingTop: 50,
									paddingBottom: 16,
									backgroundColor: 'rgba(11,15,20,0.90)',
								}}
							>
								<Pressable onPress={() => navigation.navigate("Onboarding")}>
									<Text
										style={{
											color: colors.neon,
											fontSize: 32,
											fontWeight: "700",
											textShadowColor: 'rgba(0,0,0,0.8)',
											textShadowOffset: { width: 0, height: 2 },
											textShadowRadius: 4,
										}}
									>
										V
									</Text>
								</Pressable>

								<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
									{/* Search icon */}
									<Pressable
										onPress={() => setShowSearch((s) => !s)}
										style={{
											padding: 10,
											backgroundColor: showSearch ? 'rgba(41,242,255,0.2)' : 'rgba(255,255,255,0.1)',
											borderRadius: 8,
											borderWidth: 1,
											borderColor: showSearch ? colors.neon : 'rgba(255,255,255,0.2)',
										}}
									>
										<Text style={{ color: colors.text, fontSize: 20 }}>🔍</Text>
									</Pressable>
									
									{/* Mood emoji with background */}
									<View
										style={{
											padding: 8,
											backgroundColor: 'rgba(255,255,255,0.15)',
											borderRadius: 12,
											borderWidth: 2,
											borderColor: colors.neon,
											minWidth: 48,
											alignItems: 'center',
											justifyContent: 'center',
											shadowColor: colors.neon,
											shadowOffset: { width: 0, height: 0 },
											shadowOpacity: 0.5,
											shadowRadius: 8,
										}}
									>
										<Text style={{ fontSize: 28 }}>
											{MOOD_EMOJI[mood] || "😐"}
										</Text>
									</View>
								</View>
							</View>

							{/* Hero content */}
							<View
								style={{
									flex: 1,
									justifyContent: "flex-end",
									paddingHorizontal: 16,
									paddingBottom: 40,
								}}
							>
								<View
									style={{
										backgroundColor: `${colors.bg}dd`,
										borderRadius: 16,
										padding: 20,
									}}
								>
									{/* Genre badges */}
									{!!(heroItem.genre_ids && heroItem.genre_ids.length) && (
										<View
											style={{
												flexDirection: "row",
												marginBottom: 12,
												flexWrap: "wrap",
											}}
										>
											{heroItem.genre_ids.slice(0, 3).map((genreId) => (
												<View
													key={genreId}
													style={{
														backgroundColor: `${colors.neon}33`,
														paddingHorizontal: 12,
														paddingVertical: 4,
														borderRadius: 12,
														borderWidth: 1,
														borderColor: colors.neon,
														marginRight: 8,
														marginBottom: 8,
													}}
												>
													<Text
														style={{
															color: colors.neon,
															fontSize: 12,
															fontWeight: "600",
														}}
													>
														{GENRE_MAP[genreId] || "Unknown"}
													</Text>
												</View>
											))}
										</View>
									)}

									<Text
										style={{
											color: colors.text,
											fontSize: 32,
											fontWeight: "800",
											marginBottom: 8,
										}}
									>
										{heroItem.title}
									</Text>

									{typeof heroItem.vote_average === "number" && (
										<View
											style={{
												flexDirection: "row",
												alignItems: "center",
												marginBottom: 8,
											}}
										>
											<Text
												style={{
													color: colors.amber,
													fontSize: 18,
													marginRight: 6,
												}}
											>
												★
											</Text>
											<Text
												style={{
													color: colors.text,
													fontSize: 16,
													fontWeight: "700",
												}}
											>
												{heroItem.vote_average.toFixed(1)}
											</Text>
											<Text
												style={{
													color: colors.textDim,
													fontSize: 14,
													marginLeft: 6,
												}}
											>
												({heroItem.vote_count || 0} votes)
											</Text>
										</View>
									)}

									{!!heroItem.overview && (
										<Text
											style={{
												color: colors.textDim,
												fontSize: 14,
												marginBottom: 16,
												lineHeight: 20,
											}}
											numberOfLines={3}
										>
											{heroItem.overview}
										</Text>
									)}

									<View style={{ flexDirection: "row" }}>
										<Pressable
											onPress={() =>
												Linking.openURL(
													`https://www.themoviedb.org/movie/${heroItem.id}`
												)
											}
											style={{
												backgroundColor: colors.neon,
												paddingVertical: 12,
												paddingHorizontal: 24,
												borderRadius: 8,
												flexDirection: "row",
												alignItems: "center",
												marginRight: 12,
											}}
										>
											<Text
												style={{
													color: colors.bg,
													fontSize: 18,
													marginRight: 8,
												}}
											>
												▶
											</Text>
											<Text
												style={{
													color: colors.bg,
													fontSize: 16,
													fontWeight: "700",
												}}
											>
												Play
											</Text>
										</Pressable>
										<Pressable
											style={{
												backgroundColor: `${colors.surface}cc`,
												paddingVertical: 12,
												paddingHorizontal: 24,
												borderRadius: 8,
												flexDirection: "row",
												alignItems: "center",
											}}
										>
											<Text
												style={{
													color: colors.text,
													fontSize: 18,
													marginRight: 8,
												}}
											>
												ℹ
											</Text>
											<Text
												style={{
													color: colors.text,
													fontSize: 16,
													fontWeight: "700",
												}}
											>
												Info
											</Text>
										</Pressable>
									</View>
								</View>
							</View>
						</View>
					</ImageBackground>
				)}

				{/* Search Bar - Positioned on top */}
				{showSearch && (
					<View style={{
						position: 'absolute',
						top: 118,
						left: 0,
						right: 0,
						zIndex: 1000,
						paddingHorizontal: 16,
						paddingVertical: 16,
						backgroundColor: 'rgba(11,15,20,0.95)',
					}}>
						<View
							style={{
								backgroundColor: colors.surface,
								borderRadius: 12,
								paddingHorizontal: 16,
								paddingVertical: 14,
								flexDirection: "row",
								alignItems: "center",
								borderWidth: 2,
								borderColor: colors.neon,
							}}
						>
							<Text style={{ fontSize: 18, marginRight: 12 }}>🔍</Text>
							<TextInput
								value={searchQuery}
								onChangeText={setSearchQuery}
								placeholder="Search movies or music..."
								placeholderTextColor={colors.textDim}
								style={{
									flex: 1,
									color: colors.text,
									fontSize: 16,
									fontWeight: '500',
								}}
								autoFocus
							/>
							{searchQuery.length > 0 && (
								<Pressable
									onPress={() => setSearchQuery("")}
									style={{
										padding: 6,
										backgroundColor: 'rgba(255,255,255,0.1)',
										borderRadius: 6,
									}}
								>
									<Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
										✕
									</Text>
								</Pressable>
							)}
						</View>
					</View>
				)}
				</View>

				{/* Error State */}
				{error && (
					<View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
						<Text style={{ color: "#ff6b6b", fontSize: 14 }}>
							Error: {error}
						</Text>
					</View>
				)}

				{/* Active Filters Display */}
				{!!searchQuery && (
					<View
						style={{ paddingHorizontal: 16, marginTop: 12, marginBottom: 8 }}
					>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								flexWrap: "wrap",
							}}
						>
							<Text
								style={{ color: colors.textDim, fontSize: 14, marginRight: 8 }}
							>
								Filters:
							</Text>
							<View
								style={{
									backgroundColor: colors.neon,
									paddingHorizontal: 10,
									paddingVertical: 4,
									borderRadius: 12,
									flexDirection: "row",
									alignItems: "center",
									marginRight: 8,
									marginBottom: 6,
								}}
							>
								<Text
									style={{
										color: colors.bg,
										fontSize: 12,
										fontWeight: "600",
										marginRight: 6,
									}}
								>
									"{searchQuery}"
								</Text>
								<Pressable onPress={() => setSearchQuery("")}>
									<Text style={{ color: colors.bg, fontSize: 12 }}>✕</Text>
								</Pressable>
							</View>
							<Pressable onPress={clearFilters}>
								<Text
									style={{
										color: colors.neon,
										fontSize: 12,
										textDecorationLine: "underline",
									}}
								>
									Clear all
								</Text>
							</Pressable>
						</View>
					</View>
				)}

				{/* Continue Watching Section */}
				{continueWatching.length > 0 && (
					<Animated.View style={{ marginTop: 24, opacity: fadeAnim }}>
						<Text
							style={{
								color: colors.text,
								fontSize: 20,
								fontWeight: "700",
								paddingHorizontal: 16,
								marginBottom: 12,
							}}
						>
							Continue Watching
						</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ paddingHorizontal: 16 }}
						>
							{continueWatching.map((movie, index) => (
								<View key={`${movie.id}-${index}`} style={{ marginRight: 12 }}>
									<ContinueWatchingCard
										movie={movie}
										index={index}
										fadeAnim={fadeAnim}
									/>
								</View>
							))}
						</ScrollView>
					</Animated.View>
				)}

				{/* Movies Section */}
				{filteredMovies.length > 0 && (
					<Animated.View style={{ marginTop: 24, opacity: fadeAnim }}>
						<Text
							style={{
								color: colors.text,
								fontSize: 20,
								fontWeight: "700",
								paddingHorizontal: 16,
								marginBottom: 12,
							}}
						>
							{searchQuery
								? `Found ${filteredMovies.length} Movies`
								: intent === "keep"
								? "More Like This"
								: "Change Your Mood"}
						</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ paddingHorizontal: 16 }}
						>
							{filteredMovies.slice(1, 10).map((movie, index) => (
								<View key={movie.id} style={{ marginRight: 12 }}>
									<MovieCard
										movie={movie}
										index={index}
										fadeAnim={fadeAnim}
										onPreviewStart={() => handlePreviewStart(movie, "movie")}
										onPreviewEnd={handlePreviewEnd}
										onSave={() => handleSave(movie)}
										onDismiss={() => handleDismiss(movie)}
									/>
								</View>
							))}
						</ScrollView>
					</Animated.View>
				)}

				{/* Top Picks Section */}
				{filteredMovies.length > 10 && !searchQuery && (
					<Animated.View style={{ marginTop: 32, opacity: fadeAnim }}>
						<Text
							style={{
								color: colors.text,
								fontSize: 20,
								fontWeight: "700",
								paddingHorizontal: 16,
								marginBottom: 12,
							}}
						>
							🔥 Top Picks for You
						</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ paddingHorizontal: 16 }}
						>
							{filteredMovies.slice(10, 18).map((movie, index) => (
								<View key={movie.id} style={{ marginRight: 12 }}>
									<MovieCard
										movie={movie}
										index={index + 10}
										fadeAnim={fadeAnim}
										onPreviewStart={() => handlePreviewStart(movie, "movie")}
										onPreviewEnd={handlePreviewEnd}
										onSave={() => handleSave(movie)}
										onDismiss={() => handleDismiss(movie)}
									/>
								</View>
							))}
						</ScrollView>
					</Animated.View>
				)}

				{/* Music Section */}
				{filteredTracks.length > 0 && (
					<Animated.View
						style={{ marginTop: 32, marginBottom: 32, opacity: fadeAnim }}
					>
						<Text
							style={{
								color: colors.text,
								fontSize: 20,
								fontWeight: "700",
								paddingHorizontal: 16,
								marginBottom: 12,
							}}
						>
							{searchQuery
								? `Found ${filteredTracks.length} Tracks`
								: "🎵 Your Vibe Playlist"}
						</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ paddingHorizontal: 16 }}
						>
							{filteredTracks.slice(0, 10).map((track, index) => (
								<View key={track.id} style={{ marginRight: 12 }}>
									<TrackCard
										track={track}
										index={index}
										fadeAnim={fadeAnim}
										onPreviewStart={() => handlePreviewStart(track, "track")}
										onPreviewEnd={handlePreviewEnd}
										onSave={() => handleSave(track)}
										onDismiss={() => handleDismiss(track)}
									/>
								</View>
							))}
						</ScrollView>
					</Animated.View>
				)}

			{/* Loading State with Skeletons */}
			{loading && (
				<View>
					{/* Hero Skeleton */}
					<SkeletonHero />

					{/* Continue Watching Skeleton */}
					<View style={{ paddingHorizontal: 20, marginTop: 24 }}>
						<View style={{ 
							width: 180, 
							height: 24, 
							backgroundColor: 'rgba(255, 255, 255, 0.1)', 
							borderRadius: 6,
							marginBottom: 16 
						}} />
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							{[1, 2, 3, 4].map((i) => (
								<SkeletonMovieCard key={`continue-skeleton-${i}`} />
							))}
						</ScrollView>
					</View>

					{/* Movies Skeleton */}
					<View style={{ paddingHorizontal: 20, marginTop: 32 }}>
						<View style={{ 
							width: 160, 
							height: 24, 
							backgroundColor: 'rgba(255, 255, 255, 0.1)', 
							borderRadius: 6,
							marginBottom: 16 
						}} />
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							{[1, 2, 3, 4, 5].map((i) => (
								<SkeletonMovieCard key={`movie-skeleton-${i}`} />
							))}
						</ScrollView>
					</View>

					{/* Music Skeleton */}
					<View style={{ paddingHorizontal: 20, marginTop: 32, marginBottom: 32 }}>
						<View style={{ 
							width: 140, 
							height: 24, 
							backgroundColor: 'rgba(255, 255, 255, 0.1)', 
							borderRadius: 6,
							marginBottom: 16 
						}} />
						{[1, 2, 3, 4].map((i) => (
							<SkeletonTrackCard key={`track-skeleton-${i}`} />
						))}
					</View>
				</View>
			)}
			
			{/* No Results */}
			{!loading &&
				searchQuery &&
				filteredMovies.length === 0 &&
				filteredTracks.length === 0 && (
						<View style={{ padding: 32, alignItems: "center" }}>
							<Text
								style={{ color: colors.textDim, fontSize: 18, marginBottom: 8 }}
							>
								No results found
							</Text>
							<Pressable onPress={clearFilters}>
								<Text
									style={{
										color: colors.neon,
										fontSize: 14,
										textDecorationLine: "underline",
									}}
								>
									Clear filters
								</Text>
							</Pressable>
						</View>
					)}
			</ScrollView>

			{/* Preview Modal */}
			{previewItem && (
				<PreviewModal
					item={previewItem}
					onClose={handlePreviewEnd}
					onSave={() => {
						handleSave(previewItem);
						handlePreviewEnd();
					}}
				/>
			)}
		</View>
	);
}

// Preview Modal Component
function PreviewModal({ item, onClose, onSave }) {
	const fadeAnim = React.useRef(new Animated.Value(0)).current;

	React.useEffect(() => {
		Animated.timing(fadeAnim, {
			toValue: 1,
			duration: 300,
			useNativeDriver: true,
		}).start();
	}, [fadeAnim]);

	const isMovie = item.type === "movie";

	return (
		<Modal transparent visible animationType="none" onRequestClose={onClose}>
			<Pressable
				onPress={onClose}
				style={{
					flex: 1,
					backgroundColor: "rgba(0,0,0,0.9)",
					justifyContent: "center",
					alignItems: "center",
					padding: 16,
				}}
			>
				<Animated.View
					style={{ opacity: fadeAnim, width: width * 0.9, maxWidth: 420 }}
				>
					<Pressable onPress={(e) => e.stopPropagation()}>
						<Image
							source={{
								uri: isMovie
									? item.backdrop_path
										? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
										: item.poster_path
										? `https://image.tmdb.org/t/p/w500${item.poster_path}`
										: undefined
									: item?.album?.images?.[0]?.url,
							}}
							style={{
								width: "100%",
								height: 250,
								borderTopLeftRadius: 16,
								borderTopRightRadius: 16,
								backgroundColor: colors.surface,
							}}
							resizeMode="cover"
						/>
						<View
							style={{
								backgroundColor: colors.surface,
								padding: 20,
								borderBottomLeftRadius: 16,
								borderBottomRightRadius: 16,
							}}
						>
							<Text
								style={{
									color: colors.text,
									fontSize: 24,
									fontWeight: "700",
									marginBottom: 8,
								}}
							>
								{item.title || item.name}
							</Text>

							{isMovie && typeof item.vote_average === "number" && (
								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										marginBottom: 12,
									}}
								>
									<Text
										style={{
											color: colors.amber,
											fontSize: 16,
											marginRight: 6,
										}}
									>
										★
									</Text>
									<Text
										style={{
											color: colors.text,
											fontSize: 14,
											fontWeight: "600",
										}}
									>
										{item.vote_average.toFixed(1)}
									</Text>
								</View>
							)}

							{!isMovie && (
								<Text
									style={{
										color: colors.textDim,
										fontSize: 14,
										marginBottom: 12,
									}}
								>
									{Array.isArray(item.artists)
										? item.artists.map((a) => a.name).join(", ")
										: ""}
								</Text>
							)}

							<Text
								style={{
									color: colors.textDim,
									fontSize: 14,
									marginBottom: 16,
									lineHeight: 20,
								}}
								numberOfLines={4}
							>
								{item.overview?.trim() ||
									"Tap play to enjoy this recommendation!"}
							</Text>

							<View style={{ flexDirection: "row" }}>
								<Pressable
									onPress={() => {
										if (isMovie) {
											Linking.openURL(
												`https://www.themoviedb.org/movie/${item.id}`
											);
										} else {
											Linking.openURL(
												item?.external_urls?.spotify ||
													`https://open.spotify.com/track/${item.id}`
											);
										}
										onClose();
									}}
									style={{
										flex: 1,
										backgroundColor: colors.neon,
										paddingVertical: 14,
										borderRadius: 12,
										alignItems: "center",
										marginRight: 12,
									}}
								>
									<Text
										style={{
											color: colors.bg,
											fontSize: 16,
											fontWeight: "700",
										}}
									>
										▶ Play Now
									</Text>
								</Pressable>
								<Pressable
									onPress={onSave}
									style={{
										backgroundColor: colors.purple,
										paddingVertical: 14,
										paddingHorizontal: 20,
										borderRadius: 12,
										alignItems: "center",
									}}
								>
									<Text style={{ color: colors.text, fontSize: 20 }}>💾</Text>
								</Pressable>
							</View>
						</View>
					</Pressable>
				</Animated.View>
			</Pressable>
		</Modal>
	);
}

// Continue Watching Card Component
function ContinueWatchingCard({ movie, index, fadeAnim }) {
	const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

	React.useEffect(() => {
		Animated.spring(scaleAnim, {
			toValue: 1,
			delay: index * 100,
			tension: 50,
			friction: 7,
			useNativeDriver: true,
		}).start();
	}, [index, scaleAnim]);

	return (
		<Animated.View
			style={{
				transform: [{ scale: scaleAnim }],
				opacity: fadeAnim,
			}}
		>
			<Pressable
				onPress={() =>
					Linking.openURL(`https://www.themoviedb.org/movie/${movie.id}`)
				}
				style={{ width: 280 }}
			>
				<View style={{ position: "relative" }}>
					<Image
						source={{
							uri: movie.backdrop_path
								? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
								: movie.poster_path
								? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
								: undefined,
						}}
						style={{
							width: 280,
							height: 160,
							borderRadius: 8,
							backgroundColor: colors.surface,
						}}
						resizeMode="cover"
					/>
					{/* Progress bar */}
					<View
						style={{
							position: "absolute",
							bottom: 0,
							left: 0,
							right: 0,
							height: 4,
							backgroundColor: colors.line,
							borderBottomLeftRadius: 8,
							borderBottomRightRadius: 8,
						}}
					>
						<View
							style={{
								width: `${movie.progress}%`,
								height: 4,
								backgroundColor: colors.neon,
								borderBottomLeftRadius: 8,
							}}
						/>
					</View>
				</View>
				<Text
					style={{
						color: colors.text,
						fontSize: 14,
						fontWeight: "600",
						marginTop: 8,
					}}
					numberOfLines={1}
				>
					{movie.title}
				</Text>
				<Text
					style={{
						color: colors.textDim,
						fontSize: 12,
						marginTop: 2,
					}}
				>
					{movie.progress}% watched
				</Text>
			</Pressable>
		</Animated.View>
	);
}

// Movie Card Component
function MovieCard({
	movie,
	index,
	fadeAnim,
	onPreviewStart,
	onPreviewEnd,
	onSave,
	onDismiss,
}) {
	const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
	const pan = React.useRef(new Animated.ValueXY()).current;
	const [isPressing, setIsPressing] = React.useState(false);

	React.useEffect(() => {
		Animated.spring(scaleAnim, {
			toValue: 1,
			delay: index * 80,
			tension: 50,
			friction: 7,
			useNativeDriver: true,
		}).start();
	}, [index, scaleAnim]);

	const panResponder = React.useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
			onPanResponderGrant: () => {
				pan.setOffset({
					x: pan.x.__getValue(),
					y: pan.y.__getValue(),
				});
			},
			onPanResponderMove: Animated.event([null, { dx: pan.x }], {
				useNativeDriver: false,
			}),
			onPanResponderRelease: (_e, g) => {
				pan.flattenOffset();
				if (g.dx > 100) {
					Animated.timing(pan, {
						toValue: { x: 300, y: 0 },
						duration: 200,
						useNativeDriver: true,
					}).start(() => {
						onSave?.();
						pan.setValue({ x: 0, y: 0 });
					});
				} else if (g.dx < -100) {
					Animated.timing(pan, {
						toValue: { x: -300, y: 0 },
						duration: 200,
						useNativeDriver: true,
					}).start(() => {
						onDismiss?.();
						pan.setValue({ x: 0, y: 0 });
					});
				} else {
					Animated.spring(pan, {
						toValue: { x: 0, y: 0 },
						useNativeDriver: true,
					}).start();
				}
			},
		})
	).current;

	return (
		<Animated.View
			style={{
				transform: [{ scale: scaleAnim }, { translateX: pan.x }],
				opacity: fadeAnim,
			}}
		>
			<Pressable
				onPressIn={() => {
					setIsPressing(true);
					onPreviewStart?.();
				}}
				onPressOut={() => {
					setIsPressing(false);
					onPreviewEnd?.();
				}}
				onPress={() =>
					Linking.openURL(`https://www.themoviedb.org/movie/${movie.id}`)
				}
				style={{ width: 140 }}
				{...panResponder.panHandlers}
			>
				<View style={{ position: "relative" }}>
					<Image
						source={{
							uri: movie.poster_path
								? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
								: undefined,
						}}
						style={{
							width: 140,
							height: 210,
							borderRadius: 8,
							backgroundColor: colors.surface,
							transform: [{ scale: isPressing ? 0.95 : 1 }],
						}}
						resizeMode="cover"
					/>
					{/* Rating badge */}
					{typeof movie.vote_average === "number" && (
						<View
							style={{
								position: "absolute",
								top: 8,
								right: 8,
								backgroundColor: `${colors.bg}dd`,
								paddingHorizontal: 8,
								paddingVertical: 4,
								borderRadius: 12,
								flexDirection: "row",
								alignItems: "center",
							}}
						>
							<Text
								style={{ color: colors.amber, fontSize: 12, marginRight: 4 }}
							>
								★
							</Text>
							<Text
								style={{ color: colors.text, fontSize: 12, fontWeight: "700" }}
							>
								{movie.vote_average.toFixed(1)}
							</Text>
						</View>
					)}
					{/* Swipe hint overlay */}
					{isPressing && (
						<View
							style={{
								position: "absolute",
								bottom: 8,
								left: 8,
								right: 8,
								backgroundColor: `${colors.bg}dd`,
								paddingVertical: 4,
								paddingHorizontal: 8,
								borderRadius: 8,
								flexDirection: "row",
								justifyContent: "space-between",
							}}
						>
							<Text style={{ color: colors.neon, fontSize: 10 }}>→ Save</Text>
							<Text style={{ color: "#ff6b6b", fontSize: 10 }}>Dismiss ←</Text>
						</View>
					)}
				</View>
				<Text
					style={{
						color: colors.text,
						fontSize: 14,
						fontWeight: "600",
						marginTop: 8,
					}}
					numberOfLines={2}
				>
					{movie.title}
				</Text>
				{/* Genre badge */}
				{!!(movie.genre_ids && movie.genre_ids[0]) && (
					<Text
						style={{
							color: colors.textDim,
							fontSize: 11,
							marginTop: 4,
						}}
					>
						{GENRE_MAP[movie.genre_ids[0]] || "Movie"}
					</Text>
				)}
			</Pressable>
		</Animated.View>
	);
}

// Track Card Component
function TrackCard({
	track,
	index,
	fadeAnim,
	onPreviewStart,
	onPreviewEnd,
	onSave,
	onDismiss,
}) {
	const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
	const pan = React.useRef(new Animated.ValueXY()).current;
	const [isPressing, setIsPressing] = React.useState(false);

	React.useEffect(() => {
		Animated.spring(scaleAnim, {
			toValue: 1,
			delay: index * 70,
			tension: 50,
			friction: 7,
			useNativeDriver: true,
		}).start();
	}, [index, scaleAnim]);

	const panResponder = React.useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 5,
			onPanResponderGrant: () => {
				pan.setOffset({
					x: pan.x.__getValue(),
					y: pan.y.__getValue(),
				});
			},
			onPanResponderMove: Animated.event([null, { dx: pan.x }], {
				useNativeDriver: false,
			}),
			onPanResponderRelease: (_e, g) => {
				pan.flattenOffset();
				if (g.dx > 100) {
					Animated.timing(pan, {
						toValue: { x: 300, y: 0 },
						duration: 200,
						useNativeDriver: true,
					}).start(() => {
						onSave?.();
						pan.setValue({ x: 0, y: 0 });
					});
				} else if (g.dx < -100) {
					Animated.timing(pan, {
						toValue: { x: -300, y: 0 },
						duration: 200,
						useNativeDriver: true,
					}).start(() => {
						onDismiss?.();
						pan.setValue({ x: 0, y: 0 });
					});
				} else {
					Animated.spring(pan, {
						toValue: { x: 0, y: 0 },
						useNativeDriver: true,
					}).start();
				}
			},
		})
	).current;

	return (
		<Animated.View
			style={{
				transform: [{ scale: scaleAnim }, { translateX: pan.x }],
				opacity: fadeAnim,
			}}
		>
			<Pressable
				onPressIn={() => {
					setIsPressing(true);
					onPreviewStart?.();
				}}
				onPressOut={() => {
					setIsPressing(false);
					onPreviewEnd?.();
				}}
				onPress={() =>
					Linking.openURL(
						track?.external_urls?.spotify ||
							`https://open.spotify.com/track/${track.id}`
					)
				}
				style={{ width: 160 }}
				{...panResponder.panHandlers}
			>
				<View style={{ position: "relative" }}>
					<Image
						source={{ uri: track?.album?.images?.[0]?.url }}
						style={{
							width: 160,
							height: 160,
							borderRadius: 8,
							backgroundColor: colors.surface,
							transform: [{ scale: isPressing ? 0.95 : 1 }],
						}}
						resizeMode="cover"
					/>
					{/* Play overlay */}
					<View
						style={{
							position: "absolute",
							bottom: 8,
							right: 8,
							backgroundColor: colors.neon,
							width: 36,
							height: 36,
							borderRadius: 18,
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Text style={{ color: colors.bg, fontSize: 16, marginLeft: 2 }}>
							▶
						</Text>
					</View>
					{/* Swipe hint overlay */}
					{isPressing && (
						<View
							style={{
								position: "absolute",
								top: 8,
								left: 8,
								right: 8,
								backgroundColor: `${colors.bg}dd`,
								paddingVertical: 4,
								paddingHorizontal: 8,
								borderRadius: 8,
								flexDirection: "row",
								justifyContent: "space-between",
							}}
						>
							<Text style={{ color: colors.neon, fontSize: 10 }}>→ Save</Text>
							<Text style={{ color: "#ff6b6b", fontSize: 10 }}>Dismiss ←</Text>
						</View>
					)}
				</View>
				<Text
					style={{
						color: colors.text,
						fontSize: 14,
						fontWeight: "600",
						marginTop: 8,
					}}
					numberOfLines={1}
				>
					{track.name}
				</Text>
				<Text
					style={{
						color: colors.textDim,
						fontSize: 12,
						marginTop: 2,
					}}
					numberOfLines={1}
				>
					{Array.isArray(track.artists)
						? track.artists.map((a) => a.name).join(", ")
						: ""}
				</Text>
			</Pressable>
		</Animated.View>
	);
}
