import React from 'react';
import { Pressable, Text } from 'react-native';
import { styles } from '../theme/styles';

export default function NeonButton({label,onPress,style}){
  return (
    <Pressable onPress={onPress} style={[styles.buttonPrimary, style]}>
      <Text style={styles.buttonTextDark}>{label}</Text>
    </Pressable>
  );
}
