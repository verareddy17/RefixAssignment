import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'skyblue',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginContainer: {
        backgroundColor: '#000',
        padding: 10,
        width: 300
    },
    text: {
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10
    },
    inputText: {
        color: '#fff'
    },
    buttonContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        marginVertical: 10
    }
});

export default styles;