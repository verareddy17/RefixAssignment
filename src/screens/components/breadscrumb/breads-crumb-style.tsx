import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
    container: {
        height: 40,
    },
    breadscrumbContainer: {
        height: 40,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        backgroundColor: 'transparent',
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
        fontSize: 20,
        color: '#000000',
        fontWeight: 'bold'
    },
});
export default styles;
