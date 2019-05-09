import { StyleSheet } from 'react-native';
import Config from 'react-native-config';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBg: {
        backgroundColor: Config.PRIMARY_COLOR,
    },
    folderContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    folderImageContainer: {
        position: 'relative',
    },
    image: {
        width: 50,
        height: 50,
    },
    badge: {
        backgroundColor: Config.PRIMARY_COLOR,
        height: 20,
        borderRadius: 50,
        position: 'absolute',
        top: -10,
        right: -10,
    },
    badgeText: {
        fontSize: 10,
        lineHeight: 20,
    },
    resourceContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    resourceText: {
        flex: 1,
    },
    swipeContainer: {
        paddingRight: 0,
        paddingLeft: 5,
    },
    bookmarkIconContainer: {
        justifyContent: 'center',
        paddingRight: 10,
    },
    bookmarkContainer: {
        height: '100%',
        flexDirection: 'column',
    },
    bookmarkText: {
        fontSize: 10,
    },
    iconColor: {
        color: '#fff',
    },
    headerTitle: {
        color: '#fff',
    },
    progressBarConainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
    },
    progressBarWidth: {
        width: '100%',
    },
    progressBarText: {
        color: '#fff',
        textAlign: 'center',
    },
});

export default styles;