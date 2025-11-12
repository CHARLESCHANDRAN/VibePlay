import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  h1: { color: colors.text, fontSize: 28, fontWeight: '700', marginBottom: 12 },
  p: { color: colors.textDim, fontSize: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, borderColor: colors.line, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  buttonPrimary: { backgroundColor: colors.neon, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, alignItems: 'center' },
  buttonSecondary: { backgroundColor: colors.purple, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, alignItems: 'center' },
  buttonTextDark: { color: '#031016', fontWeight: '700' },
  buttonText: { color: colors.text, fontWeight: '700' },
});
