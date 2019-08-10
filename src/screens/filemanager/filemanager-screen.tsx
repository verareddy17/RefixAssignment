import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right, Segment, Item, Input, Spinner, CheckBox, ListItem, Toast } from 'native-base';
import { NavigationScreenProp, SafeAreaView, NavigationEvents } from 'react-navigation';
import styles from './filemanager-style';
import Config from 'react-native-config';
import Swipeout from 'react-native-swipeout';
import { TouchableOpacity, FlatList, Image, ImageBackground, Dimensions, Alert, ListView, Platform, ProgressBarAndroid, ProgressViewIOS, BackHandler } from 'react-native';
import { FileType, Constant } from '../../constant';
import { SubResourceModel, ResourceModel } from '../../models/resource-model';
import LocalDbManager from '../../manager/localdb-manager';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import Orientation from 'react-native-orientation';
import store from '../../redux/store';
import RNFetchBlob from 'rn-fetch-blob';
import PreviewManager from '../../manager/preview-manager';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators, AnyAction } from 'redux';
import { DownloadResourceFileProgress } from '../../redux/actions/download-action';
import { AppState } from '../../redux/reducers/index';
import downloadFile, { downloadCancel } from '../../redux/actions/download-action';
import images from '../../assets/index';
import imageCacheHoc from 'react-native-image-cache-hoc';
import NetworkCheckManager from '../../manager/networkcheck-manager';
export const CacheableImage = imageCacheHoc(Image, {
    validProtocols: ['http', 'https'],
});
import ImageHoc from '../../assets/imageshoc';

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    downloadState: DownloadResourceFileProgress;
    requestDownloadFile(bearer_token: string, AppUserResourceID: number, filename: string, filetype: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    requestDownloadCancel(): (dispatch: Dispatch<AnyAction>, getState: Function) => Promise<void>;
}

interface State {
    resources: SubResourceModel[];
    downloadedFiles: Array<DownloadedFilesModel>;
    isLoading: boolean;
    activePage: number;
    backgroundPortraitImage: string;
    backgroundLandscapeImage: string;
    orientation: string;
    selectedFiles: Array<SubResourceModel>;
    selectedFileIds: Array<number>;
    bearer_token: string;
    isSelectAll: boolean;
    allFiles: Array<SubResourceModel>;
    fontColor?: string;
}
// let result: SubResourceModel[] = [];
const dirs = RNFetchBlob.fs.dirs.DocumentDir;
class FileManagerScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            resources: [],
            downloadedFiles: [],
            isLoading: false,
            activePage: 1,
            backgroundPortraitImage: '',
            backgroundLandscapeImage: '',
            orientation: Constant.portrait,
            selectedFiles: [],
            selectedFileIds: [],
            bearer_token: '',
            isSelectAll: false,
            allFiles: [],
        };
        this.handleAndroidBackButton = this.handleAndroidBackButton.bind(this);
    }

    public async componentDidMount() {
        this.setState({
            isLoading: true,
            downloadedFiles: [],
            resources: [],
        });
        Orientation.unlockAllOrientations();
        Orientation.addOrientationListener(this._orientationDidChange);
        await LocalDbManager.get(Constant.fontColor, (err, color) => {
            if (color !== null || color !== '') {
                this.setState({ fontColor: color } as State);
            }
        });
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
        await LocalDbManager.get<Array<DownloadedFilesModel>>(Constant.downloadedFiles, (err, data) => {
            if (data) {
                this.setState({ downloadedFiles: data });
            }
        });
        await LocalDbManager.get<Array<SubResourceModel>>(Constant.allFiles, (err, data) => {
            if (data) {
                this.setState({
                    resources: data,
                    allFiles: data,
                });
            }
        });
        let downloadFiles = await this.state.resources.filter(item => !this.state.downloadedFiles.some(downloadedItem => item.ResourceId === downloadedItem.resourceId));
        this.setState({ resources: downloadFiles, isLoading: false });
        await LocalDbManager.insert<Array<SubResourceModel>>('downloadFiles', downloadFiles, async (error) => {
            if (error === null || error === undefined) {
                ///
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

    public componentWillUnmount() {
        Orientation.removeOrientationListener(this._orientationDidChange);
        BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackButton);
    }

    public _orientationDidChange = (orientation: string) => {
        if (orientation === Constant.landscape) {
            this.setState({ orientation: Constant.landscape });
        } else {
            this.setState({ orientation: Constant.portrait });
        }
    }

    public selectComponent(activePage: number) {
        this.setState({ activePage: activePage });
    }

    public renderHeader() {
        return (
            <View style={styles.contentConatiner}>
                {this.state.activePage === 2 ? <View style={styles.selectAllFilesConatiner}>
                    <CheckBox checked={this.state.isSelectAll}
                        onPress={() => { this.onPressedSelectAll(); }}
                    />
                    <Text style={styles.selectAll}>Select All</Text>
                </View> : <View />}
                <Segment style={styles.segmentContainer}>
                    <Button style={styles.segmentButton} active={this.state.activePage === 1}
                        onPress={() => this.selectComponent(1)}><Text>{Constant.removeTitle}</Text></Button>
                    <Button active={this.state.activePage === 2}
                        onPress={() => this.selectComponent(2)}><Text>{Constant.addTitle}</Text></Button>
                </Segment>
                {this.state.activePage === 2 ? <TouchableOpacity onPress={() => this.downloadSelectedFiles()}>
                    <Icon name='download' style={{ marginRight: 10 }}></Icon>
                </TouchableOpacity> : <View />}
            </View>
        );
    }

    public render() {
        let { height, width } = Dimensions.get('window');
        return (
            <SafeAreaView style={styles.container} forceInset={{ top: 'never', left: 'never' }}>
                <NavigationEvents
                    onWillFocus={() => this.componentDidMount()}
                    onDidFocus={() => this.render()}
                />
                <ImageBackground source={{ uri: this.state.orientation === Constant.portrait ? this.state.backgroundPortraitImage : this.state.backgroundLandscapeImage }} style={{ width, height }}>
                    <Container style={styles.containerColor}>
                        {this.props.downloadState.isLoading ? <View /> : <Header noShadow style={styles.headerBg} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                            <Left>
                                <Button transparent onPress={() => this.props.navigation.openDrawer()}>
                                    <Icon name='menu' style={styles.iconColor}></Icon>
                                </Button>
                            </Left>
                            <Body>
                                <Title style={{ color: this.state.fontColor || '#fff' }}>Downloads Manager</Title>
                            </Body>
                            <Right />
                        </Header>}
                        {this.props.downloadState.isLoading ? <View /> : this.renderHeader()}
                        <Content contentContainerStyle={[styles.container, { paddingBottom: Constant.platform === 'android' ? 30 : 0 }]}>
                            <View style={styles.container}>
                                {this.props.downloadState.isLoading ? this.progress() : this.renderComponent()}
                            </View>
                        </Content>
                    </Container>
                </ImageBackground>
            </SafeAreaView>
        );
    }

    public async deleteFile(data: DownloadedFilesModel) {
        let downloadFile = [...this.state.downloadedFiles];
        const index = downloadFile.findIndex(resource => resource.resourceId === data.resourceId);
        if (index > -1) {
            downloadFile.splice(index, 1); // unbookmarking
            await this.setState({
                downloadedFiles: downloadFile,
            });
            await LocalDbManager.insert<Array<DownloadedFilesModel>>(Constant.downloadedFiles, this.state.downloadedFiles, (error) => {
                if (error !== null) {
                    Alert.alert(error!.message);
                }
            });
        }
    }
    public renderComponent() {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        if (this.state.activePage === 1) {
            return (
                <View style={styles.container}>
                    <FlatList
                        data={this.state.downloadedFiles}
                        renderItem={({ item }) =>
                            <Swipeout autoClose={true} style={{ backgroundColor: 'transparent' }} right={[
                                {
                                    component: (<View style={styles.swipeoutContainer}>
                                        <Icon style={styles.swipeButtonIcon} name='trash' />
                                        <Text style={styles.swipeButtonIcon}>Delete</Text>
                                    </View>),
                                    backgroundColor: '#d11a2a',
                                    onPress: () => {
                                        this.removeFileFromLocalDB(item);
                                    },
                                },
                            ]}
                            >
                                <TouchableOpacity onPress={() => {
                                    this.previewFile(item);
                                }}>
                                    <View style={styles.downloadedContainer}>
                                        <ImageHoc fileImage= {item.resourceImage || ''} fileType= {item.resourceType} styles={styles.resourceImage}/>
                                        <Text style={styles.textTitle}>{item.resourceName}</Text>
                                    </View>
                                    <View style={styles.separator} />
                                </TouchableOpacity>
                            </Swipeout>
                        }
                    />
                </View>
            );
        } else {
            console.log('resources', this.state.resources);
            return (
                <ListView
                    dataSource={ds.cloneWithRows(this.state.resources)}
                    renderRow={(item: SubResourceModel, secId, rowId) =>
                        <View>
                            <ListItem style={styles.filesContainer}>
                                <CheckBox
                                    checked={this.state.selectedFileIds.includes(item.ResourceId) ? true : false}
                                    onPress={() => this.onCheckBoxPress(item.ResourceId, rowId)}
                                />
                                <Body>
                                    <TouchableOpacity onPress={() => this.onCheckBoxPress(item.ResourceId, rowId)}>
                                        <View style={styles.bodyContainer}>
                                            <ImageHoc fileImage= {item.ResourceImage || ''} fileType= {item.FileExtension} styles={styles.resourceImage}/>
                                            <Text style={styles.textTitle}>{item.ResourceName}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Body>
                            </ListItem>
                            <View style={styles.separator} />
                        </View>
                    }
                />
            );
        }
    }

    public async previewFile(data: DownloadedFilesModel) {
        let path: string = Platform.OS === 'ios' ? Constant.documentDir : data.resourceType === FileType.zip ? Constant.documentDir : `file://${Constant.documentDir}`;
        // let path: string = Platform.OS === 'ios' ? Constant.documentDir : `file://${Constant.documentDir}`;
        console.log('preview file', path);
        console.log('preview navigation', this.props);
        await PreviewManager.openPreview(path, data.resourceName, data.resourceType, data.resourceId, data.launcherFile || '', async (rootPath, launcherFile, fileName, fileType, resourceId) => {
            await this.props.navigation.navigate('Preview', { 'dir': rootPath, 'launcherFile': launcherFile, 'fileName': fileName, 'fileType': fileType, 'resourceId': resourceId });
        });

    }

    public progress() {
        const downloadProgress = Math.floor(this.props.downloadState.progress * 100);
        if (Platform.OS === 'ios') {
            return (
                <View style={styles.progressBarConainer}>
                    <View style={styles.downloadContainer}>
                        <Text style={styles.progressBarText}>{`Downloading(${downloadProgress}%)`}</Text>
                        <ProgressViewIOS style={styles.progressBarWidth} progress={this.props.downloadState.progress} />
                        <TouchableOpacity onPress={() => this.cancelDownloadFile()}>
                            <Text style={styles.cancelButton}>CANCEL</Text>
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
                        <TouchableOpacity onPress={() => this.cancelDownloadFile()}>
                            <Text style={styles.cancelButton}>CANCEL</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            );
        }
    }

    public onCheckBoxPress(id: number, rowId: any) {
        let tmp = this.state.selectedFileIds;
        let newData = this.state.selectedFiles;
        if (tmp.includes(id)) {
            tmp.splice(tmp.indexOf(id), 1);
            let index = newData.findIndex(item => item.ResourceId === id);
            if (index > -1) {
                newData.splice(index, 1);
            }
        } else {
            tmp.push(id);
            let file = this.state.resources[rowId];
            newData.push(file);
        }
        this.setState({
            selectedFileIds: tmp,
            selectedFiles: newData,
        });
        console.log('resources...', this.state.selectedFiles, this.state.selectedFileIds);
    }

    public async onPressedSelectAll() {
        this.setState({ isSelectAll: !this.state.isSelectAll });
        let allIds = await this.state.resources.map(item => {
            return item.ResourceId;
        });
        let selectedFiles: Array<SubResourceModel> = [];
        if (this.state.isSelectAll) {
            await LocalDbManager.get<Array<SubResourceModel>>('downloadFiles', async (err, data) => {
                if (data !== null || data !== undefined) {
                    selectedFiles = data!;
                }
            });
            this.setState({
                selectedFileIds: allIds,
                selectedFiles: selectedFiles,
            });
        } else {
            this.setState({
                selectedFileIds: [],
                selectedFiles: [],
            });
        }
    }

    public async isSelectedFiles(selectedFiles: Array<SubResourceModel>) {
        if (selectedFiles.length === 0) {
            Alert.alert(Config.APP_NAME, Constant.noFiles);
            return;
        }
    }

    public async downloadSelectedFiles() {
        let isConnected = await NetworkCheckManager.isConnected();
        if (!isConnected) {
            Toast.show({ text: 'Please check internet connection', type: 'danger', position: 'top' });
            return;
        }
        await this.isSelectedFiles(this.state.selectedFiles);
        for (let i = 0; i < this.state.selectedFiles.length; i++) {
            const { ResourceName, ResourceId, FileExtension, ResourceImage, LauncherFile } = this.state.selectedFiles[i];
            const filename = FileExtension === FileType.zip ? `${ResourceId}${FileExtension}` : FileExtension === FileType.video ? ResourceName.split(' ').join('') : ResourceName;
            await this.props.requestDownloadFile(this.state.bearer_token, this.state.selectedFiles[i].ResourceId, filename, this.state.selectedFiles[i].FileExtension);
            if (this.props.downloadState.error !== '') {
               Alert.alert(Config.APP_NAME, this.props.downloadState.error);
            } else {
                await this.state.downloadedFiles.push({ resourceName: ResourceName, resourceId: ResourceId, resourceType: FileExtension, resourceImage: ResourceImage || '', launcherFile: LauncherFile });
                console.log('files are pushed', this.state.downloadedFiles);
                let downloadFiles = await this.state.resources.filter(item => !this.state.downloadedFiles.some(downloadedItem => item.ResourceId === downloadedItem.resourceId));
                this.setState({
                    resources: downloadFiles,
                });
                await LocalDbManager.insert<Array<DownloadedFilesModel>>(Constant.downloadedFiles, this.state.downloadedFiles, async (err) => {
                    Toast.show({ text: 'successfully added downloads', type: 'success', position: 'bottom' });
                });
                await LocalDbManager.insert<Array<SubResourceModel>>('downloadFiles', this.state.resources, async (err) => {
                });
                let path: string = Platform.OS === 'ios' ? Constant.documentDir : FileExtension === FileType.zip ? Constant.documentDir : `file://${Constant.documentDir}`;
                // let path: string = Platform.OS === 'ios' ? Constant.documentDir : `file://${Constant.documentDir}`;
                console.log('download resource id', ResourceId);
                if (FileExtension === FileType.zip) {
                    await PreviewManager.unzipFile(path, ResourceName, FileExtension, ResourceId, LauncherFile);
                }
            }
        }

        this.setState({
            selectedFiles: [],
            selectedFileIds: [],
            isSelectAll: false,
        });
    }

    public async removeFileFromLocalDB(data: DownloadedFilesModel) {
        let newData = [...this.state.downloadedFiles];
        const index = newData.findIndex(resource => resource.resourceId === data.resourceId);
        if (index > -1) {
            newData.splice(index, 1); // unbookmarking
            await LocalDbManager.get<Array<SubResourceModel>>(Constant.allFiles, async (err, data) => {
                if (data) {
                    let downloadFiles = await data.filter(item1 => !newData.some(item2 => item1.ResourceId === item2.resourceId));
                    this.setState({
                        resources: downloadFiles,
                        downloadedFiles: newData,
                    });
                }
            });
            await LocalDbManager.insert<Array<DownloadedFilesModel>>(Constant.downloadedFiles, this.state.downloadedFiles, (error) => {
                if (error !== null) {
                    Alert.alert(error!.message);
                }
            });
            await LocalDbManager.insert<Array<SubResourceModel>>('downloadFiles', this.state.resources, async (error) => {
                if (error !== null) {
                    Alert.alert(error!.message);
                }
            });
        }
        const filename = data.resourceType === FileType.zip ? `${data.resourceId}${data.resourceType}` : data.resourceType === FileType.video ? `${data.resourceId}${data.resourceType}` : data.resourceName;
        await LocalDbManager.unlinkFile(`${Constant.deleteFilePath}/${filename}`, data.resourceType, `${Constant.deleteFilePath}/${data.resourceId}`);
    }

    public cancelDownloadFile = async () => {
        await this.props.requestDownloadCancel();
    }

    public handleAndroidBackButton() {
        if (this.props.downloadState.progress !== 0 || this.props.downloadState.isLoading) {
            return true;
        }
    }

}
const mapStateToProps = (state: AppState) => ({
    downloadState: state.downloadProgress,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
    requestDownloadFile: bindActionCreators(downloadFile, dispatch),
    requestDownloadCancel: bindActionCreators(downloadCancel, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(FileManagerScreen);
