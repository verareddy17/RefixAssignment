import { ADD_BOOKMARK_FILE } from '../actions/action-types';
import Bookmarks, { BookmarkState } from '../../models/bookmark-model';
const initialState: BookmarkState = {
    bookmarkfiles: [],
};

export default function bookmarkReducer(state = initialState, action: { type: string, bookmarkfiles: Bookmarks[], isRemoved: boolean }) {
    switch (action.type) {
        case ADD_BOOKMARK_FILE:
            return {
                ...state,
                bookmarkfiles: action.bookmarkfiles,
                isRemoved: action.isRemoved,
            };
        default:
            return state;
    }
}