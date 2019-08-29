import React from 'react';
import { View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    seperatorContainer: {
        height: 1,
        width: '100%',
        backgroundColor: '#ffffff',
    },
});

const separatorComponent = () => {
    return (<View style={styles.seperatorContainer} />);
};


export default separatorComponent;