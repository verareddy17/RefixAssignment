import { Alert, Image, View } from 'react-native';
import Config from 'react-native-config';
import RNFetchBlob from 'rn-fetch-blob';
import { FileType, Constant } from '../constant';
import AsyncStorage from '@react-native-community/async-storage';
import { DownloadedFilesModel } from '../models/downloadedfile-model';
import { SubResourceModel, ResourceModel } from '../models/resource-model';
import PreviewManager from './preview-manager';

export default class LocalDbManager {

    public static async insert<T>(key: string, value: T, callBack: (error?: Error) => void) {
        await AsyncStorage.setItem(key, await JSON.stringify(value), (error) => {
            callBack(error);
        });
    }

    public static async get<T>(key: string, callBack: (error?: Error, result?: T) => void) {
        await AsyncStorage.getItem(key, async (error, result) => {
            if (result !== null) {
                let parseJson = await JSON.parse(result!);
                callBack(error, parseJson);
            } else {
                callBack(error, result);
            }
        });
    }

    public static async update<T>(key: string, value: T, callBack: (error?: Error) => void) {
        await AsyncStorage.mergeItem(key, await JSON.stringify(value), (error) => {
            callBack(error);
        });

    }

    public static async delete(key: string, callBack: (error?: Error) => void) {
        await AsyncStorage.removeItem(key, (error) => {
            callBack(error);
        });
    }

    public static async showConfirmationAlert(confirmationMessage: string) {
        Alert.alert(Config.APP_NAME, confirmationMessage);
    }

    public static async unlinkFile(path: string, type: string, unzipPath: string) {
        await RNFetchBlob.fs.unlink(path)
            .then(async () => {
                console.log('succesfully removed file from device');
                if (type === FileType.zip) {
                    await RNFetchBlob.fs.unlink(unzipPath)
                        .then(() => { })
                        .catch((err) => { console.log('file not deleted at physically', err); });
                }
            })
            .catch((err) => { console.log('file not deleted at physically', err); });
    }

    public static async getAllFiles(callBack: (downloadedFiles: DownloadedFilesModel[], allFiles: SubResourceModel[]) => void) {
        LocalDbManager.get<ResourceModel[]>('resources', async (error, resources) => {
            if (resources !== undefined && resources !== []) {
                console.log('resources', resources);
                const allFiles = await PreviewManager.getFilesFromAllFolders(resources);
                console.log('all files', allFiles);
                await LocalDbManager.get<Array<DownloadedFilesModel>>(Constant.downloadedFiles, async (error, data) => {
                    if (data) {
                        let downloadedFiles = await data.filter(function (item1) {
                            return allFiles.some(function (item2) {
                                return item1.resourceId === item2.ResourceId;          // assumes unique id
                            });
                        });
                        console.log('downloaded files', downloadedFiles);
                        await LocalDbManager.insert<DownloadedFilesModel[]>(Constant.downloadedFiles, downloadedFiles, (error) => { })
                        await LocalDbManager.insert<SubResourceModel[]>(Constant.allFiles, allFiles, (error) => { });
                        callBack(downloadedFiles, allFiles);
                    } else {
                        await LocalDbManager.insert<SubResourceModel[]>(Constant.allFiles, allFiles, (error) => { });
                        callBack([], allFiles);
                    }
                });
            } else {
                console.log('resources123', resources);
            }
        });
    }

    public static async getDownloadedFiles(callBack: (data: DownloadedFilesModel[]) => void) {
        await LocalDbManager.get<Array<DownloadedFilesModel>>(Constant.downloadedFiles, async (error, data) => {
            console.log('downloaded files', data);
            if (data) {
                callBack(data);
            } else {
                callBack([]);
            }
        });
    }

    public static async getDownloadFiles(callBack: (resourecs: SubResourceModel[], isLoading: boolean, downloadedFiles: DownloadedFilesModel[]) => void) {
        callBack([], true, []);
        await LocalDbManager.get<Array<DownloadedFilesModel>>(Constant.downloadedFiles, async (err, downloadedFiles) => {
            if (downloadedFiles) {
                console.log('download items', downloadedFiles);
                let downloadFiles = await Constant.fetchAllFiles.filter(item => !downloadedFiles.some(downloadedItem => item.ResourceId === downloadedItem.resourceId));
                console.log('not download items', downloadFiles);
                await LocalDbManager.insert<Array<SubResourceModel>>('downloadFiles', downloadFiles, async (error) => { });
                callBack(downloadFiles, false, downloadedFiles);
            } else {
                callBack(Constant.fetchAllFiles, false, []);
            }
        });
    }

    public static async removeItemFromDownloadedList(data: DownloadedFilesModel, downloadedFiles: DownloadedFilesModel[], callBack: (resources: SubResourceModel[], downloadedFiles: DownloadedFilesModel[]) => void) {
        const index = downloadedFiles.findIndex(resource => resource.resourceId === data.resourceId);
        if (index > -1) {
            downloadedFiles.splice(index, 1); // unbookmarking
            const resoures = await Constant.fetchAllFiles.filter(item1 => !downloadedFiles.some(item2 => item1.ResourceId === item2.resourceId));
            callBack(resoures, downloadedFiles);
            await LocalDbManager.insert<Array<DownloadedFilesModel>>(Constant.downloadedFiles, downloadedFiles, (error) => { });
            await LocalDbManager.insert<Array<SubResourceModel>>('downloadFiles', resoures, async (error) => { });
        } else {
        }
    }
}