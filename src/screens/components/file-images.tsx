import { FileType } from '../../constant';
import { Image, View, StyleSheet } from 'react-native';
import images from '../../assets/index';
import imageCacheHoc from 'react-native-image-cache-hoc';
import React, { Component } from 'react';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import { ResourceModel, SubResourceModel } from '../../models/resource-model';
import LocalDbManager from '../../manager/localdb-manager';
import { Constant } from '../../constant'
export const CacheableImage = imageCacheHoc(Image, {
    validProtocols: ['http', 'https'],
});

interface Props {
    fileImage?: string;
    fileType: string;
    styles: object;
    filesDownloaded: [DownloadedFilesModel];
    ResourceId: number;
    isFromDownloadManager: boolean;
}
export default class FileImageComponent extends Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        return (
            <View>
                {this.renderFileImages(this.props.fileType, this.props.styles, this.props.filesDownloaded, this.props.ResourceId, this.props.isFromDownloadManager, this.props.fileImage)}
            </View>
        );
    }
    private fileExists(downloadedFiles: [DownloadedFilesModel], id: number): boolean {
        return downloadedFiles.some(function (file) {
            return file.resourceId === id;
        });
    }
    private renderFileImages(fileType: string, styles: object, filesDownloaded: [DownloadedFilesModel], ResourceId: number, isFromDownloadManager: boolean, fileImage?: string) {
        let temp: boolean = false;
        if (isFromDownloadManager === true || isFromDownloadManager === undefined) {
            temp = true
        } else {
            temp = false;
        }
        let isFileDownloaded = temp ? true : this.fileExists(filesDownloaded, ResourceId)
        if (fileImage === undefined || fileImage === '') {
            if (fileType === FileType.video) {
                if (isFileDownloaded) {
                    return (
                        <Image source={images.mp4} style={styles} />
                    );
                }
                return (
                    <View>
                        <Image source={images.mp4} style={styles} />
                        <Image source={images.downloadFile} style={{ height: 20, width: 20, position: 'absolute', marginTop: 40, marginLeft: 40 }} />
                    </View>
                );
            } else if (fileType === FileType.pdf || fileType === FileType.zip) {
                if (isFileDownloaded) {
                    return (
                        <Image source={images.pdf} style={styles} />
                    );
                }
                return (
                    <View>
                        <Image source={images.pdf} style={styles} />
                        <Image source={images.downloadFile} style={{ height: 20, width: 20, position: 'absolute', marginTop: 40, marginLeft: 40 }} />
                    </View>
                );
            } else if (fileType === FileType.png || fileType === FileType.jpg) {
                if (isFileDownloaded) {
                    return (
                        <Image source={images.png} style={styles} />
                    );
                }
                return (
                    <View>
                        <Image source={images.png} style={styles} />
                        <Image source={images.downloadFile} style={{ height: 20, width: 20, position: 'absolute', marginTop: 40, marginLeft: 40 }} />
                    </View>
                );
            } else if (fileType === FileType.pptx || fileType === FileType.xlsx || fileType === FileType.docx || fileType === FileType.ppt || fileType === FileType.doc || fileType === FileType.xls) {
                if (isFileDownloaded) {
                    return (
                        <Image source={images.ppt} style={styles} />
                    );
                }
                return (
                    <View>
                        <Image source={images.ppt} style={styles} />
                        <Image source={images.downloadFile} style={{ height: 20, width: 20, position: 'absolute', marginTop: 40, marginLeft: 40 }} />
                    </View>
                );
            } else {
                if (isFileDownloaded) {
                    return (
                        <Image source={images.png} style={styles} />
                    );
                }
                return (
                    <View>
                        <Image source={images.png} style={styles} />
                        <Image source={images.downloadFile} style={{ height: 20, width: 20, position: 'absolute', marginTop: 40, marginLeft: 40 }} />
                    </View>
                );
            }
        } else {
            if (isFileDownloaded) {
                return (
                    <CacheableImage source={{ uri: fileImage }} style={[styles, { marginLeft: 10 }]} />
                );
            }
            return (
                <View>
                    <CacheableImage source={{ uri: fileImage }} style={[styles, { marginLeft: 10 }]} />
                    <Image source={images.downloadFile} style={{ height: 20, width: 20, position: 'absolute', marginTop: 40, marginLeft: 40 }} />
                </View>
            )

        }
    }
}
