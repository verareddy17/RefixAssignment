import { StyleSheet } from 'react-native';
import Config from 'react-native-config';

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    headerBg: {
        backgroundColor: Config.PRIMARY_COLOR,
    },
    folderContainer: {
        flex: 1,
        flexDirection: 'row',
        height: 50,
    },
    folderImageContainer: {
        position: 'relative',
    },
    fileContainer: {
        flex: 1,
        flexDirection: 'row',
        height: 70,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    image: {
        width: 65,
        height: 65,
    },
    fileImage: {
        width: 50,
        height: 50,
        marginLeft: 10,
        marginTop: 5,
        marginBottom: 5,
    },
    folderImage: {
        marginLeft: 10,
        marginTop: 5,
        marginBottom: 5,
        height: 50,
        width: 50,
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
        top: -2.5,
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
        paddingLeft: 0,
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
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        opacity: 0.8,
    },
    progressBarWidth: {
        width: '100%',
    },
    progressBarText: {
        color: '#000',
        textAlign: 'center',
    },
    fileSeparator: {
        width: '100%',
        height: 1,
        backgroundColor: '#A9A9A9',
    },
});

export default styles;