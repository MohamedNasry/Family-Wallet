import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AppButton from "../../components/AppButton";
import { ARAB_COUNTRIES } from "../../utils/arabCountries";
import { registerApi } from "../../api/auth.api";

export default function CurrencyScreen() {
  const params = useLocalSearchParams<{
    fullName?: string;
    email?: string;
    password?: string;
    familyName?: string;
    country?: string;
    suggestedCurrency?: string;
  }>();

  const defaultCurrency = params.suggestedCurrency || "MAD";

  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
  const [loading, setLoading] = useState(false);

  const showError = (message: string) => {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert("Register Failed", message);
    }
  };

  const handleRegister = async () => {
    try {
      console.log("Continue clicked");

      if (
        !params.fullName ||
        !params.email ||
        !params.password ||
        !params.familyName ||
        !params.country ||
        !selectedCurrency
      ) {
        showError("Missing register data. Please go back and fill all fields.");
        return;
      }

      setLoading(true);

      const payload = {
        fullName: String(params.fullName),
        email: String(params.email),
        password: String(params.password),
        familyName: String(params.familyName),
        country: String(params.country),
        currency: String(selectedCurrency),
      };

      console.log("REGISTER PAYLOAD:", payload);

      const response = await registerApi(payload);

      console.log("REGISTER RESPONSE:", response);

      const inviteCode =
        response.invite?.inviteCode ||
        response.invite?.invite_code ||
        "";

      router.replace({
        pathname: "/family-code",
        params: {
          inviteCode,
        },
      });
    } catch (error: any) {
      console.log("REGISTER ERROR:", error.message);
      showError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const currencyOptions = ARAB_COUNTRIES.map((country) => ({
    code: country.currency,
    country: country.nameEn,
  })).filter(
    (item, index, arr) =>
      arr.findIndex((x) => x.code === item.code) === index
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Select Your Currency</Text>

        <FlatList
          data={currencyOptions}
          keyExtractor={(item) => item.code}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const active = selectedCurrency === item.code;

            return (
              <TouchableOpacity
                style={[
                  styles.currencyItem,
                  active && styles.currencyItemActive,
                ]}
                onPress={() => setSelectedCurrency(item.code)}
              >
                <Text
                  style={[
                    styles.currencyCode,
                    active && styles.currencyTextActive,
                  ]}
                >
                  {item.code}
                </Text>

                <Text
                  style={[
                    styles.countryName,
                    active && styles.currencyTextActive,
                  ]}
                >
                  {item.country}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        <AppButton
          title="Continue"
          onPress={handleRegister}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF3F2",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#F7F7F7",
    borderRadius: 28,
    padding: 24,
    maxHeight: "86%",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#102E59",
    textAlign: "center",
    marginBottom: 18,
  },
  listContent: {
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  currencyItem: {
    width: "48%",
    backgroundColor: "#EFF1F3",
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 10,
    marginBottom: 14,
    alignItems: "center",
  },
  currencyItemActive: {
    backgroundColor: "#08C742",
  },
  currencyCode: {
    fontSize: 24,
    fontWeight: "900",
    color: "#102E59",
  },
  countryName: {
    marginTop: 8,
    fontSize: 14,
    color: "#102E59",
    textAlign: "center",
  },
  currencyTextActive: {
    color: "#FFFFFF",
  },
});