<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, shallowRef } from "vue";
import { useI18n } from "vue-i18n";

// Lazy-loaded on client only (these crash SSR due to web-worker dependency)
const snippetzFn = shallowRef<any>(null);
const hljsInstance = shallowRef<any>(null);
const isClientReady = ref(false);

onMounted(async () => {
  // Dynamic imports for browser-only libs
  const [{ snippetz }, hljs, json, xml, javascript, python, bash, php, go] = await Promise.all([
    import("@scalar/snippetz"),
    import("highlight.js/lib/core"),
    import("highlight.js/lib/languages/json"),
    import("highlight.js/lib/languages/xml"),
    import("highlight.js/lib/languages/javascript"),
    import("highlight.js/lib/languages/python"),
    import("highlight.js/lib/languages/bash"),
    import("highlight.js/lib/languages/php"),
    import("highlight.js/lib/languages/go")
  ]);

  hljs.default.registerLanguage("json", json.default);
  hljs.default.registerLanguage("xml", xml.default);
  hljs.default.registerLanguage("javascript", javascript.default);
  hljs.default.registerLanguage("python", python.default);
  hljs.default.registerLanguage("bash", bash.default);
  hljs.default.registerLanguage("shell", bash.default);
  hljs.default.registerLanguage("php", php.default);
  hljs.default.registerLanguage("go", go.default);

  snippetzFn.value = snippetz;
  hljsInstance.value = hljs.default;
  isClientReady.value = true;
});

interface Props {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url?: string;
  description?: string;
  variables?: Record<string, string>;
  headers?: Record<string, string>;
  body?: any;
  responseSample?: any;
}

const props = withDefaults(defineProps<Props>(), {
  method: "GET",
  url: "",
  description: "",
  variables: () => ({}),
  headers: () => ({}),
  body: null,
  responseSample: null,
});

const { t } = useI18n();

// --- State ---
const activeLanguage = ref(0);
const activeRequestTab = ref("params");
const activeResponseTab = ref("body");
const mainViewMode = ref<'request' | 'sample' | 'live'>('request'); // Main tabs
const loading = ref(false);
const response = ref<any>(null); // This is the live response object
const error = ref<string | null>(null);
const copied = ref(false);
const showResponse = ref(false);
const flashSuccess = ref(false);
const isModalOpen = ref(false);
const showCopyTooltip = ref(false);

// Editable state
const editableVariables = ref<Record<string, string>>({});
const editableBody = ref<string>("");
const editableHeaders = ref<Record<string, string>>({});

// Sensitive header visibility (for password toggle)
const hiddenHeaders = ref<Set<string>>(new Set(['Authorization', 'X-API-Key', 'Api-Key', 'Secret']));
const visibleSecrets = ref<Set<string>>(new Set());

// JSON validation state
const isBodyValid = ref(true);
const bodyError = ref<string>("");

// Robust Prop Parsing (for MDC)
const ensureObject = (val: any): Record<string, any> => {
  if (!val) return {};
  if (typeof val === 'object' && !Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      // Replace single quotes with double quotes for JSON.parse if needed
      const jsonStr = val.trim().startsWith('{') ? val : `{${val}}`;
      return JSON.parse(jsonStr.replace(/'/g, '"'));
    } catch (e) {
      console.warn('ApiPlayground: Failed to parse prop as object', val, e);
      return {};
    }
  }
  return {};
};

// Initialize from props
onMounted(() => {
  editableVariables.value = ensureObject(props.variables);
  editableHeaders.value = ensureObject(props.headers);
  editableBody.value = props.body ? (typeof props.body === 'string' ? props.body : JSON.stringify(props.body, null, 2)) : "";
  validateBody();

  // --- Persistent Token Logic ---
  const storedToken = localStorage.getItem('ds_api_token');
  if (storedToken) {
    Object.keys(editableVariables.value).forEach(k => {
      const lowerKey = k.toLowerCase();
      // Auto-fill if it looks like a token placeholder
      if (isSensitiveHeader(k) && (
        editableVariables.value[k].includes('YOUR_') || 
        editableVariables.value[k].includes('VOTRE_') || 
        editableVariables.value[k] === 'TOKEN'
      )) {
        editableVariables.value[k] = storedToken;
      }
    });
  }
});

const persistToken = (val: string) => {
  if (!val || val.includes('YOUR_') || val.includes('VOTRE_')) return;
  
  // Smart extraction: if it's 'Bearer XXX', save only 'XXX'
  const tokenToSave = val.match(/^Bearer\s+(.+)$/i)?.[1] || val;
  
  localStorage.setItem('ds_api_token', tokenToSave);
  flashSuccess.value = true;
  setTimeout(() => flashSuccess.value = false, 1500);
};

const isValueSynced = (val: string) => {
  const stored = localStorage.getItem('ds_api_token');
  if (!stored) return false;
  return val.includes(stored);
};

// Watch for prop changes
watch(() => props.variables, (newVars) => {
  editableVariables.value = ensureObject(newVars);
}, { deep: true });

watch(() => props.headers, (newHeaders) => {
  editableHeaders.value = ensureObject(newHeaders);
}, { deep: true });

watch(() => props.body, (newBody) => {
  editableBody.value = newBody ? (typeof newBody === 'string' ? newBody : JSON.stringify(newBody, null, 2)) : "";
  validateBody();
}, { deep: true });

// Validate JSON body
const validateBody = () => {
  if (!editableBody.value.trim()) {
    isBodyValid.value = true;
    bodyError.value = "";
    return;
  }
  try {
    JSON.parse(editableBody.value);
    isBodyValid.value = true;
    bodyError.value = "";
  } catch (err: any) {
    isBodyValid.value = false;
    bodyError.value = err.message || "Invalid JSON";
  }
};

const highlightedBody = computed(() => {
  if (!editableBody.value) return "";
  try {
    if (!hljsInstance.value || !isBodyValid.value) return editableBody.value;
    return hljsInstance.value.highlight(editableBody.value, { language: "json" }).value;
  } catch {
    return editableBody.value;
  }
});

watch(editableBody, validateBody);

// Initialize main view mode if sample exists
onMounted(() => {
  if (props.responseSample && !response.value) {
    // We stay on request by default but we could auto-switch if preferred.
    // Let's stay on request to show the endpoint first.
  }
});
const formatBody = () => {
  if (!editableBody.value.trim()) return;
  try {
    const parsed = JSON.parse(editableBody.value);
    editableBody.value = JSON.stringify(parsed, null, 2);
  } catch {
    // Can't format invalid JSON
  }
};

// Toggle secret visibility
const toggleSecretVisibility = (key: string) => {
  if (visibleSecrets.value.has(key)) {
    visibleSecrets.value.delete(key);
  } else {
    visibleSecrets.value.add(key);
  }
  visibleSecrets.value = new Set(visibleSecrets.value); // Trigger reactivity
};

const isSensitiveHeader = (key: string) => {
  const lowerKey = key.toLowerCase();
  return lowerKey.includes('auth') || 
         lowerKey.includes('token') || 
         lowerKey.includes('secret') || 
         lowerKey.includes('key') ||
         lowerKey.includes('password');
};

const isSecretVisible = (key: string) => visibleSecrets.value.has(key);

// Add/remove headers
const newHeaderKey = ref("");
const newHeaderValue = ref("");
const addHeader = () => {
  if (newHeaderKey.value.trim()) {
    editableHeaders.value[newHeaderKey.value.trim()] = newHeaderValue.value;
    newHeaderKey.value = "";
    newHeaderValue.value = "";
  }
};
const removeHeader = (key: string) => {
  const newHeaders = { ...editableHeaders.value };
  delete newHeaders[key];
  editableHeaders.value = newHeaders;
};

// Reset to defaults
const resetToDefaults = () => {
  editableVariables.value = { ...props.variables };
  editableHeaders.value = { ...props.headers };
  editableBody.value = props.body ? JSON.stringify(props.body, null, 2) : "";
  response.value = null;
  error.value = null;
  showResponse.value = false;
};

const languages = [
  { label: "cURL", lang: "shell", client: "curl", hlLang: "bash", icon: "i-lucide-terminal", color: "blue" },
  { label: "JavaScript", lang: "js", client: "fetch", hlLang: "javascript", icon: "i-lucide-braces", color: "yellow" },
  { label: "Python", lang: "python", client: "requests", hlLang: "python", icon: "i-lucide-code", color: "sky" },
  { label: "PHP", lang: "php", client: "guzzle", hlLang: "php", icon: "i-lucide-file-code", color: "indigo" },
  { label: "Go", lang: "go", client: "native", hlLang: "go", icon: "i-lucide-zap", color: "cyan" },
];

const langColors: Record<string, string> = {
  blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  yellow: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  sky: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  indigo: "text-indigo-400 bg-indigo-400/10 border-indigo-500/20",
  cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
};

const methodColors: Record<string, { bg: string; text: string; glow: string; border: string }> = {
  GET: { bg: "bg-blue-500/10", text: "text-blue-500 dark:text-blue-400", glow: "", border: "border-blue-500/30" },
  POST: { bg: "bg-indigo-500/10", text: "text-indigo-500 dark:text-indigo-400", glow: "", border: "border-indigo-500/30" },
  PUT: { bg: "bg-slate-500/10", text: "text-slate-500 dark:text-slate-400", glow: "", border: "border-slate-500/30" },
  PATCH: { bg: "bg-slate-500/10", text: "text-slate-500 dark:text-slate-400", glow: "", border: "border-slate-500/30" },
  DELETE: { bg: "bg-red-500/10", text: "text-red-500 dark:text-red-400", glow: "", border: "border-red-500/30" },
};

const methodDescriptions: Record<string, string> = {
  GET: "Retrieve data from the server",
  POST: "Create a new resource",
  PUT: "Replace an existing resource",
  PATCH: "Partially update a resource",
  DELETE: "Remove a resource",
};

// --- Logic: Variable Replacement ---
const replaceVariables = (text: string) => {
  if (!text) return text;
  let result = text;
  for (const [key, value] of Object.entries(editableVariables.value || {})) {
    result = result.replace(new RegExp(`{${key}}`, "g"), value);
  }
  return result;
};

const pathVariables = computed(() => {
  const vars: Record<string, string> = {};
  const urlPattern = /{(\w+)}/g;
  const matches = Array.from(props.url?.matchAll(urlPattern) || []);
  for (const match of matches) {
    const key = (match as RegExpMatchArray)[1];
    if (editableVariables.value[key] !== undefined) {
      vars[key] = editableVariables.value[key];
    }
  }
  return vars;
});

const envVariables = computed(() => {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(editableVariables.value)) {
    if (!pathVariables.value[key]) {
      vars[key] = value;
    }
  }
  return vars;
});

const processedUrl = computed(() => replaceVariables(props.url));

const processedHeaders = computed(() => {
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(editableHeaders.value || {})) {
    headers[key] = replaceVariables(value);
  }
  return headers;
});

const processedBodyText = computed(() => replaceVariables(editableBody.value));

const processedBody = computed(() => {
  if (!processedBodyText.value) return null;
  try {
    return JSON.parse(processedBodyText.value);
  } catch {
    return processedBodyText.value;
  }
});

// --- Logic: Code Snippet Generation ---
const generateSnippet = (lang: string, client: string) => {
  const headersList = Object.entries(processedHeaders.value).map(([name, value]) => ({
    name,
    value,
  }));

  // Ensure 'Accept' header is present for a more professional look
  if (!headersList.some(h => h.name.toLowerCase() === 'accept')) {
    headersList.push({ name: 'Accept', value: 'application/json' });
  }

  const requestSpec: any = {
    url: processedUrl.value,
    method: props.method,
    headers: headersList,
  };

  if (editableBody.value && ["POST", "PUT", "PATCH"].includes(props.method)) {
    requestSpec.postData = {
      mimeType: "application/json",
      text: processedBodyText.value,
    };
  }

  try {
    if (!snippetzFn.value) return `// Loading generator...`;
    const result = snippetzFn.value().print(lang, client, requestSpec);
    return result || `// Error generating snippet`;
  } catch (err) {
    return `// Error generating snippet: ${err}`;
  }
};

const currentSnippet = computed(() => {
  const { lang, client } = languages[activeLanguage.value];
  return generateSnippet(lang, client);
});

const highlightedSnippet = computed(() => {
  const { hlLang } = languages[activeLanguage.value];
  if (!currentSnippet.value) return "";
  if (!hljsInstance.value) return currentSnippet.value;
  return hljsInstance.value.highlight(currentSnippet.value, { language: hlLang }).value;
});

const curlSnippet = computed(() => {
  const result = generateSnippet("shell", "curl");
  if (!hljsInstance.value) return result;
  return hljsInstance.value.highlight(result, { language: "bash" }).value;
});

const snippetLines = computed(() => {
  return currentSnippet.value.split("\n");
});

// --- Logic: Copy to Clipboard ---
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(currentSnippet.value);
    copied.value = true;
    showCopyTooltip.value = true;
    setTimeout(() => {
      copied.value = false;
      showCopyTooltip.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

const copyResponse = async () => {
  const dataToCopy = response.value ? response.value.body : props.responseSample;
  if (!dataToCopy) return;
  try {
    const text = typeof dataToCopy === 'object' 
      ? JSON.stringify(dataToCopy, null, 2) 
      : dataToCopy;
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
  } catch (err) {
    console.error("Failed to copy response:", err);
  }
};

// --- Logic: Execute Request ---
const executeRequest = async () => {
  if (!isBodyValid.value && editableBody.value.trim()) {
    return; // Don't execute with invalid JSON
  }

  loading.value = true;
  response.value = null;
  error.value = null;
  showResponse.value = true;
  flashSuccess.value = false;
  // Automatically switch to response tab if we were on one of the request tabs
  activeResponseTab.value = 'body';

  const startTime = Date.now();

  try {
    const options: RequestInit = {
      method: props.method,
      headers: processedHeaders.value,
    };

    if (editableBody.value && ["POST", "PUT", "PATCH"].includes(props.method)) {
      options.body = processedBodyText.value;
    }

    const res = await fetch(processedUrl.value, options);
    const duration = Date.now() - startTime;

    const rawText = await res.text();
    let body;
    try {
      body = JSON.parse(rawText);
    } catch {
      body = rawText;
    }

    const resHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      resHeaders[k] = v;
    });

    response.value = {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
      body,
      duration,
      size: typeof body === 'string' ? body.length : JSON.stringify(body).length,
    };

    if (res.status < 300) {
      flashSuccess.value = true;
      mainViewMode.value = 'live'; // Switch to Live view to see the result
      setTimeout(() => {
        flashSuccess.value = false;
      }, 1000);
    }
  } catch (err: any) {
    error.value = err.message || "An unknown error occurred";
    mainViewMode.value = 'live'; // Switch to Live view to show error
  } finally {
    loading.value = false;
  }
};

// Keyboard shortcut
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    executeRequest();
  }
};

const formattedResponseBody = computed(() => {
  if (!response.value) return "";
  const content =
    typeof response.value.body === "object"
      ? JSON.stringify(response.value.body, null, 2)
      : response.value.body;

  if (typeof response.value.body === "object") {
    try {
       if (!hljsInstance.value) return content;
       return hljsInstance.value.highlight(content, { language: "json" }).value;
    } catch {
       return content;
    }
  }
  
  // Handle HTML/XML responses gracefully
  if (typeof content === 'string' && content.trim().startsWith('<')) {
    try {
      if (!hljsInstance.value) return content;
      return hljsInstance.value.highlight(content, { language: "xml" }).value;
    } catch {
      return content;
    }
  }

  return content;
});

const formattedResponseSample = computed(() => {
  if (!props.responseSample) return "";
  try {
    const data = typeof props.responseSample === 'string' ? JSON.parse(props.responseSample) : props.responseSample;
    return JSON.stringify(data, null, 2);
  } catch {
    return String(props.responseSample);
  }
});

const highlightedResponseSample = computed(() => {
  if (!formattedResponseSample.value || !hljsInstance.value) return formattedResponseSample.value;
  return hljsInstance.value.highlight(formattedResponseSample.value, { language: "json" }).value;
});

const responseStatusColor = computed(() => {
  if (!response.value) return "neutral";
  if (response.value.status < 300) return "success";
  if (response.value.status < 400) return "info";
  if (response.value.status < 500) return "warning";
  return "error";
});

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};
</script>

<template>
  <div
    class="api-playground group my-8 mb-12 rounded-2xl overflow-hidden transition-all duration-500 ease-in-out"
    :class="{ 
      'ring-1 ring-indigo-500/40 shadow-2xl': flashSuccess,
      'shadow-xl': !flashSuccess
    }"
    @keydown="handleKeydown"
    tabindex="0"
    role="region"
    :aria-label="`API Playground for ${method} ${url}`"
  >
    <!-- Glassmorphism Container -->
    <div
      class="relative backdrop-blur-xl rounded-2xl overflow-hidden
             bg-white dark:bg-[#0c111c]/98 
             border border-gray-200 dark:border-white/10"
    >
      <!-- Gradient Border Glow -->
      <div
        class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.04), rgba(139, 92, 246, 0.04))"
      />

      <!-- Compact Header (Description Only) -->
      <div v-if="description" class="relative px-5 py-3 border-b border-gray-200 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.03]">
        <p class="text-[12px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
          {{ description }}
        </p>
      </div>

      <!-- Language Tabs + Code -->
      <div class="flex flex-col">
        <!-- Language Tabs + Code -->
        <div class="flex flex-col">
          <!-- Main Toggle + Language Selector -->
          <div class="flex items-center justify-between px-5 py-2 bg-gray-100/40 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/[0.06]">
            <!-- Left: Tabs (Request / Sample / Live) -->
            <div class="flex items-center shrink-0 mr-4 md:mr-6 gap-4 md:gap-6">
              <div class="flex items-center bg-gray-200/50 dark:bg-white/5 p-0.5 rounded-lg">
                <button 
                  @click="mainViewMode = 'request'"
                  class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all"
                  :class="mainViewMode === 'request' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-400'"
                >
                  Request
                </button>
                <button 
                  v-if="responseSample"
                  @click="mainViewMode = 'sample'"
                  class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all"
                  :class="mainViewMode === 'sample' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-400'"
                >
                  Response
                </button>
                <button 
                  v-if="response"
                  @click="mainViewMode = 'live'"
                  class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2"
                  :class="mainViewMode === 'live' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-400'"
                >
                  Live Response
                  <span v-if="response" class="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                </button>
              </div>
              
              <!-- Subtle Divider -->
              <div class="w-px h-5 bg-gray-300 dark:bg-white/10 hidden sm:block" />
            </div>

            <!-- Middle: Language Select (Only visible in Request mode) -->
            <div 
              v-if="mainViewMode === 'request'"
              class="flex gap-1 overflow-x-auto scrollbar-hide flex-1"
            >
              <button
                v-for="(lang, index) in languages"
                :key="lang.label"
                class="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all duration-200 whitespace-nowrap"
                :class="activeLanguage === index
                  ? 'text-gray-900 dark:text-white bg-white dark:bg-white/10 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'"
                @click="activeLanguage = index"
              >
                <UIcon :name="lang.icon" class="w-3.5 h-3.5" />
                {{ lang.label }}
              </button>
            </div>

            <!-- Middle: Response Info -->
            <div 
              v-else
              class="flex items-center gap-3 flex-1"
            >
              <div v-if="mainViewMode === 'live' && response" class="flex items-center gap-2">
                <UBadge :color="responseStatusColor" variant="subtle" size="xs" class="font-bold">
                  {{ response.status }}
                </UBadge>
                <span class="text-[10px] font-mono text-gray-500">{{ response.duration }}ms</span>
              </div>
            </div>

            <!-- Actions (Test + Copy) -->
            <div class="flex items-center gap-2 ml-3">
              <button
                @click="isModalOpen = true"
                class="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <UIcon name="i-lucide-play" class="w-4 h-4" />
                Test API
              </button>
              
              <div class="w-px h-3.5 bg-gray-200 dark:bg-white/10 mx-1" />

              <button
                @click="mainViewMode === 'request' ? copyToClipboard() : copyResponse()"
                class="flex items-center gap-1.5 px-2 py-1 text-[12px] font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                :class="{'opacity-30 cursor-not-allowed': mainViewMode === 'live' && !response}"
              >
                <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" class="w-4 h-4" />
                {{ copied ? 'Copied' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Main Display (Request/Response) -->
        <div class="relative bg-gray-950 dark:bg-[#080b13] overflow-hidden">
          <Transition mode="out-in" :duration="200" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0" enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100">
            <!-- Request Snippet -->
            <div v-if="mainViewMode === 'request'" :key="'request'" class="flex overflow-auto text-[13px] font-mono leading-[1.7]">
              <!-- Line Numbers -->
              <div class="hidden sm:flex flex-col py-4 px-3.5 text-right text-gray-600 select-none shrink-0 border-r border-white/[0.04]">
                <div v-for="(_, i) in snippetLines" :key="i" class="leading-[1.7]">{{ i + 1 }}</div>
              </div>
              <!-- Snippet -->
              <pre class="py-4 px-5 overflow-x-auto w-full"><code v-html="highlightedSnippet" class="text-gray-300"></code></pre>
            </div>

            <!-- Response Preview/Live Data -->
            <div v-else :key="mainViewMode" class="min-h-[120px]">
              <div v-if="mainViewMode === 'sample'" class="flex flex-col h-full bg-gray-950">
                <div v-if="!responseSample" class="flex flex-col items-center justify-center py-10 opacity-30">
                  <UIcon name="i-lucide-database" class="w-8 h-8 mb-2" />
                  <p class="text-[11px] font-semibold uppercase tracking-wider">No sample response available</p>
                </div>
                <pre v-else class="p-6 text-[12px] font-mono whitespace-pre-wrap leading-[1.7] text-gray-400 select-all overflow-auto max-h-[500px]" v-html="highlightedResponseSample"></pre>
              </div>

              <div v-else-if="mainViewMode === 'live'" class="flex flex-col h-full bg-gray-950">
                <div v-if="!response" class="flex flex-col items-center justify-center py-10 opacity-30">
                  <UIcon name="i-lucide-alert-circle" class="w-8 h-8 mb-2" />
                  <p class="text-[11px] font-semibold uppercase tracking-wider">No live response available</p>
                  <p class="text-[10px]">Send a request to see results</p>
                </div>
                <pre v-else class="p-6 text-[12px] font-mono whitespace-pre-wrap leading-[1.7] text-gray-400 select-all overflow-auto max-h-[500px]" v-html="formattedResponseBody"></pre>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Fullscreen Modal -->
    <UModal v-model:open="isModalOpen" fullscreen>
      <template #content>
        <div class="flex flex-col h-full bg-slate-50 dark:bg-[#0b0f19] overflow-hidden">
          <!-- Modal Header -->
          <div class="flex justify-between items-center px-6 py-3 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl">
            <div class="flex gap-3 items-center">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] font-black uppercase border"
                :class="[methodColors[method]?.bg, methodColors[method]?.text, methodColors[method]?.border]"
              >{{ method }}</span>
              <span class="text-xs font-mono text-gray-500 max-w-lg truncate">{{ processedUrl }}</span>
            </div>
            <div class="flex items-center gap-4">
              <UButton
                color="primary"
                variant="solid"
                :loading="loading"
                :disabled="!isBodyValid && editableBody.trim() !== ''"
                class="font-bold px-5 tracking-wide shadow-sm"
                @click="executeRequest"
              >
                <UIcon name="i-lucide-send" class="w-4 h-4" />
                Send
              </UButton>
              <UButton color="neutral" variant="ghost" icon="i-lucide-x" size="sm" @click="isModalOpen = false" />
            </div>
          </div>

          <!-- Modal Body: Split Pane -->
          <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
            <!-- Left: Request Config -->
            <div class="flex flex-col border-r border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-y-auto">
              <!-- Tab Bar -->
              <div class="flex gap-0 border-b border-gray-200 dark:border-white/10 px-6">
                <button
                  v-for="tab in ['params', 'headers', 'body', 'curl']"
                  :key="tab"
                  class="flex items-center gap-1.5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border-b-2 -mb-px"
                  :class="activeRequestTab === tab 
                    ? 'text-indigo-600 dark:text-indigo-400 border-indigo-500' 
                    : 'text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300'"
                  @click="activeRequestTab = tab"
                >
                  <UIcon :name="tab === 'params' ? 'i-lucide-variable' : tab === 'headers' ? 'i-lucide-file-text' : tab === 'curl' ? 'i-lucide-terminal' : 'i-lucide-braces'" class="w-3.5 h-3.5" />
                  {{ tab }}
                </button>
              </div>

              <!-- Tab Content -->
              <div class="flex-1 p-6 space-y-6">
                <!-- Params -->
                <div v-if="activeRequestTab === 'params'" class="space-y-5">
                  <div v-if="Object.keys(editableVariables).length > 0" class="space-y-4">
                     <div v-for="(value, key) in editableVariables" :key="key" class="group/field relative">
                        <div class="flex items-center justify-between mb-1.5">
                           <div class="flex items-center gap-2">
                              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within/field:text-indigo-500">{{ key }}</label>
                              <UIcon v-if="isSensitiveHeader(String(key)) && isValueSynced(String(editableVariables[key]))" name="i-lucide-globe" class="w-2.5 h-2.5 text-indigo-400" title="Synced from global storage" />
                           </div>
                           <!-- Persistent Token Action -->
                           <button 
                             v-if="isSensitiveHeader(String(key))" 
                             @click="persistToken(editableVariables[key])"
                             class="text-[9px] font-bold uppercase tracking-tighter text-indigo-500/60 hover:text-indigo-500 flex items-center gap-1 transition-all"
                             :class="{ 'text-indigo-500 opacity-100': isValueSynced(String(editableVariables[key])) }"
                           >
                             <UIcon :name="isValueSynced(String(editableVariables[key])) ? 'i-lucide-check' : 'i-lucide-share-2'" class="w-2.5 h-2.5" />
                             {{ isValueSynced(String(editableVariables[key])) ? 'Synced' : 'Sync Globally' }}
                           </button>
                        </div>
                        <div class="relative">
                          <input v-model="editableVariables[key]" :type="isSensitiveHeader(String(key)) && !isSecretVisible(String(key)) ? 'password' : 'text'" class="w-full text-xs font-mono bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-gray-200 pl-3 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all" />
                          <button v-if="isSensitiveHeader(String(key))" @click="toggleSecretVisibility(String(key))" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                             <UIcon :name="isSecretVisible(String(key)) ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-3.5 h-3.5" />
                          </button>
                        </div>
                     </div>
                  </div>
                  <div v-else class="text-center py-16 opacity-30">
                     <UIcon name="i-lucide-variable" class="w-10 h-10 mx-auto mb-3" />
                     <p class="text-xs font-semibold text-gray-500">No variables needed</p>
                  </div>
                </div>

                 <!-- Headers -->
                 <div v-if="activeRequestTab === 'headers'" class="space-y-4">
                    <div v-for="(value, key) in editableHeaders" :key="key" class="grid grid-cols-[1fr_2.5fr_auto] gap-3 items-center group/header">
                       <div class="flex flex-col">
                          <span class="text-[11px] font-mono text-gray-400 truncate">{{ key }}</span>
                          <button 
                            v-if="isSensitiveHeader(String(key))" 
                            @click="persistToken(String(editableHeaders[key]))"
                            class="text-[9px] font-bold uppercase tracking-tighter text-indigo-500/0 group-hover/header:text-indigo-500/60 transition-all flex items-center gap-1"
                            :class="{ 'opacity-100 text-indigo-500/60': isValueSynced(String(editableHeaders[key])) }"
                          >
                             <UIcon :name="isValueSynced(String(editableHeaders[key])) ? 'i-lucide-globe' : 'i-lucide-share-2'" class="w-2.5 h-2.5" />
                             {{ isValueSynced(String(editableHeaders[key])) ? 'Global' : 'Sync' }}
                          </button>
                       </div>
                       <div class="relative">
                          <input v-model="editableHeaders[key]" :type="isSensitiveHeader(String(key)) && !isSecretVisible(String(key)) ? 'password' : 'text'" class="w-full text-xs font-mono bg-gray-50 dark:bg-black/20 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                          <button v-if="isSensitiveHeader(String(key))" @click="toggleSecretVisibility(String(key))" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><UIcon :name="isSecretVisible(String(key)) ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-3.5 h-3.5" /></button>
                       </div>
                       <UButton color="neutral" variant="ghost" size="xs" icon="i-lucide-trash-2" @click="removeHeader(String(key))" />
                    </div>
                   <div class="flex gap-2 p-2.5 bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-dashed border-gray-300 dark:border-white/10 mt-6">
                      <input v-model="newHeaderKey" placeholder="Header Name" class="flex-1 bg-transparent text-xs font-mono px-2 py-1 focus:outline-none text-gray-700 dark:text-gray-300 placeholder:text-gray-400" />
                      <input v-model="newHeaderValue" placeholder="Value" class="flex-1 bg-transparent text-xs font-mono px-2 py-1 focus:outline-none text-gray-700 dark:text-gray-300 placeholder:text-gray-400" @keyup.enter="addHeader" />
                      <UButton size="xs" icon="i-lucide-plus" color="primary" variant="soft" @click="addHeader" />
                   </div>
                </div>

                 <!-- Body -->
                 <div v-if="activeRequestTab === 'body'" class="space-y-4">
                    <div class="flex justify-between items-center px-1">
                       <div class="flex items-center gap-2">
                          <h4 class="text-[10px] font-bold uppercase tracking-wider text-gray-500">JSON Body</h4>
                          <UBadge v-if="!isBodyValid" color="error" variant="soft" size="xs" class="animate-pulse">Invalid JSON</UBadge>
                       </div>
                       <div class="flex items-center gap-4">
                          <button @click="formatBody" :disabled="!isBodyValid" class="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 disabled:opacity-30 uppercase tracking-wider transition-colors flex items-center gap-1">
                             <UIcon name="i-lucide-wand-2" class="w-3 h-3" />
                             Format
                          </button>
                       </div>
                    </div>
                    
                    <div class="relative group/editor rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/40 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/30">
                       <div class="flex w-full min-h-[350px]">
                          <!-- Line Numbers (Aesthetic only for now) -->
                          <div class="w-10 bg-gray-200/20 dark:bg-white/[0.02] border-r border-gray-200 dark:border-white/5 flex flex-col items-center py-4 text-[10px] font-mono text-gray-400/50 select-none">
                             <div v-for="i in 20" :key="i" class="leading-[1.7]">{{ i }}</div>
                          </div>
                          
                          <!-- Editor Area -->
                          <div class="relative flex-1 font-mono text-[12px] leading-[1.7]">
                             <!-- Highlighted Layer (Visible) -->
                             <pre 
                               class="absolute inset-0 p-4 m-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-all text-gray-700 dark:text-gray-300"
                               v-html="highlightedBody"
                               :class="{ 'opacity-10': !isBodyValid }"
                             />
                             <!-- Edit Layer (Invisible text, visible cursor) -->
                             <textarea 
                               v-model="editableBody" 
                               rows="15" 
                               spellcheck="false"
                               class="relative w-full h-full p-4 bg-transparent text-transparent caret-gray-900 dark:caret-white focus:outline-none resize-none overflow-y-auto whitespace-pre-wrap break-all"
                               :class="{ 'text-gray-700 dark:text-gray-300': !isBodyValid }"
                             />
                          </div>
                       </div>
                    </div>
                    <p v-if="!isBodyValid" class="text-[10px] text-red-500 font-bold flex items-center gap-1.5 px-1 uppercase tracking-tighter">
                       <UIcon name="i-lucide-alert-circle" />
                       {{ bodyError }}
                    </p>
                 </div>

                <!-- cURL Snippet -->
                <div v-if="activeRequestTab === 'curl'" class="space-y-3">
                   <div class="flex items-center justify-between">
                      <h4 class="text-[10px] font-bold uppercase tracking-wider text-gray-500">cURL Command</h4>
                      <UButton color="neutral" variant="ghost" size="xs" icon="i-lucide-copy" @click="copyToClipboard" />
                   </div>
                   <div class="p-5 bg-gray-950 rounded-xl border border-white/[0.06] overflow-auto">
                      <pre class="text-[11px] font-mono whitespace-pre-wrap leading-relaxed select-all"><code v-html="curlSnippet" class="text-gray-300"></code></pre>
                   </div>
                       <h4 class="text-[10px] font-bold uppercase tracking-wider text-gray-500">Headers</h4>
                    <div class="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.04] rounded-xl flex items-center justify-between">
                       <span class="text-[11px] font-mono text-gray-400">Authorization</span>
                       <UBadge color="primary" variant="subtle" size="xs">Included automatically</UBadge>
                    </div>
                   <p class="text-[10px] text-gray-400 italic">Includes your current parameters and headers.</p>
                </div>
              </div>
            </div>

            <!-- Right: Response Explorer -->
            <div class="flex flex-col bg-gray-50 dark:bg-black/20 overflow-hidden">
               <!-- Response Header -->
               <div class="flex justify-between items-center px-6 py-3 border-b border-gray-200 dark:border-white/10 text-gray-400">
                  <div class="flex gap-3 items-center">
                     <span class="text-[10px] font-bold tracking-widest uppercase">Response</span>
                     <div v-if="response" class="flex gap-3 items-center">
                        <UBadge :color="responseStatusColor" variant="subtle" size="xs" class="font-bold">{{ response.status }} {{ response.statusText }}</UBadge>
                        <span class="text-[10px] font-mono">{{ response.duration }}ms</span>
                     </div>
                  </div>
                  <div v-if="response" class="flex gap-3 items-center">
                     <button v-for="t in ['body', 'headers']" :key="t" @click="activeResponseTab = t" :class="activeResponseTab === t ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-300'" class="text-[10px] font-bold tracking-wider uppercase transition-colors">{{ t }}</button>
                      <UButton 
                        color="neutral" 
                        variant="ghost" 
                        size="xs" 
                        :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'" 
                        :label="copied ? 'Copied' : ''"
                        @click="copyResponse" 
                        class="min-w-[60px]"
                     />
                  </div>
               </div>

               <!-- Response Content -->
               <div class="flex-1 overflow-auto relative bg-gray-950">
                  <Transition mode="out-in">
                     <!-- Empty -->
                     <div v-if="!response && !loading && !error" class="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                        <UIcon name="i-lucide-arrow-left" class="w-8 h-8 text-gray-700 mb-4" />
                        <h4 class="text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-2">No response yet</h4>
                        <p class="text-[11px] text-gray-500 max-w-[220px] leading-relaxed">Configure your request and click Send to see the response here.</p>
                     </div>

                     <!-- Loading -->
                     <div v-else-if="loading" class="p-12 space-y-3">
                        <div v-for="i in 5" :key="i" class="h-2 bg-white/5 rounded-full animate-pulse" :style="{ width: `${100 - (i*15)}%` }" />
                     </div>

                     <!-- Error -->
                     <div v-else-if="error" class="p-8">
                        <div class="p-5 bg-red-500/10 border border-red-500/20 rounded-xl">
                           <div class="flex items-center gap-2 mb-3">
                              <UIcon name="i-lucide-alert-circle" class="w-4 h-4 text-red-500" />
                              <span class="text-[10px] font-bold uppercase tracking-wider text-red-500">Request Failed</span>
                           </div>
                           <p class="text-xs text-red-400/80 leading-relaxed font-mono">{{ error }}</p>
                        </div>
                     </div>

                     <!-- Data -->
                     <div v-else-if="response" class="h-full">
                        <pre v-if="activeResponseTab === 'body'" class="p-6 text-[12px] font-mono text-gray-400 whitespace-pre-wrap selection:bg-indigo-500/30 leading-[1.7]" v-html="formattedResponseBody" />
                        <div v-else class="p-6 space-y-2">
                           <div v-for="(v, k) in response.headers" :key="k" class="grid grid-cols-[140px_1fr] gap-3 text-[10px] font-mono text-gray-400 py-1 border-b border-white/[0.03]">
                              <span class="text-gray-500 font-semibold">{{ k }}</span>
                              <span class="break-all select-all">{{ v }}</span>
                           </div>
                        </div>
                     </div>
                  </Transition>
               </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.api-playground {
  --tw-ring-color: rgba(99, 102, 241, 0.2);
}

.api-playground:focus {
  outline: none;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.2);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.4);
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Code highlighting enhancements */
pre code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', ui-monospace, monospace;
}

/* Success flash animation */
@keyframes successPulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.ring-2 {
  animation: successPulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Responsive Grid Adjustments */
@media (max-width: 1024px) {
  .api-playground {
    margin-left: -1rem;
    margin-right: -1rem;
    border-radius: 0;
  }
}

/* Premium Code Theme: One Dark Inspired */
:deep(.hljs-keyword),
:deep(.hljs-selector-tag),
:deep(.hljs-title),
:deep(.hljs-section),
:deep(.hljs-doctag),
:deep(.hljs-name),
:deep(.hljs-strong) {
  color: #c678dd; /* Purple */
  font-weight: 600;
}

:deep(.hljs-string),
:deep(.hljs-type),
:deep(.hljs-built_in),
:deep(.hljs-bullet),
:deep(.hljs-quote),
:deep(.hljs-number),
:deep(.hljs-regexp),
:deep(.hljs-symbol),
:deep(.hljs-variable),
:deep(.hljs-template-variable),
:deep(.hljs-link),
:deep(.hljs-attr) {
  color: #98c379; /* Green */
}

:deep(.hljs-string) { color: #98c379; }
:deep(.hljs-attr) { color: #d19a66; } /* Orange/Gold for attributes */
:deep(.hljs-number) { color: #d19a66; }
:deep(.hljs-property) { color: #61afef; } /* Blue */
:deep(.hljs-function) { color: #61afef; }
:deep(.hljs-params) { color: #abb2bf; }

:deep(.hljs-comment),
:deep(.hljs-deletion) {
  color: #5c6370;
  font-style: italic;
}

:deep(.hljs-keyword) { color: #c678dd; }
:deep(.hljs-literal) { color: #56b6c2; } /* Cyan */
:deep(.hljs-addition) { color: #98c379; }

:deep(.hljs-title.function_) { color: #61afef; }
:deep(.hljs-title.class_) { color: #e5c07b; } /* Yellow/Gold */

/* Variable highlighting in URL and Code */
.text-indigo-500 {
  color: #818cf8 !important;
  text-shadow: 0 0 10px rgba(129, 140, 248, 0.2);
}
</style>
