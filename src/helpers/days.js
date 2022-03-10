import { isDefined, isDefinedAndNotVoid } from "./utils";

const dayNames = [
    {value: 1, label: "Lu"},
    {value: 2, label: "Ma"},
    {value: 3, label: "Me"},
    {value: 4, label: "Je"},
    {value: 5, label: "Ve"},
    {value: 6, label: "Sa"},
];

export const getWeekDays = () => {
    return [
        {value: 1, label: "LUNDI", isFixed: false},
        {value: 2, label: "MARDI", isFixed: false},
        {value: 3, label: "MERCREDI", isFixed: false},
        {value: 4, label: "JEUDI", isFixed: false},
        {value: 5, label: "VENDREDI", isFixed: false},
        {value: 6, label: "SAMEDI", isFixed: false},
        {value: 0, label: "DIMANCHE", isFixed: false}
    ];
};

export const formatUTC = dates => {
    return {
        start: new Date(dates.start.toUTCString()), 
        end: new Date(dates.end.toUTCString())
    };
}

export const getStringDate = date => {
    return date.getFullYear() + "-" + getTwoDigits(date.getMonth() + 1) + "-" + getTwoDigits(date.getDate());
};

export const getArchiveDate = date => {
    return "" + getTwoDigits(date.getDate()) + getTwoDigits(date.getMonth() + 1) + date.getFullYear();
};

export const getTwoDigits = number => {
    return number < 10 ? '0' + number : number;
};

export const isSameDate = (date1, date2) => date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();

export const isSameTime = (date1, date2) => date1.getHours() === date2.getHours() && date1.getMinutes() === date2.getMinutes() && date1.getSeconds() === date2.getSeconds();

export const isBetween = (date, start, end) => {
    return new Date(date) >= new Date(start) && new Date(date) <= new Date(end);
};

export const getDateFrom = (date, nbDaysToAdd = 0, hour = 9) => {
    return new Date(date.getFullYear(), date.getMonth(), (date.getDate() + nbDaysToAdd), hour, 0, 0);
};

export const getDayName = date => dayNames.find(d => d.value === date.getDay()).label;

export const isPastHour = date => {
    const now = new Date();
    const originalDate = new Date(date);
    const compare = new Date(now.getFullYear(), now.getMonth(), now.getDate(), originalDate.getHours(), originalDate.getMinutes(), 0);
    return compare.getTime() < now.getTime();
};

export const getUTCDates = dates => {
    const UTCStart = new Date(dates.start.getFullYear(), dates.start.getMonth(), dates.start.getDate(), 4, 0, 0);
    const UTCEnd = new Date(dates.end.getFullYear(), dates.end.getMonth(), dates.end.getDate() + 1, 3, 59, 0);
    return {start: UTCStart, end: UTCEnd};
};