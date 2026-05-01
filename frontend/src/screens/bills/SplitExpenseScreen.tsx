import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getMyFamilyApi, getFamilyMembersApi } from "../../api/family.api";
import { splitBillApi } from "../../api/bills.api";
import type { FamilyMember } from "../../types/family.types";

type SplitMode = "EQUAL" | "PERCENTAGE" | "FIXED";

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

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
  const [splitMode, setSplitMode] = useState<SplitMode>("EQUAL");

  const [percentageValues, setPercentageValues] = useState<
    Record<number, string>
  >({});
  const [fixedValues, setFixedValues] = useState<Record<number, string>>({});

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
      const familyMembers = membersResponse.members || [];

const eligibleMembers = familyMembers.filter((member) => {
  return member.role === "PARENT" || member.role === "MEMBER";
});

setMembers(eligibleMembers);

const userIds = eligibleMembers.map((member) => member.userId);

      if (userIds.length > 0) {
        const equalPercentage = Number((100 / userIds.length).toFixed(2));
        const equalFixed = Number((totalAmount / userIds.length).toFixed(2));

        const initialPercentages: Record<number, string> = {};
        const initialFixed: Record<number, string> = {};

        userIds.forEach((userId, index) => {
          initialPercentages[userId] =
            index === userIds.length - 1
              ? String(
                  Number(
                    (
                      100 -
                      equalPercentage * (userIds.length - 1)
                    ).toFixed(2)
                  )
                )
              : String(equalPercentage);

          initialFixed[userId] =
            index === userIds.length - 1
              ? String(
                  Number(
                    (
                      totalAmount -
                      equalFixed * (userIds.length - 1)
                    ).toFixed(2)
                  )
                )
              : String(equalFixed);
        });

        setPercentageValues(initialPercentages);
        setFixedValues(initialFixed);
      }
    } catch (error: any) {
      showMessage("Error", error.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const selectedMembers = useMemo(() => {
    return members.filter((member) => selectedUserIds.includes(member.userId));
  }, [members, selectedUserIds]);

  const shares = useMemo(() => {
    if (selectedMembers.length === 0) return [];

    if (splitMode === "EQUAL") {
      const base =
        Math.floor((totalAmount / selectedMembers.length) * 100) / 100;

      const totalBase = Number((base * selectedMembers.length).toFixed(2));
      const diff = Number((totalAmount - totalBase).toFixed(2));

      return selectedMembers.map((member, index) => ({
        ...member,
        share:
          index === selectedMembers.length - 1
            ? Number((base + diff).toFixed(2))
            : base,
      }));
    }

    if (splitMode === "PERCENTAGE") {
      return selectedMembers.map((member) => {
        const percentage = Number(percentageValues[member.userId] || 0);
        const share = Number(((totalAmount * percentage) / 100).toFixed(2));

        return {
          ...member,
          share,
        };
      });
    }

    return selectedMembers.map((member) => {
      const fixedAmount = Number(fixedValues[member.userId] || 0);

      return {
        ...member,
        share: fixedAmount,
      };
    });
  }, [
    selectedMembers,
    totalAmount,
    splitMode,
    percentageValues,
    fixedValues,
  ]);

  const percentageTotal = useMemo(() => {
    return selectedMembers.reduce((sum, member) => {
      return sum + Number(percentageValues[member.userId] || 0);
    }, 0);
  }, [selectedMembers, percentageValues]);

  const fixedTotal = useMemo(() => {
    return selectedMembers.reduce((sum, member) => {
      return sum + Number(fixedValues[member.userId] || 0);
    }, 0);
  }, [selectedMembers, fixedValues]);

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
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatMoney = (value: number | string) => {
    return `${Number(value || 0).toFixed(2)} MAD`;
  };

  const validateSplit = () => {
    if (!billId) {
      showMessage("Error", "Invalid bill id");
      return false;
    }

    if (selectedUserIds.length === 0) {
      showMessage("Validation", "Please select at least one member");
      return false;
    }

    if (splitMode === "PERCENTAGE") {
      const roundedTotal = Number(percentageTotal.toFixed(2));

      if (Math.abs(roundedTotal - 100) > 0.01) {
        showMessage(
          "Validation",
          `Percentage total must be 100%. Current total is ${roundedTotal}%`
        );
        return false;
      }

      const hasInvalidPercentage = selectedMembers.some((member) => {
        const value = Number(percentageValues[member.userId] || 0);
        return Number.isNaN(value) || value <= 0;
      });

      if (hasInvalidPercentage) {
        showMessage(
          "Validation",
          "Each selected member must have a percentage greater than 0"
        );
        return false;
      }
    }

    if (splitMode === "FIXED") {
      const roundedTotal = Number(fixedTotal.toFixed(2));
      const roundedBillTotal = Number(totalAmount.toFixed(2));

      if (Math.abs(roundedTotal - roundedBillTotal) > 0.01) {
        showMessage(
          "Validation",
          `Fixed amount total must equal ${formatMoney(
            totalAmount
          )}. Current total is ${formatMoney(roundedTotal)}`
        );
        return false;
      }

      const hasInvalidFixed = selectedMembers.some((member) => {
        const value = Number(fixedValues[member.userId] || 0);
        return Number.isNaN(value) || value <= 0;
      });

      if (hasInvalidFixed) {
        showMessage(
          "Validation",
          "Each selected member must have a fixed amount greater than 0"
        );
        return false;
      }
    }

    return true;
  };

  const confirmSplit = async () => {
    try {
      if (!validateSplit()) return;

      setSubmitting(true);

      if (splitMode === "EQUAL") {
        await splitBillApi(billId, {
          splitType: "EQUAL",
          participants: selectedUserIds.map((userId) => ({
            userId,
          })),
        });
      }

      if (splitMode === "PERCENTAGE") {
        await splitBillApi(billId, {
          splitType: "PERCENTAGE",
          participants: selectedMembers.map((member) => ({
            userId: member.userId,
            percentage: Number(percentageValues[member.userId]),
          })),
        });
      }

      if (splitMode === "FIXED") {
        await splitBillApi(billId, {
          splitType: "FIXED",
          participants: selectedMembers.map((member) => ({
            userId: member.userId,
            fixedAmount: Number(fixedValues[member.userId]),
          })),
        });
      }

      showMessage("Success", "Bill split created successfully");

      router.replace("/(tabs)" as any);
    } catch (error: any) {
      showMessage("Error", error.message || "Failed to split bill");
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
            <Ionicons name="arrow-back" size={30} color="#102E59" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Split Expense</Text>

          <View style={{ width: 30 }} />
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{formatMoney(totalAmount)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Split Method</Text>

        <View style={styles.methodRow}>
          <TouchableOpacity
            style={[
              styles.methodCard,
              splitMode === "EQUAL" && styles.methodSelected,
            ]}
            onPress={() => setSplitMode("EQUAL")}
          >
            <Ionicons
              name="people-outline"
              size={34}
              color={splitMode === "EQUAL" ? "#08C742" : "#667085"}
            />
            <Text
              style={[
                styles.methodText,
                splitMode === "EQUAL" && styles.methodTextSelected,
              ]}
            >
              Equal Split
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodCard,
              splitMode !== "EQUAL" && styles.methodSelected,
            ]}
            onPress={() => setSplitMode("PERCENTAGE")}
          >
            <Ionicons
              name="cash-outline"
              size={34}
              color={splitMode !== "EQUAL" ? "#08C742" : "#667085"}
            />
            <Text
              style={[
                styles.methodText,
                splitMode !== "EQUAL" && styles.methodTextSelected,
              ]}
            >
              Custom Split
            </Text>
          </TouchableOpacity>
        </View>

        {splitMode !== "EQUAL" && (
          <>
            <Text style={styles.sectionTitle}>Custom Type</Text>

            <View style={styles.customTypeRow}>
              <TouchableOpacity
                style={[
                  styles.customTypeButton,
                  splitMode === "PERCENTAGE" &&
                    styles.customTypeButtonActive,
                ]}
                onPress={() => setSplitMode("PERCENTAGE")}
              >
                <Text
                  style={[
                    styles.customTypeText,
                    splitMode === "PERCENTAGE" &&
                      styles.customTypeTextActive,
                  ]}
                >
                  Percentage
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.customTypeButton,
                  splitMode === "FIXED" && styles.customTypeButtonActive,
                ]}
                onPress={() => setSplitMode("FIXED")}
              >
                <Text
                  style={[
                    styles.customTypeText,
                    splitMode === "FIXED" && styles.customTypeTextActive,
                  ]}
                >
                  Fixed Amount
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

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
                size={28}
                color={selected ? "#08C742" : "#98A2B3"}
              />
            </TouchableOpacity>
          );
        })}

        {splitMode !== "EQUAL" && (
          <>
            <Text style={styles.sectionTitle}>
              {splitMode === "PERCENTAGE"
                ? "Percentage Values"
                : "Fixed Amount Values"}
            </Text>

            {selectedMembers.map((member) => (
              <View key={member.userId} style={styles.inputRow}>
                <View style={styles.smallAvatar}>
                  <Text style={styles.smallAvatarText}>
                    {getInitials(member.fullName)}
                  </Text>
                </View>

                <Text style={styles.inputMemberName}>{member.fullName}</Text>

                <TextInput
                  style={styles.valueInput}
                  keyboardType="decimal-pad"
                  value={
                    splitMode === "PERCENTAGE"
                      ? percentageValues[member.userId] || ""
                      : fixedValues[member.userId] || ""
                  }
                  onChangeText={(value) => {
                    if (splitMode === "PERCENTAGE") {
                      setPercentageValues((prev) => ({
                        ...prev,
                        [member.userId]: value,
                      }));
                    } else {
                      setFixedValues((prev) => ({
                        ...prev,
                        [member.userId]: value,
                      }));
                    }
                  }}
                  placeholder={splitMode === "PERCENTAGE" ? "0%" : "0.00"}
                  placeholderTextColor="#98A2B3"
                />

                <Text style={styles.inputSuffix}>
                  {splitMode === "PERCENTAGE" ? "%" : "MAD"}
                </Text>
              </View>
            ))}

            <View
              style={[
                styles.totalCheckBox,
                splitMode === "PERCENTAGE"
                  ? Math.abs(Number(percentageTotal.toFixed(2)) - 100) <= 0.01
                    ? styles.totalCheckBoxOk
                    : styles.totalCheckBoxError
                  : Math.abs(
                      Number(fixedTotal.toFixed(2)) -
                        Number(totalAmount.toFixed(2))
                    ) <= 0.01
                  ? styles.totalCheckBoxOk
                  : styles.totalCheckBoxError,
              ]}
            >
              <Text style={styles.totalCheckText}>
                {splitMode === "PERCENTAGE"
                  ? `Total Percentage: ${Number(
                      percentageTotal.toFixed(2)
                    )}% / 100%`
                  : `Total Fixed: ${formatMoney(
                      Number(fixedTotal.toFixed(2))
                    )} / ${formatMoney(totalAmount)}`}
              </Text>
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Split Breakdown</Text>

        {shares.map((member) => (
          <View key={member.userId} style={styles.breakdownCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(member.fullName)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{member.fullName}</Text>

              {splitMode === "PERCENTAGE" && (
                <Text style={styles.breakdownMeta}>
                  {percentageValues[member.userId] || 0}%
                </Text>
              )}

              {splitMode === "FIXED" && (
                <Text style={styles.breakdownMeta}>Fixed amount</Text>
              )}
            </View>

            <Text style={styles.shareAmount}>{formatMoney(member.share)}</Text>
          </View>
        ))}

        <View style={styles.infoCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#2F80ED" />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Payment Tracking</Text>
            <Text style={styles.infoText}>
              Each selected member will get a split record. You can track who
              has paid in the Payments section.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, submitting && styles.disabled]}
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
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 20,
    paddingBottom: 30,
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
  methodTextSelected: {
    color: "#08A43A",
  },
  customTypeRow: {
    flexDirection: "row",
    gap: 12,
  },
  customTypeButton: {
    flex: 1,
    backgroundColor: "#F4F5F7",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  customTypeButtonActive: {
    backgroundColor: "#DFF8E8",
    borderColor: "#08C742",
  },
  customTypeText: {
    color: "#102E59",
    fontWeight: "800",
  },
  customTypeTextActive: {
    color: "#08A43A",
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
  smallAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2EC7C9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  smallAvatarText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14,
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
  inputRow: {
    backgroundColor: "#F4F5F7",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  inputMemberName: {
    flex: 1,
    color: "#102E59",
    fontWeight: "800",
  },
  valueInput: {
    width: 90,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    color: "#102E59",
    fontWeight: "800",
    textAlign: "center",
  },
  inputSuffix: {
    marginLeft: 8,
    color: "#667085",
    fontWeight: "800",
  },
  totalCheckBox: {
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
  },
  totalCheckBoxOk: {
    backgroundColor: "#DCFCE7",
  },
  totalCheckBoxError: {
    backgroundColor: "#FEE2E2",
  },
  totalCheckText: {
    color: "#102E59",
    fontWeight: "900",
    textAlign: "center",
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
  breakdownMeta: {
    color: "#667085",
    marginTop: 4,
    fontWeight: "600",
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
  disabled: {
    opacity: 0.6,
  },
});