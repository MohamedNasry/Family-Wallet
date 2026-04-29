import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  const transactions = [
    { id: "1", title: "Groceries", amount: "-50$" },
    { id: "2", title: "Salary", amount: "+500$" },
    { id: "3", title: "Transport", amount: "-20$" },
  ];

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Family Wallet 💰</Text>

      {/* Balance Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Balance</Text>
        <Text style={styles.balance}>$1,250</Text>
      </View>

      {/* Buttons Row */}
      <View style={styles.row}>
        <Pressable
          style={styles.button}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.btnText}>Create Family</Text>
        </Pressable>

        <Pressable
          style={styles.button2}
          onPress={() => router.push("/join")}
        >
          <Text style={styles.btnText}>Join</Text>
        </Pressable>
      </View>

      {/* 🔥 Add Expense Button (NEW) */}
      <View style={styles.row}>
        <Pressable
          style={styles.expenseButton}
          onPress={() => router.push("/add-expense")}
        >
          <Text style={styles.btnText}>+ Add Expense</Text>
        </Pressable>
      </View>

      {/* Transactions */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transaction}>
            <Text style={styles.txTitle}>{item.title}</Text>
            <Text style={styles.txAmount}>{item.amount}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f7fb",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },

  cardTitle: {
    color: "#888",
  },

  balance: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 5,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  button: {
    flex: 1,
    backgroundColor: "#2ecc71",
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
  },

  button2: {
    flex: 1,
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 10,
  },

  expenseButton: {
    flex: 1,
    backgroundColor: "#e67e22",
    padding: 12,
    borderRadius: 10,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  transaction: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  txTitle: {
    fontSize: 16,
  },

  txAmount: {
    fontWeight: "bold",
  },
});