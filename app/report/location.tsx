import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";

export default function LocationScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 24.7136,
    longitude: 46.6753,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [address, setAddress] = useState<string>("");

  const fetchLocation = async (): Promise<Location.LocationObject | null> => {
    const lastKnown = await Location.getLastKnownPositionAsync();
    if (lastKnown) return lastKnown;

    const result = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000)),
    ]);

    if (result) return result;

    return Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });
  };

  const updateFromCoords = async (lat: number, lng: number) => {
    const newRegion: Region = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 500);

    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      if (geocode.length > 0) {
        const g = geocode[0];
        const parts = [g.street, g.district, g.city, g.region].filter(Boolean);
        setAddress(parts.join(", ") || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } else {
        setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg(
          "Permission to access location was denied. Please enable it in your device Settings.",
        );
        setLoading(false);
        return;
      }

      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setErrorMsg(
          "Location services are turned off. Please enable GPS in your device Settings.",
        );
        setLoading(false);
        return;
      }

      try {
        const loc = await fetchLocation();
        if (loc) {
          await updateFromCoords(loc.coords.latitude, loc.coords.longitude);
        } else {
          setErrorMsg("Could not determine your location. Please try again.");
        }
      } catch {
        setErrorMsg("Could not fetch location. Please try again.");
      }
      setLoading(false);
    })();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const loc = await fetchLocation();
      if (loc) {
        await updateFromCoords(loc.coords.latitude, loc.coords.longitude);
      } else {
        setErrorMsg("Could not determine your location.");
      }
    } catch {
      setErrorMsg("Could not refresh location.");
    }
    setLoading(false);
  };

  const handleNext = () => {
    const locationStr =
      address ||
      `${region.latitude.toFixed(5)}, ${region.longitude.toFixed(5)}`;
    router.push({
      pathname: "/report/questions",
      params: {
        location: locationStr,
        latitude: region.latitude.toString(),
        longitude: region.longitude.toString(),
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-najm-light p-6">
        <ActivityIndicator size="large" color="#0a3d62" />
        <ThemedText className="mt-4 text-base text-najm-blue">
          Getting your location...
        </ThemedText>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View className="flex-1 justify-center items-center bg-najm-light p-6">
        <ThemedText className="text-5xl mb-3">⚠️</ThemedText>
        <ThemedText className="text-base text-najm-red text-center mb-5">
          {errorMsg}
        </ThemedText>
        <TouchableOpacity
          className="bg-najm-dark rounded-xl py-3.5 px-8"
          onPress={handleRefresh}
        >
          <ThemedText className="text-white text-base font-bold">
            Try Again
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-najm-light">
      {/* Map */}
      <View className="flex-1 rounded-b-3xl overflow-hidden">
        <MapView
          ref={mapRef}
          style={{ width: "100%", height: "100%" }}
          region={region}
          onRegionChangeComplete={(newRegion) => {
            setRegion(newRegion);
            updateFromCoords(newRegion.latitude, newRegion.longitude);
          }}
          showsUserLocation
          showsMyLocationButton={Platform.OS === "android"}
        >
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title="Accident Location"
            description={address}
          />
        </MapView>
      </View>

      {/* Bottom panel */}
      <View className="bg-white p-6 pb-9 rounded-t-3xl shadow-lg">
        <ThemedText className="text-xl font-bold text-najm-blue mb-2">
          📍 Current Location
        </ThemedText>
        <ThemedText className="text-[15px] text-najm-blue mb-1">
          {address || "Detecting address..."}
        </ThemedText>
        <ThemedText className="text-[13px] text-najm-blue mb-5">
          {region.latitude.toFixed(5)}, {region.longitude.toFixed(5)}
        </ThemedText>

        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-blue-50 rounded-xl py-3.5 items-center"
            onPress={handleRefresh}
            activeOpacity={0.8}
          >
            <ThemedText className="text-base font-semibold text-najm-blue">
              🔄 Refresh
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-najm-dark rounded-xl py-3.5 items-center"
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <ThemedText className="text-white text-lg font-bold">
              Next →
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
