import 'antd/dist/antd.css';
import { useHistory } from 'react-router-dom'
import '../../Assets/container/StudentList.css'
import { PageHeader, Form, Input, Button, Checkbox } from 'antd';
import React, { useEffect, useState, useReducer } from 'react'
import { createMessage } from '../../services/Teacher';
import { getShortMessagesTemplates } from '../../services/Student'
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextArea from 'antd/lib/input/TextArea';

const formReducer = (state, event) => {
    return {
        ...state,
        [event.name]: event.value
    }
}

function AddMessage(props) {

    const history = useHistory();
    const { params } = props.match;
    const [open, setOpen] = useState(false);
    const [loadingS, setLoadingS] = useState(false);
    const [subject, setSubject] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [asTemplate, setAsTemplate] = useState(false);
    const [isSMS, setIsSMS] = useState(false);
    const [isEmail, setIsEmail] = useState(false);
    const [async, setAsync] = useState(false);
    const [body, setBody] = useState(null);
    const [name, setName] = useState('');
    const [formData, setFormData] = useReducer(formReducer, {});
    const [templates, setTemplates] = useState([]);
    const [template, setTemplate] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getTemplates();
    }, []);

    const handleChange = event => {
        setFormData({
            name: event.target.name,
            value: event.target.value,
        });
    }

    const changeTemplate = (temp) => {
        setTemplate(temp);
        setSubject(temp.subject);
        setBody(temp.body);
    }

    // const changeTemplate = (id) => {
    //     setTemplate()
    // }

    const handleSubmit = () => {
        if (template == null || body == null || subject == null) {
            alert('Fill the form');
            return;
        }
        setSubmitting(true)
        createMessage(params.id, startDate, endDate, body, subject, async, asTemplate, name).then(data => {
            history.push(`/short-messages/${params.id}`)
        }).catch(err => {
            alert("Error occured when saving data, please retry!")
            console.log(err)
        }).finally(() => setSubmitting(false))
    }

    const getTemplates = () => {
        setLoadingS(true);
        getShortMessagesTemplates(params.id, 0, 100, 'firstName', 'asc').then(data => {
            if (data) {
                if (data.content) {
                    setTemplates(data.content);
                }
            }
        }).finally(() => setLoadingS(false))
    }

    return (

        <div>
            <PageHeader
                ghost={false}
                title={<p style={{ fontSize: '3em', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>Create Message</p>}
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
                        <Form.Item label="Message Template" required style={{ flex: 1, marginRight: '10px' }}>
                            <Autocomplete
                                id="asynchronous-search"
                                options={templates}
                                size="small"
                                inputValue={template}
                                // closeIcon={<EditOutlined style={{ color: 'blue' }}/>}
                                onInputChange={(__, newInputValue) => {
                                    setTemplate(newInputValue);
                                }}
                                onChange={(__, newValue) => {
                                    changeTemplate(newValue);
                                }}
                                open={open}
                                onOpen={() => {
                                    setOpen(true);
                                }}
                                onClose={() => {
                                    setOpen(false);
                                }}
                                loading={loadingS}
                                getOptionLabel={(record) => record.name}
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
                            <Input type="text" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                        </Form.Item>
                    </div>
                    <Form.Item label="Name" required style={{ flex: 1, marginLeft: '10px' }}>
                        <Input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </Form.Item>
                    <Form.Item label="Body" required>
                        <TextArea type="text" name="body" value={body} onChange={(e) => setBody(e.target.value)} />
                    </Form.Item>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Form.Item label="Save as template" required>
                            <Checkbox onChange={(e) => setAsTemplate(e.target.checked)} />
                        </Form.Item>
                        <Form.Item label="send as SMS" required>
                            <Checkbox onChange={(e) => setIsSMS(e.target.checked)} />
                        </Form.Item>
                        <Form.Item label="send as Email" required>
                            <Checkbox onChange={(e) => setIsEmail(e.target.checked)} />
                        </Form.Item>
                    </div>
                    <Form.Item>
                        <Button onClick={() => handleSubmit} disabled={submitting} type="primary" size="large" htmlType="submit">
                            {
                                submitting ? 'Loading...' : 'Create a Message'
                            }
                        </Button>
                    </Form.Item>
                </Form>
            </PageHeader>
        </div>
    )
}
export default AddMessage
