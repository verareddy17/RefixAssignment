
import React, { Component } from 'react';
import { View, Platform, TouchableOpacity, ProgressBarAndroid, ProgressViewIOS, StyleSheet, Text } from 'react-native';

const styles = StyleSheet.create({
    progressBarWidth: {
        width: '100%',
    },
    progressBarText: {
        color: '#000',
        textAlign: 'center',
    },
    downloadContainer: {
        height: 150,
        width: '90%',
        backgroundColor: '#ffffff',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    progressBarConainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    downloadingText: {
        color: '#000000',
    },
});

interface Props {
  downloadingProgress: number;
  cancelDownload(): Promise<void>;
}

class DownloadProgressComponent extends Component<Props> {
    constructor(props: Props) {
        super(props);
        this.cancelDownload = this.cancelDownload.bind(this);
    }
    public async cancelDownload() {
       await this.props.cancelDownload();
    }
    public render() {
        const downloadProgress = Math.floor(this.props.downloadingProgress * 100);
        if (Platform.OS === 'ios') {
            return (
                <View style={styles.progressBarConainer}>
                    <View style={styles.downloadContainer}>
                        <Text style={styles.progressBarText}>{`Downloading(${downloadProgress}%)`}</Text>
                        <ProgressViewIOS style={styles.progressBarWidth} progress={this.props.downloadingProgress} />
                        <TouchableOpacity onPress={() => this.cancelDownload()}>
                            <Text style={styles.downloadingText}>CANCEL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={styles.progressBarConainer}>
                    <View style={styles.downloadContainer}>
                        <Text style={styles.progressBarText}>{`Downloading(${downloadProgress}%)`}</Text>
                        <ProgressBarAndroid styleAttr='Horizontal' style={styles.progressBarWidth} progress={this.props.downloadingProgress} />
                        <TouchableOpacity onPress={() => this.props.cancelDownload()}>
                            <Text style={styles.downloadingText}>CANCEL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    }
}

export default DownloadProgressComponent;
