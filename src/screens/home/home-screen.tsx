import React, { Component } from 'react';
import styles from './home-style';
import { View, Text, Button } from 'native-base';
import localDbManager from '../../manager/localdb-manager';
import { NavigationScreenProp } from 'react-navigation';

interface Props {
    navigation: NavigationScreenProp<any>;
}
export default class HomeScreen extends Component<Props> {
    componentDidMount() {
        localDbManager.get<string>('userToken',(err, data) => {
            console.log('local data', data)
        });
    }
    render() {
        return (
            <View style={styles.container}>
                <Text>Home Screen</Text>
                <View style={styles.buttonContainer}>
                    <Button onPress={this._signOutAsync} >
                        <Text>Sign me out</Text>
                    </Button>
                </View>
            </View>
        )
    }
    _signOutAsync = async () => {
        await localDbManager.delete('userToken', (err) => {
            if(err == null) {
                console.log('removed from db..');
            }
        })
        this.props.navigation.navigate('Login');
    };
}