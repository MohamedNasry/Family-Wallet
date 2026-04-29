import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import client from "../../src/api/client";
import { useRouter } from "expo-router";

export default function AddExpense() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [paidBy, setPaidBy] = useState("");

  const handleAddExpense = async () => {
    try {
      await client.post("/expenses", {
        amount,
        category,
        paidBy,
      });

      router.replace("/"); // يرجع للـ dashboard
    } catch (err) {
      console.log("Error adding expense", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Expense 💸</Text>

      <TextInput
        placeholder="Amount"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={setAmount}
      />

      <TextInput
        placeholder="Category (Food, Bills...)"
        style={styles.input}
        onChangeText={setCategory}
      />

      <TextInput
        placeholder="Paid By"
        style={styles.input}
        onChangeText={setPaidBy}
      />

      <Pressable style={styles.button} onPress={handleAddExpense}>
        <Text style={styles.btnText}>Save Expense</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f4f7fb",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
  },

  button: {
    backgroundColor: "#e67e22",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});