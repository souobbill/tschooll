import {ASSIGN_STUDENT} from '../actionType'
import {ENABLE_DELETING} from '../actionType'
import {ENABLE_ASSIGNING} from '../actionType'
import {START_DATE} from '../actionType'
import {END_DATE} from '../actionType'

export const assignStudents = (students) => {
    return (dispatch) => {
      dispatch({ type: ASSIGN_STUDENT, payload: students });
    };
  };

export const enableDeleting = (enable) => {
  return (dispatch) => {
    dispatch({ type: ENABLE_DELETING, payload: enable });
  };
};

export const enableAssigning = (enable) => {
  return (dispatch) => {
    dispatch({ type: ENABLE_ASSIGNING, payload: enable });
  };
};

export const setStartDate = (startDate) => {
  return (dispatch) => {
    dispatch({ type: START_DATE, payload: startDate });
  };
};

export const setEndDate = (endDate) => {
  return (dispatch) => {
    dispatch({ type: END_DATE, payload: endDate });
  };
};