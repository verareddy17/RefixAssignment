import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right, Badge, SwipeRow, Toast, List, ListItem } from 'native-base';
import { NavigationScreenProp, SafeAreaView, NavigationEvents } from 'react-navigation';
import Config from 'react-native-config';
import styles from './resource-explorer-style';
import LocalDbManager from '../../manager/localdb-manager';
import Bookmarks from '../../models/bookmark-model';
import { Alert, Image, TouchableOpacity, Platform, ProgressBarAndroid, ProgressViewIOS, AsyncStorage, ListView, PanResponder, PanResponderInstance } from 'react-native';
import { ResourceModel, SubResourceModel } from '../../models/resource-model';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import RNFetchBlob from 'rn-fetch-blob';
import NetworkCheckManager from '../../manager/networkcheck-manager';
import { Constant, FileType } from '../../constant';
import PreviewManager from '../../manager/preview-manager';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators, AnyAction } from 'redux';
import { AppState } from '../../redux/reducers/index';
import { DownloadResourceFileProgress } from '../../redux/actions/download-action';
import downloadFile from '../../redux/actions/download-action';
import { any } from 'prop-types';


interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
    downloadState: DownloadResourceFileProgress;
    requestDownloadFile(UserID: number, BUId: number, AppUserResourceID: number, filename: string): (dispatch: Dispatch<AnyAction>) => Promise<void>;
}

interface State {
    swipe: boolean;
    bookmarkedFiles: Bookmarks[];
    downloadedFiles: Array<DownloadedFilesModel>;
    UserID?: number;
    BUId?: number;
}

const dirs = RNFetchBlob.fs.dirs.DocumentDir;

class ResourceExplorerScreen extends Component<Props, State> {
    public swipeClose!: SwipeRow;
    public _panResponder!: PanResponderInstance;
    constructor(props: Props) {
        super(props);
        this.state = {
            swipe: false,
            bookmarkedFiles: [],
            downloadedFiles: [],
        };
        this._panResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      
            onPanResponderGrant: (evt, gestureState) => {
              // The gesture has started. Show visual feedback so the user knows
              // what is happening!
              // gestureState.d{x,y} will be set to zero now
              console.log('x,y axis', gestureState);
            },
            onPanResponderMove: (evt, gestureState) => {
              // The most recent move distance is gestureState.move{X,Y}
              // The accumulated gesture distance since becoming responder is
              // gestureState.d{x,y}
              console.log('x,y axis', gestureState);

            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (evt, gestureState) => {
              // The user has released all touches while this view is the
              // responder. This typically means a gesture has succeeded
              console.log('gesture relesed', gestureState);
            },
            onPanResponderTerminate: (evt, gestureState) => {
              // Another component has become the responder, so this gesture
              // should be cancelled
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
              // Returns whether this component should block native components from becoming the JS
              // responder. Returns true by default. Is currently only supported on android.
              return true;
            },
          });
    }

    public async componentWillMount() {
        await LocalDbManager.get<Bookmarks[]>(Constant.bookmarks, (error, data) => {
            if (data) {
                this.setState({
                    bookmarkedFiles: data,
                });
            }
        });
        await LocalDbManager.get<Array<DownloadedFilesModel>>('downloadedFiles', (err, data) => {
            if (data) {
                this.setState({ downloadedFiles: data } as State);
            }
        });
        await this.getBUId();
        await this.getUserId();
    }

    public setColorIfFileIsBookmarked(resourceID: number) {
        let bookmarks = this.state.bookmarkedFiles || [];
        const search = (resourceID: number) => bookmarks.find(element => element.resourceId === resourceID);
        if (search(resourceID)) {
            return Constant.blueColor;
        }
        return Constant.blackColor;
    }

    public async getUserId() {
        await LocalDbManager.get<number>(Constant.userID, async (err, userId) => {
            if (err === null) {
                await this.setState({
                    UserID: userId,
                });
            }
        });
    }

    public async getBUId() {
        await LocalDbManager.get<number>(Constant.buid, async (err, buid) => {
            if (err === null) {
                await this.setState({
                    BUId: buid,
                });
            }
        });
    }

    public async onBookmarkButtonPressed(data: ResourceModel) {
        // secId: string | number, rowId: string | number, rowMap: { [x: string]: { props: { closeRow: () => void; }; }; }
        // rowMap[`${secId}${rowId}`].props.closeRow();
        let bookmarkFiles = this.state.bookmarkedFiles || [];
        let index = bookmarkFiles.findIndex(resource => resource.resourceId === data.ResourceID);
        if (index > -1) {
            bookmarkFiles.splice(index, 1); // unbookmarking
        } else {
            bookmarkFiles.push({ resourceId: data.ResourceID, resourceName: data.ResourceName, resourceImage: data.ResourceImage }); // adding bookmark
        }
        await LocalDbManager.insert<Bookmarks[]>(Constant.bookmarks, bookmarkFiles, (error) => {
            if (error !== null) {
                Toast.show({ text: error!.message, type: 'warning', position: 'top' });
            } else {
                this.setState({
                    bookmarkedFiles: bookmarkFiles,
                });
            }
        });
    }

    public resourceList() {
        let item = this.props.navigation.getParam('item');
        let files = item.Children.filter((data: SubResourceModel) => {
            return data.ResourceType !== 'folder';
        });
        let folders = item.Children.filter((data: SubResourceModel) => {
            return data.ResourceType === 'folder';
        });
        console.log('files', files);
        console.log('folders', folders);
        return item.Children.map((data: SubResourceModel, index: number) => {
            if (data.ResourceType === 'folder') {
                return (
                    <View key={index}>
                        <SwipeRow
                            disableLeftSwipe={true}
                            disableRightSwipe={true}
                            body={
                                <View style={styles.folderContainer}>
                                    <View style={styles.folderImageContainer}>
                                        <Image source={{ uri: data.ResourceFolderImage }}
                                            style={styles.image} />
                                        <Badge style={styles.badge}>
                                            <Text style={styles.badgeText}>{data.ResourcesCount}</Text>
                                        </Badge>
                                    </View>
                                    <View style={styles.resourceContainer}>
                                        <TouchableOpacity style={styles.resourceText} onPress={() => this.resourceDetails(data)}>
                                            <Text>{data.ResourceName}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            }
                        />
                    </View>
                );
            } else {
                return (
                    <View key={index} {...this._panResponder.panHandlers}>
                        <SwipeRow
                            style={styles.swipeContainer}
                            disableRightSwipe={true}
                            rightOpenValue={-150}
                            onRowClose={() => {
                                console.log('onRowClose', index);
                            }}
                            onRowOpen={() => {
                                console.log('onRowOpen', index);
                            }}
                            body={
                                <View style={styles.folderContainer}>
                                    <View style={styles.folderImageContainer}>
                                        <Image source={{ uri: data.ResourceImage }}
                                            style={styles.image} />
                                    </View>
                                    <View style={styles.resourceContainer}>
                                        <TouchableOpacity style={styles.resourceText} onPress={() => this.resourceDetails(data, data.ResourceID, data.ResourceName, data.FileType, data.ResourceImage, data.LauncherFile)}>
                                            <Text>{data.ResourceName}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.bookmarkIconContainer}>
                                        <Icon style={{ color: this.setColorIfFileIsBookmarked(data.ResourceID) }} name='star' />
                                    </View>
                                </View>
                            }
                            right={
                                <View style={styles.folderContainer}>
                                    <Button warning full onPress={() => this.onBookmarkButtonPressed(data)} style={styles.bookmarkContainer}>
                                        <Icon active name='star' />
                                        <Text style={styles.bookmarkText}>Bookmark</Text>
                                    </Button>
                                    <Button danger full onPress={() => this.deleteFileIfAlreadyDownloaded(data.ResourceID)} style={styles.bookmarkContainer}>
                                        <Icon active name='trash' />
                                        <Text style={styles.bookmarkText}>Delete</Text>
                                    </Button>
                                </View>
                            }
                        />
                    </View>
                );
            }
        });
    }

    public render() {
        let item = this.props.navigation.getParam('item');
        return (
            <SafeAreaView style={styles.container} forceInset={{ top: 'never' }}>
                <Container>
                    <Header noShadow style={styles.headerBg} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                        <Left>
                            <Button transparent onPress={() => this.props.navigation.pop()}>
                                <Icon name='arrow-back' style={styles.iconColor} />
                            </Button>
                        </Left>
                        <Body>
                            <Title style={styles.headerTitle}>{item.ResourceName}</Title>
                        </Body>
                        <Right />
                    </Header>
                    <Content contentContainerStyle={styles.container}>
                        <View style={styles.container}>
                            {this.props.downloadState.isLoading ? this.progress() : this.resourceList()}
                        </View>
                    </Content>
                </Container>
            </SafeAreaView>
        );
    }

    public async resourceDetails(data: ResourceModel, resourceId?: number, resourceName?: string, resourceType?: string, resourceImage?: string, launcherFile?: string) {
        if (data.ResourceType === 'folder') {
            this.props.navigation.push('File', { 'item': data });
        }
        this.loadResourceAsync(resourceId, resourceName, resourceType, resourceImage, launcherFile);
    }

    public progress() {
        const downloadProgress = Math.floor(this.props.downloadState.progress * 100);
        if (Platform.OS === 'ios') {
            return (
                <View style={styles.progressBarConainer}>
                    <Text style={styles.progressBarText}>{`Downloading(${downloadProgress})`}</Text>
                    <ProgressViewIOS style={styles.progressBarWidth} progress={this.props.downloadState.progress} />
                </View>
            );
        } else {
            return (
                <View style={styles.progressBarConainer}>
                    <Text style={styles.progressBarText}>{`Downloading(${downloadProgress})`}</Text>
                    <ProgressBarAndroid styleAttr='Horizontal' style={styles.progressBarWidth} progress={this.props.downloadState.progress} />
                </View>
            );
        }
    }

    public async downloadResource(resourceId: number, resourceName: string, resourceType: string, resourceImage: string, launcherFile: string) {
        const filename = resourceType === FileType.zip ? `${resourceId}.${resourceType}` : resourceType === FileType.video ? resourceName.split(' ').join('') : resourceName;
        await this.props.requestDownloadFile(this.state.UserID!, this.state.BUId!, resourceId, filename);
        await this.state.downloadedFiles.push({ resourceName, resourceId, resourceType, resourceImage, launcherFile });
        await LocalDbManager.insert<Array<DownloadedFilesModel>>('downloadedFiles', this.state.downloadedFiles, async (err) => {
            console.log('Successfully inserted');
        });
        let path: string = Platform.OS === 'ios' ? dirs : `file://${dirs}`;
        await PreviewManager.openPreview(path, resourceName, resourceType, resourceId, launcherFile, async (rootPath, launcherFile, fileName, fileType) => {
            await this.props.navigation.push('Preview', { 'dir': rootPath, 'launcherFile': launcherFile, 'fileName': fileName, fileType: fileType });
        });
    }
    public async deleteFileIfAlreadyDownloaded(resoureID: number) {
        // rowMap[`${secId}${rowId}`].props.closeRow();
        // secId: string | number, rowId: string | number, rowMap: { [x: string]: { props: { closeRow: () => void; }; }; }
        let newData = [...this.state.downloadedFiles];
        const index = newData.findIndex(resource => resource.resourceId === resoureID);
        if (index > -1) {
            newData.splice(index, 1); // removing file if already downloaded
            await this.setState({
                downloadedFiles: newData,
            });
            await LocalDbManager.insert<DownloadedFilesModel[]>('downloadedFiles', this.state.downloadedFiles, (error) => {
                if (error !== null) {
                    Toast.show({ text: error!.message, type: 'warning', position: 'top' });
                }
            });
        }

    }

    public async loadResourceAsync(resourceId?: number, resourceName?: string, resourceType?: string, resourceImage?: string, launcherFile?: string) {
        if (!(resourceId && resourceName)) {
            Toast.show({ text: 'File data not available', type: 'warning', position: 'top' });
            return;
        }
        try {
            await LocalDbManager.get<Array<DownloadedFilesModel>>('downloadedFiles', async (err, downloadedFiles) => {
                if (!downloadedFiles) {
                    await this.downloadAndSaveResource(resourceId!, resourceName!, resourceType!, resourceImage!, launcherFile || '');
                    return;
                }
                const file = downloadedFiles.find(i => i.resourceId === resourceId);
                if (!file) {
                    await this.downloadAndSaveResource(resourceId!, resourceName!, resourceType!, resourceImage!, launcherFile || '');
                    return;
                }
                let path: string = Platform.OS === 'ios' ? dirs : `file://${dirs}`;
                await PreviewManager.openPreview(path, file.resourceName, file.resourceType, resourceId, launcherFile || '', async (rootPath, launcherFile, fileName, fileType) => {
                    await this.props.navigation.push('Preview', { 'dir': rootPath, 'launcherFile': launcherFile, 'fileName': fileName, fileType: fileType });
                });
            });
        } catch (error) {
            Toast.show({ text: error, type: 'warning', position: 'top' });
        }
    }

    public async downloadAndSaveResource(resourceId: number, resourceName: string, resourceType: string, resourceImage: string, launcherFile: string) {
        let isConnected = await NetworkCheckManager.isConnected();
        if (!isConnected) {
            Toast.show({ text: 'Please check internet connection', type: 'danger', position: 'top' });
            return;
        }
        this.downloadResource(resourceId!, resourceName!, resourceType!, resourceImage!, launcherFile);
    }
}

const mapStateToProps = (state: AppState) => ({
    downloadState: state.downloadProgress,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    requestDownloadFile: bindActionCreators(downloadFile, dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(ResourceExplorerScreen);

