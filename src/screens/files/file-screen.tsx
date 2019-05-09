import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right, Badge, SwipeRow, Toast } from 'native-base';
import { NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { Alert, Image, TouchableOpacity, Platform, ProgressBarAndroid, ProgressViewIOS } from 'react-native';
import Config from 'react-native-config';
import styles from './file-style';
import { ResourceModel, SubResourceModel } from '../../models/resource-model';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import OpenFile from 'react-native-doc-viewer';
import RNFetchBlob from 'rn-fetch-blob';
import LocalDbManager from '../../manager/localdb-manager';
import NetworkCheckManager from '../../manager/networkcheck-manager';
import { Constant } from '../../constant';

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
}

interface State {
    isProgress: boolean;
    progressValue: number;
    downloadedFiles: Array<DownloadedFilesModel>;
}

const dirs = RNFetchBlob.fs.dirs.DocumentDir;

export default class FileScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isProgress: false,
            progressValue: 0,
            downloadedFiles: [],
        };
    }

    public async componentWillMount() {
        await LocalDbManager.get<Array<DownloadedFilesModel>>('downloadedFiles', (err, data) => {
            if (data) {
                this.setState({ downloadedFiles: data } as State);
            }
        });
    }

    public resourceList() {
        let item = this.props.navigation.getParam('item');
        return item.Children.map((data: SubResourceModel, index: number) => {
            if (data.ResourceType === 'folder') {
                return (
                    <View key={index}>
                        <SwipeRow
                            disableLeftSwipe={true}
                            disableRightSwipe={true}
                            body={
                                <View style={styles.folderContainer}>
                                    <View style={styles.folderImageContainer}>
                                        <Image source={{ uri: data.ResourceFolderImage, cache: 'only-if-cached' }}
                                            style={styles.image} />
                                        <Badge style={styles.badge}>
                                            <Text style={styles.badgeText}>{data.ResourcesCount}</Text>
                                        </Badge>
                                    </View>
                                    <View style={styles.resourceContainer}>
                                        <TouchableOpacity style={styles.resourceText} onPress={() => this.resourceDetails(data)}>
                                            <Text>{data.ResourceName}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            }
                        />
                    </View>
                );
            } else {
                return (
                    <View key={index}>
                        <SwipeRow
                            style={styles.swipeContainer}
                            disableRightSwipe={true}
                            rightOpenValue={-153}
                            body={
                                <View style={styles.folderContainer}>
                                    <View style={styles.folderImageContainer}>
                                        <Image source={{ uri: data.ResourceImage, cache: 'only-if-cached' }}
                                            style={styles.image} />
                                    </View>
                                    <View style={styles.resourceContainer}>
                                        <TouchableOpacity style={styles.resourceText} onPress={() => this.resourceDetails(data, data.ResourceID, data.ResourceName, data.FileType, data.ResourceImage)}>
                                            <Text>{data.ResourceName}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.bookmarkIconContainer}>
                                        <Icon name='star' />
                                    </View>
                                </View>
                            }
                            right={
                                <View style={styles.folderContainer}>
                                    <Button warning full onPress={() => Alert.alert('Bookmark')} style={styles.bookmarkContainer}>
                                        <Icon active name='star' />
                                        <Text style={styles.bookmarkText}>Bookmark</Text>
                                    </Button>
                                    <Button danger full onPress={() => Alert.alert('Trash')} style={styles.bookmarkContainer}>
                                        <Icon active name='trash' />
                                        <Text style={styles.bookmarkText}>Delete</Text>
                                    </Button>
                                </View>
                            }
                        />
                    </View>
                );
            }
        });
    }

    public render() {
        let item = this.props.navigation.getParam('item');
        return (
            <SafeAreaView style={styles.container} forceInset={{ top: 'never' }}>
                <Container>
                    <Header noShadow style={styles.headerBg} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                        <Left>
                            <Button transparent onPress={() => this.props.navigation.pop()}>

                                <Icon name='arrow-back' style={styles.iconColor} />
                            </Button>
                        </Left>
                        <Body>
                            <Title style={styles.headerTitle}>{item.ResourceName}</Title>
                        </Body>
                        <Right />
                    </Header>
                    <Content contentContainerStyle={styles.container}>
                        <View style={styles.container}>
                            {this.state.isProgress ? this.progress() : this.resourceList()}
                        </View>
                    </Content>
                </Container>
            </SafeAreaView>
        );
    }

    public async resourceDetails(data: ResourceModel, resourceId?: number, resourceName?: string, resourceType?: string, resourceImage?: string) {
        if (data.ResourceType === 'folder') {
            this.props.navigation.push('File', { 'item': data });
        }
        this.loadResourceAsync(resourceId, resourceName, resourceType, resourceImage);
    }

    public progress() {
        if (Platform.OS === 'ios') {
            return (
                <ProgressViewIOS style={styles.progressBarWidth} progress={this.state.progressValue} />
            );
        } else {
            return (
                <View style={styles.progressBarConainer}>
                    <Text style={styles.progressBarText}>Downloading</Text>
                    <ProgressBarAndroid styleAttr='Horizontal' style={styles.progressBarWidth} progress={this.state.progressValue} />
                </View>
            );
        }
    }

    public openPreview(dir: string, fileName: string, fileType: string) {
        OpenFile.openDoc([{
            url: `${dir}/${fileName}`,
            fileName: fileName,
            fileType: fileType,
            cache: false,
        }], (error, url) => {
            if (error) {
                console.log('error of fteching path: ', error);
            } else {
                console.log('fetching path of downloaded file : ', url);
            }
        });
    }

    public downloadResource(resourceId: number, resourceName: string, resourceType: string, resourceImage: string) {
        let params = {
            'AppUserResourceID': resourceId,
            'UserID': 2653,
            'BUId': 274,
        };
        RNFetchBlob.config({
            path: `${dirs}/${resourceName}`,
        }).fetch('POST', `${Config.BASE_URL}/${Constant.downloadFile}`, {
            'Content-Type': 'application/json',
        }, JSON.stringify(params)).progress((received, total) => {
            this.setState({
                progressValue: (received / total),
            });
        }).then(async (res) => {
            this.setState({ isProgress: false });
            this.state.downloadedFiles.push({ resourceName, resourceId, resourceType, resourceImage });
            await LocalDbManager.insert<Array<DownloadedFilesModel>>('downloadedFiles', this.state.downloadedFiles, async (err) => {
                console.log('Successfully inserted');
            });
            let path: string = Platform.OS === 'ios' ? dirs : `file://${dirs}`;
            this.openPreview(path, resourceName, resourceType);
        });
    }

    public async loadResourceAsync(resourceId?: number, resourceName?: string, resourceType?: string, resourceImage?: string) {
        if (!(resourceId && resourceName)) {
            console.log('file-screen: loadResourceAsync: resourceId or resourceName is null or undefined');
            return;
        }
        try {
            await LocalDbManager.get<Array<DownloadedFilesModel>>('downloadedFiles', async (err, data) => {
                if (!data) {
                    await this.downloadAndSaveResource(resourceId!, resourceName!, resourceType!, resourceImage!);
                    return;
                }
                const fileExists = data.find(i => i.resourceId === resourceId);
                if (!fileExists) {
                    await this.downloadAndSaveResource(resourceId!, resourceName!, resourceType!, resourceImage!);
                    return;
                }
                let path: string = Platform.OS === 'ios' ? dirs : `file://${dirs}`;
                this.openPreview(path, fileExists.resourceName, fileExists.resourceType);
            });
        } catch (error) {
            console.log('file-screen: loadResourceAsync', error);
        }
    }

    public async downloadAndSaveResource(resourceId: number, resourceName: string, resourceType: string, resourceImage: string) {
        let isConnected = await NetworkCheckManager.isConnected();
        if (!isConnected) {
            Toast.show({
                text: 'Please check internet connection',
                type: 'danger',
                position: 'top',
            });
            return;
        }
        this.setState({ isProgress: true });
        this.downloadResource(resourceId!, resourceName!, resourceType!, resourceImage!);
    }
}