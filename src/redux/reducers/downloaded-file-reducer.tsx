import { ADD_DOWNLOADED_FILE, REMOVE_DOWNLOADED_FILE, FETCH_ALL_DOWNLOADED_FILES } from '../actions/action-types';
import { DownloadedFilesModel, FileState } from '../../models/downloadedfile-model';
const initialState: FileState = {
    downloadedfiles: [],
};

export default function downloadedFile(state = initialState, action: { type: string, downloadedfiles: DownloadedFilesModel[], error: string, resourceId: number }) {
    switch (action.type) {
        case ADD_DOWNLOADED_FILE:
            return {
                ...state,
                downloadedfiles: action.downloadedfiles,
                error: '',
            };
        case REMOVE_DOWNLOADED_FILE:
            return {
                ...state,
                downloadedfiles: action.downloadedfiles,
                error: action.error,
            };
        case FETCH_ALL_DOWNLOADED_FILES:
            return {
                ...state,
                downloadedfiles: action.downloadedfiles,
                error: '',
            };
        default:
            return state;
    }
}