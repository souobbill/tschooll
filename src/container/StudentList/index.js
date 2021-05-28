import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Table, PageHeader, Button, Spin, Tooltip, Row, Form, Input, Typography } from 'antd';
import { useSelector, useDispatch } from 'react-redux'
import 'antd/dist/antd.css';
import '../../Assets/container/StudentList.css'
import { findStudentListByFirstNameAndLastName, getStudentListByDate, deleteStudentBooking, editSubject, assignStudentToAnotherTeacher, deleteBookings } from '../../services/Student'
import { findTeacherListByFirstNameAndLastName } from '../../services/Teacher'
import { sendMessageBookings } from '../../services/Student'
import SearchFilter from '../../components/StudentList/SearchFilter'
import { assignStudents } from '../../Action-Reducer/Student/action'
import Moment from 'react-moment';
import { VerticalAlignBottomOutlined, VerticalAlignTopOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons"
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
    VideoCameraOutlined,
    ApiOutlined,
    EditOutlined
} from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import {MessageOutlined} from '@ant-design/icons'

const { Text } = Typography;

function StudentList() {
    const dispatch = useDispatch();
    const history = useHistory();
    const [studentList, setStudentList] = useState();
    const [loadingTeacher, setLoadingTeacher] = useState(false);
    const [teacherList, setTeacherList] = useState([]);
    const [open, setOpen] = useState(false);
    const [sortingName, setSortingName] = useState("createDate");
    const [teacherName, setTeacherName] = useState("");
    const [sortingType, setSortingType] = useState("desc");
    const [mess_id, setMess_id] = useState("s1");
    const deletingStatus = useSelector((state) => {
        return state.Student.enableDeleting;
    })
    const [tableProps, setTableProps] = useState({
        totalCount: 0,
        pageIndex: 0,
        pageSize: 30,
    });
    const [search, setSearch] = useState({
        name: "",
        firstName: "",
        lastName: "",
    })

    const [teacherSearch, setTeacherSearch] = useState({
        name: "",
        firstName: "",
        lastName: "",
    })

    const [selectedRow, setSelectedRow] = useState([]);
    const [editableRow, setEditableRow] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editTeacher, setEditTeacher] = useState([]);

    const rowSelection = {
        selectedRow,
        onChange: (selectedrow, records) => {
            console.log('selectedRowKeys changed: ', records);
            var recordIdArray = [];
            records.map(record => {
                recordIdArray.push({ id: record.id, firstName: record.studentProfile.firstName, lastName: record.studentProfile.lastName })
            })
            setSelectedRow(recordIdArray);
            dispatch(assignStudents(recordIdArray))
        }
    };


    const deleteRows = () => {
        let ids = [];
        selectedRow.forEach(r => ids.push(r.id));
        console.log(ids.join(','));
        deleteBookings(ids.join(',')).then(data => {
            getListView();
            setSelectedRow([]);
        })
    }

    const columns = [
        {
            title: <div><span>Name </span>
                {sortingName === "firstName" && sortingType === "asc" && <VerticalAlignBottomOutlined />}
                {sortingName === "firstName" && sortingType === "desc" && <VerticalAlignTopOutlined />}
                {sortingName === "firstName" && sortingType === "" && ""}
            </div>,
            onHeaderCell: (column) => {
                return {
                    onClick: () => {
                        setSortingName("firstName");
                        if (sortingType == "") { setSortingType("asc") }
                        else if (sortingType == "asc") { setSortingType("desc") }
                        else if (sortingType == "desc") { setSortingType("asc"); setSortingName("firstName"); }
                    }
                };
            },
            render: (record) =>
                <div
                    style={{ display: "flex", flexDirection: 'row', alignItems: "center" }}
                >
                    <Tooltip title={record.studentProfile.lastSeenRoom != null ? record.studentProfile.lastSeenRoom : "No last seen room"}>
                        <FontAwesomeIcon icon={faCircle} color="green" style={{ display: record.studentProfile.onlineStatus == 0 ? "block" : "none" }} />
                        <FontAwesomeIcon icon={faCircle} color="orange" style={{ display: record.studentProfile.onlineStatus == 1 ? "block" : "none" }} />
                        <FontAwesomeIcon icon={faCircle} color="red" style={{ display: record.studentProfile.onlineStatus == 2 ? "block" : "none" }} />
                    </Tooltip>
                    <Tooltip title={(record.studentProfile.firstName + " " + record.studentProfile.lastName)}>
                        <Button
                            style={{ backgroundColor: "transparent", border: "0px", cursor: 'pointer', width: "60%" }}
                            onClick={(e) => {
                                e.stopPropagation();
                                history.push(`/studentlist/studentDetail/${record.id}`, { student: record })
                                // history.push(`/studentlist/studentDetail/${record.id}`)
                            }}>
                            <p style={{ width: "50%", textAlign: "left" }}>
                                {(record.studentProfile.firstName + " " + record.studentProfile.lastName).length <= 20 ?
                                    record.studentProfile.firstName + " " + record.studentProfile.lastName :
                                    (record.studentProfile.firstName + " " + record.studentProfile.lastName).substring(0, 19) + '...'}
                            </p>
                        </Button>
                    </Tooltip>
                </div>,
            key: 'name',
            fixed: 'left',
        }, {
            title: <div>Parent Email</div>,
            render: (record) => {
                return (
                    <span>{record.studentProfile.parent.email}</span>
                )
            },
            key: 'parentEmail',
        }, {
            title: <div><span>Start Date </span>
                {sortingName === "startDate" && sortingType === "asc" && <VerticalAlignBottomOutlined />}
                {sortingName === "startDate" && sortingType === "desc" && <VerticalAlignTopOutlined />}
                {sortingName === "startDate" && sortingType === "" && ""}
            </div>,
            onHeaderCell: (column) => {
                return {
                    onClick: () => {
                        setSortingName("startDate");
                        if (sortingType == "") { setSortingType("asc") }
                        else if (sortingType == "asc") { setSortingType("desc") }
                        else if (sortingType == "desc") { setSortingType("asc"); setSortingName("startDate"); }
                    }
                };
            },
            render: (record) => (
                <div>
                    {
                        <Moment local format="D MMM YYYY HH:MM" withTitle>
                            {record.schedule.startDate}
                        </Moment>
                    }
                </div>
            ),
            key: 'startDate',
        },
        {
            title: <div><span>Subject </span>
                {sortingName === "subject" && sortingType === "asc" && <VerticalAlignBottomOutlined />}
                {sortingName === "subject" && sortingType === "desc" && <VerticalAlignTopOutlined />}
                {sortingName === "subject" && sortingType === "" && ""}
            </div>,
            onHeaderCell: (column) => {
                return {
                    onClick: () => {
                        setSortingName("subject");
                        if (sortingType == "") { setSortingType("asc") }
                        else if (sortingType == "asc") { setSortingType("desc") }
                        else if (sortingType == "desc") { setSortingType("asc"); setSortingName("subject"); }
                    }
                };
            },
            render: (record) => {
                return (
                    <div onDoubleClick={() => {
                        if (!editableRow.includes(record)) {
                            setEditableRow([...editableRow, record]);
                        } else {
                            setEditableRow(editableRow.filter(r => r.id !== record.id));
                        }
                    }}>
                        {!editableRow.includes(record) ? record.schedule.subject : <Form layout="inline">
                            <Form.Item>
                                <Input
                                    type="text"
                                    placeholder="Subject"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            editSubject(record.id, e.target.value).then(data => {
                                                setEditableRow(editableRow.filter(r => r.id !== record.id));
                                                getListView();
                                            })
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Form>}
                    </div>
                )
            },
            key: 'subject',
        }
        ,
        {
            title: <div><span>Grade </span>
                {sortingName === "grade" && sortingType === "asc" && <VerticalAlignBottomOutlined />}
                {sortingName === "grade" && sortingType === "desc" && <VerticalAlignTopOutlined />}
                {sortingName === "grade" && sortingType === "" && ""}
            </div>,
            onHeaderCell: (column) => {
                return {
                    onClick: () => {
                        setSortingName("grade");
                        if (sortingType == "") { setSortingType("asc") }
                        else if (sortingType == "asc") { setSortingType("desc") }
                        else if (sortingType == "desc") { setSortingType("asc"); setSortingName("grade"); }
                    }
                };
            },
            render: (record) => {
                var min = record.teacherAvailability ? record.teacherAvailability.teacherProfile ? record.teacherAvailability.teacherProfile.grades[0] : 0 : 0;
                return (
                    <span>{computeMinGrade(min, record.teacherAvailability ? record.teacherAvailability.teacherProfile : null, record.studentProfile.grade) > 0 ? `${record.studentProfile.grade} (${computeMinGrade(min, record.teacherAvailability ? record.teacherAvailability.teacherProfile : null, record.studentProfile.grade)})` : record.studentProfile.grade}</span>
                )
            },
            key: 'grade',
        },
        {
            title: <div><span>Tags </span></div>,
            key: 'tags',
            render: (record) => {

                let tags= []
                if(record.tags){
                    record.tags.map(tag => tags.push(tag.name))
                }

                return(
                    <div>
                        {
                            !record.tags ?
                            (<Text strong></Text>)
                                :
                            (
                            <Tooltip title={(tags.join(', '))}>
                                {(tags.join(', ')).length <= 20 ?
                                    (tags.join(', ')) :
                                    (tags.join(', ')).substring(0, 19) + '...'}
                            </Tooltip>
                            )
                        }
                        
                    </div>
                )
                
            }
        },
        ,
        {
            title: 'Teacher Name',
            title: <div><span>Teacher </span>
            </div>,
            render: (record) => {
                var isSubjectContains = record.teacherAvailability ? record.teacherAvailability.teacherProfile ? record.teacherAvailability.teacherProfile.subjects.includes(record.subject) : false : false;
                const text = <div className="grade-coloumn-tooltip">
                    <h4>Details :</h4>
                    <Row>Subjects : {record.teacherAvailability ? record.teacherAvailability.teacherProfile ? record.teacherAvailability.teacherProfile.subjects.join(', ') : "Nothing" : "Nothing"}</Row>
                    <Row>Grades : {record.teacherAvailability ? record.teacherAvailability.teacherProfile ? record.teacherAvailability.teacherProfile.grades.join(', ') : "Nothing" : "Nothing"}</Row>
                </div>
                return (
                    !editTeacher.includes(record) ?
                        <span>
                            <Tooltip placement="topLeft" title={text} color={"white"}>
                                <p onClick={(e) => {
                                    //e.stopPropagation();
                                    if (record.teacherAvailability)
                                        if (record.teacherAvailability.teacherProfile)
                                            history.push(`/studentlist/teacher/${record.teacherAvailability.id}`, { teacher: record.teacherAvailability })
                                }} style={{ cursor: 'pointer', color: isSubjectContains ? 'black' : 'orange' }}>
                                    {record.teacherAvailability ? record.teacherAvailability.teacherProfile ? record.teacherAvailability.teacherProfile.firstName + " " + record.teacherAvailability.teacherProfile.lastName + " (" + record.teacherAvailability.studentCount + ")" : "No teacher" : "No teacher"}
                                </p>
                            </Tooltip>
                        </span> : null
                )
            },
            key: 'studentCount',
        },
        {
            title: 'Action',
            key: 'operation',
            render: (record) =>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {
                        !editTeacher.includes(record) ?
                            <Tooltip title={record.studentProfile ? record.studentProfile.conferenceUrl ? record.studentProfile.conferenceUrl : "Link Not Found" : "Student Not Found"}>
                                <Button
                                    style={{ backgroundColor: "transparent", border: "0px", color: "#1890FF" }}
                                    onClick={(e) => {
                                        //e.stopPropagation();
                                        if (record.studentProfile)
                                            if (record.studentProfile.conferenceUrl)
                                                window.open(record.studentProfile.conferenceUrl.includes('http') ? record.studentProfile.conferenceUrl : 'http://' + record.studentProfile.conferenceUrl)
                                    }}><VideoCameraOutlined style={{ fontSize: 20 }} /></Button>
                            </Tooltip> :
                            <Autocomplete
                                id="asynchronous-search"
                                options={teacherList}
                                size="small"
                                inputValue={teacherName}
                                // closeIcon={<EditOutlined style={{ color: 'blue' }}/>}
                                onInputChange={(__, newInputValue) => {
                                    setTeacherName(newInputValue);
                                    console.log(newInputValue)
                                }}
                                onChange={(__, newValue) => {
                                    if (newValue != null)
                                        setTeacherName(newValue.teacherProfile.firstName + " " + newValue.teacherProfile.lastName);
                                }}
                                open={open}
                                onOpen={() => {
                                    setOpen(true);
                                }}
                                onClose={() => {
                                    setOpen(false);
                                }}
                                loading={loadingTeacher}
                                getOptionLabel={(record) => record.teacherProfile.firstName + " " + record.teacherProfile.lastName}
                                style={{ minWidth: 450, marginLeft: -250 }}
                                renderInput={(params) =>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <TextField {...params}
                                            label="Select a teacher to assign"
                                            variant="outlined"
                                            onChange={(e) => changeTeacherSearch(e)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !open) {
                                                    let teachers = teacherList.filter(t => t.teacherProfile.firstName + " " + t.teacherProfile.lastName == teacherName);
                                                    if (teachers.length === 0) {
                                                        alert('This teacher is not found');
                                                    } else {
                                                        assigningStudents(teachers[0], record.id);
                                                    }
                                                }
                                            }}
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <React.Fragment>
                                                        {loadingTeacher ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </React.Fragment>
                                                ),
                                            }}
                                        />
                                    </div>

                                }
                            />
                    }
                    {
                        !editTeacher.includes(record) ?
                            null : null
                            // <div id="edit" onClick={(e) => { setEditTeacher([record]) }}><ApiOutlined id="editIcon" style={{ fontSize: 20, color: '#1890FF' }} /></div> : null
                    }
                    
                    <div id="edit" onClick={(e) => { e.stopPropagation(); history.push(`/studentlist/${record.id}/update`, { student: record }) }}><EditOutlined id="editIcon" style={{ fontSize: 20, marginLeft: 10, color: '#1890FF' }} /></div>

                </div>,
        },
    ];

    useEffect(() => {
        getListView();
        const interval = setInterval(() => {
            getListView();
        }, 15000);
        return () => clearInterval(interval);
    }, [tableProps.pageIndex, search, sortingType, sortingName]);

    const computeLastName = (name) => {
        let lastName = '';
        for (let index = 1; index < name.length; index++) {
            lastName = lastName.trim() + ' ' + name[index].trim();
        }
        return lastName
    }

    const getTeacherListView = () => {
        setLoadingTeacher(true);
        findTeacherListByFirstNameAndLastName(teacherSearch.firstName.trim(), localStorage.getItem('toStart'), localStorage.getItem('toEnd'), 0, 500, null, sortingName, sortingType).then(data => {
            if (data) {
                if (data.content) {
                    setTeacherList(data.content)
                } else {
                    setTeacherList([])
                }
            } else {
                setTeacherList([])
            }
        }).finally(() => setLoadingTeacher(false));
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

    const computeMinGrade = (min, profile, grade) => {
        let i = 0;
        let result = min;
        if (profile == null) {
            return 0;
        }

        for (i = 0; i < profile.grades.length; i++) {
            let gradeindex = Number(profile.grades[i]) - Number(grade.toString());
            gradeindex = Math.abs(gradeindex);
            if (gradeindex >= 0 && gradeindex < result) {
                result = gradeindex;
            }
        }
        return result < min ? result : min;
    }

    const deleteBooking = (selectedrow) => {
        if (selectedrow.length > 0) {
            let ids = selectedrow.reduce((a, b) => {
                return a + ',' + b.id;
            }, '')
            deleteStudentBooking(ids.substring(1)).then(data => {
                console.log(data);
                setSelectedRow([]);
                getListView();
            });
        } else {
            alert('Select at least one student');
        }
    }

    const getListView = () => {
        if (search.firstName === "" && search.lastName === "" && (localStorage.getItem('currentTag') === "no tag" || localStorage.getItem('currentTag') === "")) {
            getStudentListByDate(localStorage.getItem('toStart'), localStorage.getItem('toEnd'), tableProps.pageIndex, tableProps.pageSize, sortingName, sortingType).then(data => {
                if (data) {
                    if (data.content) {
                        setStudentList(data.content)
                        setTableProps({
                            ...tableProps,
                            totalCount: data.totalCount,
                            pageSize: 30,
                        });
                    } else {
                        setStudentList([])
                        setTableProps({
                            ...tableProps,
                            totalCount: 0,
                            pageSize: 30,
                        });
                    }
                } else {
                    setStudentList([])
                    setTableProps({
                        ...tableProps,
                        totalCount: 0,
                        pageSize: 30,
                    });
                }
                setLoading(false);
            })
        }
        else if (search.firstName !== "" && search.lastName !== "" && localStorage.getItem('currentTag') === "no tag") {
            findStudentListByFirstNameAndLastName(search.firstName.trim(), localStorage.getItem('toStart'), localStorage.getItem('toEnd'), tableProps.pageIndex, tableProps.pageSize, null, sortingName, sortingType).then(data => {
                if (data) {
                    if (data.content) {
                        setStudentList(data.content)
                        setTableProps({
                            ...tableProps,
                            totalCount: data.totalCount,
                            pageSize: 30,
                        });
                    } else {
                        setStudentList([])
                        setTableProps({
                            ...tableProps,
                            totalCount: 0,
                            pageSize: 30,
                        });
                    }
                } else {
                    setStudentList([])
                    setTableProps({
                        ...tableProps,
                        totalCount: 0,
                        pageSize: 30,
                    });
                }
                setLoading(false);
            })
        } else{
            findStudentListByFirstNameAndLastName(search.firstName.trim(), localStorage.getItem('toStart'), localStorage.getItem('toEnd'), tableProps.pageIndex, tableProps.pageSize, localStorage.getItem('currentTag'), sortingName, sortingType).then(data => {
                if (data) {
                    if (data.content) {
                        setStudentList(data.content)
                        setTableProps({
                            ...tableProps,
                            totalCount: data.totalCount,
                            pageSize: 30,
                        });
                    } else {
                        setStudentList([])
                        setTableProps({
                            ...tableProps,
                            totalCount: 0,
                            pageSize: 30,
                        });
                    }
                } else {
                    setStudentList([])
                    setTableProps({
                        ...tableProps,
                        totalCount: 0,
                        pageSize: 30,
                    });
                }
                setLoading(false);
            })
        }
    }
    const changeSearch = (e) => {
        const { name, value } = e.target;
        setSearch({ ...search, [name]: value });
        if (e.target.name === "name") {
            var nameData = value.split(" ");
            if (nameData.length > 1) {
                setSearch({ ...search, firstName: nameData[0].trim(), lastName: computeLastName(nameData) });
            }
            else {
                setSearch({ ...search, firstName: nameData[0].trim(), lastName: nameData[0].trim() });
            }
        }
    };
    const searchList = () => {
        getListView();
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setTableProps({
            ...tableProps,
            pageIndex: pagination.current - 1,
            pageSize: pagination.pageSize,
        });
        setLoading(true);
        setStudentList([]);
    };

    const assigningStudents = (teacher, studentId) => {
        assignStudentToAnotherTeacher(teacher.id, studentId)
            .then(res => {
                getListView();
            }).finally(() => {
                setEditTeacher([]);
            })
    }

    const sendMessage = (messId) => {
        sendMessageBookings(messId).then(res => {
            console.log(res);
        })
    }

    return (

        <div onClick={(e) => {
            console.log(e.target.viewBox)
            if (e.target.viewBox != undefined) {
                if (editTeacher.length > 0) {
                }
            } else if (!e.target.id.includes('asynchronous-search') && editTeacher.length > 0) {
                setEditTeacher([]);
            }
        }}>
            <PageHeader
                ghost={false}
                title={<p style={{ fontSize: '3em', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>Student Bookings</p>}
                extra={[
                ]}
            >
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ display: 'flex', flex: 1 }}>
                        <SearchFilter
                            changeInput={changeSearch}
                            searchList={searchList}
                        />
                        {/* <Button style={{ display: deletingStatus ? 'block' : 'none' }} onClick={() => deleteBooking(selectedRow)}> Supprimer </Button> */}
                    </div>

                    <div style={{ display: deletingStatus ? 'flex' : 'none', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <Button key='3' size="medium" type="danger" onClick={() => deleteRows()}>
                            <DeleteOutlined />
                        </Button>
                    </div>
                    {
                        (selectedRow.length == 0) ? 
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', marginLeft: '20px' }}>
                                <Button key='3' size="medium" type="primary" onClick={() => history.push("/studentlist/add")}>
                                    <PlusOutlined />
                                </Button>
                            </div> 
                            : 
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', marginLeft: '20px' }}>
                                <Button key='3' size="medium" type="primary" onClick={() => sendMessage(mess_id)}>
                                    <MessageOutlined />
                                </Button>
                            </div>
                    }
                </div>

                {!studentList ? <Spin className="loading-table" /> :
                    <Table
                        className="table-padding"
                        columns={columns}
                        loading={loading}
                        dataSource={studentList}
                        onChange={handleTableChange}
                        pagination={{
                            total: tableProps.totalCount,
                            pageSize: tableProps.pageSize,
                            showTotal: (total, range) => `${range[0]}-${range[1]} out of ${total}`,
                        }}
                        rowSelection={rowSelection}
                        rowKey="id"
                    // onRow={(record) => ({
                    //     onClick: () => (history.push(`/studentlist/studentDetail/${record.id}`))
                    // })}
                    />}

            </PageHeader>
        </div>
    )
}
export default StudentList
