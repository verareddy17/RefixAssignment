import { DOWNLOAD_START, DOWNLOAD_PROGRESS, DOWNLOAD_SUCCESS, DOWNLOAD_FAILURE } from './action-types';
import { Dispatch } from 'redux';
import RNFetchBlob from 'rn-fetch-blob';
import Config from 'react-native-config';
import { Constant, FileType } from '../../constant';
import { loadResourceFail } from './resource-action';
const dirs = RNFetchBlob.fs.dirs.DocumentDir;
var task: any;
export const downloadResourceStart = () => {
    return {
        type: DOWNLOAD_START,
    };
};

export const downloadResourceProgress = (data: number) => {
    return {
        type: DOWNLOAD_PROGRESS,
        payload: data,
    };
};

export const downloadResourceSuccess = (data: number) => {
    return {
        type: DOWNLOAD_SUCCESS,
        payload: data,
    };
};

export const downloadResourceFailure = (error: string) => {
    return {
        type: DOWNLOAD_FAILURE,
        payload: error,
    };
};

export class DownloadResourceFileProgress {
    public progress: number = 0;
    public isLoading: boolean = false;
    public error: string = '';
}

export function downloadCancel(): (dispatch: Dispatch) => Promise<void> {
    return async (dispatch: Dispatch) => {
        await task.cancel(async (error: any) => {
            await dispatch(downloadResourceFailure('Download canceled by user'));
        });
    };
}

export default function downloadFile(bearer_token: string, AppUserResourceID: number, filename: string, filetype: string): (dispatch: Dispatch) => Promise<void> {
    return async (dispatch: Dispatch) => {
        let params = {
            'AppResourceId': AppUserResourceID,
        };
        let path = filetype === FileType.video ? `${dirs}/${AppUserResourceID}${filetype}` : `${dirs}/${filename}`;
        console.log('downloading path', path);
        dispatch(downloadResourceStart());
        try {
            task = RNFetchBlob.config({
                path: path,
            }).fetch('POST', `${Config.BASE_URL}/${Constant.downloadFile}`, {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + bearer_token,
            }, JSON.stringify(params)).progress(async (received, total) => {
                let progress = (received / total);
                await dispatch(downloadResourceProgress(progress));
            });
            await task.then(async (res: any) => {
                console.log('file downloaded path', res);
                await dispatch(downloadResourceSuccess(0));
            });

        } catch (error) {
            console.log('download file', error);
            await dispatch(downloadResourceSuccess(0));
        }
    };
}