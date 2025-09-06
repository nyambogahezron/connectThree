import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	TouchableOpacity,
	SafeAreaView,
	Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSpring,
	withRepeat,
	withSequence,
} from 'react-native-reanimated';
import {
	Play,
	Gamepad2,
	Trophy,
	Sparkles,
	ArrowRight,
	Circle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const width = Dimensions.get('window').width;

interface OnboardingStep {
	id: number;
	title: string;
	subtitle: string;
	description: string;
	icon: React.ComponentType<any>;
	color: string;
	gradient: string[];
}

const onboardingSteps: OnboardingStep[] = [
	{
		id: 1,
		title: 'Welcome to',
		subtitle: 'CONNECT 3',
		description:
			'The ultimate strategy game that challenges your mind and reflexes!',
		icon: Sparkles,
		color: '#4f46e5',
		gradient: ['#4f46e5', '#7c3aed'],
	},
	{
		id: 2,
		title: 'Master the',
		subtitle: 'GAMEPLAY',
		description:
			'Drop discs strategically to get 3 in a row. Simple rules, endless fun!',
		icon: Gamepad2,
		color: '#059669',
		gradient: ['#059669', '#0d9488'],
	},
	{
		id: 3,
		title: 'Compete &',
		subtitle: 'CONQUER',
		description:
			'Challenge friends or test your skills against our smart AI opponents!',
		icon: Trophy,
		color: '#dc2626',
		gradient: ['#dc2626', '#ea580c'],
	},
	{
		id: 4,
		title: 'Ready to',
		subtitle: 'PLAY?',
		description:
			'Join thousands of players in the most addictive puzzle game ever created!',
		icon: Play,
		color: '#7c2d12',
		gradient: ['#7c2d12', '#a16207'],
	},
];

export default function OnboardingScreen() {
	const [currentStep, setCurrentStep] = useState(0);
	const translateX = useSharedValue(0);
	const scale = useSharedValue(1);
	const opacity = useSharedValue(1);
	const iconScale = useSharedValue(1);
	const particleOpacity = useSharedValue(0);

	// Particle animations
	const particle1Y = useSharedValue(0);
	const particle2Y = useSharedValue(0);
	const particle3Y = useSharedValue(0);

	useEffect(() => {
		// Start particle animations
		particle1Y.value = withRepeat(
			withSequence(
				withTiming(-20, { duration: 2000 }),
				withTiming(0, { duration: 2000 })
			),
			-1,
			true
		);

		particle2Y.value = withRepeat(
			withSequence(
				withTiming(-15, { duration: 1500 }),
				withTiming(0, { duration: 1500 })
			),
			-1,
			true
		);

		particle3Y.value = withRepeat(
			withSequence(
				withTiming(-25, { duration: 2500 }),
				withTiming(0, { duration: 2500 })
			),
			-1,
			true
		);

		particleOpacity.value = withRepeat(
			withSequence(
				withTiming(1, { duration: 1000 }),
				withTiming(0.3, { duration: 1000 })
			),
			-1,
			true
		);

		// Icon pulse animation
		iconScale.value = withRepeat(
			withSequence(
				withTiming(1.1, { duration: 1000 }),
				withTiming(1, { duration: 1000 })
			),
			-1,
			true
		);
	}, []);

	const nextStep = () => {
		if (Platform.OS !== 'web') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}

		if (currentStep < onboardingSteps.length - 1) {
			// Slide out animation
			translateX.value = withTiming(-width, { duration: 300 });
			opacity.value = withTiming(0, { duration: 300 });
			scale.value = withTiming(0.8, { duration: 300 });

			setTimeout(() => {
				setCurrentStep(currentStep + 1);
				// Reset position and slide in
				translateX.value = width;
				translateX.value = withSpring(0, { damping: 20, stiffness: 90 });
				opacity.value = withTiming(1, { duration: 400 });
				scale.value = withSpring(1, { damping: 15, stiffness: 100 });
			}, 300);
		} else {
			router.replace('/terms');
		}
	};

	const skipOnboarding = () => {
		if (Platform.OS !== 'web') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		router.replace('/terms');
	};

	const currentStepData = onboardingSteps[currentStep];
	const IconComponent = currentStepData.icon;

	const containerAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }, { scale: scale.value }],
		opacity: opacity.value,
	}));

	const iconAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: iconScale.value }],
	}));

	const particle1Style = useAnimatedStyle(() => ({
		transform: [{ translateY: particle1Y.value }],
		opacity: particleOpacity.value,
	}));

	const particle2Style = useAnimatedStyle(() => ({
		transform: [{ translateY: particle2Y.value }],
		opacity: particleOpacity.value * 0.7,
	}));

	const particle3Style = useAnimatedStyle(() => ({
		transform: [{ translateY: particle3Y.value }],
		opacity: particleOpacity.value * 0.5,
	}));

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={[currentStepData.gradient[0], currentStepData.gradient[1]]}
				style={styles.gradient}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			>
				{/* Floating Particles */}
				<Animated.View
					style={[styles.particle, styles.particle1, particle1Style]}
				>
					<Circle
						size={8}
						color='rgba(255,255,255,0.6)'
						fill='rgba(255,255,255,0.6)'
					/>
				</Animated.View>
				<Animated.View
					style={[styles.particle, styles.particle2, particle2Style]}
				>
					<Circle
						size={12}
						color='rgba(255,255,255,0.4)'
						fill='rgba(255,255,255,0.4)'
					/>
				</Animated.View>
				<Animated.View
					style={[styles.particle, styles.particle3, particle3Style]}
				>
					<Circle
						size={6}
						color='rgba(255,255,255,0.8)'
						fill='rgba(255,255,255,0.8)'
					/>
				</Animated.View>

				{/* Skip Button */}
				<TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
					<Text style={styles.skipText}>Skip</Text>
				</TouchableOpacity>

				{/* Progress Indicator */}
				<View style={styles.progressContainer}>
					{onboardingSteps.map((_, index) => (
						<View
							key={index}
							style={[
								styles.progressDot,
								index === currentStep && styles.progressDotActive,
							]}
						/>
					))}
				</View>

				{/* Main Content */}
				<Animated.View style={[styles.content, containerAnimatedStyle]}>
					<View style={styles.iconContainer}>
						<Animated.View style={iconAnimatedStyle}>
							<IconComponent size={80} color='#ffffff' strokeWidth={1.5} />
						</Animated.View>
					</View>

					<View style={styles.textContainer}>
						<Text style={styles.title}>{currentStepData.title}</Text>
						<Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
						<Text style={styles.description}>
							{currentStepData.description}
						</Text>
					</View>
				</Animated.View>

				{/* Next Button */}
				<TouchableOpacity style={styles.nextButton} onPress={nextStep}>
					<Text style={styles.nextButtonText}>
						{currentStep === onboardingSteps.length - 1
							? 'Get Started'
							: 'Next'}
					</Text>
					<ArrowRight size={20} color='#ffffff' />
				</TouchableOpacity>
			</LinearGradient>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	gradient: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	particle: {
		position: 'absolute',
	},
	particle1: {
		top: '20%',
		left: '15%',
	},
	particle2: {
		top: '30%',
		right: '20%',
	},
	particle3: {
		bottom: '25%',
		left: '25%',
	},
	skipButton: {
		position: 'absolute',
		top: 60,
		right: 20,
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: 'rgba(255,255,255,0.2)',
		borderRadius: 20,
	},
	skipText: {
		color: '#ffffff',
		fontSize: 14,
		fontFamily: 'Orbitron-Regular',
		fontWeight: '600',
	},
	progressContainer: {
		position: 'absolute',
		top: 120,
		flexDirection: 'row',
		gap: 8,
	},
	progressDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: 'rgba(255,255,255,0.3)',
	},
	progressDotActive: {
		backgroundColor: '#ffffff',
		width: 24,
	},
	content: {
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	iconContainer: {
		marginBottom: 40,
		padding: 20,
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 50,
	},
	textContainer: {
		alignItems: 'center',
	},
	title: {
		fontSize: 24,
		color: '#ffffff',
		fontFamily: 'Orbitron-Regular',
		textAlign: 'center',
		marginBottom: 8,
		opacity: 0.9,
	},
	subtitle: {
		fontSize: 32,
		color: '#ffffff',
		fontFamily: 'Orbitron-Black',
		textAlign: 'center',
		marginBottom: 20,
		letterSpacing: 2,
	},
	description: {
		fontSize: 16,
		color: '#ffffff',
		fontFamily: 'Orbitron-Regular',
		textAlign: 'center',
		lineHeight: 24,
		opacity: 0.9,
		maxWidth: 300,
	},
	nextButton: {
		position: 'absolute',
		bottom: 60,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.2)',
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 30,
		borderWidth: 2,
		borderColor: 'rgba(255,255,255,0.3)',
	},
	nextButtonText: {
		color: '#ffffff',
		fontSize: 16,
		fontFamily: 'Orbitron-Bold',
		marginRight: 8,
	},
});
