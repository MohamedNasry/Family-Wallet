import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getMyFamilyApi, getFamilyMembersApi } from "../../api/family.api";
import { splitBillApi } from "../../api/bills.api";
import type { FamilyMember } from "../../types/family.types";

export default function SplitExpenseScreen() {
  const params = useLocalSearchParams<{
    billId?: string;
    amount?: string;
    title?: string;
  }>();

  const billId = Number(params.billId);
  const totalAmount = Number(params.amount || 0);

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [splitType, setSplitType] = useState<"EQUAL" | "CUSTOM">("EQUAL");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);

      const familyResponse = await getMyFamilyApi();
      const familyId = Number(
        familyResponse.family.familyId ?? familyResponse.family.walletId
      );

      if (!familyId) {
        throw new Error("Invalid family id");
      }

      const membersResponse = await getFamilyMembersApi(familyId);

      setMembers(membersResponse.members || []);
      setSelectedUserIds(
        (membersResponse.members || []).map((member) => member.userId)
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const selectedMembers = useMemo(() => {
    return members.filter((member) => selectedUserIds.includes(member.userId));
  }, [members, selectedUserIds]);

  const shares = useMemo(() => {
    if (selectedMembers.length === 0) return [];

    const base = Math.floor((totalAmount / selectedMembers.length) * 100) / 100;
    const totalBase = base * selectedMembers.length;
    const diff = Number((totalAmount - totalBase).toFixed(2));

    return selectedMembers.map((member, index) => ({
      ...member,
      share: index === selectedMembers.length - 1 ? base + diff : base,
    }));
  }, [selectedMembers, totalAmount]);

  const toggleMember = (userId: number) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }

      return [...prev, userId];
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const confirmSplit = async () => {
    try {
      if (!billId) {
        Alert.alert("Error", "Invalid bill id");
        return;
      }

      if (selectedUserIds.length === 0) {
        Alert.alert("Validation", "Please select at least one member");
        return;
      }

      setSubmitting(true);

      await splitBillApi(billId, {
        splitType: "EQUAL",
        userIds: selectedUserIds,
      });

      Alert.alert("Success", "Bill split created successfully", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)" as any),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to split bill");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#08C742" size="large" />
        <Text style={styles.loadingText}>Loading family members...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#102E59" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Split Expense</Text>

          <View style={{ width: 28 }} />
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Split Method</Text>

        <View style={styles.methodRow}>
          <TouchableOpacity
            style={[
              styles.methodCard,
              splitType === "EQUAL" && styles.methodSelected,
            ]}
            onPress={() => setSplitType("EQUAL")}
          >
            <Ionicons name="people-outline" size={30} color="#08C742" />
            <Text style={styles.methodText}>Equal Split</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodCard,
              splitType === "CUSTOM" && styles.methodSelected,
            ]}
            onPress={() =>
              Alert.alert("Coming Soon", "Custom split will be added later")
            }
          >
            <Ionicons name="cash-outline" size={30} color="#667085" />
            <Text style={styles.methodText}>Custom Split</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Members</Text>

        {members.map((member) => {
          const selected = selectedUserIds.includes(member.userId);

          return (
            <TouchableOpacity
              key={member.userId}
              style={[styles.memberCard, selected && styles.memberSelected]}
              onPress={() => toggleMember(member.userId)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(member.fullName)}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{member.fullName}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>

              <Ionicons
                name={selected ? "checkmark-circle" : "ellipse-outline"}
                size={26}
                color={selected ? "#08C742" : "#98A2B3"}
              />
            </TouchableOpacity>
          );
        })}

        <Text style={styles.sectionTitle}>Split Breakdown</Text>

        {shares.map((member) => (
          <View key={member.userId} style={styles.breakdownCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(member.fullName)}
              </Text>
            </View>

            <Text style={styles.memberName}>{member.fullName}</Text>
            <Text style={styles.shareAmount}>${member.share.toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.infoCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#2F80ED" />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Payment Tracking</Text>
            <Text style={styles.infoText}>
              Each member will get a split record. You can track who has paid
              in the Payments section.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, submitting && { opacity: 0.7 }]}
          onPress={confirmSplit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmText}>Confirm Split</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 20, paddingBottom: 30 },
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
  headerRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#102E59",
    fontSize: 22,
    fontWeight: "900",
  },
  totalCard: {
    marginTop: 28,
    backgroundColor: "#EAF4F5",
    borderRadius: 24,
    alignItems: "center",
    paddingVertical: 34,
  },
  totalLabel: {
    color: "#475569",
    fontSize: 18,
  },
  totalValue: {
    color: "#102E59",
    fontSize: 38,
    fontWeight: "900",
    marginTop: 8,
  },
  sectionTitle: {
    color: "#102E59",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 26,
    marginBottom: 14,
  },
  methodRow: {
    flexDirection: "row",
    gap: 14,
  },
  methodCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 24,
    alignItems: "center",
  },
  methodSelected: {
    backgroundColor: "#E7F8EE",
    borderColor: "#08C742",
  },
  methodText: {
    marginTop: 10,
    color: "#102E59",
    fontWeight: "800",
  },
  memberCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  memberSelected: {
    borderColor: "#08C742",
    backgroundColor: "#F0FFF5",
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2EC7C9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18,
  },
  memberName: {
    color: "#102E59",
    fontSize: 17,
    fontWeight: "800",
  },
  memberRole: {
    marginTop: 4,
    color: "#667085",
    fontWeight: "600",
  },
  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  shareAmount: {
    marginLeft: "auto",
    color: "#102E59",
    fontSize: 17,
    fontWeight: "900",
  },
  infoCard: {
    backgroundColor: "#EAF2FF",
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  infoTitle: {
    color: "#102E59",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 6,
  },
  infoText: {
    color: "#475569",
    lineHeight: 22,
  },
  confirmButton: {
    height: 64,
    borderRadius: 20,
    backgroundColor: "#08C742",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
});