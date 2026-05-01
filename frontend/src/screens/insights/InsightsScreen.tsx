import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { getBillsApi, getBillsSummaryApi } from "../../api/bills.api";

type Bill = {
  billId?: number;
  bill_id?: number;
  title: string;
  totalAmount?: number | string;
  total_amount?: number | string;
  categoryName?: string;
  category_name?: string;
};

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const getAmount = (bill: Bill) => {
  return Number(bill.totalAmount ?? bill.total_amount ?? 0);
};

const getCategory = (bill: Bill) => {
  return bill.categoryName ?? bill.category_name ?? "Other";
};

export default function InsightsScreen() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [notificationsHidden, setNotificationsHidden] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInsights = useCallback(async () => {
    try {
      const [billsResponse, summaryResponse] = await Promise.all([
        getBillsApi(),
        getBillsSummaryApi(),
      ]);

      setBills(billsResponse.bills || []);
      setSummary(summaryResponse.summary || null);
    } catch (error: any) {
      console.log("INSIGHTS ERROR:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInsights();
    }, [loadInsights])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadInsights();
  };

  const totalExpenses = useMemo(() => {
    return bills.reduce((sum, bill) => sum + getAmount(bill), 0);
  }, [bills]);

  const monthlyBudget = Number(summary?.monthlyBudget ?? 5000);
  const usagePercentage =
    monthlyBudget > 0 ? Math.round((totalExpenses / monthlyBudget) * 100) : 0;

  const topCategory = useMemo(() => {
    const map = new Map<string, number>();

    bills.forEach((bill) => {
      const category = getCategory(bill);
      map.set(category, (map.get(category) || 0) + getAmount(bill));
    });

    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);

    return sorted[0];
  }, [bills]);

  const notifications = useMemo(() => {
    const items = [];

    if (usagePercentage >= 80) {
      items.push({
        id: "budget-alert",
        type: "warning",
        title: "Budget Alert",
        message: `You've used ${usagePercentage}% of your monthly budget. Consider reducing spending.`,
        time: "10 min ago",
        icon: "alert-circle-outline",
      });
    } else {
      items.push({
        id: "budget-good",
        type: "success",
        title: "Budget Status",
        message: `You've used ${usagePercentage}% of your monthly budget. You are still in control.`,
        time: "10 min ago",
        icon: "checkmark-circle-outline",
      });
    }

    if (topCategory) {
      items.push({
        id: "spending-pattern",
        type: "info",
        title: "Spending Insight",
        message: `Your highest spending category is ${topCategory[0]} with ${Number(
          topCategory[1]
        ).toFixed(2)} MAD.`,
        time: "2 hours ago",
        icon: "bulb-outline",
      });
    }

    if (bills.length > 0) {
      items.push({
        id: "progress",
        type: "success",
        title: "Great Progress!",
        message: `You tracked ${bills.length} expense records. Keep it up!`,
        time: "1 day ago",
        icon: "trending-up-outline",
      });
    }

    return items;
  }, [usagePercentage, topCategory, bills.length]);

  const visibleNotifications = notificationsHidden ? [] : notifications;

  const markAllRead = () => {
    setNotificationsHidden(true);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#08C742" size="large" />
        <Text style={styles.loadingText}>Loading insights...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={["#10C95C", "#2F80ED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <Ionicons name="notifications-outline" size={32} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Insights & Alerts</Text>
          </View>

          <Text style={styles.headerSubtitle}>
            Smart suggestions for your family
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickGreen}
              onPress={() => router.push("/(tabs)/analytics" as any)}
            >
              <Ionicons name="radio-button-on-outline" size={32} color="#FFFFFF" />
              <Text style={styles.quickText}>Review Budget</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBlue}
              onPress={() => router.push("/(tabs)/analytics" as any)}
            >
              <Ionicons name="trending-up-outline" size={32} color="#FFFFFF" />
              <Text style={styles.quickText}>See Trends</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickPurple}
              onPress={() =>
                showMessage("Family Goals", "Family goals will be added later.")
              }
            >
              <Ionicons name="checkmark-circle-outline" size={32} color="#FFFFFF" />
              <Text style={styles.quickText}>Family Goals</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.notificationHeader}>
            <Text style={styles.sectionTitle}>All Notifications</Text>

            <TouchableOpacity onPress={markAllRead}>
              <Text style={styles.markRead}>Mark all read</Text>
            </TouchableOpacity>
          </View>

          {visibleNotifications.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-done-outline" size={38} color="#08A63A" />
              <Text style={styles.emptyTitle}>All caught up</Text>
              <Text style={styles.emptyText}>
                You have no active insights right now.
              </Text>
            </View>
          ) : (
            visibleNotifications.map((item) => (
              <View key={item.id} style={styles.notificationCard}>
                <View
                  style={[
                    styles.notificationIcon,
                    item.type === "warning" && styles.iconWarning,
                    item.type === "success" && styles.iconSuccess,
                    item.type === "info" && styles.iconInfo,
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={28}
                    color={
                      item.type === "warning"
                        ? "#F97316"
                        : item.type === "success"
                        ? "#08A63A"
                        : "#2563EB"
                    }
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationText}>{item.message}</Text>
                </View>

                <Text style={styles.notificationTime}>{item.time}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EAF3F2",
  },
  scrollContent: {
    paddingBottom: 110,
  },
  centered: {
    flex: 1,
    backgroundColor: "#EAF3F2",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#102E59",
    fontWeight: "700",
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 30,
    paddingBottom: 36,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#ECFDF5",
    fontSize: 17,
    fontWeight: "600",
    marginTop: 16,
  },
  content: {
    padding: 18,
  },
  sectionTitle: {
    color: "#102E59",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 28,
  },
  quickGreen: {
    flex: 1,
    backgroundColor: "#08B948",
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: "center",
  },
  quickBlue: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: "center",
  },
  quickPurple: {
    flex: 1,
    backgroundColor: "#A21CAF",
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: "center",
  },
  quickText: {
    color: "#FFFFFF",
    fontWeight: "900",
    marginTop: 10,
    textAlign: "center",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  markRead: {
    color: "#08A63A",
    fontWeight: "900",
    marginBottom: 14,
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  notificationIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWarning: {
    backgroundColor: "#FFEDD5",
  },
  iconSuccess: {
    backgroundColor: "#DCFCE7",
  },
  iconInfo: {
    backgroundColor: "#DBEAFE",
  },
  notificationTitle: {
    color: "#102E59",
    fontSize: 17,
    fontWeight: "900",
  },
  notificationText: {
    color: "#475569",
    marginTop: 8,
    lineHeight: 21,
    fontSize: 15,
  },
  notificationTime: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#102E59",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 10,
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
  },
});