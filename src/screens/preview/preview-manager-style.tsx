
import { StyleSheet } from 'react-native';
import Config from 'react-native-config';

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: Config.PRIMARY_COLOR,
    },
    iconColor: {
        color: '#fff',
    },
    contentContainer: {
        flexGrow: 1,
    },
    spinnerConatiner: {
        position: 'absolute',
        width: 100,
        height: 100,
    },
});

export default styles;
