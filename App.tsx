import React, { Component } from 'react';
import LoginScreen from './src/screens/login/login-screen';
import store from './src/redux/store';
import { Provider } from 'react-redux';
import BaseNavigation from './src/navigation/router';

interface Props { }
export default class App extends Component<Props> {
  render() {
    return (
      <Provider store={store}>
        <BaseNavigation />
      </Provider>
    );
  }
}
