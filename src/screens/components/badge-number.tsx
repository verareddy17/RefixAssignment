
import { Text, Badge } from 'native-base';
import React, { ReactElement } from 'react';
import { SubResourceModel, ResourceModel } from '../../models/resource-model';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import { StyleSheet, View, Platform } from 'react-native';
import Config from 'react-native-config';

const styles = StyleSheet.create({
    badgeText: {
        ...Platform.select({
            ios: {
                top: -2.5,
            },
        }),
        fontSize: 10,
        lineHeight: 20,
    },
    badge: {
        backgroundColor: Config.PRIMARY_COLOR,
        height: 20,
        position: 'absolute',
        top: -10,
        right: -10,
    },
});

const badgeNumber = (data: SubResourceModel | ResourceModel, downloadedFiles: DownloadedFilesModel[]): ReactElement | undefined => {
    if (data !== undefined && data.Children !== undefined) {
        let files = data.Children.filter((item) => {
            return item.ResourceType !== 0;
        });
        if (files.length > 0) {
            let newDownloadedFiles = downloadedFiles.filter(downloadFile => files.some(updatedFiles => downloadFile.resourceId === updatedFiles.ResourceId));
            let badgeNumber = data.Children.length - newDownloadedFiles.length;
            if (badgeNumber === 0) {
                return;
            }
            return (
                <Badge style={styles.badge} >
                    <Text style={styles.badgeText}>{badgeNumber}</Text>
                </Badge>
            );
        }
        if (data.Children.length === 0) {
            return;
        }
        return (
            <Badge style={styles.badge} >
                <Text style={styles.badgeText}>{data.Children.length}</Text>
            </Badge>
        );

    }
    return;
};

export default badgeNumber;


