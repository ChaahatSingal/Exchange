import {
  createChart,
  CrosshairMode,
  UTCTimestamp,
  DeepPartial,
  TimeChartOptions,
  
  CandlestickSeries,
} from "lightweight-charts";

interface CandlestickData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

export class ChartManager {
  private chart: ReturnType<typeof createChart>;
  private candleSeries: ReturnType<typeof this.chart.addSeries>;

  constructor(ref: HTMLElement, initialData: CandlestickData[]) {
    const chartOptions: DeepPartial<TimeChartOptions> = {
      layout: {
        textColor: "black",
        background: { color: "white" }, // Fixed background type
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        visible: true,
      },
      grid: {
        horzLines: { visible: false },
        vertLines: { visible: false },
      },
    };

    // Create the chart
    this.chart = createChart(ref, chartOptions);

    // Add Candlestick Series using the new API
    this.candleSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    
    // Set Initial Data
    this.candleSeries.setData(initialData);
    this.chart.timeScale().fitContent();
  }

  public update(updatedPrice: CandlestickData) {
    this.candleSeries.update(updatedPrice);
  }

  public destroy() {
    this.chart.remove();
  }
}

/*
import {
  createChart,
  CrosshairMode,
  SeriesType,
  ISeriesApi,
  UTCTimestamp,
  DeepPartial,
  TimeChartOptions,
} from "lightweight-charts";

interface CandlestickData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

export class ChartManager {
  private candleSeries: ISeriesApi<'Candlestick'>;
  private chart: ReturnType<typeof createChart>;

  constructor(ref: HTMLElement, initialData: CandlestickData[]) {
    const chartOptions: DeepPartial<TimeChartOptions> = {
      layout: {
        textColor: 'black',
        background: {
          color: 'white', // ✅ Only color is allowed now
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        visible: true,
      },
      grid: {
        horzLines: { visible: false },
        vertLines: { visible: false },
      },
    };

    this.chart = createChart(ref, chartOptions);

    this.candleSeries = this.chart.addSeries(SeriesType.Candlestick, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    this.candleSeries.setData(initialData);
    this.chart.timeScale().fitContent();
  }

  public update(updatedPrice: CandlestickData) {
    this.candleSeries.update(updatedPrice);
  }

  public destroy() {
    this.chart.remove();
  }
}
*/