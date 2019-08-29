import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    breadscrumbContainer: {
        height: 35,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        backgroundColor: '#ffffff',
        borderBottomWidth: 0.3,
        borderTopWidth: 0.3,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonContainer: {
        height: 35,
        justifyContent: 'center',
        padding: 3,
    },
    icon: {
        marginRight: 4,
    },
    title: {
        marginLeft: 5,
        fontSize: 15,
        color: '#000000',
    },
});
export default styles;
