import React, { Component } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import Config from 'react-native-config';
import { Spinner } from 'native-base';
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
        left: '20%',
        right: '20%',
        top: '40%',
        height: 150,
        bottom: 25,
        width: 150,
        backgroundColor: '#fff',
        borderRadius: 20
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    refreshTitle: {
        fontSize: 20,
        fontWeight: 'bold'
    },
})

class Loader extends Component {
    render() {
        return (
            <View style={styles.popup}>
                <View style={styles.inner}>
                    <View style={styles.loadingContainer}>
                        <Text style={styles.refreshTitle}>Refreshing Resources...</Text>
                        <Spinner color={Config.PRIMARY_COLOR}></Spinner>
                    </View>
                </View>
            </View>
        )
    }
}

export default Loader;