import React, { useRef, useEffect } from 'react';
import {
	TouchableOpacity,
	StyleSheet,
	Animated,
	Platform,
	View,
} from 'react-native';
import { CellState } from '@/interfaces/game';
import { Crown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface GameCellProps {
	cell: CellState;
	size: number;
	onPress: () => void;
	isWinning: boolean;
	disabled: boolean;
	isConverting?: boolean;
}

export const GameCell: React.FC<GameCellProps> = ({
	cell,
	size,
	onPress,
	isWinning,
	disabled,
	isConverting = false,
}) => {
	const scaleAnim = useRef(new Animated.Value(1)).current;
	const pulseAnim = useRef(new Animated.Value(1)).current;
	const convertAnim = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		if (isWinning) {
			Animated.loop(
				Animated.sequence([
					Animated.timing(pulseAnim, {
						toValue: 1.1,
						duration: 600,
						useNativeDriver: true,
					}),
					Animated.timing(pulseAnim, {
						toValue: 1,
						duration: 600,
						useNativeDriver: true,
					}),
				])
			).start();
		} else {
			pulseAnim.setValue(1);
		}
	}, [isWinning, pulseAnim]);

	useEffect(() => {
		if (isConverting) {
			Animated.sequence([
				Animated.timing(convertAnim, {
					toValue: 1.3,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.timing(convertAnim, {
					toValue: 0.8,
					duration: 200,
					useNativeDriver: true,
				}),
				Animated.timing(convertAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [isConverting, convertAnim]);

	const handlePress = () => {
		if (disabled) return;

		if (Platform.OS !== 'web') {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}

		Animated.sequence([
			Animated.timing(scaleAnim, {
				toValue: 0.95,
				duration: 100,
				useNativeDriver: true,
			}),
			Animated.timing(scaleAnim, {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}),
		]).start();

		onPress();
	};

	const getCellColor = () => {
		switch (cell) {
			case 'red':
				return '#ef4444';
			case 'yellow':
				return '#fbbf24';
			case 'red-king':
				return '#dc2626';
			case 'yellow-king':
				return '#d97706';
			default:
				return '#ffffff';
		}
	};

	const isKing = cell === 'red-king' || cell === 'yellow-king';
	const crownSize = Math.max(size * 0.35, 16); // Ensure crown is visible but not too large

	return (
		<TouchableOpacity
			onPress={handlePress}
			disabled={disabled}
			activeOpacity={0.8}
			style={styles.cellContainer}
		>
			<Animated.View
				style={[
					styles.cell,
					{
						width: size,
						height: size,
						backgroundColor: getCellColor(),
						transform: [
							{ scale: scaleAnim },
							{ scale: pulseAnim },
							{ scale: convertAnim },
						],
					},
					isWinning && styles.winningCell,
					isKing && styles.kingCell,
				]}
			>
				{isKing && (
					<View style={styles.crownContainer}>
						<Crown size={crownSize} color='#ffffff' strokeWidth={2} />
					</View>
				)}
			</Animated.View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	cellContainer: {
		margin: 2,
	},
	cell: {
		borderRadius: 50,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		justifyContent: 'center',
		alignItems: 'center',
	},
	winningCell: {
		shadowColor: '#fbbf24',
		shadowOpacity: 0.8,
		shadowRadius: 8,
		elevation: 10,
	},
	kingCell: {
		borderWidth: 2,
		borderColor: '#ffffff',
		shadowColor: '#000',
		shadowOpacity: 0.4,
		shadowRadius: 6,
		elevation: 8,
	},
	crownContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
});
