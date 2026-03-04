import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";

export default function DroneDispatchedScreen() {
  const router = useRouter();
  const { location, hasInjury } = useLocalSearchParams<{
    location: string;
    hasInjury: string;
  }>();
  const insets = useSafeAreaInsets();

  // Random ETA between 3-8 minutes (urgent if injury)
  const eta =
    hasInjury === "yes"
      ? Math.floor(Math.random() * 3) + 2
      : Math.floor(Math.random() * 5) + 4;

  // Countdown timer
  const [secondsLeft, setSecondsLeft] = useState(eta * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  // Drone flying animation
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-18, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(18, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    translateX.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(-10, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    rotate.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  // Pulsing shadow effect
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: pulse.value }, { scaleY: 0.3 }],
    opacity: 2 - pulse.value,
  }));

  return (
    <View className="flex-1 bg-najm-light">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top > 0 ? insets.top + 10 : 30,
          paddingBottom: Math.max(insets.bottom, 20) + 20,
          alignItems: "center",
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center">
          <Ionicons
            name="checkmark-circle"
            size={70}
            color="#27ae60"
            style={{ marginBottom: 12 }}
          />
          <ThemedText className="text-2xl font-bold text-najm-blue mb-1.5">
            Drone Dispatched!
          </ThemedText>
          <ThemedText className="text-sm text-najm-blue text-center px-4">
            Help is on the way to {location}
          </ThemedText>
        </View>

        {/* Drone Animation */}
        <View
          className="items-center justify-center"
          style={{ minHeight: 160 }}
        >
          <Animated.View className="items-center" style={animatedStyle}>
            <Image
              source={require("@/assets/images/Drone.png")}
              style={{ width: 140, height: 140 }}
              contentFit="contain"
            />
          </Animated.View>
          <Animated.View
            style={[
              {
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "rgba(0,0,0,0.15)",
                marginTop: -10,
              },
              shadowStyle,
            ]}
          />
        </View>

        {/* ETA */}
        <View className="items-center">
          <ThemedText className="text-xs text-najm-blue mb-2 uppercase tracking-wider">
            Estimated Time of Arrival
          </ThemedText>
          <View
            className="bg-najm-dark rounded-xl px-6 py-3 mb-2 items-center"
            style={{ minWidth: 160 }}
          >
            <ThemedText
              className="text-3xl font-bold text-white"
              style={{ fontVariant: ["tabular-nums"], lineHeight: 38 }}
            >
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </ThemedText>
          </View>
          <ThemedText className="text-base font-semibold text-najm-blue">
            ~{eta} minutes
          </ThemedText>
        </View>

        {/* Status */}
        <View className="flex-row items-center justify-center gap-2">
          <View className="w-2.5 h-2.5 rounded-full bg-najm-green" />
          <ThemedText className="text-sm text-najm-blue">
            Drone is flying to your location...
          </ThemedText>
        </View>

        {/* Home Button */}
        <TouchableOpacity
          className="bg-najm-dark rounded-xl py-4 items-center self-stretch mt-3 mb-3"
          onPress={() => router.dismissAll()}
          activeOpacity={0.8}
        >
          <ThemedText className="text-white text-lg font-bold">
            Back to Home
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
