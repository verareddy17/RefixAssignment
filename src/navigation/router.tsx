import React from 'react';
import { Icon } from 'native-base';
import { createStackNavigator, createDrawerNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';
import LoginScreen from '../screens/login/login-screen';
import HomeScreen from '../screens/home/home-screen';
import FileScreen from '../screens/files/file-screen';
import BookmarkScreen from '../screens/bookmarks/bookmark-screen';
import FileManagerScreen from '../screens/filemamager/filemanager-screen';
import AuthLoadingScreen from '../screens/authloading/authloading-screen';
import CustomDrawerComponent from '../components/drawer/drawer-component';
import Config from 'react-native-config';
import DisplayScreen from '../screens/display/display-screen';
const HomeStackNavigator = createStackNavigator(
    {
        Home: {
            screen: HomeScreen,
        },
        File: {
            screen: FileScreen,
        },
        display: {
            screen: DisplayScreen,
        },
    },
    {
        initialRouteName: 'Home',
        headerMode: 'none',
    }
);

const AppDrawerNavigator = createDrawerNavigator(
    {
        Home: {
            screen: HomeStackNavigator,
            navigationOptions: {
                drawerLabel: 'Home',
                drawerIcon: () => (
                    <Icon name='home' />
                ),
            },
        },
        Bookmarks: {
            screen: BookmarkScreen,
            navigationOptions: {
                drawerLabel: 'Bookmarks',
                drawerIcon: () => (
                    <Icon name='star' />
                ),
            },
        },
        FileManager: {
            screen: FileManagerScreen,
            navigationOptions: {
                drawerLabel: 'File Manager',
                drawerIcon: () => (
                    <Icon name='folder' />
                ),
            },
        },
    },
    {
        contentComponent: CustomDrawerComponent,
        contentOptions: {
            activeTintColor: Config.PRIMARY_COLOR,
        },
    }
);

const AuthStack = createStackNavigator({ Login: LoginScreen });

const BaseNavigation = createAppContainer(createSwitchNavigator(
    {
        AuthLoading: AuthLoadingScreen,
        App: AppDrawerNavigator,
        Auth: AuthStack,
    },
    {
        initialRouteName: 'AuthLoading',
    }
));

export default BaseNavigation;
