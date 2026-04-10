import React, { useState } from "react";
import {
  View,
  Modal,
  TextInput,
  Pressable,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { SafeAreaView } from "react-native-safe-area-context";
import { submitIncidentReport } from "@/lib/supabase";

export default function QuestionsScreen() {
  const router = useRouter();
  const { location, latitude, longitude } = useLocalSearchParams<{
    location: string;
    latitude: string;
    longitude: string;
  }>();

  const [hasInjury, setHasInjury] = useState<boolean | null>(null);
  const [isCarAccident, setIsCarAccident] = useState<boolean | null>(null);
  const [nationalId, setNationalId] = useState("");
  const [showInjuryPopup, setShowInjuryPopup] = useState(false);
  const [showCarAccidentPopup, setShowCarAccidentPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProceed =
    hasInjury !== null &&
    isCarAccident !== null &&
    nationalId.trim().length > 0;

  const handleNext = async () => {
    if (!canProceed) {
      alert("Please answer all questions and enter your ID");
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const submitResult = await submitIncidentReport({
      location: location || "Unknown location",
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      hasInjury,
      isCarAccident,
      nationalId,
    });

    if (!submitResult.data) {
      setIsSubmitting(false);
      alert(
        submitResult.error ||
          "Could not send report. Please check Supabase setup and try again.",
      );
      return;
    }

    router.push({
      pathname: "/report/drone-dispatched",
      params: {
        location,
        hasInjury: hasInjury ? "yes" : "no",
        isCarAccident: isCarAccident ? "yes" : "no",
        nationalId,
      },
    });

    setIsSubmitting(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-najm-light" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 120,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedText className="text-sm text-najm-blue mb-7">
            📍 Location: {location}
          </ThemedText>

          {/* Question 1: Injury */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <ThemedText className="text-lg font-semibold text-najm-blue mb-3.5">
              Is there an injury?
            </ThemedText>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 py-3.5 rounded-xl border-2 items-center ${
                  hasInjury === true
                    ? "border-najm-green bg-green-50"
                    : "border-gray-300 bg-gray-50"
                }`}
                onPress={() => {
                  setHasInjury(true);
                  setShowInjuryPopup(true);
                }}
              >
                <ThemedText
                  className={`text-base font-semibold ${
                    hasInjury === true ? "text-najm-blue" : "text-gray-500"
                  }`}
                >
                  Yes
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3.5 rounded-xl border-2 items-center ${
                  hasInjury === false
                    ? "border-najm-red bg-red-50"
                    : "border-gray-300 bg-gray-50"
                }`}
                onPress={() => setHasInjury(false)}
              >
                <ThemedText
                  className={`text-base font-semibold ${
                    hasInjury === false ? "text-najm-blue" : "text-gray-500"
                  }`}
                >
                  No
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Question 2: Car Accident */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <ThemedText className="text-lg font-semibold text-najm-blue mb-3.5">
              Is it a car accident?
            </ThemedText>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 py-3.5 rounded-xl border-2 items-center ${
                  isCarAccident === true
                    ? "border-najm-green bg-green-50"
                    : "border-gray-300 bg-gray-50"
                }`}
                onPress={() => setIsCarAccident(true)}
              >
                <ThemedText
                  className={`text-base font-semibold ${
                    isCarAccident === true ? "text-najm-blue" : "text-gray-500"
                  }`}
                >
                  Yes
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3.5 rounded-xl border-2 items-center ${
                  isCarAccident === false
                    ? "border-najm-red bg-red-50"
                    : "border-gray-300 bg-gray-50"
                }`}
                onPress={() => {
                  setIsCarAccident(false);
                  setShowCarAccidentPopup(true);
                }}
              >
                <ThemedText
                  className={`text-base font-semibold ${
                    isCarAccident === false ? "text-najm-blue" : "text-gray-500"
                  }`}
                >
                  No
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* National ID */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <ThemedText className="text-lg font-semibold text-najm-blue mb-3.5">
              Enter your ID
            </ThemedText>
            <TextInput
              className="bg-najm-light rounded-xl px-5 py-3.5 text-base border-[1.5px] border-gray-300 text-gray-700"
              placeholder="National ID / Iqama number"
              placeholderTextColor="#999"
              value={nationalId}
              onChangeText={(text) =>
                setNationalId(text.replace(/[^0-9]/g, ""))
              }
              keyboardType="number-pad"
              maxLength={15}
            />
          </View>

          {/* Next Button */}
          <TouchableOpacity
            className={`bg-najm-dark rounded-xl py-4 items-center mt-3 ${
              !canProceed || isSubmitting ? "opacity-50" : ""
            }`}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <ThemedText className="text-white text-lg font-bold">
              {isSubmitting ? "Sending..." : "Send Report"}
            </ThemedText>
          </TouchableOpacity>

          {/* Injury Warning Popup */}
          <Modal
            visible={showInjuryPopup}
            transparent
            animationType="fade"
            onRequestClose={() => setShowInjuryPopup(false)}
          >
            <View className="flex-1 items-center justify-center px-6 bg-black/40">
              <View className="w-full max-w-sm rounded-2xl bg-white p-6 items-center">
                <View className="h-16 w-16 rounded-full bg-najm-red items-center justify-center mb-4">
                  <ThemedText className="text-white text-3xl font-bold">
                    ✕
                  </ThemedText>
                </View>
                <ThemedText className="text-center text-base text-gray-700 mb-5">
                  When there is an injury in the accident, you should call
                  Al-Moroor or an Ambulance
                </ThemedText>
                <Pressable
                  className="bg-najm-dark rounded-xl px-6 py-3"
                  onPress={() => {
                    setShowInjuryPopup(false);
                    setHasInjury(null);
                  }}
                >
                  <ThemedText className="text-white font-semibold">
                    OK
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Car Accident Warning Popup */}
          <Modal
            visible={showCarAccidentPopup}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCarAccidentPopup(false)}
          >
            <View className="flex-1 items-center justify-center px-6 bg-black/40">
              <View className="w-full max-w-sm rounded-2xl bg-white p-6 items-center">
                <View className="h-16 w-16 rounded-full bg-najm-red items-center justify-center mb-4">
                  <ThemedText className="text-white text-3xl font-bold">
                    ✕
                  </ThemedText>
                </View>
                <ThemedText className="text-center text-base text-gray-700 mb-5">
                  you should call Al-Moroor
                </ThemedText>
                <Pressable
                  className="bg-najm-dark rounded-xl px-6 py-3"
                  onPress={() => {
                    setShowCarAccidentPopup(false);
                    setIsCarAccident(null);
                  }}
                >
                  <ThemedText className="text-white font-semibold">
                    OK
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
