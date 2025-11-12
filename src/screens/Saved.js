import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { styles } from '../theme/styles';
import { colors } from '../theme/colors';

export default function Saved(){
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.bg}}>
      <View style={styles.screen}>
        <Text style={styles.h1}>Saved</Text>
        <Text style={styles.p}>Your liked items will appear here (stub).</Text>
      </View>
    </SafeAreaView>
  );
}
