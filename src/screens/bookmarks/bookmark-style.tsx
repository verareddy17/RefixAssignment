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
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resourceImage: {
        height: 45,
        width: 45,
    },
    listContainer: {
        flex: 1,
    },
    noBookmarksContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default styles;