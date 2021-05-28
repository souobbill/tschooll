import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import 'antd/dist/antd.css';
import { useHistory } from 'react-router-dom'
import { Table, PageHeader, Button, Spin, Popconfirm, Form, Input, Tooltip , Typography} from 'antd';
import { getTeacherList, findTeacherListByFirstNameAndLastName, getTeacherListByDate, deleteTeacherAvailabilities, sendMessageAvailability } from '../../services/Teacher'

import { assignStudentToAnotherTeacher, findStudentListByFirstNameAndLastName, getStudentListByDate, editSubjectGrade, deleteAvailabilities } from '../../services/Student'
import { assignStudents } from '../../Action-Reducer/Student/action'
import SearchFilter from '../../components/StudentList/SearchFilter'
import Moment from 'react-moment';
import Modal from 'react-modal';
import { VerticalAlignBottomOutlined, VerticalAlignTopOutlined, VideoCameraOutlined,MessageOutlined, ApiOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'

const { Text } = Typography;


const customStyles = {
    content: {
        top: '10%',
        width: '50%',
        left: '25%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-30%',
    }
};

Modal.setAppElement(document.getElementById('root'))

function TeacherList() {
    const history = useHistory();
    const dispatch = useDispatch();
    const assignStudentList = useSelector((state) => {
        return state.Student.assignStudent;
    })
    const [teacherList, setTeacherList] = useState();
    const [teacherId, setTeacherId] = useState(0);
    const [mess_id, setMess_id] = useState("t1");
    const [sortingName, setSortingName] = useState("createDate");
    const [studentList, setStudentList] = useState();
    const [sortingType, setSortingType] = useState("desc");
    const [selectedRow, setSelectedRow] = useState([]);

    const [sortingNameStudent, setSortingNameStudent] = useState("firstName");
    const [sortingTypeStudent, setSortingTypeStudent] = useState("desc");
    const [selectedRowStudent, setSelectedRowStudent] = useState([]);

    const [editableSubject, setEditableSubject] = useState([])
    const [editableGrade, setEditableGrade] = useState([])
    const [editableTag, setEditableTag] = useState([])
    const deletingStatus = useSelector((state) => {
        return state.Student.enableDeleting;
    })
    const assigningStatus = useSelector((state) => {
        return state.Student.enableAssigning;
    })
    const [tableProps, setTableProps] = useState({
        totalCount: 0,
        pageIndex: 0,
        pageSize: 30,
    });

    const [studentTableProps, setStudentTableProps] = useState({
        totalCount: 0,
        pageIndex: 0,
        pageSize: 30,
    });
    // const [start, setStart] = useState();
    // const [end, setEnd] = useState();
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState({
        name: "",
        firstName: "",
        lastName: ""
    })

    const [studentSearch, setStudentSearch] = useState({
        name: "",
        firstName: "",
        lastName: "",
    })

    const [modalIsOpen, setIsOpen] = React.useState(false);

    function openModal(id) {
        setTeacherId(id);
        console.log(id)
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    const Assigntitle = <div>
        <h3>Assign Student List</h3>
        {assignStudentList.map((student, index) => {
            return <div key={student.id}>
                <spann>{index + 1}. {student.firstName} {student.lastName}</spann>
            </div>
        })}
    </div>

    const rowSelection = {
        selectedRow,
        onChange: (__, records) => {
            console.log('selectedRowKeys changed: ', records);
            var recordIdArray = [];
            records.map(record => {
                recordIdArray.push({ id: record.id })
            })
            setSelectedRow(recordIdArray);
        }
    };

    const rowSelectionStudent = {
        selectedRowStudent,
        onChange: (__, records) => {
            console.log('selectedRowKeys changed: ', records);
            var recordIdArray = [];
            records.map(record => {
                recordIdArray.push({ id: record.id })
            })
            setSelectedRowStudent(recordIdArray);
        }
    };

    const deleteRows = () => {
        let ids = [];
        selectedRow.forEach(r => ids.push(r.id));
        deleteAvailabilities(ids.join(',')).then(data => {
            getListView();
            setSelectedRow([]);
        })
    }

    useEffect(() => {
        getListView();
        
        // getStudentList();
    }, [tableProps.pageIndex]);
    
    useEffect(() => {
        getListView();
        // getStudentList();
    }, [sortingType, sortingName]);


    const getListView = () => {
        if (search.firstName === "" && search.lastName === "" && (localStorage.getItem('currentTag') === "" || localStorage.getItem('currentTag') === "no tag")) {
            getTeacherListByDate(localStorage.getItem('toStart'), localStorage.getItem('toEnd'), tableProps.pageIndex, tableProps.pageSize, sortingName, sortingType).then(data => {
                console.log('DATA 11 ==> ', data)
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
            })
        }
        else if (search.firstName !== "" && search.lastName !== "" && localStorage.getItem('currentTag') === "no tag"){
            findTeacherListByFirstNameAndLastName(search.firstName.trim(), localStorage.getItem('toStart'), localStorage.getItem('toEnd'), tableProps.pageIndex, tableProps.pageSize, null, sortingName, sortingType).then(data => {
                console.log('DATA 12 ==> ', data)
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
            })
        } else{
            findTeacherListByFirstNameAndLastName(search.firstName.trim(), localStorage.getItem('toStart'), localStorage.getItem('toEnd'), tableProps.pageIndex, tableProps.pageSize, localStorage.getItem('currentTag'), sortingName, sortingType).then(data => {
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
            })

        }
    }

    const studentColumns = [
        {
            title: <div><span>Name of student</span>
                {sortingNameStudent === "firstName" && sortingTypeStudent === "asc" && <VerticalAlignBottomOutlined />}
                {sortingNameStudent === "firstName" && sortingTypeStudent === "desc" && <VerticalAlignTopOutlined />}
                {sortingNameStudent === "firstName" && sortingTypeStudent === "" && ""}
            </div>,
            onHeaderCell: (column) => {
                return {
                    onClick: () => {
                        setSortingNameStudent("firstName");
                        if (sortingTypeStudent == "") { setSortingTypeStudent("asc") }
                        else if (sortingTypeStudent == "asc") { setSortingTypeStudent("desc") }
                        else if (sortingTypeStudent == "desc") { setSortingTypeStudent("asc"); setSortingNameStudent("firstName"); }
                    }
                };
            },
            render: (record) =>
                <Button
                    style={{ backgroundColor: "transparent", border: "0px", cursor: 'pointer' }}>
                    {record.studentProfile.firstName + " " + record.studentProfile.lastName}
                </Button>,
            key: 'name',
            fixed: 'left',
        }
    ]

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
                    <Tooltip title={"Online status"}>
                        <FontAwesomeIcon icon={faCircle} color="green" style={{ display: record.teacherProfile.onlineStatus == 0 ? "block" : "none" }} />
                        <FontAwesomeIcon icon={faCircle} color="orange" style={{ display: record.teacherProfile.onlineStatus == 1 ? "block" : "none" }} />
                        <FontAwesomeIcon icon={faCircle} color="red" style={{ display: record.teacherProfile.onlineStatus == 2 ? "block" : "none" }} />
                    </Tooltip>

                    <Tooltip title={record.teacherProfile.firstName + " " + record.teacherProfile.lastName}>
                        <Button
                            style={{ backgroundColor: "transparent", border: "0px", cursor: 'pointer' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                history.push(`/studentlist/teacher/${record.id}`, { teacher: record, profile: false })
                            }}>{(record.teacherProfile.firstName + " " + record.teacherProfile.lastName).length <= 20 ?
                                record.teacherProfile.firstName + " " + record.teacherProfile.lastName :
                                (record.teacherProfile.firstName + " " + record.teacherProfile.lastName).substring(0, 19) + '...'}</Button>
                    </Tooltip>
                </div>,
            key: 'name',
            fixed: 'left',
        },
        {
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
            render: (record) => {
                let tmp = new Date(record.schedule.startDate);
                let result = new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate());

                let startD = (result.getMonth()+1).toString().padStart(2, '0') + '/' + result.getDate().toString().padStart(2, '0') + '/' + result.getFullYear();
                return (
                    <span>
                        {startD}
                    </span>
                )
            },
            key: 'startDate',
        },
        {
            title: <div><span>Subjects </span>
            </div>,
            key: 'subjects',
            render: (record) => {
                return (
                    <div onDoubleClick={() => {
                        if (!editableSubject.includes(record)) {
                            setEditableSubject([...editableSubject, record]);
                        } else {
                            setEditableSubject(editableSubject.filter(r => r.id !== record.id));
                        }
                    }}
                        style={{
                            width: '200px'
                        }}>
                        {!editableSubject.includes(record) ?

                            <Tooltip title={record.teacherProfile.subjects.join(', ')}>
                                {record.teacherProfile.subjects.join(', ').length <= 20 ?
                                    record.teacherProfile.subjects.join(', ') :
                                    (record.teacherProfile.subjects.join(', ')).substring(0, 19) + '...'}
                            </Tooltip> : <Form layout="inline">
                                <Form.Item>
                                    <Input
                                        type="text"
                                        placeholder="Subjects"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                editSubjectGrade(record.id, e.target.value, record.teacherProfile.grades.join(',')).then(data => {
                                                    setEditableSubject(editableSubject.filter(r => r.id !== record.id));
                                                    getListView();
                                                })
                                            }
                                        }}
                                    />
                                </Form.Item>
                            </Form>}
                    </div>
                )
            }
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
        {
            title: <div><span>Grades </span>
            </div>,
            key: 'grades',
            render: (record) => {
                return (
                    <div onDoubleClick={() => {
                        if (!editableGrade.includes(record)) {
                            setEditableGrade([...editableGrade, record]);
                        } else {
                            setEditableGrade(editableGrade.filter(r => r.id !== record.id));
                        }
                    }}>
                        {!editableGrade.includes(record) ? gradesToPrint(record.teacherProfile) : <Form layout="inline">
                            <Form.Item>
                                <Input
                                    type="text"
                                    placeholder="Grades"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            editSubjectGrade(record.id, record.teacherProfile.subjects.join(','), e.target.value).then(data => {
                                                setEditableGrade(editableGrade.filter(r => r.id !== record.id));
                                                getListView();
                                            })
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Form>}
                    </div>
                )
            }
        }
        ,
        {
            title: <div><span>Students </span>
                {sortingName === "studentCount" && sortingType === "asc" && <VerticalAlignBottomOutlined />}
                {sortingName === "studentCount" && sortingType === "desc" && <VerticalAlignTopOutlined />}
                {sortingName === "studentCount" && sortingType === "" && ""}
            </div>,
            onHeaderCell: (column) => {
                return {
                    onClick: () => {
                        setSortingName("studentCount");
                        if (sortingType == "") { setSortingType("asc") }
                        else if (sortingType == "asc") { setSortingType("desc") }
                        else if (sortingType == "desc") { setSortingType("asc"); setSortingName("studentCount"); }
                    }
                };
            },
            render: (studentCount) => (
                <div>
                    <p style={{ textAlign: 'left', paddingLeft: '20px' }}>{studentCount}</p>
                </div>
            ),
            dataIndex: 'studentCount',
            key: 'studentCount',
        },
        {
            title: 'Actions',
            key: 'meet',
            render: (record) => {
                const confirm = (e) => {
                    e.stopPropagation();
                    let studentIdArray = [];
                    assignStudentList.map((student) => {
                        studentIdArray.push(student.id)
                    })
                    let studentIds = studentIdArray.join(',');
                    assignStudentToAnotherTeacher(record.id, studentIds)
                        .then(res => {
                            setLoading(true);
                            dispatch(assignStudents([]));
                            getListView();
                        })
                }
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100px' }}>
                        <Tooltip title={record.conferenceUrl ? record.conferenceUrl.includes('http') ? record.conferenceUrl : 'http://' + record.conferenceUrl : record.teacherProfile.conferenceUrl ? record.teacherProfile.conferenceUrl.includes('http') ? record.teacherProfile.conferenceUrl : 'http://' + record.teacherProfile.conferenceUrl : ''}>
                            <Button
                                style={{ backgroundColor: "transparent", border: "0px", color: "#1890FF" }}
                                onClick={(e) => {
                                    window.open(record.conferenceUrl ? record.conferenceUrl.includes('http') ? record.conferenceUrl : 'http://' + record.conferenceUrl : record.teacherProfile.conferenceUrl ? record.teacherProfile.conferenceUrl.includes('http') ? record.teacherProfile.conferenceUrl : 'http://' + record.teacherProfile.conferenceUrl : '')
                                }}
                                disabled={!record.teacherProfile.conferenceUrl && !record.conferenceUrl}>
                                <VideoCameraOutlined style={{ fontSize: 20 }} />
                            </Button>
                        </Tooltip>

                        <Popconfirm
                            icon={false}
                            title={Assigntitle}
                            placement="left"
                            onConfirm={confirm}
                            onCancel={(e) => { e.stopPropagation(); dispatch(assignStudents([])) }}
                            okText="Assign"
                            cancelText="Cancel"
                            disabled={assignStudentList.length > 0 ? false : true}
                        >
                            {/* <ApiOutlined style={{ color: assigningStatus && assignStudentList.length > 0 ? '#1890FF' : 'gray', fontSize: 20 }} disabled={assignStudentList.length > 0 ? false : true} onClick={(e) => e.stopPropagation()} /> */}
                        </Popconfirm>

                        <div id="edit" onClick={(e) => { e.stopPropagation(); history.push(`/teacherlist/${record.id}/update`, { teacher: record }) }}><EditOutlined id="editIcon" style={{ fontSize: 20, marginLeft: 10, color: '#1890FF' }} /></div>
                    </div>
                )

            }
        }
    ];

    const getStudentList = () => {
        if (studentSearch.firstName === "" && studentSearch.lastName === "") {
            getStudentListByDate(localStorage.getItem('toStart'), localStorage.getItem('toEnd'), studentTableProps.pageIndex, 5, sortingNameStudent, sortingTypeStudent).then(data => {
    
                if (data) {
                    if (data) {
                        setStudentList(data)
                        setStudentTableProps({
                            ...studentTableProps,
                            totalCount: data.length,
                            pageSize: 30,
                        });
                    } else {
                        setStudentList([])
                        setStudentTableProps({
                            ...studentTableProps,
                            totalCount: 0,
                            pageSize: 5,
                        });
                    }
                } else {
                    setStudentList([])
                    setStudentTableProps({
                        ...studentTableProps,
                        totalCount: 0,
                        pageSize: 5,
                    });
                }
            })
        }
        else {
            findStudentListByFirstNameAndLastName(studentSearch.firstName.trim(), localStorage.getItem('toStart'), localStorage.getItem('toEnd'), studentTableProps.pageIndex, 5, null, sortingNameStudent, sortingTypeStudent).then(data => {
                if (data) {
                    if (data) {
                        setStudentList(data)
                        setStudentTableProps({
                            ...studentTableProps,
                            totalCount: data.length,
                            pageSize: 5,
                        });
                    } else {
                        setStudentList([])
                        setStudentTableProps({
                            ...studentTableProps,
                            totalCount: 0,
                            pageSize: 5,
                        });
                    }
                } else {
                    setStudentList([])
                    setStudentTableProps({
                        ...studentTableProps,
                        totalCount: 0,
                        pageSize: 5,
                    });
                }
            })
        }
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setTableProps({
            ...tableProps,
            pageIndex: pagination.current - 1,
            pageSize: pagination.pageSize,
        });
        setLoading(true);
        setTeacherList([]);
    };

    const assigningStudents = (teacherId) => {
        let studentIdArray = [];
        selectedRowStudent.map((student) => {
            studentIdArray.push(student.id)
        })
        let studentIds = studentIdArray.join(',');
        assignStudentToAnotherTeacher(teacherId, studentIds)
            .then(res => {
                closeModal();
                getListView();
            })
    }

    const computeLastName = (name) => {
        let lastName = '';
        for (let index = 1; index < name.length; index++) {
            lastName = lastName.trim() + ' ' + name[index].trim();
        }
        return lastName
    }


    const gradesToPrint = (profile) => {
        let i = 0;
        let result = '';
        if (profile == null) {
            return '';
        }

        if (!profile.grades) {
            return '';
        }

        for (i = 0; i < profile.grades.length; i++) {
            if (i == 0) {
                result += profile.grades[i];
            } else {
                if (i == (profile.grades.length - 1))
                    if (Number(profile.grades[i - 1]) !== Number(profile.grades[i]) - 1)
                        result = result + ', ' + profile.grades[i];
                    else
                        result = result + '-' + profile.grades[i];
                else
                    if (Number(profile.grades[i - 1]) !== Number(profile.grades[i]) - 1)
                        if (Number(profile.grades[i]) !== Number(profile.grades[i + 1]) - 1)
                            result = result + ',' + profile.grades[i] + ', ' + profile.grades[i + 1];
                        else
                            result = result + ',' + profile.grades[i];
            }
        }

        return result;
    }

    const changeSearch = (e) => {
        const { name, value } = e.target;
        if (e.target.name === "name") {
            var nameData = value.trim().split(" ");
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

    const onKeyEnter = (e) => {
        //alert("not enter")
        if (e.keyCode == 13) {
            getStudentList();
        }
    }

    const changeStudentSearch = (e) => {
        const { name, value } = e.target;
        setStudentSearch({ ...search, [name]: value.trim() });
        if (e.target.name === "name") {
            var nameData = value.trim().split(" ");
            if (nameData.length > 1) {
                setStudentSearch({ ...search, firstName: nameData[0].trim(), lastName: computeLastName(nameData) });
            }
            else {
                setStudentSearch({ ...search, firstName: nameData[0].trim(), lastName: nameData[0].trim() });
            }
        }
    };

    const deleteBooking = (selectedrow) => {
        if (selectedrow.length > 0) {
            let ids = selectedrow.reduce((a, b) => {
                return a + ',' + b.id;
            }, '')
            deleteTeacherAvailabilities(ids.substring(1)).then(data => {
                console.log(data);
                setSelectedRow([]);
                getListView();
            });
        } else {
            alert('Select at least one teacher');
        }
    }

    const sendMessage = (messId) => {
        sendMessageAvailability(messId).then(res => {
            setSelectedRow(0);
        })
    }

    return (
        <React.Fragment>
            <PageHeader
                ghost={false}
                title={<p style={{ fontSize: '3em', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>Teachers Availabilities</p>}
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
                                <Button key='3' size="medium" type="primary" onClick={() => history.push("/teacherlist/add")}>
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
                {!teacherList ? <Spin className="loading-table" /> :
                    <Table
                        className="table-padding"
                        columns={columns}
                        style={{ marginTop: '30px' }}
                        loading={loading}
                        dataSource={teacherList}
                        onChange={handleTableChange}
                        pagination={{
                            total: tableProps.totalCount,
                            pageSize: tableProps.pageSize,
                            showTotal: (total, range) => `${range[0]}-${range[1]} out of ${total}`,
                        }}
                        rowSelection={rowSelection}
                        rowKey="id"
                    />}

            </PageHeader>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Select students to assign to teacher"
            >

                <h2>Select students to assign</h2>
                <Form layout="inline" style={{ marginRight: '20px', width: "100%", display: 'flex' }}>
                    <Form.Item style={{ width: '100%', height: '50px' }}>
                        <Input
                            type="text"
                            placeholder="Enter Name a student to search"
                            name="name"
                            style={{ width: '70%', height: '40px' }}
                            onKeyDown={onKeyEnter}
                            onChange={changeStudentSearch}
                        />
                        <Button onClick={() => assigningStudents(teacherId)} disabled={selectedRowStudent.length <= 0 || !assigningStatus ? true : false} style={{ backgroundColor: 'blue', color: 'white', height: '40px', marginLeft: '10px', marginTop: '0px' }}> ASSIGN ({selectedRowStudent.length}) STUDENT.S </Button>
                    </Form.Item>
                </Form>
                {!studentList ? <Spin className="loading-table" /> :
                    <Table
                        className="table-padding"
                        columns={studentColumns}
                        style={{ marginTop: '30px' }}
                        loading={loading}
                        dataSource={studentList}
                        onChange={handleTableChange}
                        pagination={{
                            total: tableProps.totalCount,
                            showTotal: (total, range) => `${range[0]}-${range[1]} out of ${total}`,
                        }}
                        rowSelection={rowSelectionStudent}
                        rowKey="id"
                    />}
            </Modal>

        </React.Fragment>
    )
}
export default TeacherList
