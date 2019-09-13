import { ADD_DOWNLOADED_FILE, REMOVE_DOWNLOADED_FILE, FETCH_ALL_DOWNLOADED_FILES, LOAD_DOWNLOADED_FILE_START } from '../actions/action-types';
import { DownloadedFilesModel, FileState } from '../../models/downloadedfile-model';
const initialState: FileState = {
    downloadedfiles: [],
};

export default function downloadedFile(state = initialState, action: { type: string, downloadedfiles: DownloadedFilesModel[], error: string, resourceId: number }) {
    switch (action.type) {
        case LOAD_DOWNLOADED_FILE_START:
            return {
                ...state,
                isLoading: true,
            };
        case ADD_DOWNLOADED_FILE:
            return {
                ...state,
                downloadedfiles: action.downloadedfiles,
                error: '',
                isLoading: false,

            };
        case REMOVE_DOWNLOADED_FILE:
            return {
                ...state,
                downloadedfiles: action.downloadedfiles,
                error: action.error,
                isLoading: false,
            };
        case FETCH_ALL_DOWNLOADED_FILES:
            return {
                ...state,
                downloadedfiles: action.downloadedfiles,
                error: '',
                isLoading: false,
            };
        default:
            return state;
    }
}