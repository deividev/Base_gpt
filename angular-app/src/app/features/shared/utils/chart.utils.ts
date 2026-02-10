/**
 * Chart.js utility functions for data transformation and manipulation
 */

export interface ChartDataset {
  label: string;
  data: number[] | { x: number; y: number; r?: number }[];
  backgroundColor: string | string[];
  borderColor: string | string[];
  borderWidth: number;
  borderRadius?: number;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
}

export interface ChartData {
  labels?: string[];
  datasets: ChartDataset[];
}

/**
 * Transforms multi-dataset structure to single-dataset with color arrays.
 * Used for radial chart types (Pie, Doughnut, Polar Area, Radar) that work better
 * with one dataset containing multiple segments with different colors.
 * 
 * @param data - The original chart data with multiple datasets
 * @param datasetType - Type of dataset for labeling ('hours' | 'team' | 'projects')
 * @returns Transformed chart data with a single dataset and color arrays
 */
export function transformToRadialDataset(data: ChartData, datasetType: string = 'projects'): ChartData {
  // If already a single dataset, return as is
  if (data.datasets.length === 1) {
    return data;
  }

  // Extract colors and labels from multiple datasets
  const colors = data.datasets.map(ds => ds.backgroundColor as string);
  const borderColors = data.datasets.map(ds => ds.borderColor as string);
  const labels = data.datasets.map(ds => ds.label);

  // Get average value from each dataset for radial visualization
  const values = data.datasets.map(ds => {
    const dataArray = ds.data as number[];
    return Math.round(dataArray.reduce((a, b) => a + b, 0) / dataArray.length);
  });

  // Determine the label based on dataset type
  const labelMap: { [key: string]: string } = {
    hours: 'Average Hours',
    team: 'Team Members',
    projects: 'Average Projects'
  };

  return {
    labels: labels,
    datasets: [{
      label: labelMap[datasetType] || 'Data',
      data: values,
      backgroundColor: colors,
      borderColor: borderColors,
      borderWidth: 2
    }]
  };
}

/**
 * Checks if a chart type is radial (requires single dataset with color arrays)
 * 
 * @param chartType - The type of chart
 * @returns True if the chart type is radial
 */
export function isRadialChartType(chartType: string): boolean {
  return ['pie', 'doughnut', 'polarArea', 'radar'].includes(chartType);
}

/**
 * Checks if a chart type requires specialized data format (x, y, r coordinates)
 * 
 * @param chartType - The type of chart
 * @returns True if the chart type requires specialized data
 */
export function isSpecializedChartType(chartType: string): boolean {
  return ['bubble', 'scatter'].includes(chartType);
}
