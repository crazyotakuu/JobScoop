import React, { useState, useEffect, useContext } from 'react';
import {
    Button, ButtonGroup, Snackbar, Alert, Box, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Backdrop, CircularProgress, IconButton, Tooltip,
    Switch, TextField, InputAdornment, styled
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { cloneDeep } from "lodash";
import _ from "lodash";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./Subscribe.css";

const StyledSwitch = styled(Switch)(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    display: 'flex',
    '& .MuiSwitch-switchBase': {
        padding: 1,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#4caf50',
                opacity: 1,
                border: 0,
            },
        },
        '&.Mui-disabled': {
            color: theme.palette.action.disabled,
            '& + .MuiSwitch-track': {
                opacity: 0.5,
            },
        },
    },
    '& .MuiSwitch-thumb': {
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, .2)',
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundColor: '#fff',
        '&.Mui-disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
        },
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: '#ccc',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 300,
        }),
    },
}));



function Subscribe() {
    const [Editenable, setEditenable] = useState(false);
    const [loading, setloading] = useState(true);
    const [options, setoptions] = useState({});
    const [errorlist, seterrorlist] = useState([])
    const [roleoptions, setroleoptions] = useState([]);
    const [companyoptions, setcomapnyoptions] = useState([]);
    const [urloptions, seturloptions] = useState([]);
    const [subscribelist, setsubscribelist] = useState([]);
    const [subscribelistbkp, setsubscribelistbkp] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    const [snackAlert, setsnackAlert] = useState({
        open: false,
        severity: 'success',
        msg: ''
    });

    // Existing functionality code remains unchanged
    const onChange = (event, index) => {
        const { name, value } = event.target;
        let temp = cloneDeep(subscribelist);
        temp[index][name] = value;
        if (name == 'companyName') {
            temp[index]['careerLinks'] = []
            let opt = []
            temp.forEach((item, index) => {
                if (((Object.keys(options.companies)).length > 0 && (Object.keys(options.companies)).includes(item.companyName))) {
                    opt.push(options.companies[item.companyName])
                }
                else {
                    opt.push([])
                }
            });
            seturloptions(opt)
        }
        setsubscribelist(temp);
    };

    const clear = (event, index) => {
        const { name, value } = event.target;
        let temp = cloneDeep(subscribelist);
        temp[index][name] = '';
        setsubscribelist(temp);
    };

    const onMultiSelectChange = (event, index, name) => {
        let selectedValue = event.target.value.trim();
        let temp = cloneDeep(subscribelist);
        let listcheck = []
        console.log("check the values", name, index, event)
        if (name == 'roleNames') {
            listcheck = roleoptions
        }
        else {
            listcheck = urloptions[index]
        }
        if (listcheck?.includes(selectedValue)) {
            if (temp[index][name]?.includes(selectedValue)) {
                temp[index][name] = temp[index][name].filter((role) => role !== selectedValue);
            } else {
                temp[index][name].push(selectedValue);
            }
            event.target.value = "";
            setsubscribelist(temp);
        }
    };

    const handleEnterKey = (event, index, name) => {
        if (event.key === "Enter") {
            let customValue = event.target.value.trim();
            let temp = cloneDeep(subscribelist);

            if (customValue && !temp[index][name]?.includes(customValue)) {
                temp[index][name].push(customValue);
            }

            event.target.value = "";
            setsubscribelist(temp);
            event.preventDefault();
        }
    };

    const removeTag = (index, tagIndex, name) => {
        if (Editenable) {
            let temp = cloneDeep(subscribelist);
            temp[index][name].splice(tagIndex, 1);
            setsubscribelist(temp);
        }
    };

    const validateInputs = () => {
        let temp = cloneDeep(subscribelist);
        let valid = true;
        let err = []

        temp.forEach((item, index) => {
            const companyNameErr = item.companyName === '';
            const urlErr = item.careerLinks.length === 0;
            const roleNamesErr = item.roleNames.length === 0;
            let obj = { companyNameErr: companyNameErr, urlerr: urlErr, roleNamesErr: roleNamesErr }
            err.push(obj)

            temp[index].companyNameerr = companyNameErr;
            temp[index].urlerr = urlErr;
            temp[index].roleNameserr = roleNamesErr;

            if (companyNameErr || urlErr || roleNamesErr) {
                valid = false;
            }
        });
        seterrorlist(err)

        return { valid, validatedData: temp };
    };


    const UpdateSubscriptions = async (subscribePayload) => {
        try {
            const response = await axios.put('http://localhost:8080/update-subscriptions', subscribePayload);
            return response
        } catch (error) {
            console.error('Error fetching data:', error);
            return { status: 401, msg: 'Update Failed try later' }
        }
    }

    const handleClose = () => {
        setsnackAlert({
            open: false,
            severity: '',
            msg: ''
        })
    };

    const OnDelete = async (e, index) => {
        let user = JSON.parse(localStorage.getItem('user'))

        let payload = {
            email: user.username,
            subscriptions: [subscribelist[index]['companyName']]
        }

        try {
            const response = await axios.post('http://localhost:8080/delete-subscriptions', payload);
            setsnackAlert({
                open: true,
                severity: 'success',
                msg: 'Delete Successful'
            })
        } catch (error) {
            console.error('Error fetching data:', error);
            setsnackAlert({
                open: true,
                severity: 'error',
                msg: 'Delete Failed'
            })
        }
        LoadSubscriptionData()
    }

    const OnModifyClick = async (e) => {
        if (Editenable) {
            if (!_.isEqual(subscribelist, subscribelistbkp)) {
                let user = JSON.parse(localStorage.getItem('user'))
                const { valid, validatedData } = validateInputs();

                if (valid) {
                    let payload = {
                        email: user.username,
                        subscriptions: cloneDeep(subscribelist)
                    }
                    let res = await UpdateSubscriptions(payload)

                    if (res.status == 200) {
                        setsnackAlert({
                            open: true,
                            severity: 'success',
                            msg: 'Update Successful'
                        })
                    }
                    else {
                        setsnackAlert({
                            open: true,
                            severity: 'error',
                            msg: 'Update Failed'
                        })
                    }
                    LoadSubscriptionData()
                    getoptions()
                }
                else {
                    setsubscribelist(subscribelistbkp)
                    setsnackAlert({
                        open: true,
                        severity: 'error',
                        msg: 'Invalid Data.. please try again'
                    })
                }
            }
        }
        setEditenable(!Editenable)
    };

    const LoadSubscriptionData = async () => {
        try {
            let user = JSON.parse(localStorage.getItem('user'))
            let payload = { email: user.username }
            const response = await axios.post('http://localhost:8080/fetch-user-subscriptions', payload);

            if (response.status == 200) {
                // Add active status to each subscription if it doesn't exist
                const subscriptionsWithActive = response.data.subscriptions.map(sub => ({
                    ...sub,
                    // active: sub.hasOwnProperty('active') ? sub.active : true
                }));

                setloading(false);
                setsubscribelist(subscriptionsWithActive);
                setsubscribelistbkp(subscriptionsWithActive);
                let arr = []
                subscriptionsWithActive.forEach((item) => {
                    arr.push({ companyNameErr: false, urlerr: false, roleNamesErr: false })
                })
                seterrorlist(arr)
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setloading(false);
            setsnackAlert({
                open: true,
                severity: 'error',
                msg: 'Failed to fetch data... Please try again'
            })
        }
    }

    const getoptions = async () => {
        try {
            let user = JSON.parse(localStorage.getItem('user'))
            let payload = { email: user.username }
            const response = await axios.get('http://localhost:8080/fetch-all-subscriptions');

            if (response.status == 200) {
                setoptions(response.data)
                setroleoptions(response.data.roles)
                setcomapnyoptions(Object.keys(response.data.companies))
                seturloptions([])
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setsnackAlert({
                open: true,
                severity: 'error',
                msg: 'Error to load the page... Please try again'
            })
        }
    }

    const handleToggleChange = (index) => {
        if (Editenable) {
            let temp = cloneDeep(subscribelist);
            temp[index].active = !temp[index].active;
            setsubscribelist(temp);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredSubscribeList = subscribelist.filter(sub => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (sub.companyName && sub.companyName.toLowerCase().includes(searchLower)) ||
            (sub.roleNames && sub.roleNames.some(role => role.toLowerCase().includes(searchLower))) ||
            (sub.careerLinks && sub.careerLinks.some(link => link.toLowerCase().includes(searchLower)))
        );
    });

    useEffect(() => {
        LoadSubscriptionData()
        getoptions()
    }, []);

    return (
        <div className="main-container container-fluid p-0">
            {loading ? (
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={loading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            ) : (
                <>
                    <div className="row m-0">
                        <div className="col-md-12 p-4">
                            <div className="card shadow-sm border-0">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="fw-bold m-0 text-primary">MANAGE YOUR SUBSCRIPTIONS</h4>
                                        <div>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                onClick={() => { navigate("/subscribe/addsubscriptions") }}
                                                className="me-2"
                                                sx={{
                                                    backgroundColor: '#4caf50',
                                                    '&:hover': { backgroundColor: '#388e3c' },
                                                    textTransform: 'none',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Add Subscriptions
                                            </Button>
                                            <Button
                                                variant="contained"
                                                startIcon={<EditIcon />}
                                                onClick={(e) => { OnModifyClick(e) }}
                                                sx={{
                                                    backgroundColor: Editenable ? '#ff9800' : '#2196f3',
                                                    '&:hover': { backgroundColor: Editenable ? '#f57c00' : '#1976d2' },
                                                    textTransform: 'none',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {Editenable ? "Save Changes" : "Modify"}
                                            </Button>
                                        </div>
                                    </div>

                                    <Box sx={{ mb: 3, maxWidth: '600px' }}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Search by company, role, or career link..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            size="small"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon color="primary" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    backgroundColor: '#f8f9fa',
                                                }
                                            }}
                                        />
                                    </Box>

                                    <TableContainer component={Paper} elevation={0} className="border">
                                        <Table>
                                            <TableHead sx={{ backgroundColor: "#3f51b5" }}>
                                                <TableRow>
                                                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Company Name</TableCell>
                                                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Career Links</TableCell>
                                                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Job Roles</TableCell>
                                                    <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>Active</TableCell>
                                                    <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredSubscribeList != null && filteredSubscribeList.length > 0 ? (
                                                    filteredSubscribeList.map((data, index) => {
                                                        const originalIndex = subscribelist.findIndex(item =>
                                                            item.companyName === data.companyName &&
                                                            JSON.stringify(item.roleNames) === JSON.stringify(data.roleNames)
                                                        );

                                                        return (
                                                            <TableRow key={index} hover>
                                                                {/* Company Name Input */}
                                                                <TableCell>
                                                                    <div className="position-relative">
                                                                        <input
                                                                            type="text"
                                                                            id={`companyName-${originalIndex}`}
                                                                            name="companyName"
                                                                            list="companyName-options"
                                                                            className={`form-control ${errorlist[originalIndex]?.companyNameerr ? "is-invalid" : ""}`}
                                                                            placeholder="Select or type a company"
                                                                            value={data.companyName}
                                                                            onClick={(e) => Editenable && clear(e, originalIndex)}
                                                                            onFocus={(e) => Editenable && clear(e, originalIndex)}
                                                                            onChange={(e) => onChange(e, originalIndex)}
                                                                            disabled={!Editenable}
                                                                        />
                                                                        <datalist id="companyName-options">
                                                                            {companyoptions.map((item) => (
                                                                                <option key={item} value={item} />
                                                                            ))}
                                                                        </datalist>
                                                                    </div>
                                                                </TableCell>

                                                                {/* Career Links Input */}
                                                                <TableCell>
                                                                    <div className={`multi-select rounded ${data.roleNameserr ? "border-danger" : "border"}`}>
                                                                        {data.careerLinks.map((role, tagIndex) => (
                                                                            <span key={role} className="tag bg-light text-primary rounded-pill px-2 py-1 me-1 mb-1 d-inline-flex align-items-center">
                                                                                {role}
                                                                                {Editenable && (
                                                                                    <span className="ms-1 cursor-pointer" onClick={() => removeTag(originalIndex, tagIndex, "careerLinks")}>
                                                                                        ×
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        ))}
                                                                        <input
                                                                            type="text"
                                                                            name='carrerLinks'
                                                                            id={`careerLinks-${originalIndex}`}
                                                                            list={`carrer-options-${originalIndex}`}
                                                                            className="multi-input border-0 flex-grow-1"
                                                                            placeholder={Editenable ? "Select or type..." : ""}
                                                                            onInput={(e) => onMultiSelectChange(e, originalIndex, "careerLinks")}
                                                                            onKeyDown={(e) => handleEnterKey(e, originalIndex, "careerLinks")}
                                                                            disabled={!Editenable}
                                                                        />
                                                                    </div>
                                                                    <datalist id={`carrer-options-${originalIndex}`}>
                                                                        {(urloptions[originalIndex] != undefined ? urloptions[originalIndex] : []).map((role) => (
                                                                            <option key={role} value={role} />
                                                                        ))}
                                                                    </datalist>
                                                                </TableCell>

                                                                {/* Job Roles Multi-Select */}
                                                                <TableCell>
                                                                    <div className={`multi-select rounded ${data.roleNameserr ? "border-danger" : "border"}`}>
                                                                        {data.roleNames.map((role, tagIndex) => (
                                                                            <span key={role} className="tag bg-light text-primary rounded-pill px-2 py-1 me-1 mb-1 d-inline-flex align-items-center">
                                                                                {role}
                                                                                {Editenable && (
                                                                                    <span className="ms-1 cursor-pointer" onClick={() => removeTag(originalIndex, tagIndex, "roleNames")}>
                                                                                        ×
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        ))}
                                                                        <input
                                                                            type="text"
                                                                            id={`roleNames-${originalIndex}`}
                                                                            list="job-roles-options"
                                                                            className="multi-input border-0 flex-grow-1"
                                                                            placeholder={Editenable ? "Select or type..." : ""}
                                                                            onInput={(e) => onMultiSelectChange(e, originalIndex, "roleNames")}
                                                                            onKeyDown={(e) => handleEnterKey(e, originalIndex, "roleNames")}
                                                                            disabled={!Editenable}
                                                                        />
                                                                    </div>
                                                                    <datalist id="job-roles-options">
                                                                        {roleoptions.map((role) => (
                                                                            <option key={role} value={role} />
                                                                        ))}
                                                                    </datalist>
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                                        <StyledSwitch
                                                                            checked={data.active}
                                                                            onChange={() => handleToggleChange(originalIndex)}
                                                                            disabled={!Editenable}
                                                                        />
                                                                    </Box>
                                                                </TableCell>

                                                                {/* Action Buttons */}
                                                                <TableCell align="center">

                                                                    <Tooltip title="Delete">
                                                                        <span>
                                                                            <IconButton
                                                                                id={`delete-${originalIndex}`}
                                                                                color="error"
                                                                                onClick={(e) => OnDelete(e, originalIndex)}
                                                                                className="bg-light"
                                                                                disabled={!Editenable}
                                                                            >
                                                                                <DeleteIcon />

                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>

                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} align="center" className="py-5">
                                                            <div className="text-center">
                                                                <div className="text-muted mb-3">
                                                                    {searchTerm ? "No matching subscriptions found" : "No subscriptions found"}
                                                                </div>
                                                                {!searchTerm && (
                                                                    <Button
                                                                        variant="contained"
                                                                        startIcon={<AddIcon />}
                                                                        onClick={() => { navigate("/subscribe/addsubscriptions") }}
                                                                        sx={{
                                                                            backgroundColor: '#4caf50',
                                                                            '&:hover': { backgroundColor: '#388e3c' }
                                                                        }}
                                                                    >
                                                                        Add Your First Subscription
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Snackbar
                        open={snackAlert.open}
                        autoHideDuration={3000}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                        <Alert
                            onClose={handleClose}
                            severity={snackAlert.severity}
                            variant="filled"
                            elevation={6}
                            sx={{ width: '100%' }}
                        >
                            {snackAlert.msg}
                        </Alert>
                    </Snackbar>
                </>
            )}
        </div>
    );
}

export default Subscribe;