
import { Text, Badge } from 'native-base';
import React, { ReactElement } from 'react';
import { SubResourceModel, ResourceModel } from '../../models/resource-model';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import { StyleSheet, View, Platform } from 'react-native';
import Config from 'react-native-config';
let result: SubResourceModel[] = [];

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
function recurseSubFolders(children: { Children: SubResourceModel[] | undefined; }, resultArray: any[]) {
    if (children.Children === undefined || children.Children === null) {
        resultArray.push(children);
        return;
    }
    for (let i = 0; i < children.Children.length; i++) {
        recurseSubFolders(children.Children[i], resultArray);
    }
    console.log('resultArray', result);
}

function getFilesFromAllFolders(json: ResourceModel[]) {
    result = [];
    for (let j = 0; j < json.length; j++) {
        recurseSubFolders(json[j], result);
    }
    return result;
}
const badgeNumber = (data: SubResourceModel | ResourceModel, downloadedFiles: DownloadedFilesModel[]): ReactElement | undefined => {
    if (data !== undefined && data.Children !== undefined) {
        result = [];
        getFilesFromAllFolders(data.Children);
        if (result.length > 0) {
            let newDownloadedFiles = downloadedFiles.filter(downloadFile => result.some(updatedFiles => downloadFile.resourceId === updatedFiles.ResourceId));
            let badgeNumber = result.length - newDownloadedFiles.length;
            if (badgeNumber === 0) {
                return;
            }
            return (
                <Badge style={styles.badge} >
                    <Text style={styles.badgeText}>{badgeNumber}</Text>
                </Badge>
            );
        }
        if (result.length === 0) {
            return;
        }
        return (
            <Badge style={styles.badge} >
                <Text style={styles.badgeText}>{result.length}</Text>
            </Badge>
        );

    }
    return;
};

export default badgeNumber;


