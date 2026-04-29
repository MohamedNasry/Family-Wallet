import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  Modal,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import {
  ARAB_COUNTRIES,
  type ArabCountry,
} from "../../utils/arabCountries";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familyName, setFamilyName] = useState("");

  const [selectedCountry, setSelectedCountry] = useState<ArabCountry | null>(
    null
  );

  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const handleContinue = () => {
    if (!fullName || !email || !password || !familyName || !selectedCountry) {
      Alert.alert("Validation", "Please fill all fields");
      return;
    }

    router.push({
      pathname: "/(auth)/currency",
      params: {
        fullName,
        email,
        password,
        familyName,
        country: selectedCountry.nameEn,
        suggestedCurrency: selectedCountry.currency,
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Family Wallet</Text>

        <AppInput
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />

        <AppInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <AppInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <AppInput
          placeholder="Family Name"
          value={familyName}
          onChangeText={setFamilyName}
        />

        <Pressable
          style={styles.selectBox}
          onPress={() => setCountryModalVisible(true)}
        >
          <Text
            style={[
              styles.selectText,
              !selectedCountry && styles.placeholderText,
            ]}
          >
            {selectedCountry
              ? `${selectedCountry.nameEn} - ${selectedCountry.nameAr}`
              : "Select Country"}
          </Text>

          <Text style={styles.arrow}>⌄</Text>
        </Pressable>

        {selectedCountry && (
          <Text style={styles.currencyHint}>
            Suggested currency: {selectedCountry.currency}
          </Text>
        )}

        <AppButton title="Continue" onPress={handleContinue} />
      </View>

      <Modal
        visible={countryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Country</Text>

            <FlatList
              data={ARAB_COUNTRIES}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const active = selectedCountry?.code === item.code;

                return (
                  <Pressable
                    style={[
                      styles.countryItem,
                      active && styles.countryItemActive,
                    ]}
                    onPress={() => {
                      setSelectedCountry(item);
                      setCountryModalVisible(false);
                    }}
                  >
                    <View>
                      <Text
                        style={[
                          styles.countryName,
                          active && styles.countryNameActive,
                        ]}
                      >
                        {item.nameEn}
                      </Text>

                      <Text
                        style={[
                          styles.countryArabic,
                          active && styles.countryNameActive,
                        ]}
                      >
                        {item.nameAr}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.currencyCode,
                        active && styles.countryNameActive,
                      ]}
                    >
                      {item.currency}
                    </Text>
                  </Pressable>
                );
              }}
            />

            <AppButton
              title="Cancel"
              variant="outline"
              onPress={() => setCountryModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#EAF3F2",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#F7F7F7",
    borderRadius: 28,
    padding: 26,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#102E59",
    textAlign: "center",
    marginBottom: 14,
  },
  selectBox: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 18,
    color: "#0F2D59",
    flex: 1,
  },
  placeholderText: {
    color: "#6B7280",
  },
  arrow: {
    fontSize: 24,
    color: "#0F2D59",
    marginLeft: 8,
  },
  currencyHint: {
    marginTop: 8,
    color: "#3B4E6D",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 45, 89, 0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#102E59",
    textAlign: "center",
    marginBottom: 14,
  },
  countryItem: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countryItemActive: {
    backgroundColor: "#08C742",
  },
  countryName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#102E59",
  },
  countryArabic: {
    fontSize: 15,
    color: "#3B4E6D",
    marginTop: 4,
  },
  countryNameActive: {
    color: "#FFFFFF",
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: "800",
    color: "#08A63A",
  },
});