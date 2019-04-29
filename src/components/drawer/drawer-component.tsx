import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View, Text, Container, Content, Header, Icon } from 'native-base';
import { SafeAreaView, DrawerItemsProps, DrawerItems } from 'react-navigation';
import styles from './drawer-style';
import LocalDbManager from '../../manager/localdb-manager';
import Config from 'react-native-config';

const CustomDrawerComponent = (props: DrawerItemsProps) => {
    return (
        <SafeAreaView style={styles.container} forceInset={{ top: 'never' }}>
            <Container>
                <Header noShadow style={styles.drawerHeader} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                    <Text>Welcome</Text>
                </Header>
                <Content>
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
    await LocalDbManager.delete('userToken', (err) => {
        if (err == null) {
            console.log('removed from db..');
        }
    });
    props.navigation.navigate('Login');
};

export default CustomDrawerComponent;
