
import { StyleSheet } from 'react-native';
import Config from 'react-native-config';
import Constant from '../../constant';
const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: Config.PRIMARY_COLOR,
        height: 55
    },
    iconColor: {
        color: '#fff',
    },
    contentContainer: {
        flex: 1,
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
    }
});

export default styles;
