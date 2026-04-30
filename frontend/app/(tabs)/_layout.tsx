import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
};

function TabIcon({ name, focused, color }: TabIconProps) {
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      <Ionicons name={name} size={26} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#00B84A",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="members"
        options={{
          title: "Members",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? "people" : "people-outline"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? "bar-chart" : "bar-chart-outline"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? "bulb" : "bulb-outline"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 78,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
    paddingBottom: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  tabBarLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  iconWrapper: {
    width: 52,
    height: 40,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapperActive: {
    backgroundColor: "#D8F8E3",
  },
});