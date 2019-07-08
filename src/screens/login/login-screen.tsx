import React, { Component } from 'react';
import { View, ImageBackground, TouchableOpacity, Image, Keyboard, TouchableWithoutFeedback, Alert, ActivityIndicator, AsyncStorage, Platform } from 'react-native';
import { Text, Item, Input, Icon, Header, Label, Spinner } from 'native-base';
import styles from './login-style';
import { connect } from 'react-redux';
import LocalDbManager from '../../manager/localdb-manager';
import { Dispatch, bindActionCreators, AnyAction } from 'redux';
import { LoginResponse } from '../../redux/actions/user-action';
import onchangeText, { ResetInputText } from '../../redux/actions/input-action';
import { NavigationScreenProp } from 'react-navigation';
import { AppState } from '../../redux/reducers/index';
import loginApi from '../../redux/actions/user-action';
import { Constant } from '../../constant';
import Config from 'react-native-config';
import { ActionPayload } from '../../models/action-payload';
import { SettingsResponse } from '../../redux/actions/settings-actions';
import deviceTokenApi from '../../redux/actions/settings-actions';
import { string } from 'prop-types';
import { ResponseModel, Data } from '../../models/response-model';

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    userState: LoginResponse;
    inputText: string;
    deviceTokenResponse: SettingsResponse;
    getActivationPin(pin: string): ActionPayload<string>;
    requestLoginApi(pin: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    requestDeviceTokenApi(DeviceToken: string, ThemeVersion: number, DeviceOs: number, token: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    // tslint:disable-next-line: no-any
    resetInputText(): any;
}

interface State {
    text: string;
}

class LoginScreen extends Component<Props, State> {
    public static navigationOptions = {
        header: null,
    };
    constructor(props: Props) {
        super(props);
        this.state = {
            text: '',
        };
    }

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
                                    <TouchableOpacity style={styles.button} onPress={() => {
                                        this.signInAsync();
                                    }}>
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
    public async signInAsync() {
        if (this.props.inputText.length === 0) {
            Alert.alert(Config.APP_NAME, Constant.validationPin);
            return;
        }
        console.log('pin', this.props.inputText);
        await this.props.requestLoginApi(this.props.inputText);
        if (this.props.userState.error === '' && this.props.userState.user !== null) {
            await this.storeData<string>(Constant.token, this.props.userState.user.Token!);
            await this.storeData<string>(Constant.username, this.props.userState.user.BUName || '');
            const deviceOs: number = Platform.OS === 'ios' ? 1 : 0;
            await this.props.requestDeviceTokenApi(Constant.deviceToken, 1, deviceOs, this.props.userState.user.Token!);
            console.log('settings response: ', this.props.deviceTokenResponse.settings);
            if (this.props.deviceTokenResponse.error === '' && this.props.deviceTokenResponse.settings !== null) {
                await this.storeData<string>(Constant.confirmationMessage, this.props.deviceTokenResponse.settings.ConfirmationMessage!);
                await this.storeData<string>(Constant.confirmationModifiedDate, this.props.deviceTokenResponse.settings.ConfirmationMessageModifiedDate!);
                await this.storeData<string>(Constant.headerColor, this.props.deviceTokenResponse.settings.HeaderColor!);
                await this.storeData<string>(Constant.fontColor, this.props.deviceTokenResponse.settings.FontColor!);
                await this.storeData<string>(Constant.logoImage, this.props.deviceTokenResponse.settings.LogoImage!);
                await this.storeData<string>(Constant.backgroundPortraitImage, this.props.deviceTokenResponse.settings.PortraitImage!);
                await this.storeData<string>(Constant.backgroundLandscapeImage, this.props.deviceTokenResponse.settings.LandscapeImage!);
                await this.storeData<string>(Constant.versionNumber, this.props.deviceTokenResponse.settings.VersionNumber!);
                await LocalDbManager.insert<string>('userToken', 'abc', async (err) => {
                    if (err === null) {
                        this.props.resetInputText();
                        this.props.navigation.navigate('Home', { 'isFromLogin': true });
                    }
                });
            }
        } else {
            if ( this.props.userState.error !== '') {
                Alert.alert(Config.APP_NAME, this.props.userState.error);

            } else {
                Alert.alert(Config.APP_NAME, Constant.validationPin);
            }
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
    resetInputText: bindActionCreators(ResetInputText, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
