import { StyleSheet } from 'react-native';
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
    swipeButton: {
        alignSelf: 'center',
    },
    swipeContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    resourceImage: {
        height: 30,
        width: 30,
    },
    listContainer: {
        flex: 1,
    }
});

export default styles;