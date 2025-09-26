import React, { useState } from 'react';
import { Container, Typography, Box, Button, AppBar, Toolbar, Tabs, Tab } from '@mui/material';
import { PricingCalculator } from '@pricing-calculator/ui';
import LaborCategoriesDemo from './pages/LaborCategoriesDemo';

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Agile6 Pricing Calculator
          </Typography>
          <Tabs value={currentTab} onChange={handleTabChange} textColor="inherit">
            <Tab label="Main Calculator" />
            <Tab label="Labor Categories Demo" />
          </Tabs>
        </Toolbar>
      </AppBar>

      {currentTab === 0 && (
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Typography variant="h2" component="h1" gutterBottom align="center">
              Pricing Calculator
            </Typography>
            <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
              Agile6 Government Contracting Pricing Tool
            </Typography>
            
            <Box sx={{ mt: 4 }}>
              <PricingCalculator />
            </Box>
          </Box>
        </Container>
      )}

      {currentTab === 1 && <LaborCategoriesDemo />}
    </Box>
  );
}

export default App;
