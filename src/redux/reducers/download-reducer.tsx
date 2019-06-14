import { DOWNLOAD_START, DOWNLOAD_PROGRESS, DOWNLOAD_SUCCESS, DOWNLOAD_FAILURE } from '../actions/action-types';
import { Action } from '../../models/generic-action';
import { initialState } from '../../models/initial-download-file-state';

export default function downloadReducer(state = initialState, action: Action<number>) {
    switch (action.type) {
        case DOWNLOAD_START:
            return {
                ...state,
                isLoading: true,
            };
        case DOWNLOAD_PROGRESS:
            return {
                ...state,
                progress: action.payload,
                isLoading: true,
            };
        case DOWNLOAD_SUCCESS:
            return {
                ...state,
                progress: action.payload,
                isLoading: false,
            };
        default:
            return state;
    }
}