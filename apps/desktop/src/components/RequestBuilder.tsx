import React, { useMemo, useState } from "react";
import { Send, ChevronDown, Plus, Trash2 } from "lucide-react";
import type { KabootarRequest, HttpMethod } from "@kabootar/core";

interface Props {
  request: KabootarRequest;
  onChange: (req: KabootarRequest) => void;
  onSend: () => void;
  isLoading: boolean;
}

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const TABS = ["Params", "Headers", "Body", "Tests"] as const;

type TabName = (typeof TABS)[number];

const emptyEntry = () => ({ key: "", value: "", enabled: true, description: "" });

export function RequestBuilder({ request, onChange, onSend, isLoading }: Props) {
  const [activeTab, setActiveTab] = useState<TabName>("Params");
  const methodColorClass = `text-kabootar-${request.method.toLowerCase()}`;
  const bodyType = request.body.type;

  const bodyPreview = useMemo(() => {
    if (bodyType === "json" || bodyType === "raw" || bodyType === "graphql") {
      return request.body.raw ?? "";
    }
    return "";
  }, [bodyType, request.body.raw]);

  const updateBody = (body: Partial<typeof request.body>) => {
    onChange({ ...request, body: { ...request.body, ...body } });
  };

  const updateList = (listName: "params" | "headers", index: number, updated: Partial<{ key: string; value: string; enabled: boolean; description: string }>) => {
    const list = [...request[listName]];
    list[index] = { ...list[index], ...updated };
    onChange({ ...request, [listName]: list });
  };

  const removeEntry = (listName: "params" | "headers", index: number) => {
    const list = request[listName].filter((_, idx) => idx !== index);
    onChange({ ...request, [listName]: list });
  };

  const addEntry = (listName: "params" | "headers") => {
    onChange({ ...request, [listName]: [...request[listName], emptyEntry()] });
  };

  const renderListEditor = (listName: "params" | "headers") => (
    <div className="space-y-4">
      {request[listName].map((item, index) => (
        <div key={`${item.key}-${index}`} className="grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)_32px] gap-2 items-center bg-black/20 p-3 rounded-xl border border-white/5">
          <label className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => updateList(listName, index, { enabled: e.target.checked })}
              className="accent-kabootar-accent"
            />
          </label>
          <input
            value={item.key}
            placeholder="Key"
            onChange={(e) => updateList(listName, index, { key: e.target.value })}
            className="bg-transparent border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
          />
          <input
            value={item.value}
            placeholder="Value"
            onChange={(e) => updateList(listName, index, { value: e.target.value })}
            className="bg-transparent border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
          />
          <button
            type="button"
            onClick={() => removeEntry(listName, index)}
            className="text-white/40 hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => addEntry(listName)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10"
      >
        <Plus className="w-4 h-4" />
        Add {listName === "params" ? "param" : "header"}
      </button>
    </div>
  );

  const renderBodyEditor = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-white/50">Body Type</label>
        <select
          value={bodyType}
          onChange={(e) => updateBody({ type: e.target.value as KabootarRequest["body"]["type"] })}
          className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
        >
          <option value="none">None</option>
          <option value="json">JSON</option>
          <option value="raw">Raw</option>
          <option value="x-www-form-urlencoded">Form URL Encoded</option>
          <option value="form-data">Form Data</option>
          <option value="graphql">GraphQL</option>
        </select>
      </div>

      {bodyType === "json" || bodyType === "raw" || bodyType === "graphql" ? (
        <textarea
          value={bodyPreview}
          onChange={(e) => updateBody({ raw: e.target.value })}
          placeholder="Enter request body..."
          className="min-h-[220px] w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-mono text-white outline-none"
        />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
          {bodyType === "none"
            ? "No request body will be sent."
            : bodyType === "x-www-form-urlencoded"
            ? "Form URL-encoded body editing will be available soon."
            : bodyType === "form-data"
            ? "Form-data body editing will be available soon."
            : ""}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex items-center gap-3 mb-6 bg-black/20 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] focus-within:ring-1 focus-within:ring-kabootar-accent/50 transition-all">
        <div className="relative">
          <select
            value={request.method}
            onChange={(e) => onChange({ ...request, method: e.target.value as HttpMethod })}
            className={`appearance-none bg-transparent ${methodColorClass} font-bold text-sm pl-4 pr-8 py-2 outline-none cursor-pointer w-28`}
          >
            {METHODS.map((m) => (
              <option key={m} value={m} className="bg-kabootar-panel text-kabootar-textMain">{m}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-kabootar-textMuted pointer-events-none" />
        </div>

        <div className="w-px h-6 bg-white/10" />

        <input
          value={request.url}
          onChange={(e) => onChange({ ...request, url: e.target.value })}
          placeholder="https://api.example.com/v1/users"
          className="flex-1 bg-transparent text-white outline-none font-mono text-sm placeholder:text-white/20"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) onSend();
          }}
        />

        <button
          onClick={onSend}
          disabled={isLoading}
          className={`flex items-center gap-2 px-6 py-2 rounded-md font-semibold text-sm text-white transition-all ${
            isLoading
              ? "bg-kabootar-accent/50 cursor-not-allowed"
              : "bg-kabootar-accent hover:bg-kabootar-accentHover hover:shadow-[0_0_12px_rgba(59,130,246,0.4)]"
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>

      <div className="flex border-b border-white/10 gap-4 px-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm transition-colors relative ${
              activeTab === tab
                ? "text-white font-semibold border-b-2 border-kabootar-accent"
                : "text-white/50 font-medium border-b-2 border-transparent hover:text-white hover:border-white/20"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 mt-6 overflow-auto rounded-3xl border border-white/10 bg-black/15 p-5 shadow-inner">
        {activeTab === "Params" && renderListEditor("params")}
        {activeTab === "Headers" && renderListEditor("headers")}
        {activeTab === "Body" && renderBodyEditor()}
        {activeTab === "Tests" && (
          <div className="min-h-[220px] rounded-3xl border border-white/10 bg-black/20 p-4">
            <textarea
              value={request.testScript ?? ""}
              onChange={(e) => onChange({ ...request, testScript: e.target.value })}
              placeholder="Write test scripts to validate response data..."
              className="min-h-[220px] w-full resize-none rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm font-mono text-white outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
