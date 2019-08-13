import { Image, View } from 'react-native';
import images from '../../assets/index';
import imageCacheHoc from 'react-native-image-cache-hoc';
import React, { Component } from 'react';

export const CacheableImage = imageCacheHoc(Image, {
    validProtocols: ['http', 'https'],
});

interface Props {
    folderImage?: string;
    styles: object;
}

export default class FolderImageComponet extends Component<Props> {
    constructor(props: Props) {
        super(props);
    }
    public render() {
        return (
            <View>
                {this.renderFolderImage(this.props.styles, this.props.folderImage)}
            </View>
        );
    }

    public renderFolderImage(styles: object, folderImage?: string) {
        if (folderImage === undefined || folderImage === '') {
            return (
                <Image source={images.folder} style={styles} />
            );
        } else {
            return (
                <CacheableImage source={{ uri: folderImage }} style={styles} />
            );
        }
    }

}