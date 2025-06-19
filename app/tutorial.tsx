import React, { useState, useRef, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	SafeAreaView,
	Platform,
	Dimensions,
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
	runOnJS,
} from 'react-native-reanimated';
import {
	Play,
	SkipForward,
	RotateCcw,
	Hand,
	Target,
	Zap,
	ArrowDown,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface TutorialStep {
	id: number;
	title: string;
	description: string;
	instruction: string;
	icon: React.ComponentType<any>;
	demoType: 'tap' | 'drop' | 'connect';
}

const tutorialSteps: TutorialStep[] = [
	{
		id: 1,
		title: 'Tap to Drop',
		description: 'Touch any column to drop your disc',
		instruction: 'Try tapping the highlighted column below',
		icon: Hand,
		demoType: 'tap',
	},
	{
		id: 2,
		title: 'Gravity Rules',
		description: 'Discs fall to the lowest available spot',
		instruction: 'Watch how discs stack up',
		icon: ArrowDown,
		demoType: 'drop',
	},
	{
		id: 3,
		title: 'Connect Three',
		description: 'Get 3 in a row to win the game',
		instruction: 'Horizontal, vertical, or diagonal!',
		icon: Target,
		demoType: 'connect',
	},
];

const MINI_BOARD_ROWS = 4;
const MINI_BOARD_COLS = 5;
const CELL_SIZE = 45;

export default function TutorialScreen() {
	const [currentStep, setCurrentStep] = useState(0);
	const [miniBoard, setMiniBoard] = useState<(string | null)[][]>(() =>
		Array(MINI_BOARD_ROWS)
			.fill(null)
			.map(() => Array(MINI_BOARD_COLS).fill(null))
	);
	const [isPlaying, setIsPlaying] = useState(false);

	// Animations
	const slideX = useSharedValue(0);
	const fadeOpacity = useSharedValue(1);
	const handScale = useSharedValue(1);
	const handY = useSharedValue(0);
	const pulseScale = useSharedValue(1);
	const discY = useSharedValue(-50);

	useEffect(() => {
		startStepAnimation();
	}, [currentStep]);

	const startStepAnimation = () => {
		const step = tutorialSteps[currentStep];

		// Reset animations
		handScale.value = 1;
		handY.value = 0;
		pulseScale.value = 1;
		discY.value = -50;

		switch (step.demoType) {
			case 'tap':
				// Animated hand tapping
				handY.value = withRepeat(
					withSequence(
						withTiming(-10, { duration: 500 }),
						withTiming(0, { duration: 500 })
					),
					-1,
					true
				);
				handScale.value = withRepeat(
					withSequence(
						withTiming(1.1, { duration: 500 }),
						withTiming(1, { duration: 500 })
					),
					-1,
					true
				);
				break;

			case 'drop':
				// Animated disc dropping
				setTimeout(() => {
					discY.value = withTiming(0, { duration: 800 });
				}, 1000);
				break;

			case 'connect':
				// Pulsing winning combination
				pulseScale.value = withRepeat(
					withSequence(
						withTiming(1.1, { duration: 600 }),
						withTiming(1, { duration: 600 })
					),
					-1,
					true
				);
				break;
		}
	};

	const nextStep = () => {
		if (Platform.OS !== 'web') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}

		if (currentStep < tutorialSteps.length - 1) {
			// Slide animation
			slideX.value = withTiming(-width, { duration: 300 });
			fadeOpacity.value = withTiming(0, { duration: 300 });

			setTimeout(() => {
				setCurrentStep(currentStep + 1);
				slideX.value = width;
				slideX.value = withSpring(0, { damping: 20, stiffness: 90 });
				fadeOpacity.value = withTiming(1, { duration: 400 });
			}, 300);
		} else {
			startGame();
		}
	};

	const skipTutorial = () => {
		if (Platform.OS !== 'web') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		startGame();
	};

	const startGame = () => {
		router.replace('/(home)');
	};

	const resetDemo = () => {
		if (Platform.OS !== 'web') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		setMiniBoard(
			Array(MINI_BOARD_ROWS)
				.fill(null)
				.map(() => Array(MINI_BOARD_COLS).fill(null))
		);
		startStepAnimation();
	};

	const handleColumnPress = (col: number) => {
		if (currentStep !== 0) return;

		if (Platform.OS !== 'web') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}

		// Find lowest empty row
		let targetRow = -1;
		for (let row = MINI_BOARD_ROWS - 1; row >= 0; row--) {
			if (miniBoard[row][col] === null) {
				targetRow = row;
				break;
			}
		}

		if (targetRow !== -1) {
			const newBoard = miniBoard.map((row) => [...row]);
			newBoard[targetRow][col] = 'red';
			setMiniBoard(newBoard);
		}
	};

	const currentStepData = tutorialSteps[currentStep];
	const IconComponent = currentStepData.icon;

	const containerAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: slideX.value }],
		opacity: fadeOpacity.value,
	}));

	const handAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: handY.value }, { scale: handScale.value }],
	}));

	const discAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: discY.value }],
	}));

	const pulseAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: pulseScale.value }],
	}));

	const renderMiniBoard = () => {
		return (
			<View style={styles.miniBoard}>
				{miniBoard.map((row, rowIndex) => (
					<View key={rowIndex} style={styles.miniRow}>
						{row.map((cell, colIndex) => (
							<TouchableOpacity
								key={`${rowIndex}-${colIndex}`}
								style={[
									styles.miniCell,
									{
										backgroundColor:
											cell === 'red'
												? '#ef4444'
												: cell === 'yellow'
												? '#fbbf24'
												: '#ffffff',
									},
									currentStep === 0 && colIndex === 2 && styles.highlightedCell,
								]}
								onPress={() => handleColumnPress(colIndex)}
							>
								{currentStep === 0 && colIndex === 2 && rowIndex === 0 && (
									<Animated.View
										style={[styles.handIndicator, handAnimatedStyle]}
									>
										<Hand size={20} color='#4f46e5' />
									</Animated.View>
								)}

								{currentStep === 1 && colIndex === 1 && rowIndex === 0 && (
									<Animated.View
										style={[styles.droppingDisc, discAnimatedStyle]}
									/>
								)}

								{currentStep === 2 && (
									<Animated.View style={pulseAnimatedStyle}>
										{((rowIndex === 2 && colIndex >= 1 && colIndex <= 3) ||
											(rowIndex === 3 && colIndex >= 1 && colIndex <= 3)) && (
											<View style={styles.winningCell} />
										)}
									</Animated.View>
								)}
							</TouchableOpacity>
						))}
					</View>
				))}
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={['#0f172a', '#1e293b', '#334155']}
				style={styles.gradient}
			>
				{/* Skip Button */}
				<TouchableOpacity style={styles.skipButton} onPress={skipTutorial}>
					<SkipForward size={16} color='#ffffff' />
					<Text style={styles.skipText}>Skip Tutorial</Text>
				</TouchableOpacity>

				{/* Progress */}
				<View style={styles.progressContainer}>
					<Text style={styles.progressText}>
						{currentStep + 1} of {tutorialSteps.length}
					</Text>
					<View style={styles.progressBar}>
						<View
							style={[
								styles.progressFill,
								{
									width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
								},
							]}
						/>
					</View>
				</View>

				{/* Main Content */}
				<Animated.View style={[styles.content, containerAnimatedStyle]}>
					<View style={styles.iconContainer}>
						<IconComponent size={60} color='#4f46e5' strokeWidth={1.5} />
					</View>

					<Text style={styles.title}>{currentStepData.title}</Text>
					<Text style={styles.description}>{currentStepData.description}</Text>
					<Text style={styles.instruction}>{currentStepData.instruction}</Text>

					{/* Interactive Demo */}
					<View style={styles.demoContainer}>{renderMiniBoard()}</View>

					{/* Reset Demo Button */}
					<TouchableOpacity style={styles.resetButton} onPress={resetDemo}>
						<RotateCcw size={16} color='#64748b' />
						<Text style={styles.resetText}>Reset Demo</Text>
					</TouchableOpacity>
				</Animated.View>

				{/* Navigation */}
				<View style={styles.navigationContainer}>
					<TouchableOpacity style={styles.nextButton} onPress={nextStep}>
						<Text style={styles.nextButtonText}>
							{currentStep === tutorialSteps.length - 1
								? 'Start Playing!'
								: 'Next'}
						</Text>
						<Play size={20} color='#ffffff' />
					</TouchableOpacity>
				</View>
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
		paddingHorizontal: 20,
	},
	skipButton: {
		position: 'absolute',
		top: 60,
		right: 20,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 20,
		zIndex: 10,
	},
	skipText: {
		color: '#ffffff',
		fontSize: 14,
		fontFamily: 'Orbitron-Regular',
		marginLeft: 6,
	},
	progressContainer: {
		marginTop: 120,
		marginBottom: 40,
	},
	progressText: {
		fontSize: 14,
		fontFamily: 'Orbitron-Regular',
		color: '#94a3b8',
		textAlign: 'center',
		marginBottom: 8,
	},
	progressBar: {
		height: 4,
		backgroundColor: 'rgba(255,255,255,0.1)',
		borderRadius: 2,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: '#4f46e5',
		borderRadius: 2,
	},
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconContainer: {
		marginBottom: 24,
		padding: 20,
		backgroundColor: 'rgba(79, 70, 229, 0.1)',
		borderRadius: 40,
		borderWidth: 2,
		borderColor: 'rgba(79, 70, 229, 0.3)',
	},
	title: {
		fontSize: 28,
		fontFamily: 'Orbitron-Black',
		color: '#ffffff',
		textAlign: 'center',
		marginBottom: 12,
	},
	description: {
		fontSize: 16,
		fontFamily: 'Orbitron-Regular',
		color: '#e2e8f0',
		textAlign: 'center',
		marginBottom: 8,
		lineHeight: 24,
	},
	instruction: {
		fontSize: 14,
		fontFamily: 'Orbitron-Regular',
		color: '#4f46e5',
		textAlign: 'center',
		marginBottom: 32,
	},
	demoContainer: {
		marginBottom: 24,
	},
	miniBoard: {
		backgroundColor: '#2563eb',
		borderRadius: 16,
		padding: 12,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	miniRow: {
		flexDirection: 'row',
		marginBottom: 4,
	},
	miniCell: {
		width: CELL_SIZE,
		height: CELL_SIZE,
		borderRadius: CELL_SIZE / 2,
		marginHorizontal: 2,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	highlightedCell: {
		shadowColor: '#4f46e5',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowOpacity: 0.8,
		shadowRadius: 8,
		elevation: 8,
	},
	handIndicator: {
		position: 'absolute',
		top: -30,
	},
	droppingDisc: {
		width: CELL_SIZE - 8,
		height: CELL_SIZE - 8,
		borderRadius: (CELL_SIZE - 8) / 2,
		backgroundColor: '#ef4444',
		position: 'absolute',
	},
	winningCell: {
		width: CELL_SIZE - 8,
		height: CELL_SIZE - 8,
		borderRadius: (CELL_SIZE - 8) / 2,
		backgroundColor: '#fbbf24',
	},
	resetButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: 'rgba(255,255,255,0.05)',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.1)',
	},
	resetText: {
		fontSize: 12,
		fontFamily: 'Orbitron-Regular',
		color: '#64748b',
		marginLeft: 6,
	},
	navigationContainer: {
		paddingBottom: 40,
	},
	nextButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#4f46e5',
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 30,
		shadowColor: '#4f46e5',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	nextButtonText: {
		fontSize: 16,
		fontFamily: 'Orbitron-Bold',
		color: '#ffffff',
		marginRight: 8,
	},
});
