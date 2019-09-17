import { LOAD_USER_SUCCESS, LOAD_USER_START, LOAD_USER_FAILURE, LOAD_SETTINGS_START, LOAD_SETTINGS_SUCCESS, LOAD_SETTINGS_FAIL } from './action-types';
import { Data, ApiResponse } from '../../models/response-model';
import ApiManager from '../../manager/api-manager';
import { Dispatch } from 'redux';
import Config from 'react-native-config';
import { Constant } from '../../constant';
import { CustomizeSettings, Setting } from '../../models/custom-settings';
import LocalDbManager from '../../manager/localdb-manager';
import { Alert } from 'react-native';

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
                if (data) {
                    if (data.Success) {
                        Constant.index = 0;
                        Constant.content = [];
                        Constant.navigationKey = [];
                        if (data.Data.Settings.PortraitImage !== '') {
                            Constant.headerFontColor = data.Data.Settings.FontColor;
                            Constant.portraitImagePath = data.Data.Settings.PortraitImage || '';
                            Constant.landscapeImagePath = data.Data.Settings.LandscapeImage || '';
                            Constant.headerFontColor = data.Data.Settings.FontColor;
                            Constant.confirmationMessageText = data.Data.Settings.ConfirmationMessage || '';
                            Constant.confirmationMessageModifiedDate = data.Data.Settings.ConfirmationMessageModifiedDate || '';
                        }
                        LocalDbManager.insert<CustomizeSettings>(Constant.customSettings, data.Data.Settings, (err) => { });
                        LocalDbManager.insert<string>(Constant.userToken, Constant.bearerToken, async (err) => { });
                        dispatch(loadSettingSuccess(data.Data.Settings));
                    } else {
                        try {
                            let error = data.Errors[0];
                            dispatch(loadSettingFailed(error));
                        } catch {
                            dispatch(loadSettingFailed(Constant.networkConnctionFailed));
                        }
                    }
                } else {
                    dispatch(loadSettingFailed(Constant.networkConnctionFailed));
                }

            } else {
                dispatch(loadSettingFailed(Constant.noInternetConnction));
            }
        });
    };
}