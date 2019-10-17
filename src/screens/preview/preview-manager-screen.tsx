import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Right, Spinner } from 'native-base';
import { WebView, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { NavigationScreenProp, SafeAreaView } from 'react-navigation';
import Config from 'react-native-config';
import styles from './preview-manager-style';
import Video from 'react-native-video';
import { FileType, Constant } from '../../constant';
import PreviewManager from '../../manager/preview-manager';
import VideoPlayer from 'react-native-video-controls';
import Orientation from 'react-native-orientation';
import { handleOrientationOfScreen, getInitialScreenOrientation, removeOrientationOfScreen } from '../components/screen-orientation';
import images from '../../assets/index';
const Device = require('react-native-device-detection');

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
}

interface State {
    isLoading: boolean;
    path: string;
    dirPath: string;
    resourceId: number;
    fileType: string;
    videoPath: string;
    isEnterFullScreen: boolean;
    width: number;
    height: number;
    orientation: string;
}
export default class PreviewManagerScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: true,
            path: '',
            dirPath: '',
            resourceId: 0,
            fileType: '',
            videoPath: '',
            isEnterFullScreen: false,
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            orientation: getInitialScreenOrientation(),
        };
        Orientation.getOrientation((_err, orientations) => this.setState({ orientation: orientations }));
    }

    public async componentDidMount() {
        handleOrientationOfScreen((orientation) => {
            this.setState({
                orientation: orientation,
            });
        });
        const dirPath = this.props.navigation.getParam('dir');
        const launcherFile = this.props.navigation.getParam('launcherFile') as string;
        const fileName = this.props.navigation.getParam('fileName') as string;
        const fileType = this.props.navigation.getParam('fileType') as string;
        const resourceId = this.props.navigation.getParam('resourceId') as number;
        await PreviewManager.previewZipOrVideoFile(dirPath, launcherFile, fileName, fileType, resourceId, async (path, isLoading, type) => {
            if (type === FileType.video) {
                this.setState({
                    isLoading: isLoading,
                    videoPath: path,
                    fileType: fileType,
                });
            } else {
                const htmlPath = Constant.platform === 'android' ? `file://${path}` : path;
                console.log('html path', htmlPath);
                this.setState({
                    path: htmlPath,
                    isLoading: isLoading,
                    fileType: fileType,
                });
            }
        });
    }

    public renderVideoOrHtmlFile(fileType: string) {
        if (fileType === FileType.video) {
            return (
                <VideoPlayer
                    source={{ uri: this.state.videoPath }}
                    style={StyleSheet.absoluteFill}
                    navigator={this.props.navigation}
                    onEnterFullscreen={() => {
                        this.setState({ isEnterFullScreen: true })
                    }}
                    onExitFullscreen={() => {
                        this.setState({ isEnterFullScreen: false })
                    }}
                />
            );
        } else {
            return (
                <WebView
                    originWhitelist={['*']}
                    allowFileAccess={true}
                    domStorageEnabled={true}
                    javaScriptEnabled={true}
                    mediaPlaybackRequiresUserAction={false}
                    source={{ uri: this.state.path }}
                />
            );
        }
    }
    public renderIndicator() {
        return (
            <View style={styles.container}>
                <Spinner style={styles.spinnerConatiner} size={'large'} color={Constant.blackColor} />
            </View>
        );
    }
    public render() {
        const fileName = this.props.navigation.getParam('fileName') as string;
        return (
            <SafeAreaView style={styles.contentContainer} forceInset={{ top: 'never' }}>
                {this.state.orientation === Constant.portrait ? <Header style={styles.headerContainer}>
                    <TouchableOpacity style={styles.headerLogoContainer} onPress={() => this.props.navigation.navigate('Home')}>
                        <Image source={{ uri: Constant.headerImage }} style={styles.headerImage} />
                    </TouchableOpacity>
                </Header> : null}
                <Container>
                    <View style={styles.backArrowContainer}>
                        <Button transparent onPress={() => this.props.navigation.pop()}>
                            <Image source={images.backArrow} style={styles.backArrow} />
                        </Button>
                        <Text style={styles.fileName}>{fileName}</Text>
                    </View>
                    <Content contentContainerStyle={styles.contentContainer}>
                        {this.state.isLoading ? this.renderIndicator()
                            : <View style={styles.contentContainer}>
                                {this.renderVideoOrHtmlFile(this.state.fileType)}
                            </View>
                        }
                    </Content>
                </Container>
            </SafeAreaView>
        );
    }
    public componentWillUnmount() {
        removeOrientationOfScreen();
    }
}
