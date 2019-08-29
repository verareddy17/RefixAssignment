import React, { Component } from 'react';
import styles from './home-style';
import { View, Text, Button, Container, Content, Header, Left, Right, Icon, Body, Title, Item, Input, Spinner, Badge, List, ListItem } from 'native-base';
import { NavigationScreenProp, SafeAreaView, NavigationEvents } from 'react-navigation';
import { ListView, Image, TouchableOpacity, Alert, FlatList, ImageBackground, Dimensions, Platform, Keyboard, WebView } from 'react-native';
import { fetchResources, updateResources, ResourceResponse } from '../../redux/actions/resource-action';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators, AnyAction } from 'redux';
import { AppState } from '../../redux/reducers/index';
import Config from 'react-native-config';
import LocalDbManager from '../../manager/localdb-manager';
import { Constant } from '../../constant';
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
import downloadFile from '../../redux/actions/download-action';
import { DownloadedResources, FetchAllDownloadedFiles } from '../../redux/actions/downloaded-file-action';
import badgeNumber from '../components/badge-number';
import searchFilter from '../../search-filter';
interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    resourceState: ResourceResponse;
    deviceTokenResponse: SettingsResponse;
    userState: LoginResponse;
    downloadedFiles: DownloadedResources;
    getresources(token: string): object;
    getresourcesfromdb(): object;
    updateresource(token: string): object;
    requestLoginApi(pin: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    requestDeviceTokenApi(DeviceToken: string, ThemeVersion: number, DeviceOs: number, token: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    fetchdownloadedFiles(files: DownloadedFilesModel[]): (dispatch: Dispatch<AnyAction>) => Promise<void>;
}

interface State {
    token: '';
    isFromLogin: boolean;
    resourceFiles: ResourceModel[];
    isSearch: boolean;
    filterArray: SubResourceModel[];
    orientation: string;
    barierToken: string;
    downloadedFiles: Array<DownloadedFilesModel>;
    searchText: string;
    searchArray: SubResourceModel[];
    width: number;
    height: number;
}

class HomeScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            token: '',
            isFromLogin: false,
            resourceFiles: [],
            isSearch: false,
            filterArray: [],
            orientation: getInitialScreenOrientation(),
            barierToken: '',
            downloadedFiles: [],
            searchText: '',
            searchArray: [],
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
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
        handleOrientationOfScreen((orientation) => { this.setState({ orientation: orientation }); });
        handleScreenDimensions((width, height) => { this.setState({ width: width, height: height }); });
        await LocalDbManager.get<ActivationAppResponse>(Constant.userDetailes, async (err, data) => {
            if (data) {
                Constant.loginName = data.UserFullName;
                Constant.bearerToken = data.Token || '';
            }
        });
        await this.props.getresources(Constant.bearerToken);
        const isFromLogin = this.props.navigation.getParam('isFromLogin');
        if (isFromLogin === true) {
            if (this.props.deviceTokenResponse.settings.ConfirmationMessage || ''.length > 5) {
                LocalDbManager.showConfirmationAlert(this.props.deviceTokenResponse.settings.ConfirmationMessage!);
            }
        }
        await LocalDbManager.getAllFiles((downloadedFiles, allFiles) => {
            console.log('didmount', downloadedFiles);
            console.log('allfiles...', allFiles);
            Constant.fetchAllFiles = allFiles;
            this.setState({ downloadedFiles: downloadedFiles, searchArray: allFiles });
        });
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
        await LocalDbManager.getAllFiles((downloadedFiles, allFiles) => {
            console.log('update files', downloadedFiles);
            console.log('allfiles...', allFiles);
            Constant.fetchAllFiles = allFiles;
            this.setState({ downloadedFiles: downloadedFiles, searchArray: allFiles });
        });
    }

    public componentWillUnmount() {
        removeOrientationOfScreen();
        removeScreenDimensionsListner();
    }

    public async searchFilterFunction(textData: string) {
        this.setState({ searchText: textData });
        await searchFilter(textData, this.state.searchArray, (filterArray, isSearch) => {
            console.log('callback data search', filterArray, isSearch);
            this.setState({ filterArray: filterArray, isSearch: isSearch });
        });

    }

    public renderResourceList() {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        if (this.props.resourceState.resources.length > 0) {
            if (this.state.isSearch) {
                if (this.state.filterArray.length > 0) {
                    return (
                        <View style={styles.resourceListContainer}>
                            <FlatList
                                data={this.state.filterArray}
                                renderItem={({ item }) =>
                                    <View style={styles.searchContainer}>
                                        <FileImageComponent fileImage={item.ResourceImage || ''} fileType={item.FileExtension} styles={styles.resourceImage} />
                                        <TouchableOpacity onPress={() =>
                                            console.log('get detailes on item files', item)}>
                                            <Text style={{ padding: 10 }}>{item.ResourceName}</Text>
                                        </TouchableOpacity>
                                    </View>
                                }
                                ItemSeparatorComponent={separatorComponent}
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
                if (this.props.resourceState.isLoading || this.props.deviceTokenResponse.isLoading) {
                    return (
                        <View style={styles.loadingContainer}>
                            <Spinner color={Config.PRIMARY_COLOR}></Spinner>
                        </View>
                    );
                } else {
                    return (
                        <View style={styles.resourceListContainer}>
                            <ListView contentContainerStyle={{ paddingBottom: Constant.platform === 'android' ? 30 : 0 }}
                                dataSource={ds.cloneWithRows(this.props.resourceState.resources)}
                                renderRow={(rowData: ResourceModel) =>
                                    <View>
                                        <TouchableOpacity style={styles.listItem} onPress={() => this.props.navigation.push('File', { 'item': rowData })}>
                                            <View style={styles.resourceImageConatiner}>
                                                <FolderImageComponet styles={styles.resourceImage} folderImage={rowData.ResourceImage} />
                                                {badgeNumber(rowData, this.state.downloadedFiles)}
                                            </View>
                                            <Text style={{ marginLeft: 10 }}>{rowData.ResourceName}</Text>
                                        </TouchableOpacity>
                                        <View style={styles.renderSeparator} />
                                    </View>
                                }
                            />
                        </View>
                    );
                }
            }
        } else {
            return (
                <View style={styles.noDataContainer}>
                    <Text style={{ color: Constant.blackColor }}>No Data Found </Text>
                </View>
            );
        }
    }

    public closeSearch() {
        this.setState({
            searchText: '',
            isSearch: false,
            filterArray: [],
        });
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
                    <Container style={styles.containerColor}>
                        <Header noShadow style={styles.headerBg} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                            <Left style={styles.headerContainer}>
                                <TouchableOpacity onPress={() => this.props.navigation.openDrawer()} style={styles.menuIcon}>
                                    <Icon name='menu' style={styles.iconColor}></Icon>
                                </TouchableOpacity>
                                <Title style={{ color: Constant.headerFontColor || Constant.whiteColor, marginLeft: 20, marginTop: Constant.platform === 'android' ? 0 : 3 }}>Home</Title>
                            </Left>
                            <Body />
                            <Right>
                                <TouchableOpacity onPress={() => this.updateResouces()} style={styles.refreshIcon}>
                                    <Icon name='refresh' style={styles.iconColor}></Icon>
                                </TouchableOpacity>
                            </Right>
                        </Header>
                        <Header noShadow searchBar rounded style={styles.searchBarHeader}>
                            <Item>
                                <Icon name='search' />
                                <Input placeholder={Constant.searchPlaceholder}
                                    autoCorrect={false}
                                    onChangeText={text => this.searchFilterFunction(text)}
                                    value={this.state.searchText}
                                />
                                <Icon name='close' onPress={() => this.closeSearch()} />
                            </Item>
                        </Header>
                        <Content contentContainerStyle={[styles.containerColor, Constant.platform === 'android' ? { paddingBottom: 30 } : { paddingBottom: 0 }]}>
                            <View style={styles.container}>
                                {this.renderResourceList()}
                            </View>
                        </Content>
                    </Container>
                </ImageBackground>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    resourceState: state.resource,
    deviceTokenResponse: state.settings,
    userState: state.loginData,
    downloadedFiles: state.downloadedFilesData,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    getresources: bindActionCreators(fetchResources, dispatch),
    updateresource: bindActionCreators(updateResources, dispatch),
    requestDeviceTokenApi: bindActionCreators(deviceTokenApi, dispatch),
    fetchdownloadedFiles: bindActionCreators(FetchAllDownloadedFiles, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
