import { LOAD_RESOURCE_START, LOAD_RESOURCE_SUCCESS, LOAD_RESOURCE_FAIL } from './action-types';
import { ApiResponse } from '../../models/response-model';
import { ResourceModel } from '../../models/resource-model';
import ApiManager from '../../manager/api-manager';
import LocalDbManager from '../../manager/localdb-manager';
import { Dispatch } from 'redux';
import { Toast } from 'native-base';
import { Constant } from '../../constant';
import Config from 'react-native-config';

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
    public resources = new ResourceModel();
    public isLoading: boolean = false;
    public error: string = '';
}

const endPoint: string = `${Config.LOCAL_BASE_URL}/${Constant.resourceUrl}`;

export const fetchResources = (token: string) => {
    return async (dispatch: Dispatch) => {
        await ApiManager.checkNetworkConnection().then(async (networkType) => {
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
                await ApiManager.post<ApiResponse<ResourceModel[]>>(endPoint, { 'token': token }, async (data, err) => {
                    if (data) {
                        await LocalDbManager.insert('resources', data.data, (err) => {
                            console.log('Successfully inserted');
                        });
                        await LocalDbManager.get<ResourceModel[]>('resources', (err, data) => {
                            if (data) {
                                dispatch(loadResourceSuccess(data));
                            } else {
                                dispatch(loadResourceFail(err !== null ? 'unknown error' : ''));
                            }
                        });
                    } else {
                        dispatch(loadResourceFail(err !== null ? 'unknown error' : ''));
                    }
                });
            }
        });
    };
};

export const updateResources = () => {
    return async (dispatch: Dispatch) => {
        await ApiManager.get<ApiResponse<ResourceModel[]>>(endPoint, async (data, err, isnetwork) => {
            if (isnetwork) {
                Toast.show({
                    text: 'Please check internet connection',
                    type: 'danger',
                    position: 'top',
                });
                return;
            }
            dispatch(loadResourceStart());
            if (data) {
                await LocalDbManager.delete('resources', (err) => {
                    console.log('successfully removed');
                });
                await LocalDbManager.insert('resources', data.data, (err) => {
                    console.log('Successfully insertedd');
                });
                await LocalDbManager.get<ApiResponse<ResourceModel[]>>('resources', (err, data) => {
                    if (data) {
                        dispatch(loadResourceSuccess(data));
                    } else {
                        dispatch(loadResourceFail(err !== null ? 'unknown error' : ''));
                    }
                });
            } else {
                dispatch(loadResourceFail(err !== null ? 'unknown error' : ''));
            }
        });
    };
};


