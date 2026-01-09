<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="card-title mb-0">Rank history</h5>
        <small class="text-muted">Lower rank is better</small>
      </div>

      <div v-if="!hasSeries" class="text-muted">
        No data yet. Enter domains and click Compare.
      </div>

      <div v-else style="height: 340px">
        <Line :data="chartData" :options="chartOptions" />
      </div>
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
  Title,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
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

function colorForIndex(i: number) {
  const hue = (i * 137.508) % 360;
  const border = `hsl(${hue} 85% 45%)`;
  return { border };
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
        const { border } = colorForIndex(idx);

        const map = new Map<string, number | null>();
        s.labels.forEach((d, i) => map.set(d, s.ranks[i] ?? null));

        return {
          label: s.domain,
          data: labels.map((d) => map.get(d) ?? null),
          borderColor: border,
          pointBackgroundColor: border,
          pointBorderColor: border,
          tension: 0.25,
          spanGaps: true,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
        };
      })
    : [];

  return { labels, datasets };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index" as const, intersect: false },
  plugins: {
    legend: { display: true, position: "bottom" as const },
    title: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    y: {
      reverse: true,
      title: { display: true, text: "Rank" },
      ticks: { precision: 0 },
    },
    x: {
      title: { display: true, text: "Date" },
    },
  },
};
</script>
