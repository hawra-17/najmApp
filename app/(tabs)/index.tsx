import { Image } from "expo-image";
import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      {/* Logo */}
      <View className="items-center mt-24">
        <Image
          source={require("@/assets/images/najmLogo.png")}
          style={{ width: 200, height: 100 }}
          contentFit="contain"
        />
      </View>

      {/* Report Button */}
      <View className="flex-1 justify-center items-center">
        <TouchableOpacity
          className="bg-[#f0f4f8] rounded-2xl py-8 px-10 items-center shadow-lg"
          activeOpacity={0.8}
          onPress={() => router.push("/report/location")}
        >
          <Image
            source={require("@/assets/images/reportAccident.png")}
            style={{ width: 140, height: 140, marginBottom: 16 }}
            contentFit="contain"
          />
          <ThemedText className="text-xl font-bold text-najm-blue">
            Report an Accident
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View className="items-center pb-10">
        <ThemedText className="text-sm text-najm-blue">
          Najm - Emergency Response
        </ThemedText>
      </View>
    </View>
  );
}
