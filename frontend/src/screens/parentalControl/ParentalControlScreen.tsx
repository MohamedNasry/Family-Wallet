import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { meApi } from "../../api/auth.api";
import { getFamilyMembersApi } from "../../api/family.api";
import { getBillsApi } from "../../api/bills.api";
import { getCategoriesApi } from "../../api/categories.api";

import type { User } from "../../types/user.types";
import type { FamilyMember } from "../../types/family.types";
import type { Bill } from "../../types/bill.types";
import type { Category } from "../../types/category.types";

type ChildSpendingInfo = {
  userId: number;
  fullName: string;
  spent: number;
  limit: number;
  remaining: number;
  usedPercent: number;
};

export default function ParentalControlScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // state محلي للـ blocked categories (placeholder)
  const [blockedMap, setBlockedMap] = useState<Record<number, boolean>>({});

  const loadScreen = useCallback(async () => {
    try {
      const meResponse = await meApi();
      const user = meResponse.user;
      setCurrentUser(user);

      if (user.role !== "PARENT") {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const [membersResponse, billsResponse, categoriesResponse] =
        await Promise.all([
          getFamilyMembersApi(user.walletId),
          getBillsApi(),
          getCategoriesApi(),
        ]);

      setMembers(membersResponse.members || []);
      setBills(billsResponse.bills || []);
      setCategories(categoriesResponse.categories || []);

      const harmfulCategories = (categoriesResponse.categories || []).filter(
        (cat) => cat.isHarmful
      );

      const initialBlockedMap: Record<number, boolean> = {};
      harmfulCategories.forEach((cat) => {
        initialBlockedMap[cat.categoryId] = true;
      });

      setBlockedMap(initialBlockedMap);
    } catch (error: any) {
      console.log("PARENTAL CONTROL ERROR:", error?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadScreen();
  }, [loadScreen]);

  const onRefresh = () => {
    setRefreshing(true);
    loadScreen();
  };

  const children = useMemo(() => {
    return members.filter((member) => member.role === "CHILD");
  }, [members]);

  // limits placeholder
  const spendingLimits: Record<number, number> = useMemo(() => {
    const result: Record<number, number> = {};
    children.forEach((child, index) => {
      result[child.userId] = index % 2 === 0 ? 50 : 40;
    });
    return result;
  }, [children]);

  const childSpending: ChildSpendingInfo[] = useMemo(() => {
    return children.map((child) => {
      const childBills = bills.filter(
        (bill) => Number(bill.createdBy) === Number(child.userId)
      );

      const spent = childBills.reduce((sum, bill) => {
        return sum + Number(bill.totalAmount || 0);
      }, 0);

      const limit = spendingLimits[child.userId] || 50;
      const remaining = Math.max(limit - spent, 0);
      const usedPercent =
        limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;

      return {
        userId: child.userId,
        fullName: child.fullName,
        spent,
        limit,
        remaining,
        usedPercent,
      };
    });
  }, [children, bills, spendingLimits]);

  // placeholder approvals
  const pendingApprovals = [
    {
      id: 1,
      title: "New Video Game",
      childName: "Emma",
      amount: 45,
      category: "Games",
      timeAgo: "5 min ago",
    },
    {
      id: 2,
      title: "Candy Pack",
      childName: "Alex",
      amount: 8,
      category: "Junk Food",
      timeAgo: "1 hour ago",
    },
  ];

  const harmfulCategories = useMemo(() => {
    return categories.filter((cat) => cat.isHarmful);
  }, [categories]);

  const toggleBlocked = (categoryId: number) => {
    setBlockedMap((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const getFirstEmoji = (name: string) => {
    const list = ["🧒", "👦", "👧", "🧑"];
    return list[name.length % list.length];
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#08C742" />
        <Text style={styles.loadingText}>Loading parental control...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Failed to load user</Text>
      </View>
    );
  }

  if (currentUser.role !== "PARENT") {
    return (
      <View style={styles.centered}>
        <Ionicons name="lock-closed-outline" size={42} color="#EF4444" />
        <Text style={styles.errorTitle}>Access denied</Text>
        <Text style={styles.errorText}>
          Only parents can access the parental control screen.
        </Text>

        <TouchableOpacity
          style={styles.backButtonStandalone}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleRow}>
            <Ionicons name="shield-checkmark-outline" size={28} color="#fff" />
            <Text style={styles.headerTitle}>Parental Control</Text>
          </View>

          <Text style={styles.headerSubtitle}>Manage children’s spending</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Pending Approvals */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="time-outline" size={24} color="#F97316" />
                <Text style={styles.sectionTitle}>Pending Approvals</Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingApprovals.length}</Text>
              </View>
            </View>

            {pendingApprovals.map((item) => (
              <View key={item.id} style={styles.approvalItem}>
                <Text style={styles.approvalTitle}>{item.title}</Text>
                <Text style={styles.approvalMeta}>
                  {item.childName} • ${item.amount} • {item.category}
                </Text>
                <Text style={styles.approvalTime}>{item.timeAgo}</Text>

                <View style={styles.approvalActions}>
                  <TouchableOpacity style={styles.approveBtn}>
                    <Text style={styles.actionBtnText}>✓ Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.declineBtn}>
                    <Text style={styles.actionBtnText}>✕ Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Spending Limits */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Spending Limits</Text>

            {childSpending.length === 0 ? (
              <Text style={styles.emptyText}>No children found in this family.</Text>
            ) : (
              childSpending.map((child) => (
                <View key={child.userId} style={styles.limitItem}>
                  <View style={styles.limitHeader}>
                    <Text style={styles.childEmoji}>{getFirstEmoji(child.fullName)}</Text>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.childName}>{child.fullName}</Text>
                      <Text style={styles.childSubText}>
                        ${child.spent.toFixed(2)} / ${child.limit.toFixed(2)} this month
                      </Text>
                    </View>
                  </View>

                  <View style={styles.limitLabelsRow}>
                    <Text style={styles.limitSmallText}>{child.usedPercent}% used</Text>
                    <Text style={styles.limitSmallText}>
                      ${child.remaining.toFixed(2)} remaining
                    </Text>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${child.usedPercent}%` },
                      ]}
                    />
                  </View>

                  <TouchableOpacity>
                    <Text style={styles.editLimitText}>Edit Limit</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Blocked Categories */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="ban-outline" size={24} color="#EF4444" />
              <Text style={styles.sectionTitle}>Blocked Categories</Text>
            </View>

            {harmfulCategories.length === 0 ? (
              <Text style={styles.emptyText}>No harmful categories found.</Text>
            ) : (
              harmfulCategories.map((category) => (
                <View key={category.categoryId} style={styles.categoryItem}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Switch
                    value={!!blockedMap[category.categoryId]}
                    onValueChange={() => toggleBlocked(category.categoryId)}
                    trackColor={{ false: "#D1D5DB", true: "#FF5A5F" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))
            )}

            <TouchableOpacity style={styles.addCategoryBtn}>
              <Text style={styles.addCategoryText}>Add Category</Text>
            </TouchableOpacity>
          </View>

          {/* Safety card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#2563EB" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Safety First</Text>
              <Text style={styles.infoText}>
                All purchases require your approval. Children can only spend
                within their set limits.
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
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    backgroundColor: "#EAF3F2",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#102E59",
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "800",
    color: "#102E59",
  },
  errorText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  header: {
    paddingTop: 26,
    paddingHorizontal: 18,
    paddingBottom: 28,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#F4F5F7",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginBottom: 18,
  },
  backButtonStandalone: {
    marginTop: 18,
    backgroundColor: "#F4F5F7",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 18,
  },
  backButtonText: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#ECFDF5",
    fontWeight: "500",
  },
  content: {
    padding: 16,
    gap: 18,
  },
  sectionCard: {
    backgroundColor: "#F8F8F8",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#102E59",
  },
  badge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FDE8D8",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  badgeText: {
    color: "#F97316",
    fontWeight: "800",
    fontSize: 14,
  },
  approvalItem: {
    backgroundColor: "#F3ECE2",
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
  },
  approvalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#102E59",
  },
  approvalMeta: {
    marginTop: 8,
    color: "#475569",
    fontSize: 15,
  },
  approvalTime: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 14,
  },
  approvalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: "#08C742",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  declineBtn: {
    flex: 1,
    backgroundColor: "#FF3138",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  limitItem: {
    backgroundColor: "#F4F5F7",
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
  },
  limitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  childEmoji: {
    fontSize: 34,
    marginRight: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#102E59",
  },
  childSubText: {
    marginTop: 4,
    fontSize: 15,
    color: "#475569",
  },
  limitLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  limitSmallText: {
    fontSize: 14,
    color: "#475569",
  },
  progressTrack: {
    height: 10,
    borderRadius: 10,
    backgroundColor: "#DDE1E7",
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#FF6A00",
  },
  editLimitText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  categoryItem: {
    backgroundColor: "#F4F5F7",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#102E59",
  },
  addCategoryBtn: {
    marginTop: 16,
    backgroundColor: "#F0F2F5",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  addCategoryText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#102E59",
  },
  infoCard: {
    backgroundColor: "#F2F3FF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#BFD5FF",
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E1ECFF",
    justifyContent: "center",
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#102E59",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },
  emptyText: {
    marginTop: 14,
    color: "#6B7280",
    fontSize: 15,
  },
});