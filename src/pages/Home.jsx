import React from 'react';
import Box from '@mui/material/Box';
import { HomeHero } from '../components/home/HomeHero';
import { HomeRecentFiles } from '../components/home/HomeRecentFiles';
import { HomeFeatures } from '../components/home/HomeFeatures';
import { HomeSpendlorePromo } from '../components/home/HomeSpendlorePromo';
import { HomeCta } from '../components/home/HomeCta';
import { HomeAdminBanner } from '../components/home/HomeAdminBanner';

const Home = () => {
  return (
    <Box
      component="main"
      sx={{
        width: '100%',
        minHeight: '100dvh',
        bgcolor: 'background.default',
        overflowX: 'hidden',
        pb: { xs: 10, md: 0 },
      }}
    >
      <HomeHero />
      <HomeRecentFiles />
      <HomeFeatures />
      <HomeSpendlorePromo />
      <HomeCta />
      <HomeAdminBanner />
    </Box>
  );
};

export default Home;
