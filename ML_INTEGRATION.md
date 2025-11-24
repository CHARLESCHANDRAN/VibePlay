# Emotion Detection - ML Integration Guide

## Current Status

The app currently uses a **simulated emotion detector** that cycles through moods. The camera preview is functional and ready for ML integration.

## Components

- ✅ **CameraEmotionDetector.js** - VisionCamera component with face detection overlay
- ✅ **useEmotionDetector.js** - Hook for emotion detection (currently stubbed)
- ✅ **Camera permissions** - Already configured for iOS & Android

---

## How to Add Real ML Emotion Detection

### Option 1: TensorFlow Lite (Recommended)

Use TensorFlow Lite for on-device emotion classification.

#### 1. Install Dependencies

```bash
npm install react-native-fast-tflite
npm install react-native-worklets-core  # Already installed
```

#### 2. Add TFLite Emotion Model

Download a pre-trained emotion recognition model:

- FER-2013 emotion model (happy, sad, angry, neutral, surprised, etc.)
- Convert to `.tflite` format
- Place in `assets/models/emotion-model.tflite`

#### 3. Update CameraEmotionDetector.js

Add frame processor to analyze each camera frame:

```javascript
import { useTensorflowModel } from "react-native-fast-tflite";
import { useFrameProcessor } from "react-native-vision-camera";
import { runOnJS } from "react-native-reanimated";

const model = useTensorflowModel(
	require("../assets/models/emotion-model.tflite")
);

const frameProcessor = useFrameProcessor(
	(frame) => {
		"worklet";
		if (model != null) {
			const outputs = model.run(frame);
			const emotion = detectEmotion(outputs); // Parse model output
			runOnJS(onMoodDetected)(emotion.label, emotion.confidence);
		}
	},
	[model, onMoodDetected]
);

// In Camera component:
<Camera frameProcessor={frameProcessor} {...otherProps} />;
```

---

### Option 2: Google ML Kit (Alternative)

Use Firebase ML Kit for face detection + expression analysis.

```bash
npm install @react-native-firebase/ml-vision
```

Then use face detection API to analyze expressions.

---

### Option 3: Cloud-Based (Simpler but requires internet)

Use Azure Face API or AWS Rekognition:

```javascript
async function analyzeFrame(base64Image) {
	const response = await fetch("https://api.azure.com/face/detect", {
		method: "POST",
		body: JSON.stringify({ image: base64Image }),
		headers: { "Ocp-Apim-Subscription-Key": "YOUR_KEY" },
	});
	const data = await response.json();
	return data.faceAttributes.emotion; // { happiness: 0.9, sadness: 0.1, ... }
}
```

---

## Integration Steps

### 1. Replace `useEmotionDetector` stub:

```javascript
// src/hooks/useEmotionDetector.js
export function useEmotionDetector(active) {
	const [mood, setMood] = useState("neutral");
	const [confidence, setConfidence] = useState(0.0);

	// This will be called by CameraEmotionDetector's frame processor
	const onDetection = useCallback((detectedMood, conf) => {
		setMood(detectedMood);
		setConfidence(conf);
	}, []);

	return { mood, confidence, onDetection };
}
```

### 2. Update CameraEmotionDetector to process frames:

Add the frame processor logic to analyze each frame and call `onMoodDetected` callback.

### 3. Map model outputs to app moods:

Ensure model outputs (e.g., "happy", "sad", "angry") match your `MOOD_DATA` keys in `CaptureMood.js`.

---

## Testing Without ML Model

The current stub implementation works great for:

- ✅ Demo purposes
- ✅ UI/UX testing
- ✅ Flow validation
- ✅ Hackathon presentations

Once you're ready for production, swap in real ML detection!

---

## Performance Considerations

- Run ML inference at **5-10 FPS** (not every frame - too CPU intensive)
- Use lower resolution for face detection (640x480 is sufficient)
- Consider debouncing emotion changes to avoid jitter
- Cache model in memory (don't reload on each frame)

---

## Model Resources

- **FER-2013**: https://www.kaggle.com/datasets/msambare/fer2013
- **AffectNet**: https://www.tensorflow.org/lite/examples/style_transfer/overview
- **Pre-trained TFLite models**: https://tfhub.dev/

---

Questions? The camera is ready - just plug in your ML model! 🚀
