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
    dirPath: string;
    launcherFile: string;
    fileName: string;
    fileType: string;
    resourceId: number;
    unzipPath: string;
}
export default class PreviewManagerScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: false,
            dirPath: '',
            launcherFile: '',
            fileName: '',
            fileType: '',
            resourceId: 0,
            unzipPath: '',
        };
    }

    public async componentWillMount() {
        this.setState({
            isLoading: true,
        });
    }

    public async componentDidMount() {
        const dirPath = this.props.navigation.getParam('dir');
        const launcherFile =  this.props.navigation.getParam('launcherFile') as string;
        const fileName =  this.props.navigation.getParam('fileName') as string;
        const fileType =  this.props.navigation.getParam('fileType') as string;
        const resourceId =  this.props.navigation.getParam('resourceId') as number;
        this.setState({
            dirPath: dirPath,
            launcherFile: launcherFile,
            fileName: fileName,
            fileType: fileType,
            resourceId: resourceId,
        });
        if (this.state.fileType === FileType.zip) {
            const index = await this.findHtmlFile(`${this.state.dirPath}/${this.state.fileName}`);
            console.log('index', index);
        }
    }

    public async findHtmlFile(folder: string) {
        // const zipFile = `${RNFetchBlob.fs.dirs.DocumentDir}/${folder}/`;
        console.log('folder', folder);
        try {
            let files = await RNFetchBlob.fs.ls(folder);
            console.log('files', files);
            let htmlFile = files.filter((file) => {
                return file === Constant.indexHtml;
            });
            console.log('html file', htmlFile);
            if (htmlFile.length > 0) {
                return `${folder}/${files[0]}`;
            } else {
                console.log('subfolderPath', `${folder}/${folder[0]}`);
                let subFolder = await RNFetchBlob.fs.ls(`${folder}/${files[0]}`);
                console.log('subfolder', subFolder);
                let subfolderHtmlFile = subFolder.filter((subfolderFile) => {
                    return subfolderFile === Constant.indexHtml;
                });
                if (subfolderHtmlFile.length > 0) {
                    return `${folder}/${files[0]}/${subfolderHtmlFile[0]}`;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async renderVideoOrHtmlFile(fileType: string, dirPath: string, launcherFile: string, fileName: string, resourceId: number) {
        console.log(',,,,,', `${dirPath}/${resourceId}${fileType}`);
        console.log('fileName', fileName);
        console.log('launcher file', launcherFile);
        console.log('dirPath', dirPath);
        if (fileType === FileType.video) {
            return (
                <Video
                    source={{ uri: `${dirPath}/${resourceId}${fileType}` }}
                    resizeMode='cover'
                    style={StyleSheet.absoluteFill}
                />
            );
        } else {
            if (launcherFile === '' || launcherFile === undefined || launcherFile === null) {
                return (
                    <WebView
                        originWhitelist={['*']}
                        source={{ uri: `${dirPath}/${fileName}/${'index.html'}` }}
                    />
                );
            } else {

            }
        }
    }
    
    public reRender() {
      return(<View/>)
    }
    public render() {
        // const dirPath = this.props.navigation.getParam('dir');
        // const launcherFile = this.props.navigation.getParam('launcherFile') as string;
        const fileName = this.props.navigation.getParam('fileName') as string;
        // const fileType = this.props.navigation.getParam('fileType') as string;
        // const resourceId = this.props.navigation.getParam('resourceId') as number;
        // console.log('resourceid', resourceId);
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
                        <View style={styles.contentContainer}>
                            {this.state.isLoading ?
                                <Spinner style={styles.spinnerConatiner} size={'large'} color='#fff' />
                                :  this.reRender()
                            }
                        </View>
                    </Content>
                </Container>
            </SafeAreaView>
        );
    }
}
