import { StyleSheet, Text, View, Modal } from 'react-native';
import { useState } from 'react';
import { Button } from 'react-native-web';

export default function App2() {

  const[modal, setModal]=useState(true)
  return (
    <View style={styles.container}>
      <Modal
        animationType='slide'
        transparent={true}
        visible={modal}
      >
        <View style={styles.center}>
          <View style={styles.contenido}>
          <Text>Esto es un modal</Text>
          <Button
          title="Close Modal"
          onPress={()=>setModal(!modal)}
          />
          </View>
        </View> 
      </Modal>
      <Text>Este texto esta afuera del modal</Text>
      <Text>Este texto esta afuera del modal</Text>
      <Text>Este texto esta afuera del modal</Text>
      <Text>Este texto esta afuera del modal</Text>
      <Text>Este texto esta afuera del modal</Text>
      <Text>Este texto esta afuera del modal</Text>
      <Text>Este texto esta afuera del modal</Text>
      <Text>Este texto esta afuera del modal</Text>
      <Text>Este texto esta afuera del modal</Text>
      <Text>Este texto esta afuera del modal</Text>
      <Button
      title='Mostrar Modal'
      onPress={()=>setModal(!modal)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center:{
    flex:1,
    alignItems:'stretch',
    justifyContent:'center',
    backgroundColor:"rgba(0,0,0,0.5)",
  },
  contenido:{
    flex:1,
    backgroundColor: "rgba(73,156,200,1)",
    alignItems:'center',
    justifyContent:'center',
    marginVertical:300,
    marginHorizontal:20,
  },
});