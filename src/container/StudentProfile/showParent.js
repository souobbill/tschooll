import React, { useState, useEffect } from 'react'
import { Row, Col, PageHeader, Card, Table, Spin, Tooltip, Button } from 'antd';
import { useLocation } from "react-router-dom";
import { getChild } from '../../services/Student'
import Moment from 'react-moment';
import { useHistory } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'

function ShowParent(props) {

    const location = useLocation();
    const { params } = props.match;
    const history = useHistory();
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [parentDetail, setParentDetail] = useState(location.state.parent);

    useEffect(() => {
        console.log(parentDetail)
        getDetailView();
    }, []);

    const getDetailView = () => {
        setBookingsLoading(true);
        getChild(location.state.parent.id).then(data => {
            setBookings(data.content);
        }).catch((err) => { console.log(err); setBookings([]) })
            .finally(() => setBookingsLoading(false))
    }


const columns = [
    {
        title: <div><span>Name </span>
        </div>,
        render: (record) =>
            <div
                style={{ display: "flex", flexDirection: 'row', alignItems: "center" }}
            >
                <Tooltip title={""}>
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
        title: <div><span>Email</span>
        </div>,
        render: (record) => (
            <div>
                {record.email}
            </div>
        ),
        key: 'email',
    },
    {
        title: <div><span>Grade</span>
        </div>,
        render: (record) => {
            return (
                <div>
                    {record.grade}
                </div>
            )
        },
        key: 'grade',
    },
    {
        title: <div><span>School Name</span>
        </div>,
        render: (record) => (
            <div>
                {record.schoolName}
            </div>
        ),
        key: 'schoolName',
    }
];

    return (
        <div>
            {parentDetail ?
                <PageHeader
                    ghost={false}
                    extra={[
                        <div style={{ display: 'flex' }}>
                            <Button key='3' type="primary"
                                style={{ display: 'flex' }}
                                onClick={(e) => { e.stopPropagation(); history.push(`/parentProfiles/${parentDetail.id}/update`, { parent: parentDetail }) }}
                            >
                                Edit
                            </Button>
                        </div>
                    ]}
                    title={<p style={{ fontSize: '3em', textAlign: 'center', marginTop: '20px', marginBottom: '20px'  }}>{parentDetail.firstName} {parentDetail.lastName}</p>}
                >

                    <Row gutter={24} style={{ marginBottom: '3%' }}>
                        <Card title="Student informations" hoverable={true} bordered={true} style={{ width: "48%", marginLeft: '2%' }}>
                            <Row gutter={16}>
                                <Col className="gutter-row" span={8}>
                                    <h4>Email</h4>
                                </Col>
                                <Col className="gutter-row" span={14}>
                                    <h4 >
                                        {parentDetail.email}
                                    </h4>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col className="gutter-row" span={8}>
                                    <h4>Country Code</h4>
                                </Col>
                                <Col className="gutter-row" span={14}>
                                    <h4 >{parentDetail.countryCode}</h4>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col className="gutter-row" span={8}>
                                    <h4>Phone Number</h4>
                                </Col>
                                <Col className="gutter-row" span={14}>
                                    <h4 >{parentDetail.phoneNumber}</h4>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col className="gutter-row" span={8}>
                                    <h4>Activation Code</h4>
                                </Col>
                                <Col className="gutter-row" span={14}>
                                    <h4 >{parentDetail.activationCode}</h4>
                                </Col>
                            </Row>
                        </Card>
                    </Row>
                    {bookingsLoading ? <Spin /> :

                        <>
                            <h2>{parentDetail.firstName} {parentDetail.lastName}'s child </h2>
                            <Table
                                columns={columns}
                                dataSource={bookings}
                                rowKey="id"
                            />
                        </>
                    }
                </PageHeader> : null}
        </div>
    )
}

export default ShowParent
