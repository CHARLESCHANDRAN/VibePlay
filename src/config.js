// Configuration for API keys and endpoints
// Loaded from .env file using react-native-dotenv

import { TMDB_API_KEY, SPOTIFY_PROXY_BASE, VISION_API_ENDPOINT } from "@env";

export default {
	TMDB_API_KEY: TMDB_API_KEY || "", // Load from .env
	SPOTIFY_PROXY_BASE: SPOTIFY_PROXY_BASE || "", // Load from .env
	VISION_API_ENDPOINT: VISION_API_ENDPOINT || "https://vision.googleapis.com",
};
