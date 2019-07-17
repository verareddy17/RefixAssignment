import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right, Segment, Item, Input, Spinner, CheckBox, ListItem, Toast } from 'native-base';
import { NavigationScreenProp, SafeAreaView, NavigationEvents } from 'react-navigation';
import styles from './filemanager-style';
import Config from 'react-native-config';
import Swipeout from 'react-native-swipeout';
import { TouchableOpacity, FlatList, Image, ImageBackground, Dimensions, Alert, ListView, Platform, ProgressBarAndroid, ProgressViewIOS } from 'react-native';
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
import downloadFile from '../../redux/actions/download-action';

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    downloadState: DownloadResourceFileProgress;
    requestDownloadFile(bearer_token: string, AppUserResourceID: number, filename: string, filetype: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
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
            orientation: '',
            selectedFiles: [],
            selectedFileIds: [],
            bearer_token: '',
        };
    }

    public async componentWillMount() {
        this.setState({
            isLoading: true,
            downloadedFiles: [],
            resources: [],
        });
        Orientation.unlockAllOrientations();
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
        await LocalDbManager.get<Array<DownloadedFilesModel>>(Constant.downloadedFiles, (err, data) => {
            if (data) {
                this.setState({ downloadedFiles: data });
            }
        });
        await LocalDbManager.get<Array<SubResourceModel>>(Constant.allFiles, (err, data) => {
            if (data) {
                this.setState({
                    resources: data,
                });
            }
        });
        let downloadFiles = await this.state.resources.filter(item => !this.state.downloadedFiles.some(downloadedItem => item.ResourceId === downloadedItem.resourceId));
        this.setState({ resources: downloadFiles, isLoading: false });
        await LocalDbManager.get<string>(Constant.token, async (err, token) => {
            if (token !== null && token !== '') {
                await this.setState({
                    bearer_token: token!,
                });
            }
        });
    }

    public componentWillUnmount() {
        Orientation.removeOrientationListener(this._orientationDidChange);
    }

    public _orientationDidChange = (orientation: string) => {
        if (orientation === Constant.landscape) {
            this.setState({ orientation: Constant.landscape });
        } else {
            this.setState({ orientation: Constant.portrait });
        }
    }

    public renderLocalImagesForDownloads(rowData: DownloadedFilesModel) {
        if (rowData.resourceImage === undefined || rowData.resourceImage === '') {
            if (rowData.resourceType === FileType.video) {
                return (
                    <Image source={require('../../assets/images/mp4.png')} style={styles.resourceImage} />
                );
            } else if (rowData.resourceType === FileType.pdf) {
                return (
                    <Image source={require('../../assets/images/pdf.png')} style={styles.resourceImage} />
                );
            } else if (rowData.resourceType === FileType.png || rowData.resourceType === FileType.jpg || rowData.resourceType === FileType.zip) {
                return (
                    <Image source={require('../../assets/images/png.png')} style={styles.resourceImage} />
                );
            } else {
                if (rowData.resourceType === FileType.pptx || rowData.resourceType === FileType.xlsx || rowData.resourceType === FileType.docx || rowData.resourceType === FileType.ppt) {
                    return (
                        <Image source={require('../../assets/images/ppt.png')} style={styles.resourceImage} />
                    );
                }
            }
        } else {
            return (
                <Image source={{ uri: rowData.resourceImage }} style={styles.resourceImage} />
            );
        }
    }

    public renderLocalImagesForNotDownloadedFiles(rowData: SubResourceModel) {
        if (rowData.ResourceImage === undefined || rowData.ResourceImage === '') {
            if (rowData.ResourceType === FileType.video) {
                return (
                    <Image source={require('../../assets/images/mp4.png')} style={styles.resourceImage} />
                );
            } else if (rowData.ResourceType === FileType.pdf) {
                return (
                    <Image source={require('../../assets/images/pdf.png')} style={styles.resourceImage} />
                );
            } else if (rowData.ResourceType === FileType.png || rowData.ResourceType === FileType.jpg || rowData.ResourceType === FileType.zip) {
                return (
                    <Image source={require('../../assets/images/png.png')} style={styles.resourceImage} />
                );
            } else {
                if (rowData.ResourceType === FileType.pptx || rowData.ResourceType === FileType.xlsx || rowData.ResourceType === FileType.docx || rowData.ResourceType === FileType.ppt) {
                    return (
                        <Image source={require('../../assets/images/ppt.png')} style={styles.resourceImage} />
                    );
                }
            }
        } else {
            return (
                <Image source={{ uri: rowData.ResourceImage }} style={styles.resourceImage} />
            );
        }
    }

    public selectComponent(activePage: number) {
        this.setState({ activePage: activePage });
    }

    public render() {
        let { height, width } = Dimensions.get('window');
        return (
            <SafeAreaView style={styles.container} forceInset={{ top: 'never' }}>
                <NavigationEvents
                    onWillFocus={() => this.componentWillMount()}
                    onDidFocus={() => this.render()}
                />
                <Container>
                    <Header noShadow style={styles.headerBg} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                        <Left>
                            <Button transparent onPress={() => this.props.navigation.openDrawer()}>
                                <Icon name='menu' style={styles.iconColor}></Icon>
                            </Button>
                        </Left>
                        <Body>
                            <Title style={styles.headerTitle}>Downloads Manager</Title>
                        </Body>
                        <Right />
                    </Header>
                    <Content contentContainerStyle={styles.container}>
                        <View style={styles.contentConatiner}>
                            <View />
                            <Segment style={styles.segmentContainer}>
                                <Button style={styles.segmentButton} active={this.state.activePage === 1}
                                    onPress={() => this.selectComponent(1)}><Text>{Constant.removeTitle}</Text></Button>
                                <Button active={this.state.activePage === 2}
                                    onPress={() => this.selectComponent(2)}><Text>{Constant.addTitle}</Text></Button>
                            </Segment>
                            <TouchableOpacity onPress={() => this.downloadSelectedFiles()}>
                                <Icon name='download' style={{ marginRight: 10 }}></Icon>
                            </TouchableOpacity>
                        </View>
                        <ImageBackground source={{ uri: this.state.orientation === Constant.portrait ? this.state.backgroundPortraitImage : this.state.backgroundLandscapeImage }} style={{ width, height }}>
                            <View style={styles.container}>
                                {this.props.downloadState.isLoading ? this.progress() : this.renderComponent()}
                            </View>
                        </ImageBackground>
                    </Content>
                </Container>
            </SafeAreaView>
        );
    }

    public async deleteFile(data: DownloadedFilesModel) {
        let downloadFile = [...this.state.downloadedFiles];
        console.log('delete', downloadFile);
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
                            <TouchableOpacity onPress={() => {
                                this.previewFile(item);
                            }}>
                                <View style={styles.downloadedContainer}>
                                    {this.renderLocalImagesForDownloads(item)}
                                    <Text style={styles.textTitle}>{item.resourceName}</Text>
                                </View>
                            </TouchableOpacity>
                        }
                    />
                </View>
            );
        } else {
            return (
                <ListView
                    dataSource={ds.cloneWithRows(this.state.resources)}
                    renderRow={(item: SubResourceModel, secId, rowId) =>
                        <ListItem style={styles.filesContainer}>
                            <CheckBox
                                checked={this.state.selectedFileIds.includes(item.ResourceId) ? true : false}
                                onPress={() => this.onCheckBoxPress(item.ResourceId, rowId)}
                            />
                            <Body>
                                <TouchableOpacity onPress={() => this.onCheckBoxPress(item.ResourceId, rowId)}>
                                    <View style={styles.bodyContainer}>
                                        {this.renderLocalImagesForNotDownloadedFiles(item)}
                                        <Text style={styles.textTitle}>{item.ResourceName}</Text>
                                    </View>
                                </TouchableOpacity>
                            </Body>
                        </ListItem>
                    }
                />
            );
        }
    }

    public async previewFile(data: DownloadedFilesModel) {
        let path: string = Platform.OS === 'ios' ? dirs : `file://${dirs}`;
        console.log('preview arguments', path, data.resourceName, data.resourceType, data.resourceId, data.launcherFile);
        await PreviewManager.openPreview(path, data.resourceName, data.resourceType, data.resourceId, data.launcherFile || '', async (rootPath, launcherFile, fileName, fileType, resourceId) => {
            console.log('push arguments', rootPath, launcherFile, fileName, fileType, resourceId);
            console.log('props', this.props.navigation);
            await this.props.navigation.navigate('Preview', { 'dir': rootPath, 'launcherFile': launcherFile, 'fileName': fileName, 'fileType': fileType, 'resourceId': resourceId });
        });

    }

    public async downloadSelectedFiles() {
        for (let i = 0; i < this.state.selectedFiles.length; i++) {
            await this.props.requestDownloadFile(this.state.bearer_token, this.state.selectedFiles[i].ResourceId, this.state.selectedFiles[i].ResourceName, this.state.selectedFiles[i].ResourceType);
            const { ResourceName, ResourceId, ResourceType, ResourceImage, LauncherFile } = this.state.selectedFiles[i];
            await this.state.downloadedFiles.push({ resourceName: ResourceName, resourceId: ResourceId, resourceType: ResourceType, resourceImage: ResourceImage || '', launcherFile: LauncherFile });
            console.log('files are pushed', this.state.downloadedFiles);
            let downloadFiles = await this.state.resources.filter(item => !this.state.downloadedFiles.some(downloadedItem => item.ResourceId === downloadedItem.resourceId));
            this.setState({
                resources: downloadFiles,
            });
            await LocalDbManager.insert<Array<DownloadedFilesModel>>(Constant.downloadedFiles, this.state.downloadedFiles, async (err) => {
                Toast.show({ text: 'successfully added downloads', type: 'success', position: 'bottom' });
            });
        }
        this.setState({
            selectedFiles: [],
        });
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
        console.log('selectedFiles', this.state.selectedFiles);
    }
}
const mapStateToProps = (state: AppState) => ({
    downloadState: state.downloadProgress,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
    requestDownloadFile: bindActionCreators(downloadFile, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(FileManagerScreen);