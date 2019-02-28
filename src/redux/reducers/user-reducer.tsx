import { LOAD_USER_SUCCESS, LOAD_USER_START } from '../actions/action-types';
import { UserModel } from '../actions/user-action';

const initialState = {
    user: new UserModel(),
    isLoading: false
};

export interface Action<T> {
    type: string,
    payload: T
}
const userReducer = (state = initialState, action: Action<UserModel>) => {
    switch (action.type) {
        case LOAD_USER_START:
            return {
                ...state,
                isLoading: true
            }
        case LOAD_USER_SUCCESS:
            return {
                ...state,
                user: action.payload,
                isLoading: false
            }
        default:
            return state;
    }
}
export default userReducer;