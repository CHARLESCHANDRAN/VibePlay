# Vision API Backend Setup Guide

The app is currently running in **DEMO MODE** for emotion detection. To enable real Google Cloud Vision API integration, you need to set up a backend proxy.

## Why a Backend Proxy?

Google Cloud Vision API requires an API key that should **never** be exposed in mobile apps. A backend proxy:

- Keeps your API key secure
- Handles authentication with Google Cloud
- Processes the Vision API response
- Returns only the emotion data to the mobile app

## Quick Setup Options

### Option 1: Node.js Backend (Recommended for Hackathon)

Create a simple Express server:

```javascript
// server.js
const express = require("express");
const vision = require("@google-cloud/vision");
const app = express();

app.use(express.json({ limit: "10mb" }));

// Initialize Vision API client
const client = new vision.ImageAnnotatorClient({
	keyFilename: "./google-cloud-key.json", // Your service account key
});

app.post("/api/vision/face-emotion", async (req, res) => {
	try {
		const { imageBase64 } = req.body;

		// Remove data URI prefix if present
		const base64Image = imageBase64.replace(/^data:image\/\w+;base64,/, "");

		// Call Vision API
		const [result] = await client.faceDetection({
			image: { content: base64Image },
		});

		const faces = result.faceAnnotations;

		if (!faces || faces.length === 0) {
			return res.status(400).json({ error: "NO_FACE_DETECTED" });
		}

		// Return first face's emotion data
		const face = faces[0];
		res.json({
			joyLikelihood: face.joyLikelihood,
			sorrowLikelihood: face.sorrowLikelihood,
			angerLikelihood: face.angerLikelihood,
			surpriseLikelihood: face.surpriseLikelihood,
			blurredLikelihood: face.blurredLikelihood,
			underExposedLikelihood: face.underExposedLikelihood,
		});
	} catch (error) {
		console.error("Vision API error:", error);
		res.status(500).json({ error: "VISION_API_ERROR" });
	}
});

app.listen(3000, () => {
	console.log("Vision API proxy running on port 3000");
});
```

**Install dependencies:**

```bash
npm install express @google-cloud/vision
```

**Deploy to:**

- Render.com (free tier)
- Railway.app (free tier)
- Vercel (serverless)
- Your own server

### Option 2: Cloudflare Workers (Serverless)

```javascript
// worker.js
export default {
	async fetch(request) {
		if (request.method !== "POST") {
			return new Response("Method not allowed", { status: 405 });
		}

		const { imageBase64 } = await request.json();

		const response = await fetch(
			`https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					requests: [
						{
							image: {
								content: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
							},
							features: [{ type: "FACE_DETECTION", maxResults: 1 }],
						},
					],
				}),
			}
		);

		const data = await response.json();

		if (data.responses[0].faceAnnotations) {
			const face = data.responses[0].faceAnnotations[0];
			return Response.json({
				joyLikelihood: face.joyLikelihood,
				sorrowLikelihood: face.sorrowLikelihood,
				angerLikelihood: face.angerLikelihood,
				surpriseLikelihood: face.surpriseLikelihood,
			});
		}

		return Response.json({ error: "NO_FACE_DETECTED" }, { status: 400 });
	},
};
```

### Option 3: Python Flask Backend

```python
# app.py
from flask import Flask, request, jsonify
from google.cloud import vision
import base64

app = Flask(__name__)
client = vision.ImageAnnotatorClient()

@app.route('/api/vision/face-emotion', methods=['POST'])
def detect_emotion():
    data = request.get_json()
    image_base64 = data['imageBase64']

    # Remove data URI prefix
    if image_base64.startswith('data:'):
        image_base64 = image_base64.split(',')[1]

    image = vision.Image(content=base64.b64decode(image_base64))
    response = client.face_detection(image=image)
    faces = response.face_annotations

    if not faces:
        return jsonify({'error': 'NO_FACE_DETECTED'}), 400

    face = faces[0]
    return jsonify({
        'joyLikelihood': face.joy_likelihood.name,
        'sorrowLikelihood': face.sorrow_likelihood.name,
        'angerLikelihood': face.anger_likelihood.name,
        'surpriseLikelihood': face.surprise_likelihood.name
    })

if __name__ == '__main__':
    app.run(port=3000)
```

## Google Cloud Vision Setup

1. **Create Google Cloud Project**: https://console.cloud.google.com
2. **Enable Vision API**: Search for "Cloud Vision API" and enable it
3. **Create API Key** or **Service Account**:
   - For Cloudflare Workers: Use API key
   - For Node.js/Python: Use service account JSON key
4. **Set Usage Limits**: Vision API has free tier (1000 requests/month)

## Update .env File

Once your backend is deployed, update `.env`:

```env
VISION_API_ENDPOINT=https://your-backend-url.com
```

Examples:

- `https://vibeplay-vision.onrender.com`
- `https://vibeplay-vision.cloudflare.workers.dev`
- `http://192.168.1.100:3000` (local testing)

## Enable Production Mode

In `src/services/visionApi.js`:

1. Comment out the DEMO MODE code
2. Uncomment the PRODUCTION CODE section
3. The app will now use real Vision API

## Testing the Backend

```bash
# Test with curl
curl -X POST https://your-backend-url.com/api/vision/face-emotion \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"data:image/jpeg;base64,/9j/4AAQ..."}'
```

Expected response:

```json
{
	"joyLikelihood": "VERY_LIKELY",
	"sorrowLikelihood": "VERY_UNLIKELY",
	"angerLikelihood": "UNLIKELY",
	"surpriseLikelihood": "POSSIBLE"
}
```

## For Now: Demo Mode Works!

The app is fully functional in demo mode:

- Camera opens ✅
- Countdown works ✅
- Photo captures ✅
- Random emotion detected ✅
- UI updates correctly ✅

Perfect for testing the flow during your hackathon!
