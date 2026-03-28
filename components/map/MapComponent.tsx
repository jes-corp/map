"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { useUIStore } from "@/store/ui";
import { useSocketStore } from "@/store/socketStore";
import * as LucideIcons from "lucide-react";
import { createRoot } from "react-dom/client";
import React from "react";

const BARRANQUILLA_CENTER: [number, number] = [-74.7813, 10.9685];
const DEFAULT_ZOOM = 14;
const CARTO_VOYAGER_STYLE =
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

interface MapComponentProps {
  className?: string;
}

export default function MapComponent({ className }: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const selectionMarkerRef = useRef<maplibregl.Marker | null>(null);
  
  // Refs to track dynamic markers
  const eventMarkersRef = useRef<Record<string, maplibregl.Marker>>({});
  const userMarkersRef = useRef<Record<string, maplibregl.Marker>>({});

  const { setEventFormOpen, setSelectedLocation, isEventFormOpen, selectedLocation } = useUIStore();
  const events = useSocketStore((state) => state.events);
  const otherUsers = useSocketStore((state) => state.otherUsers);
  const emitUpdateLocation = useSocketStore((state) => state.emitUpdateLocation);

  // Cleanup marker when selection is cleared
  useEffect(() => {
    if (!selectedLocation && selectionMarkerRef.current) {
      selectionMarkerRef.current.remove();
      selectionMarkerRef.current = null;
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: CARTO_VOYAGER_STYLE,
      center: BARRANQUILLA_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    // Navigation controls (zoom +/-)
    mapRef.current.addControl(
      new maplibregl.NavigationControl({ showCompass: true }),
      "bottom-right"
    );

    // Current location button
    const geolocate = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
    });
    
    geolocate.on("geolocate", (e: any) => {
        const { coords } = e;
        emitUpdateLocation({ lat: coords.latitude, lng: coords.longitude });
    });

    mapRef.current.addControl(geolocate, "bottom-right");

    // Scale bar
    mapRef.current.addControl(
      new maplibregl.ScaleControl({ unit: "metric" }),
      "bottom-left"
    );

    mapRef.current.on("click", (e) => {
      // Remove previous marker if exists
      if (selectionMarkerRef.current) {
        selectionMarkerRef.current.remove();
      }

      const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setSelectedLocation({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      setEventFormOpen(true);

      // Create and store the new marker
      selectionMarkerRef.current = new maplibregl.Marker()
        .setLngLat(lngLat)
        .addTo(mapRef.current!);
    });

    // Cleanup on unmount
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      selectionMarkerRef.current?.remove();
      
      // Cleanup dynamic markers
      Object.values(eventMarkersRef.current).forEach(m => m.remove());
      Object.values(userMarkersRef.current).forEach(m => m.remove());
    };
  }, []);

  // Sync Event Markers
  useEffect(() => {
    if (!mapRef.current) return;
    
    console.log("Syncing event markers, current events count:", events.length);

    // Create new markers or skip existing
    events.forEach(event => {
      if (!eventMarkersRef.current[event.id]) {
        console.log("Creating marker for event:", event.title, "at", event.lat, event.lng);
        const el = document.createElement('div');
        
        // Render icon
        const IconComponent = (LucideIcons as any)[event.icon] || LucideIcons.MapPin;
        const root = createRoot(el);
        root.render(React.createElement(IconComponent as React.FC<any>, { size: 20 }));

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([event.lng, event.lat])
          .setPopup(new maplibregl.Popup({ offset: 25 })
            .setHTML(`<strong>${event.title}</strong><p>${event.description}</p>`)
          )
          .addTo(mapRef.current!);

        eventMarkersRef.current[event.id] = marker;
      }
    });

    // Remove stale markers
    const eventIds = new Set(events.map(e => e.id));
    Object.keys(eventMarkersRef.current).forEach(id => {
      if (!eventIds.has(id)) {
        eventMarkersRef.current[id].remove();
        delete eventMarkersRef.current[id];
      }
    });
  }, [events]);

  // Sync Other User Markers
  useEffect(() => {
    if (!mapRef.current) return;

    Object.values(otherUsers).forEach(userData => {
      if (!userMarkersRef.current[userData.userId]) {
        const el = document.createElement('div');
        el.className = 'w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full shadow-md border-2 border-white';
        
        const root = createRoot(el);
        root.render(React.createElement(LucideIcons.User, { size: 16 }));

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([userData.lng, userData.lat])
          .setPopup(new maplibregl.Popup({ offset: 25 })
            .setHTML(`<strong>${userData.username}</strong>`)
          )
          .addTo(mapRef.current!);

        userMarkersRef.current[userData.userId] = marker;
      } else {
        // Update existing marker position
        userMarkersRef.current[userData.userId].setLngLat([userData.lng, userData.lat]);
      }
    });

    // Remove inactive users
    const userIds = new Set(Object.keys(otherUsers));
    Object.keys(userMarkersRef.current).forEach(id => {
      if (!userIds.has(id)) {
        userMarkersRef.current[id].remove();
        delete userMarkersRef.current[id];
      }
    });
  }, [otherUsers]);

  return (
    <div
      ref={containerRef}
      className={className ?? "w-full h-full"}
      aria-label="Mapa interactivo de Barranquilla"
    />
  );
}
