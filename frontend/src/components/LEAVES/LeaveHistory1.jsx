import { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
} from '@mui/material';
import axios from 'axios';

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const employeeNumber = decoded.employeeNumber;

      axios
        .get(`http://localhost:5000/api/leaves/history/${employeeNumber}`)
        .then((res) => setLeaves(res.data))
        .catch((err) => {
          console.error(err);
          setError('Failed to load leave history.');
        });
    } catch (e) {
      console.error('Invalid token', e);
      setError('Invalid token.');
    }
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, margin: 'auto', mt: 5 }}>
      <Typography variant="h6" gutterBottom>
        Leave History
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {leaves.length === 0 ? (
        <Typography>No leave records found.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Leave Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>{leave.description}</TableCell>
                <TableCell>{leave.date}</TableCell>
                <TableCell>
                  {leave.status === '1'
                    ? 'Approved'
                    : leave.status === '0'
                    ? 'Rejected'
                    : 'Pending'}
                </TableCell>
                <TableCell>
                  {new Date(leave.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default LeaveHistory;
