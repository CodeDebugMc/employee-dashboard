import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

const LeaveApproval = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const managerId = JSON.parse(
    atob(localStorage.getItem('token').split('.')[1])
  )?.id;

  const fetchPendingLeaves = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leaves/pending');
      setPendingLeaves(res.data);
    } catch (err) {
      console.error('Error fetching pending leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/${id}/status`, {
        status,
        manager_id: managerId,
      });

      setPendingLeaves((prev) => prev.filter((leave) => leave.id !== id));
      setNotification({
        open: true,
        message: status === '1' ? 'Leave approved!' : 'Leave rejected.',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error updating leave status:', err);
      setNotification({
        open: true,
        message: 'Failed to update leave status.',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Pending Leave Requests
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : pendingLeaves.length === 0 ? (
        <Typography>No pending leave requests.</Typography>
      ) : (
        <Grid container spacing={2}>
          {pendingLeaves.map((leave) => (
            <Grid item xs={12} md={6} key={leave.id}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography>
                  <strong>Employee:</strong> {leave.employee_id}
                </Typography>
                <Typography>
                  <strong>Date:</strong> {leave.date}
                </Typography>
                <Typography>
                  <strong>Leave Type:</strong> {leave.leave_code}
                </Typography>

                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleAction(leave.id, '1')}
                    sx={{ mr: 2 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleAction(leave.id, '0')}
                  >
                    Reject
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeaveApproval;
