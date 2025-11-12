import { useEffect, useState } from 'react';

export function useEmotionDetector(active){
  const [mood,setMood] = useState('neutral');
  const [confidence,setConfidence] = useState(0.0);

  useEffect(()=>{
    if(!active) return;
    let i = 0;
    const seq = ['neutral','happy','tired','sad','angry','neutral'];
    const timer = setInterval(()=>{
      setMood(seq[i % seq.length]);
      setConfidence(0.6 + Math.random()*0.35);
      i++;
    }, 1500);
    return ()=> clearInterval(timer);
  },[active]);

  return { mood, confidence };
}
