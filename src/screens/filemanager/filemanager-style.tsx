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
        width: 75,
        height: 75,
        marginLeft: 10,
        borderRadius: 5,
    },
    downloadFileContainer: {
        height: 70,
        justifyContent: 'flex-start',
        backgroundColor: '#ffffff',
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
        alignItems: 'center',
    },
    progressBarText: {
        color: '#000000',
        textAlign: 'center',
    },
    progressBarWidth: {
        width: '100%',
    },
    contentConatiner: {
        backgroundColor: '#ffffff',
        height: 50,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',

    },
    segmentContainer: {
        width: '60%',
        ...Platform.select({
            ios: {
                backgroundColor: '#ffffff',
            },
            android: {
                backgroundColor: Config.PRIMARY_COLOR,
            },
        }),
    },
    segmentButton: {
        borderLeftWidth: 1,
    },
    downloadedContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 100,
    },
    textTitle: {
        padding: 10,
    },
    filesContainer: {
        height: 100,
    },
    bodyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 75,
    },
    selectAll: {
        color: '#08B6CE',
        marginLeft: 12,
    },
    containerColor: {
        backgroundColor: 'transparent',
    },
    downloadContainer: {
        height: 150,
        width: '90%',
        backgroundColor: '#ffffff',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    renderSeparator: {
        height: 1,
        width: '100%',
        backgroundColor: '#ffffff',
    },
    swipeoutContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    swipeButtonIcon: {
        color: '#fff',
    },
    separator: {
        height: 1,
        backgroundColor: '#ffffff',
        width: '100%',
    },
    cancelButton: {
        color: '#000000',
    },
    selectAllFilesConatiner: {
        flexDirection: 'row',
        marginLeft: 5,
    },
    headerContainer: {
        backgroundColor: '#08B6CE',
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        flexDirection: 'row'
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
    downloadIconContainer: {
        // marginRight: 15
    },
    downloadIcon: {
        height: 25,
        width: 25
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
    backArrowContainer: {
        width: '100%',
        height: 50,
        backgroundColor: '#F5F5F5',
        justifyContent: 'flex-start',
        flexDirection: 'row',
    },
    backArrow: {
        width: 30,
        height: 30,
        marginLeft: 10
    },
    titleContainer: {
        flex: 2.5,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignSelf: 'center',

    },
    deleteContainer: {
        flex: 0.5,
        backgroundColor: 'transparent',
        height: 55,
        justifyContent: 'center',
        alignItems: 'center'
    },
    delete: {
        width: 40,
        height: 40,
        resizeMode: 'center',
    },
    headerTitleContainer: {
        flex: 0.75,
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row'
    },
    title: {
        marginLeft: 10,
        fontSize: 20,
        fontWeight: 'bold'
    },
    downloadManagerContainer: {
        flex: 0.25,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchBarContainer: {
        backgroundColor: '#fff',
        flex: 1,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginLeft: 20,
        marginRight: 5,
        marginBottom: 1,
    },
    searchButton: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flex: 1,
    },
    search: {
        fontSize: 35,
        color: 'white'
    }
});

export default styles;
