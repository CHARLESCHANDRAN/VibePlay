// src/services/visionApi.js
import config from "../config";

console.log("[visionApi] Full config object:", JSON.stringify(config, null, 2));
console.log(
	"[visionApi] config.VISION_API_ENDPOINT value:",
	config.VISION_API_ENDPOINT
);

const VISION_API_ENDPOINT =
	config.VISION_API_ENDPOINT ||
	"https://my-vision-express-env.eba-39zxiwnb.us-west-2.elasticbeanstalk.com";

console.log(
	"[visionApi] Final VISION_API_ENDPOINT to use:",
	VISION_API_ENDPOINT
);

// Test network connectivity on module load
fetch(`${VISION_API_ENDPOINT}/api/vision/face-emotion`, {
	method: "GET",
	headers: { Accept: "application/json" },
})
	.then((res) => {
		console.log(
			"[visionApi] ✅ Network connectivity test passed - backend is reachable, status:",
			res.status
		);
	})
	.catch((err) => {
		console.error(
			"[visionApi] ❌ Network connectivity test FAILED:",
			err.message
		);
		console.error(
			"[visionApi] Your device may not be able to reach the backend URL"
		);
	});

/**
 * Likelihood levels from Google Cloud Vision API
 */
const LIKELIHOOD_LEVELS = {
	VERY_UNLIKELY: 0,
	UNLIKELY: 1,
	POSSIBLE: 2,
	LIKELY: 3,
	VERY_LIKELY: 4,
	UNKNOWN: 0,
};

/**
 * Convert Google Vision likelihood string to numeric level
 */
function getLikelihoodLevel(likelihood) {
	return LIKELIHOOD_LEVELS[likelihood] || 0;
}

/**
 * Map Google Cloud Vision face annotation to AppEmotion
 * @param {Object} faceAnnotation - Vision API face annotation
 * @returns {{ emotion: string, emoji: string, confidence: number }}
 */
export function mapFaceAnnotationToEmotion(faceAnnotation) {
	const joy = getLikelihoodLevel(faceAnnotation.joyLikelihood);
	const sorrow = getLikelihoodLevel(faceAnnotation.sorrowLikelihood);
	const anger = getLikelihoodLevel(faceAnnotation.angerLikelihood);
	const surprise = getLikelihoodLevel(faceAnnotation.surpriseLikelihood);
	const blurred = getLikelihoodLevel(
		faceAnnotation.blurredLikelihood || "VERY_UNLIKELY"
	);
	const underExp = getLikelihoodLevel(
		faceAnnotation.underExposedLikelihood || "VERY_UNLIKELY"
	);

	let emotion = "neutral";
	let emoji = "😐";
	let confidence = 0;

	// 1) Strong "excited" before "happy"
	// High joy + some surprise => excited
	if (joy >= 3 && surprise >= 2 && sorrow <= 2) {
		emotion = "excited";
		emoji = "🤩";
		confidence = Math.min(joy, surprise) / 4;
	}
	// 2) Primary strong emotions:
	else if (anger >= 3 && anger >= joy && anger >= sorrow && anger >= surprise) {
		emotion = "angry";
		emoji = "😡";
		confidence = anger / 4;
	} else if (joy >= 3 && joy >= anger && joy >= sorrow && joy >= surprise) {
		emotion = "happy";
		emoji = "😀";
		confidence = joy / 4;
	} else if (
		sorrow >= 3 &&
		sorrow >= joy &&
		sorrow >= anger &&
		sorrow >= surprise
	) {
		emotion = "sad";
		emoji = "😢";
		confidence = sorrow / 4;
	} else if (
		surprise >= 3 &&
		surprise >= joy &&
		surprise >= anger &&
		surprise >= sorrow
	) {
		emotion = "surprised";
		emoji = "😲";
		confidence = surprise / 4;
	}
	// 3) Derived emotions:
	// Anxious: low joy, some arousal (anger/surprise), with at least some sorrow
	else if (joy <= 1 && (anger >= 2 || surprise >= 2) && sorrow >= 1) {
		emotion = "anxious";
		emoji = "😰";
		confidence = Math.max(anger, surprise, sorrow) / 4;
	}
	// Tired: low joy, weak emotions overall, but blurry/underexposed
	else if (
		joy <= 1 &&
		anger <= 2 &&
		sorrow <= 2 &&
		surprise <= 2 &&
		(blurred >= 2 || underExp >= 2)
	) {
		emotion = "tired";
		emoji = "😴";
		confidence = Math.max(blurred, underExp) / 4;
	}
	// 4) Calm vs neutral:
	// Calm: all major emotions basically low
	else if (joy <= 1 && sorrow <= 1 && anger <= 1 && surprise <= 1) {
		emotion = "calm";
		emoji = "😌";
		confidence = 0.6; // Medium confidence for calm state
	}
	// Fallback:
	else {
		emotion = "neutral";
		emoji = "😐";
		confidence = 0.5; // Default confidence
	}

	return {
		emotion,
		emoji,
		confidence,
		rawVision: faceAnnotation,
	};
}

/**
 * Send image to backend Vision API for emotion detection
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<{ emotion: string, emoji: string, confidence: number }>}
 */
export async function detectEmotionFromImage(imageBase64) {
	try {
		console.log("[visionApi] Sending image to backend for emotion detection");
		console.log(
			"[visionApi] Endpoint:",
			`${VISION_API_ENDPOINT}/api/vision/face-emotion`
		);

		// Use fetch with explicit timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

		const response = await fetch(
			`${VISION_API_ENDPOINT}/api/vision/face-emotion`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Connection: "close", // Force HTTP/1.1 connection close
				},
				body: JSON.stringify({
					imageBase64,
				}),
				signal: controller.signal,
			}
		);

		clearTimeout(timeoutId);

		console.log("[visionApi] Response status:", response.status);
		console.log("[visionApi] Response headers:", response.headers);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("[visionApi] Error response:", errorText);
			throw new Error(
				`Vision API error: ${response.status} ${response.statusText}`
			);
		}

		const data = await response.json();

		console.log(
			"[visionApi] Full response data:",
			JSON.stringify(data, null, 2)
		);

		// Check if face was detected
		if (!data.joyLikelihood) {
			console.error("[visionApi] No face detected - missing joyLikelihood");
			throw new Error("NO_FACE_DETECTED");
		}

		// Map to app emotion
		const result = mapFaceAnnotationToEmotion(data);

		console.log(
			"[visionApi] Mapped to emotion:",
			result.emotion,
			result.emoji,
			"confidence:",
			result.confidence
		);

		return result;
	} catch (error) {
		console.error("[visionApi] ========== ERROR DETAILS ==========");
		console.error("[visionApi] Error object:", error);
		console.error("[visionApi] Error type:", error.constructor.name);
		console.error("[visionApi] Error message:", error.message);
		console.error("[visionApi] Error name:", error.name);
		console.error("[visionApi] Error stack:", error.stack);
		console.error("[visionApi] Is TypeError?", error instanceof TypeError);
		console.error("[visionApi] Is AbortError?", error.name === "AbortError");
		console.error(
			"[visionApi] Is network error?",
			error.message.includes("Network")
		);
		console.error("[visionApi] =====================================");

		if (error.message === "NO_FACE_DETECTED") {
			throw new Error("NO_FACE_DETECTED");
		}

		if (error.name === "AbortError") {
			throw new Error("Request timeout - backend took too long to respond");
		}

		throw new Error("VISION_API_ERROR");
	}
}
