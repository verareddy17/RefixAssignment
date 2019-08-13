import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right, Badge, SwipeRow, Toast, List, ListItem } from 'native-base';
import { NavigationScreenProp, SafeAreaView, NavigationEvents } from 'react-navigation';
import Config from 'react-native-config';
import styles from './resource-explorer-style';
import LocalDbManager from '../../manager/localdb-manager';
import Bookmarks from '../../models/bookmark-model';
import { Alert, Image, TouchableOpacity, Platform, ProgressBarAndroid, ProgressViewIOS, ImageBackground, Dimensions, BackHandler } from 'react-native';
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
import downloadFile, { downloadCancel } from '../../redux/actions/download-action';
import { any } from 'prop-types';
import Swipeout from 'react-native-swipeout';
import imageCacheHoc from 'react-native-image-cache-hoc';
import Orientation from 'react-native-orientation';
import images from '../../assets/index';
import Breadcrumb from 'react-native-breadcrumb';
import FileImages from '../../assets/file-images';
export const CacheableImage = imageCacheHoc(Image, {
    validProtocols: ['http', 'https'],
});

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    downloadState: DownloadResourceFileProgress;
    requestDownloadFile(bearer_token: string, AppUserResourceID: number, filename: string, filetype: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    requestDownloadCancel(): (dispatch: Dispatch<AnyAction>, getState: Function) => Promise<void>;
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
    backgroundPortraitImage: string;
    backgroundLandscapeImage: string;
    orientation: string;
    fontColor?: string;
    index: number;
    content: string[];
    breadscumbItemsCount: number;
    backButton: boolean;
    flowDepth: number;
}

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
            backgroundPortraitImage: '',
            backgroundLandscapeImage: '',
            orientation: Constant.portrait,
            index: 0,
            content: [],
            breadscumbItemsCount: 0,
            backButton: true,
            flowDepth: 0,

        };
        this.onCrumbPress = this.onCrumbPress.bind(this);
        this.handleAndroidBackButton = this.handleAndroidBackButton.bind(this);
    }

    public async componentDidMount() {
        let item = await this.props.navigation.getParam('item');
        Constant.index = Constant.index + 1;
        Constant.content = [...Constant.content, item.ResourceName];
        Constant.navigationKey = [...Constant.navigationKey, this.props.navigation.state.key];
        this.setState({
            index: Constant.index,
            content: Constant.content,
            breadscumbItemsCount: Constant.content.length,
            flowDepth: Constant.content.length - 1,
        });
        Orientation.unlockAllOrientations();
        await LocalDbManager.get(Constant.fontColor, (err, color) => {
            if (color !== null || color !== '') {
                this.setState({ fontColor: color } as State);
            }
        });
        Orientation.addOrientationListener(this._orientationDidChange);
        await LocalDbManager.get<string>(Constant.backgroundPortraitImage, (err, image) => {
            if (image !== null && image !== '') {
                this.setState({
                    backgroundPortraitImage: image!,
                });
            }
        });
        await LocalDbManager.get<string>(Constant.backgroundLandscapeImage, (err, image) => {
            if (image !== null && image !== '') {
                this.setState({
                    backgroundLandscapeImage: image!,
                });
            }
        });
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
        BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackButton);
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
            bookmarkFiles.push({ resourceId: data.ResourceId, resourceName: data.ResourceName, resourceImage: data.ResourceImage, resourceType: data.FileExtension }); // adding bookmark
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
                <Image source={images.folder} style={styles.folderImage} />
            );
        } else {
            return (
                <CacheableImage source={{ uri: rowData.ResourceImage }} style={styles.folderImage} />
            );
        }
    }

    public getBadgeNumber(data: SubResourceModel) {
        if (data !== undefined) {
            if (data.Children !== undefined) {
                let files = data.Children.filter((item) => {
                    return item.ResourceType !== 0;
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
            if (data.ResourceType === 0) {
                return (
                    <View key={index}>
                        <SwipeRow style={styles.transparentColor}
                            disableLeftSwipe={true}
                            disableRightSwipe={true}
                            body={
                                <TouchableOpacity style={styles.folderContainer} onPress={() => this.resourceDetails(data)}>
                                    <View style={[styles.folderImageContainer]}>
                                        {this.renderFolderImage(data)}
                                        {this.getBadgeNumber(data)}
                                    </View>
                                    <View style={styles.resourceContainer}>
                                        <Text style={{ marginLeft: 10 }}>{data.ResourceName}</Text>
                                    </View>
                                </TouchableOpacity>
                            }
                        />
                        <View style={styles.fileSeparator} />
                    </View>
                );
            } else {
                return (
                    <Swipeout key={index} right={[
                        // {
                        //     component: (<View style={styles.swipeoutContainer}>
                        //         <Icon style={styles.swipeButtonIcon} name='star' />
                        //         <Text style={styles.swipeButtonIcon}>Bookmark</Text>
                        //     </View>),
                        //     backgroundColor: '#ffae42',
                        //     onPress: () => {
                        //         this.onBookmarkButtonPressed(data);
                        //     },
                        // },
                        {
                            component: (<View style={styles.swipeoutContainer}>
                                <Icon style={styles.swipeButtonIcon} name='trash' />
                                <Text style={styles.swipeButtonIcon}>Delete</Text>
                            </View>),
                            backgroundColor: '#d11a2a',
                            onPress: () => {
                                this.deleteFileIfAlreadyDownloaded(data.ResourceId, data.ResourceName, data.FileExtension);
                            },
                        },
                    ]}
                        autoClose={true} style={[styles.swipeContainer]}>
                        <TouchableOpacity onPress={() => this.resourceDetails(data, data.ResourceId, data.ResourceName, data.FileExtension, data.ResourceImage, data.LauncherFile)}>
                            <View style={styles.fileContainer}>
                                <View style={styles.folderImageContainer}>
                                    <FileImages fileImage={data.ResourceImage || ''} fileType={data.FileExtension} styles={styles.fileImage} />
                                </View>
                                <View style={styles.resourceContainer}>
                                    <Text style={{ marginLeft: 10 }}>{data.ResourceName}</Text>
                                </View>
                                <View style={styles.bookmarkIconContainer}>
                                    <Icon style={{ color: this.setColorIfFileIsBookmarked(data.ResourceId) }} name='' />
                                </View>
                            </View>
                            <View style={styles.fileSeparator} />
                        </TouchableOpacity>
                    </Swipeout>
                );
            }
        });
    }

    public render() {
        let { height, width } = Dimensions.get('window');
        let item = this.props.navigation.getParam('item');
        return (
            <SafeAreaView style={styles.container} forceInset={{ top: 'never', left: 'never' }}>
                <ImageBackground source={{ uri: this.state.orientation === Constant.portrait ? this.state.backgroundPortraitImage : this.state.backgroundLandscapeImage }} style={{ width, height }}>
                    <Container style={styles.transparentColor}>
                        {this.props.downloadState.isLoading ? <View /> : <Header noShadow style={styles.headerBg} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                            <Left style={{ flexDirection: 'row' }}>
                                <Button transparent onPress={() => this.goToPreviousScreen()}>
                                    <Icon name='arrow-back' style={[styles.iconColor]} />
                                </Button>
                            </Left>
                            <Body>
                                <Title style={{color: this.state.fontColor || '#fff' }}>{item.ResourceName}</Title>
                            </Body>
                            {Constant.platform === 'ios' ? <Right/> : null}
                        </Header>}
                        {this.props.downloadState.isLoading ? null : <View style={styles.breadscrumbContainer}>
                            <Breadcrumb
                                entities={this.state.content}
                                isTouchable={true}
                                flowDepth={this.state.flowDepth}
                                height={30}
                                onCrumbPress={this.onCrumbPress}
                                borderRadius={5}
                                crumbTextStyle={{ fontSize: 15 }}
                                crumbsContainerStyle={[styles.breadscrumbsView]}
                                activeCrumbStyle={{ backgroundColor: Config.PRIMARY_COLOR }}
                            />
                        </View>}
                        <Content contentContainerStyle={[styles.container, { paddingBottom: Constant.platform === 'android' ? 30 : 0 }]}>
                            <View style={styles.container}>
                                {this.props.downloadState.isLoading ? this.progress() : this.resourceList()}
                            </View>
                        </Content>
                    </Container>
                </ImageBackground>
            </SafeAreaView>
        );
    }

    public async resourceDetails(data: ResourceModel, resourceId?: number, resourceName?: string, resourceType?: string, resourceImage?: string, launcherFile?: string) {
        if (data.ResourceType === 0) {
            this.props.navigation.push('File', { 'item': data });
        }
        this.loadResourceAsync(resourceId, resourceName, resourceType, resourceImage, launcherFile);
    }

    public async cancelDownload() {
        await this.props.requestDownloadCancel();
    }

    public progress() {
        const downloadProgress = Math.floor(this.props.downloadState.progress * 100);
        if (Platform.OS === 'ios') {
            return (
                <View style={styles.progressBarConainer}>
                    <View style={styles.downloadContainer}>
                        <Text style={styles.progressBarText}>{`Downloading(${downloadProgress}%)`}</Text>
                        <ProgressViewIOS style={styles.progressBarWidth} progress={this.props.downloadState.progress} />
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
                        <ProgressBarAndroid styleAttr='Horizontal' style={styles.progressBarWidth} progress={this.props.downloadState.progress} />
                        <TouchableOpacity onPress={() => this.cancelDownload()}>
                            <Text style={styles.downloadingText}>CANCEL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    }

    public async downloadResource(resourceId: number, resourceName: string, resourceType: string, resourceImage: string, launcherFile: string) {
        const filename = resourceType === FileType.zip ? `${resourceId}${resourceType}` : resourceType === FileType.video ? resourceName.split(' ').join('') : resourceName;
        await this.props.requestDownloadFile(this.state.bearer_token, resourceId, filename, resourceType);
        if (this.props.downloadState.error !== '') {
            Alert.alert(Config.APP_NAME, Constant.cancelDownload);
            return;
        }
        await this.state.downloadedFiles.push({ resourceName, resourceId, resourceType, resourceImage, launcherFile });
        await LocalDbManager.insert<Array<DownloadedFilesModel>>(Constant.downloadedFiles, this.state.downloadedFiles, async (err) => {
            Toast.show({ text: 'successfully added downloads', type: 'success', position: 'bottom' });
        });
        const path: string = Platform.OS === 'ios' ? Constant.documentDir : resourceType === FileType.zip ? Constant.documentDir : `file://${Constant.documentDir}`;
        console.log('preview path', path);
        await PreviewManager.openPreview(path, resourceName, resourceType, resourceId, launcherFile, async (rootPath, launcherFile, fileName, fileType, resourceId) => {
            await this.props.navigation.push('Preview', { 'dir': rootPath, 'launcherFile': launcherFile, 'fileName': fileName, 'fileType': fileType, 'resourceId': resourceId });
        });
    }
    public async deleteFileIfAlreadyDownloaded(resoureID: number, resourceName: string, fileType: string) {
        console.log('resource name', resourceName);
        console.log('dir', Constant.documentDir);
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
                    const filename = fileType === FileType.zip ? `${resoureID}${fileType}` : fileType === FileType.video ? `${resoureID}${fileType}` : resourceName;
                    LocalDbManager.unlinkFile(`${Constant.deleteFilePath}/${filename}`, fileType, `${Constant.deleteFilePath}/${resoureID}`);
                    Toast.show({ text: Constant.deleted, type: 'success', position: 'bottom' });
                }
            });
        } else {
            Alert.alert(Config.APP_NAME, Constant.deleteFile);
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
                const path: string = Platform.OS === 'ios' ? Constant.documentDir : resourceType === FileType.zip ? Constant.documentDir : `file://${Constant.documentDir}`;
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
            Toast.show({ text: Constant.noInternetConnction, type: 'danger', position: 'top' });
            return;
        }
        this.downloadResource(resourceId!, resourceName!, resourceType!, resourceImage!, launcherFile);
    }

    public componentWillUnmount() {
        Orientation.removeOrientationListener(this._orientationDidChange);
        BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackButton);
    }

    public handleAndroidBackButton() {
        if (this.props.navigation.state.key === Constant.navigationKey[0]) {
            Constant.navigationKey.pop();
            Constant.content.pop();
            Constant.index = Constant.index - 1;
            const flowDepth = Constant.content.length > 0 ? Constant.content.length - 1 : Constant.content.length;
            this.setState({
                index: Constant.index,
                content: Constant.content,
                flowDepth: flowDepth,
            });
        }
        if (this.props.downloadState.progress !== 0) {
            return true;
        }
    }

    public _orientationDidChange = (orientation: string) => {
        if (orientation === Constant.landscape) {
            this.setState({ orientation: Constant.landscape });
        } else {
            this.setState({ orientation: Constant.portrait });
        }
    }

    private goToPreviousScreen() {
        Constant.navigationKey.pop();
        Constant.content.pop();
        Constant.index = Constant.index - 1;
        this.setState({
            index: Constant.index,
            content: Constant.content,
            flowDepth: Constant.content.length - 1,
        });
        this.props.navigation.pop();
    }

    private onCrumbPress(index: number) {
        const key = Constant.navigationKey[index];
        for (let i = Constant.navigationKey.length - 1; i >= 0; --i) {
            if (Constant.navigationKey[i] === Constant.navigationKey[index]) {
                Constant.navigationKey.pop();
                Constant.content.pop();
                break;
            } else {
                Constant.navigationKey.pop();
                Constant.content.pop();
            }
        }
        this.setState({
            content: Constant.content,
            flowDepth: index - 1,
        });
        this.props.navigation.goBack(key);
    }
}

const mapStateToProps = (state: AppState) => ({
    downloadState: state.downloadProgress,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    requestDownloadFile: bindActionCreators(downloadFile, dispatch),
    requestDownloadCancel: bindActionCreators(downloadCancel, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(ResourceExplorerScreen);
