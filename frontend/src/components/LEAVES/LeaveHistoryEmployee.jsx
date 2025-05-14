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
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import { CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import { green, red, orange } from '@mui/material/colors';
import axios from 'axios';
import dayjs from 'dayjs';

const LeaveHistoryEmployee = () => {
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ leave_type: '', date: '' });
  const [leaveTypes, setLeaveTypes] = useState([]);

  const fetchLeaveHistory = () => {
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

      axios
        .get('http://localhost:5000/api/leave-types')
        .then((res) => setLeaveTypes(res.data))
        .catch((err) => console.error('Failed to load leave types', err));
    } catch (e) {
      console.error('Invalid token', e);
      setError('Invalid token.');
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave request?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/leaves/${id}`);
      fetchLeaveHistory();
    } catch (err) {
      console.error(err);
      setError('Failed to delete leave request.');
    }
  };

  const handleEditClick = (leave) => {
    setEditingId(leave.id);
    setEditData({
      leave_type: leave.leave_type,
      date: leave.date.slice(0, 10),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ leave_type: '', date: '' });
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/${id}`, editData);
      setEditingId(null);
      fetchLeaveHistory();
    } catch (err) {
      console.error(err);
      setError('Failed to update leave request.');
    }
  };

  const handleEditChange = (e) => {
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 900, margin: 'auto', mt: 5 }}>
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.map((leave) => {
              const isEditing = editingId === leave.id;

              return (
                <TableRow key={leave.id}>
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        name="leave_type"
                        select
                        value={editData.leave_type}
                        onChange={handleEditChange}
                        size="small"
                        fullWidth
                      >
                        {leaveTypes.map((type) => (
                          <MenuItem
                            key={type.leave_code}
                            value={type.leave_code}
                          >
                            {type.description}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      leave.description
                    )}
                  </TableCell>

                  <TableCell>
                    {isEditing ? (
                      <TextField
                        type="date"
                        name="date"
                        value={editData.date}
                        onChange={handleEditChange}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      dayjs(leave.date).format('MMMM D, YYYY')
                    )}
                  </TableCell>

                  <TableCell>
                    {leave.status === '1' ? (
                      <span
                        style={{
                          color: green[600],
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <CheckCircle fontSize="small" sx={{ mr: 0.5 }} />{' '}
                        Approved
                      </span>
                    ) : leave.status === '0' ? (
                      <span
                        style={{
                          color: red[600],
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Cancel fontSize="small" sx={{ mr: 0.5 }} /> Rejected
                      </span>
                    ) : (
                      <span
                        style={{
                          color: orange[700],
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <HourglassEmpty fontSize="small" sx={{ mr: 0.5 }} />{' '}
                        Pending
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    {dayjs(leave.created_at).format('MMM D, YYYY h:mm A')}
                  </TableCell>

                  <TableCell>
                    {leave.status === 'pending' && (
                      <>
                        {isEditing ? (
                          <>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ mr: 1 }}
                              onClick={() => handleSaveEdit(leave.id)}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="warning"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ mr: 1 }}
                              onClick={() => handleEditClick(leave)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleDelete(leave.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default LeaveHistoryEmployee;
