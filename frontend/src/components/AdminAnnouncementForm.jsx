import React, { useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Paper,
  Box,
  Stack,
} from '@mui/material';
import axios from 'axios';

const AdminAnnouncementForm = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('message', message);
    formData.append('button_text', buttonText);
    formData.append('button_link', buttonLink);
    if (image) formData.append('image', image);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/announcements',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      alert('Announcement created!');
    } catch (error) {
      console.error('Error uploading announcement:', error);
      alert('Failed to create announcement.');
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }} elevation={4}>
      <Typography variant="h5" gutterBottom>
        Create New Announcement
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            multiline
            rows={4}
            required
          />
          <TextField
            label="Button Text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            fullWidth
          />
          <TextField
            label="Button Link"
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            fullWidth
          />
          <Button variant="contained" component="label">
            Upload Poster Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </Button>
          {image && (
            <Typography variant="body2">Selected: {image.name}</Typography>
          )}
          <Button variant="contained" type="submit" color="primary">
            Submit Announcement
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default AdminAnnouncementForm;
