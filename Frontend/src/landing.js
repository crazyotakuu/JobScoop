import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Container, TextField, Chip, Backdrop, CircularProgress, Snackbar, Alert
} from '@mui/material';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';


// Company Color Palette
const COMPANY_COLORS = {
    'Google': '#4285F4',
    'Microsoft': '#737373',
    'Amazon': '#FF9900',
    'Apple': '#000000',
    'Facebook': '#3b5998',
    'Netflix': '#E50914',
    'Spotify': '#1DB954',
    'Uber': '#000000',
    'Airbnb': '#FF5A5F',
    'Default': '#1976D2'
};

let hueIndex = 0;

const generateUniqueColor = (usedColors) => {
    let color;
    let attempts = 0;
    const step = 47;

    do {
        const hue = (hueIndex * step) % 360;
        color = `hsl(${hue}, 80%, 50%)`;
        hueIndex++;
        attempts++;
    } while (usedColors.includes(color) && attempts < 100);

    return color;
};

const getCompanyColor = (company_name) => {
    if (!COMPANY_COLORS[company_name]) {
        const usedColors = Object.values(COMPANY_COLORS);
        const newColor = generateUniqueColor(usedColors);
        COMPANY_COLORS[company_name] = newColor;
    }
    return COMPANY_COLORS[company_name];
};

const JobCard = ({ job, onOpenDetails, onApply }) => {
    const companyColor = getCompanyColor(job.company_name)

    return (
        <Card
            sx={{
                width: 300,
                m: 2,
                position: 'relative',
                overflow: 'visible',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: 3
                }
            }}
            elevation={2}
        >
            {/* Company Color Header */}
            <Box
                sx={{
                    height: 10,
                    backgroundColor: companyColor,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1
                }}
            />
            <CardContent
                // onClick={() => onOpenDetails(job)}
                sx={{
                    cursor: 'pointer',
                    pt: 3,
                    '&:last-child': { pb: 2 }
                }}
            >
                <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 0.5 }}>
                    {job.job_position}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 0.5 }}>
                    <span><BusinessTwoToneIcon variant='small' /> {job.company_name}</span>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    <span style={{ justifyContent: 'center', alignItems: 'center' }}><LocationOnOutlinedIcon /> {job.job_location}</span>
                </Typography>
            </CardContent>
            <Box sx={{ p: 2, pt: 0 }}>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        backgroundColor: companyColor,
                        '&:hover': {
                            backgroundColor: companyColor,
                            opacity: 0.8
                        }
                    }}
                    fullWidth
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent dialog from opening
                        onApply(job);
                    }}
                >
                    Apply
                </Button>
            </Box>
        </Card>
    );
};

const JobDetailsModal = ({ job, open, onClose, onApply }) => {
    if (!job) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Typography variant="h5">{job.job_position}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {job.company_name} | {job.job_location}
                </Typography>
            </DialogTitle>
            {/* <DialogContent dividers>
                <Typography variant="body1" component="pre">
                    {'Job Description :' + "\n" + job.description}
                </Typography>
            </DialogContent> */}
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
                <Button variant="contained" color="primary" sx={{ borderRadius: '3px' }} onClick={onApply(job)}>
                    Apply Now
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const LandingPage = () => {
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [loading, setloading] = useState(true);
    const [alertmsg, setalertmsg] = useState({ "open": false, "msg": "", "type": "" });



    const [jobsData, setjobsData] = useState([]);


    const handleOpenJobDetails = (job) => {
        setSelectedJob(job);
    };


    const FetchActiveJobs = async () => {

        try {
            let user = JSON.parse(localStorage.getItem('user'))
            let payload = { "email": user.username }
            console.log("payload")
            let res = await axios.post("http://localhost:8080/subscriptions/jobs", payload);
            console.log("Jobs", res)
            if (res.data.jobs == null) {
                setjobsData([])
            }
            else {
                setjobsData(res.data.jobs)
            }
            setloading(false)

        } catch (error) {
            console.log(error)
            setloading(false)
            setalertmsg({ "open": true, "msg": "Failed to load Data", "type": "error" });

        }
    };
    useEffect(() => {
        FetchActiveJobs()
    }, [])
    const handleCloseJobDetails = () => {
        setSelectedJob(null);
    };

    const handleApply = (job) => {
        console.log('Applying for job:', job);
        window.open(job.job_link, "_blank");
        // alert(`Application process for ${job.job_position} at ${job.company_name}`);
    };

    const handleCompanyChange = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedCompanies(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleClose = () => {
        setalertmsg({ "open": false, "msg": "", "type": "" });
    };

    const handleRoleChange = (event) => {
        setSelectedRole(event.target.value);
    };
    const handleLocationChange = (event) => {
        setSelectedLocation(event.target.value);
    };

    // const companies = [...new Set(jobsData.map(job => job.company_name))];
    // const roles = [...new Set(jobsData.map(job => job.job_position))];
    // const locations = [...new Set(jobsData.map(job => job.job_location))];
    const companies = [...new Set((jobsData || []).map(job => job.company_name))];
    const roles = [...new Set((jobsData || []).map(job => job.job_position))];
    const locations = [...new Set((jobsData || []).map(job => job.job_location))];


    const filteredJobs = (jobsData || []).filter(job => {
        const companyMatch = selectedCompanies.length === 0 || selectedCompanies.includes(job.company_name);
        const roleMatch = selectedRole === '' || job.job_position === selectedRole;
        const locationMatch = selectedLocation === '' || job.job_location === selectedLocation;

        return companyMatch && roleMatch && locationMatch;
    });

    return (
        <Container sx={{ margin: '6px' }} maxWidth height='100vh'>
            {loading ? (
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={loading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            ) : jobsData.length > 0 ?
                <div>
                    <Typography
                        variant="h4"
                        sx={{
                            mb: 3,
                            textAlign: 'center',
                            mt: 4
                        }}
                    >
                        Available Job Openings
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 3 }}>
                        <FormControl sx={{ width: 300 }} variant="outlined">
                            <InputLabel id="company-filter-label" sx={{ backgroundColor: 'white', px: 1 }}>Companies</InputLabel>
                            <Select
                                labelId="company-filter-label"
                                id="company-select"
                                multiple
                                value={selectedCompanies}
                                onChange={handleCompanyChange}
                                input={<OutlinedInput label="Companies" />}
                                renderValue={(selected) => (
                                    <Box sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 0.5,
                                        maxHeight: '80px',
                                        overflow: 'auto'
                                    }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 224,
                                            width: 250,
                                        },
                                    },
                                }}
                            >
                                {companies.map((company) => (
                                    <MenuItem key={company} value={company}>
                                        {company}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ width: 300 }} variant="outlined">
                            <InputLabel id="role-filter-label" sx={{ backgroundColor: 'white', px: 1 }}>Job Role</InputLabel>
                            <Select
                                labelId="role-filter-label"
                                id="role-select"
                                value={selectedRole}
                                onChange={handleRoleChange}
                                input={<OutlinedInput label="Job Role" />}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 224,
                                            width: 250,
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    <em>All Roles</em>
                                </MenuItem>
                                {roles.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {role}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>


                        <FormControl sx={{ width: 300 }} variant="outlined">
                            <InputLabel id="location-filter-label" sx={{ backgroundColor: 'white', px: 1 }}>Job Location</InputLabel>
                            <Select
                                labelId="location-filter-label"
                                id="location-select"
                                value={selectedLocation}
                                onChange={handleLocationChange}
                                input={<OutlinedInput label="Job Location" />}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 224,
                                            width: 250,
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    <em>All Locations</em>
                                </MenuItem>
                                {locations.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {role}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'left',
                            alignItems: 'stretch'
                        }}
                    >
                        {filteredJobs.map(job => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onOpenDetails={handleOpenJobDetails}
                                onApply={handleApply}
                            />
                        ))}
                    </Box> </div> : <Typography
                        alignContent={'center'}
                        justifyContent={'center'}
                        variant="h6"
                        sx={{
                            textAlign: 'center',
                            mt: 4
                        }}
                    >
                    No Available Job Openings
                </Typography>}

            <JobDetailsModal
                job={selectedJob}
                open={selectedJob}
                onClose={handleCloseJobDetails}
                onApply={handleApply}
            />
            <Snackbar open={alertmsg.open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={alertmsg.type} variant="filled">
                    {alertmsg.msg}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default LandingPage;