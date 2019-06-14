import { LOAD_USER_SUCCESS, LOAD_USER_START, LOAD_USER_FAILURE } from './action-types';
import ResponseJson, { ApiResponse } from '../../models/response-model';
import ApiManager from '../../manager/api-manager';
import { Dispatch } from 'redux';
import { ActivationAppResponse } from '../../models/login-model';
import Config from 'react-native-config';
import { Constant } from '../../constant';

export const loadUserRequest = () => {
    return {
        type: LOAD_USER_START,
    };
};
export const loadUserSuccess = (data: ActivationAppResponse) => {
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
export class LoginResponse {
    public user = new ActivationAppResponse();
    public isLoading: boolean = false;
    public error: string = '';
}
export default function loginApi(pin: string): (dispatch: Dispatch) => Promise<void> {
    return async (dispatch: Dispatch) => {
        dispatch(loadUserRequest());
        await ApiManager.post<ResponseJson<ActivationAppResponse>>(`${Config.BASE_URL}/${Constant.activateAppURL}`, { 'iPadPin': pin }, (data, err) => {
            if (data) {
                console.log('loginData', data.ResponseJSON);
                dispatch(loadUserSuccess(data.ResponseJSON));
            } else {
                dispatch(loadUserFailed(err !== null ? err as string : ''));
            }
        });
    };
}