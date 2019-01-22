import React, { Component } from 'react';
import { View,ImageBackground } from 'react-native';
import { Button, Text, Item, Input } from 'native-base';
import styles from './loginStyle';
interface Props {

}
class LoginScreen extends Component<Props> {
    render() {
        return (
            <ImageBackground source={require('../../assets/images/login_bg.png')} style={{width:'100%',height:'100%'}}>
            <View style={styles.container}>
                <View style={styles.loginContainer}>
                    <Text style={styles.text}>Enter iPad Activation PIN</Text>
                    <Item regular style={styles.item}>
                        <Input placeholder='' style={styles.inputText} 
                        onChangeText={(text) => console.log(text)}
                        />
                    </Item>
                    <View style={styles.buttonContainer}>
                        <Button>
                            <Text>GO</Text>
                        </Button>
                    </View>
                </View>
            </View>
            </ImageBackground>
        )
    }
}

export default LoginScreen;