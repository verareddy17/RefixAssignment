import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right } from 'native-base';
import { NavigationScreenProp, SafeAreaView } from 'react-navigation';
import styles from './recentlyviewed-style';

interface Props {
    navigation: NavigationScreenProp<any>;
}
export default class RecentViewScreen extends Component<Props> {
    render() {
        return (
            <SafeAreaView style={styles.container} forceInset={{ top: 'never' }}>
                <Container>
                    <Header noShadow style={styles.headerBg} androidStatusBarColor={'#87bc2b'} iosBarStyle={'light-content'}>
                        <Left>
                            <Button transparent onPress={() => this.props.navigation.openDrawer()}>
                                <Icon name="menu" style={styles.iconColor}></Icon>
                            </Button>
                        </Left>
                        <Body>
                            <Title style={styles.headerTitle}>Recently Viewed</Title>
                        </Body>
                        <Right />
                    </Header>
                    <Content contentContainerStyle={styles.container}>
                        <View>
                            <Text>RecentlyView Screen</Text>
                        </View>
                    </Content>
                </Container>
            </SafeAreaView>
        )
    }
}