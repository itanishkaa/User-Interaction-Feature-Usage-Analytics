import { Dataset } from "@/types/api";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { listDatasets } from "@/api/endpoints";

interface DatasetContextValue {
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  isLoading: boolean;
  selectDataset: (dataset: Dataset | null) => void;
  refresh: () => Promise<void>;
}

const DatasetContext = createContext<DatasetContextValue | undefined>(
  undefined,
);

const SELECTED_KEY = "featurepulse_selected_dataset";

export function DatasetProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setDatasets([]);
      setSelectedDataset(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const list = await listDatasets();
      setDatasets(list);
      setSelectedDataset((prev) => {
        if (prev && list.some((d) => d.id === prev.id)) return prev;
        const storedId = Number(localStorage.getItem(SELECTED_KEY));
        return list.find((d) => d.id === storedId) ?? list[0] ?? null;
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectDataset = useCallback((dataset: Dataset | null) => {
    setSelectedDataset(dataset);
    if (dataset) localStorage.setItem(SELECTED_KEY, String(dataset.id));
  }, []);

  const value = useMemo(
    () => ({ datasets, selectedDataset, isLoading, selectDataset, refresh }),
    [datasets, selectedDataset, isLoading, selectDataset, refresh],
  );

  return (
    <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>
  );
}

export function useDatasets(): DatasetContextValue {
  const ctx = useContext(DatasetContext);
  if (!ctx)
    throw new Error("useDatasets must be used within a DatasetProvider");
  return ctx;
}
