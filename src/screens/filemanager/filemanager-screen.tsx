import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right, Segment, Item, Input, Spinner, CheckBox, ListItem, Toast } from 'native-base';
import { NavigationScreenProp, SafeAreaView, NavigationEvents } from 'react-navigation';
import styles from './filemanager-style';
import Config from 'react-native-config';
import Swipeout from 'react-native-swipeout';
import { TouchableOpacity, FlatList, Image, ImageBackground, Dimensions, Alert, ListView, Platform, ProgressBarAndroid, ProgressViewIOS, BackHandler, Keyboard } from 'react-native';
import { FileType, Constant } from '../../constant';
import { SubResourceModel } from '../../models/resource-model';
import LocalDbManager from '../../manager/localdb-manager';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import PreviewManager from '../../manager/preview-manager';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators, AnyAction } from 'redux';
import { DownloadResourceFileProgress } from '../../redux/actions/download-action';
import { AppState } from '../../redux/reducers/index';
import downloadFile, { downloadCancel } from '../../redux/actions/download-action';
import NetworkCheckManager from '../../manager/networkcheck-manager';
import FileImageComponent from '../components/file-images';
import { handleOrientationOfScreen, getInitialScreenOrientation, removeOrientationOfScreen, handleScreenDimensions, removeScreenDimensionsListner } from '../components/screen-orientation';
import Orientation from 'react-native-orientation';
import DownloadProgressComponent from '../components/download-progress';
import { RemoveItem, DownloadedResources, AddItem } from '../../redux/actions/downloaded-file-action';
import CheckBoxComponent from '../components/handle-check-box';
import images from '../../assets/index';
import searchFilter, { SearchFilterArray } from '../../redux/actions/search-action';

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    downloadState: DownloadResourceFileProgress;
    downloadedFiles: DownloadedResources;
    searchState: SearchFilterArray;
    requestDownloadFile(bearer_token: string, AppUserResourceID: number, filename: string, filetype: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    requestDownloadCancel(): (dispatch: Dispatch<AnyAction>, getState: Function) => Promise<void>;
    removeDownloadedFile(resourceId: number): (dispatch: Dispatch, getState: Function) => Promise<void>;
    addownloadedFile(downloadedFile: DownloadedFilesModel): (dispatch: Dispatch, getState: Function) => Promise<void>;
    searchFilter(text: string, allFiles: SubResourceModel[]): (dispatch: Dispatch<AnyAction>) => Promise<void>;
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
    width: number;
    height: number;
    searchText: string;
    isSearch: boolean;
    searchFiles: Array<DownloadedFilesModel>;
    searchFilesNotDownloaded: SubResourceModel[];
    isSearchEnable: boolean;
}
class FileManagerScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            resources: [],
            downloadedFiles: [],
            isLoading: false,
            activePage: 2,
            backgroundPortraitImage: '',
            backgroundLandscapeImage: '',
            orientation: getInitialScreenOrientation(),
            selectedFiles: [],
            selectedFileIds: [],
            bearer_token: '',
            isSelectAll: false,
            allFiles: [],
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            searchText: '',
            isSearch: false,
            searchFiles: [],
            searchFilesNotDownloaded: [],
            isSearchEnable: false,
        };
        this.handleAndroidBackButton = this.handleAndroidBackButton.bind(this);
        Orientation.getOrientation((_err, orientations) => this.setState({ orientation: orientations }));
    }

    public async componentDidMount() {
        console.log('downloaded files', this.props.downloadedFiles);
        this.setState({ isLoading: true, downloadedFiles: [], resources: [] });
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
        LocalDbManager.getDownloadFiles((downloadFiles, isLoading, downloadedFiles) => {
            this.setState({ resources: downloadFiles, isLoading: isLoading, downloadedFiles: downloadedFiles });
        });
        BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackButton);
    }

    public componentWillUnmount() {
        removeOrientationOfScreen();
        BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackButton);
        removeScreenDimensionsListner();
    }

    public selectComponent(activePage: number) {
        this.setState({ activePage: activePage });
        this.closeSearch()
    }

    public renderHeader() {
        return (
            <View style={styles.contentConatiner}>
                {this.state.activePage === 2 ? <View style={styles.selectAllFilesConatiner}>
                    <CheckBox color={'black'} checked={this.state.isSelectAll}
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
                <View />
            </View>
        );
    }

    public render() {
        return (
            <SafeAreaView style={styles.container} forceInset={{ top: 'never', left: 'never' }}>
                <NavigationEvents
                    onWillFocus={() => this.componentDidMount()}
                    onDidFocus={() => this.render()}
                />
                <ImageBackground source={{ uri: this.state.orientation === Constant.portrait ? Constant.portraitImagePath : Constant.landscapeImagePath }} style={{ width: this.state.width, height: this.state.height }}>
                    {this.props.downloadState.isLoading ? <View /> : <Header style={styles.headerContainer}>
                        <TouchableOpacity style={styles.headerLogoContainer} onPress={() => this.props.navigation.pop()}>
                            <Image source={{ uri: Constant.headerImage }} style={styles.headerImage} />
                        </TouchableOpacity>
                        {this.state.isSearchEnable ? <View style={styles.searchBarContainer}>
                            <Item>
                                <Icon name='search' style={{ marginLeft: 10 }} />
                                <Input placeholder={Constant.searchPlaceholder}
                                    autoCorrect={false}
                                    onChangeText={text => this.searchFilterFunction(text)}
                                    value={this.state.searchText}
                                />
                                <Icon name='close' style={{ fontSize: 35 }} onPress={() => this.closeSearch()} />
                            </Item>
                        </View> : null}
                        {this.state.isSearchEnable ? null : <View style={styles.searchButton}>
                            <Icon name='search' style={styles.search} onPress={() => {
                                this.setState({ isSearchEnable: true })
                            }} />
                        </View>}
                    </Header>}
                    <Container style={styles.containerColor}>
                        {this.props.downloadState.isLoading ? <View /> : <View style={styles.backArrowContainer}>
                            <View style={styles.headerTitleContainer}>
                                <Button transparent onPress={() => this.props.navigation.pop()}>
                                    <Image source={images.backArrow} style={styles.backArrow} />
                                </Button>
                                <Text style={styles.title}>Download Manager</Text>
                            </View>
                            {this.state.activePage === 2 ?
                                <View style={styles.downloadManagerContainer}><TouchableOpacity style={styles.downloadIconContainer} onPress={() => this.downloadSelectedFiles()}>
                                    <Image source={images.downloadManager} style={styles.downloadIcon} />
                                </TouchableOpacity></View> : <View />}
                        </View>}
                        {this.props.downloadState.isLoading ? <View /> : this.renderHeader()}
                        <Content contentContainerStyle={[styles.container, { paddingBottom: Constant.platform === 'android' ? 30 : 0 }]}>
                            <View style={styles.container}>
                                {this.props.downloadState.isLoading ? <DownloadProgressComponent downloadingProgress={this.props.downloadState.progress} cancelDownload={this.cancelDownload} /> : this.renderComponent()}
                            </View>
                        </Content>
                    </Container>
                </ImageBackground>
            </SafeAreaView>
        );
    }

    public renderComponent() {
        console.log('props downloaded files sort', this.props.downloadedFiles.downloadedfiles.sort((a, b) => parseFloat(b.resourceFileSize) - parseFloat(a.resourceFileSize)));
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        if (this.state.activePage === 1) {
            return (
                <View style={styles.container}>
                    <FlatList
                        data={this.state.isSearch ? this.state.searchFiles : this.props.downloadedFiles.downloadedfiles}
                        renderItem={({ item }) =>
                            <TouchableOpacity onPress={() => {
                                this.previewFile(item);
                            }}>
                                <View style={styles.downloadedContainer}>
                                    <FileImageComponent fileImage={item.resourceImage || ''} fileType={item.resourceType} styles={styles.resourceImage} />
                                    <View style={styles.titleContainer}>
                                        <Text numberOfLines={2} ellipsizeMode={'tail'} style={styles.fileTitle}>{item.resourceName}</Text>
                                        <Text style={styles.fileTitle}>{`File Size: ${parseFloat(item.resourceFileSize).toFixed(2)} MB`}</Text>
                                    </View>
                                    <View style={styles.deleteContainer}>
                                        <TouchableOpacity onPress={() => { this.removeFileFromLocalDB(item) }}>
                                            <Image source={images.delete} style={styles.delete} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        }
                    />
                </View>
            );
        } else {
            console.log('resources', this.state.resources);
            return (
                <ListView
                    dataSource={ds.cloneWithRows(this.state.isSearch ? this.state.searchFilesNotDownloaded : this.state.resources)}
                    renderRow={(item: SubResourceModel, secId, rowId) =>
                        <View>
                            <ListItem style={styles.filesContainer}>
                                <CheckBox color={Constant.blackColor}
                                    checked={this.state.selectedFileIds.includes(item.ResourceId) ? true : false}
                                    onPress={() => this.onCheckBoxPress(item.ResourceId, rowId)}
                                />
                                <Body>
                                    <TouchableOpacity onPress={() => this.onCheckBoxPress(item.ResourceId, rowId)}>
                                        <View style={styles.bodyContainer}>
                                            <FileImageComponent fileImage={item.ResourceImage || ''} fileType={item.FileExtension} filesDownloaded={this.props.downloadedFiles.downloadedfiles} ResourceId={0} isFromDownloadManager={true} styles={styles.resourceImage} />
                                            <View style={styles.fileConatiner}>
                                                <Text numberOfLines={2} ellipsizeMode={'tail'} style={styles.fileTitle}>{item.ResourceName}</Text>
                                                <Text style={styles.fileTitle}>{`File Size: ${parseFloat(item.ResourceSizeInKB).toFixed(2)} MB`}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </Body>
                            </ListItem>
                        </View>
                    }
                />
            );
        }
    }

    public async previewFile(data: DownloadedFilesModel) {
        let path: string = Platform.OS === 'ios' ? Constant.documentDir : data.resourceType === FileType.zip ? Constant.documentDir : `file://${Constant.documentDir}`;
        await PreviewManager.openPreview(path, data.resourceName, data.resourceType, data.resourceId, data.launcherFile || '', true, async (rootPath, launcherFile, fileName, fileType, resourceId) => {
            await this.props.navigation.push('Preview', { 'dir': rootPath, 'launcherFile': launcherFile, 'fileName': fileName, 'fileType': fileType, 'resourceId': resourceId });
        });
    }

    public onCheckBoxPress(id: number, rowId: any) {
        console.log('search selected id', id);
        CheckBoxComponent.getSelectedFiles(id, rowId, this.state.selectedFileIds, this.state.selectedFiles, this.state.resources, (selectedIds, selectedFiles) => {
            this.setState({ selectedFileIds: selectedIds, selectedFiles: selectedFiles });
        });
    }

    public async onPressedSelectAll() {
        CheckBoxComponent.selectAllFiles(this.state.isSelectAll, this.state.resources, (isSelected, selectedIds, selectedFiles) => {
            this.setState({ isSelectAll: isSelected, selectedFileIds: selectedIds, selectedFiles: selectedFiles });
        });
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
            Toast.show({ text: Constant.noInternetConnction, type: 'danger', position: 'top' });
            return;
        }
        await this.isSelectedFiles(this.state.selectedFiles);
        for (let i = 0; i < this.state.selectedFiles.length; i++) {
            console.log('donwload search file', this.state.selectedFiles, this.state.selectedFiles[i].ResourceId);
            const { ResourceName, ResourceId, FileExtension, ResourceImage, LauncherFile, ResourceSizeInKB } = this.state.selectedFiles[i];
            const filename = FileExtension === FileType.zip ? `${ResourceId}${FileExtension}` : FileExtension === FileType.video ? ResourceName.split(' ').join('') : ResourceName;
            await this.props.requestDownloadFile(Constant.bearerToken, this.state.selectedFiles[i].ResourceId, filename, this.state.selectedFiles[i].FileExtension);
            if (this.props.downloadState.error !== '') {
                Alert.alert(Config.APP_NAME, this.props.downloadState.error);
            } else {
                await this.props.addownloadedFile({ resourceName: ResourceName, resourceId: ResourceId, resourceType: FileExtension, resourceImage: ResourceImage || '', launcherFile: LauncherFile, resourceFileSize: ResourceSizeInKB });
                CheckBoxComponent.unzipFile(this.props.downloadedFiles.downloadedfiles, this.state.resources, this.state.selectedFiles[i], (resources) => {
                    this.setState({ resources: resources });
                });
            }
        }
        this.setState({ selectedFiles: [], selectedFileIds: [], isSelectAll: false, activePage: 1 });
        this.closeSearch()
    }

    public async removeFileFromLocalDB(data: DownloadedFilesModel) {
        const newSearchArray = this.state.searchFiles.filter((item) => item.resourceId !== data.resourceId);
        this.setState({ searchFiles: newSearchArray })
        await this.props.removeDownloadedFile(data.resourceId);
        console.log('all files', Constant.fetchAllFiles);
        CheckBoxComponent.removeFile(data, this.props.downloadedFiles.downloadedfiles, (resources) => {
            this.setState({ resources: resources });
        });
    }

    public cancelDownload = async () => {
        await this.props.requestDownloadCancel();
    }

    public handleAndroidBackButton() {
        if (this.props.downloadState.progress !== 0 || this.props.downloadState.isLoading) {
            return true;
        }
    }

    public async searchFilterFunction(textData: string) {
        this.setState({ searchText: textData });
        if (textData.length >= 3) {
            this.setState({ isSearch: true })
            if (this.state.activePage === 2) {
                let filteredArray = await this.state.resources.filter((item: { ResourceName: string; }) => {
                    let name = item.ResourceName.toUpperCase();
                    return name.indexOf(textData.toUpperCase()) > -1;
                });
                this.setState({ searchFilesNotDownloaded: filteredArray })
            } else {
                let filteredArray = await this.props.downloadedFiles.downloadedfiles.filter((item: { resourceName: string; }) => {
                    let name = item.resourceName.toUpperCase();
                    return name.indexOf(textData.toUpperCase()) > -1;
                });
                this.setState({ searchFiles: filteredArray })
            }
        } else {
            this.setState({ isSearch: false, searchFiles: [], searchFilesNotDownloaded: [] })
        }
    }

    public async closeSearch() {
        this.setState({ isSearchEnable: false })
        this.setState({ searchText: '', isSearch: false, searchFiles: [], searchFilesNotDownloaded: [] });
        Keyboard.dismiss();
    }

}
const mapStateToProps = (state: AppState) => ({
    downloadState: state.downloadProgress,
    downloadedFiles: state.downloadedFilesData,
    searchState: state.searchData,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
    requestDownloadFile: bindActionCreators(downloadFile, dispatch),
    requestDownloadCancel: bindActionCreators(downloadCancel, dispatch),
    removeDownloadedFile: bindActionCreators(RemoveItem, dispatch),
    addownloadedFile: bindActionCreators(AddItem, dispatch),
    searchFilter: bindActionCreators(searchFilter, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(FileManagerScreen);
