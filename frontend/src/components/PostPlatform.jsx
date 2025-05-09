import { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import axios from 'axios';

export default function PostPlatform() {
  const [form, setForm] = useState({ title: '', content: '', banner: null });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, banner: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', form.title);
    data.append('content', form.content);
    data.append('banner', form.banner);

    try {
      await axios.post('http://localhost:5000/api/posts', data);
      alert('Post submitted!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          New Post
        </Typography>
        <TextField
          label="Title"
          name="title"
          fullWidth
          margin="normal"
          onChange={handleChange}
        />
        <TextField
          label="Article"
          name="content"
          multiline
          rows={6}
          fullWidth
          margin="normal"
          onChange={handleChange}
        />
        <Button variant="contained" component="label">
          Upload Banner
          <input hidden type="file" onChange={handleFileChange} />
        </Button>
        <Box mt={2}>
          <Button type="submit" variant="contained" fullWidth>
            Submit
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
