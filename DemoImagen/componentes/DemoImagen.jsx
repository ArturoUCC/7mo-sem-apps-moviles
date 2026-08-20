import { StyleSheet, View, ImageBackground, Dimensions, Image, Text } from "react-native";

const DemoImagen= () =>{
    return(
        <View style={styles.container}>
        <ImageBackground
            style={styles.fondo}
            source={require('../assets/image.png')}
        >
            <View style={styles.container}>
                <Text style={styles.titulo}> GATIN </Text>
            <Image
                style={styles.foto}
                source={{uri:'https://http.cat/100'}}
            />
        </View>
      
        </ImageBackground>

        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(0,0,0,0)',
    alignItems: 'center',
    justifyContent:'center',
  },
  fondo:{
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  foto:{
    width:200,
    height:200,
    borderRadius: 16,
    borderWidth: 10,
    borderColor:'#ec7114',
    shadowColor:'#080808',
    shadowOffset: {width: 0, height: 10},
    shadowRadius: 10,
    elevation: 8,
  },
  titulo:{
    backgroundColor: 'rgb(0,0,0,0.5)',
    width: Dimensions.get("window").width,
    fontSize: 67,
    textAlign:'center',
  },
});

export default DemoImagen;