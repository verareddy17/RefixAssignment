import React, { Component } from 'react';
import styles from './home-style';
import { View, Text, Button, Container, Content, Header, Left, Right, Icon, Body, Title, Item, Input, Spinner, Badge, List, ListItem } from 'native-base';
import { NavigationScreenProp, SafeAreaView, NavigationEvents } from 'react-navigation';
import { ListView, Image, TouchableOpacity, Alert, AsyncStorage, FlatList, ImageBackground, Dimensions, Platform, Keyboard, WebView } from 'react-native';
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
import PreviewManager from '../../manager/preview-manager';
import { CustomizeSettings } from '../../models/custom-settings';
import { ActivationAppResponse } from '../../models/login-model';
import FolderImageComponet from '../components/folder-images';
import { removeOrientationOfScreen, handleOrientationOfScreen, getInitialScreenOrientation } from '../components/screen-orientation';
interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    resourceState: ResourceResponse;
    deviceTokenResponse: SettingsResponse;
    getresources(token: string): object;
    getresourcesfromdb(): object;
    updateresource(token: string): object;
    requestLoginApi(pin: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    requestDeviceTokenApi(DeviceToken: string, ThemeVersion: number, DeviceOs: number, token: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;

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
    fontColor?: string;
    searchText: string;
    searchArray: SubResourceModel[];
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
        };
    }

    public async componentWillMount() {
        this.setState({
            downloadedFiles: [],
        });
        await LocalDbManager.get<Array<DownloadedFilesModel>>(Constant.downloadedFiles, (error, data) => {
            if (data) {
                this.setState({
                    downloadedFiles: data,
                });
            }
        });
    }

    public async componentDidMount() {
        handleOrientationOfScreen((orientation) => {
            this.setState({
                orientation: orientation,
            });
        });
        await LocalDbManager.get<ActivationAppResponse>(Constant.userDetailes, (err, data) => {
            if (data) {
                Constant.loginName = data.UserFullName,
                    this.setState({
                        barierToken: data.Token || '',
                    });
            }
        });
        await LocalDbManager.get<CustomizeSettings>(Constant.customSettings, (err, data) => {
            if (data) {
                this.setState({
                });
            }
        });
        await LocalDbManager.get('userToken', (err, data) => {
            if (data !== null || data !== '') {
                this.setState({ token: data } as State);
            }
        });
        await this.getAllResources();
        const isFromLogin = this.props.navigation.getParam('isFromLogin');
        if (isFromLogin === true) {
            if (this.props.deviceTokenResponse.settings.ConfirmationMessage || ''.length  > 5) {
                LocalDbManager.showConfirmationAlert(this.props.deviceTokenResponse.settings.ConfirmationMessage!);
            }
        }
        await LocalDbManager.get<SubResourceModel[]>(Constant.allFiles, async (err, allFiles) => {
            if (allFiles !== undefined) {
                this.setState({
                    searchArray: allFiles,
                });
            }
        });
    }

    public async getAllResources() {
        await this.props.getresources(this.state.barierToken);
    }

    public async updateResouces() {
        await this.closeSearch();
        const deviceOs: number = Platform.OS === 'ios' ? 1 : 0;
        // settings action
        await this.props.requestDeviceTokenApi(Constant.deviceToken, 1, deviceOs, this.state.barierToken);
        if (this.props.deviceTokenResponse.error !== '') {
            Alert.alert(Config.APP_NAME, this.props.deviceTokenResponse.error);
            return;
        }
        // resources action.
        await this.props.updateresource(this.state.barierToken);
        await LocalDbManager.get<SubResourceModel[]>(Constant.allFiles, async (err, files) => {
            if (files) {
                let downloadedFiles = this.state.downloadedFiles.filter(function (item1) {
                    return files.some(function (item2) {
                        return item1.resourceId === item2.ResourceId;          // assumes unique id
                    });
                });
                console.log('downloaded files', downloadedFiles);
                await LocalDbManager.insert<Array<DownloadedFilesModel>>(Constant.downloadedFiles, downloadedFiles, async (err) => {
                    this.setState({
                        downloadedFiles: downloadedFiles,
                        searchArray: files,
                    });
                });
            }

        });
    }

    public componentWillUnmount() {
        removeOrientationOfScreen();
    }

    public async showConfirmationMessage(message: string, date: string) {

    }

    public async searchFilterFunction(textData: string) {
        this.setState({
            searchText: textData,
        });
        if (textData.length >= 3) {
            this.setState({
                isSearch: true,
            });
            console.log('all files', this.state.searchArray);
            let filteredArray = await this.state.searchArray.filter((item: { ResourceName: string; }) => {
                let name = item.ResourceName.toUpperCase();
                return name.indexOf(textData.toUpperCase()) > -1;
            });
            await this.setState({
                filterArray: filteredArray,
            });
        } else {
            await this.setState({
                isSearch: false,
                filterArray: [],
            });
        }

    }

    public renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: '#ffffff',
                }}
            />
        );
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
                                ItemSeparatorComponent={this.renderSeparator}
                            />
                        </View>
                    );
                } else {
                    return (
                        <View style={styles.noDataContainer}>
                            <Text style={{ color: '#000' }}>No Data Found </Text>
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
                                                {this.getBadgeNumber(rowData)}
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
                    <Text style={{ color: '#000' }}>No Data Found </Text>
                </View>
            );
        }
    }

    public async getFilesCountInFolder(data: ResourceModel) {
        if (data !== undefined) {
            if (data.Children !== undefined) {
                const result = await PreviewManager.getFilesFromAllFolders(data.Children);
                console.log('result..', result);
                if (result.length === 0) {
                    return;
                } else {
                    return (
                        <Badge style={styles.badge}>
                            <Text style={styles.text}>{result.length}</Text>
                        </Badge>
                    );
                }
            }
        }
    }

    public getBadgeNumber(data: ResourceModel) {
        if (data !== undefined) {
            if (data.Children !== undefined) {
                let files = data.Children.filter((item) => {
                    return item.ResourceType !== 0;
                });
                if (files.length > 0) {
                    let newDownloadedFiles = this.state.downloadedFiles.filter(downloadFile => files.some(updatedFiles => downloadFile.resourceId === updatedFiles.ResourceId));
                    let count = data.Children.length - newDownloadedFiles.length;
                    if (count === 0) {
                        return;
                    } else {
                        return (
                            <Badge style={styles.badge}>
                                <Text style={styles.text}>{count}</Text>
                            </Badge>
                        );
                    }

                } else {
                    if (data.Children.length === 0) {
                        return;
                    } else {
                        return (
                            <Badge style={styles.badge}>
                                <Text style={styles.text}>{data.Children.length}</Text>
                            </Badge>
                        );
                    }
                }
            }
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
        let { height, width } = Dimensions.get('window');
        return (
            <SafeAreaView style={styles.container} forceInset={{ top: 'never', left: 'never' }}>
                <NavigationEvents
                    onWillFocus={() => this.componentWillMount()}
                    onDidFocus={() => this.render()}
                />
                <ImageBackground source={{ uri: this.state.orientation === Constant.portrait ? this.props.deviceTokenResponse.settings.PortraitImage : this.props.deviceTokenResponse.settings.LandscapeImage }} style={{ width, height }}>
                    <Container style={styles.containerColor}>
                        <Header noShadow style={styles.headerBg} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                            <Left>
                                <TouchableOpacity onPress={() => this.props.navigation.openDrawer()} style={styles.menuIcon}>
                                    <Icon name='menu' style={styles.iconColor}></Icon>
                                </TouchableOpacity>
                            </Left>
                            <Body>
                                <Title style={{ color: this.props.deviceTokenResponse.settings.FontColor || '#fff' }}>Home</Title>
                            </Body>
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
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    getresources: bindActionCreators(fetchResources, dispatch),
    updateresource: bindActionCreators(updateResources, dispatch),
    requestDeviceTokenApi: bindActionCreators(deviceTokenApi, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
