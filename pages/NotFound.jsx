import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

const NotFound = () => {
  return (
    <View className="flex-1 justify-center items-center bg-orange-50">
      <Text className="text-[72px] font-bold text-brand-500">404</Text>
      <Text className="text-2xl mb-[30px] text-gray-800">Page Not Found</Text>

      <Link href="/" asChild>
        <TouchableOpacity className="bg-brand-500 px-[30px] py-[15px] rounded-lg">
          <Text className="text-white text-base font-bold">Go Home</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default NotFound;
