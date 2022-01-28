import { getStyle, hexToRgba } from '@coreui/utils';
import { isDefined } from './utils';

const colors = ["succes", "info", "warning", "danger", "primary"];

export const brandSuccess = getStyle('success') || '#4dbd74';
export const brandInfo = getStyle('info') || '#20a8d8';
export const brandDanger = getStyle('danger') || '#f86c6b';

export const getOptions = (max) => ({
    maintainAspectRatio: false,
    legend: {
        display: false
    },
    scales: {
        xAxes: [{
        gridLines: {
            drawOnChartArea: false
        }
        }],
        yAxes: [{
        ticks: {
            beginAtZero: true,
            maxTicksLimit: 5,
            stepSize: Math.ceil(max / 5),
            max: max
        },
        gridLines: {
            display: true
        }
        }]
    },
    elements: {
        point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 3
        }
    }
});

export const getFormattedDatas = datas => {
    return datas.map(d => {
        const { data, label, color, borderWidth, backgroundColor, dash } = d;
        const formattedData = {
            data,
            label,
            borderWidth,
            borderColor: color,
            pointHoverBackgroundColor: color,
            backgroundColor: !isDefined(backgroundColor) ? 'transparent' : hexToRgba(backgroundColor, 10),
        };
        return isDefined(dash) ? {...formattedData, borderDash: dash} : formattedData;
    });
};

export const getProgressColor = index => colors[index];