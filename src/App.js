import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import addToken from './services/interceptor'
import LayoutOfApp from './components/Layout'
// Pages
const TeacherList = React.lazy(() => import('./container/TeacherList'));
const Login = React.lazy(() => import('./container/Login'));
const StudentList = React.lazy(() => import('./container/StudentList'));
const StudentProfile = React.lazy(() => import('./container/StudentProfile'));
const TeacherProfile = React.lazy(() => import('./container/TeacherProfile'));
const Settings = React.lazy(() => import('./container/StudentList/Settings'));
const Tenant = React.lazy(() => import('./container/StudentList/Tenant'));
const ShortMessages = React.lazy(() => import('./container/StudentList/shortMessages'));
const StudentsOfTeacher = React.lazy(() => import('./container/TeacherList/StudentListOfTeacher'));
const StudentDetail = React.lazy(() => import('./container/StudentList/StudentDetail'))
const StudentDetails = React.lazy(() => import('./container/StudentProfile/StudentDetails'))
const Schedules = React.lazy(() => import('./container/Schedule'))
const ParentList = React.lazy(() => import('./container/StudentProfile/parentList'))
const ShowParent = React.lazy(() => import('./container/StudentProfile/showParent'))
const CreateParent = React.lazy(() => import('./container/StudentProfile/createParent'))
const CreateSchedule = React.lazy(() => import('./container/Schedule/create'))
const CreateStudent = React.lazy(() => import('./container/StudentProfile/create'))
const CreateTeacher = React.lazy(() => import('./container/TeacherProfile/create'))
const CreateBooking = React.lazy(() => import('./container/StudentList/create'))
const CreateAvailibility = React.lazy(() => import('./container/TeacherList/create'))
const CreateMessage = React.lazy(() => import('./container/StudentList/addMessage'))

const UpdateParent = React.lazy(() => import('./container/StudentProfile/updateParent'))
const UpdateSchedule = React.lazy(() => import('./container/Schedule/update'))
const UpdateStudent = React.lazy(() => import('./container/StudentProfile/update'))
const UpdateTeacher = React.lazy(() => import('./container/TeacherProfile/update'))
const UpdateBooking = React.lazy(() => import('./container/StudentList/update'))
const UpdateAvailibility = React.lazy(() => import('./container/TeacherList/update'))

const TagList = React.lazy(() => import('./container/Tag'))
const CreateTag = React.lazy(() => import('./container/Tag/create'))
const UpdateTag = React.lazy(() => import('./container/Tag/update'))

addToken();

function App() {
  return (

    <BrowserRouter>
      <Switch>
        <LayoutOfApp>
          <React.Suspense fallback={<div>Loading... </div>}>
            <Route exact path="/login" name="Login Page" render={props => <Login {...props} />} />
            <Route exact path="/" name="Student Page" render={props => <StudentList {...props} />} />
            <Route exact path="/studentlist" name="Student Page" render={props => <StudentList {...props} />} />
            <Route exact path="/studentlist/add" name="Create Student Booking Page" render={props => <CreateBooking {...props} />} />
            <Route exact path="/studentlist/:id/update" name="Create Student Booking Page" render={props => <UpdateBooking {...props} />} />
            <Route exact path="/studentprofiles" name="Student Page" render={props => <StudentProfile {...props} />} />
            <Route exact path="/studentprofiles/:id/update" name="Student Page" render={props => <UpdateStudent {...props} />} />
            <Route exact path="/parentProfiles" name="Parent Page" render={props => <ParentList {...props} />} />
            <Route exact path="/parentProfiles/add" name="Create Parent Page" render={props => <CreateParent {...props} />} />
            <Route exact path="/parentProfiles/:id/update" name="Create Parent Page" render={props => <UpdateParent {...props} />} />
            <Route exact path="/studentprofiles/:id/details" name="Student Page" render={props => <StudentDetails {...props} />} />
            <Route exact path="/studentprofiles/add" name="Create Student Page" render={props => <CreateStudent {...props} />} />
            <Route exact path="/teacherprofiles" name="Teacher Page" render={props => <TeacherProfile {...props} />} />
            <Route exact path="/teacherprofiles/add" name="Create Teacher Page" render={props => <CreateTeacher {...props} />} />
            <Route exact path="/teacherprofiles/:id/update" name="Create Teacher Page" render={props => <UpdateTeacher {...props} />} />
            <Route exact path="/settings" name="Settings Page" render={props => <Settings {...props} />} />
            <Route exact path="/tenant" name="Tenant Page" render={props => <Tenant {...props} />} />
            <Route exact path="/short-messages/:id" name="Settings Page" render={props => <ShortMessages {...props} />} />
            <Route exact path="/messages/add/:id" name="Add messages Page" render={props => <CreateMessage {...props} />} />
            <Route exact path="/studentlist/teacher/:id" name="StudentOfTeacher Page" render={props => <StudentsOfTeacher {...props} />} />
            <Route exact path="/teacherlist" name="Teacher Page" render={props => <TeacherList {...props} />} />
            <Route exact path="/teacherlist/add" name="Create Parent Page" render={props => <CreateAvailibility {...props} />} />
            <Route exact path="/teacherlist/:id/update" name="Update availability Page" render={props => <UpdateAvailibility {...props} />} />
            <Route exact path="/parentProfiles/:id/details" name="Show parent Page" render={props => <ShowParent {...props} />} />
            <Route exact path="/schedules" name="Schedules Page" render={props => <Schedules {...props} />} />
            <Route exact path="/schedules/add" name="Create Schedule Page" render={props => <CreateSchedule {...props} />} />
            <Route exact path="/schedules/:id/update" name="Create Schedule Page" render={props => <UpdateSchedule {...props} />} />
            <Route exact path="/studentlist/studentDetail/:id" name="Student Page" render={props => <StudentDetail {...props} />} />
            <Route exact path="/tagList" name="Tag Page" render={props => <TagList {...props} />} />
            <Route exact path="/tag/add" name="Create Tag Page" render={props => <CreateTag {...props} />} />
            <Route exact path="/tag/:id/update" name="Update Tag Page" render={props => <UpdateTag {...props} />} />
            <Redirect from="/" to="/login" />
          </React.Suspense>
        </LayoutOfApp>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
