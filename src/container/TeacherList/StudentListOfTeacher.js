import 'antd/dist/antd.css';
import Moment from 'react-moment';
import SearchFilter from './SearchFilter';
import { useHistory } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { Form, Row, Col, Card, Input } from 'antd';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getStudentListById } from '../../services/Student';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { assignStudents } from '../../Action-Reducer/Student/action';
import { Table, PageHeader, Button, Spin, Tooltip, Typography } from 'antd';
import { faCrown, faShieldAlt, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { markTeacherAsPresent, markAsSupervisor, markAsAdmin, markAsApproved, updateAvailabilityAssistants } from '../../services/Teacher';
import { assignStudentToAnotherTeacher, assignMeetingToAnotherTeacher, findTeacherProfileByFirstNameAndLastName } from '../../services/Student';

const { Text } = Typography;

function StudentListOfTeacher(props) {

    const dispatch = useDispatch();
    const location = useLocation();
    const [teacher, setTeacher] = useState(location.state.teacher);
    const [profile, setProfile] = useState(location.state.profile);
    const { params } = props.match;
    const [studentList, setStudentList] = useState();
    const [confUrl, setConfUrl] = useState();
    const [editable, setEditable] = useState(false);
    const [isAddingAssistants, setIsAddingAssistants] = useState(false);
    const [assistants, setAssistants] = useState([]);
    const [students, setStudents] = useState();
    const [studentsTmp, setStudentsTmp] = useState([]);
    const history = useHistory();
    const [active, setActive] = useState(true);
    const [open, setOpen] = useState(false);
    const [present, setPresent] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true)
    const [startDate, setStartDate] = useState('');
    const [effectiveStartDate, setEffectiveStartDate] = useState('');
    const [selectedRow, setSelectedRow] = useState([]);
    const [selectedRowProfile, setSelectedRowProfile] = useState([]);
    const assignStudentList = useSelector((state) => {
        return state.Student.assignStudent;
    })
    const [teacherList, setTeacherList] = useState([]);
    const [sortingName, setSortingName] = useState("createDate");
    const [sortingType, setSortingType] = useState("desc");
    const [loading, setLoading] = useState(false);
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


    const getRole = (role) => {
        let result = false;
        if (teacher.tenants) {
            teacher.tenants.forEach(t => {
                if (t.roles) {
                    if (t.roles.includes(role)) {
                        result = true;
                    }
                }
            })
        }
        return result;
    }

    const computeLastName = (name) => {
        let lastName = '';
        for (let index = 1; index < name.length; index++) {
            lastName = lastName.trim() + ' ' + name[index].trim();
        }
        return lastName
    }

    const updateAssistants = (datas, adding) => {
        let newAssistants = assistants;
        if (adding) {
            newAssistants = [...newAssistants, ...datas];
        } else {
            newAssistants = newAssistants.filter(a => !datas.includes(a));
        }
        updateAvailabilityAssistants(teacher.id, newAssistants.map(a => (a.id))).then(data => {
            setAssistants([...newAssistants]);
            setIsAddingAssistants(false);
        }).catch(err => {
            console.log(err)
        })
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

    useEffect(() => {
        console.log(search)
        searchList()
    }, [search])

    const searchList = () => {
        getListProfiles();
    }

    const getListProfiles = () => {
        findTeacherProfileByFirstNameAndLastName(search.firstName.trim(), null, null, tableProps.pageIndex, tableProps.pageSize, null, sortingName, sortingType).then(data => {
            if (data) {
                if (data.content) {
                    setTeacherList(data.content)
                    setTableProps({
                        ...tableProps,
                        totalCount: data.totalCount,
                        pageSize: 30,
                    });
                } else {
                    setTeacherList([])
                    setTableProps({
                        ...tableProps,
                        totalCount: 0,
                        pageSize: 30,
                    });
                }
            } else {
                setTeacherList([])
                setTableProps({
                    ...tableProps,
                    totalCount: 0,
                    pageSize: 30,
                });
            }
            setLoading(false);
            setProfileLoading(false);
        })
    }

    const removeAssistant = (data) => {
        updateAssistants([data], false);
    }

    const getApproved = () => {
        let result = false;
        if (teacher.tenants)
            teacher.tenants.forEach(t => {
                if (t.tenant) {
                    if (t.approveDate)
                        if (t.approveDate != null)
                            result = true;
                }
            })
        return result;
    }


    const [supervisor, setSupervisor] = useState(getRole('supervisor'));
    const [admin, setAdmin] = useState(getRole('admin'));
    const [approved, setApproved] = useState(getApproved());
    const assigningStatus = useSelector((state) => {
        return state.Student.enableAssigning;
    })

    const rowSelection = {
        selectedRow,
        onChange: (selectedrow, records) => {
            var recordIdArray = [];
            setActive(false);
            records.map(record => {
                recordIdArray.push({ id: record.id, firstName: record.firstName, lastName: record.lastName })
            })
            setSelectedRow(recordIdArray);
            dispatch(assignStudents(recordIdArray))
        }
    };

    useEffect(() => {
        setAssistants(teacher.assistants ? teacher.assistants : []);
        let sd = teacher.createDate;
        let date = (new Date(sd)).toLocaleDateString();

        setStartDate(date);

        setPresent(teacher.effectiveStartDate ? false : true);
        //setEffectiveStartDate(teacher.effectiveStartDate);
        setEffectiveStartDate(date);
        getListView();
        getListProfiles();
    }, []);

    const rowSelectionProfile = {
        selectedRowProfile,
        onChange: (__, records) => {
            var recordIdArray = [];
            records.map(record => {
                recordIdArray.push(record)
            })
            setSelectedRowProfile(recordIdArray);
        }
    };


    const columns = [
        {
            title: <div><span>Name </span>
            </div>,
            render: (record) =>
                <div
                    style={{ display: "flex", flexDirection: 'row', alignItems: "center" }}
                >
                    <Tooltip title={record.lastSeenRoom != null ? record.lastSeenRoom : "No last seen room"}>
                        <FontAwesomeIcon icon={faCircle} color="green" style={{ display: record.onlineStatus == 0 ? "block" : "none" }} />
                        <FontAwesomeIcon icon={faCircle} color="orange" style={{ display: record.onlineStatus == 1 ? "block" : "none" }} />
                        <FontAwesomeIcon icon={faCircle} color="red" style={{ display: record.onlineStatus == 2 ? "block" : "none" }} />
                    </Tooltip>
                    <Tooltip title={(record.firstName + " " + record.lastName)}>
                        <Button
                            style={{ backgroundColor: "transparent", border: "0px", cursor: 'pointer', width: "60%" }}
                            onClick={(e) => {
                                e.stopPropagation();
                                history.push(`/studentprofiles/${record.id}/details`, { student: record })
                                // history.push(`/studentlist/studentDetail/${record.id}`)
                            }}>
                            <p style={{ width: "50%", textAlign: "left" }}>
                                {(record.firstName + " " + record.lastName).length <= 20 ?
                                    record.firstName + " " + record.lastName :
                                    (record.firstName + " " + record.lastName).substring(0, 19) + '...'}
                            </p>
                        </Button>
                    </Tooltip>
                </div>,
            key: 'name',
            fixed: 'left',
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
        }
    ];

    const assistantColumns = [
        {
            title: <div><span>Name </span>
            </div>,
            render: (record) =>
                <div
                    style={{ display: "flex", flexDirection: 'row', alignItems: "center" }}
                >
                    <Tooltip title={record.lastSeenRoom != null ? record.lastSeenRoom : "No last seen room"}>
                        <FontAwesomeIcon icon={faCircle} color="green" style={{ display: record.onlineStatus == 0 ? "block" : "none" }} />
                        <FontAwesomeIcon icon={faCircle} color="orange" style={{ display: record.onlineStatus == 1 ? "block" : "none" }} />
                        <FontAwesomeIcon icon={faCircle} color="red" style={{ display: record.onlineStatus == 2 ? "block" : "none" }} />
                    </Tooltip>
                    <Tooltip title={(record.firstName + " " + record.lastName)}>
                        <Button
                            style={{ backgroundColor: "transparent", border: "0px", cursor: 'pointer', width: "60%" }}
                            onClick={(e) => {
                                e.stopPropagation();
                                record.teacherProfile = record;
                                history.push(`/studentlist/teacher/${record.id}`, { teacher: record })
                                // history.push(`/studentlist/studentDetail/${record.id}`)
                            }}>
                            <p style={{ width: "50%", textAlign: "left" }}>
                                {(record.firstName + " " + record.lastName).length <= 20 ?
                                    record.firstName + " " + record.lastName :
                                    (record.firstName + " " + record.lastName).substring(0, 19) + '...'}
                            </p>
                        </Button>
                    </Tooltip>
                </div>,
            key: 'name',
            fixed: 'left',
        },
        {
            title: <div><span>Create Date </span>
            </div>,
            render: (record) => (
                <div>
                    {
                        <Moment local format="D MMM YYYY HH:MM" withTitle>
                            {record.createDate}
                        </Moment>
                    }
                </div>
            ),
            key: 'createDate',
        },
        {
            title: <div><span>Email </span>
            </div>,
            render: (record) => {
                return (
                    <div>
                        {record.internalEmail ? record.internalEmail : record.externalEmail}
                    </div>
                )
            },
            key: 'internalEmail',
        }
        ,
        {
            title: <div><span>Phone </span>
            </div>,
            render: (record) => {
                return (
                    <span>{record.phoneNumber}</span>
                )
            },
            key: 'phoneNumber',
        },
        {
            title: <div><span>Action </span>
            </div>,
            render: (record) => {
                return (
                    <div id="edit" onClick={() => { removeAssistant(record) }}><DeleteOutlined id="editIcon" style={{ fontSize: 20, marginLeft: 10, color: '#ff1918' }} /></div>
                )
            },
            key: 'action',
        }

    ];

    const profileColumns = [
        {
            title: <div><span>Name </span>
            </div>,
            render: (record) =>
                <div
                    style={{ display: "flex", flexDirection: 'row', alignItems: "center" }}
                >
                    <Tooltip title={record.lastSeenRoom != null ? record.lastSeenRoom : "No last seen room"}>
                        <FontAwesomeIcon icon={faCircle} color="green" style={{ display: record.onlineStatus == 0 ? "block" : "none" }} />
                        <FontAwesomeIcon icon={faCircle} color="orange" style={{ display: record.onlineStatus == 1 ? "block" : "none" }} />
                        <FontAwesomeIcon icon={faCircle} color="red" style={{ display: record.onlineStatus == 2 ? "block" : "none" }} />
                    </Tooltip>
                    <Tooltip title={(record.firstName + " " + record.lastName)}>
                        <Button
                            style={{ backgroundColor: "transparent", border: "0px", cursor: 'pointer', width: "60%" }}
                            onClick={(e) => {
                                e.stopPropagation();
                                record.teacherProfile = record;
                                history.push(`/studentlist/teacher/${record.id}`, { teacher: record })
                            }}>
                            <p style={{ width: "50%", textAlign: "left" }}>
                                {(record.firstName + " " + record.lastName).length <= 20 ?
                                    record.firstName + " " + record.lastName :
                                    (record.firstName + " " + record.lastName).substring(0, 19) + '...'}
                            </p>
                        </Button>
                    </Tooltip>
                </div>,
            key: 'name',
            fixed: 'left',
        },
        {
            title: <div><span>Create Date </span>
            </div>,
            render: (record) => (
                <div>
                    {
                        <Moment local format="D MMM YYYY HH:MM" withTitle>
                            {record.createDate}
                        </Moment>
                    }
                </div>
            ),
            key: 'createDate',
        },
        {
            title: <div><span>Email </span>
            </div>,
            render: (record) => {
                return (
                    <div>
                        {record.internalEmail ? record.internalEmail : record.externalEmail}
                    </div>
                )
            },
            key: 'internalEmail',
        }
        ,
        {
            title: <div><span>Phone </span>
            </div>,
            render: (record) => {
                return (
                    <span>{record.phoneNumber}</span>
                )
            },
            key: 'phoneNumber',
        }

    ];

    const getListView = () => {
        setStudents(null);
        setStudentList(null);
        setStudentsTmp([])
        getStudentListById(params.id).then(data => {
            if (data) {
                setStudentList(data.content);
                data.content.forEach(student => {
                    let datas = studentsTmp;
                    let elt = new Object();
                    elt.studentProfile = new Object();
                    elt.studentProfile.firstName = student.studentProfile.firstName;
                    elt.studentProfile.grade = student.studentProfile.grade;
                    elt.studentProfile.lastName = student.studentProfile.lastName;
                    // elt.studentProfile.subject = student.subject;
                    elt.studentProfile.id = student.studentProfile.id;
                    elt.studentProfile.onlineStatus = student.studentProfile.onlineStatus;
                    elt.studentProfile.studentProfile = student.studentProfile
                    datas.push(elt.studentProfile);
                    setStudentsTmp(datas);
                });
                setConfUrl(location.state.teacher.teacherProfile.conferenceUrl);
                setStudents(studentsTmp);
            } else {
                setStudents([]);
                setStudentList([]);
                setStudentsTmp([])
            }
        })
    }

    const assignStudent = () => {
        if (active) {
            let studentIdArray = [];
            assignStudentList.map((student) => {
                studentIdArray.push(student.id)
            })
            let studentIds = studentIdArray.join(',');
            assignStudentToAnotherTeacher(params.id, studentIds)
                .then(res => {
                    setStudentList(null);
                    dispatch(assignStudents([]));
                    getListView();
                    //window.location.reload();
                })
        } else {
            dispatch(assignStudents(selectedRow))
            //history.push('/teacherlist');
        }
    };

    const setConferenceUrl = (url) => {
        setConfUrl(url.target.value);
        if (url.target.value.length > 0)
            assignMeetingToAnotherTeacher(teacher.id, url.target.value);
    }

    const markAsPresent = () => {

        markTeacherAsPresent(teacher.id, teacher.effectiveStartDate ? false : true).then(data => {
            if (teacher.effectiveStartDate) {
                delete teacher.effectiveStartDate;
                setTeacher(teacher);
                setEffectiveStartDate('');
            } else {
                let esd = teacher.effectiveStartDate;
                let date1 = (new Date(esd)).toLocaleDateString();
                let sTime1 = ((new Date(esd)).toLocaleTimeString()).split(':');

                //teacher.effectiveStartDate = new Date();
                setTeacher(teacher);
                setEffectiveStartDate(date1 + ' ' + sTime1);
            }
            setPresent(teacher.effectiveStartDate ? false : true);
            //history.push('/teacherlist');
        });
    }

    const markTeacherAsAdmin = () => {
        markAsAdmin(teacher.teacherProfile.id, !admin).then(data => {
            setAdmin(!admin);
        });
    }

    const markTeacherAsSupervisor = () => {
        markAsSupervisor(teacher.teacherProfile.id, !supervisor).then(data => {
            setSupervisor(!supervisor);
        });
    }

    const markTeacherAsApproved = () => {
        markAsApproved(teacher.teacherProfile.id, !approved).then(data => {
            setApproved(!approved);
        });
    }

    return (
        <div>
            {/* {console.log(params)}
            students history.... {params.id} */}
            <PageHeader
                ghost={false}
                title={
                    <div style={{ display: "flex", flexDirection: 'row', alignItems: "center", justifyContent: "center" }}>
                        <p style={{ fontSize: '3em', textAlign: 'center', margin: '20px', marginBottom: '20px' }}>{`${teacher.teacherProfile.firstName} ${teacher.teacherProfile.lastName}`}</p>
                        <Tooltip title={admin ? "Administrator" : "Not An Administrator"}>
                            <FontAwesomeIcon onClick={() => markTeacherAsAdmin()} icon={faCrown} color={admin ? "gold" : "gray"} size={"2x"} style={{ marginLeft: 20 }} />
                        </Tooltip>
                        <Tooltip title={supervisor ? "Supervisor" : "Not A Supervisor"}>
                            <FontAwesomeIcon onClick={() => markTeacherAsSupervisor()} icon={faShieldAlt} color={supervisor ? "blue" : "gray"} size={"2x"} style={{ marginLeft: 20 }} />
                        </Tooltip>
                        <Tooltip title={approved ? "Approved" : "Not Approved"}>
                            <FontAwesomeIcon onClick={() => markTeacherAsApproved()} icon={faThumbsUp} color={approved ? "green" : "gray"} size={"2x"} style={{ marginLeft: 20 }} />
                        </Tooltip>
                    </div>
                }
                extra={[
                    <div style={{ display: 'flex' }}>
                        <Button key='1' type="primary"
                            style={{ display: 'flex' }}
                            onClick={(e) => { e.stopPropagation(); teacher.schedule ? history.push(`/teacherlist/${teacher.id}/update`, { teacher: teacher }) : history.push(`/teacherprofiles/${teacher.id}/update`, { teacher: { ...teacher, ...teacher.teacherProfile } }) }}
                        >
                            Edit
                        </Button>
                        <Button key='2' type="primary"
                            style={{ display: 'none' }}
                            onClick={() => markAsPresent()}
                        >
                            {present ? 'MARK AS PRESENT' : 'MARK AS ABSENT'}
                        </Button>
                        <Button key='3' type="primary"
                            style={{ display: assigningStatus ? 'block' : 'none', marginLeft: '20px' }}
                            disabled={(assignStudentList.length > 0 && active) || selectedRow.length > 0 ? false : true}
                            onClick={() => {
                                assignStudent()
                            }}
                        >
                            ASSIGN STUDENT
                        </Button>
                    </div>
                ]}
            >

                <Row gutter={24} style={{ marginBottom: '3%' }}>
                    <Card title="Profile" hoverable={true} bordered={true} style={{ width: "48%", marginLeft: '2%' }}>
                        <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <h4>Name</h4>
                            </Col>
                            <Col className="gutter-row" span={14}>
                                <h4>{`${teacher.teacherProfile.firstName} ${teacher.teacherProfile.lastName}`}</h4>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <h4 >External Email</h4>
                            </Col>
                            <Col className="gutter-row" span={14}>
                                <h4>{`${teacher.teacherProfile.externalEmail}`}</h4>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <h4 >Internal Email</h4>
                            </Col>
                            <Col className="gutter-row" span={14}>
                                <h4>{`${teacher.teacherProfile.internalEmail}`}</h4>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <h4>Conference URL</h4>
                            </Col>
                            <Col className="gutter-row" span={14}>
                                <p onClick={(e) => {
                                    window.open(teacher.conferenceUrl ? teacher.conferenceUrl.includes('http') ? teacher.conferenceUrl : 'http://' + teacher.conferenceUrl : teacher.teacherProfile.conferenceUrl ? teacher.teacherProfile.conferenceUrl.includes('http') ? teacher.teacherProfile.conferenceUrl : 'http://' + teacher.teacherProfile.conferenceUrl : '')
                                }}>{`${teacher.teacherProfile.conferenceUrl}`}</p>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <h4>Subjects</h4>
                            </Col>
                            <Col className="gutter-row" span={14}>
                                <h4>{teacher.teacherProfile.subjects ? teacher.teacherProfile.subjects.join(', ') : 'No subjects'}</h4>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <h4>Grades</h4>
                            </Col>
                            <Col className="gutter-row" span={14}>
                                <h4>{teacher.teacherProfile.grades ? teacher.teacherProfile.grades.join(', ') : 'No Grades'}</h4>
                            </Col>
                        </Row>
                    </Card>

                    <Card title="Availability" hoverable={true} bordered={true} style={{ width: "48%", marginLeft: '2%' }}>
                        <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <h4>Start Date</h4>
                            </Col>
                            <Col className="gutter-row" span={14}>
                                <h4>
                                    {startDate}
                                </h4>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <h4>Effective Start Date</h4>
                            </Col>
                            <Col className="gutter-row" span={14}>
                                <h4>
                                    {effectiveStartDate}
                                </h4>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <h4>Conference URL</h4>
                            </Col>
                            <Col className="gutter-row" span={14} onDoubleClick={() => setEditable(!editable)}>
                                {!editable ?
                                    <p onClick={(e) => {
                                        window.open(teacher.conferenceUrl ? teacher.conferenceUrl.includes('http') ? teacher.conferenceUrl : 'http://' + teacher.conferenceUrl : teacher.teacherProfile.conferenceUrl ? teacher.teacherProfile.conferenceUrl.includes('http') ? teacher.teacherProfile.conferenceUrl : 'http://' + teacher.teacherProfile.conferenceUrl : '')
                                    }} >{confUrl}</p> :
                                    <Form layout="inline">
                                        <Form.Item>
                                            <Input
                                                type="text"
                                                placeholder="Conference Url"
                                                name="url"
                                                value={confUrl}
                                                onChange={setConferenceUrl}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        setEditable(false);
                                                    }
                                                }}
                                            />
                                        </Form.Item>
                                    </Form>
                                }
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col className="gutter-row" span={8}>
                                <h4>Students</h4>
                            </Col>
                            <Col className="gutter-row" span={14}>
                                <h4>{teacher.studentCount}</h4>
                            </Col>
                        </Row>
                    </Card>
                </Row>

                {!studentList || !students ? <Spin /> :
                    <>
                        <h2>Students </h2>
                        <Table
                            columns={columns}
                            dataSource={students}
                            rowSelection={rowSelection}
                            rowKey="id"
                        />
                    </>
                }

                {!isAddingAssistants && !profile && (
                    <div style={{ marginTop: 40 }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}>
                            <h2>Assistants </h2>
                            <Button key='3' size="medium" type="primary" onClick={() => setIsAddingAssistants(true)}>
                                < PlusOutlined />
                            </Button>
                        </div>
                        <Table
                            columns={assistantColumns}
                            dataSource={assistants}
                        />
                    </div>
                )}

                {isAddingAssistants && !profile && (
                    <div style={{ marginTop: 40 }}>
                        <h2>Select new assistants </h2>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 20
                        }}>
                            <SearchFilter
                                changeInput={changeSearch}
                                open={open}
                                profiles={teacherList}
                                setOpenTrue={() => setOpen(true)}
                                setOpenFalse={() => setOpen(false)}
                                loading={profileLoading}
                                changeProfile={(__, e) => {
                                    try {
                                        e.target = {};
                                        e.target.value = e.firstName + " " + e.lastName
                                        e.target.name = 'name';
                                        console.log(e)
                                        changeSearch(e);
                                    } catch (err) {
                                        setSearch({ ...search, firstName: '', lastName: '' });
                                    }
                                }}
                                changeProfileInput={(e) => {
                                    changeSearch(e);
                                }}
                                searchList={searchList}
                            />
                            <div>
                                <Button key='3' size="medium" type="primary" onClick={() => updateAssistants(selectedRowProfile, true)}>
                                    Add selected
                                </Button>
                                <Button key='3' size="medium" type="warning" style={{ marginLeft: 10 }} onClick={() => setIsAddingAssistants(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                        <Table
                            columns={profileColumns}
                            dataSource={teacherList}
                            rowSelection={rowSelectionProfile}
                            rowKey="id"
                        />
                    </div>
                )}
            </PageHeader>
        </div>
    )
}
export default StudentListOfTeacher
