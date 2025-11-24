import Config from "../config";

const BASE = "https://api.themoviedb.org/3";

export async function discoverMovies(params) {
	try {
		const queryParams = {
			api_key: Config.TMDB_API_KEY,
			include_adult: "false",
			...params,
		};

		if (!Config.TMDB_API_KEY) {
			throw new Error("TMDb API key is missing");
		}

		const queryString = Object.entries(queryParams)
			.map(
				([key, value]) =>
					`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
			)
			.join("&");

		const url = `${BASE}/discover/movie?${queryString}`;
		const res = await fetch(url);

		if (!res.ok) {
			if (res.status === 401) {
				throw new Error("Invalid TMDb API key");
			} else if (res.status === 404) {
				throw new Error("Movie service not found");
			} else if (res.status === 429) {
				throw new Error("Too many requests. Please try again later");
			} else if (res.status >= 500) {
				throw new Error("Movie service is having issues. Try again later");
			} else {
				throw new Error("Failed to fetch movies");
			}
		}

		const json = await res.json();
		return json.results || [];
	} catch (error) {
		console.error("TMDb error:", error);
		throw new Error(error.message || "Unable to load movie recommendations");
	}
}
