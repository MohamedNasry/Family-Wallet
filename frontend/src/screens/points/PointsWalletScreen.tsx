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

import { meApi } from "../../api/auth.api";
import {
  getChildPointsApi,
  getChildPointTransactionsApi,
  spendPointsApi,
} from "../../api/points.api";

import type { User } from "../../types/user.types";
import type {
  ChildPointsData,
  PointTransaction,
} from "../../types/points.types";

type Reward = {
  id: number;
  title: string;
  points: number;
  emoji: string;
};

const rewards: Reward[] = [
  {
    id: 1,
    title: "Movie Ticket",
    points: 100,
    emoji: "🎬",
  },
  {
    id: 2,
    title: "Ice Cream",
    points: 50,
    emoji: "🍦",
  },
  {
    id: 3,
    title: "Toy",
    points: 200,
    emoji: "🎮",
  },
];

const badges = [
  {
    title: "Saver",
    emoji: "💰",
    active: true,
  },
  {
    title: "Smart Shopper",
    emoji: "🛒",
    active: true,
  },
  {
    title: "Budget Master",
    emoji: "🏦",
    active: false,
  },
  {
    title: "Math Whiz",
    emoji: "🧮",
    active: false,
  },
];

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const getUserId = (user: any) => {
  return Number(user?.userId ?? user?.user_id);
};

const getUserName = (user: any) => {
  return user?.fullName ?? user?.full_name ?? user?.name ?? "Child";
};

const getWalletData = (response: any): ChildPointsData => {
  return (
    response?.wallet ??
    response?.data ??
    response?.pointsWallet ??
    response ??
    {}
  );
};

const getPointsBalance = (wallet: any) => {
  return Number(
    wallet?.pointsBalance ??
      wallet?.points_balance ??
      wallet?.points ??
      wallet?.points_balance ??
      0
  );
};

const getChildNameFromWallet = (wallet: any, fallback: string) => {
  return wallet?.childName ?? wallet?.child_name ?? fallback;
};

const getTransactionId = (transaction: any, index: number) => {
  return Number(
    transaction?.transactionId ??
      transaction?.transaction_id ??
      transaction?.id ??
      index + 1
  );
};

const getTransactionTitle = (transaction: any) => {
  return (
    transaction?.title ??
    transaction?.reason ??
    transaction?.type ??
    "Points transaction"
  );
};

const getTransactionPoints = (transaction: any) => {
  return Number(transaction?.points ?? 0);
};

const getTransactionAmount = (transaction: any) => {
  return Number(transaction?.amount ?? 0);
};

const getTransactionDate = (transaction: any) => {
  const rawDate = transaction?.createdAt ?? transaction?.created_at;

  if (!rawDate) return "Today";

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) return "Today";

  return date.toLocaleDateString();
};

export default function PointsWalletScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<ChildPointsData | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claimingRewardId, setClaimingRewardId] = useState<number | null>(null);

  const childId = useMemo(() => {
    return user ? getUserId(user) : 0;
  }, [user]);

  const pointsBalance = useMemo(() => {
    return getPointsBalance(wallet);
  }, [wallet]);

  const level = useMemo(() => {
    const currentLevel = Math.floor(pointsBalance / 150) + 1;
    return Math.max(currentLevel, 1);
  }, [pointsBalance]);

  const levelStart = (level - 1) * 150;
  const nextLevelTarget = level * 150;
  const levelProgressPoints = pointsBalance - levelStart;
  const levelTotalPoints = nextLevelTarget - levelStart;
  const levelPercentage = Math.min(
    Math.round((levelProgressPoints / levelTotalPoints) * 100),
    100
  );
  const pointsToNextLevel = Math.max(nextLevelTarget - pointsBalance, 0);

  const childName = useMemo(() => {
    return getChildNameFromWallet(wallet, getUserName(user));
  }, [wallet, user]);

  const loadPointsWallet = useCallback(async () => {
    try {
      const meResponse = await meApi();
      const currentUser = meResponse.user;

      setUser(currentUser);

      const currentChildId = getUserId(currentUser);

      if (!currentChildId) {
        throw new Error("Invalid child id");
      }

      const [pointsResponse, transactionsResponse] = await Promise.all([
        getChildPointsApi(currentChildId),
        getChildPointTransactionsApi(currentChildId),
      ]);

      setWallet(getWalletData(pointsResponse));
      setTransactions(transactionsResponse.transactions || []);
    } catch (error: any) {
      showMessage("Error", error.message || "Failed to load kids wallet");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPointsWallet();
    }, [loadPointsWallet])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPointsWallet();
  };

  const handleClaimReward = async (reward: Reward) => {
    try {
      if (!childId) {
        showMessage("Error", "Invalid child id");
        return;
      }

      if (pointsBalance < reward.points) {
        showMessage(
          "Not enough points",
          `You need ${reward.points - pointsBalance} more points to claim ${
            reward.title
          }.`
        );
        return;
      }

      setClaimingRewardId(reward.id);

      await spendPointsApi({
        childId,
        points: reward.points,
        title: reward.title,
      });

      showMessage(
        "Request Sent",
        `${reward.title} request was sent successfully. It may need parent approval.`
      );

      await loadPointsWallet();
    } catch (error: any) {
      showMessage("Error", error.message || "Failed to claim reward");
    } finally {
      setClaimingRewardId(null);
    }
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#C026D3" size="large" />
        <Text style={styles.loadingText}>Loading kids wallet...</Text>
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
          colors={["#A855F7", "#EC4899", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>{childName}'s Wallet</Text>
              <Text style={styles.headerSubtitle}>
                Level {level} · Keep going! 🌟
              </Text>
            </View>

            <View style={styles.childAvatar}>
              <Text style={styles.childAvatarText}>👧</Text>
            </View>
          </View>

          <View style={styles.pointsCard}>
            <View style={styles.pointsHeaderRow}>
              <Text style={styles.pointsLabel}>Your Points</Text>
              <Ionicons name="star" size={34} color="#FDE047" />
            </View>

            <Text style={styles.pointsValue}>{pointsBalance} pts</Text>

            <View style={styles.levelRow}>
              <Text style={styles.levelText}>Level {level}</Text>
              <Text style={styles.levelText}>
                {levelProgressPoints}/{levelTotalPoints}
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${levelPercentage}%` }]}
              />
            </View>

            <Text style={styles.nextLevelText}>
              {pointsToNextLevel} points to Level {level + 1}!
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="ribbon-outline" size={24} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Your Badges</Text>
            </View>

            <View style={styles.badgesRow}>
              {badges.map((badge) => (
                <View
                  key={badge.title}
                  style={[
                    styles.badgeCard,
                    !badge.active && styles.badgeCardInactive,
                  ]}
                >
                  <Text style={[styles.badgeEmoji, !badge.active && styles.inactive]}>
                    {badge.emoji}
                  </Text>
                  <Text
                    style={[
                      styles.badgeText,
                      !badge.active && styles.badgeTextInactive,
                    ]}
                  >
                    {badge.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="gift-outline" size={24} color="#DB2777" />
              <Text style={styles.sectionTitle}>Available Rewards</Text>
            </View>

            {rewards.map((reward) => {
              const disabled =
                pointsBalance < reward.points || claimingRewardId !== null;
              const isClaiming = claimingRewardId === reward.id;

              return (
                <View key={reward.id} style={styles.rewardCard}>
                  <Text style={styles.rewardEmoji}>{reward.emoji}</Text>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardPoints}>{reward.points} points</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.claimButton,
                      disabled && styles.claimButtonDisabled,
                    ]}
                    onPress={() => handleClaimReward(reward)}
                    disabled={disabled}
                  >
                    {isClaiming ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.claimButtonText}>Claim</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="trending-up-outline" size={24} color="#2563EB" />
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>

            {transactions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="receipt-outline" size={34} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No activity yet</Text>
                <Text style={styles.emptyText}>
                  Your points transactions will appear here.
                </Text>
              </View>
            ) : (
              transactions.slice(0, 8).map((transaction, index) => {
                const points = getTransactionPoints(transaction);
                const amount = getTransactionAmount(transaction);
                const isPositive = points > 0;

                return (
                  <View
                    key={getTransactionId(transaction, index)}
                    style={styles.transactionRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.transactionTitle}>
                        {getTransactionTitle(transaction)}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {getTransactionDate(transaction)}
                      </Text>
                    </View>

                    <View style={styles.transactionRight}>
                      {amount > 0 && (
                        <Text style={styles.transactionAmount}>
                          ${amount.toFixed(2)}
                        </Text>
                      )}

                      <Text
                        style={[
                          styles.transactionPoints,
                          isPositive
                            ? styles.transactionPointsPositive
                            : styles.transactionPointsNegative,
                        ]}
                      >
                        {isPositive ? "+" : ""}
                        {points} pts
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() =>
          showMessage("Coming Soon", "Receipt scan for kids will be added later.")
        }
      >
        <Ionicons name="camera-outline" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.plusButton}
        onPress={() =>
          showMessage("Coming Soon", "More kids actions will be added later.")
        }
      >
        <Ionicons name="add" size={34} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFF5FB",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  centered: {
    flex: 1,
    backgroundColor: "#FFF5FB",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#102E59",
    fontWeight: "700",
  },
  header: {
    paddingTop: 30,
    paddingHorizontal: 30,
    paddingBottom: 32,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 18,
  },
  backText: {
    color: "#334155",
    fontWeight: "800",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#FFF7ED",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 8,
  },
  childAvatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  childAvatarText: {
    fontSize: 38,
  },
  pointsCard: {
    marginTop: 24,
    borderRadius: 24,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  pointsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  pointsValue: {
    marginTop: 22,
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "600",
  },
  levelRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  levelText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#FDE047",
  },
  nextLevelText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontWeight: "700",
  },
  content: {
    padding: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 22,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  sectionTitle: {
    color: "#102E59",
    fontSize: 22,
    fontWeight: "900",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 14,
  },
  badgeCard: {
    flex: 1,
    minHeight: 118,
    borderRadius: 16,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  badgeCardInactive: {
    backgroundColor: "#F1F5F9",
  },
  badgeEmoji: {
    fontSize: 34,
  },
  inactive: {
    opacity: 0.35,
  },
  badgeText: {
    marginTop: 8,
    color: "#7E22CE",
    textAlign: "center",
    fontWeight: "700",
  },
  badgeTextInactive: {
    color: "#64748B",
  },
  rewardCard: {
    backgroundColor: "#FFF1FA",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  rewardEmoji: {
    fontSize: 34,
    marginRight: 16,
  },
  rewardTitle: {
    color: "#102E59",
    fontSize: 18,
    fontWeight: "900",
  },
  rewardPoints: {
    color: "#334155",
    fontSize: 16,
    marginTop: 4,
  },
  claimButton: {
    minWidth: 86,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#DB2777",
    justifyContent: "center",
    alignItems: "center",
  },
  claimButtonDisabled: {
    opacity: 0.45,
  },
  claimButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
  emptyBox: {
    paddingVertical: 30,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 10,
    color: "#102E59",
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    color: "#64748B",
    marginTop: 6,
    textAlign: "center",
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  transactionTitle: {
    color: "#102E59",
    fontSize: 17,
    fontWeight: "900",
  },
  transactionDate: {
    color: "#64748B",
    marginTop: 4,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    color: "#102E59",
    fontWeight: "900",
    fontSize: 16,
  },
  transactionPoints: {
    marginTop: 4,
    fontWeight: "900",
    fontSize: 16,
  },
  transactionPointsPositive: {
    color: "#08A63A",
  },
  transactionPointsNegative: {
    color: "#A855F7",
  },
  cameraButton: {
    position: "absolute",
    right: 90,
    bottom: 70,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  plusButton: {
    position: "absolute",
    right: 24,
    bottom: 70,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#DB27B8",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
});