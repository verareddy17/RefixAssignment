import React, { Component } from 'react';
import styles from './home-style';
import { View, Text, Button, Container, Content, Header, Left, Right, Icon, Body, Title, Item, Input, Spinner, Badge, List, ListItem } from 'native-base';
import { NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { ListView, Image, TouchableOpacity, Alert, AsyncStorage, FlatList, ImageBackground, Dimensions } from 'react-native';
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
import Orientation from 'react-native-orientation';

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    resourceState: ResourceResponse;
    deviceTokenResponse: SettingsResponse;
    getresources(token: string): object;
    getresourcesfromdb(): object;
    updateresource(): object;
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
            orientation: '',
        };
    }

    public _orientationDidChange = (orientation: string) => {
        if (orientation === 'LANDSCAPE') {
            this.setState({
                orientation: 'LANDSCAPE',
            });
        } else {
            this.setState({
                orientation: 'PORTRAIT',
            });
        }
    }


    public async componentDidMount() {
        Orientation.unlockAllOrientations();
        Orientation.addOrientationListener(this._orientationDidChange);
        await LocalDbManager.get('userToken', (err, data) => {
            this.setState({ token: data } as State);
        });
        // await this.getAllResources();
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
    }

    public async getAllResources() {
        this.props.getresources(this.state.token);
    }

    public async updateResouces() {
        await this.props.updateresource();
        // await this.props.requestDeviceTokenApi(this.state.UserID, this.state.BUId);
        console.log('update device token response: ', this.props.deviceTokenResponse.settings);
        await this.showConfirmationMessage(this.props.deviceTokenResponse.settings.ConfirmationMessage || '', this.props.deviceTokenResponse.settings.ConfirmationMessageModifiedDate || '');
        Crashes.generateTestCrash();
        // throw new Error('This is a test javascript crash!');
    }

    public componentWillUnmount() {
        console.log('componentWillUnmount')
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
        if (textData.length >= 3) {
            this.setState({
                isSearch: true,
            });
            console.log('entered text', textData);
            console.log('resources', this.props.resourceState.resources);

            await this.getValues(this.props.resourceState.resources);
            console.log('all files', result);
            let filteredArray = await result.filter((item: { ResourceName: any; }) => {
                let name = item.ResourceName.toUpperCase();
                console.log('names', name);
                return name.indexOf(textData.toUpperCase()) > -1;
            });
            console.log('searching', filteredArray);
            await this.setState({
                filterArray: filteredArray,
            });
        } else {
            await this.setState({
                isSearch: false,
                filterArray: [],
            });
            result = [];
        }

    }

    public async LoopIn(children: { Children: any[] | undefined; }, resultArray: any[]) {

        if (children.Children === undefined) {
            console.log('resultArray undefi', result);
            resultArray.push(children);
            return;
        }

        for (let i = 0; i < children.Children.length; i++) {
            this.LoopIn(children.Children[i], resultArray);
        }
        console.log('resultArray', result);
    }

    public async getValues(json: any) {
        for (let j = 0; j < json.length; j++) {
            this.LoopIn(json[j], result);
        }
    }

    public renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: '#000',
                }}
            />
        );
    }

    // handling onPress action
    public getListViewItem = (item) => {
        Alert.alert(item);
    }

    public renderResourceList() {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        if (this.state.isSearch) {
            return (
                <View style={styles.resourceListContainer}>
                    <FlatList
                        data={this.state.filterArray}
                        renderItem={({ item }) =>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', height: 75 }}>
                                <Image source={{ uri: item.ResourceImage }}
                                    style={styles.resourceImage} />
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
                <View style={styles.resourceListContainer}>
                    {this.props.resourceState.isLoading === true ? <View style={styles.loadingContainer}><Spinner color={Config.PRIMARY_COLOR} /></View> :
                        <ListView
                            dataSource={ds.cloneWithRows(this.props.resourceState.resources)}
                            renderRow={(rowData) =>
                                <View>
                                    <TouchableOpacity style={styles.listItem} onPress={() => this.props.navigation.push('File', { 'item': rowData })}>
                                        <View style={styles.resourceImageConatiner}>
                                            <Image source={{ uri: rowData.ResourceFolderImage }}
                                                style={styles.resourceImage} />
                                            <Badge style={styles.badge}>
                                                <Text style={styles.text}>{rowData.ResourcesCount}</Text>
                                            </Badge>
                                        </View>
                                        <Text>{rowData.ResourceName}</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        />
                    }
                </View>
            );

        }

    }

    public render() {
        let { height, width } = Dimensions.get('window');
        return (
            <SafeAreaView style={styles.container} forceInset={{ top: 'never' }}>
                <Container>
                    <Header noShadow style={styles.headerBg} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                        <Left>
                            <TouchableOpacity onPress={() => this.props.navigation.openDrawer()} style={styles.menuIcon}>
                                <Icon name='menu' style={styles.iconColor}></Icon>
                            </TouchableOpacity>
                        </Left>
                        <Body>
                            <Title style={styles.headerTitle}>Home</Title>
                        </Body>
                        <Right>
                            <TouchableOpacity onPress={() => this.updateResouces()} style={styles.refreshIcon}>
                                <Icon name='refresh' style={styles.iconColor}></Icon>
                            </TouchableOpacity>
                        </Right>
                    </Header>
                    <Content contentContainerStyle={styles.container}>
                        <Header noShadow searchBar rounded style={styles.searchBarHeader}>
                            <Item>
                                <Icon name='search' />
                                <Input placeholder='Search'
                                    autoCorrect={false}
                                    onChangeText={text => this.searchFilterFunction(text)}
                                />
                            </Item>
                            <Button transparent><Text>Go</Text></Button>
                        </Header>
                        <ImageBackground source={{ uri: this.state.orientation === 'PORTRAIT' ? this.state.backgroundPortraitImage : this.state.backgroundLandscapeImage }} style={{ width, height }}>
                            {/* {this.renderResourceList()} */}
                        </ImageBackground>
                    </Content>
                </Container>
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