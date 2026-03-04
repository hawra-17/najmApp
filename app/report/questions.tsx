import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QuestionsScreen() {
  const router = useRouter();
  const { location } = useLocalSearchParams<{ location: string }>();

  const [hasInjury, setHasInjury] = useState<boolean | null>(null);
  const [isCarAccident, setIsCarAccident] = useState<boolean | null>(null);
  const [nationalId, setNationalId] = useState("");

  const canProceed =
    hasInjury !== null &&
    isCarAccident !== null &&
    nationalId.trim().length > 0;

  const handleNext = () => {
    if (!canProceed) {
      alert("Please answer all questions and enter your ID");
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
  };

  return (
    <SafeAreaView className="flex-1 bg-najm-light" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 24,
          }}
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
                onPress={() => setHasInjury(true)}
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
                onPress={() => setIsCarAccident(false)}
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
              onChangeText={setNationalId}
              keyboardType="number-pad"
            />
          </View>

          {/* Next Button */}
          <TouchableOpacity
            className={`bg-najm-dark rounded-xl py-4 items-center mt-3 ${
              !canProceed ? "opacity-50" : ""
            }`}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <ThemedText className="text-white text-lg font-bold">
              Send Report
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
