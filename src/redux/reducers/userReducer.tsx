import { LOAD_USER_SUCCESS, LOAD_USER_START } from '../actions/actionTypes';
import { UserModel } from '../actions/userAction';
import { string } from 'prop-types';

const initialState = {
    user: UserModel,
    isLoading : false
};
export interface Action <T> {
    type: string,
    payload: T
}
const userReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case LOAD_USER_START:
            console.log('state', state);
            return  {
                ...state,
                isLoading:true
            }
        case LOAD_USER_SUCCESS:
            console.log('')
            return  {
                ...state,
                user: action.payload,
                isLoading: false
            }
        default :
            return state;
    }
}
export default userReducer;