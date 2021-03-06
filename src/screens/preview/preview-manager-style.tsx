
import { StyleSheet } from 'react-native';
import Config from 'react-native-config';
import Constant from '../../constant';
const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#08B6CE',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        flexDirection: 'row'
    },
    iconColor: {
        color: '#fff',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: 'black'
    },
    spinnerConatiner: {
        position: 'absolute',
        width: 100,
        height: 100,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoContainer: {
        backgroundColor: '#000000',
        height: 10
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
        alignItems: 'center',
    },
    backArrow: {
        width: 30,
        height: 30,
        marginLeft: 10
    },
    fileName: {
        marginLeft: 10,
        fontWeight: 'bold'
    }
});

export default styles;
