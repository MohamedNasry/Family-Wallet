import React, { useCallback, useState } from "react";
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

import { meApi } from "../../api/auth.api";
import { getBankAccountsApi } from "../../api/mockBank.api";
import type { BankAccount } from "../../types/bank.types";

export default function BankAccountsScreen() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      const meResponse = await meApi();
      const accountsResponse = await getBankAccountsApi(meResponse.user.userId);

      setAccounts(accountsResponse.accounts || []);
    } catch (error: any) {
      console.log("BANK ACCOUNTS ERROR:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [loadAccounts])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAccounts();
  };

  const formatMoney = (value: number | string) => {
    return `${Number(value || 0).toFixed(2)} MAD`;
  };

  const getCardNumber = (account: BankAccount) => {
    return account.maskedCardNumber || account.cardNumber || "**** **** **** ****";
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#08C742" size="large" />
        <Text style={styles.loadingText}>Loading accounts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Bank Accounts</Text>
          <Text style={styles.headerSubtitle}>View your mock bank balances</Text>
        </LinearGradient>

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/create-bank-account" as any)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create New Account</Text>
          </TouchableOpacity>

          {accounts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="card-outline" size={42} color="#98A2B3" />
              <Text style={styles.emptyTitle}>No accounts found</Text>
              <Text style={styles.emptyText}>
                Create a mock bank account to start testing charges and refunds.
              </Text>
            </View>
          ) : (
            accounts.map((account) => (
              <View key={account.bankAccountId} style={styles.accountCard}>
                <View style={styles.cardTop}>
                  <View style={styles.bankIcon}>
                    <Ionicons name="card-outline" size={30} color="#FFFFFF" />
                  </View>

                  {account.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.bankName}>{account.bankName}</Text>
                <Text style={styles.cardNumber}>{getCardNumber(account)}</Text>

                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Balance</Text>
                  <Text style={styles.balanceValue}>
                    {formatMoney(account.balance)}
                  </Text>
                </View>
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
    paddingBottom: 40,
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
    paddingTop: 34,
    paddingHorizontal: 18,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 16,
  },
  backText: {
    color: "#334155",
    fontWeight: "700",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#ECFDF5",
    marginTop: 10,
    fontSize: 17,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  createButton: {
    height: 62,
    borderRadius: 20,
    backgroundColor: "#08C742",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#102E59",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 12,
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  accountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  bankIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#2F80ED",
    justifyContent: "center",
    alignItems: "center",
  },
  defaultBadge: {
    backgroundColor: "#DFF8E8",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: "flex-start",
  },
  defaultBadgeText: {
    color: "#08A43A",
    fontWeight: "900",
  },
  bankName: {
    color: "#102E59",
    fontSize: 22,
    fontWeight: "900",
  },
  cardNumber: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  balanceRow: {
    marginTop: 20,
    backgroundColor: "#F4F5F7",
    borderRadius: 18,
    padding: 16,
  },
  balanceLabel: {
    color: "#64748B",
    fontWeight: "700",
  },
  balanceValue: {
    color: "#102E59",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 6,
  },
});