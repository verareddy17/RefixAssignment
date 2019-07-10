import { LOAD_USER_SUCCESS, LOAD_USER_START, LOAD_USER_FAILURE, LOAD_SETTINGS_START, LOAD_SETTINGS_SUCCESS, LOAD_SETTINGS_FAIL } from './action-types';
import { Data, ApiResponse } from '../../models/response-model';
import ApiManager from '../../manager/api-manager';
import { Dispatch } from 'redux';
import Config from 'react-native-config';
import { Constant } from '../../constant';
import { CustomizeSettings, Setting } from '../../models/custom-settings';

export const loadUserRequest = () => {
    return {
        type: LOAD_USER_START,
    };
};
export const loadUserSuccess = (data: CustomizeSettings) => {
    return {
        type: LOAD_USER_SUCCESS,
        payload: data,
    };
};
export const loadUserFailed = (error: string) => {
    return {
        type: LOAD_USER_FAILURE,
        payload: error,
    };
};

export class SettingsResponse {
    public settings = new CustomizeSettings();
    public isLoading: boolean = false;
    public error: string = '';
}

// export default function deviceTokenApi(UserID: number, BUId: number): (dispatch: Dispatch) => Promise<void> {
//     return async (dispatch: Dispatch) => {
//         dispatch(loadUserRequest());
//         await ApiManager.post<ResponseJson<IpadCustomizeSetting<CustomizeSettings>>>(`${Config.BASE_URL}/${Constant.deviceTokenUrl}`, { 'UserID': UserID, 'BUId': BUId }, (data, err) => {
//             if (data) {
//                 dispatch(loadUserSuccess(data.ResponseJSON.IpadCustomizeSetting));
//             } else {
//                 dispatch(loadUserFailed(err !== null ? err as string : ''));
//             }
//         });
//     };
// }

export default function deviceTokenApi(DeviceToken: string, ThemeVersion: number, DeviceOs: number, token: string): (dispatch: Dispatch) => Promise<void> {
    return async (dispatch: Dispatch) => {
        dispatch(loadUserRequest());
        await ApiManager.post<ApiResponse<Setting<CustomizeSettings>>>(`${Config.BASE_URL}/${Constant.deviceTokenUrl}`, { 'DeviceToken': DeviceToken, 'ThemeVersion': ThemeVersion, 'DeviceOs': DeviceOs }, token, (data, err, isNetworkFail) => {
            if (!isNetworkFail) {
                if (data) {
                    if (data.Success) {
                        console.log('settings', data);
                        dispatch(loadUserSuccess(data.Data.Settings));
                    } else {
                        dispatch(loadUserFailed(data.Errors[0]));
                    }
                } else {
                    dispatch(loadUserFailed(err !== null ? err as string : ''));
                }
            } else {
                dispatch(loadUserFailed('Please check internet connection'));
            }
        });
    };
}