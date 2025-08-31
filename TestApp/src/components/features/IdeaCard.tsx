import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Card } from '../ui/Card';
import { IdeaCardProps } from '../../types';
import { formatRelativeTime, truncateText } from '../../utils';
import { cn } from '../../utils/cn';

export function IdeaCard({ 
  idea, 
  onPress, 
  onFavorite, 
  onDelete 
}: IdeaCardProps) {
  const handlePress = () => {
    onPress(idea);
  };

  const handleFavoritePress = () => {
    onFavorite(idea.id);
  };

  const hasAIExpansions = idea.aiExpansions && idea.aiExpansions.length > 0;
  const hasConnections = idea.connections && idea.connections.length > 0;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="mb-3"
    >
      <Card variant="outlined" padding="md">
        {/* Content */}
        <Text 
          className="text-base text-foreground leading-5 mb-3"
          numberOfLines={4}
        >
          {truncateText(idea.content, 150)}
        </Text>

        {/* Tags */}
        {idea.tags.length > 0 && (
          <View className="flex-row flex-wrap mb-3">
            {idea.tags.slice(0, 3).map((tag, index) => (
              <View
                key={index}
                className="bg-accent px-2 py-1 rounded-md mr-2 mb-1"
              >
                <Text className="text-xs text-accent-foreground">
                  #{tag}
                </Text>
              </View>
            ))}
            {idea.tags.length > 3 && (
              <View className="bg-muted px-2 py-1 rounded-md mr-2 mb-1">
                <Text className="text-xs text-muted-foreground">
                  +{idea.tags.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View className="flex-row items-center justify-between">
          {/* Left side - timestamp and indicators */}
          <View className="flex-row items-center flex-1">
            <Text className="text-xs text-muted-foreground">
              {formatRelativeTime(idea.timestamp)}
            </Text>

            {/* AI Expansions indicator */}
            {hasAIExpansions && (
              <View className="flex-row items-center ml-3">
                <View className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                <Text className="text-xs text-blue-600">
                  {idea.aiExpansions!.length} IA
                </Text>
              </View>
            )}

            {/* Connections indicator */}
            {hasConnections && (
              <View className="flex-row items-center ml-3">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                <Text className="text-xs text-green-600">
                  {idea.connections!.length} conexões
                </Text>
              </View>
            )}
          </View>

          {/* Right side - actions */}
          <TouchableOpacity
            onPress={handleFavoritePress}
            className="p-2 -m-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text 
              className={cn(
                'text-lg',
                idea.isFavorite ? 'text-yellow-500' : 'text-gray-300'
              )}
            >
              ⭐
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default IdeaCard;
