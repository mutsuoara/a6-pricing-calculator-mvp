import React, { useState } from 'react';
import { Container, Typography, Box, AppBar, Toolbar, Tabs, Tab } from '@mui/material';
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
    </Box>
  );
}

export default App;
