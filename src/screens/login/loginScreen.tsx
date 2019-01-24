import React, { Component } from 'react';
import { View, ImageBackground, ActivityIndicator } from 'react-native';
import { Button, Text, Item, Input } from 'native-base';
import styles from './loginStyle';
import { connect } from 'react-redux';
import { fetchPeople, User } from '../../redux/actions/userAction';


interface Props {
    userState: User;
    getusername(): object;
}

interface state {
    userData : any
}


class LoginScreen extends Component<Props> {
    componentDidMount() {
        console.log('props', this.props);
        // this.props.getusername();
    }
    render() {
        {console.log('props::', this.props);}
        return (
            <ImageBackground source={require('../../assets/images/login_bg.png')} style={{ width: '100%', height: '100%' }}>
                <View style={styles.container}>
                    <View style={styles.loginContainer}>
                        <Text style={styles.text}>Enter iPad Activation PIN</Text>
                        <Item regular style={styles.item}>
                            <Input placeholder='' style={styles.inputText}
                                onChangeText={(text) => console.log(text)}
                            />
                        </Item>
                        <View style={styles.buttonContainer}>
                            <Button onPress={() => this.props.getusername()}>
                                <Text>GO</Text>
                            </Button>
                            
                        </View>
                        {this.props.userState.isLoading ? <ActivityIndicator size="large" color="#0000ff" />:
                        
                            <View>
                                <Text style={{color:'#fff',textAlign:'center'}}>{this.props.userState.user.email}</Text>
                                <Text style={{color:'#fff',textAlign:'center'}}>{this.props.userState.user.gender}</Text>
                            </View>
                            }
                    </View>
                </View>
            </ImageBackground>
        )
    }
}

const mapStateToProps = (state: state) => {
    return {
        userState: state.userData
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return {
        getusername: () => dispatch(fetchPeople())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);