import { QueryResult, ResultRow, Schema } from "src/rpc/api";

export type TrendSeries = {
  name: string,
  data: TrendResultData[],
};

export type TrendResultData = {
  date: string,
  count: number,
};

export const convertTrendData = (breakdownResult: QueryResult): TrendSeries[] => {
  return breakdownResult.data.map(eventData => {
    const data: TrendResultData[] = [];
    // Start at index 1 since first column is the event name
    for (let i = 1; i < eventData.length; i++) {
      data.push({ date: breakdownResult.schema[i].name, count: eventData[i] as number });
    }

    // First column is the event name in the breakdown data
    const series: TrendSeries = { name: eventData[0] as string, data: data };

    return series;
  });
};

export const toTrendBreakdown = (results: QueryResult[]): QueryResult => {
  const { minDate, maxDate } = getDateRange(results);
  const range: Date[] = [];
  for (let d = new Date(minDate); d.getTime() <= maxDate.getTime(); d.setTime(d.getTime() + 86400000)) {
    range.push(new Date(d));
  }

  const schema: Schema = [{ name: "Event", type: "string" }, ...range.map(d => ({ name: getDateStringInUTC(d), type: "string" }))];
  const data = results.map(result => {
    const dataMap = new Map(result.data.map(row => {
      return [
        new Date(row[2]).getTime(),
        row[1] as number,
      ];
    }));

    // All the rows should have the event name as the first column
    const series: ResultRow = [result.data[0][0]];
    range.forEach(d => {
      series.push(dataMap.get(d.getTime()) || 0);
    });

    return series;
  });

  return { success: true, error_message: "", schema: schema, data: data };
};


export type DateRange = {
  minDate: Date,
  maxDate: Date,
};

export const getDateRange = (results: QueryResult[]): DateRange => {
  // Min and max dates per RFC: http://ecma-international.org/ecma-262/5.1/#sec-15.9.1.1
  // TODO: use the date range specified in the query itself
  let minDate: Date = new Date(8640000000000000);
  let maxDate: Date = new Date(-8640000000000000);
  results.forEach(result => {
    result.data.forEach(row => {
      const date = new Date(row[2]);
      if (date < minDate) {
        minDate = date;
      }

      if (date > maxDate) {
        maxDate = date;
      }
    });
  });

  return { minDate, maxDate };
};

export const getDateStringInUTC = (d: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[d.getUTCMonth()] + " " + d.getUTCDate() + " " + d.getUTCFullYear();
};

export type FunnelResult = {
  name: string,
  count: number,
  percentage: number,
  conversionFromPrevious?: number,
};

export const convertFunnelData = (results: QueryResult): FunnelResult[] => {
  return results.data.map(result => {
    return {
      name: result[1] as string,
      count: result[0] as number,
      percentage: +((result[2] as number) * 100).toFixed(2),
    };
  });
};