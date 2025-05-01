import { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import axios from 'axios';

const LeaveForm = () => {
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_code: '',
    date: '',
  });
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/leave-types')
      .then((res) => setLeaveTypes(res.data))
      .catch((err) => {
        console.error(err);
        setError(true);
        setMessage('Failed to load leave types.');
      });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const { employee_id, leave_code, date } = formData;
    if (!employee_id || !leave_code || !date) {
      setError(true);
      setMessage('Please fill out all fields.');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/api/leaves',
        formData
      );
      setMessage(res.data.message);
      setError(false);
      setFormData({
        employee_id: '',
        leave_code: '',
        date: '',
      });
    } catch (err) {
      console.error(err);
      setError(true);
      setMessage('Failed to submit leave request.');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, margin: 'auto', mt: 5 }}>
      <Typography variant="h6" gutterBottom>
        Apply for Leave
      </Typography>

      {message && (
        <Alert severity={error ? 'error' : 'success'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          label="Employee ID"
          name="employee_id"
          value={formData.employee_id}
          onChange={handleChange}
          type="number"
          required
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth required sx={{ mb: 2 }}>
          <InputLabel>Leave Type</InputLabel>
          <Select
            name="leave_code"
            value={formData.leave_code}
            label="Leave Type"
            onChange={handleChange}
          >
            {leaveTypes.map((type) => (
              <MenuItem key={type.leave_code} value={type.leave_code}>
                {type.description}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Date"
          name="date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={formData.date}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />

        <Button type="submit" variant="contained" fullWidth>
          Submit Leave Request
        </Button>
      </Box>
    </Paper>
  );
};

export default LeaveForm;
