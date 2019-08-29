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
import FileImageComponent from '../components/file-images';
import FolderImageComponet from '../components/folder-images';
import { removeOrientationOfScreen, handleOrientationOfScreen, getInitialScreenOrientation, handleScreenDimensions, removeScreenDimensionsListner } from '../components/screen-orientation';
import { LoginResponse } from '../../redux/actions/user-action';
import Orientation from 'react-native-orientation';
import BreadsCrumb from '../components/breadscrumb/breads-crumb';
import { AddItem, RemoveItem, DownloadedResources, FetchAllDownloadedFiles } from '../../redux/actions/downloaded-file-action';
import badgeNumber from '../components/badge-number';
interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    downloadState: DownloadResourceFileProgress;
    userState: LoginResponse;
    downloadedFiles: DownloadedResources;
    requestDownloadFile(bearer_token: string, AppUserResourceID: number, filename: string, filetype: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    requestDownloadCancel(): (dispatch: Dispatch<AnyAction>, getState: Function) => Promise<void>;
    addDownloadedFile(downloadedFile: DownloadedFilesModel): (dispatch: Dispatch, getState: Function) => Promise<void>;
    removeDownloadedFile(resourceId: number): (dispatch: Dispatch, getState: Function) => Promise<void>;
    fetchdownloadedFiles(files: DownloadedFilesModel[]): (dispatch: Dispatch<AnyAction>) => Promise<void>;
}

interface State {
    swipe: boolean;
    bookmarkedFiles: Bookmarks[];
    downloadedFiles: Array<DownloadedFilesModel>;
    UserID?: number;
    BUId?: number;
    marginLeft: number;
    isRowClosed: boolean;
    orientation: string;
    index: number;
    content: string[];
    backButton: boolean;
    width: number;
    height: number;
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
            orientation: Orientation.getInitialOrientation(),
            index: 0,
            content: [],
            backButton: true,
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
        };
        this.onBreadCrumbPress = this.onBreadCrumbPress.bind(this);
        this.handleAndroidBackButton = this.handleAndroidBackButton.bind(this);
        Orientation.getOrientation((_err, orientations) => this.setState({ orientation: orientations }));
    }

    public async componentDidMount() {
        let item = await this.props.navigation.getParam('item');
        Constant.index = Constant.index + 1;
        Constant.content = [...Constant.content, item.ResourceName];
        Constant.navigationKey = [...Constant.navigationKey, this.props.navigation.state.key];
        this.setState({
            index: Constant.index,
            content: Constant.content,
        });
        handleOrientationOfScreen((orientation) => {
            this.setState({
                orientation: orientation,
            });
        });
        handleScreenDimensions((width, height) => {
            this.setState({
                width: width,
                height: height,
            });
        });
        await LocalDbManager.get<Bookmarks[]>(Constant.bookmarks, (error, data) => {
            if (data) {
                this.setState({
                    bookmarkedFiles: data,
                });
            }
        });
        await LocalDbManager.get<Array<DownloadedFilesModel>>(Constant.downloadedFiles, async (err, data) => {
            if (data) {
                this.setState({ downloadedFiles: data } as State);
                await this.props.fetchdownloadedFiles(this.state.downloadedFiles);
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
                                        <FolderImageComponet styles={styles.folderImage} folderImage={data.ResourceImage} />
                                        {badgeNumber(data, this.props.downloadedFiles.downloadedfiles)}
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
                                    <FileImageComponent fileImage={data.ResourceImage || ''} fileType={data.FileExtension} styles={styles.fileImage} />
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
        let item = this.props.navigation.getParam('item');
        console.log('render', this.state.orientation);
        return (
            <SafeAreaView style={styles.container} forceInset={{ top: 'never', left: 'never' }}>
                <ImageBackground source={{ uri: this.state.orientation === Constant.portrait ? Constant.portraitImagePath : Constant.landscapeImagePath }} style={{ width: this.state.width, height: this.state.height }}>
                    <Container style={styles.transparentColor}>
                        {this.props.downloadState.isLoading ? <View /> : <Header noShadow style={styles.headerBg} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                            <Left style={styles.headerLeft}>
                                <Button transparent onPress={() => this.goToPreviousScreen()}>
                                    <Icon name='arrow-back' style={[styles.iconColor]} />
                                </Button>
                                <Title style={[styles.headerContainer, { color: Constant.headerFontColor || Constant.whiteColor }]}>{item.ResourceName}</Title>
                            </Left>
                        </Header>}
                        {this.props.downloadState.isLoading ? null : <View style={styles.breadscrumbContainer}>
                            <BreadsCrumb
                                data={this.state.content}
                                onPress={this.onBreadCrumbPress}
                                activeTintColor={Constant.whiteColor}
                                inactiveTintColor={Constant.whiteColor}
                            />
                        </View>}
                        <Content contentContainerStyle={[styles.container, { paddingBottom: Constant.platform === 'android' ? 30 : 0, paddingTop: this.props.downloadState.isLoading ? 0 : 5 }]}>
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
        await this.props.requestDownloadFile(Constant.bearerToken, resourceId, filename, resourceType);
        if (this.props.downloadState.error !== '') {
            Alert.alert(Config.APP_NAME, Constant.cancelDownload);
            return;
        }
        await this.props.addDownloadedFile({ resourceName, resourceId, resourceType, resourceImage, launcherFile });
        if (this.props.downloadedFiles.error === '') {
            await LocalDbManager.insert<Array<DownloadedFilesModel>>(Constant.downloadedFiles, this.props.downloadedFiles.downloadedfiles, async (err) => {
                Toast.show({ text: 'successfully added downloads', type: 'success', position: 'bottom' });
            });
        }
        console.log('this', this.props.downloadedFiles.downloadedfiles);
        const path: string = Platform.OS === 'ios' ? Constant.documentDir : resourceType === FileType.zip ? Constant.documentDir : `file://${Constant.documentDir}`;
        console.log('preview path', path);
        await PreviewManager.openPreview(path, resourceName, resourceType, resourceId, launcherFile, async (rootPath, launcherFile, fileName, fileType, resourceId) => {
            await this.props.navigation.push('Preview', { 'dir': rootPath, 'launcherFile': launcherFile, 'fileName': fileName, 'fileType': fileType, 'resourceId': resourceId });
        });
    }
    public async deleteFileIfAlreadyDownloaded(resoureID: number, resourceName: string, fileType: string) {
        console.log('dir', Constant.documentDir);
        await this.props.removeDownloadedFile(resoureID);
        if (this.props.downloadedFiles.error !== '') {
            Alert.alert(Config.APP_NAME, this.props.downloadedFiles.error);
        } else {
            console.log('remove item', this.props.downloadedFiles);
            const filename = fileType === FileType.zip ? `${resoureID}${fileType}` : fileType === FileType.video ? `${resoureID}${fileType}` : resourceName;
            await LocalDbManager.unlinkFile(`${Constant.deleteFilePath}/${filename}`, fileType, `${Constant.deleteFilePath}/${resoureID}`);
            await LocalDbManager.insert<Array<DownloadedFilesModel>>(Constant.downloadedFiles, this.props.downloadedFiles.downloadedfiles, async (err) => {
                Toast.show({ text: Constant.deleted, type: 'success', position: 'bottom' });
            });
        }
    }

    public async loadResourceAsync(resourceId?: number, resourceName?: string, resourceType?: string, resourceImage?: string, launcherFile?: string) {
        if (!(resourceId && resourceName)) {
            return;
        }
        if (this.props.downloadedFiles.downloadedfiles.length > 0) {
            const file = this.props.downloadedFiles.downloadedfiles.find(i => i.resourceId === resourceId)
            if (!file) {
                await this.downloadAndSaveResource(resourceId!, resourceName!, resourceType!, resourceImage!, launcherFile || '');
                return;
            }
            const path: string = Platform.OS === 'ios' ? Constant.documentDir : resourceType === FileType.zip ? Constant.documentDir : `file://${Constant.documentDir}`;
            console.log('downloadedPath', path);
            await PreviewManager.openPreview(path, file.resourceName, file.resourceType, resourceId, launcherFile || '', async (rootPath, launcherFile, fileName, fileType, resourceId) => {
                await this.props.navigation.push('Preview', { 'dir': rootPath, 'launcherFile': launcherFile, 'fileName': fileName, 'fileType': fileType, 'resourceId': resourceId });
            });
        } else {
            await this.downloadAndSaveResource(resourceId!, resourceName!, resourceType!, resourceImage!, launcherFile || '');
            return;
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
        removeOrientationOfScreen();
        BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackButton);
        removeScreenDimensionsListner();
    }

    public handleAndroidBackButton() {
        if (this.props.navigation.state.key === Constant.navigationKey[0]) {
            Constant.navigationKey.pop();
            Constant.content.pop();
            Constant.index = Constant.index - 1;
            this.setState({
                index: Constant.index,
                content: Constant.content,
            });
        }
        if (this.props.downloadState.progress !== 0) {
            return true;
        }
    }

    private goToPreviousScreen() {
        Constant.navigationKey.pop();
        Constant.content.pop();
        Constant.index = Constant.index - 1;
        this.setState({
            index: Constant.index,
            content: Constant.content,
        });
        this.props.navigation.pop();
    }

    private onBreadCrumbPress(index: number, name: string) {
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
        });
        this.props.navigation.goBack(key);
    }
}

const mapStateToProps = (state: AppState) => ({
    downloadState: state.downloadProgress,
    downloadedFiles: state.downloadedFilesData,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    requestDownloadFile: bindActionCreators(downloadFile, dispatch),
    requestDownloadCancel: bindActionCreators(downloadCancel, dispatch),
    addDownloadedFile: bindActionCreators(AddItem, dispatch),
    removeDownloadedFile: bindActionCreators(RemoveItem, dispatch),
    fetchdownloadedFiles: bindActionCreators(FetchAllDownloadedFiles, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(ResourceExplorerScreen);
