import { FileType } from '../constant';
import { Image, View } from 'react-native';
import images from './index';
import imageCacheHoc from 'react-native-image-cache-hoc';
import React, { Component } from 'react';

export const CacheableImage = imageCacheHoc(Image, {
    validProtocols: ['http', 'https'],
});

interface Props {
    fileImage?: string;
    fileType: string;
    styles: object;
}

export default class ImagesComponet extends Component<Props> {
    constructor(props: Props) {
        super(props);
    }
    public render() {
        return (
            <View>
                {this.renderFileImages(this.props.fileType, this.props.styles, this.props.fileImage)}
            </View>
        );
    }

    public renderFileImages(fileType: string, styles: object, fileImage?: string) {
        if (fileImage === undefined || fileImage === '') {
            if (fileType === FileType.video) {
                return (
                    <Image source={images.mp4} style={styles} />
                );
            } else if (fileType === FileType.pdf || fileType === FileType.zip) {
                return (
                    <Image source={images.pdf} style={styles} />
                );
            } else if (fileType === FileType.png || fileType === FileType.jpg) {
                return (
                    <Image source={images.png} style={styles} />
                );
            } else if (fileType === FileType.pptx || fileType === FileType.xlsx || fileType === FileType.docx || fileType === FileType.ppt || fileType === FileType.doc || fileType === FileType.xls) {
                return (
                    <Image source={images.ppt} style={styles} />
                );
            } else {
                return (
                    <Image source={images.png} style={styles} />
                );
            }
        } else {
            return (
                <CacheableImage source={{ uri: fileImage }} style={[styles, { marginLeft: 10 }]} />
            );
        }
    }

}