import { CustomizeSettings } from '../models/custom-settings';

export const initialState = {
    settings: new CustomizeSettings(),
    isLoading: false,
    error: '',
};
