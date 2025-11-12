import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { styles } from '../theme/styles';
import { colors } from '../theme/colors';

export default function RecommendationCard({title,subtitle,poster,onPlay,onSave}){
  return (
    <View style={[styles.card,{marginBottom:16}]}>
      {poster ? <Image source={{uri:poster}} style={{height:170,borderRadius:14,marginBottom:12}} /> : null}
      <Text style={{color:colors.text, fontSize:18, fontWeight:'700'}}>{title}</Text>
      {subtitle ? <Text style={{color:colors.textDim, marginTop:4}}>{subtitle}</Text> : null}
      <View style={[styles.row,{gap:12, marginTop:12}]}>
        <Pressable onPress={onPlay} style={styles.buttonPrimary}><Text style={styles.buttonTextDark}>Play</Text></Pressable>
        <Pressable onPress={onSave} style={styles.buttonSecondary}><Text style={styles.buttonText}>Save</Text></Pressable>
      </View>
    </View>
  );
}
