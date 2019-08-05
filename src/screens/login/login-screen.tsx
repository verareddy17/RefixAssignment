import React, { Component } from 'react';
import { View, ImageBackground, TouchableOpacity, Image, Keyboard, TouchableWithoutFeedback, Alert, ActivityIndicator, AsyncStorage, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Text, Item, Input, Icon, Header, Label, Spinner, Toast } from 'native-base';
import styles from './login-style';
import { connect } from 'react-redux';
import LocalDbManager from '../../manager/localdb-manager';
import { Dispatch, bindActionCreators, AnyAction } from 'redux';
import { LoginResponse } from '../../redux/actions/user-action';
import onchangeText, { ResetInputText } from '../../redux/actions/input-action';
import { NavigationScreenProp, DrawerItems } from 'react-navigation';
import { AppState } from '../../redux/reducers/index';
import loginApi from '../../redux/actions/user-action';
import { Constant, FileType } from '../../constant';
import Config from 'react-native-config';
import { ActionPayload } from '../../models/action-payload';
import { SettingsResponse } from '../../redux/actions/settings-actions';
import deviceTokenApi from '../../redux/actions/settings-actions';
import images from '../../assets/index';
import { string } from 'prop-types';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import { isEnabled } from 'appcenter-crashes';
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
    isSecureText: boolean;
    isEnable: boolean;
}

class LoginScreen extends Component<Props, State> {
    public static navigationOptions = {
        header: null,
    };
    constructor(props: Props) {
        super(props);
        this.state = {
            text: '',
            isSecureText: true,
            isEnable: true,
        };
    }

    public render() {
        return (
            <View style={styles.rootContainer}>
                <ImageBackground source={images.loginBG} style={styles.bgImageStyle}>
                    <KeyboardAvoidingView style={styles.keyboardAvoidContainer} behavior='padding' enabled={Platform.OS === 'ios' ? true : false} >
                        <Header androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'} style={styles.header} />
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.container}>
                                <View style={styles.logoWrapper}>
                                    <Image
                                        source={images.appLogo}
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
                                            secureTextEntry={this.state.isSecureText}
                                        />
                                        <Icon active={this.props.userState.isLoading || this.props.deviceTokenResponse.isLoading ? false : true } name={this.state.isSecureText ? 'eye' : 'eye-off'} color='#fff' onPress={() => this.showPassword()} />
                                    </Item>
                                    {this.SpinnerLoading()}
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity disabled={this.props.userState.isLoading || this.props.deviceTokenResponse.isLoading ? true : false} style={styles.button} onPress={() => {
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
                    </KeyboardAvoidingView>
                </ImageBackground>
            </View>
        );
    }

    public showPassword() {
        this.setState({
            isSecureText: !this.state.isSecureText,
        });
    }

    public SpinnerLoading() {
        if (this.props.userState.isLoading || this.props.deviceTokenResponse.isLoading) {
            return (
                <View style={styles.spinnerContainer}>
                    <Spinner style={styles.refreshContainer} size={'large'} color={Config.PRIMARY_COLOR} />
                </View>
            );
        } else {
            return (
                <View></View>
            );
        }
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
            await LocalDbManager.get<string>(Constant.username, async (error, userName) => {
                if (userName !== null || userName !== '') {
                    if (userName !== this.props.userState.user.UserFullName) {
                        await LocalDbManager.insert<Array<DownloadedFilesModel>>(Constant.downloadedFiles, [], async (err) => {
                            Toast.show({ text: 'successfully removed all downloaded files', type: 'success', position: 'bottom' });
                        });
                    }
                }
            });
            await this.storeData<string>(Constant.token, this.props.userState.user.Token!);
            await this.storeData<string>(Constant.username, this.props.userState.user.UserFullName || '');
            Constant.loginName = this.props.userState.user.UserFullName;
            const deviceOs: number = Platform.OS === 'ios' ? 1 : 0;
            await this.props.requestDeviceTokenApi(Constant.deviceToken, 1, deviceOs, this.props.userState.user.Token!);
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
            } else {
                Alert.alert(Config.APP_NAME, this.props.deviceTokenResponse.error);
            }
        } else {
            if (this.props.userState.error !== '') {
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