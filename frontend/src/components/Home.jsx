import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Carousel from 'react-material-ui-carousel'; // Assuming you're using this already

const Home = () => {
  const [userData, setUserData] = useState({
    username: '',
    role: '',
    employeeNumber: '',
  });
  const [announcements, setAnnouncements] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUserData({
        username: decoded.username || 'Name not available',
        role: decoded.role || 'Role not available',
        employeeNumber:
          decoded.employeeNumber || 'Employee number not available',
      });
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }, []);

  useEffect(() => {
    if (!userData.employeeNumber) return;

    const fetchAttendance = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/attendance/recent/${userData.employeeNumber}`
        );
        setAttendance(res.data);
      } catch (err) {
        console.error('Error fetching attendance:', err);
      }
    };

    fetchAttendance();
  }, [userData.employeeNumber]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/announcements')
      .then((res) => setAnnouncements(res.data))
      .catch((err) => console.error('Error fetching announcements:', err));
  }, []);

  // Calculate the timeIN and timeOUT
  const calculateHoursWorked = (timeIN, timeOUT) => {
    if (!timeIN || !timeOUT) return 'N/A';

    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes, seconds] = time.split(':').map(Number);

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      return new Date(1970, 0, 1, hours, minutes, seconds);
    };

    const inTime = parseTime(timeIN);
    const outTime = parseTime(timeOUT);
    const diffMs = outTime - inTime;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return (
    <Container>
      {/* Welcome Header */}
      <Box textAlign="center" mt={2} color="#400000">
        <Typography variant="h4">
          Welcome, {userData.username || 'Guest'}!
        </Typography>
        <Typography variant="subtitle1">
          Employee ID: {userData.employeeNumber}
        </Typography>
        <Typography variant="subtitle1">Role: {userData.role}</Typography>
      </Box>

      {/* Announcement Carousel */}
      <Box mt={4}>
        <Carousel>
          {announcements.map((item, i) => (
            <Paper key={i} sx={{ p: 3 }}>
              <Typography variant="h5">{item.title}</Typography>
              <Typography>{item.message}</Typography>
              {item.button_text && item.button_link && (
                <Box mt={2}>
                  <a
                    href={item.button_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: 'none',
                      padding: '8px 16px',
                      border: '1px solid #1976d2',
                      borderRadius: '4px',
                      color: '#1976d2',
                      fontWeight: 'bold',
                      display: 'inline-block',
                    }}
                  >
                    {item.button_text}
                  </a>
                </Box>
              )}
            </Paper>
          ))}
        </Carousel>
      </Box>

      {/* Attendance Section */}
      <Box mt={5}>
        <Typography variant="h6" gutterBottom>
          Recent Attendance
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Day</strong>
                </TableCell>
                <TableCell>
                  <strong>Time In</strong>
                </TableCell>
                <TableCell>
                  <strong>Time Out</strong>
                </TableCell>
                <TableCell>
                  <strong>Hours Worked</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.Day}</TableCell>
                  <TableCell>{record.timeIN || 'N/A'}</TableCell>
                  <TableCell>{record.timeOUT || 'N/A'}</TableCell>
                  <TableCell>
                    {calculateHoursWorked(record.timeIN, record.timeOUT)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default Home;
