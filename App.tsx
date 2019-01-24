import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LoginScreen from './src/screens/login/loginScreen';
import store from './src/redux/store';
import {Provider} from 'react-redux';

interface Props {}
export default class App extends Component<Props> {
  render() {
    return (
      <Provider store={store}>
        <LoginScreen/>
      </Provider>
      
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
