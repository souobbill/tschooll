import React, { useState } from 'react'
import { Form, Input, Button } from 'antd'
import { SearchOutlined } from "@ant-design/icons"
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';

function SearchFilter ({ changeInput, searchList, tagList, tag, changeTagInput, changeTag, tagOpen, setOpenTrue, setOpenFalse, tagToading}) {

    return(
        <Form layout="inline" style={{ marginRight: '20px' }}>
            <Form.Item>
                <Input
                    type="text"
                    placeholder="Enter Tag Name"
                    name="name"
                    onChange={changeInput}
                />
            </Form.Item>
            {/* <Form.Item>
                <Input
                    type='date'
                    placeholder="Create date"
                    name="createDate"
                    onChange={changeInput}
                />
            </Form.Item> */}
            {/* <Form.Item style={{ width: '200px'}}>
                <Autocomplete
                    id="asynchronous-search"
                    name="tag"
                    options={tagList}
                    size="small"
                    
                    inputValue={ tag }
                    onChange={changeTag}
                    onInputChange={changeTagInput}
                    open={tagOpen}
                    onOpen={setOpenTrue}
                    onClose={setOpenFalse}
                    loading={tagToading}
                    getOptionLabel={(record) =>record.name}
                    renderInput={(params) =>
                        <TextField {...params}
                            variant="outlined"
                            placeholder="Current tag"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {tagToading ? <CircularProgress color="inherit" size={10} /> : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                ),
                            }}
                        />
                    }
                    />
            </Form.Item> */}

            <Button onClick={searchList} type="primary">
                <SearchOutlined />
            </Button>
        </Form>
    )

}
export default SearchFilter