import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    message: '',
    button_text: '',
    button_link: '',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const res = await axios.get('http://localhost:5000/api/announcements');
    setAnnouncements(res.data);
  };

  const handleOpen = (announcement = null) => {
    if (announcement) {
      setFormData(announcement);
    } else {
      setFormData({
        id: null,
        title: '',
        message: '',
        button_text: '',
        button_link: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (formData.id) {
      await axios.put(
        `http://localhost:5000/api/announcements/${formData.id}`,
        formData
      );
    } else {
      await axios.post('http://localhost:5000/api/announcements', formData);
    }
    fetchAnnouncements();
    handleClose();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/announcements/${id}`);
    fetchAnnouncements();
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Add Announcement
      </Button>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Button Text</TableCell>
              <TableCell>Button Link</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {announcements.map((ann) => (
              <TableRow key={ann.id}>
                <TableCell>{ann.title}</TableCell>
                <TableCell>{ann.message}</TableCell>
                <TableCell>{ann.button_text}</TableCell>
                <TableCell>{ann.button_link}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(ann)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(ann.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {formData.id ? 'Edit Announcement' : 'New Announcement'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="title"
            label="Title"
            fullWidth
            value={formData.title}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="message"
            label="Message"
            fullWidth
            multiline
            rows={3}
            value={formData.message}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="button_text"
            label="Button Text"
            fullWidth
            value={formData.button_text}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="button_link"
            label="Button Link"
            fullWidth
            value={formData.button_link}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {formData.id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminAnnouncements;
