import React, { useState, useEffect, useReducer } from 'react'
import { PageHeader, Button, Select, Form, Input } from 'antd';
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { getTenant, getTeacherProfileByDate } from '../../services/Student';
import { updateTenant } from '../../services/Teacher';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';

const { Option } = Select;

function Tenant(props) {

  const history = useHistory();
  const dispatch = useDispatch();
  const [tenant, setTenant] = useState(null);
  const [name, setName] = useState('');
  const [max, setMax] = useState('');
  const [url, setUrl] = useState('');
  const [videoServer, setVideoServer] = useState('');
  const [welcome, setWelcome] = useState('');
  const [conf, setConf] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [teacherName, setTeacherName] = useState(null);
  const [list, setList] = useState([]);


  useEffect(() => {
    getTeachers();
    let tenant = JSON.parse(localStorage.getItem('tenant' + JSON.parse(localStorage.getItem("user")).id));
    getTenant(tenant).then(data => {
      if (!data) {
        history.push('/settings')
        return
      }
      if (!data.displayName) {
        history.push('/settings')
        return
      }
      setTenant(data)
      setName(data.displayName);
      setVideoServer(data.videoServer);
      setMax(data.maxTeacherPerSupervisor);
      setConf(data.conferenceUrlPrefix);
      setUrl(data.supportUrl);
      setWelcome(data.staticWelcomeUrl);
      setTeacher(data.primaryContact)
      setVideoServer(data.videoServerUrl)
      setTeacherName(data.primaryContact ? data.primaryContact.firstName + " " + data.primaryContact.lastName : '')
    })
  }, []);

  const getTeachers = () => {
    setLoading(true);
    getTeacherProfileByDate(localStorage.getItem('toStart'), localStorage.getItem('toEnd'), 0, 100, 'firstName', 'asc').then(data => {
      if (data) {
        if (data.content) {
          setList(data.content);
        }
      }
    }).finally(() => setLoading(false))
  }

  const handleSubmit = () => {
    if (name == null || url == null || conf == null || teacher == null || max == null) {
      alert('Fill the form');
      return;
    }
    setSubmitting(true);
    updateTenant(tenant.key, name, conf, max, url, videoServer, welcome, teacher).then(data => {
      history.push(`/studentlist`)
    }).catch(err => {
      alert("Error occured when saving data, please retry!")
      console.log(err)
    }).finally(() => setSubmitting(false));
  }

  return (
    <div>
      <PageHeader
        ghost={false}
        title={<p style={{ fontSize: '3em', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>Update Tenant</p>}
        extra={[
        ]}
      >

        <Form
          form={form}
          autoComplete="off"
          onFinish={handleSubmit}
          layout="vertical"
        >
          <div style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            <Form.Item label="Display Name" required style={{ flex: 1, marginRight: '10px' }}>
              <Input type="text" name="displayName" value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Item>
            <Form.Item label="Support URL" required style={{ flex: 1, marginLeft: '10px' }}>
              <Input type="text" name="url" value={url} onChange={(e) => setUrl(e.target.value)} />
            </Form.Item>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            <Form.Item label="Conference Prefix" required style={{ flex: 1, marginRight: '10px' }}>
              <Input type="text" name="conf" value={conf} onChange={(e) => setConf(e.target.value)} />
            </Form.Item>
            <Form.Item label="Max teacher per supervisor" required style={{ flex: 1, marginLeft: '10px' }}>
              <Input type="number" name="max" value={max} onChange={(e) => setMax(e.target.value)} />
            </Form.Item>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            <Form.Item label="Video server" required style={{ flex: 1, marginRight: '10px' }}>
              <Input type="text" name="videoServer" value={videoServer} onChange={(e) => setVideoServer(e.target.value)} />
            </Form.Item>
            <Form.Item label="Static welcome Url" required style={{ flex: 1, marginLeft: '10px' }}>
              <Input type="text" name="welcome" value={welcome} onChange={(e) => setWelcome(e.target.value)} />
            </Form.Item>
            
          </div>

          <Form.Item label="Primary Contact" required style={{ flex: 1, marginLeft: '10px' }}>
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
                onChange={(__, newValue) => {
                  console.log(newValue)
                  setTeacher(newValue);
                }}
                open={open}
                onOpen={() => {
                  setOpen(true);
                }}
                onClose={() => {
                  setOpen(false);
                }}
                loading={loading}
                getOptionLabel={(record) => record.firstName + " " + record.lastName}
                // style={{ minWidth: 450, marginLeft: -250 }}
                renderInput={(params) =>
                  <TextField {...params}
                    variant="outlined"
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

          <Form.Item>
            <Button disabled={submitting} type="primary" size="large" htmlType="submit">
              {
                submitting ? 'Loading...' : 'Update Tenant'
              }
            </Button>
          </Form.Item>
        </Form>
      </PageHeader>
    </div>
  )
}

export default Tenant;
