import React from 'react';
import { SafeAreaView, DrawerItemsProps, DrawerItems, NavigationScreenProp, NavigationEvents } from 'react-navigation';
import { View, Text, Container, Content, Header, Icon, Right, Left, Body } from 'native-base';
import { TouchableOpacity, Image } from 'react-native';
import Config from 'react-native-config';
import LocalDbManager from '../../manager/localdb-manager';
import { string } from 'prop-types';
import { Constant } from '../../constant';

interface Props {
    // tslint:disable-next-line:no-any
    navigation: NavigationScreenProp<any>;
}


interface State {
    userName: string;
}
export default class DrawerMenu extends React.Component<Props, State> {
    constructor(prop: Props) {
        super(prop);
        console.log('constructor');
        this.state = {
            userName: '',
        };
    }

    public async componentWillMount() {
        console.log('componentWillMount,drawer');
        await LocalDbManager.get<string>(Constant.username, (error, name) => {
            console.log('username', name);
        });
    }

    public render() {
        return (
            <SafeAreaView style={{ flex: 1 }} forceInset={{ top: 'never' }}>
            <NavigationEvents
                    onWillFocus={() => this.componentWillMount()}
                    onDidFocus={() => this.render()}
                />
                <Container>
                    <Header noShadow style={{ backgroundColor: Config.SECONDARY_COLOR, height: 200, alignItems: 'center', flexDirection: 'column' }} androidStatusBarColor={Config.PRIMARY_COLOR} iosBarStyle={'light-content'}>
                        <Image style={{ height: 100, width: 100 }} source={require(`../../assets/images/hubspot_logo.png`)} />
                        <Text style={{ fontSize: 20, color: '#ffffff' }}>{Config.APP_NAME}</Text>
                        <Text style={{ fontSize: 20, color: '#ffffff' }}>{this.state.userName}</Text>
                    </Header>
                </Container>
            </SafeAreaView>
        );
    }
}