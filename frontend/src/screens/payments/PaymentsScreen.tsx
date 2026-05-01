import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { meApi } from "../../api/auth.api";
import {
  getBankAccountsApi,
  chargeBankAccountApi,
  refundBankAccountApi,
} from "../../api/mockBank.api";
import { getBillsApi } from "../../api/bills.api";
import { getMySplitsApi } from "../../api/splits.api";

import type { User } from "../../types/user.types";
import type { BankAccount } from "../../types/bank.types";
import type { Bill } from "../../types/bill.types";
import type { MySplit } from "../../types/split.types";

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const getAccountId = (account: any) => {
  return Number(account.bankAccountId ?? account.bank_account_id);
};

const getBankName = (account: any) => {
  return account.bankName ?? account.bank_name ?? "Bank Account";
};

const getCardNumber = (account: any) => {
  return (
    account.maskedCardNumber ??
    account.masked_card_number ??
    account.cardNumber ??
    account.card_number ??
    "**** **** **** ****"
  );
};

const getIsDefault = (account: any) => {
  return Boolean(account.isDefault ?? account.is_default);
};

const getAccountBalance = (account: any) => {
  return Number(account.balance ?? 0);
};

const getBillId = (bill: any) => {
  return Number(bill.billId ?? bill.bill_id);
};

const getBillTitle = (bill: any) => {
  return bill.title ?? "Untitled Bill";
};

const getBillAmount = (bill: any) => {
  return Number(bill.totalAmount ?? bill.total_amount ?? 0);
};

const getBillCategoryName = (bill: any) => {
  return bill.categoryName ?? bill.category_name ?? "Uncategorized";
};

const getSplitId = (split: any) => {
  return Number(split.splitId ?? split.split_id);
};

const getSplitBillId = (split: any) => {
  return Number(split.billId ?? split.bill_id);
};

const getSplitTitle = (split: any) => {
  return split.billTitle ?? split.bill_title ?? "Untitled Bill";
};

const getSplitAmountDue = (split: any) => {
  return Number(split.amountDue ?? split.amount_due ?? 0);
};

const getSplitCurrency = (split: any) => {
  return split.currency ?? "MAD";
};

const getSplitStatus = (split: any) => {
  return split.status ?? "UNPAID";
};

const getSplitType = (split: any) => {
  return split.splitType ?? split.split_type ?? "EQUAL";
};

const getSplitCategoryName = (split: any) => {
  return split.categoryName ?? split.category_name ?? "Uncategorized";
};

export default function PaymentsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [mySplits, setMySplits] = useState<MySplit[]>([]);

  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);

  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingSplitId, setProcessingSplitId] = useState<number | null>(
    null
  );

  const selectedAccount = useMemo(() => {
    return (
      accounts.find(
        (account: any) => getAccountId(account) === selectedAccountId
      ) || null
    );
  }, [accounts, selectedAccountId]);

  const selectedBill = useMemo(() => {
    return bills.find((bill: any) => getBillId(bill) === selectedBillId) || null;
  }, [bills, selectedBillId]);

  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, account: any) => {
      return sum + getAccountBalance(account);
    }, 0);
  }, [accounts]);

  const defaultAccount = useMemo(() => {
    return (
      accounts.find((account: any) => getIsDefault(account)) ||
      accounts[0] ||
      null
    );
  }, [accounts]);

  const paidSplitsCount = useMemo(() => {
    return mySplits.filter((split: any) => getSplitStatus(split) === "PAID")
      .length;
  }, [mySplits]);

  const unpaidSplitsCount = useMemo(() => {
    return mySplits.filter((split: any) => getSplitStatus(split) !== "PAID")
      .length;
  }, [mySplits]);

  const unpaidAmount = useMemo(() => {
    return mySplits.reduce((sum, split: any) => {
      if (getSplitStatus(split) === "PAID") return sum;
      return sum + getSplitAmountDue(split);
    }, 0);
  }, [mySplits]);

  const loadPayments = useCallback(async () => {
    try {
      const meResponse = await meApi();
      const currentUser = meResponse.user;

      setUser(currentUser);

      const [accountsResponse, billsResponse, splitsResponse] =
        await Promise.all([
          getBankAccountsApi(currentUser.userId),
          getBillsApi(),
          getMySplitsApi(),
        ]);

      const fetchedAccounts = accountsResponse.accounts || [];
      const fetchedBills = billsResponse.bills || [];
      const fetchedSplits = splitsResponse.splits || [];

      setAccounts(fetchedAccounts);
      setBills(fetchedBills);
      setMySplits(fetchedSplits);

      if (fetchedAccounts.length > 0) {
        const defaultAcc =
          fetchedAccounts.find((account: any) => getIsDefault(account)) ||
          fetchedAccounts[0];

        setSelectedAccountId(getAccountId(defaultAcc));
      } else {
        setSelectedAccountId(null);
      }

      if (fetchedBills.length > 0) {
        const firstBill = fetchedBills[0];

        setSelectedBillId(getBillId(firstBill));
        setAmount(String(getBillAmount(firstBill)));
      } else {
        setSelectedBillId(null);
        setAmount("");
      }
    } catch (error: any) {
      showMessage("Error", error.message || "Failed to load payments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [loadPayments])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const formatMoney = (value: number | string, currency = "MAD") => {
    return `${Number(value || 0).toFixed(2)} ${currency}`;
  };

  const selectBill = (bill: Bill) => {
    const billId = getBillId(bill);
    const billAmount = getBillAmount(bill);

    setSelectedBillId(billId);
    setAmount(String(billAmount));
  };

  const validateManualOperation = () => {
    const parsedAmount = Number(amount);

    if (!selectedAccountId) {
      showMessage("Validation", "Please select a bank account");
      return null;
    }

    if (!selectedBillId) {
      showMessage("Validation", "Please select a bill");
      return null;
    }

    if (!parsedAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      showMessage("Validation", "Amount must be greater than 0");
      return null;
    }

    return {
      bankAccountID: selectedAccountId,
      billID: selectedBillId,
      cost: parsedAmount,
    };
  };

  const handleCharge = async () => {
    try {
      const payload = validateManualOperation();

      if (!payload) return;

      setProcessing(true);

      await chargeBankAccountApi(payload);

      showMessage("Success", "Payment charged successfully");

      await loadPayments();
    } catch (error: any) {
      showMessage(
        "Charge Failed",
        error.message || "Insufficient balance or failed charge"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleRefund = async () => {
    try {
      const payload = validateManualOperation();

      if (!payload) return;

      setProcessing(true);

      await refundBankAccountApi(payload);

      showMessage("Success", "Payment refunded successfully");

      await loadPayments();
    } catch (error: any) {
      showMessage("Refund Failed", error.message || "Failed to refund payment");
    } finally {
      setProcessing(false);
    }
  };

  const handlePaySplit = async (split: MySplit) => {
    try {
      const splitId = getSplitId(split);
      const splitStatus = getSplitStatus(split);
      const billId = getSplitBillId(split);
      const cost = getSplitAmountDue(split);

      if (!selectedAccountId) {
        showMessage("Validation", "Please select a bank account first");
        return;
      }

      if (!splitId || Number.isNaN(splitId)) {
        showMessage("Validation", "Invalid split id");
        return;
      }

      if (splitStatus === "PAID") {
        showMessage("Info", "This split is already paid");
        return;
      }

      if (!billId || Number.isNaN(billId)) {
        showMessage("Validation", "Invalid bill id");
        return;
      }

      if (!cost || Number.isNaN(cost) || cost <= 0) {
        showMessage("Validation", "Invalid split amount");
        return;
      }

      setProcessingSplitId(splitId);

      await chargeBankAccountApi({
        bankAccountID: selectedAccountId,
        billID: billId,
        cost,
        splitID: splitId,
      } as any);

      showMessage("Success", "Split payment completed successfully");

      await loadPayments();
    } catch (error: any) {
      showMessage("Payment Failed", error.message || "Failed to pay split");
    } finally {
      setProcessingSplitId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#08C742" size="large" />
        <Text style={styles.loadingText}>Loading payments...</Text>
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleRow}>
            <Ionicons name="card-outline" size={30} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Payment Tracking</Text>
          </View>

          <Text style={styles.headerSubtitle}>Track accounts and payments</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconGreen}>
                <Ionicons name="wallet-outline" size={26} color="#08A63A" />
              </View>

              <Text style={styles.statNumber}>{accounts.length}</Text>
              <Text style={styles.statLabel}>Accounts</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconBlue}>
                <Ionicons name="cash-outline" size={26} color="#2F80ED" />
              </View>

              <Text style={styles.statNumber}>{formatMoney(totalBalance)}</Text>
              <Text style={styles.statLabel}>Total Balance</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconGreen}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={26}
                  color="#08A63A"
                />
              </View>

              <Text style={styles.statNumber}>{paidSplitsCount}</Text>
              <Text style={styles.statLabel}>Paid Splits</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconOrange}>
                <Ionicons name="time-outline" size={26} color="#F97316" />
              </View>

              <Text style={styles.statNumber}>{unpaidSplitsCount}</Text>
              <Text style={styles.statLabel}>Unpaid Splits</Text>
            </View>
          </View>

          <View style={styles.unpaidSummaryCard}>
            <Text style={styles.unpaidSummaryLabel}>Total Unpaid Amount</Text>
            <Text style={styles.unpaidSummaryValue}>
              {formatMoney(unpaidAmount)}
            </Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Default Account</Text>

            <TouchableOpacity
              onPress={() => router.push("/bank-accounts" as any)}
            >
              <Text style={styles.seeAll}>Manage</Text>
            </TouchableOpacity>
          </View>

          {defaultAccount ? (
            <View style={styles.defaultAccountCard}>
              <View style={styles.bankIcon}>
                <Ionicons name="card-outline" size={28} color="#FFFFFF" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.bankName}>{getBankName(defaultAccount)}</Text>
                <Text style={styles.cardNumber}>
                  {getCardNumber(defaultAccount)}
                </Text>
                <Text style={styles.balanceText}>
                  {formatMoney(getAccountBalance(defaultAccount))}
                </Text>
              </View>

              {getIsDefault(defaultAccount) && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="card-outline" size={36} color="#98A2B3" />
              <Text style={styles.emptyTitle}>No bank account yet</Text>
              <Text style={styles.emptyText}>
                Create a mock bank account to test payments.
              </Text>
            </View>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/bank-accounts" as any)}
            >
              <Ionicons name="list-outline" size={22} color="#102E59" />
              <Text style={styles.actionText}>Accounts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonGreen}
              onPress={() => router.push("/create-bank-account" as any)}
            >
              <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
              <Text style={styles.actionTextWhite}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.operationCard}>
            <Text style={styles.operationTitle}>My Split Payments</Text>

            <Text style={styles.inputLabel}>Selected Account</Text>

            {accounts.length === 0 ? (
              <Text style={styles.helpText}>No bank accounts available.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {accounts.map((account: any) => {
                  const accountId = getAccountId(account);
                  const selected = accountId === selectedAccountId;

                  return (
                    <TouchableOpacity
                      key={accountId}
                      style={[
                        styles.accountPill,
                        selected && styles.accountPillSelected,
                      ]}
                      onPress={() => setSelectedAccountId(accountId)}
                    >
                      <Text
                        style={[
                          styles.accountPillText,
                          selected && styles.accountPillTextSelected,
                        ]}
                      >
                        {getBankName(account)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {mySplits.length === 0 ? (
              <View style={styles.noBillsBox}>
                <Ionicons name="receipt-outline" size={28} color="#98A2B3" />
                <Text style={styles.helpText}>
                  No split payments found for your account.
                </Text>
              </View>
            ) : (
              mySplits.map((split: any) => {
                const splitId = getSplitId(split);
                const status = getSplitStatus(split);
                const paid = status === "PAID";
                const splitCurrency = getSplitCurrency(split);
                const isCurrentProcessing = processingSplitId === splitId;

                return (
                  <View key={splitId} style={styles.splitCard}>
                    <View style={styles.splitIcon}>
                      <Ionicons
                        name={
                          paid ? "checkmark-circle-outline" : "time-outline"
                        }
                        size={26}
                        color={paid ? "#08A63A" : "#F97316"}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.splitTitle} numberOfLines={1}>
                        #{getSplitBillId(split)} • {getSplitTitle(split)}
                      </Text>

                      <Text style={styles.splitMeta} numberOfLines={1}>
                        {getSplitCategoryName(split)} • {getSplitType(split)}
                      </Text>

                      <Text style={styles.splitAmount}>
                        Due:{" "}
                        {formatMoney(getSplitAmountDue(split), splitCurrency)}
                      </Text>
                    </View>

                    <View style={paid ? styles.paidBadge : styles.unpaidBadge}>
                      <Text style={paid ? styles.paidText : styles.unpaidText}>
                        {paid ? "PAID" : "UNPAID"}
                      </Text>
                    </View>

                    {!paid && (
                      <TouchableOpacity
                        style={[
                          styles.paySplitButton,
                          (processingSplitId !== null || !selectedAccountId) &&
                            styles.disabled,
                        ]}
                        onPress={() => handlePaySplit(split)}
                        disabled={
                          processingSplitId !== null || !selectedAccountId
                        }
                      >
                        {isCurrentProcessing ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text style={styles.paySplitText}>Pay</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.operationCard}>
            <Text style={styles.operationTitle}>Charge / Refund Bill</Text>

            <Text style={styles.inputLabel}>Select Account</Text>

            {accounts.length === 0 ? (
              <Text style={styles.helpText}>No bank accounts available.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {accounts.map((account: any) => {
                  const accountId = getAccountId(account);
                  const selected = accountId === selectedAccountId;

                  return (
                    <TouchableOpacity
                      key={accountId}
                      style={[
                        styles.accountPill,
                        selected && styles.accountPillSelected,
                      ]}
                      onPress={() => setSelectedAccountId(accountId)}
                    >
                      <Text
                        style={[
                          styles.accountPillText,
                          selected && styles.accountPillTextSelected,
                        ]}
                      >
                        {getBankName(account)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <Text style={styles.inputLabel}>Select Bill</Text>

            {bills.length === 0 ? (
              <View style={styles.noBillsBox}>
                <Ionicons name="receipt-outline" size={28} color="#98A2B3" />
                <Text style={styles.helpText}>
                  No bills found. Add an expense first.
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {bills.map((bill: any) => {
                  const billId = getBillId(bill);
                  const selected = billId === selectedBillId;

                  return (
                    <TouchableOpacity
                      key={billId}
                      style={[
                        styles.billPill,
                        selected && styles.billPillSelected,
                      ]}
                      onPress={() => selectBill(bill)}
                    >
                      <Text
                        style={[
                          styles.billTitle,
                          selected && styles.billTitleSelected,
                        ]}
                        numberOfLines={1}
                      >
                        #{billId} • {getBillTitle(bill)}
                      </Text>

                      <Text
                        style={[
                          styles.billMeta,
                          selected && styles.billMetaSelected,
                        ]}
                      >
                        {getBillCategoryName(bill)} •{" "}
                        {formatMoney(getBillAmount(bill))}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <Text style={styles.inputLabel}>Amount</Text>

            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Example: 128.15"
              placeholderTextColor="#98A2B3"
              keyboardType="decimal-pad"
            />

            {selectedAccount && (
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedInfoText}>
                  Selected balance:{" "}
                  {formatMoney(getAccountBalance(selectedAccount))}
                </Text>
              </View>
            )}

            {selectedBill && (
              <View style={styles.selectedBillInfo}>
                <Text style={styles.selectedBillTitle}>
                  Selected Bill: #{getBillId(selectedBill)} •{" "}
                  {getBillTitle(selectedBill)}
                </Text>
                <Text style={styles.selectedBillAmount}>
                  Bill amount: {formatMoney(getBillAmount(selectedBill))}
                </Text>
              </View>
            )}

            <View style={styles.operationButtons}>
              <TouchableOpacity
                style={[styles.chargeButton, processing && styles.disabled]}
                onPress={handleCharge}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.operationButtonText}>Charge</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.refundButton, processing && styles.disabled]}
                onPress={handleRefund}
                disabled={processing}
              >
                <Text style={styles.operationButtonText}>Refund</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.noteText}>
              Charge decreases the selected bank account balance. Split payment
              is handled by POST /api/mock-bank/charge with splitID.
            </Text>
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
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#ECFDF5",
    fontSize: 17,
    marginTop: 12,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 22,
    alignItems: "center",
  },
  statIconGreen: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  statIconBlue: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  statIconOrange: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFEDD5",
    justifyContent: "center",
    alignItems: "center",
  },
  statNumber: {
    marginTop: 12,
    fontSize: 22,
    color: "#102E59",
    fontWeight: "900",
    textAlign: "center",
  },
  statLabel: {
    color: "#475569",
    marginTop: 4,
    fontWeight: "600",
  },
  unpaidSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  unpaidSummaryLabel: {
    color: "#64748B",
    fontWeight: "700",
  },
  unpaidSummaryValue: {
    color: "#EF4444",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#102E59",
    fontSize: 20,
    fontWeight: "900",
  },
  seeAll: {
    color: "#08C742",
    fontWeight: "900",
  },
  defaultAccountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  bankIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#08C742",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  bankName: {
    color: "#102E59",
    fontWeight: "900",
    fontSize: 18,
  },
  cardNumber: {
    color: "#64748B",
    fontWeight: "600",
    marginTop: 4,
  },
  balanceText: {
    color: "#08A43A",
    fontWeight: "900",
    marginTop: 6,
  },
  defaultBadge: {
    backgroundColor: "#DFF8E8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  defaultBadgeText: {
    color: "#08A43A",
    fontWeight: "800",
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    color: "#102E59",
    fontWeight: "900",
    fontSize: 18,
    marginTop: 10,
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  actionButton: {
    flex: 1,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionButtonGreen: {
    flex: 1,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#08C742",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionText: {
    color: "#102E59",
    fontWeight: "800",
  },
  actionTextWhite: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  operationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  operationTitle: {
    color: "#102E59",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },
  inputLabel: {
    color: "#223B63",
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 8,
  },
  accountPill: {
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  accountPillSelected: {
    backgroundColor: "#DFF8E8",
    borderColor: "#08C742",
  },
  accountPillText: {
    color: "#102E59",
    fontWeight: "800",
  },
  accountPillTextSelected: {
    color: "#08A43A",
  },
  splitCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  splitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  splitTitle: {
    color: "#102E59",
    fontWeight: "900",
    fontSize: 15,
  },
  splitMeta: {
    color: "#64748B",
    fontWeight: "600",
    marginTop: 4,
  },
  splitAmount: {
    color: "#102E59",
    fontWeight: "800",
    marginTop: 6,
  },
  paidBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  unpaidBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  paidText: {
    color: "#08A43A",
    fontWeight: "900",
    fontSize: 11,
  },
  unpaidText: {
    color: "#D97706",
    fontWeight: "900",
    fontSize: 11,
  },
  paySplitButton: {
    backgroundColor: "#2F80ED",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 52,
    alignItems: "center",
  },
  paySplitText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  billPill: {
    width: 220,
    backgroundColor: "#F1F5F9",
    borderRadius: 18,
    padding: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  billPillSelected: {
    backgroundColor: "#EAF2FF",
    borderColor: "#2F80ED",
  },
  billTitle: {
    color: "#102E59",
    fontWeight: "900",
    fontSize: 14,
  },
  billTitleSelected: {
    color: "#2F80ED",
  },
  billMeta: {
    color: "#64748B",
    fontWeight: "600",
    marginTop: 6,
    fontSize: 13,
  },
  billMetaSelected: {
    color: "#1E40AF",
  },
  input: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 16,
    color: "#102E59",
    fontSize: 16,
  },
  selectedInfo: {
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  selectedInfoText: {
    color: "#08A43A",
    fontWeight: "800",
  },
  selectedBillInfo: {
    backgroundColor: "#EAF2FF",
    padding: 12,
    borderRadius: 14,
    marginTop: 10,
  },
  selectedBillTitle: {
    color: "#102E59",
    fontWeight: "900",
  },
  selectedBillAmount: {
    color: "#2F80ED",
    fontWeight: "800",
    marginTop: 4,
  },
  operationButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  chargeButton: {
    flex: 1,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#2F80ED",
    justifyContent: "center",
    alignItems: "center",
  },
  refundButton: {
    flex: 1,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#08C742",
    justifyContent: "center",
    alignItems: "center",
  },
  operationButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  helpText: {
    color: "#64748B",
    fontWeight: "700",
    marginTop: 8,
  },
  noBillsBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  noteText: {
    marginTop: 14,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
});