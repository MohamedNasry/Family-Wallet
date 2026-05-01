import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import AppButton from "@/src/components/AppButton";
import ProgressBar from "@/src/components/ui/ProgressBar";
import {
  getFamilyMembersApi,
  getFamilyMembersStatsApi,
  getMyFamilyApi,
} from "@/src/api/family.api";
import type {
  Family,
  FamilyMember,
  FamilyMembersStatsResponse,
} from "@/src/types/family.types";

type EnrichedFamilyMember = FamilyMember & {
  totalContribution: number;
  contributionPercentage: number;
  isTopContributor: boolean;
};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getMemberInitials = (name: string): string => {
  const words = name.trim().split(" ");
  const firstInitial = words[0]?.charAt(0)?.toUpperCase() ?? "";
  const secondInitial = words[1]?.charAt(0)?.toUpperCase() ?? "";
  return `${firstInitial}${secondInitial}` || "--";
};

export default function MembersScreen() {
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [stats, setStats] = useState<FamilyMembersStatsResponse | null>(null);
  const [statsUnavailable, setStatsUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = family?.currency ?? "MAD";
  const activeMemberCount = members.length;

  const statsMap = useMemo(() => {
    const map = new Map<number, { totalContribution: number; contributionPercentage: number | null }>();

    if (!stats?.members) {
      return map;
    }

    stats.members.forEach((entry) => {
      if (typeof entry?.userId !== "number") {
        return;
      }

      const contribution = toNumber(entry.totalContribution);
      const percentage = entry.contributionPercentage ?? null;

      map.set(entry.userId, {
        totalContribution: contribution,
        contributionPercentage: percentage,
      });
    });

    return map;
  }, [stats]);

  const mergedMembers = useMemo<EnrichedFamilyMember[]>(() => {
    const statsAvailable = Array.isArray(stats?.members) && stats.members.length > 0;

    const baseMembers = members.map((member) => {
      const stat = statsMap.get(member.userId);
      return {
        ...member,
        totalContribution: stat?.totalContribution ?? 0,
        contributionPercentage: stat?.contributionPercentage ?? 0,
        isTopContributor: false,
      };
    });

    const totalAbsolute = baseMembers.reduce(
      (sum, member) => sum + Math.abs(member.totalContribution),
      0
    );

    const withPercent = baseMembers.map((member) => {
      const hasPercentage = statsAvailable && statsMap.has(member.userId) && typeof statsMap.get(member.userId)?.contributionPercentage === "number";
      const contributionPercentage = hasPercentage
        ? statsMap.get(member.userId)?.contributionPercentage ?? 0
        : totalAbsolute > 0
        ? Math.round((Math.abs(member.totalContribution) / totalAbsolute) * 100)
        : 0;

      return {
        ...member,
        contributionPercentage,
      };
    });

    if (withPercent.length === 0) {
      return withPercent;
    }

    if (!statsAvailable) {
      return withPercent;
    }

    const ordered = [...withPercent].sort(
      (a, b) => b.totalContribution - a.totalContribution
    );

    const topContributorId = ordered[0]?.userId;

    return ordered.map((member) => ({
      ...member,
      isTopContributor: member.userId === topContributorId,
    }));
  }, [members, statsMap, stats]);

  const totalContribution = useMemo(() => {
    if (typeof stats?.totalContribution === "number") {
      return stats.totalContribution;
    }

    return mergedMembers.reduce(
      (sum, member) => sum + member.totalContribution,
      0
    );
  }, [stats, mergedMembers]);

  const formatMoney = useCallback(
    (value: number) => `${value.toFixed(2)} ${currency}`,
    [currency]
  );

  const loadMembers = useCallback(async () => {
    setError(null);
    setStatsUnavailable(false);

    try {
      const familyResponse = await getMyFamilyApi();
      const familyData = familyResponse.family;

      if (!familyData?.familyId) {
        throw new Error("Unable to determine family details.");
      }

      const membersResponse = await getFamilyMembersApi(familyData.familyId);
      let statsResponse: FamilyMembersStatsResponse | null = null;

      try {
        statsResponse = await getFamilyMembersStatsApi(familyData.familyId);
      } catch (statsError) {
        setStatsUnavailable(true);
        console.warn("Family members stats unavailable", statsError);
      }

      setFamily(familyData);
      setMembers(Array.isArray(membersResponse.members) ? membersResponse.members : []);
      setStats(statsResponse);
    } catch (exception) {
      const message = exception instanceof Error ? exception.message : "Unable to load family members.";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMembers();
  }, [loadMembers]);

  const getStatusLabel = (value: number) => {
    if (value > 0) {
      return "is owed";
    }

    if (value < 0) {
      return "owes";
    }

    return "is settled";
  };

  const renderEmptyState = () => (
    <View style={styles.emptyCard}>
      <Ionicons name="people-outline" size={38} color="#6B7280" />
      <Text style={styles.emptyTitle}>No family members yet</Text>
      <Text style={styles.emptyText}>
        Add family members from the web dashboard or invite directly when you
        return.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#08C742" />
        <Text style={styles.loadingText}>Loading members...</Text>
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
          colors={["#13C767", "#0DAD5B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Family Members</Text>
              <Text style={styles.headerSubtitle}>
                {activeMemberCount} active member{activeMemberCount === 1 ? "" : "s"}
              </Text>
            </View>

            <View style={styles.headerAvatar}>
              <Ionicons name="people-outline" size={24} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.familyName}>{family?.name ?? "My Family"}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.totalCard}>
            <Text style={styles.cardLabel}>Total Contribution</Text>
            <Text style={styles.cardAmount}>{formatMoney(totalContribution)}</Text>
            <Text style={styles.cardHint}>
              Current contribution balance for your family members.
            </Text>
          </View>

          {statsUnavailable ? (
            <Text style={styles.fallbackHint}>
              Contribution stats are unavailable right now. Showing member data with fallback values.
            </Text>
          ) : null}

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Unable to load members</Text>
              <Text style={styles.errorText}>{error}</Text>
              <AppButton
                title="Try again"
                onPress={loadMembers}
                variant="outline"
              />
            </View>
          ) : mergedMembers.length === 0 ? (
            renderEmptyState()
          ) : (
            mergedMembers.map((member) => {
              const label = getStatusLabel(member.totalContribution);
              const amount = formatMoney(Math.abs(member.totalContribution));

              return (
                <View
                  key={member.userId}
                  style={[
                    styles.memberCard,
                    member.isTopContributor && styles.topMemberCard,
                  ]}
                >
                  <View style={styles.memberCardRow}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>
                        {getMemberInitials(member.fullName)}
                      </Text>
                    </View>

                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.fullName}</Text>
                      <Text style={styles.memberMeta}>
                        {statsUnavailable
                          ? "Contribution data unavailable"
                          : `${member.contributionPercentage}% contribution`}
                      </Text>
                    </View>

                    {member.isTopContributor ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Top Contributor</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.memberStatusRow}>
                    <Text style={styles.memberAmount}>{amount}</Text>
                    <Text
                      style={[
                        styles.memberStatus,
                        member.totalContribution > 0
                          ? styles.statusOwed
                          : member.totalContribution < 0
                          ? styles.statusOwes
                          : styles.statusSettled,
                      ]}
                    >
                      {label}
                    </Text>
                  </View>

                  <View style={styles.progressRow}>
                    <ProgressBar
                      progress={member.contributionPercentage}
                      style={styles.progressBar}
                    />
                  </View>
                </View>
              );
            })
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
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#EAF3F2",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "700",
    color: "#102E59",
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 22,
    paddingBottom: 28,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#E9FFF2",
    fontWeight: "600",
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  familyName: {
    marginTop: 18,
    color: "#E9FFF2",
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 18,
  },
  totalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    marginBottom: 18,
  },
  cardLabel: {
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 14,
  },
  cardAmount: {
    marginTop: 8,
    color: "#102E59",
    fontSize: 34,
    fontWeight: "900",
  },
  cardHint: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: "#FEF3F2",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#B91C1C",
  },
  errorText: {
    marginTop: 10,
    color: "#7F1D1D",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  fallbackHint: {
    marginBottom: 14,
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "900",
    color: "#102E59",
  },
  emptyText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  memberCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  topMemberCard: {
    borderColor: "#08C742",
    backgroundColor: "#F0FBF4",
  },
  memberCardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  memberAvatarText: {
    color: "#047857",
    fontSize: 18,
    fontWeight: "900",
  },
  memberInfo: {
    flex: 1,
    marginLeft: 14,
  },
  memberName: {
    color: "#102E59",
    fontSize: 16,
    fontWeight: "900",
  },
  memberMeta: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  badgeText: {
    color: "#047857",
    fontSize: 12,
    fontWeight: "900",
  },
  memberStatusRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  memberAmount: {
    color: "#102E59",
    fontSize: 18,
    fontWeight: "900",
  },
  memberStatus: {
    fontSize: 13,
    fontWeight: "700",
  },
  statusOwed: {
    color: "#047857",
  },
  statusOwes: {
    color: "#B91C1C",
  },
  statusSettled: {
    color: "#6B7280",
  },
  progressRow: {
    marginTop: 16,
  },
  progressBar: {
    width: "100%",
  },
});
