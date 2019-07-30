import { StyleSheet, Platform } from 'react-native';
import Config from 'react-native-config';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    drawerHeader: {
        backgroundColor: Config.SECONDARY_COLOR,
        height: 200,
        alignItems: 'center',
        flexDirection: 'column',
    },
    logoutContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutIcon: {
        marginHorizontal: 16,
        marginVertical: 10,
        fontSize: 28,
        color: 'rgba(0,0,0,.6)',
    },
    logoutText: {
        color: 'rgba(0,0,0,.87)',
        marginHorizontal: 16,
        fontWeight: 'bold',
        fontSize: 14,
    },
    logoImage: {
        height: 100,
        width: 100,
    },
    businessUnitTitle: {
        fontSize: 20,
        color: '#ffffff',
    },
    userNameContainer: {
        height: 40,
        width: '100%',
        flexDirection: 'row',
        backgroundColor: '#d3d3d3',
    },
    userNameTitle: {
        padding: 8,
    },
    spaceContainer: {
        height: 20,
    },
    profileIcon: {
        marginLeft: 40,
    },
    logoIcon: {
        color: '#fff',
        marginTop: 10,
        ...Platform.select({
            ios: {
                marginLeft: '95%',
            },
            android: {
                marginLeft: '90%',
            },
        }),
    },
});

export default styles;