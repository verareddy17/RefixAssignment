import React, { Component } from 'react';
import { Icon } from 'native-base';
import {
    ScrollView,
    View,
    TouchableOpacity,
    Text,
    Dimensions,
} from 'react-native';
import styles from './breads-crumb-style';
import { Constant } from '../../../constant';
const { width } = Dimensions.get('window');

interface Props {
    data: string[];
    activeTintColor: string;
    inactiveTintColor: string;
    onPress: (index: number, name: string) => void;
}

interface State {
    status: string[];
}
class BreadsCrumb extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.onPressBreadscrumItem = this.onPressBreadscrumItem.bind(this);
        this.state = {
            status: [],
        };

    }

    public componentWillMount() {
        let statusList = new Array(this.props.data.length);
        for (let i = 0; i < statusList.length; i++) {
            statusList[i] = 'visible';
        }
        this.setState({ status: statusList });
    }
    public onPressBreadscrumItem(index: number, name: string) {
        this.setState({
            status: this.state.status.map((val, id) => {
                if (id === index) {
                    return 'invisible';
                }
                if (val === 'invisible') {
                    return this.state.status[id] = 'visible';
                }
                return val;
            }),
        });
        this.props.onPress(index, name);
    }
    public renderItem() {
        return <View style={styles.itemContainer}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} bounces={false} pagingEnabled snapToInterval={width}>
                {this.props.data.map((item, index) => {
                    return <TouchableOpacity key={index}
                        onPress={() => this.onPressBreadscrumItem(index, item)}
                        style={[styles.buttonContainer, {
                            backgroundColor: this.state.status[index] !== 'visible' ? this.props.activeTintColor : this.props.inactiveTintColor
                        }
                        ]} >
                        <View style={styles.itemContainer}>
                            <Icon
                                name={index === 0 ? '' : 'arrow-forward'} color={Constant.blackColor} style={styles.icon} />
                            <Text style={styles.title}>{item}</Text>
                        </View>
                    </TouchableOpacity>;
                })}
            </ScrollView>
        </View>;
    }
    public render() {
        return (
            <View style={styles.container}>
                <View style={styles.breadscrumbContainer}>
                    {this.renderItem()}
                </View>

            </View>
        );
    }
}
export default BreadsCrumb;