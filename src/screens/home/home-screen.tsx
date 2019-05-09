import React, { Component } from 'react';
import styles from './home-style';
import { View, Text, Button, Container, Content, Header, Left, Right, Icon, Body, Title, Item, Input, Spinner, List, ListItem, Badge } from 'native-base';
import { NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { ListView, Image, TouchableOpacity } from 'react-native';
import { fetchResources, updateResources, ResourceResponse } from '../../redux/actions/resource-action';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { AppState } from '../../redux/reducers/index';
import Config from 'react-native-config';
import LocalDbManager from '../../manager/localdb-manager';

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    resourceState: ResourceResponse;
    getresources(token: string): object;
    getresourcesfromdb(): object;
    updateresource(): object;
}

interface State {
    token: '';
}

class HomeScreen extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            token: '',
        };
    }

    public async componentDidMount() {
        await LocalDbManager.get('userToken', (err, data) => {
            this.setState({ token: data } as State);
        });
        await this.getAllResources();
    }

    public async getAllResources() {
        this.props.getresources(this.state.token);
    }

    public updateResouces() {
        this.props.updateresource();
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
                                                    <Image source={{ uri: rowData.ResourceFolderImage, cache: 'only-if-cached' }}
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
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    getresources: bindActionCreators(fetchResources, dispatch),
    updateresource: bindActionCreators(updateResources, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);