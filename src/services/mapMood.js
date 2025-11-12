export function buildParams(mood, intent, energy, valence){
  const e = Math.min(1, Math.max(0, energy/100));
  const v = Math.min(1, Math.max(0, (valence+100)/200));

  let sp = { target_energy: e, target_valence: v };
  let tm = { with_genres: '', sort_by: 'popularity.desc', 'vote_average.gte': 6.3 };

  const pick = (arr)=> arr[Math.floor(Math.random()*arr.length)];

  const G = {
    feelgood: ['35','10751','10402'],
    serious: ['18','99'],
    action: ['28','12'],
    cozy: ['10749','16'],
  };

  switch(mood){
    case 'happy':
      if(intent==='keep'){ sp.target_danceability = 0.7; tm.with_genres = pick([G.feelgood.join(','), G.cozy.join(',')]); }
      else { sp.target_energy = 0.45; tm.with_genres = G.serious.join(','); }
      break;
    case 'sad':
      if(intent==='keep'){ sp.target_acousticness = 0.5; tm.with_genres = G.cozy.join(','); }
      else { sp.target_valence = 0.8; sp.target_tempo = 115; tm.with_genres = G.feelgood.join(','); }
      break;
    case 'angry':
      if(intent==='keep'){ sp.target_energy = 0.9; tm.with_genres = G.action.join(','); }
      else { sp.target_energy = 0.35; sp.target_acousticness = 0.6; tm.with_genres = G.cozy.join(','); }
      break;
    case 'tired':
      if(intent==='keep'){ sp.target_tempo = 85; sp.target_energy = 0.35; tm.with_genres = G.cozy.join(','); }
      else { sp.target_energy = 0.7; sp.target_valence = 0.65; tm.with_genres = G.action.join(','); }
      break;
    case 'neutral':
    case 'surprised':
    default:
      sp.target_energy = 0.55; sp.target_valence = 0.55; tm.with_genres = G.feelgood.join(',');
  }

  return { spotify: sp, tmdb: tm };
}
