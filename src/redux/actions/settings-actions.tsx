import { LOAD_USER_SUCCESS, LOAD_USER_START, LOAD_USER_FAILURE, LOAD_SETTINGS_START, LOAD_SETTINGS_SUCCESS, LOAD_SETTINGS_FAIL } from './action-types';
import { Data, ApiResponse } from '../../models/response-model';
import ApiManager from '../../manager/api-manager';
import { Dispatch } from 'redux';
import Config from 'react-native-config';
import { Constant } from '../../constant';
import { CustomizeSettings, Setting } from '../../models/custom-settings';

export const loadSettingRequest = () => {
    return {
        type: LOAD_SETTINGS_START,
    };
};
export const loadSettingSuccess = (data: CustomizeSettings) => {
    console.log('data', data);
    return {
        type: LOAD_SETTINGS_SUCCESS,
        payload: data,
    };
};
export const loadSettingFailed = (error: string) => {
    return {
        type: LOAD_SETTINGS_FAIL,
        payload: error,
    };
};

export class SettingsResponse {
    public settings = new CustomizeSettings();
    public isLoading: boolean = false;
    public error: string = '';
}

export default function deviceTokenApi(DeviceToken: string, ThemeVersion: number, DeviceOs: number, token: string): (dispatch: Dispatch) => Promise<void> {
    return async (dispatch: Dispatch) => {
        dispatch(loadSettingRequest());
        await ApiManager.post<ApiResponse<Setting<CustomizeSettings>>>(`${Config.BASE_URL}/${Constant.deviceTokenUrl}`, { 'DeviceToken': DeviceToken, 'ThemeVersion': ThemeVersion, 'DeviceOs': DeviceOs }, token, async (data, err, isNetworkFail) => {
            if (!isNetworkFail) {
                console.log('setting', data);
                if (data) {
                    if (data.Success) {
                        console.log('..../');
                        await dispatch(loadSettingSuccess(data.Data.Settings));
                    } else {
                        try {
                            let error = data.Errors[0];
                            dispatch(loadSettingFailed(error));
                        } catch {
                            dispatch(loadSettingFailed('Network request failed'));
                        }
                    }
                } else {
                    dispatch(loadSettingFailed('Network request failed'));
                }

            } else {
                dispatch(loadSettingFailed('Please check internet connection'));
            }
        });
    };
}