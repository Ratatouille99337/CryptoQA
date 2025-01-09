import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import Box from '@mui/material/Box';
import FuseLoading from '@fuse/core/FuseLoading';
import axios from 'axios';
import { devApiLink } from './config';
import { alpha, useTheme } from '@mui/material/styles';


function GithubIssuesWidget() {
    const theme = useTheme();
    const [series, setSeries] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    const labels = ['Definitely Morning Type', 'Moderately Morning Type', 'Neither Type', 'Moderately Evening Type', 'Definitely Evening Type'];

    const ranges = {
        'male': 'Male',
        'female': 'Female',
        'trans': 'Transgender',
        'others': 'Others',
    };

    useEffect(() => {
        axios.get(`${devApiLink}/survey/getdata5`)
            .then(response => {
                const { surveyData } = response.data;
                const { male, female, trans, others } = surveyData;

                const fetchedSeries = {
                    male: [{ name: "Frequency", type: "column", data: male || [] }],
                    female: [{ name: "Frequency", type: "column", data: female || [] }],
                    trans: [{ name: "Frequency", type: "column", data: trans || [] }],
                    others: [{ name: "Frequency", type: "column", data: others || [] }]
                };

                setSeries(fetchedSeries);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <FuseLoading />;
    }

    const currentRange = Object.keys(ranges)[tabValue];

	const chartOptions = {
		chart: {
			fontFamily: 'inherit',
			foreColor: 'inherit',
			height: '100%',
			type: 'bar',
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
		tooltip: {
			followCursor: true,
			theme: 'dark'
		},
		yaxis: {
            min: 0, // Start y-axis at 0
            forceNiceScale: true, // Makes ApexCharts adjust the ticks to "nice" numbers for readability
            labels: {
                formatter: val => val.toFixed(0), // Ensure integer values
                style: {
                    colors: theme.palette.text.secondary
                }
            }
        },
	};

    return (
        <Paper className="flex flex-col flex-auto p-24 shadow rounded-2xl overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start justify-between">
                <Typography className="text-lg font-medium tracking-tight leading-6 truncate">
				Karolinska Sleepiness Scale
                </Typography>
                <div className="mt-12 sm:mt-0 sm:ml-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-1 grid-flow-row gap-24 w-full mt-32 sm:mt-16">
                <div className="flex flex-col flex-auto">
                    <Typography
                        className="font-medium"
                        color="text.secondary"
                    >
                        Line Graph of Alertness Levels and Their Frequencies
                    </Typography>
                    <div className="flex flex-col flex-auto">
                        <ReactApexChart
                            className="flex-auto w-full"
                            options={chartOptions}
                            series={series[currentRange]}
                            height={320}
                        />
                    </div>
                </div>
            </div>
        </Paper>
    );
}

export default memo(GithubIssuesWidget);