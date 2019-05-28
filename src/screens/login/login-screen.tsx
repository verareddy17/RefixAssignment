import React, { Component } from 'react';
import { View, ImageBackground, TouchableOpacity, Image, Keyboard, TouchableWithoutFeedback, Alert, ActivityIndicator, AsyncStorage } from 'react-native';
import { Text, Item, Input, Icon, Header, Label, Spinner } from 'native-base';
import styles from './login-style';
import { connect } from 'react-redux';
import LocalDbManager from '../../manager/localdb-manager';
import { Dispatch, bindActionCreators, AnyAction } from 'redux';
import { LoginResponse } from '../../redux/actions/user-action';
import onchangeText from '../../redux/actions/input-action';
import { NavigationScreenProp } from 'react-navigation';
import { AppState } from '../../redux/reducers/index';
import loginApi from '../../redux/actions/user-action';
import { Constant } from '../../constant';
import Config from 'react-native-config';
import { ActionPayload } from '../../models/action-payload';
import { SettingsResponse } from '../../redux/actions/settings-actions';
import deviceTokenApi from '../../redux/actions/settings-actions';
import { string } from 'prop-types';

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    userState: LoginResponse;
    inputText: string;
    deviceTokenResponse: SettingsResponse;
    getActivationPin(pin: string): ActionPayload<string>;
    requestLoginApi(pin: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    requestDeviceTokenApi(UserID: number, BUId: number): (dispatch: Dispatch<AnyAction>) => Promise<void>;
}

class LoginScreen extends Component<Props> {
    public static navigationOptions = {
        header: null,
    };

    public render() {
        return (
            <View style={styles.rootContainer}>
                <ImageBackground source={require('../../assets/images/login-bg.png')} style={styles.bgImageStyle}>
                    <Header androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'} style={styles.header} />
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.container}>
                            <View style={styles.logoWrapper}>
                                <Image
                                    source={require(`../../assets/images/hubspot_logo.png`)}
                                    style={styles.logoImage}
                                />
                            </View>
                            <View style={styles.loginContainer}>
                                <Text style={styles.text} adjustsFontSizeToFit>Login</Text>
                                <View style={styles.lineContainer}>
                                    <View style={styles.line}></View>
                                </View>
                                <Item floatingLabel>
                                    <Label>Password</Label>
                                    <Input onChangeText={(text) =>
                                        this.props.getActivationPin(text)
                                    }
                                        value={this.props.inputText}
                                        autoCapitalize='none'
                                        secureTextEntry={true}
                                    />
                                </Item>
                                {this.props.userState.isLoading ?
                                    <Spinner style={styles.refreshContainer} size={'large'} color='#000000' />
                                    : <View />
                                }
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.button} onPress={this._signInAsync}>
                                        <View>
                                            <Icon name='arrow-round-forward' style={styles.buttonIcon} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ImageBackground>
            </View>
        );
    }

    public storeData<T>(key: string, value: T) {
        LocalDbManager.insert<T>(key, value, (err) => {
            if (err !== null) {
                Alert.alert(Config.APP_NAME, err!.message);
            }
        });
    }
    public _signInAsync = async () => {
        if (this.props.inputText.length === 0) {
            Alert.alert(Config.APP_NAME, Constant.validationPin);
            return;
        }
        await this.props.requestLoginApi(this.props.inputText);
        if (this.props.userState.error === '' && this.props.userState.user !== null) {
            await this.storeData<number>(Constant.buid, this.props.userState.user.BUId!);
            await this.storeData<number>(Constant.userID, this.props.userState.user.UserID!);
            await this.storeData<string>(Constant.username, this.props.userState.user.Username || '');
            await this.storeData<string>(Constant.clientName, this.props.userState.user.ClientName || '');
            await this.props.requestDeviceTokenApi(this.props.userState.user.UserID || 0, this.props.userState.user.BUId || 0);
            console.log('settings response: ', this.props.deviceTokenResponse.settings);
            if (this.props.deviceTokenResponse.error === '' && this.props.deviceTokenResponse.settings !== null) {
                await this.storeData<string>(Constant.confirmationMessage, this.props.deviceTokenResponse.settings.ConfirmationMessage!);
                await this.storeData<string>(Constant.confirmationModifiedDate, this.props.deviceTokenResponse.settings.ConfirmationMessageModifiedDate!);
                await LocalDbManager.insert<string>('userToken', 'abc', async (err) => {
                    if (err === null) {
                        this.props.navigation.navigate('Home', { 'isFromLogin': true });
                    }
                });
            }
        } else {
            Alert.alert(Config.APP_NAME, Constant.validationPin);
        }
    }
}

const mapStateToProps = (state: AppState) => ({
    inputText: state.inputText.pin,
    userState: state.loginData,
    deviceTokenResponse: state.settings,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    getActivationPin: bindActionCreators(onchangeText, dispatch),
    requestLoginApi: bindActionCreators(loginApi, dispatch),
    requestDeviceTokenApi: bindActionCreators(deviceTokenApi, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
