import 'antd/dist/antd.css';
import PhoneInput from 'react-phone-input-2';
import { useHistory } from 'react-router-dom';
import '../../Assets/container/StudentList.css';
import { PageHeader, Form, Input, Button } from 'antd';
import 'react-phone-input-2/lib/bootstrap.css'
import "react-phone-input-2/lib/bootstrap.css";
import { createParent } from '../../services/Teacher';
import { getCountry } from '../../services/Student';
import React, { useEffect, useState, useReducer } from 'react'

const formReducer = (state, event) => {
    return {
        ...state,
        [event.name]: event.value
    }
}

function CreateParent() {

    const history = useHistory();
    const [country, setCountry] = useState(null)
    const [phone, setPhone] = useState('')
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useReducer(formReducer, {});
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getCountry().then(data => {
            setCountry(data.countryCode.toString().toLowerCase());
        })
    }, []);

    const handleChange = event => {
        setFormData({
            name: event.target.name,
            value: event.target.value,
        });
    }

    const handleSubmit = () => {

        if (formData.firstName && formData.lastName && formData.email && phone && code) {
            if (
                formData.email.toString().length <= 0
                || phone.toString().length <= 0
                || formData.firstName.toString().length <= 0
                || formData.lastName.toString().length <= 0
                || code.toString().length <= 0
            ) {
                alert("Please, fill the form!");
                return
            }
        } else {
            alert("Please, fill the form!");
            return
        }

        setSubmitting(true);

        createParent(formData.firstName, formData.lastName, phone, code, formData.email).then(data => {
            history.push(`/parentProfiles`)
        }).catch(err => {
            alert("Error occured when saving data, please retry!")
            console.log(err)
        })
            .finally(() => setSubmitting(false));
    }

    return (

        <div>
            <PageHeader
                ghost={false}
                title={<p style={{ fontSize: '3em', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>Create Parent</p>}
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
                        <Form.Item label="First Name" required style={{ flex: 1, marginRight: '10px' }}>
                            <Input type="text" name="firstName" onChange={handleChange} />
                        </Form.Item>
                        <Form.Item label="Last Name" required style={{ flex: 1, marginLeft: '10px' }}>
                            <Input type="text" name="lastName" onChange={handleChange} />
                        </Form.Item>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row'
                    }}>
                        <Form.Item label="Email" required style={{ flex: 1, marginRight: '10px' }}>
                            <Input type="email" name="email" onChange={handleChange} />
                        </Form.Item>
                        <Form.Item label="Phone Number" required style={{ flex: 1, marginLeft: '10px' }}>
                            {/* <Input type="number" name="phoneCode" onChange={handleChange} /> */}
                            {/* {country == null ? <p>Loading...</p> : */}
                            <PhoneInput
                                enableSearch
                                countryCodeEditable={false}
                                disableCountryCode={false}
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
                                country={country}
                                // value={phone}
                                onChange={(value, country, e, formattedValue) => {
                                    setCode(country.dialCode);
                                    let index = value.indexOf(country.dialCode);
                                    setPhone(value.slice(0, index) + value.slice(index + country.dialCode.length))
                                }}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item>
                        <Button disabled={submitting} type="primary" size="large" htmlType="submit">
                            {
                                submitting ? 'Loading...' : 'Create a Parent'
                            }
                        </Button>
                    </Form.Item>
                </Form>
            </PageHeader>
        </div>
    )
}
export default CreateParent;
