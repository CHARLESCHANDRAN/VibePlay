// src/navigation/AppNavigator.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Onboarding from "../screens/Onboarding";
import CaptureMood from "../screens/CaptureMood";
import Intent from "../screens/Intent";
import Recommendations from "../screens/Recommendations";
import Saved from "../screens/Saved";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName="Onboarding"
				screenOptions={{ headerShown: false, animation: "fade" }}
			>
				<Stack.Screen name="Onboarding" component={Onboarding} />
				<Stack.Screen name="CaptureMood" component={CaptureMood} />
				<Stack.Screen name="Intent" component={Intent} />
				<Stack.Screen name="Recommendations" component={Recommendations} />
				<Stack.Screen name="Saved" component={Saved} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}
