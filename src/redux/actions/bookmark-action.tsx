import {ADD_BOOKMARK_FILE} from './action-types';
import  Bookmarks from '../../models/bookmark-model';
import { Dispatch } from 'redux';
import { ResourceModel } from '../../models/resource-model';

export const addBookmarkItem = (file: Bookmarks[]) => {
    return {
        type: ADD_BOOKMARK_FILE,
        file: file,
    };
};

export class BookmarkResources {
    public bookmarkFiles: Array<Bookmarks> = [];
    public isRemoved: boolean = false;
}

export function AddBookmark(item: Bookmarks[]): (dispatch: Dispatch, getState: Function) => Promise<void> {
    return async (dispatch: Dispatch, getState: Function) => {
        dispatch(addBookmarkItem(item));
    };
}
