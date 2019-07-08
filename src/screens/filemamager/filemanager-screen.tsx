import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right, Segment, Item, Input, Spinner } from 'native-base';
import { NavigationScreenProp, SafeAreaView, NavigationEvents } from 'react-navigation';
import styles from './filemanager-style';
import Config from 'react-native-config';
import Swipeout from 'react-native-swipeout';
import { TouchableOpacity, FlatList, Image } from 'react-native';
import { FileType, Constant } from '../../constant';
import { SubResourceModel, ResourceModel } from '../../models/resource-model';
import LocalDbManager from '../../manager/localdb-manager';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
}

interface State {
    resources: SubResourceModel[];
    downloadedFiles: Array<DownloadedFilesModel>;
    isLoading: boolean;
}
// let result: SubResourceModel[] = [];
export default class FileManagerScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            resources: [],
            downloadedFiles: [],
            isLoading: false,
        };
    }

    public async componentWillMount() {
        console.log('componentDidMount');
        this.setState({
            isLoading: true,
            downloadedFiles: [],
            resources: [],
        });
        await LocalDbManager.get<Array<DownloadedFilesModel>>(Constant.downloadedFiles, (err, data) => {
            if (data) {
                console.log('downloaded files', data);
                this.setState({ downloadedFiles: data, isLoading: false });
            }
        });
        await LocalDbManager.get<Array<SubResourceModel>>(Constant.allFiles, (err, data) => {
            if (data) {
                console.log('all files', data);
                this.setState({
                    isLoading: false,
                    resources: data,
                });
            }
        });
    }

    public renderFilesImages(rowData: SubResourceModel) {
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

    public render() {
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
                            <Title style={styles.headerTitle}>Downloads</Title>
                        </Body>
                        <Right />
                    </Header>
                    <Content contentContainerStyle={styles.container}>
                        <Header noShadow searchBar rounded style={styles.searchBarHeader}>
                            <Item>
                                <Icon name='search' />
                                <Input placeholder='Search'
                                    autoCorrect={false}
                                />
                            </Item>
                        </Header>
                        {this.state.isLoading ? <View style={styles.indicatorContainer}><Spinner color={Config.PRIMARY_COLOR} /></View> : <View />}
                        {this.renderComponent()}
                    </Content>
                </Container>
            </SafeAreaView>
        );
    }

    public renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: 'black',
                }}
            />
        );
    }


    public renderComponent() {
        return (
            <View style={{
                flex: 1,
            }}>
                <FlatList
                    data={this.state.resources}
                    renderItem={({ item }) =>
                        <Swipeout right={[{
                            text: 'Delete',
                            backgroundColor: 'red',
                        },
                        {
                            text: 'Update',
                            backgroundColor: 'green',
                        },
                        ]} autoClose={true} style={{
                            paddingRight: 0,
                            paddingLeft: 0,
                        }}>
                            <View style={styles.downloadFileContainer}>
                                {this.renderFilesImages(item)}
                                <Text style={{ marginLeft: 10 }}>
                                    {item.ResourceName}
                                </Text>
                            </View>
                            <View
                                style={{
                                    height: 1,
                                    width: '100%',
                                    backgroundColor: 'black',
                                }}
                            />
                        </Swipeout>
                    }
                />
            </View>
        );
    }
}