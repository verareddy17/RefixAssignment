import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { View, Text, Container, Content, Header, Icon, Right, Left, Body } from 'native-base';
import { SafeAreaView, DrawerItemsProps, DrawerItems } from 'react-navigation';
import styles from './drawer-style';
import LocalDbManager from '../../manager/localdb-manager';
import Config from 'react-native-config';
import { Constant } from '../../constant';
import { Image } from 'react-native';
import images from '../../assets';

const CustomDrawerComponent = (props: DrawerItemsProps) => {
    return (
        < SafeAreaView style={styles.container} forceInset={{ top: 'never', left: 'never' }}>
            <Container>
                <Header noShadow style={styles.drawerHeader} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                    <TouchableOpacity onPress={() => closeDrawer(props)}>
                        <Icon name='close' style={styles.closeIcon}></Icon>
                    </TouchableOpacity>
                    <Image style={styles.logoImage} source={images.appLogo} />
                    <Text style={styles.businessUnitTitle}>{Config.APP_NAME}</Text>
                </Header>
                <Content>
                    <View style={styles.userNameContainer}>
                        <Icon style={styles.profileIcon} name='person'></Icon>
                        <Text style={[styles.userNameTitle, {fontWeight: 'bold'}]}>{Constant.loginName}</Text>
                    </View>
                    <View style={styles.spaceContainer} />
                    <DrawerItems {...props} />
                    <TouchableOpacity onPress={() => _signout(props)}>
                        <View style={styles.logoutContainer}>
                            <Icon name='log-out' style={styles.logoutIcon} ></Icon>
                            <Text style={styles.logoutText}>Logout</Text>
                        </View>
                    </TouchableOpacity>
                </Content>
            </Container >
        </SafeAreaView >
    );
};

function closeDrawer(props: DrawerItemsProps) {
    props.navigation.closeDrawer();
}

const logout = async (props: DrawerItemsProps) => {
    await LocalDbManager.delete('userToken', async (err) => {
        if (err == null) {
            props.navigation.navigate('Login');
        }
    });
};

const _signout = async (props: DrawerItemsProps) => {

    Alert.alert(Config.APP_NAME, Constant.logoutTitle,
        [
            {
                text: 'Yes',
                onPress: () => logout(props),
                style: 'default',
            },
            {
                text: 'No',
                onPress: () => console.log('canceled'),
                style: 'cancel',
            },
        ]);
};

export default CustomDrawerComponent;
