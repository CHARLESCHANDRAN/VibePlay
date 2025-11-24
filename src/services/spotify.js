// services/spotify.js
import Config from "../config";

const DEFAULT_GENRES = ["pop", "rock", "hip-hop"]; // valid Spotify genre seeds

function trimTrailingSlash(s = "") {
	return s.replace(/\/+$/, "");
}

// Keep only defined, non-empty values
function norm(v) {
	if (v === undefined || v === null) return undefined;
	const s = String(v).trim();
	return s.length ? s : undefined;
}

// Split csv string -> array of trimmed unique values
function splitCSV(v) {
	if (!v) return [];
	return String(v)
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}

// Cap total seeds to <= 5 (Spotify requirement)
function capSeeds({ artists, tracks, genres }) {
	let remaining = 5;
	const a = artists.slice(0, remaining);
	remaining -= a.length;
	const t = tracks.slice(0, remaining);
	remaining -= t.length;
	const g = genres.slice(0, remaining);
	return { a, t, g };
}

// Build querystring safely
function buildQS(paramsObj) {
	const entries = Object.entries(paramsObj).filter(([_, v]) => v !== undefined);
	return entries
		.map(
			([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
		)
		.join("&");
}

// Optional: 10s timeout so UI doesn't hang
function withTimeout(promise, ms = 10000) {
	let t;
	const timeout = new Promise((_, rej) => {
		t = setTimeout(() => rej(new Error("Request timed out")), ms);
	});
	return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

/**
 * Call /recommendations via your proxy.
 * Expect Config.SPOTIFY_PROXY_BASE to be like:
 *   https://<service>.onrender.com/api/spotify
 */
export async function getRecommendations(features = {}) {
	try {
		const base = trimTrailingSlash(Config.SPOTIFY_PROXY_BASE || "");
		if (!base) {
			console.error("SPOTIFY_PROXY_BASE is missing in Config");
			return [];
		}

		// --- Normalize seeds from features ---
		// Accept either arrays or comma-separated strings
		const seed_artists_in = features.seed_artists ?? features.seedArtists;
		const seed_tracks_in = features.seed_tracks ?? features.seedTracks;
		const seed_genres_in = features.seed_genres ?? features.seedGenres;

		const artistsArr = Array.isArray(seed_artists_in)
			? seed_artists_in
			: splitCSV(seed_artists_in);
		const tracksArr = Array.isArray(seed_tracks_in)
			? seed_tracks_in
			: splitCSV(seed_tracks_in);
		const genresArr = Array.isArray(seed_genres_in)
			? seed_genres_in
			: splitCSV(seed_genres_in);

		// If no seeds provided, fallback to valid genre seeds
		if (artistsArr.length + tracksArr.length + genresArr.length === 0) {
			genresArr.push(...DEFAULT_GENRES);
		}

		// Enforce ≤5 seeds total
		const { a, t, g } = capSeeds({
			artists: artistsArr,
			tracks: tracksArr,
			genres: genresArr,
		});

		// ---- Build params ----
		const params = {
			// Seeds
			...(a.length ? { seed_artists: a.join(",") } : {}),
			...(t.length ? { seed_tracks: t.join(",") } : {}),
			...(g.length ? { seed_genres: g.join(",") } : {}),

			// Optional tunables & extras (pass through if present)
			market: norm(features.market),
			limit: norm(features.limit ?? 20),

			// Tunable attributes (only include if defined)
			target_acousticness: norm(features.target_acousticness),
			target_danceability: norm(features.target_danceability),
			target_energy: norm(features.target_energy),
			target_instrumentalness: norm(features.target_instrumentalness),
			target_liveness: norm(features.target_liveness),
			target_loudness: norm(features.target_loudness),
			target_speechiness: norm(features.target_speechiness),
			target_tempo: norm(features.target_tempo),
			target_valence: norm(features.target_valence),

			min_acousticness: norm(features.min_acousticness),
			max_acousticness: norm(features.max_acousticness),
			min_danceability: norm(features.min_danceability),
			max_danceability: norm(features.max_danceability),
			min_energy: norm(features.min_energy),
			max_energy: norm(features.max_energy),
			min_instrumentalness: norm(features.min_instrumentalness),
			max_instrumentalness: norm(features.max_instrumentalness),
			min_liveness: norm(features.min_liveness),
			max_liveness: norm(features.max_liveness),
			min_loudness: norm(features.min_loudness),
			max_loudness: norm(features.max_loudness),
			min_popularity: norm(features.min_popularity),
			max_popularity: norm(features.max_popularity),
			min_speechiness: norm(features.min_speechiness),
			max_speechiness: norm(features.max_speechiness),
			min_tempo: norm(features.min_tempo),
			max_tempo: norm(features.max_tempo),
			min_valence: norm(features.min_valence),
			max_valence: norm(features.max_valence),
		};

		const qs = buildQS(params);
		const url = `${base}/recommendations${qs ? `?${qs}` : ""}`;
		console.log("Fetching Spotify recommendations from:", url);

		const res = await withTimeout(fetch(url), 10000);

		// Read error payload with detail, then throw
		if (!res.ok) {
			const text = await res.text();
			console.error("Spotify proxy error:", res.status, text);

			// Provide user-friendly error messages
			if (res.status === 404) {
				throw new Error("Music service temporarily unavailable");
			} else if (res.status === 429) {
				throw new Error("Too many requests. Please try again in a moment");
			} else if (res.status >= 500) {
				throw new Error("Music service is having issues. Try again later");
			} else {
				throw new Error("Failed to fetch music recommendations");
			}
		}

		const data = await res.json();
		console.log("Spotify response:", data);
		return Array.isArray(data?.tracks) ? data.tracks : [];
	} catch (error) {
		console.error("Spotify service error:", error);
		// Re-throw with user-friendly message
		throw new Error(error.message || "Unable to load music recommendations");
	}
}

/**
 * Optional helper to hydrate a genre picker in the app.
 */
export async function getAvailableGenreSeeds() {
	try {
		const base = trimTrailingSlash(Config.SPOTIFY_PROXY_BASE || "");
		if (!base) return DEFAULT_GENRES;

		const res = await withTimeout(
			fetch(`${base}/available-genre-seeds`),
			10000
		);
		if (!res.ok) return DEFAULT_GENRES;

		const json = await res.json();
		const arr = Array.isArray(json?.genres) ? json.genres : [];
		return arr.length ? arr : DEFAULT_GENRES;
	} catch {
		return DEFAULT_GENRES;
	}
}
