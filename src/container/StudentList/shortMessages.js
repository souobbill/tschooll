import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Table, PageHeader, Button, Spin, Tooltip } from 'antd';
import { useSelector, useDispatch } from 'react-redux'
import 'antd/dist/antd.css';
import '../../Assets/container/StudentList.css'
import { getShortMessages, getShortMessagesByDate } from '../../services/Student'
import SearchFilter from '../../components/StudentList/SearchFilter'
import { assignStudents } from '../../Action-Reducer/Student/action'
import { VerticalAlignBottomOutlined, VerticalAlignTopOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons"


function ShortMessageList(props) {
    const dispatch = useDispatch();
    const history = useHistory();
    const { params } = props.match;
    const [studentList, setStudentList] = useState();
    const [sortingName, setSortingName] = useState("createDate");
    const [sortingType, setSortingType] = useState("desc");
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
    const startDate = useSelector((state) => {
        return state.StarDate.startDate;
    })
    const endDate = useSelector((state) => {
        return state.EndDate.endDate;
    })

    const rowSelection = {
        selectedRow,
        onChange: (selectedrow, records) => {
            console.log('selectedRowKeys changed: ', records);
            setSelectedRow(records);
        }
    };

    // const deleteRows = () => {
    //     let ids = [];
    //     selectedRow.forEach(r => ids.push(r.id));
    //     console.log(ids.join(','));
    //     deleteSchedule(ids.join(',')).then(data => {
    //         console.log(data);
    //     })
    // }

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
            render: (record) => <Tooltip title={"Consulter les details de l'étudiant"}>
                <Button
                    style={{ backgroundColor: "transparent", border: "0px", cursor: 'pointer' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        history.push(`/studentlist/studentDetail/${record.id}`)
                    }}>{record.firstName + " " + record.lastName}</Button>
            </Tooltip>,
            key: 'name',
            fixed: 'left',
        },
        {
            title: <div><span>Message Content </span></div>,
            dataIndex: 'body',
            key: 'body',
        },
        {
            title: <div><span>Sending date </span>
                {sortingName === "dateCreated" && sortingType === "asc" && <VerticalAlignBottomOutlined />}
                {sortingName === "dateCreated" && sortingType === "desc" && <VerticalAlignTopOutlined />}
                {sortingName === "dateCreated" && sortingType === "" && ""}
            </div>,
            onHeaderCell: (column) => {
                return {
                    onClick: () => {
                        setSortingName("dateCreated");
                        if (sortingType == "") { setSortingType("asc") }
                        else if (sortingType == "asc") { setSortingType("desc") }
                        else if (sortingType == "desc") { setSortingType("asc"); setSortingName("dateCreated"); }
                    }
                };
            },
            dataIndex: 'dateCreated',
            key: 'dateCreated',
        }
    ];

    useEffect(() => {
        console.log(params.id);
        getListView();
    }, [tableProps.pageIndex]);
    useEffect(() => {
        getListView();
    }, [sortingType, sortingName]);

    const getListView = () => {
        if (search.firstName === "" && search.lastName === "") {
            //getStudentList(tableProps.pageIndex, tableProps.pageSize, sortingName, sortingType).then(data => {
            getShortMessagesByDate(params.id, localStorage.getItem('toStart'), localStorage.getItem('toEnd'), tableProps.pageIndex, tableProps.pageSize, sortingName, sortingType).then(data => {
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
        else {
            getShortMessages(params.id, search.firstName.trim(), localStorage.getItem('toStart'), localStorage.getItem('toEnd'), tableProps.pageIndex, tableProps.pageSize, sortingName, sortingType).then(data => {
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
                setSearch({ ...search, firstName: nameData[0].trim(), lastName: 'sdf' });
            }
            else {
                setSearch({ ...search, firstName: nameData[0].trim(), lastName: 'sdf' });
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
    return (
        <React.Fragment>

            {/* <LayoutOfApp> */}
            <PageHeader
                ghost={false}
                title={<p style={{ fontSize: '3em', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>Short Messages</p>}
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
                        <Button key='3' size="medium" type="danger">
                            <DeleteOutlined />
                        </Button>
                    </div>
                    
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
            {/* </LayoutOfApp> */}
        </React.Fragment>
    )
}
export default ShortMessageList
