import React, { Component } from 'react';
import { View, ImageBackground, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Button, Text, Item, Input } from 'native-base';
import styles from './login-style';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { fetchPeople, User } from '../../redux/actions/user-action';
import localDbManager from '../../manager/localdb-manager';
import { NavigationScreenProp } from 'react-navigation';
import { AppState } from '../../redux/reducers/index';

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
            <ImageBackground source={require('../../assets/images/login_bg.png')} style={{ width: '100%', height: '100%' }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        <View style={styles.loginContainer}>
                            <Text style={styles.text}>Enter Activation PIN</Text>
                            <Item regular style={styles.item}>
                                <Input placeholder='' style={styles.inputText}
                                    onChangeText={(text) => console.log(text)}
                                />
                            </Item>
                            <View style={styles.buttonContainer}>
                                <Button onPress={this._signInAsync}>
                                    <Text>Login</Text>
                                </Button>
                                <Button onPress={() => this.props.getusername()}>
                                    <Text>GO</Text>
                                </Button>
                            </View>
                            {this.props.userState.isLoading ? <ActivityIndicator size="large" color="#0000ff" /> :

                                <View>
                                    <Text style={{ color: '#fff', textAlign: 'center' }}>{this.props.userState.user.email}</Text>
                                    <Text style={{ color: '#fff', textAlign: 'center' }}>{this.props.userState.user.gender}</Text>
                                </View>
                            }
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </ImageBackground>
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