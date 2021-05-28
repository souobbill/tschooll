import {
    ASSIGN_STUDENT,
    START_DATE, 
    END_DATE,
    ENABLE_ASSIGNING,
    ENABLE_DELETING
} from '../actionType';


const INIT_STATE = {
    assignStudent:[],
    enableDeleting: false,
    enableAssigning: false,
    startDate: '1900-01-01',
    endDate: '2030-01-01'
};

export default (state = INIT_STATE, action) => {

    switch (action.type) {

        case ASSIGN_STUDENT:
            return { ...state, assignStudent:action.payload};
        case ENABLE_ASSIGNING:
            return { ...state, enableAssigning:action.payload};
        case ENABLE_DELETING:
            return { ...state, enableDeleting:action.payload};
        case START_DATE:
            return {startDate: action.payload};
        case END_DATE:
            return { ...state, endDate:action.payload};
    
        default:
            return state;
    }
}