import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import Box from '@mui/material/Box';
import FuseLoading from '@fuse/core/FuseLoading';
import axios from 'axios';
import { devApiLink } from './config';

function GithubIssuesWidget() {
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
        'Extremely alert', 'Very alert', 'Alert', 'Rather alert',
        'Neither alert nor sleepy', 'Some sign of sleepiness',
        'Sleepy, but no effort to keep awake', 'Sleepy, but some effort to keep awake',
        'Very sleepy, great effort to keep awake, fighting sleep', 'Extremely sleepy, can not keep awake'
    ];

    useEffect(() => {
        axios.get(`${devApiLink}/survey/getdata2`)
            .then(response => {
                const { surveyData } = response.data;
                const { male, female, trans, others } = surveyData;

                const fetchedSeries = {
                    male: [{ name: "Sleepiness Scale", type: "line", data: male || [] }],
                    female: [{ name: "Sleepiness Scale", type: "line", data: female || [] }],
                    trans: [{ name: "Sleepiness Scale", type: "line", data: trans || [] }],
                    others: [{ name: "Sleepiness Scale", type: "line", data: others || [] }]
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
            type: 'line',
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        colors: [theme.palette.primary.main, theme.palette.secondary.main],
        labels,
        dataLabels: {
            enabled: true,
            background: { borderWidth: 0 }
        },
        grid: { borderColor: theme.palette.divider },
        legend: { show: false },
        plotOptions: {
            bar: { columnWidth: '50%' }
        },
        states: {
            hover: {
                filter: { type: 'darken', value: 0.75 }
            }
        },
        stroke: { width: [3, 0] },
        tooltip: {
            followCursor: true,
            theme: theme.palette.mode
        },
        xaxis: {
            axisBorder: { show: false },
            axisTicks: { color: theme.palette.divider },
            labels: {
                style: { colors: theme.palette.text.secondary }
            },
            tooltip: { enabled: false }
        },
        yaxis: {
            labels: {
                offsetX: -16,
                style: { colors: theme.palette.text.secondary }
            }
        }
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
            <div className="grid grid-cols-1 lg:grid-cols-1 grid-flow-row gap-24 w-full mt-32 sm:mt-32">
                <div className="flex flex-col flex-auto">
                    <Typography className="font-medium" color="text.secondary">
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