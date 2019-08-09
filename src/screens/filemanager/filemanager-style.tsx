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
        }),
    },
    segmentButton: {
        borderLeftWidth: 1,
    },
    downloadedContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 75,
    },
    textTitle: {
        padding: 10,
    },
    filesContainer: {
        height: 75,
    },
    bodyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 75,
    },
    selectAll: {
        color: '#00bbd1',
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
});

export default styles;
