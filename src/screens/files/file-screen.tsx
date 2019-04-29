import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right, Badge, SwipeRow } from 'native-base';
import { NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { Alert, Image, TouchableOpacity } from 'react-native';
import Config from 'react-native-config';
import styles from './file-style';
import { ResourceModel } from '../../models/resource-model';

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
}

interface State {
    swipe: boolean;
}

export default class FileScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            swipe: false,
        };
    }
    public lapsList() {
        let item = this.props.navigation.getParam('item');
        return item.Children.map((data: ResourceModel, index: number) => {
            if (data.ResourceType === 'folder') {
                return (
                    <View key={index}>
                        <SwipeRow
                            disableLeftSwipe={true}
                            disableRightSwipe={true}
                            body={
                                <View style={styles.folderContainer}>
                                    <View style={styles.folderImageContainer}>
                                        <Image source={{ uri: data.ResourceFolderImage, cache: 'only-if-cached' }}
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
                    <View key={index}>
                        <SwipeRow
                            style={styles.swipeContainer}
                            disableRightSwipe={true}
                            rightOpenValue={-153}
                            body={
                                <View style={styles.folderContainer}>
                                    <View style={styles.folderImageContainer}>
                                        <Image source={{ uri: data.ResourceImage, cache: 'only-if-cached' }}
                                            style={styles.image} />
                                    </View>
                                    <View style={styles.resourceContainer}>
                                        <TouchableOpacity style={styles.resourceText} onPress={() => this.resourceDetails(data)}>
                                            <Text>{data.ResourceName}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.bookmarkIconContainer}>
                                        <Icon name='star' />
                                    </View>
                                </View>
                            }
                            right={
                                <View style={styles.folderContainer}>
                                    <Button warning full onPress={() => Alert.alert('Bookmark')} style={styles.bookmarkContainer}>
                                        <Icon active name='star' />
                                        <Text style={styles.bookmarkText}>Bookmark</Text>
                                    </Button>
                                    <Button danger full onPress={() => Alert.alert('Trash')} style={styles.bookmarkContainer}>
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
                        <View>
                            {this.lapsList()}
                        </View>
                    </Content>
                </Container>
            </SafeAreaView>
        );
    }

    public resourceDetails(data: ResourceModel) {
        if (data.ResourceType === 'folder') {
            this.props.navigation.push('File', { 'item': data });
        } else {
            Alert.alert('this is file');
        }
    }
}