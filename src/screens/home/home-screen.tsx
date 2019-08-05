import React, { Component } from 'react';
import styles from './home-style';
import { View, Text, Button, Container, Content, Header, Left, Right, Icon, Body, Title, Item, Input, Spinner, Badge, List, ListItem } from 'native-base';
import { NavigationScreenProp, SafeAreaView, NavigationEvents } from 'react-navigation';
import { ListView, Image, TouchableOpacity, Alert, AsyncStorage, FlatList, ImageBackground, Dimensions, Platform, Keyboard } from 'react-native';
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
import Orientation from 'react-native-orientation';
import imageCacheHoc from 'react-native-image-cache-hoc';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import images from '../../assets/index';
import { string } from 'prop-types';
export const CacheableImage = imageCacheHoc(Image, {
    validProtocols: ['http', 'https'],
});
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
    confirmationMessage: string;
    confirmationModifiedDate: string;
    isFromLogin: boolean;
    resourceFiles: ResourceModel[];
    isSearch: boolean;
    filterArray: SubResourceModel[];
    backgroundPortraitImage: string;
    backgroundLandscapeImage: string;
    orientation: string;
    barierToken: string;
    downloadedFiles: Array<DownloadedFilesModel>;
    headerColor: string;
    fontColor?: string;
    logoImage?: string;
    searchText: string;
    isUpdating: boolean;
}

let result: SubResourceModel[] = [];

class HomeScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            token: '',
            confirmationMessage: '',
            confirmationModifiedDate: '',
            isFromLogin: false,
            resourceFiles: [],
            isSearch: false,
            filterArray: [],
            backgroundPortraitImage: '',
            backgroundLandscapeImage: '',
            orientation: Constant.portrait,
            barierToken: '',
            downloadedFiles: [],
            headerColor: '',
            searchText: '',
            isUpdating: false,
        };
    }

    public _orientationDidChange = (orientation: string) => {
        if (orientation === Constant.landscape) {
            console.log('landscape');
            this.setState({
                orientation: Constant.landscape,
            });
        } else {
            console.log('portrait');
            this.setState({
                orientation: Constant.portrait,
            });
        }
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
        Orientation.unlockAllOrientations();
        Orientation.addOrientationListener(this._orientationDidChange);
        await LocalDbManager.get<string>(Constant.username, (err, username) => {
            Constant.loginName = username;
        });
        await LocalDbManager.get(Constant.headerColor, (err, color) => {
            this.setState({ headerColor: color } as State);
        });
        await LocalDbManager.get(Constant.fontColor, (err, color) => {
            this.setState({ fontColor: color } as State);
        });
        await LocalDbManager.get(Constant.logoImage, (err, image) => {
            this.setState({ logoImage: image } as State);
        });
        await LocalDbManager.get('userToken', (err, data) => {
            if (data !== null || data !== '') {
                this.setState({ token: data } as State);
            }
        });
        await LocalDbManager.get<string>(Constant.token, async (err, token) => {
            if (token !== null && token !== '') {
                await this.setState({
                    barierToken: token!,
                });
            }
        });
        await this.getAllResources();
        await LocalDbManager.get<string>(Constant.confirmationMessage, (err, message) => {
            if (message !== null && message !== '') {
                this.setState({
                    confirmationMessage: message!,
                });
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
        const isFromLogin = this.props.navigation.getParam('isFromLogin');
        if (isFromLogin === true) {
            LocalDbManager.showConfirmationAlert(this.state.confirmationMessage);
        }
        await LocalDbManager.get<ResourceModel[]>(Constant.resources, async (err, resource) => {
            if (resource !== undefined) {
                result = [];
                await this.getValues(resource);
                console.log('result', result);
                await LocalDbManager.insert<SubResourceModel[]>(Constant.allFiles, result, (err) => {
                    console.log('files are saved successfully');
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
        await this.props.requestDeviceTokenApi(Constant.deviceToken, 1, deviceOs, this.state.barierToken);
        console.log('update settings', this.props.deviceTokenResponse.settings);
        this.setState({
            backgroundLandscapeImage: this.props.deviceTokenResponse.settings.LandscapeImage || '',
            backgroundPortraitImage: this.props.deviceTokenResponse.settings.PortraitImage || '',
        });
        await this.props.updateresource(this.state.barierToken);
        this.setState({
            isUpdating: true,
        });
        await this.storeData<string>(Constant.confirmationMessage, this.props.deviceTokenResponse.settings.ConfirmationMessage!);
        await this.storeData<string>(Constant.confirmationModifiedDate, this.props.deviceTokenResponse.settings.ConfirmationMessageModifiedDate!);
        await this.storeData<string>(Constant.headerColor, this.props.deviceTokenResponse.settings.HeaderColor!);
        await this.storeData<string>(Constant.fontColor, this.props.deviceTokenResponse.settings.FontColor!);
        await this.storeData<string>(Constant.logoImage, this.props.deviceTokenResponse.settings.LogoImage!);
        await this.storeData<string>(Constant.backgroundPortraitImage, this.props.deviceTokenResponse.settings.PortraitImage!);
        await this.storeData<string>(Constant.backgroundLandscapeImage, this.props.deviceTokenResponse.settings.LandscapeImage!);
        await this.storeData<string>(Constant.versionNumber, this.props.deviceTokenResponse.settings.VersionNumber!);
        await LocalDbManager.get<ResourceModel[]>(Constant.resources, async (err, resource) => {
            if (resource !== undefined) {
                result = [];
                await this.getValues(resource);
                console.log('result', result);
                await LocalDbManager.insert<SubResourceModel[]>(Constant.allFiles, result, async (err) => {
                    console.log('files are saved successfully');
                    let downloadedFiles = this.state.downloadedFiles.filter(function (item1) {
                        return result.some(function (item2) {
                            return item1.resourceId === item2.ResourceId;          // assumes unique id
                        });
                    });
                    console.log('removed files', downloadedFiles);
                    await LocalDbManager.insert<Array<DownloadedFilesModel>>(Constant.downloadedFiles, downloadedFiles, async (err) => {
                        this.setState({
                            downloadedFiles: downloadedFiles,
                        });
                    });
                    this.setState({
                        isUpdating: false,
                    });
                });
            }
        });
    }

    public async storeData<T>(key: string, value: T) {
        await LocalDbManager.insert<T>(key, value, async (err) => {
            if (err !== null) {
                Alert.alert(Config.APP_NAME, err!.message);
            }
        });
    }

    public componentWillUnmount() {
        Orientation.removeOrientationListener(this._orientationDidChange);
    }

    public async showConfirmationMessage(message: string, date: string) {
        LocalDbManager.get<string>(Constant.confirmationModifiedDate, (err, date) => {
            if (err === null) {
                if (date !== null && date !== '') {
                    this.setState({
                        confirmationModifiedDate: date!,
                    });
                }
            }
        });
        console.log('date..confirmation date', date, this.state.confirmationModifiedDate);
        if (date !== this.state.confirmationModifiedDate) {
            if (message!.length > 0) {
                LocalDbManager.insert<string>(Constant.confirmationMessage, message!, (err) => {
                    console.log('Successfully inserted');
                });
                LocalDbManager.insert<string>(Constant.confirmationModifiedDate, date!, (err) => {
                    console.log('Successfully inserted');
                });
                LocalDbManager.showConfirmationAlert(message!);
            }
        }
    }

    public async searchFilterFunction(textData: string) {
        this.setState({
            searchText: textData,
        });
        if (textData.length >= 3) {
            this.setState({
                isSearch: true,
            });
            console.log('all files', result);
            let filteredArray = await result.filter((item: { ResourceName: string; }) => {
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

    public async LoopIn(children: { Children: SubResourceModel[] | undefined; }, resultArray: any[]) {
        if (children.Children === undefined || children.Children === null) {
            await resultArray.push(children);
            return;
        }
        for (let i = 0; i < children.Children.length; i++) {
            await this.LoopIn(children.Children[i], resultArray);
        }
        console.log('resultArray', result);
    }

    public async getValues(json: ResourceModel[]) {
        for (let j = 0; j < json.length; j++) {
            await this.LoopIn(json[j], result);
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
        if (this.state.isSearch) {
            return (
                <View style={styles.resourceListContainer}>
                    <FlatList
                        data={this.state.filterArray}
                        renderItem={({ item }) =>
                            <View style={styles.searchContainer}>
                                {this.renderFileImages(item)}
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
            if (this.props.resourceState.isLoading || this.props.deviceTokenResponse.isLoading || this.state.isUpdating) {
                console.log('spiiner');
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
                                            {this.renderFolderImage(rowData)}
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
    }

    public getFilesCountInFolder(data: ResourceModel) {
        if (data !== undefined) {
            if (data.Children !== undefined) {
                result = [],
                    this.getValues(data.Children);
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

    public renderFileImages(rowData: SubResourceModel) {
        if (rowData.ResourceImage === undefined || rowData.ResourceImage === '') {
            if (rowData.FileExtension === FileType.video) {
                return (
                    <Image source={images.mp4} style={styles.resourceImage} />
                );
            } else if (rowData.FileExtension === FileType.pdf || rowData.FileExtension === FileType.zip) {
                return (
                    <Image source={images.pdf} style={styles.resourceImage} />
                );
            } else if (rowData.FileExtension === FileType.png || rowData.FileExtension === FileType.jpg) {
                return (
                    <Image source={images.png} style={styles.resourceImage} />
                );
            } else {
                if (rowData.FileExtension === FileType.pptx || rowData.FileExtension === FileType.xlsx || rowData.FileExtension === FileType.docx || rowData.FileExtension === FileType.ppt) {
                    return (
                        <Image source={images.ppt} style={styles.resourceImage} />
                    );
                }
            }
        } else {
            return (
                <CacheableImage source={{ uri: rowData.ResourceImage }} style={[styles.resourceImage, { marginLeft: 10 }]} />
            );
        }
    }

    public renderFolderImage(rowData: ResourceModel) {
        if (rowData.ResourceImage === undefined || rowData.ResourceImage === '') {
            return (
                <Image source={images.folder} style={styles.resourceImage} />
            );
        } else {
            return (
                <CacheableImage source={{ uri: rowData.ResourceImage }} style={styles.resourceImage} />
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
        let { height, width } = Dimensions.get('window');
        return (
            <SafeAreaView style={styles.container} forceInset={{ top: 'never', left: 'never' }}>
                <NavigationEvents
                    onWillFocus={() => this.componentWillMount()}
                    onDidFocus={() => this.render()}
                />
                <ImageBackground source={{ uri: this.state.orientation === Constant.portrait ? this.state.backgroundPortraitImage : this.state.backgroundLandscapeImage }} style={{ width, height }}>
                    <Container style={styles.containerColor}>
                        <Header noShadow style={styles.headerBg} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                            <Left>
                                <TouchableOpacity onPress={() => this.props.navigation.openDrawer()} style={styles.menuIcon}>
                                    <Icon name='menu' style={styles.iconColor}></Icon>
                                </TouchableOpacity>
                            </Left>
                            <Body>
                                <Title style={{ color: this.state.fontColor || '#fff' }}>Home</Title>
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
                                <Input placeholder='Search Text'
                                    autoCorrect={false}
                                    onChangeText={text => this.searchFilterFunction(text)}
                                    value={this.state.searchText}
                                />
                                <Icon name='close' onPress={() => this.closeSearch()} />
                            </Item>
                        </Header>
                        <Content contentContainerStyle={styles.containerColor}>
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
