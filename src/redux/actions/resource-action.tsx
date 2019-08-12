import { LOAD_RESOURCE_START, LOAD_RESOURCE_SUCCESS, LOAD_RESOURCE_FAIL } from './action-types';
import { ApiResponse } from '../../models/response-model';
import { ResourceModel, SubResourceModel } from '../../models/resource-model';
import ApiManager from '../../manager/api-manager';
import LocalDbManager from '../../manager/localdb-manager';
import { Dispatch } from 'redux';
import { Toast } from 'native-base';
import { Constant } from '../../constant';
import Config from 'react-native-config';
import PreviewManager from '../../manager/preview-manager';

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
                            await LocalDbManager.get<ResourceModel[]>('resources', async(err, data) => {
                                console.log('fetch data from local data base', data);
                                if (data) {
                                    const allFiles = await PreviewManager.getFilesFromAllFolders(data);
                                    await LocalDbManager.insert<SubResourceModel[]>(Constant.allFiles, allFiles, (err) => {});
                                    dispatch(loadResourceSuccess(data));
                                } else {
                                    dispatch(loadResourceFail(err !== null ? 'unknown error' : ''));
                                }
                            });
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
        await ApiManager.get<ApiResponse<ResourceModel[]>>(endPoint, token, async (data, err, isnetwork) => {
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
                console.log('resource response', data);
                if (data.Success) {
                    console.log('success');
                    await LocalDbManager.delete('resources', (err) => {
                        console.log('successfully removed');
                    });
                    await LocalDbManager.insert('resources', data.Data, (err) => {
                        console.log('Successfully insertedd');
                    });
                    await LocalDbManager.get<ResourceModel[]>('resources', async (err, data) => {
                        if (data) {
                            const allFiles = await PreviewManager.getFilesFromAllFolders(data);
                            console.log('update', allFiles);
                            await LocalDbManager.insert<SubResourceModel[]>(Constant.allFiles, allFiles, async (err) => {});
                            dispatch(loadResourceSuccess(data));
                        } else {
                            dispatch(loadResourceFail(err !== null ? 'unknown error' : ''));
                        }
                    });
                } else {
                    console.log('faliure');

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


