import React, { useEffect, useState, useReducer } from 'react'
import { PageHeader, Form, Input, Button, Select } from 'antd';
import CreatableSelect from 'react-select/creatable';
import 'antd/dist/antd.css';
import '../../Assets/container/StudentList.css'
import { createSchedule } from '../../services/Teacher'
import { getSchedule } from '../../services/Student'
import { useHistory } from 'react-router-dom'

const { TextArea } = Input;

const formReducer = (state, event) => {
    return {
        ...state,
        [event.name]: event.value
    }
}
const OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

function CreateSchedule() {

    const history = useHistory();
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [isCreation, setIsCreation] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState(OPTIONS);
    const [grades, setGrades] = useState([]);
    const [subject, setSubject] = useState('');
    const [formData, setFormData] = useReducer(formReducer, {});
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const [duration, setDuration] = useState('');
    const [repeatPeriod, setRepeatPeriod] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [currency, setCurrency] = useState('');
    const [language, setLanguage] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [advanceSchedule, setAdvanceSchedule] = useState(false);

    useEffect(() => {
        getSubjects();
        setCurrency("USD");
        setLanguage("fr");
        setAdvanceSchedule(JSON.parse(localStorage.getItem('advanceSchedule' + JSON.parse(localStorage.getItem("user")).id)));
    }, []);

    const handleChange = event => {
        setFormData({
            name: event.target.name,
            value: event.target.value,
        });
    }

    const getSubjects = () => {
        getSchedule(1).then(data => {
            var obj = {};
            for (var i = 0, len = data.content.length; i < len; i++)
                obj[data.content[i]['subject']] = data.content[i];

            data.content = new Array();
            for (var key in obj)
                data.content.push(obj[key]);
            setSubjects(data.content)
        });
    }

    const handleChangeSelect = (value) => {
        setGrades(value.toString().split(',').map(i => Number(i)));
    }

    useEffect(() => {
        setFilteredOptions(OPTIONS.filter(o => !grades.includes(Number(o))));
    }, [grades]);

    const handleChangeSubjects = (value) => {
        setSelectedSubjects(value);
    }

    const handleChangeCurrency = (value) => {
        setCurrency(value);
    }

    const handleChangeLanguage = (value) => {
        setLanguage(value);
    }

    const handleSubmit = () => {

        if (formData.startDate) {
            if (formData.startDate.toString().length <= 0
            ) {
                alert("Please, fill the form 1!");
                return
            }
        } else {
            alert("Please, fill the form 2!");
            return
        }
        setSubmitting(true)

        if (advanceSchedule)
            if (formData.endDate < formData.startDate) {
                alert("Start date cannot be after end date");
                setSubmitting(false);
                return
            }
        let date = new Date(formData.startDate + "T" + formData.startTime + ":00");
        let d = (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getDate().toString().padStart(2, '0') + '/' + date.getFullYear() + ' ' + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + ':00 -0500';

        let f = d;
        if (advanceSchedule) {
            let date1 = new Date(formData.endDate + "T" + formData.startTime + ":00");
            f = (date1.getMonth() + 1).toString().padStart(2, '0') + '/' + date1.getDate().toString().padStart(2, '0') + '/' + date1.getFullYear() + ' ' + date1.getHours().toString().padStart(2, '0') + ':' + date1.getMinutes().toString().padStart(2, '0') + ':00 -0500';
        }

        let data = [];
        let tenant = JSON.parse(localStorage.getItem("tenant" + JSON.parse(localStorage.getItem("user")).id));

        if (isCreation) {
            data.push(
                {
                    subject: subject.value,
                    startDate: d,
                    endDate: f,
                    grades: grades,
                    durationInMinutes: duration,
                    repeatPeriodInDays: repeatPeriod,
                    name: name,
                    description: description,
                    currency: currency,
                    language: language,
                    price: price,
                    imageUrl: imageUrl,
                    tenant: {
                        "key": tenant
                    }
                })
        } else {
            selectedSubjects.forEach(s => data.push(
                {
                    subject: s.value,
                    startDate: d,
                    endDate: f,
                    grades: grades,
                    durationInMinutes: duration,
                    repeatPeriodInDays: repeatPeriod,
                    name: name,
                    description: description,
                    currency: currency,
                    language: language,
                    price: price,
                    imageUrl: imageUrl,
                    tenant: {
                        "key": tenant
                    }
                }))
        }
        createSchedule(data).then(result => {
            history.push(`/schedules`)
        }).finally(() => setSubmitting(false));
    }

    const handleSubjectChange = (newValue, __) => {
        setSelectedSubjects([...newValue.map(s => (
            {
                ...s,
                id: s.id ? s.id : subjects.length + 1
            }
        ))]);
    };

    return (

        <div>
            <PageHeader
                ghost={false}
                title={<p style={{ fontSize: '3em', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>Create Schedule</p>}
                extra={[
                ]}
            >
                <Form
                    form={form}
                    autoComplete="off"
                    onFinish={handleSubmit}
                    layout="vertical"
                    onKeyPress={event => {
                        if (event.which === 13 /* Enter */) {
                            event.preventDefault();
                        }
                    }}
                    style={{ width: '80%', marginLeft: '10%' }}
                >
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row'
                    }}>
                        <Form.Item label="Subjects" required style={{ flex: 1, marginRight: '10px' }}>
                            <CreatableSelect
                                isMulti
                                onChange={handleSubjectChange}
                                options={subjects.map(s => ({ value: s.subject, label: s.subject }))}
                            />
                        </Form.Item>
                        {advanceSchedule && (
                            <Form.Item label="Name" required style={{ flex: 1, marginRight: '10px' }}>
                                <Input type="text" name="name" onChange={(e) => setName(e.target.value)} />
                            </Form.Item>
                        )}

                        <Form.Item label="Duration (in minutes)" required style={{ flex: 1, marginRight: '10px' }}>
                            <Input type="number" min={0} name="durationInMinutes" step={10} onChange={(e) => setDuration(e.target.value)} />
                        </Form.Item>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'row'
                    }}>
                        <Form.Item label="Start date" required style={{ flex: 1, marginRight: '10px' }}>
                            <Input type="date" name="startDate" onChange={handleChange} />
                        </Form.Item>
                        <Form.Item label="Start time" required style={{ flex: 1, marginRight: '10px' }}>
                            <Input type="time" name="startTime" onChange={handleChange} />
                        </Form.Item>
                        <Form.Item label="Grades" required
                            onClick={() => setOpen2(open2 ? false : true)}
                            style={{ flex: 1, marginRight: '10px' }}>
                            <Select
                                mode="multiple"
                                allowClear
                                open={open2}
                                value={grades}
                                onFocus={() => setOpen2(true)}
                                onBlur={() => setOpen2(false)}
                                onSelect={() => setOpen2(false)}
                                placeholder="Please select grades"
                                onChange={handleChangeSelect}
                            >
                                {filteredOptions.map(item => (
                                    <Select.Option key={item} value={item}>
                                        {item}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>
                    {advanceSchedule && (
                        <>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row'
                            }}>
                                <Form.Item label="Image Url" required style={{ flex: 1, marginRight: '10px' }}>
                                    <Input type="text" name="imageUrl" onChange={(e) => setImageUrl(e.target.value)} />
                                </Form.Item>
                                <Form.Item label="End date" required style={{ flex: 1, marginRight: '10px' }}>
                                    <Input type="date" name="endDate" onChange={handleChange} />
                                </Form.Item>
                                <Form.Item label="Repeat period (in days)" required style={{ flex: 1, marginRight: '10px' }}>
                                    <Input type="number" min={0} name="repeatPeriodInDays" onChange={(e) => setRepeatPeriod(e.target.value)} />
                                </Form.Item>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'row'
                            }}>
                                <Form.Item label="Price" required style={{ flex: 1, marginRight: '10px' }}>
                                    <Input type="number" min={0} name="price" onChange={(e) => setPrice(e.target.value)} />
                                </Form.Item>
                                <Form.Item label="Currency" required style={{ flex: 1, marginRight: '10px' }}>
                                    <Select defaultValue={"USD"} onChange={handleChangeCurrency}>
                                        <Select.Option value={"USD"} name="currency">USD</Select.Option>
                                        <Select.Option value={"CAD"} name="currency">CAD</Select.Option>
                                        <Select.Option value={"EUR"} name="currency">EUR</Select.Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item label="Language" required style={{ flex: 1, marginRight: '10px' }}>
                                    <Select defaultValue={"fr"} onChange={handleChangeLanguage}>
                                        <Select.Option value={"fr"} name="language">French</Select.Option>
                                        <Select.Option value={"en"} name="language">English</Select.Option>
                                        <Select.Option value={"de"} name="language">German</Select.Option>
                                        <Select.Option value={"es"} name="language">Spanish</Select.Option>
                                    </Select>
                                </Form.Item>
                            </div>

                            <Form.Item label="Description" required style={{ flex: 1, marginRight: '10px' }}>
                                <TextArea rows={3} name="description" onChange={(e) => setDescription(e.target.value)} />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item>
                        <Button disabled={submitting} type="primary" size="large" htmlType="submit">
                            {
                                submitting ? 'Loading...' : 'Create a Schedule'
                            }
                        </Button>
                    </Form.Item>
                </Form>
            </PageHeader>
        </div>
    )
}
export default CreateSchedule
