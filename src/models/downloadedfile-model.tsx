
export class DownloadedFilesModel {
    public resourceId: number = 0;
    public resourceName: string = '';
    public resourceType: string = '';
    public resourceImage: string = '';
    public launcherFile: string = '';
}
export interface FileState {
    downloadedfiles: DownloadedFilesModel[];
}