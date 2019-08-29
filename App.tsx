import React, { Component } from 'react';
import { store, persistor } from './src/redux/store';
import { Provider } from 'react-redux';
import BaseNavigation from './src/navigation/router';
import { Root } from 'native-base';
import { PersistGate } from 'redux-persist/es/integration/react';

interface Props { }

export default class App extends Component<Props> {
  public render() {
    console.disableYellowBox = true;
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Root>
            <BaseNavigation />
          </Root>
        </PersistGate>
      </Provider>
    );
  }
}
