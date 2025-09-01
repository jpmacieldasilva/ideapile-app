import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Icon, AppIcons } from '../ui/Icon';
import { IdeaCardProps } from '../../types';
import { formatRelativeTime, truncateText } from '../../utils';

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
      style={{ marginBottom: 12 }}
    >
      <View style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
      }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text 
              style={{ 
                flex: 1, 
                paddingRight: 12, 
                lineHeight: 20, 
                fontSize: 16,
                color: '#1f2937'
              }}
              numberOfLines={4}
            >
              {truncateText(idea.content, 120)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 }}>
              {hasAIExpansions && (
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#dbeafe',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#bfdbfe'
                }}>
                  <Icon 
                    {...AppIcons.sparkles} 
                    size={12} 
                    color="#2563eb" 
                  />
                </View>
              )}
              {hasConnections && (
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#dcfce7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#bbf7d0'
                }}>
                  <Icon 
                    {...AppIcons.link} 
                    size={12} 
                    color="#16a34a" 
                  />
                </View>
              )}
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
              {idea.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 16,
                    backgroundColor: '#f3f4f6',
                    borderWidth: 0
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#374151' }}>
                    {tag}
                  </Text>
                </View>
              ))}
              {idea.tags.length > 3 && (
                <View style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  backgroundColor: '#ffffff'
                }}>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>
                    +{idea.tags.length - 3}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 12 }}>
              <Icon 
                {...AppIcons.clock} 
                size={12} 
                color="#6b7280" 
              />
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {formatRelativeTime(idea.timestamp)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default IdeaCard;
