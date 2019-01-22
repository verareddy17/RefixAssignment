import React, { Component } from 'react';
import { View } from 'react-native';
import { Button, Text, Item, Input } from 'native-base';
import styles from './loginStyle';

interface Props {

}
class LoginScreen extends Component<Props> {
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.loginContainer}>
                    <Text style={styles.text}>Enter iPad Pin</Text>
                    <Item regular>
                        <Input placeholder='Enter PIN' placeholderTextColor="#fff" style={styles.inputText} />
                    </Item>
                    <View style={styles.buttonContainer}>
                        <Button>
                            <Text>Ok</Text>
                        </Button>
                    </View>
                </View>
            </View>
        )
    }
}

export default LoginScreen;