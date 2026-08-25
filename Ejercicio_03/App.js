import React from "react";
import { useState } from "react";
import { View, Text, StyleSheet, Button, SafeAreaView } from 'react-native';
import CustomModal from "./componentes/CustomModal";
import DemoFlatList from "./componentes/DemoFlatList";
import DemoSectionList from "./componentes/DemoSectionList";

export default function App(){
  const [modalVisible, setModalVisible]=useState(false);

  const objetoContenido={
    valor:"Juan Perez",
  } 

  return(
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Button
          title="Ver mensaje"
          onPress={()=>setModalVisible(true)}
        />
        <CustomModal
          visible={modalVisible}
          onClose={()=>setModalVisible(false)}
          contenido={objetoContenido}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>FlatList</Text>
          <DemoFlatList />
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>SectionList</Text>
          <DemoSectionList />
        </View>
      </View>
    </SafeAreaView> 
  );
}

const styles= StyleSheet.create({
  container:{
    flex:1,
    backgroundColor: "#42e60c"
  },
  content:{
    justifyContent:"center",
    alignItems:"center"
  },
  row:{
    flex:1,
    flexDirection:"row",
  },
  column:{
    flex:1,
  },
  columnTitle:{
    textAlign:"center",
    fontWeight:"bold",
    fontSize:16,
    paddingVertical:8,
    backgroundColor:"#ffffffaa",
  },
});