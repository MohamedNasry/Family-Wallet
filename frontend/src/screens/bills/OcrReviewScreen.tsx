import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getCategoriesApi } from "../../api/categories.api";
import { confirmOcrBillApi } from "../../api/bills.api";
import type { Category } from "../../types/category.types";

const showErrorMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    (globalThis as any).alert(`${title}\n${message}`);
    return;
  }

  Alert.alert(title, message);
};

const showSuccessAndGoToSplit = ({
  billId,
  amount,
  title,
}: {
  billId: number | string;
  amount: number | string;
  title: string;
}) => {
  const goToSplit = () => {
    router.replace({
      pathname: "/bills/split-expense" as any,
      params: {
        billId: String(billId),
        amount: String(amount),
        title,
      },
    });
  };

  if (Platform.OS === "web") {
    (globalThis as any).alert("Success\nBill created successfully");
    goToSplit();
    return;
  }

  Alert.alert("Success", "Bill created successfully", [
    {
      text: "Go to Split",
      onPress: goToSplit,
    },
  ]);
};

export default function OcrReviewScreen() {
  const params = useLocalSearchParams<{
    ocrId: string;
    title?: string;
    totalAmount?: string;
    currency?: string;
    billDate?: string;
    categoryId?: string;
  }>();

  const [title, setTitle] = useState(params.title || "");
  const [totalAmount, setTotalAmount] = useState(params.totalAmount || "");
  const [currency, setCurrency] = useState(params.currency || "MAD");
  const [billDate, setBillDate] = useState(params.billDate || "");
  const [categoryId, setCategoryId] = useState<number | null>(
    params.categoryId ? Number(params.categoryId) : null
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);

      const response = await getCategoriesApi();

      setCategories(response.categories || []);
    } catch (error: any) {
      showErrorMessage(
        "Error",
        error.message || "Failed to load categories"
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  const confirmBill = async () => {
    try {
      if (confirming || confirmed) {
        return;
      }

      const ocrId = Number(params.ocrId);
      const amount = Number(totalAmount);

      if (!ocrId) {
        showErrorMessage("Error", "Missing OCR id");
        return;
      }

      if (!title.trim()) {
        showErrorMessage("Validation", "Title is required");
        return;
      }

      if (!amount || Number.isNaN(amount) || amount <= 0) {
        showErrorMessage("Validation", "Valid amount is required");
        return;
      }

      if (!currency.trim()) {
        showErrorMessage("Validation", "Currency is required");
        return;
      }

      setConfirming(true);

      const response = await confirmOcrBillApi(ocrId, {
        title: title.trim(),
        totalAmount: amount,
        currency: currency.trim().toUpperCase(),
        categoryId,
        billDate: billDate || null,
      });

      const bill: any = response.bill;

      const billId = bill?.billId ?? bill?.bill_id;
      const billAmount = bill?.totalAmount ?? bill?.total_amount ?? amount;
      const billTitle = bill?.title ?? title.trim();

      if (!billId) {
        throw new Error("Bill was created but billId was not returned");
      }

      setConfirmed(true);

      showSuccessAndGoToSplit({
        billId,
        amount: billAmount,
        title: billTitle,
      });
    } catch (error: any) {
      showErrorMessage(
        "Error",
        error.message || "Failed to confirm OCR bill"
      );
    } finally {
      setConfirming(false);
    }
  };

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

          <Text style={styles.headerTitle}>Review Receipt</Text>

          <View style={{ width: 28 }} />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="document-text-outline" size={24} color="#2F80ED" />
          <Text style={styles.infoText}>
            Review the extracted data before creating the bill.
          </Text>
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Bill title"
          placeholderTextColor="#98A2B3"
          editable={!confirming && !confirmed}
        />

        <Text style={styles.label}>Total Amount</Text>
        <TextInput
          style={styles.input}
          value={totalAmount}
          onChangeText={setTotalAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#98A2B3"
          editable={!confirming && !confirmed}
        />

        <Text style={styles.label}>Currency</Text>
        <TextInput
          style={styles.input}
          value={currency}
          onChangeText={setCurrency}
          autoCapitalize="characters"
          placeholder="MAD"
          placeholderTextColor="#98A2B3"
          editable={!confirming && !confirmed}
        />

        <Text style={styles.label}>Bill Date</Text>
        <TextInput
          style={styles.input}
          value={billDate}
          onChangeText={setBillDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#98A2B3"
          editable={!confirming && !confirmed}
        />

        <Text style={styles.label}>Category</Text>

        {loadingCategories ? (
          <ActivityIndicator color="#08C742" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.categoryGrid}>
            {categories.map((category) => {
              const selected = categoryId === category.categoryId;

              return (
                <TouchableOpacity
                  key={category.categoryId}
                  style={[
                    styles.categoryChip,
                    selected && styles.categoryChipSelected,
                    (confirming || confirmed) && styles.disabledItem,
                  ]}
                  onPress={() => setCategoryId(category.categoryId)}
                  disabled={confirming || confirmed}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selected && styles.categoryChipTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.confirmButton,
            (confirming || confirmed) && styles.confirmButtonDisabled,
          ]}
          onPress={confirmBill}
          disabled={confirming || confirmed}
        >
          {confirming ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmText}>
              {confirmed ? "Bill Created" : "Confirm Bill"}
            </Text>
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
  infoBox: {
    backgroundColor: "#EAF2FF",
    borderRadius: 18,
    padding: 16,
    marginTop: 24,
    flexDirection: "row",
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: "#223B63",
    lineHeight: 22,
  },
  label: {
    marginTop: 18,
    marginBottom: 8,
    color: "#223B63",
    fontWeight: "800",
  },
  input: {
    height: 58,
    backgroundColor: "#F4F5F7",
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#102E59",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryChip: {
    backgroundColor: "#F4F5F7",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryChipSelected: {
    backgroundColor: "#DFF8E8",
    borderColor: "#08C742",
  },
  categoryChipText: {
    color: "#102E59",
    fontWeight: "700",
  },
  categoryChipTextSelected: {
    color: "#08A43A",
    fontWeight: "900",
  },
  disabledItem: {
    opacity: 0.6,
  },
  confirmButton: {
    height: 64,
    borderRadius: 20,
    backgroundColor: "#08C742",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
});