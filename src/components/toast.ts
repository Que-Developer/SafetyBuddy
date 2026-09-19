import { Alert } from "react-native";

function show(title: string, message?: string) {
  Alert.alert(title, message);
}

export const toast = {
  success: (message: string, detail?: string) =>
    show("Success", detail ? `${message}\n${detail}` : message),
  error: (message: string, detail?: string) =>
    show("Error", detail ? `${message}\n${detail}` : message),
  info: (message: string, detail?: string) =>
    show("Info", detail ? `${message}\n${detail}` : message),
  warning: (message: string, detail?: string) =>
    show("Warning", detail ? `${message}\n${detail}` : message),
};
