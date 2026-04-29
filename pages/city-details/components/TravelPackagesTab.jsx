import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";

const categoryOptions = [
  { value: "all", label: "All Packages" },
  { value: "hostels", label: "Hostels" },
  { value: "bikes", label: "Bike Rentals" },
  { value: "tours", label: "Guided Tours" },
];

const TravelPackagesTab = ({ cityName }) => {
  const { isDarkMode } = useDarkMode();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const bg = isDarkMode ? "#1f2937" : "#fff";
  const border = isDarkMode ? "#374151" : "#e5e7eb";
  const textPrimary = isDarkMode ? "#f9fafb" : "#111827";
  const textSecondary = isDarkMode ? "#9ca3af" : "#6b7280";
  const bgSecondary = isDarkMode ? "#374151" : "#f3f4f6";

  const packages = [
    {
      id: 1,
      type: "hostel",
      name: "Mountain View Backpackers Hostel",
      image: "https://images.unsplash.com/photo-1670140271803-c6dc20497ac0",
      rating: 4.8,
      reviews: 234,
      price: 599,
      originalPrice: 799,
      features: [
        "Free WiFi",
        "Mountain View",
        "Common Kitchen",
        "24/7 Reception",
      ],
      location: `Near ${cityName} Mall Road`,
      availability: "Available",
    },
    {
      id: 2,
      type: "bike",
      name: "Royal Enfield Himalayan Rental",
      image: "https://images.unsplash.com/photo-1617104404661-7e4f401d25f1",
      rating: 4.9,
      reviews: 456,
      price: 1299,
      originalPrice: 1599,
      features: [
        "Full Insurance",
        "Helmet Included",
        "24/7 Support",
        "Unlimited KM",
      ],
      location: `${cityName} City Center`,
      availability: "3 bikes available",
    },
    {
      id: 3,
      type: "hostel",
      name: "Cozy Corner Homestay",
      image: "https://images.unsplash.com/photo-1600376376295-1ce76e5ff33a",
      rating: 4.7,
      reviews: 189,
      price: 899,
      originalPrice: 1199,
      features: [
        "Home Cooked Meals",
        "Local Experience",
        "Garden Area",
        "Pet Friendly",
      ],
      location: `${cityName} Old Town`,
      availability: "Available",
    },
    {
      id: 4,
      type: "tour",
      name: "Sunrise Trek & Breakfast Tour",
      image: "https://images.unsplash.com/photo-1631135791275-10d314af9cc3",
      rating: 5.0,
      reviews: 567,
      price: 1499,
      originalPrice: 1999,
      features: [
        "Expert Guide",
        "Breakfast Included",
        "Photography Spots",
        "Small Groups",
      ],
      location: `Starts from ${cityName}`,
      availability: "Booking open",
    },
    {
      id: 5,
      type: "bike",
      name: "Mountain Bike Adventure Package",
      image: "https://images.unsplash.com/photo-1669732813799-ba9fbf6f9b86",
      rating: 4.6,
      reviews: 298,
      price: 799,
      originalPrice: 999,
      features: ["Trail Maps", "Safety Gear", "Repair Kit", "Guide Available"],
      location: `${cityName} Adventure Hub`,
      availability: "5 bikes available",
    },
    {
      id: 6,
      type: "tour",
      name: "Local Food & Culture Walking Tour",
      image: "https://images.unsplash.com/photo-1665484481618-1eaa54e6cc18",
      rating: 4.9,
      reviews: 423,
      price: 699,
      originalPrice: 899,
      features: [
        "Food Tastings",
        "Local Guide",
        "3 Hours",
        "Cultural Insights",
      ],
      location: `${cityName} Market Area`,
      availability: "Daily tours",
    },
  ];

  // matches web: selectedCategory === 'all' ? packages : filter by type (slice off trailing 's')
  const filteredPackages =
    selectedCategory === "all"
      ? packages
      : packages.filter((pkg) => pkg.type === selectedCategory.slice(0, -1));

  return (
    <View style={{ gap: 16 }}>
      {/* ── Header: filter pills + count — matches web: flex justify-between items-center gap-3 ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Category filter — RN equivalent of web's Select */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            {categoryOptions.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setSelectedCategory(opt.value)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  backgroundColor:
                    selectedCategory === opt.value ? "#FF9933" : "transparent",
                  borderColor:
                    selectedCategory === opt.value ? "#FF9933" : border,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color:
                      selectedCategory === opt.value ? "#fff" : textSecondary,
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* matches web: flex items-center gap-2 text-sm text-[var(--color-text-secondary)] */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon name="Package" size={16} color={textSecondary} />
          <Text style={{ fontSize: 13, color: textSecondary }}>
            {filteredPackages.length} packages
          </Text>
        </View>
      </View>

      {/* ── Packages list — matches web: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ── */}
      <View style={{ gap: 16 }}>
        {filteredPackages.map((pkg) => (
          // matches web: bg-[var(--color-bg-card)] rounded-xl overflow-hidden shadow-sm border border-[var(--color-border)]
          <View
            key={pkg.id}
            style={{
              backgroundColor: bg,
              borderRadius: 12,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            {/* Package Image — matches web: relative w-full h-48 md:h-56 lg:h-64 */}
            <View style={{ position: "relative", height: 192 }}>
              <Image
                source={{ uri: pkg.image }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              {/* Availability badge — matches web: absolute top-3 right-3 bg-green-500 rounded-full px-3 py-1 */}
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: "#22c55e",
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{ fontSize: 11, fontWeight: "600", color: "#fff" }}
                >
                  {pkg.availability}
                </Text>
              </View>
            </View>

            {/* Package Details — matches web: p-4 md:p-5 */}
            <View style={{ padding: 16, gap: 12 }}>
              {/* Title — matches web: text-base md:text-lg font-semibold text-[var(--color-text-primary)] line-clamp-2 */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: textPrimary,
                  lineHeight: 22,
                }}
                numberOfLines={2}
              >
                {pkg.name}
              </Text>

              {/* Rating — matches web: flex items-center gap-2 */}
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Icon name="Star" size={14} color="#eab308" />
                  {/* matches web: text-sm font-semibold text-[var(--color-text-primary)] */}
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: textPrimary,
                    }}
                  >
                    {pkg.rating}
                  </Text>
                </View>
                {/* matches web: text-xs text-[var(--color-text-secondary)] */}
                <Text style={{ fontSize: 12, color: textSecondary }}>
                  ({pkg.reviews} reviews)
                </Text>
              </View>

              {/* Location — matches web: flex items-center gap-2 text-xs md:text-sm text-[var(--color-text-secondary)] */}
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Icon name="MapPin" size={14} color={textSecondary} />
                <Text
                  style={{ fontSize: 13, color: textSecondary, flex: 1 }}
                  numberOfLines={1}
                >
                  {pkg.location}
                </Text>
              </View>

              {/* Features — matches web: flex flex-wrap gap-2, slice(0, 3) */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {pkg.features.slice(0, 3).map((feature, index) => (
                  // matches web: px-2 py-1 bg-[var(--color-bg-secondary)] rounded-md text-xs text-[var(--color-text-secondary)]
                  <View
                    key={index}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: bgSecondary,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: textSecondary }}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Price + Book Now — matches web: flex items-end justify-between pt-4 border-t border-[var(--color-border)] */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: border,
                }}
              >
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: 8,
                    }}
                  >
                    {/* matches web: text-xl md:text-2xl font-bold text-[var(--color-text-primary)] */}
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "700",
                        color: textPrimary,
                      }}
                    >
                      ₹{pkg.price}
                    </Text>
                    {/* matches web: text-sm text-[var(--color-text-secondary)] line-through */}
                    <Text
                      style={{
                        fontSize: 13,
                        color: textSecondary,
                        textDecorationLine: "line-through",
                      }}
                    >
                      ₹{pkg.originalPrice}
                    </Text>
                  </View>
                  {/* matches web: text-xs text-[var(--color-text-secondary)] mt-1 */}
                  <Text
                    style={{ fontSize: 11, color: textSecondary, marginTop: 4 }}
                  >
                    per day
                  </Text>
                </View>

                {/* matches web: Button variant='default' size='sm' "Book Now" */}
                <Pressable
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: "#FF9933",
                  }}
                >
                  <Text
                    style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}
                  >
                    Book Now
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default TravelPackagesTab;
