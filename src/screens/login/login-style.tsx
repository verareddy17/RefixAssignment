import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginContainer: {
        backgroundColor: '#000',
        padding: 10,
        width: 350
    },
    text: {
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10
    },
    item: {
        borderRadius: 10
    },
    inputText: {
        backgroundColor: '#fff',
        borderRadius: 10,
        height: 40
    },
    buttonContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        marginVertical: 10
    }
});

export default styles;