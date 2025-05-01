import React, { useEffect, useState } from 'react';
import Carousel from 'react-material-ui-carousel';
import { Paper, Button, Typography, Box, Container } from '@mui/material';
import axios from 'axios';

const EmployeeCarousel = () => {
  const [announcements, setAnnouncements] = useState([]);

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

  if (announcements.length === 0) {
    return <Typography>No announcements to display.</Typography>;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100vw', mt: 2 }}>
      <Carousel
        navButtonsAlwaysVisible
        autoPlay={true}
        animation="slide"
        interval={7000}
        fullHeightHover={false}
        indicators={true}
      >
        {announcements.map((item, index) => (
          <AnnouncementItem key={index} item={item} />
        ))}
      </Carousel>
    </Box>
  );
};

const AnnouncementItem = ({ item }) => (
  <Paper
    elevation={3}
    sx={{
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      p: 4,
      m: 2,
      backgroundColor: '#f5f5f5',
      minHeight: 300, // Ensure consistent height
      height: '100%', // Optional: allow full height of container
    }}
  >
    {item.image && (
      <img
        src={`http://localhost:5000${item.image}`}
        alt={item.title}
        style={{
          maxWidth: '40%',
          height: 'auto',
          maxHeight: '250px',
          marginRight: 24,
          borderRadius: 8,
          objectFit: 'cover',
        }}
      />
    )}
    <div style={{ textAlign: 'left', flex: 1 }}>
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
    </div>
  </Paper>
);

export default EmployeeCarousel;
