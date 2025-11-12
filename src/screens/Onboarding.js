import React from 'react';
import { View, Text, SafeAreaView, ImageBackground, StyleSheet, Pressable } from 'react-native';
import { styles } from '../theme/styles';
import { colors } from '../theme/colors';

export default function Onboarding({ navigation }){
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.bg}}>
      <View style={netflixStyles.container}>
        {/* Header */}
        <View style={netflixStyles.header}>
          <Text style={netflixStyles.logo}>VIBEPLAY</Text>
        </View>

        {/* Hero Section */}
        <View style={netflixStyles.hero}>
          <View style={netflixStyles.heroContent}>
            <Text style={netflixStyles.heroTitle}>Movies & Music</Text>
            <Text style={netflixStyles.heroSubtitle}>Based on Your Mood</Text>
            <Text style={netflixStyles.heroDescription}>
              AI-powered recommendations that match how you feel
            </Text>

            {/* Main CTA Buttons */}
            <View style={netflixStyles.ctaContainer}>
              <Pressable 
                style={netflixStyles.primaryButton}
                onPress={()=> navigation.navigate('CaptureMood')}
              >
                <Text style={netflixStyles.primaryButtonText}>▶  Start with Mood Capture</Text>
              </Pressable>

              <Pressable 
                style={netflixStyles.secondaryButton}
                onPress={()=> navigation.navigate('Intent')}
              >
                <Text style={netflixStyles.secondaryButtonText}>Browse Manually</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Feature Pills */}
        <View style={netflixStyles.features}>
          <View style={netflixStyles.featurePill}>
            <Text style={netflixStyles.featureText}>🎭 Mood Detection</Text>
          </View>
          <View style={netflixStyles.featurePill}>
            <Text style={netflixStyles.featureText}>🎬 Movies</Text>
          </View>
          <View style={netflixStyles.featurePill}>
            <Text style={netflixStyles.featureText}>🎵 Music</Text>
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={netflixStyles.footer}>
          <Text style={netflixStyles.footerText}>
            🔒 Privacy First: All detection happens on your device
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const netflixStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.neon,
    letterSpacing: 2,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.neon,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 18,
    color: colors.textDim,
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 320,
  },
  ctaContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.neon,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: colors.neon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: colors.bg,
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexWrap: 'wrap',
  },
  featurePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  featureText: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textDim,
    fontSize: 12,
    textAlign: 'center',
  },
});
