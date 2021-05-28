import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Table, PageHeader, Button, Spin, Tooltip, Typography} from 'antd';
import { useSelector } from 'react-redux'
import 'antd/dist/antd.css';
import '../../Assets/container/StudentList.css'
import { findStudentProfileByFirstNameAndLastName, getStudentProfileByDate, deleteStudentProfiles, sendStudentsMessage} from '../../services/Student'
import SearchFilter from '../../components/StudentList/SearchFilter'
import Moment from 'react-moment';
import { VerticalAlignBottomOutlined, VerticalAlignTopOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faCoffee, faCommentAlt } from '@fortawesome/free-solid-svg-icons'
import {MessageOutlined} from '@ant-design/icons'

const { Text } = Typography;

function StudentProfile() {
    const history = useHistory();
    const [studentList, setStudentList] = useState();
    const [sortingName, setSortingName] = useState("createDate");
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

    const [selectedRow, setSelectedRow] = useState([]);
    const [loading, setLoading] = useState(false);

    const rowSelection = {
        selectedRow,
        onChange: (selectedrow, records) => {
            console.log('selectedRowKeys changed: ', records);
            setSelectedRow(records);
        }
    };

    const deleteRows = () => {
        let ids = [];
        selectedRow.forEach(r => ids.push(r.id));
        deleteStudentProfiles(ids.join(',')).then(data => {
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
            title: <div><span>Parent phone </span>
            </div>,
            render: (record) => (
                <div>
                    {
                        <p style={{ width: "50%", textAlign: "left" }}>
                            {record.parent.phoneNumber}
                        </p>
                    }
                </div>
            ),
            key: 'registrationDate',
        },
        {
            title: <div><span>Email </span>
                {sortingName === "email" && sortingType === "asc" && <VerticalAlignBottomOutlined />}
                {sortingName === "email" && sortingType === "desc" && <VerticalAlignTopOutlined />}
                {sortingName === "email" && sortingType === "" && ""}
            </div>,
            onHeaderCell: (column) => {
                return {
                    onClick: () => {
                        setSortingName("email");
                        if (sortingType == "") { setSortingType("asc") }
                        else if (sortingType == "asc") { setSortingType("desc") }
                        else if (sortingType == "desc") { setSortingType("asc"); setSortingName("email"); }
                    }
                };
            },
            render: (record) => {
                return (
                    <div>
                        {record.email}
                    </div>
                )
            },
            key: 'email',
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
                return (
                    <span>{record.grade}</span>
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
        {
            title: <div><span>Action </span>
            </div>,
            render: (record) => {
                return (
                    <div id="edit" onClick={(e) => { e.stopPropagation(); history.push(`/studentprofiles/${record.id}/update`, { student: record }) }}><EditOutlined id="editIcon" style={{ fontSize: 20, marginLeft: 10, color: '#1890FF' }} /></div>
                )
            },
            key: 'action',
        }

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

    const getListView = () => {
        if (search.firstName === "" && search.lastName === ""&& (localStorage.getItem('currentTag') === "no tag" || localStorage.getItem('currentTag') === "")) {
            getStudentProfileByDate(localStorage.getItem('toStart'), localStorage.getItem('toEnd'), tableProps.pageIndex, tableProps.pageSize, sortingName, sortingType).then(data => {
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
            findStudentProfileByFirstNameAndLastName(search.firstName.trim(), localStorage.getItem('toStart'), localStorage.getItem('toEnd'), tableProps.pageIndex, tableProps.pageSize, null, sortingName, sortingType).then(data => {
                console.log('DATA ==> ', data)
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
            findStudentProfileByFirstNameAndLastName(search.firstName.trim(), localStorage.getItem('toStart'), localStorage.getItem('toEnd'), tableProps.pageIndex, tableProps.pageSize, localStorage.getItem('currentTag'), sortingName, sortingType).then(data => {
                console.log('DATA ==> ', data)
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

    const sendMessage = (messId) => {
        sendStudentsMessage(messId).then(res => {
            console.log(res);
        })
    }


    return (

        <div>
            <PageHeader
                ghost={false}
                title={<p style={{ fontSize: '3em', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>Student Profiles</p>}
                extra={[
                ]}
            >
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ display: 'flex', flex: 1 }}>
                        <SearchFilter
                            changeInput={changeSearch}
                            searchList={searchList}
                        />
                    </div>

                    <div style={{ display: deletingStatus ? 'flex' : 'none', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <Button key='3' size="medium" type="danger" onClick={() => deleteRows()}>
                            <DeleteOutlined />
                        </Button>
                    </div>
                    {
                        (selectedRow.length == 0) ? 
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', marginLeft: '20px' }}>
                                <Button key='3' size="medium" type="primary" onClick={() => history.push('/studentprofiles/add')}>
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
                    />}

            </PageHeader>
        </div>
    )
}
export default StudentProfile
