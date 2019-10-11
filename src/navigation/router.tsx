import React from 'react';
import { Icon } from 'native-base';
import { createStackNavigator, createDrawerNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';
import LoginScreen from '../screens/login/login-screen';
import HomeScreen from '../screens/home/home-screen';
import ResourceExplorerScreen from '../screens/files/resource-explorer-screen';
import BookmarkScreen from '../screens/bookmarks/bookmark-screen';
import FileManagerScreen from '../screens/filemanager/filemanager-screen';
import AuthLoadingScreen from '../screens/authloading/authloading-screen';
import CustomDrawerComponent from '../components/drawer/drawer-component';
import Config from 'react-native-config';
import PreviewManagerScreen from '../screens/preview/preview-manager-screen';
const HomeStackNavigator = createStackNavigator(
    {
        Home: {
            screen: HomeScreen,
        },
        File: {
            screen: ResourceExplorerScreen,
        },
        Preview: {
            screen: PreviewManagerScreen,
        },
        DownloadManager: {
            screen: FileManagerScreen,
        },
    },
    {
        initialRouteName: 'Home',
        headerMode: 'none',
        defaultNavigationOptions:{
            gesturesEnabled: false,
        }
    },
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
        // Bookmarks: {
        //     screen: BookmarkScreen,
        //     navigationOptions: {
        //         drawerLabel: 'Bookmarks',
        //         drawerIcon: () => (
        //             <Icon name='star' />
        //         ),
        //     },
        // },
        FileManager: {
            screen: FileManagerScreen,
            navigationOptions: {
                drawerLabel: 'Download Manager',
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
        App: HomeStackNavigator,
        Auth: AuthStack,
    },
    {
        initialRouteName: 'AuthLoading',
    }
));

export default BaseNavigation;
