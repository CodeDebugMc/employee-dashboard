import { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Alert,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import axios from 'axios';
import dayjs from 'dayjs';

const LeaveApproval = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [error, setError] = useState(null);

  const fetchPendingLeaves = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leaves/pending');
      setPendingLeaves(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pending leave requests.');
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/status/${id}`, {
        status,
      });
      fetchPendingLeaves(); // Refresh list after action
    } catch (err) {
      console.error(err);
      setError('Failed to update leave status.');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 1000, mx: 'auto', mt: 5 }}>
      <Typography variant="h6" gutterBottom>
        Pending Leave Approvals
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {pendingLeaves.length === 0 ? (
        <Typography>No pending leave requests.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Leave Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingLeaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>
                  {leave.employee_name || leave.employeeNumber}
                </TableCell>
                <TableCell>{leave.description}</TableCell>
                <TableCell>{dayjs(leave.date).format('D MMMM YYYY')}</TableCell>
                <TableCell>
                  {dayjs(leave.created_at).format('D MMM YYYY h:mm A')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<CheckCircle />}
                    sx={{ mr: 1, backgroundColor: green[600] }}
                    onClick={() => handleAction(leave.id, '1')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<Cancel />}
                    sx={{ backgroundColor: red[600] }}
                    onClick={() => handleAction(leave.id, '0')}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default LeaveApproval;
