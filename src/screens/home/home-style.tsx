import { StyleSheet, Platform, Dimensions } from 'react-native';
import Config from 'react-native-config';
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBg: {
        backgroundColor: 'transparent',
    },
    menuIcon: {
        paddingLeft: 5,
    },
    refreshIcon: {
        paddingRight: 5,
    },
    resourceListContainer: {
        flex: 1,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    listItem: {
        height: 100,
        flexDirection: 'row',
        borderColor: '#c9c9c9',
        borderBottomWidth: 0.33,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    resourceImageConatiner: {
        position: 'relative',
    },
    resourceImage: {
        width: 75,
        height: 75,
        marginLeft: 10,
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
    text: {
        top: -2.5,
        fontSize: 10,
        lineHeight: 20,
    },
    iconColor: {
        color: '#fff',
    },
    searchBarHeader: {
        backgroundColor: '#999',
    },
    searchContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 100,
        // width: '90%'
    },
    renderSeparator: {
        height: 1,
        width: '100%',
        backgroundColor: '#ffffff',
    },
    containerColor: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    spinnerContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        backgroundColor: '#08B6CE',
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        flexDirection: 'row'
    },
    imageLogo: {
        width: '30%',
        height: 40,
        resizeMode: 'stretch',
        marginLeft: 10,
        marginBottom: 1,
        borderRadius: 5
    },
    subHeaderContainer: {
        backgroundColor: '#F5F5F5',
        width: '100%',
        height: 50,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 10
    },
    refreshContainer: {
        width: 40,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    refreshImage: {
        width: 30,
        height: 30
    },
    downloadManagerContainer: {
        width: 40,
        height: 50,
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
    downloadFile: {
        height: 30,
        width: 30,
        position: 'absolute',
        marginTop: 45,
        marginLeft: 55
    },
    searchTitle: {
        padding: 10,
        width: '50%'
    },
    searchButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flex: 1
    },
    searchIcon: {
        fontSize: 35,
        color: '#fff'
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 20
    }

});

export default styles;