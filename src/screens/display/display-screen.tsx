import React, { Component } from 'react';
import { View, Text, Button, Container, Content, Header, Left, Icon, Body, Title, Right, Spinner } from 'native-base';
import { WebView, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationScreenProp, SafeAreaView } from 'react-navigation';
import Config from 'react-native-config';
import styles from './display-style';
import Video from 'react-native-video';
import { FileType } from '../../constant';

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

    public renderVideoOrHtmlFile(fileType: string, dirPath: string, launcherFile: string, fileName: string) {
        if (fileType === FileType.video) {
            return (
                <Video
                    source={{ uri: `${dirPath}/${fileName}.${fileType}` }}
                    resizeMode='cover'
                    style={StyleSheet.absoluteFill}
                />
            );
        } else {
            return (
                <WebView
                    originWhitelist={['*']}
                    source={{ uri: `${dirPath}/${launcherFile}` }}
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
            );
        }
    }

    public render() {
        const dirPath = this.props.navigation.getParam('dir');
        const launcherFile = this.props.navigation.getParam('launcherFile') as string;
        const fileName = this.props.navigation.getParam('fileName') as string;
        const fileType = this.props.navigation.getParam('fileType') as string;
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
                            {this.state.isLoading ?
                                <Spinner style={styles.spinnerConatiner} size={'large'} color='#fff' />
                                : <View />
                            }
                            {this.renderVideoOrHtmlFile(fileType, dirPath, launcherFile, fileName)}
                        </View>
                    </Content>
                </Container>
            </SafeAreaView>
        );
    }
}
