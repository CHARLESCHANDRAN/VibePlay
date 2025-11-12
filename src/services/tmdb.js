import Config from '../config';

const BASE = 'https://api.themoviedb.org/3';

export async function discoverMovies(params){
  const queryParams = {
    api_key: Config.TMDB_API_KEY,
    include_adult: 'false',
    ...params
  };
  
  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  
  const url = `${BASE}/discover/movie?${queryString}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('TMDb error');
  const json = await res.json();
  return json.results || [];
}
