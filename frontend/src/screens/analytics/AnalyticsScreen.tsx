import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { getBillsApi, getBillsSummaryApi } from "../../api/bills.api";

type Bill = {
  billId?: number;
  bill_id?: number;
  title: string;
  totalAmount?: number | string;
  total_amount?: number | string;
  categoryName?: string;
  category_name?: string;
  currency?: string;
  billDate?: string;
  bill_date?: string;
  createdAt?: string;
  created_at?: string;
};

const COLORS = [
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#6366F1",
  "#EF4444",
  "#14B8A6",
  "#F97316",
];

const getAmount = (bill: Bill) => {
  return Number(bill.totalAmount ?? bill.total_amount ?? 0);
};

const getCategory = (bill: Bill) => {
  return bill.categoryName ?? bill.category_name ?? "Other";
};

const getDate = (bill: Bill) => {
  return bill.billDate ?? bill.bill_date ?? bill.createdAt ?? bill.created_at;
};

export default function AnalyticsScreen() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = useCallback(async () => {
    try {
      const [billsResponse, summaryResponse] = await Promise.all([
        getBillsApi(),
        getBillsSummaryApi(),
      ]);

      setBills(billsResponse.bills || []);
      setSummary(summaryResponse.summary || null);
    } catch (error: any) {
      console.log("ANALYTICS ERROR:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [loadAnalytics])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  const totalExpenses = useMemo(() => {
    return bills.reduce((sum, bill) => sum + getAmount(bill), 0);
  }, [bills]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();

    bills.forEach((bill) => {
      const category = getCategory(bill);
      const amount = getAmount(bill);

      map.set(category, (map.get(category) || 0) + amount);
    });

    return Array.from(map.entries())
      .map(([name, amount], index) => ({
        name,
        amount,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [bills]);

  const weeklyData = useMemo(() => {
    const days = [
      { key: 1, label: "Mon", amount: 0 },
      { key: 2, label: "Tue", amount: 0 },
      { key: 3, label: "Wed", amount: 0 },
      { key: 4, label: "Thu", amount: 0 },
      { key: 5, label: "Fri", amount: 0 },
      { key: 6, label: "Sat", amount: 0 },
      { key: 0, label: "Sun", amount: 0 },
    ];

    bills.forEach((bill) => {
      const rawDate = getDate(bill);

      if (!rawDate) return;

      const date = new Date(rawDate);
      const day = date.getDay();

      const target = days.find((item) => item.key === day);

      if (target) {
        target.amount += getAmount(bill);
      }
    });

    return days;
  }, [bills]);

  const maxWeeklyAmount = useMemo(() => {
    return Math.max(...weeklyData.map((item) => item.amount), 1);
  }, [weeklyData]);

  const topCategory = categoryData[0];

  const monthlyBudget = Number(summary?.monthlyBudget ?? 5000);
  const budgetUsage =
    monthlyBudget > 0 ? Math.round((totalExpenses / monthlyBudget) * 100) : 0;

  const formatMoney = (value: number) => {
    return `${Number(value || 0).toFixed(2)} MAD`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#08C742" size="large" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
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
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>Your spending insights</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconRed}>
                <Ionicons name="trending-down-outline" size={24} color="#EF4444" />
              </View>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
              <Text style={styles.summaryValue}>{formatMoney(totalExpenses)}</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIconGreen}>
                <Ionicons name="pie-chart-outline" size={24} color="#08A63A" />
              </View>
              <Text style={styles.summaryLabel}>Categories</Text>
              <Text style={styles.summaryValue}>{categoryData.length}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Expenses by Category</Text>

            {categoryData.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="receipt-outline" size={34} color="#9CA3AF" />
                <Text style={styles.emptyText}>No expenses yet</Text>
              </View>
            ) : (
              <>
                <View style={styles.donutContainer}>
                  {categoryData.slice(0, 6).map((item, index) => {
                    const percentage =
                      totalExpenses > 0
                        ? Math.max((item.amount / totalExpenses) * 100, 5)
                        : 0;

                    return (
                      <View
                        key={item.name}
                        style={[
                          styles.donutSegment,
                          {
                            backgroundColor: item.color,
                            width: `${percentage}%`,
                          },
                        ]}
                      />
                    );
                  })}
                </View>

                <View style={styles.categoryList}>
                  {categoryData.slice(0, 8).map((item) => (
                    <View key={item.name} style={styles.categoryRow}>
                      <View style={styles.categoryLeft}>
                        <View
                          style={[
                            styles.categoryDot,
                            { backgroundColor: item.color },
                          ]}
                        />
                        <Text style={styles.categoryName}>{item.name}</Text>
                      </View>

                      <Text style={styles.categoryAmount}>
                        {formatMoney(item.amount)}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Spending</Text>

            <View style={styles.weeklyChart}>
              {weeklyData.map((item) => {
                const height = Math.max((item.amount / maxWeeklyAmount) * 180, 10);

                return (
                  <View key={item.label} style={styles.weekItem}>
                    <View style={styles.barWrapper}>
                      <View style={[styles.bar, { height }]} />
                    </View>

                    <Text style={styles.weekLabel}>{item.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <Text style={styles.sectionTitle}>AI Insights</Text>

          <View style={styles.insightCard}>
            <View style={styles.insightIconOrange}>
              <Ionicons name="alert-circle-outline" size={26} color="#F97316" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>Budget Alert</Text>
              <Text style={styles.insightText}>
                You've used {budgetUsage}% of your monthly budget.
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightIconBlue}>
              <Ionicons name="bulb-outline" size={26} color="#2563EB" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>Spending Pattern</Text>
              <Text style={styles.insightText}>
                {topCategory
                  ? `Your highest spending category is ${topCategory.name}.`
                  : "Add expenses to get personalized spending patterns."}
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightIconGreen}>
              <Ionicons name="trending-up-outline" size={26} color="#08A63A" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>Great Progress</Text>
              <Text style={styles.insightText}>
                Keep tracking your family expenses to improve your budget.
              </Text>
            </View>
          </View>
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
    paddingHorizontal: 26,
    paddingBottom: 36,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#ECFDF5",
    fontSize: 17,
    fontWeight: "600",
    marginTop: 12,
  },
  content: {
    padding: 18,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
  },
  summaryIconRed: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryIconGreen: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryLabel: {
    color: "#64748B",
    fontWeight: "700",
    marginTop: 12,
  },
  summaryValue: {
    color: "#102E59",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
  },
  cardTitle: {
    color: "#102E59",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 22,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyText: {
    color: "#64748B",
    fontWeight: "700",
    marginTop: 8,
  },
  donutContainer: {
    height: 42,
    borderRadius: 999,
    overflow: "hidden",
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    marginBottom: 22,
  },
  donutSegment: {
    height: "100%",
  },
  categoryList: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  categoryName: {
    color: "#102E59",
    fontSize: 16,
    fontWeight: "700",
  },
  categoryAmount: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "700",
  },
  weeklyChart: {
    height: 240,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 20,
  },
  weekItem: {
    alignItems: "center",
    flex: 1,
  },
  barWrapper: {
    height: 190,
    justifyContent: "flex-end",
  },
  bar: {
    width: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
  },
  weekLabel: {
    marginTop: 10,
    color: "#94A3B8",
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#102E59",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 14,
  },
  insightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  insightIconOrange: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFEDD5",
    justifyContent: "center",
    alignItems: "center",
  },
  insightIconBlue: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  insightIconGreen: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  insightTitle: {
    color: "#102E59",
    fontSize: 17,
    fontWeight: "900",
  },
  insightText: {
    color: "#475569",
    marginTop: 6,
    lineHeight: 20,
  },
});