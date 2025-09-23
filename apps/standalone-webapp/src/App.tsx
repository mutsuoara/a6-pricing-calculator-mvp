import { Container, Typography, Box } from '@mui/material';
import { PricingCalculator } from '@pricing-calculator/ui';

function App() {
  return (
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
  );
}

export default App;
