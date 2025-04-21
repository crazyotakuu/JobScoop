
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Divider
} from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Trends = () => {
  // Format date as YYYY-MM-DD for input fields
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // State for date filters
  const [startDate, setStartDate] = useState(formatDateForInput(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(formatDateForInput(today));

  // State for subscription data and charts
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [companyChartData, setCompanyChartData] = useState({
    labels: [],
    datasets: []
  });

  const [roleChartData, setRoleChartData] = useState({
    labels: [],
    datasets: []
  });

  const [correlationData, setCorrelationData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // NEW: State for trending roles
  const [trendingRoles, setTrendingRoles] = useState([]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  // Fetch data from APIs
  const fetchSubscriptionData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch user subscriptions
      const userSubscriptionsResponse = await axios.get('http://localhost:8080/fetch-all-user-subscriptions');
      console.log("ds", userSubscriptionsResponse)

      if (!userSubscriptionsResponse.status == 200) {
        throw new Error(`Error fetching user subscriptions: ${userSubscriptionsResponse.statusText}`);
      }

      const userSubscriptionsData = await userSubscriptionsResponse.data;

      // Transform the data to match our expected format
      const transformedData = userSubscriptionsData.map(item => ({
        dateSubscribed: item.date.substring(0, 10), // Extract YYYY-MM-DD from date
        company: item.company,
        role: item.roleNames[0], // Taking the first role for simplicity
        userId: item.user,
        // We can add more roles if needed later
        roles: item.roleNames
      }));

      setSubscriptionData(transformedData);

      // Initial filtering based on default date range
      filterDataByDateRange(transformedData, startDate, endDate);

      // NEW: Process trending roles data
      fetchTrendingRoles(transformedData);
    } catch (err) {
      console.error('Failed to fetch subscription data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Function to fetch trending roles
  const fetchTrendingRoles = (data) => {
    try {
      // Get today's date and 7 days ago for the trending period
      const currentDate = new Date();
      const sevenDaysAgo = new Date(currentDate);
      sevenDaysAgo.setDate(currentDate.getDate() - 7);

      const formattedStartDate = formatDateForInput(sevenDaysAgo);
      const formattedEndDate = formatDateForInput(currentDate);

      // Filter data for the last 7 days
      const trendingPeriodData = data.filter(item => {
        const itemDate = new Date(item.dateSubscribed).getTime();
        const startTimestamp = new Date(formattedStartDate).getTime();
        const endTimestamp = new Date(formattedEndDate).getTime();

        return itemDate >= startTimestamp && itemDate <= endTimestamp;
      });

      // Count role occurrences
      const roleCount = {};
      trendingPeriodData.forEach(item => {
        if (Array.isArray(item.roles)) {
          item.roles.forEach(role => {
            roleCount[role] = (roleCount[role] || 0) + 1;
          });
        } else {
          roleCount[item.role] = (roleCount[item.role] || 0) + 1;
        }
      });

      // Convert to array and sort by count
      const sortedRoles = Object.entries(roleCount)
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Get only top 5

      setTrendingRoles(sortedRoles);
    } catch (err) {
      console.error('Failed to process trending roles:', err);
    }
  };

  // Fetch correlation data (company-role combinations)
  const fetchCorrelationData = async () => {
    try {
      const frequenciesResponse = await axios.get('http://localhost:8080/fetch-subscription-frequencies');

      if (!frequenciesResponse.status == 200) {
        throw new Error(`Error fetching frequencies: ${frequenciesResponse.statusText}`);
      }
      const frequenciesData = await frequenciesResponse.data;

      // Process for correlation table
      const totalSubscriptions = frequenciesData.reduce((total, item) => total + item.frequency, 0);

      const correlations = frequenciesData.map(item => ({
        company: item.company,
        role: item.role,
        count: item.frequency,
        percentage: `${((item.frequency) * 100).toFixed(1)}%`
      }));

      correlations.sort((a, b) => b.count - a.count);

      setCorrelationData(correlations);
    } catch (err) {
      console.error('Failed to fetch correlation data:', err);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
    fetchCorrelationData();
  }, []);


  const filterDataByDateRange = (data, start, end) => {
    const startTimestamp = new Date(start).getTime();
    const endTimestamp = new Date(end).getTime();


    const filtered = data.filter(item => {
      const itemDate = new Date(item.dateSubscribed).getTime();
      return itemDate >= startTimestamp && itemDate <= endTimestamp;
    });

    setFilteredData(filtered);
    processChartData(filtered);
  };


  const processChartData = (data) => {
    const companyCount = {};
    data.forEach(item => {
      companyCount[item.company] = (companyCount[item.company] || 0) + 1;
    });

    const companyNames = Object.keys(companyCount);
    const companySubscriptions = companyNames.map(name => companyCount[name]);

    setCompanyChartData({
      labels: companyNames,
      datasets: [
        {
          label: 'Subscriptions',
          data: companySubscriptions,
          backgroundColor: '#3f51b5',
        }
      ]
    });

    const roleCount = {};
    data.forEach(item => {
      if (Array.isArray(item.roles)) {
        item.roles.forEach(role => {
          roleCount[role] = (roleCount[role] || 0) + 1;
        });
      } else {
        roleCount[item.role] = (roleCount[item.role] || 0) + 1;
      }
    });

    const roleNames = Object.keys(roleCount);
    const roleSubscriptions = roleNames.map(name => roleCount[name]);

    setRoleChartData({
      labels: roleNames,
      datasets: [
        {
          label: 'Subscriptions',
          data: roleSubscriptions,
          backgroundColor: '#f50057',
        }
      ]
    });
  };


  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleApplyFilter = () => {
    filterDataByDateRange(subscriptionData, startDate, endDate);
  };

  const handleLastSevenDays = () => {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    setStartDate(formatDateForInput(sevenDaysAgo));
    setEndDate(formatDateForInput(today));
    filterDataByDateRange(subscriptionData, formatDateForInput(sevenDaysAgo), formatDateForInput(today));
  };

  const handleLastThirtyDays = () => {
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setStartDate(formatDateForInput(thirtyDaysAgo));
    setEndDate(formatDateForInput(today));
    filterDataByDateRange(subscriptionData, formatDateForInput(thirtyDaysAgo), formatDateForInput(today));
  };

  const handleThisMonth = () => {
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    setStartDate(formatDateForInput(firstDayOfMonth));
    setEndDate(formatDateForInput(today));
    filterDataByDateRange(subscriptionData, formatDateForInput(firstDayOfMonth), formatDateForInput(today));
  };

  const handleLastMonth = () => {
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    setStartDate(formatDateForInput(firstDayLastMonth));
    setEndDate(formatDateForInput(lastDayLastMonth));
    filterDataByDateRange(subscriptionData, formatDateForInput(firstDayLastMonth), formatDateForInput(lastDayLastMonth));
  };

  const handleRefreshData = () => {
    fetchSubscriptionData();
    fetchCorrelationData();
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Typography variant="h5">Loading subscription data...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, backgroundColor: '#ffebee' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Data
          </Typography>
          <Typography variant="body1" paragraph>
            {error}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleRefreshData}>
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Subscription Trends Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Analyze subscription patterns across companies and roles
          </Typography>
        </div>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleRefreshData}
          startIcon={<span role="img" aria-label="refresh">🔄</span>}
        >
          Refresh Data
        </Button>
      </Box>
      <Divider sx={{ mt: 1, mb: 3 }} />
      {/* MODIFIED: Trending Roles Section with thinner cards, all white, and using #N format */}
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            mb: 3,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '4px solid #FF5722', // Orange highlight border
            backgroundColor: '#FFF8E1', // Light warm background to make it stand out
          }}
          elevation={1}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box component="span" sx={{ mr: 1, fontSize: '1.2rem' }}><TrendingUpIcon></TrendingUpIcon></Box>
            <Typography variant="h6" component="div">
              Top 5 Trending Roles
            </Typography>
          </Box>

          {trendingRoles.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 1 }}>
              {trendingRoles.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'inline-flex',
                  }}
                >
                  <Paper
                    sx={{
                      py: 1,
                      px: 2,
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.primary',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {`#${index + 1} ${item.role}`}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40px' }}>
              <Typography variant="body2" color="text.secondary">
                No trending data available for the last 7 days
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: '#f9f9f9',
        }}
      >
        <Typography variant="h6" gutterBottom component="div">
          Filter by Date Range
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="From"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
          />
          <TextField
            label="To"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleApplyFilter}
            sx={{ minWidth: '80px', height: '40px' }}
          >
            Apply
          </Button>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={handleLastSevenDays}>
            Last 7 days
          </Button>
          <Button variant="outlined" size="small" onClick={handleLastThirtyDays}>
            Last 30 days
          </Button>
          <Button variant="outlined" size="small" onClick={handleThisMonth}>
            This month
          </Button>
          <Button variant="outlined" size="small" onClick={handleLastMonth}>
            Last month
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 400,
            }}
            elevation={1}
          >
            <Typography variant="h6" gutterBottom component="div">
              Most Popular Companies
            </Typography>
            <Box sx={{ width: '100%', height: 300, position: 'relative' }} data-testid='Company-chart'>
              {companyChartData.labels.length > 0 ? (
                <Bar
                  
                  data={companyChartData}
                  options={chartOptions}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    No data available for the selected date range
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 400,
            }}
            elevation={1}
          >
            <Typography variant="h6" gutterBottom component="div">
              Most Popular Job Roles
            </Typography>
            <Box sx={{ width: '100%', height: 300, position: 'relative' }} data-testid='Role-chart'>
              {roleChartData.labels.length > 0 ? (
                <Bar
                  data={roleChartData}
                  options={chartOptions}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    No data available for the selected date range
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
            elevation={1}
          >
            <Typography variant="h6" gutterBottom component="div">
              Popular Company-Role Combinations
            </Typography>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="correlation table">
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell>Role</TableCell>
                    {/* <TableCell align="right">Number of Subscribers</TableCell> */}
                    <TableCell align="right">Percentage of Users</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {correlationData.length > 0 ? (
                    correlationData.map((row, index) => (
                      <TableRow
                        key={index}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {row.company}
                        </TableCell>
                        <TableCell>{row.role}</TableCell>
                        {/* <TableCell align="right">{row.count}</TableCell> */}
                        <TableCell align="right">{row.percentage}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No data available for the selected date range
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Subscription Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card elevation={1}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Subscriptions
                  </Typography>
                  <Typography variant="h4">
                    {filteredData.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card elevation={1}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Unique Companies
                  </Typography>
                  <Typography variant="h4">
                    {companyChartData.labels.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card elevation={1}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Unique Job Roles
                  </Typography>
                  <Typography variant="h4">
                    {roleChartData.labels.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};
export default Trends;