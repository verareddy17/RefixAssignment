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
        height: 100,
        backgroundColor: 'transparent',
    },
    folderImageContainer: {
        position: 'relative',
    },
    fileContainer: {
        // flex: 1,
        flexDirection: 'row',
        height: 75,
        // justifyContent: 'center',
        backgroundColor: 'transparent',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    image: {
        width: 65,
        height: 65,
    },
    fileImage: {
        width: 75,
        height: 75,
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 5,
        borderRadius: 5
    },
    folderImage: {
        marginLeft: 10,
        marginTop: 1,
        marginBottom: 5,
        height: 75,
        width: 75,
        borderRadius: 5
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
        flex: 0.95,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 25,
    },
    resourceText: {
        flex: 1,
    },
    rootFileContainer: {
        flex: 1,
        flexDirection: 'column',
        margin: 1,
        backgroundColor: 'transparent',
        height: 100
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
        flexDirection: 'row',
        width: '100%',
        height: 45,
        justifyContent: 'flex-start',
        backgroundColor: '#F5F5F5',
    },
    breadscrumbsView: {
        backgroundColor: '#ffffff',
        justifyContent: 'flex-start',
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
    },
    fileConatiner: {
        flex: 0.95,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignSelf: 'center',
    },
    fileTitle: {
        marginLeft: 10,
    },
    rootFolderContainer: {
        marginTop: 15,
        flex: 1,
        flexDirection: 'column',
        margin: 1,
        backgroundColor: 'transparent',
    },
    headerContainer: {
        backgroundColor: '#08B6CE',
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        flexDirection: 'row'
    },
    headerLogoContainer: {
        width: '30%',
        height: 40,
        marginLeft: 10,
        marginBottom: 1
    },
    headerImage: {
        width: '100%',
        height: 40,
        resizeMode: 'stretch',
        marginLeft: 10,
        marginBottom: 1,
        borderRadius: 5
    },
    backArrow: {
        width: 30,
        height: 30,
        marginLeft: 10,
        marginRight: 2
    },
    downloadFile: {
        height: 30, 
        width: 30, 
        position: 'absolute', 
        marginTop: 55, 
        marginLeft: 55 
    }
});

export default styles;