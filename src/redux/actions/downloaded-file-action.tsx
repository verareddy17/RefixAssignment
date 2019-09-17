import { ADD_DOWNLOADED_FILE, REMOVE_DOWNLOADED_FILE, FETCH_ALL_DOWNLOADED_FILES, LOAD_DOWNLOADED_FILE_START } from './action-types';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import { Dispatch } from 'redux';
import LocalDbManager from '../../manager/localdb-manager';
import { Toast } from 'native-base';
import { Constant } from '../../constant';

export const startLoading = () => {
    return {
        type: LOAD_DOWNLOADED_FILE_START,
    };
};

export const addItem = (downloadedfiles: DownloadedFilesModel[]) => {
    console.log('download files', downloadedfiles);
    return {
        type: ADD_DOWNLOADED_FILE,
        downloadedfiles: downloadedfiles,
    };
};

export const removeItem = (downloadedfiles: DownloadedFilesModel[], error: string) => {
    return {
        type: REMOVE_DOWNLOADED_FILE,
        downloadedfiles: downloadedfiles,
        error: error,
    };
};

export const fetchAllDownloadedFiles = (downloadedfiles: DownloadedFilesModel[]) => {
    console.log('fetch all', downloadedfiles);
    return {
        type: FETCH_ALL_DOWNLOADED_FILES,
        downloadedfiles: downloadedfiles,
    };
};

export class DownloadedResources {
    public downloadedfiles: Array<DownloadedFilesModel> = [];
    public error: string = '';
    public isLoading: boolean = false;
}
function getTime() {
    let time = new Date();
    return time.toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
}
export function AddItem(item: DownloadedFilesModel): (dispatch: Dispatch, getState: Function) => Promise<void> {
    console.log('add item', item);
    return async (dispatch: Dispatch, getState: Function) => {
        dispatch(startLoading());
        item.downloadedDate = getTime();
        console.log('date', item.downloadedDate);
        const downloadedFiles: Array<DownloadedFilesModel> = [...getState().downloadedFilesData.downloadedfiles];
        const newData = [...downloadedFiles, item];
        console.log('..new data', newData);
        await LocalDbManager.insert<Array<DownloadedFilesModel>>(Constant.downloadedFiles, newData, async (err) => {
            Toast.show({ text: 'successfully added downloads', type: 'success', position: 'bottom' });
        });
        dispatch(addItem(newData));
    };
}

export function RemoveItem(resourceId: number): (dispatch: Dispatch, getState: Function) => Promise<void> {
    return async (dispatch: Dispatch, getState: Function) => {
        console.log('current state', getState().downloadedFilesData);
        const downloadedFiles: Array<DownloadedFilesModel> = [...getState().downloadedFilesData.downloadedfiles];
        let error = '';
        const index = downloadedFiles.findIndex(resource => resource.resourceId === resourceId);
        console.log('index', index);
        if (index >= 0) {
            downloadedFiles.splice(index, 1);
        } else {
            error = 'file is not downloaded';
        }
        console.log('after remove downloadedFiles state', downloadedFiles);
        dispatch(removeItem(downloadedFiles, error));
    };
}

export function FetchAllDownloadedFiles(items: DownloadedFilesModel[]): (dispatch: Dispatch) => Promise<void> {
    console.log('items', items);
    return async (dispatch: Dispatch) => {
        dispatch(fetchAllDownloadedFiles(items));
    };
}