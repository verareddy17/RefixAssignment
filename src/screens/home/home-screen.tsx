import React, { Component } from 'react';
import styles from './home-style';
import { View, Text, Button, Container, Content, Header, Left, Right, Icon, Body, Title, Item, Input, Spinner, Badge, List, ListItem, Toast } from 'native-base';
import { NavigationScreenProp, SafeAreaView, NavigationEvents } from 'react-navigation';
import { ListView, Image, TouchableOpacity, Alert, FlatList, ImageBackground, Dimensions, Platform, Keyboard, WebView, ProgressViewIOS, ProgressBarAndroid, StatusBar } from 'react-native';
import { fetchResources, updateResources, ResourceResponse } from '../../redux/actions/resource-action';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators, AnyAction } from 'redux';
import { AppState } from '../../redux/reducers/index';
import Config from 'react-native-config';
import LocalDbManager from '../../manager/localdb-manager';
import { Constant, FileType } from '../../constant';
import { SettingsResponse } from '../../redux/actions/settings-actions';
import deviceTokenApi from '../../redux/actions/settings-actions';
import Crashes from 'appcenter-crashes';
import { ResourceModel, SubResourceModel } from '../../models/resource-model';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import { string } from 'prop-types'
import FileImageComponent from '../components/file-images';
import { ActivationAppResponse } from '../../models/login-model';
import FolderImageComponet from '../components/folder-images';
import { removeOrientationOfScreen, handleOrientationOfScreen, getInitialScreenOrientation, handleScreenDimensions, removeScreenDimensionsListner } from '../components/screen-orientation';
import { LoginResponse } from '../../redux/actions/user-action';
import Orientation from 'react-native-orientation';
import { CustomizeSettings } from '../../models/custom-settings';
import separatorComponent from '../components/separator-component';
import PreviewManager from '../../manager/preview-manager';
import downloadFile, { DownloadResourceFileProgress, downloadCancel } from '../../redux/actions/download-action';
import { DownloadedResources, FetchAllDownloadedFiles, AddItem } from '../../redux/actions/downloaded-file-action';
import NetworkCheckManager from '../../manager/networkcheck-manager';
import DownloadProgressComponent from '../components/download-progress';
import searchFilter, { SearchFilterArray } from '../../redux/actions/search-action';
import badgeNumber from '../components/badge-number';
import Popup from '../components/popup';
const Device = require('react-native-device-detection');
import images from '../../assets/index';
import Loader from '../components/loader';
interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    resourceState: ResourceResponse;
    deviceTokenResponse: SettingsResponse;
    userState: LoginResponse;
    downloadedFiles: DownloadedResources;
    downloadState: DownloadResourceFileProgress;
    searchState: SearchFilterArray;
    getresources(token: string): object;
    getresourcesfromdb(): object;
    updateresource(token: string): object;
    requestLoginApi(pin: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    requestDeviceTokenApi(DeviceToken: string, ThemeVersion: number, DeviceOs: number, token: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    fetchdownloadedFiles(files: DownloadedFilesModel[]): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    requestDownloadFile(bearer_token: string, AppUserResourceID: number, filename: string, filetype: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    requestDownloadCancel(): (dispatch: Dispatch<AnyAction>, getState: Function) => Promise<void>;
    addDownloadedFile(downloadedFile: DownloadedFilesModel): (dispatch: Dispatch, getState: Function) => Promise<void>;
    searchFilter(text: string, allFiles: SubResourceModel[]): (dispatch: Dispatch<AnyAction>) => Promise<void>;
}

interface State {
    token: '';
    isFromLogin: boolean;
    resourceFiles: ResourceModel[];
    filterArray: SubResourceModel[];
    orientation: string;
    barierToken: string;
    downloadedFiles: Array<DownloadedFilesModel>;
    searchText: string;
    width: number;
    height: number;
    isLoading: boolean;
    showPopup: boolean;
    isSearchEnable: boolean;
}

class HomeScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            token: '',
            isFromLogin: false,
            resourceFiles: [],
            filterArray: [],
            orientation: getInitialScreenOrientation(),
            barierToken: '',
            downloadedFiles: [],
            searchText: '',
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            isLoading: false,
            showPopup: false,
            isSearchEnable: false
        };
        Orientation.getOrientation((_err, orientations) => this.setState({ orientation: orientations }));
    }

    public async componentWillMount() {
        this.setState({ downloadedFiles: [] });
        await LocalDbManager.getDownloadedFiles(async (downloadedFiles) => {
            await this.props.fetchdownloadedFiles(downloadedFiles);
            console.log('this.props.downloadedFiles ', this.props.downloadedFiles);
            this.setState({ downloadedFiles: downloadedFiles });
        });
    }

    public async componentDidMount() {
        console.log('componentDidMount')
        Dimensions.addEventListener('change', () => {
            StatusBar.setHidden(false);
        })
        this.setState({ isLoading: true });
        handleOrientationOfScreen((orientation) => { this.setState({ orientation: orientation }); });
        handleScreenDimensions((width, height) => { this.setState({ width: width, height: height }); });
        await LocalDbManager.get<ActivationAppResponse>(Constant.userDetailes, async (err, data) => {
            if (data) {
                Constant.loginName = data.UserFullName;
                Constant.bearerToken = data.Token || '';
            }
        });
        await LocalDbManager.get<CustomizeSettings>(Constant.customSettings, async (err, settings) => {
            if (settings) {
                Constant.headerImage = settings.LogoImage || '';
            }
            console.log('header image', Constant.headerImage);
        });
        await this.props.getresources(Constant.bearerToken);
        await LocalDbManager.getAllFiles((downloadedFiles, allFiles) => {
            console.log('didmount', downloadedFiles);
            console.log('allfiles...', allFiles);
            Constant.fetchAllFiles = allFiles;
            this.setState({ downloadedFiles: downloadedFiles });
        });
        this.setState({ isLoading: false });
        if (Constant.confirmationMessageText.length > 5) {
            this.setState({ showPopup: true });
        }
        console.log('logo image', Constant.headerImage);
    }

    public async updateResouces() {
        await this.closeSearch();
        await this.props.requestDeviceTokenApi(Constant.deviceToken, 1, Constant.deviceOS, Constant.bearerToken);
        if (this.props.deviceTokenResponse.error !== '') {
            Alert.alert(Config.APP_NAME, this.props.deviceTokenResponse.error);
            return;
        }
        await this.props.updateresource(Constant.bearerToken);
        if (this.props.resourceState.error !== '') {
            Alert.alert(Config.APP_NAME, this.props.resourceState.error);
            return;
        }
        console.log('updated resources', this.props.resourceState);
        await LocalDbManager.getAllFiles(async (downloadedFiles, allFiles) => {
            console.log('updated files', downloadedFiles);
            console.log('allfiles...', allFiles);
            Constant.fetchAllFiles = allFiles;
            await this.props.fetchdownloadedFiles(downloadedFiles);
            this.setState({ downloadedFiles: downloadedFiles });
        });
        if (Constant.confirmationMessageModifiedDate !== this.props.deviceTokenResponse.settings.ConfirmationMessageModifiedDate && Constant.confirmationMessageText.length > 5) {
            this.setState({ showPopup: true });
        }
    }


    public componentWillUnmount() {
        removeOrientationOfScreen();
        removeScreenDimensionsListner();
    }

    public async searchFilterFunction(textData: string) {
        this.setState({ searchText: textData });
        await this.props.searchFilter(textData, Constant.fetchAllFiles);
    }

    public renderResourceList() {
        console.log('length', this.props.resourceState.resources.length)
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        if (this.props.searchState.isSearch) {
            if (this.props.searchState.searchArray.length > 0) {
                return (
                    <View style={styles.resourceListContainer}>
                        <FlatList
                            numColumns={this.state.orientation === Constant.portrait ? Device.isPhone ? 1 : 2 : Device.isTablet ? 3 : 2}
                            key={this.state.orientation}
                            extraData={this.props}
                            data={this.props.searchState.searchArray}
                            renderItem={({ item }) =>
                                <View style={{ width: this.state.orientation === Constant.portrait ? Device.isPhone ? '100%' : '50%' : Device.isTablet ? '33%' : '50%' }}>
                                    <TouchableOpacity onPress={() => this.resourceDetails(item)}>
                                        <View style={styles.searchContainer}>
                                            <FileImageComponent fileImage={item.ResourceImage || ''} fileType={item.FileExtension} styles={styles.resourceImage} downloadFile={styles.downloadFile} filesDownloaded={this.props.downloadedFiles.downloadedfiles} ResourceId={item.ResourceId} isFromDownloadManager={false} />
                                            <Text numberOfLines={2} ellipsizeMode={'tail'} style={styles.searchTitle}>{item.ResourceName}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            }
                        />
                    </View>
                );
            } else {
                return (
                    <View style={styles.noDataContainer}>
                        <Text style={{ color: Constant.blackColor }}>No Data Found </Text>
                    </View>
                );
            }
        } else {
            if (this.props.resourceState.resources.length === 0 || this.props.resourceState.resources.length === undefined) {
                return (
                    <View style={styles.noDataContainer}>
                        <Text style={{ color: Constant.blackColor }}>No Data Found </Text>
                    </View>
                );
            } else {
                return (
                    <View style={styles.resourceListContainer}>
                        <ListView removeClippedSubviews={false} contentContainerStyle={{
                            paddingBottom: Constant.platform === 'android' ? 30 : 0, flexDirection: 'row',
                            flexWrap: 'wrap'
                        }}
                            dataSource={ds.cloneWithRows(this.props.resourceState.resources)}
                            renderRow={(rowData: ResourceModel) =>
                                <View style={{ width: this.state.orientation === Constant.portrait ? Device.isPhone ? '100%' : '50%' : Device.isTablet ? '33%' : '50%' }}>
                                    <TouchableOpacity style={styles.listItem} onPress={() => this.props.navigation.push('File', { 'item': rowData })}>
                                        <View style={styles.resourceImageConatiner}>
                                            <FolderImageComponet styles={styles.resourceImage} folderImage={rowData.ResourceImage} />
                                            {badgeNumber(rowData, this.state.downloadedFiles)}
                                        </View>
                                        <Text numberOfLines={2} ellipsizeMode={'tail'} style={{ marginLeft: 10 }}>{rowData.ResourceName}</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        />
                    </View>
                );
            }
        }
    }


    public async closeSearch() {
        this.setState({ searchText: '', isSearchEnable: false });
        await this.props.searchFilter('', Constant.fetchAllFiles);
        Keyboard.dismiss();
    }

    public render() {
        return (
            <SafeAreaView style={styles.container} forceInset={{ top: 'never', left: 'never' }}>
                <NavigationEvents
                    onWillFocus={() => this.componentWillMount()}
                    onDidFocus={() => this.render()}
                />
                <ImageBackground source={{ uri: this.state.orientation === Constant.portrait ? Constant.portraitImagePath : Constant.landscapeImagePath }} style={{ width: this.state.width, height: this.state.height }}>
                    {this.props.downloadState.isLoading ? null : <Header style={styles.headerContainer} >
                        <Image source={{ uri: Constant.headerImage }} style={styles.imageLogo} />
                        {this.state.isSearchEnable ? <View style={styles.searchBarContainer}>
                            <Item>
                                <Icon name='search' style={{ marginLeft: 10 }} />
                                <Input placeholder={Constant.searchPlaceholder}
                                    autoCorrect={false}
                                    onChangeText={text => this.searchFilterFunction(text)}
                                    value={this.state.searchText}
                                />
                                <Icon name='close' style={{ fontSize: 30 }} onPress={() => this.closeSearch()} />
                            </Item>
                        </View> : null}
                        {this.state.isSearchEnable ? null : <View style={styles.searchButtonContainer}>
                            <Icon name='search' style={styles.searchIcon} onPress={() => {
                                this.setState({ isSearchEnable: true })
                            }} />
                        </View>}
                    </Header>}
                    <Container style={styles.containerColor}>
                        {this.props.downloadState.isLoading ? null : <View style={styles.subHeaderContainer}>
                            <View style={styles.container}><Text style={styles.headerTitle}>Home</Text></View>
                            <View style={styles.refreshContainer}>
                                <TouchableOpacity onPress={() => this.updateResouces()}>
                                    <Image source={images.refresh} style={styles.refreshImage} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.downloadManagerContainer}>
                                <TouchableOpacity onPress={() => this.props.navigation.push('DownloadManager')} style={styles.menuIcon}>
                                    <Image source={images.downloadManager} style={styles.refreshImage} />
                                </TouchableOpacity>
                            </View>
                        </View>}
                        <Content contentContainerStyle={[styles.containerColor, Constant.platform === 'android' ? { paddingBottom: 30 } : { paddingBottom: 0 }]}>
                            <View style={styles.container}>
                                {this.props.downloadState.isLoading ? <DownloadProgressComponent downloadingProgress={this.props.downloadState.progress} cancelDownload={this.cancelDownload} /> : this.renderResourceList()}
                            </View>
                        </Content>
                        {this.state.showPopup ? <Popup togglePopUp={this.togglePopup} message={Constant.confirmationMessageText || ''} /> : null}
                    </Container>
                    {this.props.resourceState.isLoading || this.props.deviceTokenResponse.isLoading || this.state.isLoading ? <Loader /> : null}
                </ImageBackground>
            </SafeAreaView>
        );
    }

    public togglePopup = async () => {
        this.setState({
            showPopup: false,
        });
    }

    public async resourceDetails(data: SubResourceModel) {
        this.loadResourceAsync(data.ResourceId, data.ResourceName, data.FileExtension, data.ResourceImage, data.LauncherFile, data.ResourceSizeInKB);
    }

    public async loadResourceAsync(resourceId?: number, resourceName?: string, resourceType?: string, resourceImage?: string, launcherFile?: string, fileSize?: string) {
        if (!(resourceId && resourceName)) {
            return;
        }
        if (this.props.downloadedFiles.downloadedfiles.length > 0) {
            console.log('file has downloaded', this.props.downloadedFiles.downloadedfiles);
            const file = this.props.downloadedFiles.downloadedfiles.find(i => i.resourceId === resourceId);
            if (!file) {
                await this.downloadAndSaveResource(resourceId!, resourceName!, resourceType!, resourceImage!, launcherFile || '', fileSize!);
                return;
            }
            const path: string = Platform.OS === 'ios' ? Constant.documentDir : resourceType === FileType.zip ? Constant.documentDir : `file://${Constant.documentDir}`;
            console.log('downloadedPath', path);
            await PreviewManager.openPreview(path, file.resourceName, file.resourceType, resourceId, launcherFile || '', true, async (rootPath, launcherFile, fileName, fileType, resourceId) => {
                await this.props.navigation.push('Preview', { 'dir': rootPath, 'launcherFile': launcherFile, 'fileName': fileName, 'fileType': fileType, 'resourceId': resourceId });
            });
        } else {
            await this.downloadAndSaveResource(resourceId!, resourceName!, resourceType!, resourceImage!, launcherFile || '', fileSize!);
            return;
        }
    }

    public async downloadAndSaveResource(resourceId: number, resourceName: string, resourceType: string, resourceImage: string, launcherFile: string, fileSize: string) {
        let isConnected = await NetworkCheckManager.isConnected();
        if (!isConnected) {
            Toast.show({ text: Constant.noInternetConnction, type: 'danger', position: 'top' });
            return;
        }
        this.downloadResource(resourceId!, resourceName!, resourceType!, resourceImage!, launcherFile, fileSize);
    }

    public async downloadResource(resourceId: number, resourceName: string, resourceType: string, resourceImage: string, launcherFile: string, resourceFileSize: string) {
        const filename = resourceType === FileType.zip ? `${resourceId}${resourceType}` : resourceType === FileType.video ? resourceName.split(' ').join('') : resourceName;
        await this.props.requestDownloadFile(Constant.bearerToken, resourceId, filename, resourceType);
        if (this.props.downloadState.error !== '') {
            Alert.alert(Config.APP_NAME, Constant.cancelDownload);
            return;
        }
        await this.props.addDownloadedFile({ resourceName, resourceId, resourceType, resourceImage, launcherFile, resourceFileSize });
        console.log('downloaded files', this.props.downloadedFiles.downloadedfiles);
        const path: string = Platform.OS === 'ios' ? Constant.documentDir : resourceType === FileType.zip ? Constant.documentDir : `file://${Constant.documentDir}`;
        console.log('preview path', path);
        await PreviewManager.openPreview(path, resourceName, resourceType, resourceId, launcherFile, false, async (rootPath, launcherFile, fileName, fileType, resourceId) => {
            await this.props.navigation.push('Preview', { 'dir': rootPath, 'launcherFile': launcherFile, 'fileName': fileName, 'fileType': fileType, 'resourceId': resourceId });
        });
    }

    public cancelDownload = async () => {
        await this.props.requestDownloadCancel();
    }
}

const mapStateToProps = (state: AppState) => ({
    resourceState: state.resource,
    deviceTokenResponse: state.settings,
    userState: state.loginData,
    downloadedFiles: state.downloadedFilesData,
    downloadState: state.downloadProgress,
    searchState: state.searchData,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    getresources: bindActionCreators(fetchResources, dispatch),
    updateresource: bindActionCreators(updateResources, dispatch),
    requestDeviceTokenApi: bindActionCreators(deviceTokenApi, dispatch),
    fetchdownloadedFiles: bindActionCreators(FetchAllDownloadedFiles, dispatch),
    requestDownloadCancel: bindActionCreators(downloadCancel, dispatch),
    addDownloadedFile: bindActionCreators(AddItem, dispatch),
    requestDownloadFile: bindActionCreators(downloadFile, dispatch),
    searchFilter: bindActionCreators(searchFilter, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
