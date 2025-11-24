# Implementing Your TensorFlow.js Emotion Model

## Current Status

✅ **App is working with stub implementation**

- Live camera detection runs every 3 seconds
- Returns random emotions for testing
- UI is fixed (160x160 circular camera view)

## To Replace Stub with Your TensorFlow.js Model

### Your Previous Implementation Had Issues:

1. ❌ Used `react-native-fs` (RNFS) - missing dependency
2. ❌ Used `tf.node.decodeImage` - doesn't exist in React Native
3. ❌ Used `Buffer` - not available in React Native

### Recommended Approach:

#### Option 1: Using Expo Image Manipulator (Easiest)

```bash
npm install expo-image-manipulator
```

```javascript
// src/ml/emotionModel.js
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";
import * as ImageManipulator from "expo-image-manipulator";

const EMOTION_LABELS = [
	"angry",
	"happy",
	"sad",
	"surprised",
	"neutral",
	"calm",
	"tired",
];
let model = null;

async function loadModel() {
	if (!model) {
		await tf.ready();
		const modelJson = require("./emotion-model/model.json");
		const modelWeights = [
			require("./emotion-model/group1-shard1of2.bin"),
			require("./emotion-model/group1-shard2of2.bin"),
		];
		model = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
	}
	return model;
}

export async function analyzeEmotionFromImage(filePath) {
	const model = await loadModel();

	// Resize to model input size (adjust 224 to your model's size)
	const manipResult = await ImageManipulator.manipulateAsync(
		`file://${filePath}`,
		[{ resize: { width: 224, height: 224 } }],
		{ format: ImageManipulator.SaveFormat.JPEG }
	);

	// Decode image with expo-image-manipulator
	const response = await fetch(manipResult.uri);
	const imageDataArrayBuffer = await response.arrayBuffer();
	const imageData = new Uint8Array(imageDataArrayBuffer);

	// Create tensor from image
	const imageTensor = tf.tidy(() => {
		// Decode JPEG bytes to RGB pixels
		const decoded = tf.util.decodeImage(imageData, 3);
		// Normalize to [0, 1]
		return decoded.toFloat().div(255.0).expandDims(0);
	});

	// Run model
	const predictions = model.predict(imageTensor);
	const values = await predictions.data();

	// Find max prediction
	let maxIdx = 0;
	let maxVal = values[0];
	for (let i = 1; i < values.length; i++) {
		if (values[i] > maxVal) {
			maxVal = values[i];
			maxIdx = i;
		}
	}

	tf.dispose([imageTensor, predictions]);

	return {
		mood: EMOTION_LABELS[maxIdx],
		confidence: maxVal,
	};
}
```

#### Option 2: Using react-native-image-resizer

```bash
npm install react-native-image-resizer
cd ios && pod install && cd ..
```

```javascript
import ImageResizer from "react-native-image-resizer";
import RNFS from "react-native-fs";

export async function analyzeEmotionFromImage(filePath) {
	// Resize image
	const resized = await ImageResizer.createResizedImage(
		filePath,
		224,
		224,
		"JPEG",
		100
	);

	// Read as base64
	const base64 = await RNFS.readFile(resized.uri, "base64");
	const imageBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

	// Create tensor
	const imageTensor = tf.tidy(() => {
		const decoded = tf.util.decodeImage(imageBytes, 3);
		return decoded.toFloat().div(255.0).expandDims(0);
	});

	// ... rest of inference
}
```

### Model File Setup

Your model files should be in `src/ml/emotion-model/`:

```
src/ml/emotion-model/
├── model.json
├── group1-shard1of2.bin
└── group1-shard2of2.bin
```

### Troubleshooting

**NativeEventEmitter Error:**

- This happens when TensorFlow.js tries to use native modules incorrectly
- Fixed by using the stub version (no TensorFlow.js imports)

**Image Decoding:**

- React Native doesn't have `tf.node.decodeImage`
- Use `tf.util.decodeImage()` instead (available in @tensorflow/tfjs-react-native)

**Performance:**

- First detection will be slow (model loading)
- Subsequent detections should be fast
- Consider reducing image size if too slow

### Testing Your Model

1. Replace `src/ml/emotionModel.js` with one of the implementations above
2. Update `EMOTION_LABELS` to match your model's output order
3. Adjust `INPUT_SIZE` (224, 128, etc.) to match your model
4. Test with `npm start -- --reset-cache`

## Backup of Your Original Implementation

Your original TensorFlow.js code is saved at:
`src/ml/emotionModel.js.backup`

You can reference it but it won't work without fixing the image decoding issues.
