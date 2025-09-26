import React, { useState } from 'react';
import { Container, Typography, Box, AppBar, Toolbar, Tabs, Tab } from '@mui/material';
import { PricingCalculator } from '@pricing-calculator/ui';
import LaborCategoriesDemo from './pages/LaborCategoriesDemo';
import IntegratedPricingCalculator from './components/IntegratedPricingCalculator';

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
            <Tab label="Integrated Calculator" />
            <Tab label="Labor Categories Demo" />
            <Tab label="Basic Calculator" />
          </Tabs>
        </Toolbar>
      </AppBar>

      {currentTab === 0 && (
        <Container maxWidth="xl">
          <Box sx={{ my: 2 }}>
            <IntegratedPricingCalculator />
          </Box>
        </Container>
      )}

      {currentTab === 1 && <LaborCategoriesDemo />}

      {currentTab === 2 && (
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Typography variant="h2" component="h1" gutterBottom align="center">
              Basic Calculator
            </Typography>
            <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
              Simple pricing calculator interface
            </Typography>
            
            <Box sx={{ mt: 4 }}>
              <PricingCalculator />
            </Box>
          </Box>
        </Container>
      )}
    </Box>
  );
}

export default App;
