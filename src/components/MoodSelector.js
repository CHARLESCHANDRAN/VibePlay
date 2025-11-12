import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { styles } from '../theme/styles';
import { useStore } from '../state/store';

const EMOJI = {
  happy:'😄', sad:'😔', angry:'😤', surprised:'😮', neutral:'😐', tired:'🥱'
};

export default function MoodSelector(){
  const { mood, setMood, energy, setEnergy, valence, setValence } = useStore();
  const moods = ['happy','sad','angry','surprised','neutral','tired'];

  return (
    <View>
      <Text style={{color:colors.text, fontSize:18, fontWeight:'700', marginBottom:12}}>Pick a mood</Text>
      <View style={[styles.row,{flexWrap:'wrap', gap:8, marginBottom:12}]}>
        {moods.map(m=>(
          <Pressable key={m} onPress={()=>setMood(m)} style={{paddingVertical:10,paddingHorizontal:14,borderRadius:12, borderWidth:1, borderColor: m===mood? colors.neon: colors.line}}>
            <Text style={{color:colors.text, fontSize:18}}>{EMOJI[m]}  {m}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={{color:colors.text, fontWeight:'700', marginBottom:6}}>Energy: {energy}</Text>
      <View style={{height:6, backgroundColor:colors.line, borderRadius:4, marginBottom:12}}>
        <View style={{width:`${energy}%`, height:6, backgroundColor:colors.neon, borderRadius:4}} />
      </View>
      <View style={[styles.row,{gap:8, marginBottom:16}]}>
        <Pressable onPress={()=>setEnergy(Math.max(0, energy-10))} style={styles.buttonSecondary}><Text style={styles.buttonText}>-10</Text></Pressable>
        <Pressable onPress={()=>setEnergy(Math.min(100, energy+10))} style={styles.buttonSecondary}><Text style={styles.buttonText}>+10</Text></Pressable>
      </View>
      <Text style={{color:colors.text, fontWeight:'700', marginBottom:6}}>Valence: {valence}</Text>
      <View style={{height:6, backgroundColor:colors.line, borderRadius:4, marginBottom:12}}>
        <View style={{width:`${(valence+100)/2}%`, height:6, backgroundColor:colors.purple, borderRadius:4}} />
      </View>
      <View style={[styles.row,{gap:8}]}>
        <Pressable onPress={()=>setValence(Math.max(-100, valence-20))} style={styles.buttonSecondary}><Text style={styles.buttonText}>-20</Text></Pressable>
        <Pressable onPress={()=>setValence(Math.min(100, valence+20))} style={styles.buttonSecondary}><Text style={styles.buttonText}>+20</Text></Pressable>
      </View>
    </View>
  );
}
