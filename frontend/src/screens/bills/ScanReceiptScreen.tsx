import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { processBillOcrApi } from "../../api/bills.api";

export default function ScanReceiptScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();

  const [imageUri, setImageUri] = useState("");
  const [loading, setLoading] = useState(false);

  const chooseImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission", "Camera permission is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const buildFormData = async () => {
    const formData = new FormData();

    if (Platform.OS === "web") {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append("image", blob, "receipt.jpg");
    } else {
      formData.append("image", {
        uri: imageUri,
        name: "receipt.jpg",
        type: "image/jpeg",
      } as any);
    }

    return formData;
  };

  const uploadAndScan = async () => {
    try {
      if (!imageUri) {
        Alert.alert("Validation", "Please choose receipt image first");
        return;
      }

      setLoading(true);

      const formData = await buildFormData();
      const response = await processBillOcrApi(formData);

      router.replace({
        pathname: "/bills/ocr-review" as any,
        params: {
          ocrId: String(response.ocrDraft.ocrId),
          title: response.extractedData.title || "",
          totalAmount:
            response.extractedData.totalAmount !== null
              ? String(response.extractedData.totalAmount)
              : "",
          currency: response.extractedData.currency || "MAD",
          billDate: response.extractedData.billDate || "",
          categoryId:
            params.categoryId ||
            (response.extractedData.categoryId
              ? String(response.extractedData.categoryId)
              : ""),
        },
      });
    } catch (error: any) {
      Alert.alert("OCR Error", error.message || "Failed to process receipt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#102E59" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Scan Receipt</Text>

        <View style={{ width: 28 }} />
      </View>

      <View style={styles.previewBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <>
            <Ionicons name="receipt-outline" size={58} color="#98A2B3" />
            <Text style={styles.previewText}>No receipt selected</Text>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.optionButton} onPress={chooseImage}>
        <Ionicons name="images-outline" size={22} color="#102E59" />
        <Text style={styles.optionText}>Choose from Gallery</Text>
      </TouchableOpacity>

      {Platform.OS !== "web" && (
        <TouchableOpacity style={styles.optionButton} onPress={openCamera}>
          <Ionicons name="camera-outline" size={22} color="#102E59" />
          <Text style={styles.optionText}>Open Camera</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.scanButton, loading && { opacity: 0.7 }]}
        onPress={uploadAndScan}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={22} color="#FFFFFF" />
            <Text style={styles.scanText}>Upload & Scan</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.note}>
        The bill will not be created until you review and confirm the OCR result.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  headerRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#102E59",
    fontSize: 22,
    fontWeight: "900",
  },
  previewBox: {
    height: 300,
    backgroundColor: "#F4F5F7",
    borderRadius: 24,
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewText: {
    marginTop: 12,
    color: "#667085",
    fontWeight: "700",
  },
  optionButton: {
    height: 58,
    borderRadius: 18,
    backgroundColor: "#F4F5F7",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  optionText: {
    color: "#102E59",
    fontWeight: "800",
    fontSize: 16,
  },
  scanButton: {
    height: 64,
    borderRadius: 20,
    backgroundColor: "#2F80ED",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  scanText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 17,
  },
  note: {
    textAlign: "center",
    color: "#667085",
    marginTop: 16,
    lineHeight: 22,
  },
});