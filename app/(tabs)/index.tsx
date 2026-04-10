import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";

export default function HomeScreen() {
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

  const handleCall = (number: string) => {
    const url = `tel:${number}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Unable to place call", `Cannot dial ${number}`);
      }
    });
  };

  const handleReport = () => {
    if (!address && errorMsg) {
      Alert.alert("Location required", "Please allow location access first.");
      return;
    }
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

  return (
    <View className="flex-1 bg-najm-light">
      <SafeAreaView edges={["top"]} className="bg-white">
        <View className="flex-row items-center justify-between px-5 py-3">
          <View className="flex-row items-center">
            <Image
              source={require("@/assets/images/najmLogo.png")}
              style={{ width: 90, height: 40 }}
              contentFit="contain"
            />
          </View>
          <TouchableOpacity activeOpacity={0.8}>
            <Ionicons name="person-circle-outline" size={34} color="#0a3d62" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Map */}
      <View className="flex-1 overflow-hidden">
        {loading ? (
          <View className="flex-1 justify-center items-center bg-najm-light">
            <ActivityIndicator size="large" color="#0a3d62" />
            <ThemedText className="mt-4 text-base text-najm-blue">
              Getting your location...
            </ThemedText>
          </View>
        ) : errorMsg ? (
          <View className="flex-1 justify-center items-center p-6 bg-najm-light">
            <ThemedText className="text-5xl mb-3">⚠️</ThemedText>
            <ThemedText className="text-base text-najm-red text-center">
              {errorMsg}
            </ThemedText>
          </View>
        ) : (
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
              title="Your Location"
              description={address}
            />
          </MapView>
        )}
      </View>

      {/* Bottom panel */}
      <SafeAreaView edges={["bottom"]} className="bg-white">
        <View className="px-5 pt-5 pb-2 rounded-t-3xl">
          <ThemedText className="text-center text-base font-semibold text-najm-dark mb-3">
            IN CASE OF INJURY:
          </ThemedText>

          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity
              className="flex-1 bg-najm-red rounded-xl py-3.5 flex-row items-center justify-center"
              activeOpacity={0.85}
              onPress={() => handleCall("997")}
            >
              <Ionicons name="medkit" size={18} color="white" />
              <ThemedText className="text-white text-sm font-bold ml-2">
                CALL AMBULANCE (997)
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-najm-dark rounded-xl py-3.5 flex-row items-center justify-center"
              activeOpacity={0.85}
              onPress={() => handleCall("999")}
            >
              <Ionicons name="shield" size={18} color="white" />
              <ThemedText className="text-white text-sm font-bold ml-2">
                CALL POLICE (999)
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText className="text-center text-xs text-gray-500 italic mb-3">
            *
            {loading
              ? "Detecting your location..."
              : errorMsg
                ? "Location unavailable."
                : "Precise location found and pinned."}
            *
          </ThemedText>

          <TouchableOpacity
            className="bg-najm-blue rounded-2xl py-5 px-5 flex-row items-center justify-center shadow-lg"
            activeOpacity={0.85}
            onPress={handleReport}
            disabled={loading}
          >
            <Ionicons name="car-sport" size={32} color="white" />
            <View className="ml-3 items-center">
              <ThemedText className="text-white text-lg font-bold">
                REPORT AN ACCIDENT
              </ThemedText>
              <ThemedText className="text-white text-[11px] opacity-90 text-center">
                *Tap to dispatch the nearest Najm Drone to your location.*
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
