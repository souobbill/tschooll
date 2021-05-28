import React, { useState } from 'react'
import { Form, Input, Button } from 'antd'
import { SearchOutlined } from "@ant-design/icons"
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';

function SearchFilter({ searchList, profiles, changeProfileInput, changeProfile, open, setOpenTrue, setOpenFalse, loading }) {

    return (
        <Form layout="inline" style={{ marginRight: '20px' }}>

            <Form.Item style={{ width: '400px' }}>
                <Autocomplete
                    id="asynchronous-search"
                    name="name"
                    options={profiles}
                    size="small"
                    onChange={changeProfile}
                    onInputChange={changeProfileInput}
                    open={open}
                    onOpen={setOpenTrue}
                    onClose={setOpenFalse}
                    loading={loading}
                    getOptionLabel={(record) => record.firstName + " " + record.lastName}
                    renderInput={(params) =>
                        <TextField {...params}
                            variant="outlined"
                            placeholder="Name of assistant"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {loading ? <CircularProgress color="inherit" size={10} /> : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                ),
                            }}
                        />
                    }
                />
            </Form.Item>

            <Button onClick={searchList} type="primary">
                <SearchOutlined />
            </Button>
        </Form>
    )

}
export default SearchFilter