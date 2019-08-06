import { FileType, Constant } from '../constant';
import { unzip } from 'react-native-zip-archive';
import OpenFile from 'react-native-doc-viewer';
import { Toast } from 'native-base';
import RNFetchBlob from 'rn-fetch-blob';

export default class PreviewManager {

    public static async extractFileName(fileName: string): Promise<string> {
        let index = fileName.indexOf('.');
        let name = fileName.substring(0, index);
        let resourceName = name.split(' ').join('');
        return resourceName;
    }

    public static async openPreview(dir: string, fileName: string, fileType: string, resourceId: number, launcherFile: string, callback: (rootPath: string, launcherFile: string, fileName: string, fileType: string, resourceId: number) => void) {
        if (fileType === FileType.zip) {
            let resourceName = await PreviewManager.extractFileName(fileName);
            const sourcePath = `${dir}/${resourceId}${fileType}`;
            const targetPath = `${dir}/${resourceId}/${resourceName}`;
            console.log('source path', sourcePath);
            console.log('targetedPath', targetPath);
            await unzip(sourcePath, targetPath).then(() => {
                callback(`${dir}/${resourceId}`, launcherFile, resourceName, fileType, resourceId);
            })
                .catch((error) => {
                    console.log('failed to unzip the file ', error);
                });
        } else if (fileType === FileType.video) {
            let resourceName = await PreviewManager.extractFileName(fileName);
            callback(`${dir}`, launcherFile, resourceName, fileType, resourceId);
        } else {
            console.log('downladed file', `${dir}/${fileName}`);
            let type = await fileType.split('.').join('');
            console.log('type', type);
            await OpenFile.openDoc([{
                url: `${dir}/${fileName}`,
                fileName: fileName,
                fileType: type,
                cache: false,
            }], (error, url) => {
                if (error) {
                    Toast.show({ text: error, type: 'warning', position: 'top' });
                } else {
                    console.log('fetching path of downloaded file : ', url);
                }
            });
        }
    }

    public static async unzipFile(dir: string, fileName: string, fileType: string, resourceId: number, launcherFile: string) {
        if (fileType === FileType.zip) {
            let resourceName = await PreviewManager.extractFileName(fileName);
            const sourcePath = `${dir}/${resourceId}${fileType}`;
            const targetPath = `${dir}/${resourceId}/${resourceName}`;
            console.log('source path', sourcePath);
            console.log('targetedPath', targetPath);
            await unzip(sourcePath, targetPath).then(async (path) => {
                console.log('unzip path', path);
            })
                .catch((error) => {
                    console.log('failed to unzip the file ', error);
                });
        }
    }

    public static async findHtmlFile(folder: string) {
        try {
            let files = await RNFetchBlob.fs.ls(folder);
            let htmlFile = files.filter((file) => {
                return file === Constant.indexHtml;
            });
            if (htmlFile.length > 0) {
                return `${folder}/${files[0]}`;
            } else {
                let subFolder = await RNFetchBlob.fs.ls(`${folder}/${files[0]}`);
                let subfolderHtmlFile = subFolder.filter((subfolderFile) => {
                    return subfolderFile === Constant.indexHtml;
                });
                if (subfolderHtmlFile.length > 0) {
                    return `${folder}/${files[0]}/${subfolderHtmlFile[0]}`;
                }
            }
        } catch (error) {
        }
    }

    public static async previewZipOrVideoFile(dirPath: string, launcherFile: string, fileName: string, fileType: string, resourceId: number, callback: (path: string, isLoading: boolean, fileType: string) => void) {
        if (fileType === FileType.zip) {
            if (launcherFile === '' || launcherFile === undefined || launcherFile === null) {
                const path = await PreviewManager.findHtmlFile(`${dirPath}/${fileName}`);
                callback(path || '', false, fileType);
            } else {
                const replacebackwardSlashInLancherFile = launcherFile.replace(/\\/g, '/');
                let splitLauncherPath = replacebackwardSlashInLancherFile.split('/');
                splitLauncherPath.shift();
                let combinedPath = splitLauncherPath.join('/');
                let path = `${dirPath}/${fileName}/${combinedPath}`;
                callback(path, false, fileType);
            }

        } else {
            const videoPath = `${dirPath}/${resourceId}${fileType}`;
            callback(videoPath, false, fileType);
        }
    }
}