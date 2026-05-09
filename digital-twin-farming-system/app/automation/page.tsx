"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Bot,
  Check,
  ChevronDown,
  Clock3,
  Droplets,
  Fan,
  History,
  Layers,
  LayoutGrid,
  Lightbulb,
  Play,
  Save,
  SlidersHorizontal,
  Sparkles,
  Thermometer,
  Zap,
} from "lucide-react";
import type {
  AIAutomationRecommendation,
  AutomationEvent,
  AutomationSettings,
  DeviceState,
  DigitalTwinState,
  Rack,
  Tray,
} from "@/lib/types";

const defaultAutomationSettings: AutomationSettings = {
  trayId: "",
  mode: "manual",
  ledStartTime: "06:00",
  ledEndTime: "20:00",
  ledSpectrum: "mixed",
  fanTriggerTemperature: 26,
  pumpIntervalMinutes: 45,
  pumpDurationSeconds: 20,
};

async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as TResponse & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed with ${response.status}.`);
  }

  return payload;
}

function statusBadge(status: string) {
  const styles =
    status === "on"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "off"
        ? "bg-gray-100 text-gray-600 border-gray-200"
        : status === "warning"
          ? "bg-amber-100 text-amber-700 border-amber-200"
          : "bg-red-100 text-red-700 border-red-200";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${styles}`}>
      {status}
    </span>
  );
}

function formatSpectrum(spectrum: AutomationSettings["ledSpectrum"]) {
  return spectrum.charAt(0).toUpperCase() + spectrum.slice(1);
}

export default function AutomationPage() {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [trays, setTrays] = useState<Tray[]>([]);
  const [selectedRackId, setSelectedRackId] = useState<string>("");
  const [selectedTrayId, setSelectedTrayId] = useState<string>("");

  const [isRackOpen, setIsRackOpen] = useState(false);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const rackDropdownRef = useRef<HTMLDivElement>(null);
  const trayDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rackDropdownRef.current && !rackDropdownRef.current.contains(event.target as Node)) {
        setIsRackOpen(false);
      }
      if (trayDropdownRef.current && !trayDropdownRef.current.contains(event.target as Node)) {
        setIsTrayOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [dashboardState, setDashboardState] = useState<DigitalTwinState | null>(null);
  const [formState, setFormState] = useState<AutomationSettings>(
    defaultAutomationSettings,
  );
  const [aiRecommendation, setAiRecommendation] =
    useState<AIAutomationRecommendation | null>(null);
  const [simulatedDeviceState, setSimulatedDeviceState] =
    useState<DeviceState | null>(null);
  const [automationEvent, setAutomationEvent] = useState<AutomationEvent | null>(
    null,
  );
  const [automationLogs, setAutomationLogs] = useState<AutomationEvent[]>([]);
  const [mockCurrentTime, setMockCurrentTime] = useState("12:00");
  const [statusMessage, setStatusMessage] = useState("Loading racks...");
  const [isBusy, setIsBusy] = useState(false);

  async function loadLogs(trayId: string) {
    try {
      const response = await fetch(`/api/automation/logs?trayId=${trayId}&limit=10`);
      const data = (await response.json()) as AutomationEvent[];
      if (!Array.isArray(data)) return;
      setAutomationLogs(data);
    } catch (err) {
      console.error("Failed to load automation logs:", err);
    }
  }

  // Initial load of racks
  useEffect(() => {
    async function loadRacks() {
      const response = await fetch("/api/racks");
      const data = (await response.json()) as Rack[];
      setRacks(data);
      if (data.length > 0) {
        setSelectedRackId(data[0].id);
      } else {
        setStatusMessage("No racks found.");
      }
    }
    loadRacks().catch(() => setStatusMessage("Failed to load racks."));
  }, []);

  // Load trays when rack changes
  useEffect(() => {
    if (!selectedRackId) return;

    async function loadTrays() {
      const response = await fetch(`/api/trays?rackId=${selectedRackId}`);
      const data = (await response.json()) as Tray[];
      setTrays(data);
      if (data.length > 0) {
        setSelectedTrayId(data[0].id);
      } else {
        setSelectedTrayId("");
        setStatusMessage("No trays found in this rack.");
      }
    }
    loadTrays().catch(() => setStatusMessage("Failed to load trays."));
  }, [selectedRackId]);

  // Load dashboard and logs when tray changes
  useEffect(() => {
    async function loadDashboardState(trayId: string) {
      if (!trayId) return;
      setIsBusy(true);
      setStatusMessage("Loading tray state...");
      try {
        const response = await fetch(`/api/dashboard?trayId=${trayId}`);
        const state = (await response.json()) as DigitalTwinState;
        if ("error" in state) throw new Error(String(state.error));

        setDashboardState(state);
        setFormState(state.automationSettings);
        setSimulatedDeviceState(state.deviceState);
        setAiRecommendation(null);
        setAutomationEvent(null);
        setStatusMessage(`Tray ${trayId} loaded.`);

        // Also load logs
        void loadLogs(trayId);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unable to load automation state.";
        setStatusMessage(message);
      } finally {
        setIsBusy(false);
      }
    }

    if (selectedTrayId) {
      void loadDashboardState(selectedTrayId);
    }
  }, [selectedTrayId]);

  const sensorReading = dashboardState?.sensorReading;
  const activeDeviceState = simulatedDeviceState ?? dashboardState?.deviceState;

  const automationSummary = useMemo(
    () => [
      {
        label: "LED Window",
        value: `${formState.ledStartTime} - ${formState.ledEndTime}`,
        icon: Clock3,
      },
      {
        label: "Spectrum",
        value: formatSpectrum(formState.ledSpectrum),
        icon: Lightbulb,
      },
      {
        label: "Fan Trigger",
        value: `${formState.fanTriggerTemperature}°C`,
        icon: Fan,
      },
      {
        label: "Pump Cycle",
        value: `${formState.pumpIntervalMinutes}m / ${formState.pumpDurationSeconds}s`,
        icon: Droplets,
      },
    ],
    [formState],
  );

  async function handleSaveManualSettings() {
    if (!selectedTrayId) return;
    setIsBusy(true);
    setStatusMessage("Saving manual automation profile...");

    try {
      const payload = await postJson<{ automationSettings: AutomationSettings }>(
        "/api/automation/manual",
        {
          ...formState,
          trayId: selectedTrayId,
          mode: "manual",
        },
      );
      setFormState(payload.automationSettings);
      setDashboardState((current) =>
        current
          ? { ...current, automationSettings: payload.automationSettings }
          : current,
      );
      setStatusMessage("Manual automation profile saved.");
      void loadLogs(selectedTrayId);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to save manual settings.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleGenerateAiSettings() {
    if (!selectedTrayId || !sensorReading) return;
    setIsBusy(true);
    setStatusMessage("Generating rule-based AI-assisted settings...");

    try {
      const payload = await postJson<{
        aiAutomationRecommendation: AIAutomationRecommendation;
      }>("/api/automation/ai-generate", {
        trayId: selectedTrayId,
        sensorReading,
      });
      setAiRecommendation(payload.aiAutomationRecommendation);
      setStatusMessage("AI-assisted automation settings generated.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to generate settings.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleApplyAiSettings() {
    if (!aiRecommendation || !selectedTrayId) {
      setStatusMessage("Generate AI-assisted settings before applying them.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Applying AI-assisted automation profile...");

    try {
      const payload = await postJson<{ automationSettings: AutomationSettings }>(
        "/api/automation/apply-ai",
        {
          aiAutomationRecommendation: {
            ...aiRecommendation,
            trayId: selectedTrayId,
          },
        },
      );
      setFormState(payload.automationSettings);
      setDashboardState((current) =>
        current
          ? { ...current, automationSettings: payload.automationSettings }
          : current,
      );
      setStatusMessage("AI-assisted automation profile applied.");
      void loadLogs(selectedTrayId);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to apply AI settings.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRunSimulation() {
    if (!selectedTrayId) return;
    setIsBusy(true);
    setStatusMessage("Running automation simulation...");

    try {
      const payload = await postJson<{
        deviceState: DeviceState;
        automationEvent?: AutomationEvent;
      }>("/api/automation/simulate", {
        trayId: selectedTrayId,
        sensorReading,
        automationSettings: formState,
        mockCurrentTime,
      });
      setSimulatedDeviceState(payload.deviceState);
      setAutomationEvent(payload.automationEvent ?? null);
      setStatusMessage("Automation simulation complete.");
      void loadLogs(selectedTrayId);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to run simulation.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Automation Control</h1>
          <p className="text-gray-500">
            Set schedules and rules for specific racks and trays
          </p>
        </div>
        <div className="rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
          {statusMessage}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <LayoutGrid className="h-4 w-4 text-primary" />
            Select Rack
          </div>
          <div className="relative" ref={rackDropdownRef}>
            <button
              type="button"
              onClick={() => setIsRackOpen(!isRackOpen)}
              className={`w-full flex items-center justify-between rounded-2xl border bg-white pl-4 pr-4 py-3 text-sm outline-none shadow-sm transition-all duration-300 ${
                isRackOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              <span className="truncate">
                {racks.find((r) => r.id === selectedRackId)?.name || "Select Rack"}
              </span>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isRackOpen ? "rotate-180" : ""}`} />
            </button>

            {isRackOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-2xl border border-gray-100 bg-white p-2 shadow-lg">
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {racks.map((rack) => {
                    const isSelected = rack.id === selectedRackId;
                    return (
                      <div
                        key={rack.id}
                        onClick={() => {
                          setSelectedRackId(rack.id);
                          setIsRackOpen(false);
                        }}
                        className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-300 ${
                          isSelected
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-blue-50/50 hover:pl-5"
                        }`}
                      >
                        <span className="truncate">{rack.name}</span>
                        {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </label>

        <label className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Layers className="h-4 w-4 text-primary" />
            Select Tray
          </div>
          <div className="relative" ref={trayDropdownRef}>
            <button
              type="button"
              onClick={() => !trays.length ? null : setIsTrayOpen(!isTrayOpen)}
              disabled={trays.length === 0}
              className={`w-full flex items-center justify-between rounded-2xl border bg-white pl-4 pr-4 py-3 text-sm outline-none shadow-sm transition-all duration-300 disabled:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed ${
                isTrayOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              <span className="truncate">
                {trays.find((t) => t.id === selectedTrayId)?.name || "Select Tray"}
              </span>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isTrayOpen ? "rotate-180" : ""}`} />
            </button>

            {isTrayOpen && trays.length > 0 && (
              <div className="absolute z-50 mt-2 w-full rounded-2xl border border-gray-100 bg-white p-2 shadow-lg">
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {trays.map((tray) => {
                    const isSelected = tray.id === selectedTrayId;
                    return (
                      <div
                        key={tray.id}
                        onClick={() => {
                          setSelectedTrayId(tray.id);
                          setIsTrayOpen(false);
                        }}
                        className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-300 ${
                          isSelected
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-blue-50/50 hover:pl-5"
                        }`}
                      >
                        <span className="truncate">{tray.name}</span>
                        {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-3xl bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Manual Schedule
              </h2>
              <p className="text-sm text-gray-500">
                Active mode: {formState.mode.toUpperCase()}
              </p>
            </div>
            <SlidersHorizontal className="h-6 w-6 text-primary" />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">LED Start</span>
              <input
                type="time"
                value={formState.ledStartTime}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    ledStartTime: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">LED End</span>
              <input
                type="time"
                value={formState.ledEndTime}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    ledEndTime: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">
                LED Spectrum
              </span>
              <div className="relative">
                <select
                  value={formState.ledSpectrum}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      ledSpectrum: event.target
                        .value as AutomationSettings["ledSpectrum"],
                    }))
                  }
                  className="w-full appearance-none rounded-2xl border border-gray-200 bg-white pl-4 pr-10 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value="mixed">Mixed</option>
                  <option value="blue">Blue</option>
                  <option value="red">Red</option>
                  <option value="white">White</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">
                Fan Trigger Temperature
              </span>
              <input
                type="number"
                min="10"
                max="45"
                value={formState.fanTriggerTemperature}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    fanTriggerTemperature: Number(event.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">
                Pump Interval Minutes
              </span>
              <input
                type="number"
                min="5"
                value={formState.pumpIntervalMinutes}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    pumpIntervalMinutes: Number(event.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">
                Pump Duration Seconds
              </span>
              <input
                type="number"
                min="5"
                value={formState.pumpDurationSeconds}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    pumpDurationSeconds: Number(event.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSaveManualSettings}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-2xl bg-sidebar px-5 py-3 text-sm font-semibold text-white transition hover:bg-sidebar/90 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Save Manual
            </button>
            <button
              type="button"
              onClick={handleGenerateAiSettings}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              Generate AI Settings
            </button>
            <button
              type="button"
              onClick={handleApplyAiSettings}
              disabled={isBusy || !aiRecommendation}
              className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              Apply AI
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-sidebar p-6 text-sidebar-foreground shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">AI Recommendation</h2>
              <p className="text-sm opacity-70">Rule-based local profile</p>
            </div>
            <Bot className="h-6 w-6 text-primary" />
          </div>

          {aiRecommendation ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm opacity-70">Crop</div>
                <div className="text-2xl font-bold">{aiRecommendation.cropName}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="opacity-70">LED</div>
                  <div className="font-semibold">
                    {aiRecommendation.ledStartTime} - {aiRecommendation.ledEndTime}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="opacity-70">Spectrum</div>
                  <div className="font-semibold">
                    {formatSpectrum(aiRecommendation.ledSpectrum)}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="opacity-70">Fan</div>
                  <div className="font-semibold">
                    {aiRecommendation.fanTriggerTemperature}°C
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="opacity-70">Pump</div>
                  <div className="font-semibold">
                    {aiRecommendation.pumpIntervalMinutes}m /{" "}
                    {aiRecommendation.pumpDurationSeconds}s
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-primary/20 p-4 text-sm">
                Confidence {(aiRecommendation.confidence * 100).toFixed(0)}%
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/10 p-4 text-sm opacity-80">
              Generate settings to preview the applied LED, fan, and pump profile.
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-3xl bg-card p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Simulation
              </h2>
              <p className="text-sm text-gray-500">
                Current temperature {sensorReading?.temperature ?? "--"}°C
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="time"
                value={mockCurrentTime}
                onChange={(event) => setMockCurrentTime(event.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isBusy}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
              >
                <Play className="h-4 w-4" />
                Run
              </button>
            </div>
          </div>

          {isBusy ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  {activeDeviceState && statusBadge(activeDeviceState.ledStatus)}
                </div>
                <div className="font-semibold text-gray-800">LED Lights</div>
                <div className="text-sm text-gray-500">
                  {formState.ledStartTime} - {formState.ledEndTime}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <Fan className="h-5 w-5 text-primary" />
                  {activeDeviceState && statusBadge(activeDeviceState.fanStatus)}
                </div>
                <div className="font-semibold text-gray-800">Cooling Fan</div>
                <div className="text-sm text-gray-500">
                  Trigger at {formState.fanTriggerTemperature}°C
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <Droplets className="h-5 w-5 text-primary" />
                  {activeDeviceState && statusBadge(activeDeviceState.pumpStatus)}
                </div>
                <div className="font-semibold text-gray-800">Water Pump</div>
                <div className="text-sm text-gray-500">
                  {formState.pumpIntervalMinutes}m cycle
                </div>
              </div>
            </div>
          )}

          {automationEvent && !isBusy && (
            <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-gray-700 flex items-center justify-between">
              <span>{automationEvent.message}</span>
              <div className="flex gap-2">
                {automationEvent.ledStatus && statusBadge(automationEvent.ledStatus)}
                {automationEvent.fanStatus && statusBadge(automationEvent.fanStatus)}
                {automationEvent.pumpStatus && statusBadge(automationEvent.pumpStatus)}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Active Profile
          </h2>
          <div className="space-y-3">
            {isBusy ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 rounded-2xl skeleton" />
                ))}
              </div>
            ) : (
              automationSummary.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-2 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      {item.value}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className={`mt-5 rounded-2xl bg-sidebar p-4 text-sidebar-foreground ${isBusy ? "animate-pulse" : ""}`}>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Thermometer className="h-4 w-4 text-primary" />
              Latest Sensor
            </div>
            {isBusy ? (
              <div className="h-10 bg-white/10 rounded-lg w-full" />
            ) : (
              <div className="grid grid-cols-2 gap-2 text-sm opacity-90">
                <span>Temp {sensorReading?.temperature ?? "--"}°C</span>
                <span>Humidity {sensorReading?.humidity ?? "--"}%</span>
                <span>Moisture {sensorReading?.soilMoisture ?? "--"}%</span>
                <span>pH {sensorReading?.waterPh ?? "--"}</span>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-3xl bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Automation History
            </h2>
            <p className="text-sm text-gray-500">
              Recent automation events and logs for this tray
            </p>
          </div>
          <History className="h-6 w-6 text-primary" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400">
                <th className="pb-4 font-semibold">Time</th>
                <th className="pb-4 font-semibold">Source</th>
                <th className="pb-4 font-semibold">Message</th>
                <th className="pb-4 font-semibold">Statuses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {automationLogs.length > 0 ? (
                automationLogs.map((log, idx) => (
                  <tr key={idx} className="group">
                    <td className="py-4 text-gray-500">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        log.triggeredBy === "ai" 
                          ? "bg-purple-100 text-purple-700" 
                          : log.triggeredBy === "simulation"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }`}>
                        {log.triggeredBy.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-gray-700">{log.message}</td>
                    <td className="py-4">
                      <div className="flex gap-1.5">
                        {log.ledStatus && (
                          <span className={`h-2 w-2 rounded-full ${log.ledStatus === "on" ? "bg-green-500" : "bg-gray-300"}`} title={`LED: ${log.ledStatus}`} />
                        )}
                        {log.fanStatus && (
                          <span className={`h-2 w-2 rounded-full ${log.fanStatus === "on" ? "bg-green-500" : "bg-gray-300"}`} title={`Fan: ${log.fanStatus}`} />
                        )}
                        {log.pumpStatus && (
                          <span className={`h-2 w-2 rounded-full ${log.pumpStatus === "on" ? "bg-green-500" : "bg-gray-300"}`} title={`Pump: ${log.pumpStatus}`} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No automation logs found for this tray.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
