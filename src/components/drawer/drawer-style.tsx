import { StyleSheet } from 'react-native';
import Config from 'react-native-config';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    drawerHeader: {
        backgroundColor: Config.SECONDARY_COLOR,
        height: 200,
        alignItems: 'center',
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
});

export default styles;