import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ErrorBoundary from "./src/components/ErrorBoundary";
import Toast from "./src/components/Toast";
import { useToast } from "./src/hooks/useToast";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
	const { visible, message, type, hideToast } = useToast();

	console.log("App component rendering...");
	return (
		<SafeAreaProvider>
			<ErrorBoundary>
				<AppNavigator />
				<Toast
					visible={visible}
					message={message}
					type={type}
					onHide={hideToast}
				/>
			</ErrorBoundary>
		</SafeAreaProvider>
	);
}
