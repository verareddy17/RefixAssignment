import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View, Text, Container, Content, Header, Icon } from 'native-base';
import { SafeAreaView, DrawerItemsProps, DrawerItems } from 'react-navigation';
import styles from './drawer-style';
import LocalDbManager from '../../manager/localdb-manager';
import Config from 'react-native-config';
import { Constant } from '../../constant';
import { Image } from 'react-native';

const CustomDrawerComponent = (props: DrawerItemsProps) => {
    return (
        <SafeAreaView style={styles.container} forceInset={{ top: 'never' }}>
            <Container>
                <Header noShadow style={styles.drawerHeader} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                    <Image style={styles.logoImage} source={require(`../../assets/images/hubspot_logo.png`)} />
                    <Text style={styles.businessUnitTitle}>{Config.APP_NAME}</Text>
                </Header>
                <Content>
                    <View style={styles.userNameContainer}>
                        <Icon style={styles.profileIcon} name='person'></Icon>
                        <Text style={styles.userNameTitle}>{Config.APP_NAME}</Text>
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
        </SafeAreaView>
    );
};

const _signout = async (props: DrawerItemsProps) => {
    await LocalDbManager.delete('userToken', async (err) => {
        if (err == null) {
            console.log('removed from db..');
            await LocalDbManager.delete(Constant.bookmarks, (err) => {
                if (err === null) {
                    console.log('removed bookmarks from database.');
                }
            });
        }
    });
    props.navigation.navigate('Login');
};

export default CustomDrawerComponent;
