import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Box, Typography, Paper, Button } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import LeaveBalance from './LEAVES/LeaveBalance';

const Home = () => {
  const [userData, setUserData] = useState({
    username: '',
    role: '',
    employeeNumber: '',
  });
  const [announcements, setAnnouncements] = useState([]);

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
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/announcements'
        );
        setAnnouncements(response.data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  {
    userData.employeeNumber && (
      <LeaveBalance employeeId={userData.employeeNumber} />
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Welcome Banner */}
      <Box
        sx={{
          textAlign: 'center',
          color: '#400000',
          mt: -7,
          mb: -4,
          fontSize: 13,
        }}
      >
        <h1>👋 Welcome back, {userData.username || 'Guest'}!</h1>
        {/* <h2>Employee ID: {userData.employeeNumber}</h2> */}
        {/* <h2>Role: {userData.role}</h2> */}
      </Box>

      {/* Carousel */}
      {announcements.length > 0 ? (
        <Box sx={{ mt: 4 }}>
          <Carousel
            navButtonsAlwaysVisible
            autoPlay
            animation="slide"
            interval={7000}
            fullHeightHover={false}
            indicators
          >
            {announcements.map((item, index) => (
              <AnnouncementItem key={index} item={item} />
            ))}
          </Carousel>
        </Box>
      ) : (
        <Typography sx={{ mt: 4, textAlign: 'center' }}>
          No announcements to display.
        </Typography>
      )}
    </Container>
  );
};

const AnnouncementItem = ({ item }) => (
  <Paper
    elevation={3}
    sx={{
      display: 'flex',
      alignItems: 'center',
      p: 4,
      m: 2,
      backgroundColor: '#f5f5f5',
      minHeight: 300,
    }}
  >
    {item.image && (
      <img
        src={`http://localhost:5000${item.image}`}
        alt={item.title}
        style={{
          maxWidth: '40%',
          maxHeight: '250px',
          height: 'auto',
          marginRight: 24,
          borderRadius: 8,
          objectFit: 'cover',
        }}
      />
    )}
    <Box sx={{ textAlign: 'left', flex: 1 }}>
      <Typography variant="h5" gutterBottom>
        {item.title}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {item.message}
      </Typography>
      {item.button_text && item.button_link && (
        <Button
          variant="outlined"
          color="primary"
          href={item.button_link}
          target="_blank"
          sx={{
            mt: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: '#fff',
              borderColor: 'primary.main',
            },
          }}
        >
          {item.button_text}
        </Button>
      )}
    </Box>
  </Paper>
);

export default Home;
