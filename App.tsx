import React, { Component } from 'react';
import store from './src/redux/store';
import { Provider } from 'react-redux';
import BaseNavigation from './src/navigation/router';
import { Root } from 'native-base';

interface Props { }

export default class App extends Component<Props> {
  public render() {
    return (
      <Provider store={store}>
        <Root>
          <BaseNavigation />
        </Root>
      </Provider>
    );
  }
}
