import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Grid3x3 as Grid3X3, Crown } from 'lucide-react-native';
import { GameVariant } from '@/interfaces/game';

interface GameVariantSelectorProps {
	currentVariant: GameVariant;
	onVariantChange: (variant: GameVariant) => void;
}

export const GameVariantSelector: React.FC<GameVariantSelectorProps> = ({
	currentVariant,
	onVariantChange,
}) => {
	const variants = [
		{
			type: 'connect3' as const,
			title: 'Connect 3',
			subtitle: 'Classic match 3 to win',
			icon: Grid3X3,
		},
		{
			type: 'classic' as const,
			title: 'Classic Board',
			subtitle: 'Match 3 to create Kings',
			icon: Crown,
		},
	];

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Game Variant</Text>
			<View style={styles.variantsContainer}>
				{variants.map((variant) => {
					const IconComponent = variant.icon;
					const selected = currentVariant === variant.type;

					return (
						<TouchableOpacity
							key={variant.type}
							style={[styles.variantButton, selected && styles.selectedVariant]}
							onPress={() => onVariantChange(variant.type)}
							activeOpacity={0.8}
						>
							<View style={styles.variantIcon}>
								<IconComponent
									size={24}
									color={selected ? '#ffffff' : '#4f46e5'}
								/>
							</View>
							<View style={styles.variantText}>
								<Text
									style={[styles.variantTitle, selected && styles.selectedText]}
								>
									{variant.title}
								</Text>
								<Text
									style={[
										styles.variantSubtitle,
										selected && styles.selectedSubtext,
									]}
								>
									{variant.subtitle}
								</Text>
							</View>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 20,
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
		textAlign: 'center',
		marginBottom: 12,
		fontFamily: 'Orbitron-Bold',
	},
	variantsContainer: {
		gap: 8,
	},
	variantButton: {
		backgroundColor: '#ffffff',
		borderRadius: 12,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#e5e7eb',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 2,
	},
	selectedVariant: {
		backgroundColor: '#4f46e5',
		borderColor: '#4f46e5',
	},
	variantIcon: {
		marginRight: 12,
	},
	variantText: {
		flex: 1,
	},
	variantTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#1f2937',
		marginBottom: 2,
		fontFamily: 'Orbitron-Bold',
	},
	variantSubtitle: {
		fontSize: 14,
		color: '#6b7280',
		fontWeight: '500',
		fontFamily: 'Orbitron-Regular',
	},
	selectedText: {
		color: '#ffffff',
	},
	selectedSubtext: {
		color: '#e0e7ff',
	},
});
