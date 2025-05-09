import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box } from '@mui/material';
import Carousel from 'react-material-ui-carousel';

export default function PostCarousel() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/poster')
      .then((res) => setPosts(res.data));
  }, []);

  return (
    <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Carousel indicators={false} navButtonsAlwaysVisible>
        {posts.map((post) => (
          <Box
            key={post.id}
            sx={{
              height: '100vh',
              backgroundImage: `url(http://localhost:5000/poster/${post.banner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              color: 'white',
              padding: 4,
              textShadow: '0px 0px 10px black',
            }}
          >
            <Box>
              <h2>{post.title}</h2>
              <p>{post.content}</p>
            </Box>
          </Box>
        ))}
      </Carousel>
    </Box>
  );
}
