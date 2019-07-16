import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right, Badge, SwipeRow, Toast, List, ListItem } from 'native-base';
import { NavigationScreenProp, SafeAreaView, NavigationEvents } from 'react-navigation';
import Config from 'react-native-config';
import styles from './resource-explorer-style';
import LocalDbManager from '../../manager/localdb-manager';
import Bookmarks from '../../models/bookmark-model';
import { Alert, Image, TouchableOpacity, Platform, ProgressBarAndroid, ProgressViewIOS, AsyncStorage, ListView, PanResponder, PanResponderInstance } from 'react-native';
import { ResourceModel, SubResourceModel } from '../../models/resource-model';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import RNFetchBlob from 'rn-fetch-blob';
import NetworkCheckManager from '../../manager/networkcheck-manager';
import { Constant, FileType } from '../../constant';
import PreviewManager from '../../manager/preview-manager';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators, AnyAction } from 'redux';
import { AppState } from '../../redux/reducers/index';
import { DownloadResourceFileProgress } from '../../redux/actions/download-action';
import downloadFile from '../../redux/actions/download-action';
import { any } from 'prop-types';
import Swipeout from 'react-native-swipeout';
import imageCacheHoc from 'react-native-image-cache-hoc';
export const CacheableImage = imageCacheHoc(Image, {
    validProtocols: ['http', 'https'],
});

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    downloadState: DownloadResourceFileProgress;
    requestDownloadFile(bearer_token: string, AppUserResourceID: number, filename: string, filetype: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
}

interface State {
    swipe: boolean;
    bookmarkedFiles: Bookmarks[];
    downloadedFiles: Array<DownloadedFilesModel>;
    UserID?: number;
    BUId?: number;
    marginLeft: number;
    isRowClosed: boolean;
    bearer_token: string;
}

const dirs = RNFetchBlob.fs.dirs.DocumentDir;

class ResourceExplorerScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            swipe: false,
            bookmarkedFiles: [],
            downloadedFiles: [],
            marginLeft: 1,
            isRowClosed: false,
            bearer_token: '',
        };
    }

    public async componentWillMount() {
        await LocalDbManager.get<Bookmarks[]>(Constant.bookmarks, (error, data) => {
            if (data) {
                this.setState({
                    bookmarkedFiles: data,
                });
            }
        });
        await LocalDbManager.get<Array<DownloadedFilesModel>>(Constant.downloadedFiles, (err, data) => {
            if (data) {
                this.setState({ downloadedFiles: data } as State);
            }
        });
        await LocalDbManager.get<string>(Constant.token, async (err, token) => {
            if (token !== null && token !== '') {
                await this.setState({
                    bearer_token: token!,
                });
            }
        });
    }

    public setColorIfFileIsBookmarked(resourceID: number) {
        let bookmarks = this.state.bookmarkedFiles || [];
        const search = (resourceID: number) => bookmarks.find(element => element.resourceId === resourceID);
        if (search(resourceID)) {
            return Constant.blueColor;
        }
        return Constant.blackColor;
    }

    public async onBookmarkButtonPressed(data: ResourceModel) {
        let bookmarkFiles = this.state.bookmarkedFiles || [];
        let index = bookmarkFiles.findIndex(resource => resource.resourceId === data.ResourceId);
        let isRemoved = false;
        if (index > -1) {
            isRemoved = true;
            bookmarkFiles.splice(index, 1); // unbookmarking
        } else {
            isRemoved = false;
            bookmarkFiles.push({ resourceId: data.ResourceId, resourceName: data.ResourceName, resourceImage: data.ResourceImage, resourceType: data.ResourceType }); // adding bookmark
        }
        await LocalDbManager.insert<Bookmarks[]>(Constant.bookmarks, bookmarkFiles, (error) => {
            if (error !== null) {
                Toast.show({ text: error!.message, type: 'warning', position: 'top' });
            } else {
                this.setState({
                    bookmarkedFiles: bookmarkFiles,
                });
                Toast.show({ text: isRemoved ? Constant.bookmarkDeleted : Constant.addedbookmarkTitle, type: 'success', position: 'bottom' });
            }
        });
    }

    public renderFolderImage(rowData: SubResourceModel) {
        if (rowData.ResourceImage === undefined || rowData.ResourceImage === '') {
            return (
                <Image source={require('../../assets/images/folder.png')} style={styles.folderImage} />
            );
        } else {
            return (
                <CacheableImage source={{ uri: rowData.ResourceImage }} style={styles.folderImage} />
            );
        }
    }

    public renderFilesImages(rowData: SubResourceModel) {
        if (rowData.ResourceImage === undefined || rowData.ResourceImage === '') {
            if (rowData.ResourceType === FileType.video) {
                return (
                    <Image source={require('../../assets/images/mp4.png')} style={styles.fileImage} />
                );
            } else if (rowData.ResourceType === FileType.pdf || rowData.ResourceType === FileType.zip) {
                return (
                    <Image source={require('../../assets/images/pdf.png')} style={styles.fileImage} />
                );
            } else if (rowData.ResourceType === FileType.png || rowData.ResourceType === FileType.jpg) {
                return (
                    <Image source={require('../../assets/images/png.png')} style={styles.fileImage} />
                );
            } else {
                if (rowData.ResourceType === FileType.pptx || rowData.ResourceType === FileType.xlsx || rowData.ResourceType === FileType.docx || rowData.ResourceType === FileType.ppt) {
                    return (
                        <Image source={require('../../assets/images/ppt.png')} style={styles.fileImage} />
                    );
                }
            }
        } else {
            return (
                <CacheableImage source={{ uri: rowData.ResourceImage }} style={styles.fileImage} />
            );
        }
    }

    public getBadgeNumber(data: SubResourceModel) {
        if (data !== undefined) {
            if (data.Children !== undefined) {
                let files = data.Children.filter((item) => {
                    return item.ResourceType !== 'Folder';
                });
                if (files.length > 0) {
                    let newDownloadedFiles = this.state.downloadedFiles.filter(downloadFile => files.some(updatedFiles => downloadFile.resourceId === updatedFiles.ResourceId));
                    let badgeNumber = data.Children.length - newDownloadedFiles.length;
                    if (badgeNumber === 0) {
                        return;
                    } else {
                        return (
                            <Badge style={styles.badge} >
                                <Text style={styles.badgeText}>{badgeNumber}</Text>
                            </Badge>
                        );
                    }

                } else {
                    if (data.Children.length === 0) {
                        return;
                    }
                    return (
                        <Badge style={styles.badge} >
                            <Text style={styles.badgeText}>{data.Children.length}</Text>
                        </Badge>
                    );
                }
            }
        }
    }

    public resourceList() {
        let item = this.props.navigation.getParam('item');
        console.log('items', item);
        return item.Children.map((data: SubResourceModel, index: number) => {
            if (data.ResourceType === 'Folder') {
                return (
                    <View key={index}>
                        <SwipeRow
                            disableLeftSwipe={true}
                            disableRightSwipe={true}
                            body={
                                <View style={styles.folderContainer}>
                                    <View style={[styles.folderImageContainer]}>
                                        {this.renderFolderImage(data)}
                                        {this.getBadgeNumber(data)}
                                    </View>
                                    <View style={styles.resourceContainer}>
                                        <TouchableOpacity style={styles.resourceText} onPress={() => this.resourceDetails(data)}>
                                            <Text style={{ marginLeft: 10 }}>{data.ResourceName}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            }
                        />
                    </View>
                );
            } else {
                return (
                    <Swipeout key={index} right={[{
                        text: 'Bookmarks',
                        backgroundColor: 'green',
                        onPress: () => {
                            this.onBookmarkButtonPressed(data);
                        },
                    },
                    {
                        text: 'Delete',
                        backgroundColor: 'red',
                        onPress: () => {
                            this.deleteFileIfAlreadyDownloaded(data.ResourceId);
                        },
                    },
                    ]}
                        autoClose={true} style={styles.swipeContainer}>
                        <View style={styles.fileContainer}>
                            <View style={styles.folderImageContainer}>
                                {this.renderFilesImages(data)}
                            </View>
                            <View style={styles.resourceContainer}>
                                <TouchableOpacity style={styles.resourceText} onPress={() => this.resourceDetails(data, data.ResourceId, data.ResourceName, data.ResourceType, data.ResourceImage, data.LauncherFile)}>
                                    <Text style={{ marginLeft: 10 }}>{data.ResourceName}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.bookmarkIconContainer}>
                                <Icon style={{ color: this.setColorIfFileIsBookmarked(data.ResourceId) }} name='star' />
                            </View>
                        </View>
                        <View style={styles.fileSeparator} />
                    </Swipeout>
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
                            {this.props.downloadState.isLoading ? this.progress() : this.resourceList()}
                        </View>
                    </Content>
                </Container>
            </SafeAreaView>
        );
    }

    public async resourceDetails(data: ResourceModel, resourceId?: number, resourceName?: string, resourceType?: string, resourceImage?: string, launcherFile?: string) {
        if (data.ResourceType === 'Folder') {
            this.props.navigation.push('File', { 'item': data });
        }
        this.loadResourceAsync(resourceId, resourceName, resourceType, resourceImage, launcherFile);
    }

    public progress() {
        const downloadProgress = Math.floor(this.props.downloadState.progress * 100);
        if (Platform.OS === 'ios') {
            return (
                <View style={styles.progressBarConainer}>
                    <Text style={styles.progressBarText}>{`Downloading(${downloadProgress})`}</Text>
                    <ProgressViewIOS style={styles.progressBarWidth} progress={this.props.downloadState.progress} />
                </View>
            );
        } else {
            return (
                <View style={styles.progressBarConainer}>
                    <Text style={styles.progressBarText}>{`Downloading(${downloadProgress})`}</Text>
                    <ProgressBarAndroid styleAttr='Horizontal' style={styles.progressBarWidth} progress={this.props.downloadState.progress} />
                </View>
            );
        }
    }

    public async downloadResource(resourceId: number, resourceName: string, resourceType: string, resourceImage: string, launcherFile: string) {
        const filename = resourceType === FileType.zip ? `${resourceId}${resourceType}` : resourceType === FileType.video ? resourceName.split(' ').join('') : resourceName;
        await this.props.requestDownloadFile(this.state.bearer_token, resourceId, filename, resourceType);
        await this.state.downloadedFiles.push({ resourceName, resourceId, resourceType, resourceImage, launcherFile });
        await LocalDbManager.insert<Array<DownloadedFilesModel>>(Constant.downloadedFiles, this.state.downloadedFiles, async (err) => {
            Toast.show({ text: 'successfully added downloads', type: 'success', position: 'bottom' });
        });
        let path: string = Platform.OS === 'ios' ? dirs : `file://${dirs}`;
        console.log('download resource id', resourceId);
        await PreviewManager.openPreview(path, resourceName, resourceType, resourceId, launcherFile, async (rootPath, launcherFile, fileName, fileType, resourceId) => {
            await this.props.navigation.push('Preview', { 'dir': rootPath, 'launcherFile': launcherFile, 'fileName': fileName, 'fileType': fileType, 'resourceId': resourceId });
        });
    }
    public async deleteFileIfAlreadyDownloaded(resoureID: number) {
        let newData = [...this.state.downloadedFiles];
        const index = newData.findIndex(resource => resource.resourceId === resoureID);
        if (index > -1) {
            newData.splice(index, 1); // removing file if already downloaded
            await this.setState({
                downloadedFiles: newData,
            });
            await LocalDbManager.insert<DownloadedFilesModel[]>(Constant.downloadedFiles, this.state.downloadedFiles, (error) => {
                if (error !== null) {
                    Toast.show({ text: error!.message, type: 'warning', position: 'top' });
                } else {
                    Toast.show({ text: Constant.deleted, type: 'success', position: 'bottom' });
                }
            });
        }

    }

    public async loadResourceAsync(resourceId?: number, resourceName?: string, resourceType?: string, resourceImage?: string, launcherFile?: string) {
        if (!(resourceId && resourceName)) {
            return;
        }
        try {
            await LocalDbManager.get<Array<DownloadedFilesModel>>(Constant.downloadedFiles, async (err, downloadedFiles) => {
                if (!downloadedFiles) {
                    await this.downloadAndSaveResource(resourceId!, resourceName!, resourceType!, resourceImage!, launcherFile || '');
                    return;
                }
                const file = downloadedFiles.find(i => i.resourceId === resourceId);
                if (!file) {
                    await this.downloadAndSaveResource(resourceId!, resourceName!, resourceType!, resourceImage!, launcherFile || '');
                    return;
                }
                let path: string = Platform.OS === 'ios' ? dirs : `file://${dirs}`;
                console.log('downloadedPath', path);
                await PreviewManager.openPreview(path, file.resourceName, file.resourceType, resourceId, launcherFile || '', async (rootPath, launcherFile, fileName, fileType, resourceId) => {
                    await this.props.navigation.push('Preview', { 'dir': rootPath, 'launcherFile': launcherFile, 'fileName': fileName, 'fileType': fileType, 'resourceId': resourceId });
                });
            });
        } catch (error) {
            Toast.show({ text: error, type: 'warning', position: 'top' });
        }
    }

    public async downloadAndSaveResource(resourceId: number, resourceName: string, resourceType: string, resourceImage: string, launcherFile: string) {
        let isConnected = await NetworkCheckManager.isConnected();
        if (!isConnected) {
            Toast.show({ text: 'Please check internet connection', type: 'danger', position: 'top' });
            return;
        }
        this.downloadResource(resourceId!, resourceName!, resourceType!, resourceImage!, launcherFile);
    }
}

const mapStateToProps = (state: AppState) => ({
    downloadState: state.downloadProgress,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    requestDownloadFile: bindActionCreators(downloadFile, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(ResourceExplorerScreen);