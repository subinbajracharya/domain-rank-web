<template>
  <div class="chart-wrapper">
    <div v-if="!hasSeries" class="empty-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
      <p class="text-muted mb-0">No data to display</p>
    </div>
    <div v-else class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

type Series = {
  domain: string;
  labels: string[];
  ranks: number[];
};

const props = defineProps<{
  data: Record<string, Series> | null;
}>();

const hasSeries = computed(() => {
  return !!props.data && Object.keys(props.data).length > 0;
});

const colorPalette = [
  {
    border: "#667eea",
    background: "rgba(102, 126, 234, 0.1)",
    point: "#667eea",
  },
  {
    border: "#f59e0b",
    background: "rgba(245, 158, 11, 0.1)",
    point: "#f59e0b",
  },
  {
    border: "#10b981",
    background: "rgba(16, 185, 129, 0.1)",
    point: "#10b981",
  },
  {
    border: "#ef4444",
    background: "rgba(239, 68, 68, 0.1)",
    point: "#ef4444",
  },
  {
    border: "#8b5cf6",
    background: "rgba(139, 92, 246, 0.1)",
    point: "#8b5cf6",
  },
  {
    border: "#ec4899",
    background: "rgba(236, 72, 153, 0.1)",
    point: "#ec4899",
  },
  {
    border: "#06b6d4",
    background: "rgba(6, 182, 212, 0.1)",
    point: "#06b6d4",
  },
  {
    border: "#84cc16",
    background: "rgba(132, 204, 22, 0.1)",
    point: "#84cc16",
  },
  {
    border: "#f97316",
    background: "rgba(249, 115, 22, 0.1)",
    point: "#f97316",
  },
  {
    border: "#6366f1",
    background: "rgba(99, 102, 241, 0.1)",
    point: "#6366f1",
  },
];

function colorForIndex(i: number) {
  return colorPalette[i % colorPalette.length];
}

const allDates = computed(() => {
  if (!props.data) return [];
  const set = new Set<string>();
  Object.values(props.data).forEach((s) => s.labels.forEach((d) => set.add(d)));
  return Array.from(set).sort();
});

const chartData = computed(() => {
  const labels = allDates.value;

  const datasets = props.data
    ? Object.values(props.data).map((s, idx) => {
        const colors = colorForIndex(idx);
        const map = new Map<string, number | null>();
        s.labels.forEach((d, i) => map.set(d, s.ranks[i] ?? null));

        return {
          label: s.domain,
          data: labels.map((d) => map.get(d) ?? null),
          borderColor: colors.border,
          backgroundColor: colors.background,
          pointBackgroundColor: colors.point,
          pointBorderColor: colors.border,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: colors.border,
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
          tension: 0.3,
          spanGaps: true,
          borderWidth: 2.5,
          fill: true,
        };
      })
    : [];

  return { labels, datasets };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: "bottom" as const,
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        padding: 20,
        font: {
          size: 12,
          weight: 500,
        },
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: "rgba(30, 41, 59, 0.95)",
      titleFont: {
        size: 13,
        weight: 600,
      },
      bodyFont: {
        size: 12,
      },
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      usePointStyle: true,
      callbacks: {
        label: function (context: any) {
          let label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed.y !== null) {
            label += "#" + context.parsed.y.toLocaleString();
          }
          return label;
        },
      },
    },
  },
  scales: {
    y: {
      reverse: true,
      title: {
        display: true,
        text: "Rank",
        font: {
          size: 12,
          weight: 500,
        },
        color: "#64748b",
      },
      ticks: {
        precision: 0,
        font: {
          size: 11,
        },
        color: "#94a3b8",
        callback: function (value: any) {
          return "#" + value;
        },
      },
      grid: {
        color: "rgba(226, 232, 240, 0.5)",
        drawBorder: false,
      },
      border: {
        display: false,
      },
    },
    x: {
      title: {
        display: true,
        text: "Date",
        font: {
          size: 12,
          weight: 500,
        },
        color: "#64748b",
      },
      ticks: {
        font: {
          size: 11,
        },
        color: "#94a3b8",
        maxRotation: 45,
        minRotation: 0,
      },
      grid: {
        display: false,
        drawBorder: false,
      },
      border: {
        display: false,
      },
    },
  },
  elements: {
    line: {
      tension: 0.3,
    },
  },
};
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  min-height: 300px;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #94a3b8;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}
</style>
