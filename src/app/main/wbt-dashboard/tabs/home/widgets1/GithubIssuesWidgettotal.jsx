import React, { memo, useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ReactApexChart from 'react-apexcharts';
import FuseLoading from '@fuse/core/FuseLoading';
import axios from 'axios';
import { devApiLink } from './config';

function GithubIssuesWidget() {
    const theme = useTheme();
    const [series, setSeries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const labels = ['High Blood Pressure', 'Cholesterol', 'Thyroid', 'Heart Disease'];

    useEffect(() => {
        // Fetch the data from the backend
        axios.get(`${devApiLink}/survey/getdata6`)
            .then(response => {
                const { male, female, trans, others } = response.data.surveyData;

                // Set the series using the fetched data
                setSeries([
                    { name: 'Male', data: male || [0, 0, 0, 0] },
                    { name: 'Female', data: female || [0, 0, 0, 0] },
                    { name: 'Transgender', data: trans || [0, 0, 0, 0] },
                    { name: 'Others', data: others || [0, 0, 0, 0] }
                ]);

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

    const chartOptions = {
        chart: {
            fontFamily: 'inherit',
            foreColor: 'inherit',
            height: '100%',
            type: 'bar',
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        plotOptions: {
            bar: {
                horizontal: false, // Set bars to be vertical
                columnWidth: '50%', // Adjust according to your needs
                distributed: false
            }
        },
        colors: [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.warning.main,
            theme.palette.error.main
        ],
        dataLabels: {
            enabled: false
        },
        grid: {
            borderColor: theme.palette.divider
        },
        legend: {
            position: 'bottom'
        },
        xaxis: {
            categories: labels,
            axisBorder: { show: false },
            axisTicks: { color: theme.palette.divider },
            labels: {
                style: {
                    colors: theme.palette.text.secondary
                }
            }
        },
        yaxis: {
            labels: {
                offsetX: -16,
                style: {
                    colors: theme.palette.text.secondary
                }
            }
        },
        tooltip: {
            theme: theme.palette.mode
        },
        states: {
            hover: {
                filter: { type: 'darken', value: 0.75 }
            }
        }
    };

    return (
        <Paper className="flex flex-col flex-auto p-24 shadow rounded-2xl overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start justify-between">
                <Typography className="text-lg font-medium tracking-tight leading-6 truncate">
                    Questionnaire on Lifestyle and Medical Conditions
                </Typography>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-1 grid-flow-row gap-24 w-full mt-32 sm:mt-16">
                <div className="flex flex-col flex-auto">
                    <Typography className="font-medium" color="text.secondary">
                        Disease Comparison
                    </Typography>
                    <div className="flex flex-col flex-auto">
                        <ReactApexChart
                            className="flex-auto w-full"
                            options={chartOptions}
                            series={series}
                            height={320}
                            type="bar"
                        />
                    </div>
                </div>
            </div>
        </Paper>
    );
}

export default memo(GithubIssuesWidget);