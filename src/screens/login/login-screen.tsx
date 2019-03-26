import React, { Component } from 'react';
import { View, ImageBackground, TouchableOpacity, Image, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Button, Text, Item, Input, Icon, Header, Label } from 'native-base';
import styles from './login-style';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { fetchPeople, User } from '../../redux/actions/user-action';
import localDbManager from '../../manager/localdb-manager';
import { NavigationScreenProp } from 'react-navigation';
import { AppState } from '../../redux/reducers/index';
import Config from 'react-native-config';

interface Props {
    navigation: NavigationScreenProp<any>;
    userState: User;
    getusername(): object;
}


class LoginScreen extends Component<Props> {
    static navigationOptions = {
        header: null
    }
    render() {
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
                                    <Input secureTextEntry={true} />
                                </Item>
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

        )
    }
    _signInAsync = async () => {
        await localDbManager.insert<string>('userToken', 'abc', (err) => {
            if (err === null) {
                console.log('successfully inserted');
            }
        });
        this.props.navigation.navigate('Home');
    };
}

const mapStateToProps = (state: AppState) => ({
    userState: state.userData
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
    getusername: bindActionCreators(fetchPeople, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);