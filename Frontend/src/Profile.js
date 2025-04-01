import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Tooltip,
  IconButton,
  TextField,
  Toolbar,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';
import {
  Edit as EditIcon,
  Home as HomeIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { cloneDeep } from "lodash";
import { styled } from '@mui/material/styles';


const ProfileCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(4),
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
  overflow: 'visible',
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(3),
  borderTopLeftRadius: theme.shape.borderRadius,
  borderTopRightRadius: theme.shape.borderRadius,
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  border: `4px solid ${theme.palette.background.paper}`,
  marginTop: -50,
  marginBottom: theme.spacing(2),
}));

const ProfileInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

function Profile() {

  const [subscribelist, setsubscribelist] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');


  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [alertmsg, setalertmsg] = useState({ "open": false, "msg": "", "type": "" });


  const [user, setUser] = useState({
    name: '',
    email: '',
    subscriptions: '',
    memberSince: 'March 15, 2023',
    avatarUrl: '',
  });
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

  const LoadSubscriptionData = async () => {
    try {
      let user = JSON.parse(localStorage.getItem('user'))
      let payload = { email: user.username }
      const response = await axios.post('http://localhost:8080/fetch-user-subscriptions', payload);

      if (response.status == 200) {
        // setloading(false);
        return response.data.subscriptions.length;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return 0;

      // setloading(false);
      // setsnackAlert({
      //   open: true,
      //   severity: 'error',
      //   msg: 'Failed to fetch data... Please try again'
      // })
    }
  }


  const LoadPersonalData = async () => {
    try {
      let user = JSON.parse(localStorage.getItem('user'))
      let payload = { email: user.username }
      const response = await axios.post('http://localhost:8080/get-user', payload);

      if (response.status == 200) {
        // setloading(false);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return { name: '', created_at: '' };
    }
  }


  const getprofile = async () => {
    let r = await LoadSubscriptionData()
    let data = await LoadPersonalData()
    let temp = cloneDeep(user)
    temp.email = JSON.parse(localStorage.getItem('user'))['username']
    temp.name = data.name
    temp.memberSince = data.created_at
    temp.subscriptions = r
    setUser(temp)
    setNewName(data.name)

  }


  useEffect(() => {
    getprofile()
  }, []);





  const handleNameChange =async () => {
    setUser({ ...user, name: newName });
    try {
      await axios.put("http://localhost:8080/update-user", { "email": user.email, "name": newName });
      setalertmsg({ "open": true, "msg": "Name Change Succesfull", "type": "success" })
    } catch (error) {
      setalertmsg({ "open": true, "msg": "Name Change Failed", "type": "error" })
    }

    setIsEditingName(false);
  };


  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (!passwordRegex.test(newPassword)) {
      setPasswordError('Password requirment failed');
      return;
    }

    try {
      await axios.put("http://localhost:8080/reset-password", { "email": user.email, "new_password": newPassword });
      setIsChangingPassword(false);
      setalertmsg({ "open": true, "msg": "Password Change Succesful", "type": "success" })
    } catch (error) {
      setalertmsg({ "open": true, "msg": "Password Change Failed", "type": "error" })
    }

    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };


  const handleClose = () => {
    setalertmsg({ "open": false, "msg": "", "type": "" });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="md">
        <ProfileCard>
          <ProfileHeader>
            <Typography variant="h5" fontWeight="bold">
              USER PROFILE
            </Typography>
          </ProfileHeader>

          <ProfileInfo>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} display="flex" flexDirection="column" alignItems="center">
                <ProfileAvatar src={user.avatarUrl}>
                  {!user.avatarUrl && user.name.charAt(0)}
                </ProfileAvatar>
                <Typography variant="body2" color="text.secondary">
                  Profile Picture
                </Typography>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} display="flex" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="bold" width={150}>
                      Name:
                    </Typography>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {user.name}
                    </Typography>
                    <IconButton id='edit-name-button' color="primary" onClick={() => setIsEditingName(true)}>
                      <EditIcon />
                    </IconButton>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  <Grid item xs={12} display="flex">
                    <Typography variant="subtitle1" fontWeight="bold" width={150}>
                      Email:
                    </Typography>
                    <Typography variant="body1">{user.email}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  <Grid item xs={12} display="flex">
                    <Typography variant="subtitle1" fontWeight="bold" width={150}>
                      Subscriptions:
                    </Typography>
                    <Typography variant="body1">{user.subscriptions}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  <Grid item xs={12} display="flex">
                    <Typography variant="subtitle1" fontWeight="bold" width={150}>
                      Member Since:
                    </Typography>
                    <Typography variant="body1">{user.memberSince != '' ? user.memberSince.split("T")[0] : ''}</Typography>
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setIsChangingPassword(true)}
                    >
                      Change Password
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </ProfileInfo>
        </ProfileCard>
      </Container>

      {/* Edit Name Dialog */}
      <Dialog open={isEditingName} onClose={() => setIsEditingName(false)}>
        <DialogTitle>Edit Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditingName(false)}>Cancel</Button>
          <Button onClick={handleNameChange} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={isChangingPassword}
        onClose={() => {
          setIsChangingPassword(false);
          setNewPassword('');
          setConfirmPassword('');
          setPasswordError('');
        }}
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter your new password below.
          </DialogContentText>
          <Tooltip title="At least one Uppercase, Lowercase, Number, and Special Character should be present" arrow>
            <TextField
              margin="dense"
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={passwordError}
              sx={{ mb: 2 }}
            /></Tooltip>
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={passwordError}
            helperText={passwordError}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsChangingPassword(false);
              setNewPassword('');
              setConfirmPassword('');
              setPasswordError('');
            }}
          >
            Cancel
          </Button>
          <Button onClick={handlePasswordChange} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={alertmsg.open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={alertmsg.type} variant="filled">
          {alertmsg.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;