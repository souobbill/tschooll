import React, { useState, useEffect, useReducer } from 'react'
import { PageHeader, Button, Select, Form, Input } from 'antd';
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { enableDeleting, enableAssigning } from '../../Action-Reducer/Student/action'
import { bridgeManagement, getTags, bridgeStatus } from '../../services/Student'
import { getTeacherProfile, newTenant } from '../../services/Teacher'
import 'react-phone-input-2/lib/bootstrap.css'
import "react-phone-input-2/lib/bootstrap.css";
import PhoneInput from 'react-phone-input-2';
import { getCountry, getSchedule } from '../../services/Student';
import { updateTeacher, getTenants, getTenantByName } from '../../services/Teacher';
const { Option } = Select;

const formReducer = (state, event) => {
  return {
    ...state,
    [event.name]: event.value
  }
}

function Settings(props) {

  const history = useHistory();
  const dispatch = useDispatch();
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [bridge, setBridge] = useState(false);
  const [persist, setPersist] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [subjectsList, setSubjectsList] = useState([]);
  const [tags, setTags] = useState([{name: null, id: null}]);
  const [isCreation, setIsCreation] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [formData, setFormData] = useReducer(formReducer, {});
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [phone, setPhone] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [admin, setAdmin] = useState(false);
  const [school, setSchool] = useState('');
  const [board, setBoard] = useState('');
  const [email, setEmail] = useState('');
  const [tenant, setTenant] = useState(null);
  const [tag, setTag] = useState('no tag');
  const [advanceSchedule, setAdvanceSchedule] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [country, setCountry] = useState('ca');
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const deletingStatus = useSelector((state) => {
    return state.Student.enableDeleting;
  })
  const assigningStatus = useSelector((state) => {
    return state.Student.enableAssigning;
  })

  const getRole = (role, data) => {
    let result = false;
    if (data)
      if (data.tenants) {
        data.tenants.forEach(t => {
          if (t.roles) {
            if (t.roles.includes(role)) {
              result = true;
            }
          }
        })
      }
    return result;
  }

  useEffect(() => {
    setTenant(JSON.parse(localStorage.getItem('tenant' + JSON.parse(localStorage.getItem("user")).id)));
    setTag(JSON.parse(localStorage.getItem('currentTag')) ? JSON.parse(localStorage.getItem('currentTag')) : 'no tag');
    setAdvanceSchedule(JSON.parse(localStorage.getItem('advanceSchedule' + JSON.parse(localStorage.getItem("user")).id)));
    getSubjects();
    getCountry().then(data => {
      setCountry(data.countryCode.toString().toLowerCase());
    }).finally(() => getTeacher());
    getTenantsList();
    getTagList();
  }, []);

  const getTeacher = () => {
    getTeacherProfile().then(data => {
      setTeacher(data);
      localStorage.setItem('user', JSON.stringify(data));
      setAdmin(getRole('admin', data))
      setLastName(data.lastName);
      setFirstName(data.firstName);
      setSchool(data.schoolName ? data.schoolName : '');
      setPhone(data.phoneNumber ? data.phoneNumber : '')
      setBoard(data.schoolBoard ? data.schoolBoard : '');
      setEmail(data.externalEmail);
      setGrades(data.grades ? data.grades : []);
      setSubjects(data.subjects ? data.subjects : []);
    });
  }

  useEffect(() => {
    if (teacher != null)
      if (teacher.phoneNumber != null)
        if (teacher.phoneNumber.length >= 1 && updated)
          history.push(`/teacherlist`);
  }, [teacher])

  const getSubjects = () => {
    getSchedule(1).then(data => {
      var obj = {};
      for (var i = 0, len = data.content.length; i < len; i++)
        obj[data.content[i]['subject']] = data.content[i];
      data.content = new Array();
      for (var key in obj)
        data.content.push(obj[key]);
      setSubjectsList(data.content)
    });
  }

  const changeTag = (name) => {
    if (name != 'no tag') {
        localStorage.setItem(`currentTag`, tags.find(t => t.name == name).name);
    } else {
      localStorage.setItem(`currentTag`, null);
    }
}

  const handleChange = event => {
    setFormData({
      name: event.target.name,
      value: event.target.value,
    });
  }

  const handleChangeSelect = (value) => {
    setGrades(value.toString().split(',').map(i => Number(i)));
  }

  const handleChangeSubjects = (value) => {
    setSubjects(value);
  }

  const handleSubmit = () => {

    if (formData.tenant) {
      if (
        formData.tenant.toString().length <= 0
      ) {
        alert("Please, fill the form!");
        return
      }
    } else {
      alert("Please, fill the form!");
      return
    }
    newTenant(formData.tenant).then(data => {
      setTenant(formData.tenant);
      localStorage.setItem("tenant" + JSON.parse(localStorage.getItem("user")).id, JSON.stringify(formData.tenant))
      history.push(`/teacherlist`)
    }).catch(err => {
      alert("Error occured when saving data, please retry!")
      console.log(err)
    });

  }

  const getTagList = () => {
    getTags(0, 100000, "name", "desc").then(data => {
      if (data) {
        if (data.content) {
          setTags([...data.content]);
        }
      }
    })
  }

  const handleSubmitUpdate = () => {

    if (firstName && lastName && email && phone && school && board) {
      if (firstName.toString().length <= 0
        || lastName.toString().length <= 0
        || phone.toString().length <= 0
        || email.toString().length <= 0
        || school.toString().length <= 0
        || board.toString().length <= 0
      ) {
        alert("Please, fill the form!");
        return
      }
    } else {
      alert("Please, fill the form!");
      return
    }

    setSubmitting(true);

    updateTeacher(teacher.id, firstName, lastName, email, grades, subjects, phone, school, board).then(data => {
      setUpdated(true);
      getTeacher();
    }).catch(err => {
      alert("Error occured when saving data, please retry!")
      console.log(err)
    })
      .finally(() => setSubmitting(false));
  }

  const onEnableDeleting = () => {
    setDeleting(!deleting);
    dispatch(enableDeleting(!deleting))
  }

  const onEnableAssigning = () => {
    setAssigning(!assigning);
    dispatch(enableAssigning(!assigning))
  }

  const onBridgeAction = (status) => {
    bridgeManagement(status).then(data => {
      setBridge(status);
    });
  }

  const [tenants, setTenants] = useState([]);

  const getTenantsList = () => {
    getTenants(localStorage.getItem('toStart'), localStorage.getItem('toEnd'), 0, 10, "displayName", "desc").then(data => {
      if (data) {
        if (data.content) {
          setTenants(data.content)
        }
      }
    })
  }

  const changeTenant = (e) => {
    setTenant(e);
    localStorage.setItem("tenant" + JSON.parse(localStorage.getItem("user")).id, JSON.stringify(e));
  }

  const changeAdvanceSchedule = (e) => {
    setAdvanceSchedule(e);
    localStorage.setItem("advanceSchedule" + JSON.parse(localStorage.getItem("user")).id, JSON.stringify(e));
  }

  return (
    <div>
      <PageHeader
        ghost={false}
        title={<p style={{ fontSize: '3em', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>Settings</p>}
        extra={[
        ]}
      >
        {
          teacher != null ?
            <>
              <h2>Conference URL:</h2>
              <p onClick={() => window.open(teacher.conferenceUrl ? teacher.conferenceUrl.includes('http') ? teacher.conferenceUrl : 'http://' + teacher.conferenceUrl : teacher.teacherProfile.conferenceUrl ? teacher.teacherProfile.conferenceUrl.includes('http') ? teacher.teacherProfile.conferenceUrl : 'http://' + teacher.teacherProfile.conferenceUrl : '')} style={{ marginBottom: '40px', cursor: 'pointer' }}>{teacher.conferenceUrl}</p>
            </> : null
        }
        <div style={{
          display: teacher != null ? admin ? "flex" : 'none' : 'none',
          flexDirection: "row",
          flex: 1,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Button
            style={{ flex: 1, marginRight: "20px", height: "60px", color: "white", backgroundColor: "#1890ff" }}
            onClick={() => onEnableDeleting()}> {deletingStatus ? 'Disable' : 'Enable'} deleting </Button>

          <Button
            style={{ flex: 1, marginRight: "20px", height: "60px", color: "white", backgroundColor: "#1890ff" }}
            onClick={() => onEnableAssigning()}> {assigningStatus ? 'Disable' : 'Enable'} reassigning </Button>

          <Button
            style={{ flex: 1, marginRight: "20px", height: "60px", color: "white", backgroundColor: "#1890ff" }}
            onClick={() => onBridgeAction(bridge ? 0 : 1)}> {!bridge ? 'Open' : 'Close'} the bridge </Button>

        </div>

        <h2 style={{
          marginTop: '30px',
          marginBottom: '30px'
        }}>My personnals informations:</h2>
        <Form
          form={form2}
          autoComplete="off"
          onFinish={handleSubmitUpdate}
          layout="vertical"
        >

          <div style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            <Form.Item label="Fist Name" required style={{ flex: 1, marginRight: '10px' }}>
              <Input type="text" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Form.Item>
            <Form.Item label="Last Name" required style={{ flex: 1, marginLeft: '10px' }}>
              <Input type="text" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Form.Item>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            <Form.Item label="Email" required style={{ flex: 1, marginRight: '10px' }}>
              <Input type="email" name="iemail" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Item>
            <Form.Item label="Phone Number" required style={{ flex: 1, marginLeft: '10px' }}>
              <PhoneInput
                enableSearch
                countryCodeEditable={false}
                disableCountryCode={false}
                for
                inputClass={"form-control"}
                searchStyle={{
                  width: "90%",
                }}
                inputStyle={{
                  borderRadius: "0px",
                  width: "inherit",
                  paddingTop: '5px',
                  paddingBottom: '5px'
                }}
                value={phone}
                country={country}
                // value={phone}
                onChange={(value, country, e, formattedValue) => {
                  setPhone(formattedValue)
                }}
              />
            </Form.Item>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            <Form.Item label="Grades" required style={{ flex: 1, marginRight: '10px' }}
              onClick={() => setOpen(open ? false : true)}>
              <Select
                mode="multiple"
                allowClear
                value={grades}
                open={open}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                style={{ width: '100%' }}
                onSelect={() => setOpen(false)}
                placeholder="Please select grades"
                onChange={handleChangeSelect}
              >
                <Select.Option value={1}>1</Select.Option>
                <Select.Option value={2}>2</Select.Option>
                <Select.Option value={3}>3</Select.Option>
                <Select.Option value={4}>4</Select.Option>
                <Select.Option value={5}>5</Select.Option>
                <Select.Option value={6}>6</Select.Option>
                <Select.Option value={7}>7</Select.Option>
                <Select.Option value={8}>8</Select.Option>
                <Select.Option value={9}>9</Select.Option>
                <Select.Option value={10}>10</Select.Option>
                <Select.Option value={11}>11</Select.Option>
                <Select.Option value={12}>12</Select.Option>
              </Select>
            </Form.Item>

            {
              subjectsList.length > 0 ?

                <Form.Item label="Subjects" required style={{ flex: 1, marginLeft: '10px' }}
                  onClick={() => setOpen2(open2 ? false : true)}>
                  <Select mode="multiple"
                    allowClear
                    value={subjects}
                    open={open2}
                    onFocus={() => setOpen2(true)}
                    onBlur={() => setOpen2(false)}
                    style={{ width: '100%' }}
                    onSelect={() => setOpen2(false)}
                    placeholder="Please select subjects"
                    onChange={handleChangeSubjects}>
                    {
                      subjectsList.map(subject => {
                        return (
                          <Select.Option value={subject.subject} key={subject.id}>{subject.subject}</Select.Option>
                        )
                      })
                    }
                  </Select>
                </Form.Item> : null}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            <Form.Item label="School Name" required style={{ flex: 1, marginRight: '10px' }}>
              <Input type="text" name="schoolName" value={school} onChange={(e) => setSchool(e.target.value)} />
            </Form.Item>
            <Form.Item label="School Board" required style={{ flex: 1, marginLeft: '10px' }}>
              <Input type="text" name="schoolBoard" value={board} onChange={(e) => setBoard(e.target.value)} />
            </Form.Item>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            {
              teacher != null && !isCreation && (
                <Form.Item label="My Organizations" required style={{ flex: 1, marginRight: '10px' }}>
                  <Select defaultValue={tenant} style={{ width: '100%' }} onChange={(e) => { changeTenant(e) }}>
                    {/* <Option value={'000'}>Add new organization</Option> */}
                    {tenants ? tenants.map(tenant => {
                      return (
                        <Option value={tenant.key}>{tenant.displayName}</Option>
                      )
                    }) : null
                    }
                  </Select>
                </Form.Item>
              )}
            <Form.Item label="Advance Schedules" required style={{ flex: 1, marginRight: '10px' }}>
              <Select value={advanceSchedule} style={{ width: '100%' }} onChange={(e) => { changeAdvanceSchedule(e) }}>
                <Option value={false}>False</Option>
                <Option value={true}>True</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Current Tag" required style={{ flex: 1, marginRight: '10px' }}>
              <Select value={tag} style={{ width: '100%' }} onChange={(e) => { changeTag(e) }}>
                <Option value={'no tag'}>No tag</Option>
                {tags ? tags.map(tag => {
                  return (
                    <Option value={tag.name}>{tag.name}</Option>
                  )
                }) : null
                }
              </Select>
            </Form.Item>
          </div>
          <Form.Item>
            <Button disabled={submitting} type="primary" size="large" htmlType="submit">
              {
                submitting ? 'Loading...' : 'Update a Teacher Profile'
              }
            </Button>
          </Form.Item>
        </Form>
      </PageHeader>
    </div>
  )
}

export default Settings;
