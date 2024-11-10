import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

function YouTubePlayer({ videoUrl }) {
  if (!videoUrl) return null;

  const getVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getVideoId(videoUrl);
  if (!videoId) return null;

  return (
    <Paper elevation={3} sx={{ 
      mb: 2,
      position: 'sticky',
      top: 20,
    }}>
      <Typography variant="h6" sx={{ p: 2 }}>Match Video</Typography>
      <Box sx={{ 
        position: 'relative',
        paddingTop: '45%',
        height: '0',
        overflow: 'hidden'
      }}>
        <iframe
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0
          }}
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title="Match Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Box>
    </Paper>
  );
}

export default YouTubePlayer; 