import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right, Segment, Item, Input } from 'native-base';
import { NavigationScreenProp, SafeAreaView } from 'react-navigation';
import styles from './filemanager-style';
import Config from 'react-native-config';
import Swipeout from 'react-native-swipeout';
import { TouchableOpacity, FlatList, Image } from 'react-native';
import { FileType } from '../../constant';
import { SubResourceModel, ResourceModel } from '../../models/resource-model';
import LocalDbManager from '../../manager/localdb-manager';

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
}

interface State {
    resources: SubResourceModel[];
}
let result: SubResourceModel[] = [];
export default class FileManagerScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            resources: [],
        };
    }

    public componentWillMount() {
        // ,
        let array = [{ id: 1, name: 'test1' }, { id: 3, name: 'test3' }, { id: 4, name: 'test4' }, { id: 2, name: 'test2' }, { id: 5, name: 'test2' }];

        let anotherOne = [{ id: 2, name: 'test2' }, { id: 4, name: 'test4' }];

        let downloadedFiles = array.filter((item) => {
            return anotherOne.some(item2 => item2.id === item.id);
        });
        console.log('downloadedFiles', downloadedFiles);

        let anotherArray = array.filter(item1 => {
            return anotherOne.filter(item => {
                return item.id === item1.id;
            }).length > 0;
        });
    }

    public async componentDidMount() {
        await LocalDbManager.get<ResourceModel[]>('resources', (err, data) => {
            console.log('fetch data from local data base', data);
            if (data) {
                this.getValues(data);
            } else {

            }
        });
    }

    public async LoopIn(children: { Children: SubResourceModel[] | undefined; }, resultArray: any[]) {
        if (children.Children === undefined) {
            resultArray.push(children);
            return;
        }
        for (let i = 0; i < children.Children.length; i++) {
            this.LoopIn(children.Children[i], resultArray);
        }
        console.log('resultArray', result);
        this.setState({
            resources: result,
        });
    }

    public async getValues(json: ResourceModel[]) {
        for (let j = 0; j < json.length; j++) {
            this.LoopIn(json[j], result);
        }
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
            } else if (rowData.ResourceType === FileType.png || rowData.ResourceType === FileType.jpg) {
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
        console.log('downloades');
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
                            <View style={{ height: 70, justifyContent: 'flex-start', backgroundColor: 'white', flexDirection: 'row', alignItems: 'center' }}>
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