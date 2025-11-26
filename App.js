import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreen from "react-native-splash-screen";
import ErrorBoundary from "./src/components/ErrorBoundary";
import Toast from "./src/components/Toast";
import { useToast } from "./src/hooks/useToast";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
	const { visible, message, type, hideToast } = useToast();

	useEffect(() => {
		// Hide splash screen after app is ready
		const timer = setTimeout(() => {
			SplashScreen.hide();
		}, 1000); // Show splash for 1 second minimum

		return () => clearTimeout(timer);
	}, []);

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
