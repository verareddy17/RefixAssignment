import { FileType } from '../constant';
import { unzip } from 'react-native-zip-archive';
import OpenFile from 'react-native-doc-viewer';
import { Toast } from 'native-base';

export default class PreviewManager {

    public static async extractFileName(fileName: string): Promise<string> {
        let index = fileName.indexOf('.');
        let name = fileName.substring(0, index);
        let resourceName = name.split(' ').join('');
        return resourceName;
    }

    public static async openPreview(dir: string, fileName: string, fileType: string, resourceId: number, launcherFile: string, callback: (rootPath: string, launcherFile: string, fileName: string, fileType: string) => void) {
        if (fileType === FileType.zip) {
            let resourceName = await PreviewManager.extractFileName(fileName);
            const sourcePath = `${dir}/${resourceId}.${fileType}`;
            const targetPath = `${dir}/${resourceId}/${resourceName}`;
            console.log('source path', sourcePath);
            await unzip(sourcePath, targetPath).then(() => {
                callback(`${dir}/${resourceId}`, launcherFile, resourceName, fileType);
            })
                .catch((error) => {
                    console.log('failed to unzip the file ', error);
                });
        } else if (fileType === FileType.video) {
            let resourceName = await PreviewManager.extractFileName(fileName);
            callback(`${dir}`, launcherFile, resourceName, fileType);
        } else {
            console.log('downladed file', `${dir}/${fileName}`);
            OpenFile.openDoc([{
                url: `${dir}/${fileName}`,
                fileName: fileName,
                fileType: fileType,
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
}