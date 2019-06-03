import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right, Spinner } from 'native-base';
import { WebView, TouchableOpacity } from 'react-native';
import { NavigationScreenProp, SafeAreaView } from 'react-navigation';
import Config from 'react-native-config';
import styles from './display-style';

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
}

interface State {
    isLoading: boolean;
}
export default class DisplayScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: false,
        };
    }
    public render() {
        const rootPath = this.props.navigation.getParam('rootPath');
        const launcherFile = this.props.navigation.getParam('launcherFile') as string;
        const fileName = this.props.navigation.getParam('fileName') as string;
        const filePath = `${rootPath.split(' ').join('')}/${'story.html'}`;
        console.log('filepath', filePath);
        return (
            <SafeAreaView style={styles.contentContainer} forceInset={{ top: 'never' }}>
                <Container>
                    <Header noShadow style={styles.headerContainer} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                        <Left>
                            <Button transparent onPress={() => this.props.navigation.pop()}>
                                <Icon name='arrow-back' style={styles.iconColor} />
                            </Button>
                        </Left>
                        <Body>
                            <Text>{fileName}</Text>
                        </Body>
                        <Right />
                    </Header>
                    <Content contentContainerStyle={styles.contentContainer}>
                        <View style={styles.contentContainer}>
                            <WebView
                                originWhitelist={['*']}
                                source={{ uri: `${rootPath}/${launcherFile}` }}
                                onLoadStart={() => {
                                    this.setState({
                                        isLoading: true,
                                    });
                                }}
                                onLoadEnd={() => {
                                    this.setState({
                                        isLoading: false,
                                    });
                                }}
                            />
                            {this.state.isLoading ?
                                <Spinner style={styles.spinnerConatiner} size={'large'} color='#fff' />
                                : <View />
                            }
                        </View>
                    </Content>
                </Container>
            </SafeAreaView>
        );
    }
}
