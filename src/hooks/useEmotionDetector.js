import { useState, useCallback } from 'react';

/**
 * useEmotionDetector - Emotion detection hook
 * 
 * Now integrated with real TFLite model via CameraEmotionDetector.
 * The camera component calls onMoodDetected callback with detected emotions.
 */
export function useEmotionDetector(active) {
  const [mood, setMood] = useState('neutral');
  const [confidence, setConfidence] = useState(0.0);

  // This callback is called by CameraEmotionDetector when emotion is detected
  const onMoodDetected = useCallback((detectedMood, conf) => {
    setMood(detectedMood);
    setConfidence(conf);
  }, []);

  return { mood, confidence, onMoodDetected };
}