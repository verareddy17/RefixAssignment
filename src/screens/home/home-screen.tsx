import React, { Component } from 'react';
import styles from './home-style';
import { View, Text, Button, Container, Content, Header, Left, Right, Icon, Body, Title, Item, Input, Spinner, Badge } from 'native-base';
import { NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { ListView, Image, TouchableOpacity, Alert, AsyncStorage } from 'react-native';
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

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    resourceState: ResourceResponse;
    deviceTokenResponse: SettingsResponse;
    getresources(token: string): object;
    getresourcesfromdb(): object;
    updateresource(): object;
    requestLoginApi(pin: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
    requestDeviceTokenApi(UserID: number, BUId: number): (dispatch: Dispatch<AnyAction>) => Promise<void>;

}

interface State {
    token: '';
    BUId: number;
    UserID: number;
    confirmationMessage: string;
    confirmationModifiedDate: string;
    isFromLogin: boolean;
}

class HomeScreen extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            token: '',
            BUId: 0,
            UserID: 0,
            confirmationMessage: '',
            confirmationModifiedDate: '',
            isFromLogin: false,
        };
    }

    public async componentDidMount() {
        await LocalDbManager.get('userToken', (err, data) => {
            this.setState({ token: data } as State);
        });
        await this.getAllResources();
        await LocalDbManager.get<string>(Constant.confirmationMessage, (err, message) => {
            if (message !== null && message !== '') {
                this.setState({
                    confirmationMessage: message!,
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
        await LocalDbManager.get<number>(Constant.buid, async (err, buid) => {
            if (err === null) {
                this.setState({
                    BUId: buid!,
                });
            }
        });
        await LocalDbManager.get<number>(Constant.userID, async (err, userID) => {
            if (err === null) {
                await this.setState({
                    UserID: userID!,
                });
            }
        });
        await this.props.requestDeviceTokenApi(this.state.UserID, this.state.BUId);
        console.log('update device token response: ', this.props.deviceTokenResponse.settings);
        await this.showConfirmationMessage(this.props.deviceTokenResponse.settings.ConfirmationMessage || '', this.props.deviceTokenResponse.settings.ConfirmationMessageModifiedDate || '');
        Crashes.generateTestCrash();
        // throw new Error('This is a test javascript crash!');
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

    public render() {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
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
                                <Input placeholder='Search' />
                            </Item>
                            <Button transparent><Text>Go</Text></Button>
                        </Header>
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