import { LOAD_RESOURCE_START, LOAD_RESOURCE_SUCCESS, LOAD_RESOURCE_FAIL } from './action-types';
import { ApiResponse } from '../../models/response-model';
import { ResourceModel } from '../../models/resource-model';
import ApiManager from '../../manager/api-manager';
import LocalDbManager from '../../manager/localdb-manager';
import { Dispatch } from 'redux';
import { Toast } from 'native-base';
import { Constant } from '../../constant';
import Config from 'react-native-config';
import { CustomizeSettings } from '../../models/custom-settings';

export const loadResourceStart = () => {
    return {
        type: LOAD_RESOURCE_START,
    };
};

export const loadResourceSuccess = (data: object) => {
    return {
        type: LOAD_RESOURCE_SUCCESS,
        payload: data,
    };
};

export const loadResourceFail = (err: string) => {
    return {
        type: LOAD_RESOURCE_FAIL,
        payload: err,
    };
};

export class ResourceResponse {
    public resources: Array<ResourceModel> = [];
    public isLoading: boolean = false;
    public error: string = '';
}

const endPoint: string = `${Config.BASE_URL}/${Constant.resourceUrl}`;

export const fetchResources = (token: string) => {
    return async (dispatch: Dispatch) => {
        await ApiManager.checkNetworkConnection().then(async (networkType) => {
            await LocalDbManager.get<CustomizeSettings>(Constant.customSettings, async (err, userSettings) => {
                if (userSettings !== undefined) {
                    Constant.portraitImagePath = userSettings.PortraitImage || '';
                    Constant.landscapeImagePath = userSettings.LandscapeImage || '';
                    Constant.headerFontColor = userSettings.FontColor;
                }
            });
            if (networkType === 'none') {
                dispatch(loadResourceStart());
                await LocalDbManager.get<ResourceModel[]>('resources', (err, data) => {
                    if (data) {
                        dispatch(loadResourceSuccess(data));
                    } else {
                        dispatch(loadResourceFail(err !== null ? 'unknown error' : ''));
                    }
                });
            } else {
                dispatch(loadResourceStart());
                await ApiManager.get<ApiResponse<ResourceModel[]>>(endPoint, token, async (data, err) => {
                    if (data) {
                        if (data.Success) {
                            await LocalDbManager.insert('resources', data.Data, (err) => {
                                console.log('Successfully inserted');
                            });
                            dispatch(loadResourceSuccess(data.Data));
                        } else {
                            try {
                                let error = data.Errors[0];
                                await dispatch(loadResourceFail(error));
                            } catch {
                                await dispatch(loadResourceFail(Constant.networkConnctionFailed));
                            }
                        }
                    } else {
                        dispatch(loadResourceFail(err !== null ? 'unknown error' : ''));
                    }
                });
            }
        });
    };
};

export const updateResources = (token: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(loadResourceStart());
        await ApiManager.get<ApiResponse<ResourceModel[]>>(endPoint, token, async (data, err, isnetwork) => {
            if (isnetwork) {
                dispatch(loadResourceFail(Constant.noInternetConnction));
                return;
            }
            console.log('data', isnetwork);
            if (data) {
                console.log('resource response', data);
                if (data.Success) {
                    await LocalDbManager.insert('resources', data.Data, (err) => {
                        console.log('Successfully insertedd');
                    });
                    dispatch(loadResourceSuccess(data.Data));
                } else {
                    try {
                        let error = data.Errors[0];
                        dispatch(loadResourceFail(error));
                    } catch {
                        dispatch(loadResourceFail(Constant.networkConnctionFailed));
                    }
                }
            } else {
                dispatch(loadResourceFail(err !== null ? 'unknown error' : ''));
            }
        });
    };
};


