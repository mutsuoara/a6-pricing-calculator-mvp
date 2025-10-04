import React from 'react';
import { Container, Typography, Box, AppBar, Toolbar } from '@mui/material';
import IntegratedPricingCalculator from './components/IntegratedPricingCalculator';

function App() {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Agile6 Pricing Calculator
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        <Box sx={{ my: 2 }}>
          <IntegratedPricingCalculator />
        </Box>
      </Container>
    </Box>
  );
}

export default App;
