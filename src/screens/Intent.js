import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, SafeAreaView, ScrollView, Animated, Dimensions } from 'react-native';
import { styles } from '../theme/styles';
import { colors } from '../theme/colors';
import { useStore } from '../state/store';

const { width } = Dimensions.get('window');

// Mood emoji mapping
const MOOD_EMOJI = {
  happy: '😄',
  sad: '😔',
  angry: '😤',
  surprised: '😮',
  neutral: '😐',
  tired: '🥱',
  anxious: '😰',
  calm: '😌',
  excited: '🤩'
};

export default function Intent({ navigation }){
  const { mood, intent, setIntent } = useStore();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const keepScale = useRef(new Animated.Value(1)).current;
  const shiftScale = useRef(new Animated.Value(1)).current;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Pulse animation for selected card
  useEffect(() => {
    if (intent === 'keep') {
      Animated.sequence([
        Animated.spring(keepScale, {
          toValue: 1.02,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(keepScale, {
          toValue: 1,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        })
      ]).start();
    } else if (intent === 'shift') {
      Animated.sequence([
        Animated.spring(shiftScale, {
          toValue: 1.02,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(shiftScale, {
          toValue: 1,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [intent]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.bg}}>
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingHorizontal: 20,
          }}
        >
          {/* Top Navigation */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 16,
            paddingBottom: 12,
          }}>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: '300' }}>✕</Text>
            </Pressable>
            <View style={{
              padding: 8,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.neon,
            }}>
              <Text style={{ fontSize: 28 }}>
                {MOOD_EMOJI[mood] || '😐'}
              </Text>
            </View>
          </View>

          {/* Hero Section */}
          <View style={{
            alignItems: 'center',
            paddingVertical: 40,
          }}>
            <Text style={{
              color: colors.textDim,
              fontSize: 14,
              fontWeight: '600',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              Choose Your Path
            </Text>

            <Text style={{
              color: colors.text,
              fontSize: 36,
              fontWeight: '700',
              marginBottom: 12,
              textAlign: 'center',
            }}>
              Stay or Shift?
            </Text>

            <Text style={{
              color: colors.textDim,
              fontSize: 16,
              textAlign: 'center',
              lineHeight: 24,
            }}>
              Currently feeling <Text style={{ color: colors.neon, fontWeight: '700' }}>{mood}</Text>
            </Text>
          </View>

          {/* Intent Cards */}
          <View style={{ marginBottom: 32 }}>
            {/* Keep Card */}
            <Animated.View style={{ transform: [{ scale: keepScale }] }}>
              <Pressable 
                onPress={() => setIntent('keep')}
                style={{
                  backgroundColor: intent === 'keep' ? 'rgba(192, 255, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 20,
                  padding: 24,
                  borderWidth: 3,
                  borderColor: intent === 'keep' ? colors.neon : 'rgba(255, 255, 255, 0.1)',
                  marginBottom: 16,
                  shadowColor: intent === 'keep' ? colors.neon : 'transparent',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: intent === 'keep' ? colors.neon : 'rgba(255,255,255,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}>
                    <Text style={{ fontSize: 24 }}>🎯</Text>
                  </View>
                  <Text style={{
                    color: intent === 'keep' ? colors.neon : colors.text,
                    fontWeight: '700',
                    fontSize: 22,
                    flex: 1,
                  }}>
                    Keep this vibe
                  </Text>
                  {intent === 'keep' && (
                    <View style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: colors.neon,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{ color: colors.bg, fontSize: 18, fontWeight: '700' }}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={{
                  color: intent === 'keep' ? colors.text : colors.textDim,
                  fontSize: 15,
                  lineHeight: 22,
                }}>
                  Discover more content that matches your current emotional state. Stay in the zone.
                </Text>
              </Pressable>
            </Animated.View>

            {/* Shift Card */}
            <Animated.View style={{ transform: [{ scale: shiftScale }] }}>
              <Pressable 
                onPress={() => setIntent('shift')}
                style={{
                  backgroundColor: intent === 'shift' ? 'rgba(156, 91, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 20,
                  padding: 24,
                  borderWidth: 3,
                  borderColor: intent === 'shift' ? colors.purple : 'rgba(255, 255, 255, 0.1)',
                  shadowColor: intent === 'shift' ? colors.purple : 'transparent',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: intent === 'shift' ? colors.purple : 'rgba(255,255,255,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}>
                    <Text style={{ fontSize: 24 }}>✨</Text>
                  </View>
                  <Text style={{
                    color: intent === 'shift' ? colors.purple : colors.text,
                    fontWeight: '700',
                    fontSize: 22,
                    flex: 1,
                  }}>
                    Change my vibe
                  </Text>
                  {intent === 'shift' && (
                    <View style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: colors.purple,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{ color: colors.bg, fontSize: 18, fontWeight: '700' }}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={{
                  color: intent === 'shift' ? colors.text : colors.textDim,
                  fontSize: 15,
                  lineHeight: 22,
                }}>
                  Transform your mood with uplifting or calming content. Boost energy, lighten up, or wind down.
                </Text>
              </Pressable>
            </Animated.View>
          </View>

          {/* CTA Button */}
          <View style={{ paddingBottom: 40 }}>
            <Pressable
              onPress={() => navigation.navigate('Recommendations')}
              disabled={!intent}
              style={{
                backgroundColor: intent ? colors.neon : 'rgba(255, 255, 255, 0.1)',
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                shadowColor: intent ? colors.neon : 'transparent',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
              }}
            >
              <Text style={{
                color: intent ? colors.bg : colors.textDim,
                fontSize: 18,
                fontWeight: '700',
                letterSpacing: 1,
              }}>
                {intent ? 'Get Recommendations' : 'Select an Option'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
