import React, { Component } from 'react';
import { AsyncStorage, View, Alert, Text } from 'react-native';
import { Spinner } from 'native-base';
import styles from './authloading-style';
import { NavigationScreenProp } from 'react-navigation';
import VersionNumber from 'react-native-version-number';
import Config from 'react-native-config';
import LocalDbManager from '../../manager/localdb-manager';
import { string } from 'prop-types';
import { Constant } from '../../constant';
import { CustomizeSettings } from '../../models/custom-settings';
interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
}
export default class AuthLoadingScreen extends Component<Props> {
    constructor(props: Props) {
        super(props);
        this._bootstrapAsync();
    }

    public componentDidMount() {
        LocalDbManager.get<CustomizeSettings>(Constant.customSettings, (err, data) => {
            if (data) {
                Constant.confirmationMessageText = data.ConfirmationMessage || '';
                Constant.confirmationMessageModifiedDate = data.ConfirmationMessageModifiedDate || '';
            }
        });
    }
    // Fetch the token from storage then navigate to our appropriate place
    public _bootstrapAsync = async () => {
        const userToken = await AsyncStorage.getItem(Constant.userToken);
        // This will switch to the App screen or Auth screen and this loading
        // screen will be unmounted and thrown away.
        this.props.navigation.navigate(userToken ? 'Home' : 'Login');
    }

    // Render any loading content that you like here
    public render() {
        console.log('app version: ', VersionNumber.appVersion);
        console.log('build version: ', VersionNumber.buildVersion);
        console.log('bundle: ', VersionNumber.bundleIdentifier);
        return (
            <View style={styles.container}>
                <Spinner color={Config.PRIMARY_COLOR} />
            </View>
        );
    }
}