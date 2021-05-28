import 'antd/dist/antd.css';
import { useHistory } from 'react-router-dom'
import { useLocation } from "react-router-dom";
import '../../Assets/container/StudentList.css'
import { PageHeader, Form, Input, Button, Select } from 'antd';
import React, { useEffect, useState, useReducer } from 'react'
import { updateBooking, findTeacherListByFirstNameAndLastName } from '../../services/Teacher';
import { getStudentProfileByDate, getSchedule, assignStudentToAnotherTeacher, getTags } from '../../services/Student'
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import Moment from 'react-moment';

const formReducer = (state, event) => {
    return {
        ...state,
        [event.name]: event.value
    }
}

function UpdateBooking() {

    const history = useHistory();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [open1, setOpen1] = useState(false);
    const [loadingS, setLoadingS] = useState(false);
    const [student, setStudent] = useState(null);
    const [data, setData] = useState(location.state.student);
    const [comment, setComment] = useState('');
    const [formData, setFormData] = useReducer(formReducer, {});
    const [studentList, setStudentList] = useState([]);
    const [children, setChildren] = useState(null);
    const [form] = Form.useForm();
    const [schedules, setSchedules] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [dates, setDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dat, setDat] = useState(null);
    const [subjec, setSubjec] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [teacher, setTeacher] = useState(null);
    const [teacherName, setTeacherName] = useState(null);
    const [list, setList] = useState([]);
    const [tagsList, setTagsList] = useState([]);
    const [tags, setTags] = useState([]);
    const [defaulttags, setDefaultTags] = useState([]);
    const [teacherSearch, setTeacherSearch] = useState({
        name: "",
        firstName: "",
        lastName: "",
    })
    const [search, setSearch] = useState({
        name: "",
        firstName: "",
        lastName: "",
    })
    const [listProps, setListProps] = useState({
        index: 0,
        size: 10,
    });
    const [sortingName, setSortingName] = useState("createDate");
    const [sortingType, setSortingType] = useState("desc");

    useEffect(() => {
        setChildren(data.studentProfile)
        setTeacher(data.teacherAvailability)
        setSubjec(data.schedule.subject)
        setDat(data.schedule.startDate)
        setComment('')
        getStudents();
        getTeacherListView();
        getSchedule(1).then(data => {
            setSchedules(data.content)
            var obj = {};
            for (var i = 0, len = data.content.length; i < len; i++)
                obj[data.content[i]['subject']] = data.content[i];

            data.content = new Array();
            for (var key in obj)
                data.content.push(obj[key]);
            setSubjects(data.content)
        });
        if (data.tags) {
            data.tags.map(tag => defaulttags.push(tag.name))
        }
    }, []);

    const handleChange = event => {
        setFormData({
            name: event.target.name,
            value: event.target.value,
        });
    }

    const changeChildren = (id) => {
        setDates([]);
        setSubjects([]);
        setDat(null);
        setSubjec(null);
        let _children = studentList.filter(c => c.id == id)[0];
        setChildren(_children);
        getSchedule(1).then(data => {
            setSchedules(data.content)
            var obj = {};
            for (var i = 0, len = data.content.length; i < len; i++)
                obj[data.content[i]['subject']] = data.content[i];

            data.content = new Array();
            for (var key in obj)
                data.content.push(obj[key]);
            setSubjects(data.content)
        });
    }

    const changeSubject = (subject) => {
        setSubjec(subject);
        setDat(null);
        setDates(schedules.filter(s => s.subject == subject));
    }

    const changeDate = (date) => {
        setDat(date);
    }

    const getEnabledTags = () => {
        setLoading(true)
        getTags(listProps.index, listProps.size, "name", sortingType).then(data => {
            if (data) {
                if (data.content) {
                    setTagsList(data.content.filter(t => t.enabled == true));
                }
            }
        }).finally(() => setLoading(false))
    }

    const handleChangeTags = (value) => {
        setTags(value);
    }

    const handleSubmit = () => {
        let s = schedules.filter(s => s.startDate == dat).filter(s => s.subject == subjec)[0];
        if (s == null || children == null) {
            alert('Fill the form');
            return;
        }
        setSubmitting(true);

        updateBooking(data.id, children, s, comment).then(data => {
            history.push(`/studentlist`)
        }).catch(err => {
            alert("Error occured when saving data, please retry!")
            console.log(err)
        }).finally(() => setSubmitting(false));
    }

    const getStudents = () => {
        setLoadingS(true);
        getStudentProfileByDate(localStorage.getItem('toStart'), localStorage.getItem('toEnd'), 0, 100, 'firstName', 'asc').then(data => {
            if (data) {
                if (data.content) {
                    setStudentList(data.content);
                }
            }
        }).finally(() => setLoadingS(false))
    }


    const assigningStudents = (teacher, studentId) => {
        assignStudentToAnotherTeacher(teacher.id, studentId)
            .then(res => {
            }).finally(() => {
            })
    }

    const getTeacherListView = () => {
        setLoading(true);
        findTeacherListByFirstNameAndLastName(teacherSearch.firstName.trim(), localStorage.getItem('toStart'), localStorage.getItem('toEnd'), 0, 500, null, sortingName, sortingType).then(data => {
            if (data) {
                if (data.content) {
                    setList(data.content)
                } else {
                    setList([])
                }
            } else {
                setList([])
            }
        }).finally(() => setLoading(false));
    }

    const computeLastName = (name) => {
        let lastName = '';
        for (let index = 1; index < name.length; index++) {
            lastName = lastName.trim() + ' ' + name[index].trim();
        }
        return lastName
    }

    const changeTeacherSearch = (e) => {
        const { name, value } = e.target;
        setTeacherName(value);
        setTeacherSearch({ ...search, [name]: value.trim() });
        if (e.target.name === "name") {
            var nameData = value.trim().split(" ");
            if (nameData.length > 1) {
                setTeacherSearch({ ...search, firstName: nameData[0].trim(), lastName: computeLastName(nameData) });
            }
            else {
                setTeacherSearch({ ...search, firstName: nameData[0].trim(), lastName: nameData[0].trim() });
            }
        }
        getTeacherListView();
    };

    return (

        <div>
            <PageHeader
                ghost={false}
                title={<p style={{ fontSize: '3em', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>Update Booking</p>}
                extra={[
                ]}
            >
                <Form
                    form={form}
                    autoComplete="off"
                    onFinish={handleSubmit}
                    layout="vertical"
                    style={{ width: '80%', marginLeft: '10%' }}
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row'
                    }}>
                        <Form.Item label="Student" required style={{ flex: 1, marginRight: '10px' }}>
                            <Autocomplete
                                id="asynchronous-search"
                                options={studentList}
                                size="small"
                                inputValue={student}
                                // closeIcon={<EditOutlined style={{ color: 'blue' }}/>}
                                onInputChange={(__, newInputValue) => {
                                    setStudent(newInputValue);
                                }}
                                onChange={(__, newValue) => {
                                    changeChildren(newValue.id);
                                }}
                                defaultValue={data.studentProfile}
                                open={open}
                                onOpen={() => {
                                    setOpen(true);
                                }}
                                onClose={() => {
                                    setOpen(false);
                                }}
                                loading={loadingS}
                                getOptionLabel={(record) => record.firstName + " " + record.lastName}
                                // style={{ minWidth: 450, marginLeft: -250 }}
                                renderInput={(params) =>
                                    <TextField {...params}
                                        variant="outlined"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {loadingS ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        }}
                                    />
                                }
                            />
                        </Form.Item>
                        <Form.Item label="Subject" required style={{ flex: 1, marginLeft: '10px' }}>
                            <Select onChange={(e) => changeSubject(e)} defaultValue={data.schedule.subject}>
                                <option value={null}>Select a subject</option>
                                {
                                    subjects.map(subject => {
                                        return (
                                            <option value={subject.subject} key={subject.id}>{subject.subject}</option>
                                        )
                                    })
                                }
                            </Select>
                        </Form.Item>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row'
                    }}>
                        <Form.Item label="Start date" required style={{ flex: 1, marginRight: '10px' }}>
                            <Select onChange={(e) => changeDate(e)} defaultValue={<Moment local format="D MMM YYYY HH:MM" withTitle>
                                {data.schedule.startDate}
                            </Moment>}>
                                <option value={null}>Select a start date</option>
                                {
                                    dates.map(date => {
                                        return (
                                            <option value={date.startDate} key={date.id}>
                                                <Moment local format="D MMM YYYY HH:MM" withTitle>
                                                    {date.startDate}
                                                </Moment>
                                            </option>
                                        )
                                    })
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item label="Teacher availability" required style={{ flex: 1, marginLeft: '10px' }}>
                            <Autocomplete
                                id="asynchronous-search"
                                options={list}
                                size="small"
                                inputValue={teacherName}
                                // closeIcon={<EditOutlined style={{ color: 'blue' }}/>}
                                onInputChange={(__, newInputValue) => {
                                    console.log(newInputValue)
                                    setTeacherName(newInputValue);
                                }}
                                defaultValue={data.teacherAvailability}
                                onChange={(__, newValue) => {
                                    setTeacherName(newValue.teacherProfile.firstName + " " + newValue.teacherProfile.lastName);
                                    if (newValue != null) {
                                        let teachers = list.filter(t => t.teacherProfile.firstName + " " + t.teacherProfile.lastName == newValue.teacherProfile.firstName + " " + newValue.teacherProfile.lastName);
                                        if (teachers.length === 0) {
                                            alert('This teacher is not found');
                                        } else {
                                            assigningStudents(teachers[0], data.id);
                                        }
                                    }
                                }}
                                open={open2}
                                onOpen={() => {
                                    setOpen2(true);
                                }}
                                onClose={() => {
                                    setOpen2(false);
                                }}
                                loading={loading}
                                getOptionLabel={(record) => record.teacherProfile.firstName + " " + record.teacherProfile.lastName}
                                // style={{ minWidth: 450, marginLeft: -250 }}
                                renderInput={(params) =>
                                    <TextField {...params}
                                        variant="outlined"
                                        onChange={(e) => changeTeacherSearch(e)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !open) {
                                                let teachers = list.filter(t => t.teacherProfile.firstName + " " + t.teacherProfile.lastName == teacherName);
                                                if (teachers.length === 0) {
                                                    alert('This teacher is not found');
                                                } else {
                                                    assigningStudents(teachers[0], data.id);
                                                }
                                            }
                                        }}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        }}
                                    />
                                }
                            />
                        </Form.Item>
                    </div>
                    <Form.Item>
                        <Button onClick={() => handleSubmit} disabled={submitting} type="primary" size="large" htmlType="submit">
                            {
                                submitting ? 'Loading...' : 'Update Student booking'
                            }
                        </Button>
                    </Form.Item>
                </Form>
            </PageHeader>
        </div>
    )
}
export default UpdateBooking
