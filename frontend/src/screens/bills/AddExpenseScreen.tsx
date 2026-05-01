import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { getCategoriesApi } from "../../api/categories.api";
import { getMyFamilyApi, getFamilyMembersApi } from "../../api/family.api";
import { createBillApi } from "../../api/bills.api";

import type { Category } from "../../types/category.types";
import type { FamilyMember } from "../../types/family.types";

const iconMap: Record<string, { icon: string; color: string; bg: string }> = {
  Food: { icon: "shopping-bag", color: "#FF5B00", bg: "#FFE6C9" },
  Bills: { icon: "flash-outline", color: "#2F80ED", bg: "#DCEBFF" },
  Transport: { icon: "car-outline", color: "#A020F0", bg: "#F0DFFF" },
  Housing: { icon: "home-outline", color: "#0DBB63", bg: "#D9F8E6" },
  Education: { icon: "school-outline", color: "#5B5CFF", bg: "#E4E5FF" },
  Health: { icon: "heart-outline", color: "#FF3131", bg: "#FFE0E0" },
  Other: { icon: "ellipsis-horizontal", color: "#667085", bg: "#EFF1F4" },
};

function showMessage(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

function CategoryIcon({ name }: { name: string }) {
  const config = iconMap[name] || {
    icon: "grid-outline",
    color: "#667085",
    bg: "#EFF1F4",
  };

  if (name === "Food") {
    return (
      <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
        <MaterialIcons name="shopping-bag" size={28} color={config.color} />
      </View>
    );
  }

  return (
    <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
      <Ionicons name={config.icon as any} size={28} color={config.color} />
    </View>
  );
}

export default function AddExpenseScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [paidByUserId, setPaidByUserId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MAD");
  const [billDate, setBillDate] = useState(new Date().toISOString().slice(0, 10));

  const [paidByModalVisible, setPaidByModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [categoriesResponse, familyResponse] = await Promise.all([
        getCategoriesApi(),
        getMyFamilyApi(),
      ]);

      const familyId = Number(
        familyResponse.family.familyId ?? familyResponse.family.walletId
      );

      if (!familyId) {
        throw new Error("Invalid family id");
      }

      const membersResponse = await getFamilyMembersApi(familyId);

      setCategories(categoriesResponse.categories || []);
      setMembers(membersResponse.members || []);
      setCurrency(familyResponse.family.currency || "MAD");

      if (categoriesResponse.categories?.length) {
        setSelectedCategoryId(categoriesResponse.categories[0].categoryId);
      }

      if (membersResponse.members?.length) {
        setPaidByUserId(membersResponse.members[0].userId);
      }
    } catch (error: any) {
      setError(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = useMemo(() => {
    return categories.find((category) => category.categoryId === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  const selectedPaidBy = useMemo(() => {
    return members.find((member) => member.userId === paidByUserId);
  }, [members, paidByUserId]);

  const handleScanReceipt = () => {
    router.push({
      pathname: "/bills/scan-receipt" as any,
      params: {
        categoryId: selectedCategoryId ? String(selectedCategoryId) : "",
      },
    });
  };

  const handleCreateBill = async () => {
    try {
      const totalAmount = Number(amount);

      if (!title.trim()) {
        showMessage("Validation", "Title is required");
        return;
      }

      if (!totalAmount || Number.isNaN(totalAmount) || totalAmount <= 0) {
        showMessage("Validation", "Amount must be greater than 0");
        return;
      }

      if (!currency.trim()) {
        showMessage("Validation", "Currency is required");
        return;
      }

      if (!billDate.trim()) {
        showMessage("Validation", "Bill date is required");
        return;
      }

      if (!selectedCategoryId) {
        showMessage("Validation", "Please select a category");
        return;
      }

      if (!paidByUserId) {
        showMessage("Validation", "Please select who paid");
        return;
      }

      setCreating(true);

      const response = await createBillApi({
        title: title.trim(),
        totalAmount,
        currency: currency.trim().toUpperCase(),
        categoryId: selectedCategoryId,
        billDate,
        paidByUserId,
        items: [],
      });

      setCreated(true);

      showMessage("Success", "Expense created successfully");

      router.replace({
        pathname: "/bills/split-expense" as any,
        params: {
          billId: String(response.bill.billId),
          amount: String(response.bill.totalAmount),
          title: response.bill.title,
        },
      });
    } catch (error: any) {
      showMessage("Error", error.message || "Failed to create expense");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#08C742" size="large" />
        <Text style={styles.loadingText}>Loading expense form...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
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
            <Ionicons name="close" size={32} color="#667085" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Expense</Text>

          <View style={{ width: 32 }} />
        </View>

        <View style={styles.separator} />

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Grocery Shopping"
          placeholderTextColor="#98A2B3"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Amount</Text>
        <View style={styles.amountBox}>
          <Text style={styles.amountCurrency}>{currency}</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor="#98A2B3"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <Text style={styles.label}>Currency</Text>
        <TextInput
          style={styles.textInput}
          placeholder="MAD"
          placeholderTextColor="#98A2B3"
          autoCapitalize="characters"
          value={currency}
          onChangeText={setCurrency}
        />

        <Text style={styles.label}>Bill Date</Text>
        <TextInput
          style={styles.textInput}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#98A2B3"
          value={billDate}
          onChangeText={setBillDate}
        />

        <Text style={styles.label}>Category</Text>

        <View style={styles.grid}>
          {categories.map((category) => {
            const selected = selectedCategoryId === category.categoryId;

            return (
              <TouchableOpacity
                key={category.categoryId}
                style={[
                  styles.categoryCard,
                  selected && styles.categoryCardSelected,
                ]}
                onPress={() => setSelectedCategoryId(category.categoryId)}
              >
                <CategoryIcon name={category.name} />
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Paid By</Text>

        <TouchableOpacity
          style={styles.comboBox}
          onPress={() => setPaidByModalVisible(true)}
        >
          <Text style={styles.comboText}>
            {selectedPaidBy?.fullName || "Select member"}
          </Text>
          <Ionicons name="chevron-down" size={22} color="#98A2B3" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.scanButton} onPress={handleScanReceipt}>
          <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
          <Text style={styles.scanButtonText}>Scan Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.addButton,
            (creating || created) && styles.disabledButton,
          ]}
          onPress={handleCreateBill}
          disabled={creating || created}
        >
          {creating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.addButtonText}>
              {created ? "Expense Created" : "Add Expense"}
            </Text>
          )}
        </TouchableOpacity>

        {selectedCategory && (
          <Text style={styles.selectedText}>
            Selected: {selectedCategory.name}
          </Text>
        )}
      </ScrollView>

      <Modal
        visible={paidByModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPaidByModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Paid By</Text>

            {members.map((member) => {
              const active = paidByUserId === member.userId;

              return (
                <TouchableOpacity
                  key={member.userId}
                  style={[styles.memberOption, active && styles.memberOptionActive]}
                  onPress={() => {
                    setPaidByUserId(member.userId);
                    setPaidByModalVisible(false);
                  }}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.fullName
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{member.fullName}</Text>
                    <Text style={styles.memberRole}>{member.role}</Text>
                  </View>

                  {active && (
                    <Ionicons name="checkmark-circle" size={24} color="#08C742" />
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setPaidByModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#102E59",
    fontWeight: "700",
  },
  errorText: {
    color: "#EF4444",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#08C742",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: { color: "#FFFFFF", fontWeight: "800" },
  headerRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#102E59",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 18,
    marginBottom: 20,
  },
  label: {
    color: "#223B63",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 12,
  },
  textInput: {
    height: 58,
    backgroundColor: "#F4F5F7",
    borderRadius: 18,
    paddingHorizontal: 18,
    fontSize: 17,
    color: "#102E59",
    marginBottom: 10,
  },
  amountBox: {
    height: 100,
    backgroundColor: "#F4F5F7",
    borderRadius: 22,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  amountCurrency: {
    fontSize: 24,
    fontWeight: "900",
    color: "#98A2B3",
    marginRight: 14,
  },
  amountInput: {
    flex: 1,
    fontSize: 34,
    color: "#102E59",
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 14,
  },
  categoryCard: {
    width: "30.5%",
    minHeight: 130,
    borderRadius: 20,
    backgroundColor: "#F4F5F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryCardSelected: {
    backgroundColor: "#DFF8E8",
    borderColor: "#08C742",
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryName: {
    color: "#102E59",
    fontWeight: "700",
    textAlign: "center",
  },
  comboBox: {
    height: 64,
    backgroundColor: "#F4F5F7",
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  comboText: {
    color: "#102E59",
    fontSize: 17,
    fontWeight: "700",
  },
  scanButton: {
    height: 64,
    borderRadius: 20,
    backgroundColor: "#2F80ED",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  addButton: {
    height: 64,
    borderRadius: 20,
    backgroundColor: "#08C742",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  disabledButton: {
    opacity: 0.6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  selectedText: {
    textAlign: "center",
    color: "#667085",
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
  },
  modalTitle: {
    color: "#102E59",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 14,
  },
  memberOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F5F7",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  memberOptionActive: {
    backgroundColor: "#E8F8EF",
    borderColor: "#08C742",
  },
  memberAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2EC7C9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberAvatarText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  memberName: {
    color: "#102E59",
    fontWeight: "800",
    fontSize: 16,
  },
  memberRole: {
    color: "#667085",
    fontWeight: "600",
    marginTop: 3,
  },
  modalCancel: {
    backgroundColor: "#EEF2F6",
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  modalCancelText: {
    color: "#102E59",
    fontWeight: "800",
    fontSize: 16,
  },
});