import React, { useState } from 'react';
import { Container, TextField, Button, Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import axios from 'axios';

function App() {
  const [userId, setUserId] = useState(''); // Input state
  const [recommendations, setRecommendations] = useState([]); // Results state
  const [loading, setLoading] = useState(false); // Spinner state
  const [error, setError] = useState(''); // Error state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      // Call backend API (proxied to /api/recommend)
      const response = await axios.post('/api/recommend', { userId });
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePopular = async () => {
    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const response = await axios.get('/api/popular?limit=5');
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch popular items.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        E-Commerce Product Recommender
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Enter User ID (e.g., 507f1f77bcf86cd799439011)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="507f1f77bcf86cd799439011"
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          startIcon={<SendIcon />}
          disabled={!userId.trim() || loading}
          sx={{ mb: 2 }}
        >
          Get Recommendations
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={handlePopular}
          disabled={loading}
        >
          Show Popular Items
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {recommendations.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Recommendations ({recommendations.length} items)
          </Typography>
          {recommendations.map((rec, index) => (
            <Card key={rec._id || index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" component="h2">
                  {rec.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {rec.description}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Price: ${rec.price}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Category: {rec.category} | Tags: {rec.tags?.join(', ')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'primary.main' }}>
                  Why recommended: {rec.explanation}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default App;
