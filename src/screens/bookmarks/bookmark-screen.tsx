import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right, List, ListItem, Row } from 'native-base';
import { NavigationScreenProp, SafeAreaView, NavigationEvents } from 'react-navigation';
import styles from './bookmark-style';
import Config from 'react-native-config';
import { ListView, Alert, Image, TouchableOpacity, Dimensions } from 'react-native';
import LocalDbManager from '../../manager/localdb-manager';
import Bookmarks from '../../models/bookmark-model';
import { Constant, FileType } from '../../constant';
import imageCacheHoc from 'react-native-image-cache-hoc'
const CacheableImage = imageCacheHoc(Image, {
    validProtocols: ['http', 'https'],
});

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
}

interface State {
    bookmarks: Bookmarks[];
}

export default class BookmarkScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            bookmarks: [],
        };
    }

    public async componentWillMount() {
        await LocalDbManager.get<Bookmarks[]>(Constant.bookmarks, (error, data) => {
            if (data) {
                this.setState({
                    bookmarks: data,
                });
            }
        });
    }

    public async onDeleteButtonPressed(data: Bookmarks, secId: string | number, rowId: string | number, rowMap: { [x: string]: { props: { closeRow: () => void; }; }; }) {
        rowMap[`${secId}${rowId}`].props.closeRow();
        let newData = [...this.state.bookmarks];
        console.log('newdata', newData);
        const index = newData.findIndex(resource => resource.resourceId === data.resourceId);
        if (index > -1) {
            newData.splice(index, 1); // unbookmarking
            await this.setState({
                bookmarks: newData,
            });
            await LocalDbManager.insert<Bookmarks[]>(Constant.bookmarks, this.state.bookmarks, (error) => {
                if (error !== null) {
                    Alert.alert(error!.message);
                }
            });
        }
    }
    public bookmarksList() {
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        if (this.state.bookmarks.length > 0) {
            return (
                <List
                    rightOpenValue={-100}
                    dataSource={ds.cloneWithRows(this.state.bookmarks)}
                    renderRow={(data: Bookmarks) =>
                        <ListItem thumbnail style={{ height: 55 }} >
                            <Left style={{ marginLeft: 10 }}>
                                {this.renderFilesImages(data)}
                            </Left>
                            <Body style={{ marginLeft: 10 }} >
                                <Text> {data.resourceName} </Text>
                            </Body>
                            <Right>
                                <Icon style={{ color: Constant.blueColor }} name='star' />
                            </Right>
                        </ListItem>
                    }
                    renderRightHiddenRow={(data, secId, rowId, rowMap) =>
                        <View style={styles.swipeContainer}>
                            <TouchableOpacity onPress={() => this.onDeleteButtonPressed(data, secId, rowId, rowMap)}>
                                <Text style={{ color: 'white' }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            );
        } else {
            return (
                <View style={styles.noBookmarksContainer}>
                    <Text>No Bookmarks Available</Text>
                </View>
            );
        }
    }

    public renderFilesImages(rowData: Bookmarks) {
        if (rowData.resourceImage === undefined || rowData.resourceImage === '') {
            if (rowData.resourceType === FileType.video) {
                return (
                    <Image source={require('../../assets/images/mp4.png')} style={styles.resourceImage} />
                );
            } else if (rowData.resourceType === FileType.pdf || rowData.resourceType === FileType.zip) {
                return (
                    <Image source={require('../../assets/images/pdf.png')} style={styles.resourceImage} />
                );
            } else if (rowData.resourceType === FileType.png || rowData.resourceType === FileType.jpg) {
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
                <CacheableImage source={{ uri: rowData.resourceImage }} style={styles.resourceImage} />
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
                            <Title style={styles.headerTitle}>{Constant.bookmarkScreenHeaderTitle}</Title>
                        </Body>
                        <Right />
                    </Header>
                    <Content contentContainerStyle={styles.container}>
                        <View style={styles.listContainer}>
                            {this.bookmarksList()}
                        </View>
                    </Content>
                </Container>
            </SafeAreaView>
        );
    }
}

