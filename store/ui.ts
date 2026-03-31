import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Event } from './socketStore';

interface MapViewState {
    center: [number, number];
    zoom: number;
}

interface UIState {
    isEventFormOpen: boolean;
    isEventInfoOpen: boolean;
    selectedLocation: { lng: number; lat: number } | null;
    selectedEvent: Event | null;
    mapView: MapViewState;

    setEventFormOpen: (open: boolean) => void;
    setEventInfoOpen: (open: boolean) => void;
    setSelectedLocation: (location: { lng: number; lat: number } | null) => void;
    setSelectedEvent: (event: Event | null) => void;
    openEventForm: (location?: { lat: number; lng: number } | null) => void;
    resetEventForm: () => void;
    setMapView: (center: [number, number], zoom: number) => void;
}

const DEFAULT_MAP_VIEW: MapViewState = {
    center: [-74.7813, 10.9685],
    zoom: 14,
};

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            isEventFormOpen: false,
            isEventInfoOpen: false,
            selectedLocation: null,
            selectedEvent: null,
            mapView: DEFAULT_MAP_VIEW,

    setEventFormOpen: (open) => set((state) => ({
        isEventFormOpen: open,
        // Close info if form is opening
        isEventInfoOpen: open ? false : state.isEventInfoOpen
    })),
    setEventInfoOpen: (open) => set((state) => ({
        isEventInfoOpen: open,
        // Close form if info is opening
        isEventFormOpen: open ? false : state.isEventFormOpen
    })),
    setSelectedLocation: (location) => set({ selectedLocation: location }),
    setSelectedEvent: (event) => set({
        selectedEvent: event,
        isEventInfoOpen: !!event,
        isEventFormOpen: false
    }),
    openEventForm: (location) => set({
        isEventFormOpen: true,
        isEventInfoOpen: false,
        selectedEvent: null,
        selectedLocation: location ?? null,
    }),
            resetEventForm: () => set({
        isEventFormOpen: false,
        isEventInfoOpen: false,
        selectedLocation: null,
        selectedEvent: null
    }),
            setMapView: (center, zoom) => set({ mapView: { center, zoom } }),
        }),
        {
            name: 'map-view-storage',
            partialize: (state) => ({ mapView: state.mapView }),
        }
    )
);
