import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right, Spinner } from 'native-base';
import { WebView, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationScreenProp, SafeAreaView } from 'react-navigation';
import Config from 'react-native-config';
import styles from './preview-manager-style';
import Video from 'react-native-video';
import { FileType, Constant } from '../../constant';
import RNFetchBlob from 'rn-fetch-blob';

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
        };
    }

    public async componentDidMount() {
        // let str = 'file:///storage/emulated/0/somwhere/foo foo Nov 21, 2018 12:16:04 PM.pdf';
        // let result = str.split(' ').join('%20');
        // console.log('Result', result);
        const dirPath = this.props.navigation.getParam('dir');
        const launcherFile = this.props.navigation.getParam('launcherFile') as string;
        const fileName = this.props.navigation.getParam('fileName') as string;
        const fileType = this.props.navigation.getParam('fileType') as string;
        const resourceId = this.props.navigation.getParam('resourceId') as number;
        if (fileType === FileType.zip) {
            if (launcherFile === '' || launcherFile === undefined || launcherFile === null) {
                let path = await this.findHtmlFile(`${dirPath}/${fileName}`);
                console.log('findIndex', path);
                this.setState({
                    path: path || '',
                    isLoading: false,
                    fileType: fileType,

                });
            } else {
                //TO-DO IF LAUNCHER FILE HAVE
                let replacebackwardSlashInLancherFile = launcherFile.replace(/\\/g, '/');
                console.log('launcher', replacebackwardSlashInLancherFile);
                let splitLauncherPath = replacebackwardSlashInLancherFile.split('/');
                console.log('spiltArray', splitLauncherPath);
                let removeFirstIndexFromLauncher = splitLauncherPath.shift();
                console.log('remove first index', removeFirstIndexFromLauncher, splitLauncherPath);
                let combinedPath = splitLauncherPath.join('/');
                console.log('launcherPath', combinedPath);
                console.log('launcherPathFinal', `${dirPath}/${fileName}/${combinedPath}`);
                this.setState({
                    path: `${dirPath}/${fileName}/${combinedPath}`,
                    isLoading: false,
                    fileType: fileType,
                });
            }

        } else {
            this.setState({
                isLoading: false,
                videoPath: `${dirPath}/${resourceId}${fileType}`,
                fileType: fileType,
            });
        }
    }
    public async findHtmlFile(folder: string) {
        try {
            let files = await RNFetchBlob.fs.ls(folder);
            let htmlFile = files.filter((file) => {
                return file === Constant.indexHtml;
            });
            if (htmlFile.length > 0) {
                return `${folder}/${files[0]}`;
            } else {
                let subFolder = await RNFetchBlob.fs.ls(`${folder}/${files[0]}`);
                let subfolderHtmlFile = subFolder.filter((subfolderFile) => {
                    return subfolderFile === Constant.indexHtml;
                });
                if (subfolderHtmlFile.length > 0) {
                    return `${folder}/${files[0]}/${subfolderHtmlFile[0]}`;
                }
            }
        } catch (error) {

        }
    }

    public renderVideoOrHtmlFile(fileType: string) {
        if (fileType === FileType.video) {
            return (
                <Video
                    source={{ uri: this.state.videoPath }}
                    resizeMode='cover'
                    style={StyleSheet.absoluteFill}
                />
            );
        } else {
            return (
                <WebView
                    originWhitelist={['*']}
                    allowFileAccess={true}
                    source={{ uri: this.state.path }}
                />
            );
        }
    }
    public renderIndicator() {
        return (
            <View style={styles.container}>
                <Spinner style={styles.spinnerConatiner} size={'large'} color='#000' />
            </View>
        );
    }
    public render() {
        const fileName = this.props.navigation.getParam('fileName') as string;
        return (
            <SafeAreaView style={styles.contentContainer} forceInset={{ top: 'never' }}>
                <Container>
                    <Header noShadow style={styles.headerContainer} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                        <Left>
                            <Button transparent onPress={() => this.props.navigation.pop()}>
                                <Icon name='arrow-back' style={styles.iconColor} />
                            </Button>
                        </Left>
                        <Body>
                            <Text>{fileName}</Text>
                        </Body>
                        <Right />
                    </Header>
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
}
