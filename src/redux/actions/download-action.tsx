import { DOWNLOAD_START, DOWNLOAD_PROGRESS, DOWNLOAD_SUCCESS, DOWNLOAD_FAILURE } from './action-types';
import { Dispatch } from 'redux';
import RNFetchBlob from 'rn-fetch-blob';
import Config from 'react-native-config';
import { Constant, FileType } from '../../constant';
let canceled: boolean;
export const downloadResourceStart = () => {
    return {
        type: DOWNLOAD_START,
    };
};

export const downloadResourceProgress = (data: number, task: any) => {
    return {
        type: DOWNLOAD_PROGRESS,
        progress: data,
        task: task,
    };
};

export const downloadResourceSuccess = (data: number) => {
    return {
        type: DOWNLOAD_SUCCESS,
        progress: data,
    };
};

export const downloadResourceFailure = () => {
    return {
        type: DOWNLOAD_FAILURE,
    };
};

export class DownloadResourceFileProgress {
    public progress: number = 0;
    public isLoading: boolean = false;
    public error: string = '';
}

export function downloadCancel(): (dispatch: Dispatch, getState: Function) => Promise<void> {
    return async (dispatch: Dispatch, getState: Function) => {
        console.log('current state', getState().downloadProgress);
        const cancelTask = getState().downloadProgress.task;
        await cancelTask.cancel(async (error: Error) => {
            canceled = true;
            await dispatch(downloadResourceFailure());
        });
    };
}

export default function downloadFile(bearer_token: string, AppUserResourceID: number, filename: string, filetype: string): (dispatch: Dispatch) => Promise<void> {
    return async (dispatch: Dispatch) => {
        let params = {
            'AppResourceId': AppUserResourceID,
        };
        console.log('document Dir', Constant.documentDir);
        let path = filetype === FileType.video ? `${Constant.documentDir}/${AppUserResourceID}${filetype}` : `${Constant.documentDir}/${filename}`;
        console.log('downloading path', path);
        dispatch(downloadResourceStart());
        try {
            let task = RNFetchBlob.config({
                path: path,
            }).fetch('POST', `${Config.BASE_URL}/${Constant.downloadFile}`, {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + bearer_token,
            }, JSON.stringify(params)).progress(async (received, total) => {
                let progress = (received / total);
                await dispatch(downloadResourceProgress(progress, task));
            });
            await task.then(async (res: any) => {
                if (res.respInfo.status === 200) {
                    if (canceled) {
                        dispatch(downloadResourceFailure());
                        canceled = false;
                    } else {
                        dispatch(downloadResourceSuccess(0));
                    }
                }
            });
        } catch (error) {
            dispatch(downloadResourceFailure());
        }
    };
}