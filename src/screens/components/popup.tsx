import React, { Component } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, WebView, Dimensions, Platform } from 'react-native';
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
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    inner: {
        position: 'absolute',
        width: 300,
        alignSelf: 'center',
        top: '35%',
        height: 150,
        bottom: 25,
        backgroundColor: '#fff',
        borderRadius: 20        
    },
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        marginBottom: 5,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    buttonConatiner: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
    buttonTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    webviewContainer: {
        flex: 0,
        overflow: 'hidden',
        width: '100%',
        height: '52%',
        backgroundColor: 'red'
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
                    <View style={styles.webviewContainer}>
                        <WebView automaticallyAdjustContentInsets={true}
                            scalesPageToFit={(Platform.OS === 'ios') ? false : true}
                            source={{ html: this.props.message }}
                        />
                    </View>
                    <TouchableOpacity style={styles.buttonConatiner} onPress={() => this.props.togglePopUp()}>
                        <Text style={styles.buttonTitle}>ACCEPT</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

export default Popup;