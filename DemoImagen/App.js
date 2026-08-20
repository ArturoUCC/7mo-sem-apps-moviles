import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import DemoImagen from './componentes/DemoImagen';

export default function App() {
  return (
    <View style={styles.container}>
      <DemoImagen/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#aa16e4',
  },
  panel1:{
    flex:1,
    backgroundColor:'#930bf5'
  },
  panel2:{
    flex:1,
    backgroundColor:'#17f389'
  },
  panel3:{
    flex:1,
    backgroundColor:'#15159c'
  },
});
