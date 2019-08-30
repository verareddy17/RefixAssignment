import React, { Component } from 'react';
import { View, ImageBackground, TouchableOpacity, Image, Keyboard, TouchableWithoutFeedback, Alert, Platform, KeyboardAvoidingView, NetInfo } from 'react-native';
import { Text, Item, Input, Icon, Header, Label, Spinner, Toast } from 'native-base';
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
import images from '../../assets/index';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import { isEnabled } from 'appcenter-crashes';
import { ActivationAppResponse } from '../../models/login-model';
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
                                        <Label>Enter User Pin</Label>
                                        <Input onChangeText={(text) =>
                                            this.props.getActivationPin(text)
                                        }
                                            value={this.props.inputText}
                                            autoCapitalize='none'
                                            secureTextEntry={this.state.isSecureText}
                                        />
                                        <Icon style={{ color: this.props.userState.isLoading || this.props.deviceTokenResponse.isLoading ? '#ffffff' : '#000000' }} name={this.state.isSecureText ? 'eye' : 'eye-off'} color='#fff' onPress={() => this.showPassword()} />
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
                    <View style={styles.refreshContainer}>
                        <Spinner size={'large'} color={Config.PRIMARY_COLOR}/>
                    </View>
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
        Keyboard.dismiss();
        if (this.props.inputText.length === 0) {
            Alert.alert(Config.APP_NAME, Constant.validationPin);
            return;
        }
        console.log('pin', this.props.inputText);
        await this.props.requestLoginApi(this.props.inputText);
        if (this.props.userState.error === '' && this.props.userState.user !== null) {
            Constant.loginName = this.props.userState.user.UserFullName;
            Constant.bearerToken = this.props.userState.user.Token || '';
            await this.props.requestDeviceTokenApi(Constant.deviceToken, 1, Constant.deviceOS, this.props.userState.user.Token!);
            if (this.props.deviceTokenResponse.error === '' && this.props.deviceTokenResponse.settings !== null) {
                this.props.resetInputText();
                this.props.navigation.navigate('Home', { 'isFromLogin': true });
            } else {
                Alert.alert(Config.APP_NAME, this.props.deviceTokenResponse.error);
            }
        } else {
            Alert.alert(Config.APP_NAME, this.props.userState.error);
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