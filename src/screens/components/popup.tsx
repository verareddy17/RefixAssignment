import React, { Component } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, WebView, Dimensions } from 'react-native';
interface Props {
    message: string;
    togglePopUp(): Promise<void>;
}


const styles = StyleSheet.create({
    popup: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0, 0.4)',
    },
    inner: {
        position: 'absolute',
        left: '20%',
        right: '20%',
        top: '40%',
        height: '20%',
        bottom: 25,
        backgroundColor: '#fff',
    },
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        marginBottom: 5,
        fontSize: 20,
        fontWeight: 'bold',
    },
    buttonConatiner: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonTitle: {
        marginBottom: 5,
        fontSize: 15,
        fontWeight: 'bold',
    },
});
class Popup extends Component<Props> {
    constructor(props: Props) {
        super(props);
    }
    public render() {
        return (
            <View style={styles.popup}>
                <View style={styles.inner}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Advisory Notice</Text>
                    </View>
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: this.props.message }}
                    />
                    <TouchableOpacity style={styles.buttonConatiner} onPress={() => this.props.togglePopUp()}>
                        <Text style={styles.buttonTitle}>ACCEPT</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

export default Popup;