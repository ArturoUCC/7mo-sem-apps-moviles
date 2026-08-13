import {View, Text, StyleSheet} from 'react-native';


export default function Mensaje(props){
    const variableMensaje="Esto es mi mensaje"
    const num=1000;

    const double = n => n*2;
    return(
        <View style={styles.contenedor}>
            <Text style={styles.textoVerde}>{props.msg}</Text>
            <Text style={styles.textoFondoRojo}>{props.num}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        
        marginVertical: 10, 
    },
    textoVerde: {
        color: 'green', 
    },
    textoFondoRojo: {
        backgroundColor: 'red', 
        color: 'white',         
    }
});