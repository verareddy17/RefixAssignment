import { SubResourceModel } from '../../models/resource-model';
import LocalDbManager from '../../manager/localdb-manager';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import { Constant, FileType } from '../../constant';
import { Toast } from 'native-base';
import { Alert, Platform } from 'react-native';
import PreviewManager from '../../manager/preview-manager';

export default class CheckBoxComponent {

    public static async getSelectedFiles(id: number, rowId: any, ids: number[], selectedFiles: SubResourceModel[], resources: SubResourceModel[], callBack: (selectedIds: number[], selectedFiles: SubResourceModel[]) => void) {
        let tmp = ids;
        let newData = selectedFiles;
        console.log('getSelectedFiles', newData)
        if (tmp.includes(id)) {
            tmp.splice(tmp.indexOf(id), 1);
            let index = newData.findIndex(item => item.ResourceId === id);
            if (index > -1) {
                newData.splice(index, 1);
                console.log('getSelectedFiles', newData)                
            }
        } else {
            console.log('getSelectedFiles push', resources, rowId)            
            tmp.push(id);
            // let file = resources[rowId];
            let file = resources[resources.findIndex(file => file.ResourceId === id)]
            console.log(' file pushed', file);
            newData.push(file);
            console.log('getSelectedFiles', newData)            
        }
        callBack(tmp, newData);
    }

    public static async selectAllFiles(isSelectAll: boolean, resources: SubResourceModel[], callBack: (isSelectAll: boolean, seletedIds: number[], selectedFiles: SubResourceModel[]) => void) {
        const selected = !isSelectAll;
        callBack(selected, [], []);
        let allIds = await resources.map(item => { return item.ResourceId; });
        let selectedFiles: Array<SubResourceModel> = [];
        if (selected) {
            await LocalDbManager.get<Array<SubResourceModel>>('downloadFiles', async (err, data) => {
                if (data !== null || data !== undefined) {
                    selectedFiles = data!;
                }
            });
            callBack(selected, allIds, selectedFiles);
        } else {
            callBack(selected, [], []);
        }
    }

    public static async removeFile(data: DownloadedFilesModel, downloadedFiles: DownloadedFilesModel[], callBack: (resources: SubResourceModel[]) => void) {
        let downloadFiles = await Constant.fetchAllFiles.filter(item1 => !downloadedFiles.some(item2 => item1.ResourceId === item2.resourceId));
        await LocalDbManager.insert<Array<DownloadedFilesModel>>(Constant.downloadedFiles, downloadedFiles, (error) => { });
        await LocalDbManager.insert<Array<SubResourceModel>>('downloadFiles', downloadFiles, async (error) => { });
        const filename = data.resourceType === FileType.zip ? `${data.resourceId}${data.resourceType}` : data.resourceType === FileType.video ? `${data.resourceId}${data.resourceType}` : data.resourceName;
        await LocalDbManager.unlinkFile(`${Constant.deleteFilePath}/${filename}`, data.resourceType, `${Constant.deleteFilePath}/${data.resourceId}`);
        callBack(downloadFiles);
    }

    public static async unzipFile(downloadedFiles: DownloadedFilesModel[], resources: SubResourceModel[], selectedFile: SubResourceModel, callBack: (resources: SubResourceModel[]) => void) {
        let downloadFiles = await resources.filter(item => !downloadedFiles.some(downloadedItem => item.ResourceId === downloadedItem.resourceId));
        await LocalDbManager.insert<Array<SubResourceModel>>('downloadFiles', resources, async (err) => {
        });
        const path: string = Platform.OS === 'ios' ? Constant.documentDir : selectedFile.FileExtension === FileType.zip ? Constant.documentDir : `file://${Constant.documentDir}`;
        console.log('download resource id', selectedFile.ResourceId);
        if (selectedFile.FileExtension === FileType.zip) {
            await PreviewManager.unzipFile(path, selectedFile.ResourceName, selectedFile.FileExtension, selectedFile.ResourceId, selectedFile.LauncherFile);
        }
        callBack(downloadFiles);
    }
}
