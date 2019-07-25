import { ADD_FILE, REMOVE_FILE, FETCH_ALL_FILES } from './action-types';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import { Dispatch } from 'redux';

export const addFile = (file: DownloadedFilesModel) => {
    return {
        type: ADD_FILE,
        data: file,
    };
};

export const removeFile = (id: number) => {
    return {
        type: REMOVE_FILE,
        resourceId: id,
    } ;
};
export const fetchAllFile = () => {
    return {
        type: FETCH_ALL_FILES,
    };
};
export class DownloadedFiles {
    public downloadedFiles: Array<DownloadedFilesModel> = [];
}

export function fetchAllFiles() {
    return  (dispatch: Dispatch) => {
        dispatch(fetchAllFile());
    };
}

export  function addDownloadedFile(data: DownloadedFilesModel) {
    console.log('..data,', data);
    return (dispatch: Dispatch) => {
        dispatch(addFile(data));
    };
}

export  function removeDownloadedFile(resourceId: number): (dispatch: Dispatch) => Promise<void> {
    return async (dispatch: Dispatch) => {
       await dispatch(removeFile(resourceId));
    };
}

