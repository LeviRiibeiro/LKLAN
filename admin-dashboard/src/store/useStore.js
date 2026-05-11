import { create } from "zustand";

const useStore = create((set) => ({
  machines: [],
  setMachines: (machines) => set({ machines }),
}));

export default useStore;
