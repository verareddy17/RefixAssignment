import React, { Component } from 'react';
import {
    ActivityIndicator,
    AsyncStorage,
    View,
} from 'react-native';
import styles from './authloading-style';
import { NavigationScreenProp } from 'react-navigation';

interface Props {
    navigation: NavigationScreenProp<any>;
}
export default class AuthLoadingScreen extends Component<Props> {
    constructor(props: Props) {
        super(props);
        this._bootstrapAsync();
    }

    // Fetch the token from storage then navigate to our appropriate place
    _bootstrapAsync = async () => {
        const userToken = await AsyncStorage.getItem('userToken');
        // This will switch to the App screen or Auth screen and this loading
        // screen will be unmounted and thrown away.
        this.props.navigation.navigate(userToken ? 'Home' : 'Login');
    };

    // Render any loading content that you like here
    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator />
            </View>
        );
    }
}