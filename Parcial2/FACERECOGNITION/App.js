import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import TomarFoto from './componentes/FOTO/TomarFoto';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <TomarFoto />
    </View>
  );
}