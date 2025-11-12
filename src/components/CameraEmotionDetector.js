import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { colors } from '../theme/colors';

// Emotion labels matching the model output
const EMOTION_LABELS = ['angry', 'happy', 'sad', 'surprised', 'neutral', 'calm', 'tired'];

// Map model emotions to app mood keys
const EMOTION_TO_MOOD = {
  'angry': 'angry',
  'happy': 'happy',
  'sad': 'sad',
  'surprised': 'surprised',
  'neutral': 'neutral',
  'calm': 'calm',
  'tired': 'tired',
  'fear': 'anxious', // Map fear to anxious
  'disgust': 'angry', // Map disgust to angry
};

/**
 * CameraEmotionDetector - Camera with simulated emotion detection
 * Note: TFLite integration incomplete - react-native-fast-tflite native module not registering
 */
export default function CameraEmotionDetector({ onMoodDetected, isActive }) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const camera = useRef(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Camera Permission Required',
          'VibePlay needs camera access to detect your mood. Please enable camera permission in settings.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Simulate emotion detection (TFLite integration pending)
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      const randomEmotion = EMOTION_LABELS[Math.floor(Math.random() * EMOTION_LABELS.length)];
      const mood = EMOTION_TO_MOOD[randomEmotion] || randomEmotion;
      setCurrentEmotion(randomEmotion);
      if (onMoodDetected) {
        onMoodDetected(mood, 0.85);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive, onMoodDetected]);

  useEffect(() => {
    setIsAnalyzing(isActive && hasPermission && device != null);
  }, [isActive, hasPermission, device]);

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionMessage}>
          Allow camera access to detect your mood automatically
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>⚠️</Text>
        <Text style={styles.permissionTitle}>No Camera Found</Text>
        <Text style={styles.permissionMessage}>
          Your device's front camera couldn't be accessed
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={isActive}
        photo={false}
        video={false}
      />
      
      {/* Face detection overlay */}
      <View style={styles.overlay}>
        <View style={styles.faceFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        
        {isAnalyzing && (
          <View style={styles.statusBadge}>
            <View style={styles.pulsingDot} />
            <Text style={styles.statusText}>
              {currentEmotion ? `Detecting: ${currentEmotion}` : 'Analyzing...'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceFrame: {
    width: 160,
    height: 160,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.neon,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 8,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neon,
    marginRight: 8,
  },
  statusText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  permissionContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 48,
    marginBottom: 12,
  },
  permissionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionMessage: {
    color: colors.textDim,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  permissionButton: {
    backgroundColor: colors.neon,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
});
