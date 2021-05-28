import React, { useEffect, useState, useReducer } from 'react'
import { PageHeader, Form, Input, Button, Select } from 'antd';
import 'antd/dist/antd.css';
import '../../Assets/container/StudentList.css'
import CreatableSelect from 'react-select/creatable';
import { updateSchedule } from '../../services/Teacher'
import { getSchedule } from '../../services/Student'
import { useHistory, useLocation } from 'react-router-dom'
import Moment from 'react-moment';

const { TextArea } = Input;

const formReducer = (state, event) => {
    return {
        ...state,
        [event.name]: event.value
    }
}

function UpdateSchedule() {

    const history = useHistory();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [schedule, setSchedule] = useState(location.state.schedule);
    const [open2, setOpen2] = useState(false);
    const [isCreation, setIsCreation] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [grades, setGrades] = useState([]);
    const [sDate, setSDate] = useState('');
    const [sTime, setSTime] = useState('');
    const [duration, setDuration] = useState('');
    const [repeatPeriod, setRepeatPeriod] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [currency, setCurrency] = useState('');
    const [language, setLanguage] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [eDate, setEDate] = useState('');
    const [subject, setSubject] = useState('');
    const [formData, setFormData] = useReducer(formReducer, {});
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [advanceSchedule, setAdvanceSchedule] = useState(false);

    useEffect(() => {
        setAdvanceSchedule(JSON.parse(localStorage.getItem('advanceSchedule' + JSON.parse(localStorage.getItem("user")).id)));
        let s = schedule.startDate.replaceAll('/', '-').split(' ')[0].split('-');
        let f = schedule.endDate.replaceAll('/', '-').split(' ')[0].split('-');
        let st = schedule.startDate.replaceAll('/', '-').split(' ')[1].split(':');
        getSubjects();
        setSDate(s[2] + '-' + s[0] + '-' + s[1]);
        setEDate(f[2] + '-' + f[0] + '-' + f[1]);
        setSTime(st[0] + ':' + st[1]);
        //formData.endDate = schedule.endDate;
        setSelectedSubjects([{ value: schedule.subject, label: schedule.subject, id: subjects.length + 1 }]);
        setDuration(schedule.durationInMinutes);
        setRepeatPeriod(schedule.repeatPeriodInDays);
        setName(schedule.name);
        setDescription(schedule.description);
        setCurrency(schedule.currency);
        setLanguage(schedule.language);
        setPrice(schedule.price);
        setImageUrl(schedule.imageUrl);
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

    const handleChangeSubjects = (value) => {
        setSelectedSubjects(value);
    }

    const handleChangeCurrency = (value) => {
        setCurrency(value);
    }

    const handleChangeLanguage = (value) => {
        setLanguage(value);
    }

    const handleSubjectChange = (newValue, __) => {
        setSelectedSubjects([{
            ...newValue,
            id: newValue.id ? newValue.id : subjects.length + 1
        }]);
    };

    const handleSubmit = () => {
        if (sDate) {
            if (sDate.toString().length <= 0
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
            if (eDate < sDate) {
                alert("Start date cannot be after end date");
                setSubmitting(false);
                return
            }

        let date = new Date(sDate + "T" + sTime + ":00");
        let d = (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getDate().toString().padStart(2, '0') + '/' + date.getFullYear() + ' ' + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + ':00 +0000';
        //let d = (date.getUTCMonth() + 1).toString().padStart(2, '0') + '/' + date.getUTCDate().toString().padStart(2, '0') + '/' + date.getUTCFullYear() + ' ' + date.getUTCHours().toString().padStart(2, '0') + ':' + date.getUTCMinutes().toString().padStart(2, '0') + ':00 +0000';

        date = new Date(eDate + "T" + sTime + ":00");

        let f = d;

        if (advanceSchedule)
            f = (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getDate().toString().padStart(2, '0') + '/' + date.getFullYear() + ' ' + date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + ':00 +0000';

        let data = [];
        let tenant = JSON.parse(localStorage.getItem("tenant" + JSON.parse(localStorage.getItem("user")).id));


        updateSchedule(schedule.id, {
            subject: selectedSubjects[0].value,
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
        }).then(result => {
            history.push(`/schedules`)

        }).finally(() => setSubmitting(false));
    }

    return (

        <div>
            <PageHeader
                ghost={false}
                title={<p style={{ fontSize: '3em', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>Update Schedule</p>}
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
                                value={selectedSubjects[0]}
                                onChange={handleSubjectChange}
                                options={subjects.map(s => ({ value: s.subject, label: s.subject }))}
                            />
                        </Form.Item>
                        {advanceSchedule && (
                            <Form.Item label="Name" required style={{ flex: 1, marginRight: '10px' }}>
                                <Input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </Form.Item>
                        )}

                        <Form.Item label="Duration (in minutes)" required style={{ flex: 1, marginRight: '10px' }}>
                            <Input type="number" min={0} name="durationInMinutes" step={10} value={duration} onChange={(e) => setDuration(e.target.value)} />
                        </Form.Item>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'row'
                    }}>
                        <Form.Item label="Start date" required style={{ flex: 1, marginRight: '10px' }}>
                            <Input type="date" name="startDate" onChange={(e) => setSDate(e.target.value)} value={sDate} />
                        </Form.Item>
                        <Form.Item label="Start time" required style={{ flex: 1, marginRight: '10px' }}>
                            <Input type="time" name="startTime" onChange={(e) => setSTime(e.target.value)} value={sTime} />
                        </Form.Item>
                        <Form.Item label="Grades" required
                            onClick={() => setOpen2(open2 ? false : true)} style={{ flex: 1, marginRight: '10px' }}>
                            <Select
                                mode="multiple"
                                allowClear
                                defaultValue={schedule.grades}
                                open={open2}
                                onFocus={() => setOpen2(true)}
                                onBlur={() => setOpen2(false)}
                                onSelect={() => setOpen2(false)}
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
                    </div>
                    {advanceSchedule && (
                        <>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row'
                            }}>
                                <Form.Item label="Image Url" required style={{ flex: 1, marginRight: '10px' }}>
                                    <Input type="text" name="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                                </Form.Item>
                                <Form.Item label="End date" required style={{ flex: 1, marginRight: '10px' }}>
                                    <Input type="date" name="endDate" onChange={(e) => setEDate(e.target.value)} value={eDate} />
                                </Form.Item>
                                <Form.Item label="Repeat period (in days)" required style={{ flex: 1, marginRight: '10px' }}>
                                    <Input type="number" min={0} name="repeatPeriodInDays" value={repeatPeriod} onChange={(e) => setRepeatPeriod(e.target.value)} />
                                </Form.Item>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row'
                            }}>
                                <Form.Item label="Price" required style={{ flex: 1, marginRight: '10px' }}>
                                    <Input type="number" min={0} name="price" value={price} onChange={(e) => setPrice(e.target.value)} />
                                </Form.Item>
                                <Form.Item label="Currency" required style={{ flex: 1, marginRight: '10px' }}>
                                    <Select value={currency} onChange={handleChangeCurrency}>
                                        <Select.Option value={"USD"} name="currency">USD</Select.Option>
                                        <Select.Option value={"CAD"} name="currency">CAD</Select.Option>
                                        <Select.Option value={"EUR"} name="currency">EUR</Select.Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item label="Language" required style={{ flex: 1, marginRight: '10px' }}>
                                    <Select value={language} onChange={handleChangeLanguage}>
                                        <Select.Option value={"fr"} name="language">French</Select.Option>
                                        <Select.Option value={"en"} name="language">English</Select.Option>
                                        <Select.Option value={"de"} name="language">German</Select.Option>
                                        <Select.Option value={"es"} name="language">Spanish</Select.Option>
                                    </Select>
                                </Form.Item>
                            </div>
                            <Form.Item label="Description" required style={{ flex: 1, marginRight: '10px' }}>
                                <TextArea rows={3} name="description" value={schedule.description} onChange={handleChange} />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item>
                        <Button disabled={submitting} type="primary" size="large" htmlType="submit">
                            {
                                submitting ? 'Loading...' : 'Update Schedule'
                            }
                        </Button>
                    </Form.Item>
                </Form>
            </PageHeader>
        </div>
    )
}
export default UpdateSchedule;
