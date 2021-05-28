import 'antd/dist/antd.css';
import { useHistory } from 'react-router-dom'
import { useLocation } from "react-router-dom";
import '../../Assets/container/StudentList.css'
import { PageHeader, Form, Input, Button, Select } from 'antd';
import React, { useEffect, useState, useReducer } from 'react'
import { updateAvailibility } from '../../services/Teacher';
import { getTeacherProfileByDate, getSchedule, getTags ,getTagByName} from '../../services/Student'
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import Moment from 'react-moment';

function CreateAvailibility() {

    const history = useHistory();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [open1, setOpen1] = useState(false);
    const [loadingS, setLoadingS] = useState(false);
    const [student, setStudent] = useState(null);
    const [studentList, setStudentList] = useState([]);
    const [tags, setTags] = useState([]);
    const [defaulttags, setDefaultTags] = useState([]);
    const [tagsList, setTagsList] = useState([]);
    const [children, setChildren] = useState(null);
    const [form] = Form.useForm();
    const [schedules, setSchedules] = useState([]);
    const [dates, setDates] = useState([]);
    const [ends, setEnds] = useState([]);
    const [dat, setDat] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [subjec, setSubjec] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [teacher, setTeacher] = useState(location.state.teacher);

    const [sortingName, setSortingName] = useState("name");
    const [sortingType, setSortingType] = useState("desc");

    const [listProps, setListProps] = useState({
        totalCount: 0,
        index: 0,
        size: 10,
    });

    useEffect(() => {
        setChildren(teacher.teacherProfile);
        setDat(teacher.schedule.startDate)
        setEndDate(teacher.schedule.endDate)
        if(teacher.tags){
            teacher.tags.map(tag=> defaulttags.push(tag.name))
        }
        getStudents();
        getSchedule(1).then(data => {
            setSchedules(data.content);
            setDates([...new Map(data.content.filter(s => teacher.teacherProfile.subjects.includes(s.subject)).map(item => [item['id'], item])).values()]);
        });
    }, []);

    const changeChildren = (id) => {
        setDates([]);
        let _children = studentList.filter(c => c.id == id)[0];
        setChildren(_children);
        getSchedule(1).then(data => {
            setSchedules(data.content);
            setDates([...new Map(data.content.filter(s => _children.subjects.includes(s.subject)).map(item => [item['id'], item])).values()]);
        });
    }

    const changeDate = (date) => {
        setDat(date);
        setEnds([...new Map(schedules.filter(s => children.subjects.includes(s.subject)).filter(s => s.startDate == date).map(item => [item['id'], item])).values()]);
    }

    const changeEndDate = (date) => {
        setEndDate(date);
    }

    const handleSubmit = () => {
        let s = schedules.filter(s => s.startDate == dat).filter(s => s.endDate == endDate)[0];
        if (s == null || children == null) {
            alert('Fill the form');
            return
        }

        setSubmitting(true);

        updateAvailibility(teacher.id, children, s).then(data => {
            history.push(`/teacherlist`)
        }).catch(err => {
            alert("Error occured when saving data, please retry!")
            console.log(err)
        })
            .finally(() => setSubmitting(false));
    }

    const getStudents = () => {
        setLoadingS(true);
        getTeacherProfileByDate(localStorage.getItem('toStart'), localStorage.getItem('toEnd'), 0, 100, 'firstName', 'asc').then(data => {
            if (data) {
                if (data.content) {
                    setStudentList(data.content);
                }
            }
        }).finally(() => setLoadingS(false))
    }

    const getEnabledTags = () => {
        setLoadingS(true);
        getTags(listProps.index, listProps.size, sortingName, sortingType).then(data => {
            if (data) {
                if (data.content) {
                    setTagsList(data.content.filter(t => t.enabled == true));
                }
            }
        }).finally(() => setLoadingS(false))
    }

    const handleChangeTags = (value) =>{
        setTags(value);
    }

    return (

        <div>
            <PageHeader
                ghost={false}
                title={<p style={{ fontSize: '3em', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>Update Availability</p>}
                extra={[
                ]}
            >
                <Form
                    form={form}
                    onFinish={handleSubmit}
                    autoComplete="off"
                    layout="vertical"
                    style={{ width: '80%', marginLeft: '10%' }}
                >

                    <Form.Item label="Teacher" required>
                        <Autocomplete
                            id="asynchronous-search"
                            options={studentList}
                            defaultValue={teacher.teacherProfile}
                            size="small"
                            inputValue={student}
                            // closeIcon={<EditOutlined style={{ color: 'blue' }}/>}
                            onInputChange={(__, newInputValue) => {
                                setStudent(newInputValue);
                            }}
                            onChange={(__, newValue) => {
                                changeChildren(newValue.id);
                            }}
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
                    
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row'
                    }}>
                        <Form.Item label="Start date" required style={{ flex: 1, marginRight: '10px' }}>
                            <Select onChange={(e) => changeDate(e)} defaultValue={<Moment local format="D MMM YYYY HH:MM" withTitle>
                                {teacher.schedule.startDate}
                            </Moment>}>
                                <Select.Option value={null}>Select a start date</Select.Option>
                                {
                                    dates.map(date => {
                                        return (
                                            <Select.Option value={date.startDate} key={date.id}>
                                                <Moment local format="D MMM YYYY HH:MM" withTitle>
                                                    {date.startDate}
                                                </Moment>
                                            </Select.Option>
                                        )
                                    })
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item label="End date" required style={{ flex: 1, marginLeft: '10px' }}>
                            <Select onChange={(e) => changeEndDate(e)} defaultValue={<Moment local format="D MMM YYYY HH:MM" withTitle>
                                {teacher.schedule.endDate}
                            </Moment>}>
                                <Select.Option value={null}>Select an end date</Select.Option>
                                {
                                    ends.map(date => {
                                        return (
                                            <Select.Option value={date.endDate} key={date.id}>
                                                <Moment local format="D MMM YYYY HH:MM" withTitle>
                                                    {date.endDate}
                                                </Moment>
                                            </Select.Option>
                                        )
                                    })
                                }
                            </Select>
                        </Form.Item>
                    </div>
                    <Form.Item>
                        <Button disabled={submitting || schedules.length <= 0} onClick={() => handleSubmit} type="primary" size="large" htmlType="submit">
                            {
                                submitting ? 'Loading...' : schedules.length <= 0 ? 'Fetching datas...' : 'Update Teacher Availability'
                            }
                        </Button>
                    </Form.Item>
                </Form>
            </PageHeader>
        </div>
    )
}
export default CreateAvailibility
