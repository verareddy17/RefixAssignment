import { ActivationAppResponse } from '../models/login-model';

export const initialState = {
    user: new ActivationAppResponse(),
    isLoading: false,
    error: '',
};