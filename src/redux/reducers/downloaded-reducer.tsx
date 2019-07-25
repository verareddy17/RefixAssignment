import { ADD_FILE, REMOVE_FILE, FETCH_ALL_FILES } from '../actions/action-types';
import { DownloadedFilesModel } from '../../models/downloadedfile-model';
import { Action } from '../../models/generic-action';
import downloadFile from '../actions/download-action';
// import { ActionPayload } from '../../models/action-payload';
import { any } from 'prop-types';

// interface InitialState {
//     downloadedFiles: [DownloadedFilesModel];
// }
export type ActionPayload = {
    data: DownloadedFilesModel,
    resourceId: number,
    type: string,
};

const InitialState = {
    downloadedFiles: [],
};
export default function fetchDownloadedFilesReducer(state: { downloadedFiles: []}, action: ActionPayload) {
    switch (action.type) {
        case ADD_FILE:
            return {
                ...state,
                downloadedFiles: [...state.downloadedFiles, action.data],
            };
        case REMOVE_FILE:
            let newData = [...state.downloadedFiles];
            const index = newData.findIndex(resource => resource.resourceId === action.resourceId);
            if (index > -1) {
                newData.splice(index, 1);
            }
            return {
                ...state,
                downloadedFiles: newData,
            };
        case FETCH_ALL_FILES:
            return {
                ...state,
                downloadedFiles: [...state.downloadedFiles],
            };
        default:
            return state;
    }
}