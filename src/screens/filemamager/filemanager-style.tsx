import { StyleSheet, Platform } from 'react-native';
import Config from 'react-native-config';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBg: {
        backgroundColor: Config.PRIMARY_COLOR,
    },
    iconColor: {
        color: '#fff',
    },
    headerTitle: {
        color: '#fff',
    },
    searchBarHeader: {
        backgroundColor: '#999',
        ...Platform.select({
            ios: {
                height: 40,
                paddingTop: 0,
            },
        }),
    },
    resourceImage: {
        width: 50,
        height: 50,
        marginLeft: 10,
    },
    downloadFileContainer: {
        height: 70,
        justifyContent: 'flex-start',
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
    },
    indicatorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarConainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
    },
    progressBarText: {
        color: '#fff',
        textAlign: 'center',
    },
    progressBarWidth: {
        width: '100%',
    },
});

export default styles;