import React, { useEffect, useState } from 'react'
import { PageHeader, Form, Input, Button, Radio } from 'antd'
import { useHistory, useLocation } from 'react-router-dom'
import 'antd/dist/antd.css';
import { updateTag } from '../../services/Student'


const UpdateTag = () => {

    const history = useHistory();
    const location = useLocation();

    const [tag, setTag] = useState(location.state.tag);
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [enabled, setEnabled] = useState("");

    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setName(tag.name);
        setEnabled(tag.enabled);
        setUrl(tag.url);
        return () => {
            setName("");
            setEnabled("");
        };
    }, [tag])

    const handleSubmit = () => {
        if (name && enabled) {
            if (name.toString().length <= 0) {
                alert("Please, fill the form 1!");
                return
            }
        } else {
            alert("Please, fill the form 2!");
            return
        }
        setSubmitting(true)

        let data = {
            name: name,
            enabled: enabled,
            url: url,
            id: tag.id
        }
        updateTag(tag.id, data).then(result => {
            history.push(`/tagList`)
        }).finally(() => setSubmitting(false));

    }

    return (
        <div>
            <PageHeader
                ghost={false}
                title={<p style={{ fontSize: '3em', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>Update Tag</p>}
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
                        <Form.Item label="Name" required style={{ flex: 1, marginRight: '40px' }}>
                            <Input type="text" name="name" value={name} onChange={e => setName(e.target.value)} />
                        </Form.Item>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row'
                    }}>
                        <Form.Item label="Enabled" required style={{ flex: 1, marginRight: '10px' }}>
                            <Radio.Group onChange={e => setEnabled(e.target.value)} name="enabled" defaultValue={enabled} >
                                <Radio value={"true"}>True</Radio>
                                <Radio value={"false"}>False</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row'
                    }}>
                        <Form.Item label="Url" style={{ flex: 1, marginRight: '40px' }}>
                            <Input type="url" value={url} name="url" onChange={e => { setUrl(e.target.value); }} />
                        </Form.Item>
                    </div>
                    <Form.Item>
                        <Button disabled={submitting} type="primary" size="large" htmlType="submit">
                            {
                                submitting ? 'Loading...' : 'Update Tag'
                            }
                        </Button>
                    </Form.Item>
                </Form>
            </PageHeader>
        </div>
    )
}
export default UpdateTag;