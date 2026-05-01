import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { getMyFamilyApi } from "../../api/family.api";
import { getBillsApi, getBillsSummaryApi } from "../../api/bills.api";
import { meApi } from "../../api/auth.api";

import type { Family } from "../../types/family.types";
import type { Bill, BillsSummary } from "../../types/bill.types";
import type { User } from "../../types/user.types";

export default function DashboardScreen() {
  const [family, setFamily] = useState<Family | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<BillsSummary | null>(null);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currency = family?.currency || "MAD";

  const monthlyBudget = Number(summary?.monthlyBudget ?? 5000);
  const totalExpenses = Number(summary?.totalExpenses ?? 0);
  const monthlyExpenses = Number(summary?.monthlyExpenses ?? 0);

  const usedBudget = totalExpenses;
  const remaining = Math.max(monthlyBudget - usedBudget, 0);

  const budgetPercentage = useMemo(() => {
    if (!monthlyBudget) return 0;

    const percentage = (usedBudget / monthlyBudget) * 100;
    return Math.min(Math.round(percentage), 100);
  }, [monthlyBudget, usedBudget]);

  const formatMoney = (value: number | string | null | undefined) => {
    const amount = Number(value || 0);
    return `${amount.toFixed(2)} ${currency}`;
  };

  const loadDashboard = useCallback(async () => {
    try {
      const [familyResponse, summaryResponse, billsResponse, meResponse] =
        await Promise.all([
          getMyFamilyApi(),
          getBillsSummaryApi(),
          getBillsApi(),
          meApi(),
        ]);

      setFamily(familyResponse.family);
      setSummary(summaryResponse.summary);
      setRecentBills(billsResponse.bills || []);
      setUser(meResponse.user);
    } catch (error: any) {
      console.log("DASHBOARD ERROR:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const goToAddExpense = () => {
    router.push("/bills/add-expense" as any);
  };

  const goToPayments = () => {
    router.push("/payments" as any);
  };

  const goToParental = () => {
    router.push("/parental-control" as any);
  };

  const goToKidsView = () => {
    console.log("Go to kids");
   
  };

  const goToAllTransactions = () => {
    console.log("Go to expenses");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#08C742" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
          colors={["#06C957", "#1588F2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Family Wallet</Text>

            <View style={styles.quickActions}>
              {(user?.role === "PARENT" || user?.role === "CHILD") && (
                <TouchableOpacity
                  style={[styles.quickButton, styles.kidsButton]}
                  onPress={goToKidsView}
                  activeOpacity={0.85}
                >
                  <Text style={styles.quickButtonText}>Kids View</Text>
                </TouchableOpacity>
              )}

              {user?.role === "PARENT" && (
                <TouchableOpacity
                  style={[styles.quickButton, styles.parentalButton]}
                  onPress={goToParental}
                  activeOpacity={0.85}
                >
                  <Text style={styles.quickButtonText}>Parental</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.quickButton, styles.paymentsButton]}
                onPress={goToPayments}
                activeOpacity={0.85}
              >
                <Text style={styles.quickButtonText}>Payments</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>{formatMoney(remaining)}</Text>
          </View>

          <View style={styles.budgetCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Monthly Budget</Text>
              <Text style={styles.percentage}>{budgetPercentage}%</Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${budgetPercentage}%` },
                ]}
              />
            </View>

            <Text style={styles.budgetText}>
              {formatMoney(usedBudget)} of {formatMoney(monthlyBudget)}
            </Text>

            <Text style={styles.monthlyHint}>
              This month only: {formatMoney(monthlyExpenses)}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconRed}>
                <Ionicons
                  name="trending-down-outline"
                  size={22}
                  color="#EF4444"
                />
              </View>

              <Text style={styles.statLabel}>Total Expenses</Text>
              <Text style={styles.statValue}>{formatMoney(totalExpenses)}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconGreen}>
                <Ionicons name="wallet-outline" size={22} color="#08A63A" />
              </View>

              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={styles.statValue}>{formatMoney(remaining)}</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>

            <TouchableOpacity onPress={goToAllTransactions}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentBills.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={32} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyText}>
                Add your first expense using the green plus button.
              </Text>
            </View>
          ) : (
            recentBills.map((bill) => (
              <TouchableOpacity
                key={bill.billId}
                style={styles.transactionCard}
                onPress={() =>
                  router.push({
                    pathname: "/bill-details" as any,
                    params: { billId: String(bill.billId) },
                  })
                }
              >
                <View style={styles.transactionIcon}>
                  <Ionicons name="receipt-outline" size={22} color="#08A63A" />
                </View>

                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle} numberOfLines={1}>
                    {bill.title}
                  </Text>

                  <Text style={styles.transactionMeta} numberOfLines={1}>
                    {bill.categoryName || "Uncategorized"} •{" "}
                    {bill.createdByName || "Unknown"}
                  </Text>
                </View>

                <Text style={styles.transactionAmount}>
                  -{formatMoney(bill.totalAmount)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={goToAddExpense}>
        <Ionicons name="add" size={34} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EAF3F2",
  },

  scrollContent: {
    paddingBottom: 120,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#EAF3F2",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#102E59",
    fontSize: 16,
    fontWeight: "600",
  },

  header: {
    paddingTop: 16,
    paddingHorizontal: 26,
    paddingBottom: 30,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  quickActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  quickButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 7,
  },

  kidsButton: {
    backgroundColor: "#B63DF5",
  },

  parentalButton: {
    backgroundColor: "#2585F5",
  },

  paymentsButton: {
    backgroundColor: "#00BE3F",
  },

  quickButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },

  balanceCard: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 30,
    marginTop: 56,
  },

  balanceLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },

  balanceAmount: {
    color: "#FFFFFF",
    fontSize: 44,
    fontWeight: "400",
    marginTop: 12,
  },

  budgetCard: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginTop: 20,
  },

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
  },

  percentage: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  progressTrack: {
    height: 15,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginTop: 18,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },

  budgetText: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },

  monthlyHint: {
    marginTop: 6,
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
  },

  content: {
    paddingHorizontal: 20,
    marginTop: 20,
  },

  statsRow: {
    flexDirection: "row",
    gap: 14,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
  },

  statIconRed: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },

  statIconGreen: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },

  statLabel: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 14,
  },

  statValue: {
    color: "#102E59",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 5,
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    color: "#102E59",
    fontSize: 20,
    fontWeight: "900",
  },

  seeAll: {
    color: "#08C742",
    fontWeight: "900",
    fontSize: 15,
  },

  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  transactionIcon: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },

  transactionInfo: {
    flex: 1,
    marginLeft: 14,
  },

  transactionTitle: {
    color: "#102E59",
    fontWeight: "900",
    fontSize: 16,
  },

  transactionMeta: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 13,
    marginTop: 4,
  },

  transactionAmount: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "900",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#102E59",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
  },

  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },

  floatingButton: {
    position: "absolute",
    right: 24,
    bottom: 94,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#08C742",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
});