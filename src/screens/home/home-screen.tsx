import React, { Component } from 'react';
import styles from './home-style';
import { View, Text, Button, Container, Content, Header, Left, Right, Icon, Body, Title, Item, Input, Spinner, List, ListItem, Thumbnail } from 'native-base';
import { NavigationScreenProp, SafeAreaView } from 'react-navigation';

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
}

export default class HomeScreen extends Component<Props> {
    public render() {
        return (
            <SafeAreaView style={styles.container} forceInset={{ top: 'never' }}>
                <Container>
                    <Header noShadow style={styles.headerBg} androidStatusBarColor={'#87bc2b'} iosBarStyle={'light-content'}>
                        <Left>
                            <Button transparent onPress={() => this.props.navigation.openDrawer()}>
                                <Icon name='menu' style={styles.iconColor}></Icon>
                            </Button>
                        </Left>
                        <Body>
                            <Title style={styles.headerTitle}>Home</Title>
                        </Body>
                        <Right>
                            <Button transparent>
                                <Icon name='refresh' style={styles.iconColor}></Icon>
                            </Button>
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
                    </Content>
                </Container>
            </SafeAreaView>
        );
    }
}