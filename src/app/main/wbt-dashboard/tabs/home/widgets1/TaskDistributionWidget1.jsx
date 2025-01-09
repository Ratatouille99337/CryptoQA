import Paper from '@mui/material/Paper';
import { lighten, useTheme, alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import FuseLoading from '@fuse/core/FuseLoading';
import axios from 'axios';
import { devApiLink } from './config';

function TaskDistributionWidget() {
    const theme = useTheme();
    const [series, setSeries] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    const ranges = {
        'male': 'Male',
        'female': 'Female',
        'trans': 'Transgender',
        'others': 'Others',
    };

    const labels = [
        'Very Good',
        'Fairly Good',
        'Fairly Bad',
        'Very Bad'
    ];

    useEffect(() => {
        axios.get(`${devApiLink}/survey/getdata1`) // Ensure API endpoint is correct
            .then(response => {
                const { surveyData } = response.data;
                const { male, female, trans, others } = surveyData;

                const fetchedSeries = {
                    male: male || [],
                    female: female || [],
                    trans: trans || [],
                    others: others || []
                };

                setSeries(fetchedSeries);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            });
    }, []); // Run only on mount

    const currentRange = Object.keys(ranges)[tabValue];

    const chartOptions = {
		chart: {
			fontFamily: 'inherit',
			foreColor: 'inherit',
			height: '100%',
			type: 'polarArea',
			toolbar: {
				show: false
			},
			zoom: {
				enabled: false
			}
		},
		colors: [
			alpha(theme.palette.success.main, 0.7),
			alpha(theme.palette.secondary.main, 0.7),
			alpha(theme.palette.warning.main, 0.7),
			alpha(theme.palette.error.main, 0.7)
		],
		labels: labels,
		legend: {
			position: 'bottom'
		},
		plotOptions: {
			polarArea: {
				spokes: {
					connectorColors: theme.palette.divider
				},
				rings: {
					strokeColor: theme.palette.divider
				}
			}
		},
		states: {
			hover: {
				filter: {
					type: 'darken',
					value: 0.75
				}
			}
		},
		stroke: {
			width: 2
		},
		theme: {
			monochrome: {
				enabled: false,
			}
		},
		tooltip: {
			followCursor: true,
			theme: 'dark',
			y: {
				formatter: (val) => `${(Math.round(val * 10) / 10).toFixed(0)}` // Add % after value
			}
		},
		dataLabels: {
			enabled: true,
			formatter: (val) => `${(Math.round(val * 10) / 10).toFixed(1)}%`, // Add % after value
			style: {
				fontSize: '14px',
				colors: ['#000'] // Adjust color if needed
			},
			dropShadow: {
				enabled: false // Disable shadow to ensure transparency
			},
			background: {
				enabled: false // Ensure transparency
			}
		},
		yaxis: {
			show: false // Hide y-axis scale numbers
		}
	};

    if (isLoading || !series[currentRange]) {
        return <FuseLoading />;
    }

    return (
        <Paper className="flex flex-col flex-auto p-24 shadow rounded-2xl overflow-hidden h-full">
            <div className="flex flex-col sm:flex-row items-start justify-between">
                <Typography className="text-lg font-medium tracking-tight leading-6 truncate">
                    Sleep Quality Distribution
                </Typography>
                <div className="mt-3 sm:mt-0 sm:ml-2">
                    <Tabs
                        value={tabValue}
                        onChange={(ev, value) => setTabValue(value)}
                        indicatorColor="secondary"
                        textColor="inherit"
                        variant="scrollable"
                        scrollButtons={false}
                        className="-mx-4 min-h-40"
                        classes={{ indicator: 'flex justify-center bg-transparent w-full h-full' }}
                        TabIndicatorProps={{
                            children: (
                                <Box
                                    sx={{ bgcolor: 'text.disabled' }}
                                    className="w-full h-full rounded-full opacity-20"
                                />
                            )
                        }}
                    >
                        {Object.entries(ranges).map(([key, label]) => (
                            <Tab
                                className="text-14 font-semibold min-h-40 min-w-64 mx-4 px-12"
                                disableRipple
                                key={key}
                                label={label}
                            />
                        ))}
                    </Tabs>
                </div>
            </div>
            <div className="flex flex-col flex-auto mt-6">
                <ReactApexChart
                    className="flex-auto w-full"
                    options={chartOptions}
                    series={series[currentRange]}
                    type="polarArea"
                />
            </div>
        </Paper>
    );
}

export default memo(TaskDistributionWidget);