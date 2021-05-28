import {combineReducers} from 'redux'
import Student from './Student/reducer'
import StarDate from './Student/reducer'
import EndDate from './Student/reducer'
import EnableDeleting from './Student/reducer'
import EnableAssigning from './Student/reducer'

const reducers = combineReducers({
    Student:Student,
    EnableDeleting:EnableDeleting,
    EnableAssigning:EnableAssigning,
    StarDate: StarDate,
    EndDate: EndDate
});

export default reducers;