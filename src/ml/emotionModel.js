// src/ml/emotionModel.js
// TensorFlow.js emotion detection for React Native (VibePlay)

import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { bundleResourceIO, decodeJpeg } from "@tensorflow/tfjs-react-native";

// 1️⃣ Labels: EXACT order from training (Detector_In_Action.py)
// {0: "Angry", 1: "Disgusted", 2: "Fearful", 3: "Happy", 4: "Neutral", 5: "Sad", 6: "Surprised"}
const EMOTION_LABELS = [
	"angry", // 0
	"disgusted", // 1
	"fearful", // 2
	"happy", // 3
	"neutral", // 4
	"sad", // 5
	"surprised", // 6
];

// 2️⃣ Map model labels → app mood keys
const EMOTION_TO_MOOD = {
	angry: "angry",
	disgusted: "angry", // map disgusted to angry
	fearful: "anxious", // map fearful to anxious
	happy: "happy",
	neutral: "neutral",
	sad: "sad",
	surprised: "surprised",
};

// 3️⃣ Set to the input size your model expects (48x48 grayscale)
const INPUT_SIZE = 48;

let modelPromise = null;

async function loadModel() {
	if (!modelPromise) {
		modelPromise = (async () => {
			await tf.ready();
			console.log("[emotionModel] backend:", tf.getBackend());

			try {
				const modelJson = require("./emotion-model/model.json");
				const modelWeights = [
					require("./emotion-model/group1-shard1of2.bin"),
					require("./emotion-model/group1-shard2of2.bin"),
				];

				console.log("[emotionModel] loading graph model...");
				const model = await tf.loadGraphModel(
					bundleResourceIO(modelJson, modelWeights)
				);
				console.log("[emotionModel] model loaded");
				return model;
			} catch (e) {
				console.error("[emotionModel] loadGraphModel failed", e);
				throw e;
			}
		})();
	}
	return modelPromise;
}

/**
 * Analyze a face image and return { mood, confidence }.
 * @param {string} filePath - VisionCamera photo.path or photo.uri
 */
export async function analyzeEmotionFromImage(filePath) {
	console.log("[emotionModel] analyzing image:", filePath);

	// Add timeout to prevent infinite hanging
	const timeout = new Promise((_, reject) =>
		setTimeout(
			() => reject(new Error("Analysis timeout - took too long")),
			15000
		)
	);

	try {
		const model = await loadModel();
		console.log("[emotionModel] model ready");

		// Ensure we have a file:// URI for fetch
		const uri = filePath.startsWith("file://")
			? filePath
			: `file://${filePath}`;

		// 1) Read raw bytes
		console.log("[emotionModel] fetching image...");
		const response = await fetch(uri);
		const arrayBuffer = await response.arrayBuffer();
		const imageData = new Uint8Array(arrayBuffer);
		console.log("[emotionModel] image loaded, size:", imageData.length);

		// 2) Decode JPEG as RGB
		console.log("[emotionModel] decoding JPEG...");
		const decoded = decodeJpeg(imageData, 3);
		console.log("[emotionModel] decoded shape:", decoded.shape);

		// 3) OPTIMIZE: Resize FIRST (huge image causes grayscale conversion to hang)
		console.log("[emotionModel] preprocessing...");
		const input = tf.tidy(() => {
			// Resize RGB image to 48x48 first (much faster than processing full size)
			const resizedRGB = tf.image.resizeBilinear(
				decoded.expandDims(0), // [1, H, W, 3]
				[INPUT_SIZE, INPUT_SIZE]
			); // [1, 48, 48, 3]

			// Squeeze to remove batch: [1, 48, 48, 3] → [48, 48, 3]
			const rgb48 = resizedRGB.squeeze([0]);

			// Split and convert to grayscale: 0.299*R + 0.587*G + 0.114*B
			const [r, g, b] = tf.split(rgb48, 3, 2); // Each is [48, 48, 1]
			const grayscale = r.mul(0.299).add(g.mul(0.587)).add(b.mul(0.114)); // [48, 48, 1]

			// Add batch dim: [48, 48, 1] → [1, 48, 48, 1]
			const batchedGrayscale = grayscale.expandDims(0);

			// Normalize: pixel values / 255
			return batchedGrayscale.div(255.0);
		});
		console.log("[emotionModel] input shape:", input.shape);

		// 4) Run inference
		console.log("[emotionModel] running prediction...");
		const predictions = await Promise.race([model.predict(input), timeout]);
		console.log("[emotionModel] prediction complete");

		// 5) Get results
		const values = await predictions.data();
		console.log("[emotionModel] raw predictions:", values);

		let maxIdx = 0;
		let maxVal = values[0];
		for (let i = 1; i < values.length; i++) {
			if (values[i] > maxVal) {
				maxVal = values[i];
				maxIdx = i;
			}
		}

		const rawLabel = EMOTION_LABELS[maxIdx] || "neutral";
		const mood = EMOTION_TO_MOOD[rawLabel] || rawLabel || "neutral";
		const confidence = maxVal;

		// Debug: log all predictions
		console.log("[emotionModel] All predictions:");
		EMOTION_LABELS.forEach((label, idx) => {
			console.log(`  ${label}: ${(values[idx] * 100).toFixed(1)}%`);
		});

		// Cleanup
		tf.dispose([decoded, input, predictions]);

		console.log(
			`[emotionModel] Detected: ${mood} (${(confidence * 100).toFixed(1)}%)`
		);
		return { mood, confidence };
	} catch (error) {
		console.error("[emotionModel] Error:", error.message);
		console.error("[emotionModel] Stack:", error.stack);

		// Return neutral mood on error instead of throwing
		return {
			mood: "neutral",
			confidence: 0.5,
			error: error.message,
		};
	}
}

// Also export default, so both import styles work
export default {
	analyzeEmotionFromImage,
};
