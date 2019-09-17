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
        backgroundColor: 'transparent',
    },
    folderImageContainer: {
        position: 'relative',
    },
    fileContainer: {
        flex: 1,
        flexDirection: 'row',
        height: 70,
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    image: {
        width: 65,
        height: 65,
    },
    fileImage: {
        width: 50,
        height: 50,
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 5,
    },
    folderImage: {
        marginLeft: 10,
        marginTop: 1,
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
        backgroundColor: 'transparent',
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
    fileSeparator: {
        width: '100%',
        height: 1,
        backgroundColor: '#ffffff',
    },
    transparentColor: {
        backgroundColor: 'transparent',
    },
    swipeoutContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    swipeButtonIcon: {
        color: '#fff',
    },
    downloadContainer: {
        height: 150,
        width: '90%',
        backgroundColor: '#ffffff',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    downloadingText: {
        color: '#000000',
    },
    breadscrumbContainer: {
        width: '100%',
        height: 35,
        justifyContent: 'flex-start',
    },
    breadscrumbsView: {
        backgroundColor: '#ffffff',
        justifyContent: 'flex-start',
    },
    headerContainer: {
        marginTop: 10,
        marginLeft: 20,
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
    },
    fileConatiner: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignSelf: 'center',
    },
    fileTitle: {
        marginLeft: 10,
    },
});

export default styles;