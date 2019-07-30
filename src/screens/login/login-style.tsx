import { StyleSheet } from 'react-native';
import Config from 'react-native-config';

const styles = StyleSheet.create({

    rootContainer: {
        backgroundColor: Config.PRIMARY_COLOR,
        flex: 1,
    },
    header: {
        display: 'none',
    },
    logoWrapper: {
        marginBottom: 25,
    },
    logoImage: {
        width: 75,
        height: 75,
    },
    lineContainer: {
        alignItems: 'center',
        marginTop: -8,
    },
    line: {
        width: 35,
        height: 3,
        backgroundColor: Config.PRIMARY_COLOR,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginContainer: {
        backgroundColor: '#fff',
        padding: 10,
        width: 300,
        borderRadius: 20,
        position: 'relative',
        paddingBottom: 50,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        alignItems: 'center',
    },
    text: {
        color: Config.PRIMARY_COLOR,
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 25,
    },
    buttonContainer: {
        alignItems: 'center',
        position: 'absolute',
        left: '50%',
        right: '50%',
        bottom: -23,
    },
    bgImageStyle: {
        flex: 1,
    },
    button: {
        backgroundColor: Config.SECONDARY_COLOR,
        width: 60,
        height: 60,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
    buttonIcon: {
        color: '#fff',
    },
    refreshContainer: {
        width: 75,
        height: 75,
    },
    spinnerContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
});

export default styles;
