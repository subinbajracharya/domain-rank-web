<template>
  <div class="container py-4">
    <header class="mb-4">
      <h1 class="fw-bold">Domain Ranking App</h1>
      <p class="text-muted mb-0">
        Compare domain popularity over time using rankings from the Tranco API.
        Add up to 10 domains to view their rank history and latest changes.
      </p>
    </header>

    <div class="row g-3">
      <!-- Left: Form -->
      <div class="col-12 col-lg-4">
        <DomainForm
          :initial-domains="domainsFromRoute"
          @submit="onSubmit"
          @clear="onClear"
        />

        <div v-if="error" class="alert alert-danger mt-3 mb-0" role="alert">
          {{ error }}
        </div>
      </div>

      <!-- Right: Results -->
      <div class="col-12 col-lg-8">
        <!-- Loading state -->
        <div
          v-if="pending"
          class="alert alert-info mb-3 mb-0 d-flex align-items-center gap-2"
          role="alert"
        >
          <div
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></div>
          <div>
            <div class="fw-semibold">Fetching rankings…</div>
            <small class="text-muted">Please wait a moment.</small>
          </div>
        </div>

        <!-- Results state -->
        <div
          v-if="data && Object.keys(data).length"
          class="d-flex flex-column gap-3"
        >
          <RankChart :data="data" />

          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-3">Latest ranks</h5>

              <div class="table-responsive">
                <table class="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Latest date</th>
                      <th class="text-end">Rank</th>
                      <th class="text-end">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in latestList" :key="item.domain">
                      <td class="fw-semibold">{{ item.domain }}</td>
                      <td class="text-muted">{{ item.date }}</td>
                      <td class="text-end fw-semibold">{{ item.rank }}</td>
                      <td class="text-end">
                        <span v-if="item.change === null" class="text-muted"
                          >—</span
                        >

                        <span
                          v-else
                          class="fw-semibold"
                          :class="
                            item.change > 0
                              ? 'text-danger'
                              : item.change < 0
                              ? 'text-success'
                              : 'text-muted'
                          "
                        >
                          {{
                            item.change > 0 ? "↓" : item.change < 0 ? "↑" : "→"
                          }}
                          {{ Math.abs(item.change) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">No data</h5>
            <small class="d-block text-muted mb-0">
              Enter domains and click <strong>Compare</strong> to see the chart
              and ranks.
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

type ApiSeries = { domain: string; labels: string[]; ranks: number[] };
type ApiResponse = Record<string, ApiSeries>;
type LatestItem = {
  domain: string;
  date: string;
  rank: number;
  change: number | null;
};

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

const apiBase = config.public.apiBase;

const pending = ref(false);
const error = ref<string | null>(null);
const data = ref<ApiResponse | null>(null);

function readDomainsFromRoute(): string[] {
  const domainsParam = route.query.domains;

  if (!domainsParam) return [];

  const domainsStr = Array.isArray(domainsParam)
    ? domainsParam.join(",")
    : domainsParam;

  return domainsStr
    .split(",")
    .map((s) => decodeURIComponent(s.trim()))
    .filter(Boolean);
}

const domainsFromRoute = computed(() => readDomainsFromRoute());

function setUrlDomains(domains: string[]) {
  if (domains.length) {
    const pathParam = domains.map(encodeURIComponent).join(",");
    router.push({
      query: { domains: pathParam },
    });
  } else {
    router.push({
      query: {},
    });
  }
}

async function fetchRankings(domains: string[]) {
  pending.value = true;
  error.value = null;
  data.value = null;

  try {
    const pathParam = domains.map(encodeURIComponent).join(",");
    const url = `${apiBase}/rankings/${pathParam}`;

    const res = await $fetch<ApiResponse>(url);
    data.value = res;
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || "Failed to fetch rankings";
  } finally {
    pending.value = false;
  }
}

async function onSubmit(domains: string[]) {
  if (!domains.length) {
    error.value = "Please enter at least one domain.";
    return;
  }
  setUrlDomains(domains);
  await fetchRankings(domains);
}

function onClear() {
  setUrlDomains([]);
  data.value = null;
  error.value = null;
}

onMounted(async () => {
  const domains = readDomainsFromRoute();
  if (domains.length) await fetchRankings(domains);
});

const latestList = computed<LatestItem[]>(() => {
  if (!data.value) return [];

  return Object.values(data.value)
    .map((s) => {
      const last = s.labels.length - 1;
      if (last < 0) return null;

      const prev = last - 1;

      const latestRank = s.ranks[last];
      const prevRank = prev >= 0 ? s.ranks[prev] : null;

      if (typeof latestRank !== "number") return null;

      return {
        domain: s.domain,
        date: s.labels[last],
        rank: latestRank,
        change: typeof prevRank === "number" ? latestRank - prevRank : null,
      };
    })
    .filter((x): x is LatestItem => x !== null);
});
</script>
